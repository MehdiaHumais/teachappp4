import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/buildings', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      // Pass email instead of username to apiLogin
      const userData = await apiLogin(email, password);
      login(userData);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B181C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-white text-4xl font-bold tracking-wider">LOGIN</h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500 text-white rounded-lg text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <Input
              id="email" // Changed id to email
              type="email" // Changed type to email
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Changed from setUsername to setEmail
              placeholder="Email" // Changed placeholder
              required
              className="bg-transparent border-b-2 border-gray-600 text-white w-full py-2 px-1 leading-tight focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="mb-8">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="bg-transparent border-b-2 border-gray-600 text-white w-full py-2 px-1 leading-tight focus:outline-none focus:border-teal-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#00BFA5] text-black font-bold py-3 rounded-lg hover:bg-teal-400 transition-colors"
          >
            LOGIN
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/register" className="inline-block w-full bg-transparent border-2 border-[#00BFA5] text-[#00BFA5] font-bold py-3 rounded-lg hover:bg-[#00BFA5] hover:text-black transition-colors">
            REGISTER
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;