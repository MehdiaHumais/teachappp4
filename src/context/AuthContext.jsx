import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { USE_MOCK_API } from '../services/apiConfig';

// Conditionally import supabase using a function to handle errors gracefully
let supabase = null;

const getSupabaseClient = async () => {
  if (supabase) {
    return supabase;
  }

  if (!USE_MOCK_API) {
    try {
      const supabaseModule = await import('../services/supabaseClient');
      supabase = supabaseModule.supabase;
      return supabase;
    } catch (error) {
      console.warn("Supabase client not available, using mock API mode:", error.message);
      return null;
    }
  }
  return null;
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (USE_MOCK_API) {
          // For mock API, get user from localStorage
          const storedUser = localStorage.getItem('mock_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else {
          // For Supabase API
          const supabaseClient = await getSupabaseClient();

          if (supabaseClient) {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

            if (sessionError) {
              console.error("Error getting session:", sessionError.message);
            } else if (session && session.user) {
              // Fetch user profile from the 'profiles' table
              const { data: profile, error: profileError } = await supabaseClient
                .from('profiles')
                .select('username, role, is_active') // Select relevant profile data
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                console.error("Error fetching profile:", profileError.message);
              } else if (profile && profile.is_active) {
                // Combine auth user data with profile data
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                  username: profile.username,
                  role: profile.role,
                  isActive: profile.is_active,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in loadUser:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData) => {
    if (USE_MOCK_API) {
      // For mock API, set user directly
      setUser(userData);
      localStorage.setItem('mock_user', JSON.stringify(userData));
      if (userData.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/buildings');
      }
    } else {
      // For Supabase API
      const supabaseClient = await getSupabaseClient();

      if (supabaseClient) {
        try {
          const { data: { user: authUser }, error: sessionError } = await supabaseClient.auth.getUser();

          if (sessionError || !authUser) {
            throw new Error(sessionError?.message || 'Failed to retrieve user session after login.');
          }

          let profile = null;
          let profileError = null;
          // Retry fetching the profile to account for potential replication delay after sign-up trigger.
          for (let i = 0; i < 3; i++) {
            const { data, error } = await supabaseClient
              .from('profiles')
              .select('username, role, is_active')
              .eq('id', authUser.id)
              .single();

            if (data) {
              profile = data;
              profileError = null;
              break;
            }
            profileError = error;
            await new Promise(res => setTimeout(res, 500)); // Wait 500ms before retrying
          }

          if (profileError || !profile) {
            throw new Error(`Failed to fetch user profile: ${profileError?.message || 'Profile not found.'}`);
          }

          if (!profile.is_active) {
            await supabaseClient.auth.signOut(); // Log out the user if profile inactive/not found
            throw new Error('User account is inactive.');
          }

          const fullUserData = {
            id: authUser.id,
            email: authUser.email,
            username: profile.username,
            role: profile.role,
            isActive: profile.is_active,
          };

          setUser(fullUserData);
          localStorage.setItem('user', JSON.stringify(fullUserData)); // Store full user data
          if (fullUserData.role === 'Admin') {
            navigate('/admin');
          } else {
            navigate('/buildings');
          }
        } catch (error) {
          console.error("Error during login:", error);
          throw error;
        }
      } else {
        throw new Error("Authentication service unavailable");
      }
    }
  };

  const logout = async () => {
    if (USE_MOCK_API) {
      // For mock API, just clear the user
      setUser(null);
      localStorage.removeItem('mock_user');
      localStorage.removeItem('user');
      navigate('/', { replace: true });
    } else {
      // For Supabase API
      const supabaseClient = await getSupabaseClient();

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.auth.signOut();
          if (error) {
            console.error("Error logging out:", error.message);
          }
          setUser(null);
          localStorage.removeItem('user');
          navigate('/', { replace: true });
        } catch (error) {
          console.error("Error during logout:", error);
        }
      } else {
        // If supabase is not available, just clear local state
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('mock_user');
        navigate('/', { replace: true });
      }
    }
  };

  // Provide a safe context value
  const contextValue = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};