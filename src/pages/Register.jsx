import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser as apiRegisterUser } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Technician'); // Default role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userData = { username, email, password, role };
      const sessionData = await apiRegisterUser(userData);

      // If email confirmation is disabled, a session is returned.
      if (sessionData && sessionData.session) {
        setSuccess('Registration successful! Logging you in...');
        // The login function from AuthContext will handle setting the user and navigating.
        await login(sessionData.user); // Assuming login takes user data, or just triggers a refetch
      } else {
        // If email confirmation is enabled, no session is returned.
        setSuccess('Registration successful! Please check your email to confirm your account.');
        setTimeout(() => {
          navigate('/'); // Redirect to login page
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B181C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-white text-4xl font-bold tracking-wider">REGISTER</h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500 text-white rounded-lg text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-500 text-white rounded-lg text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="bg-transparent border-b-2 border-gray-600 text-white w-full py-2 px-1 leading-tight focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="mb-6">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="bg-transparent border-b-2 border-gray-600 text-white w-full py-2 px-1 leading-tight focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="mb-6">
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
          <div className="mb-8">
            <label htmlFor="role" className="block text-gray-400 text-sm font-bold mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent border-b-2 border-gray-600 text-white w-full py-2 px-1 leading-tight focus:outline-none focus:border-teal-500"
            >
              <option value="Technician" className="bg-[#0B181C] text-white">Field Technician</option>
              <option value="Admin" className="bg-[#0B181C] text-white">Admin</option>
            </select>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#00BFA5] text-black font-bold py-3 rounded-lg hover:bg-teal-400 transition-colors"
          >
            REGISTER
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="inline-block w-full bg-transparent border-2 border-gray-600 text-gray-400 font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;