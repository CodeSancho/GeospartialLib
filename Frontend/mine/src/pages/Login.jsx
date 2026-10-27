import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; 
import axios from 'axios';
import { User, Lock } from 'lucide-react';
import MineImg from '../assets/Mine.jpg'; // Import image from assets

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/users/login`, { email, password });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/Main-dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your email and password.');
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${MineImg})` }} // Use imported asset
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Transparent frosted card */}
      <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-wide">Login</h1>
        </div>
        {location.state?.registered && <p role="status" className="mb-4 rounded-lg bg-teal-900/70 p-3 text-center text-sm text-white">Account created. Sign in to continue.</p>}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative flex items-center">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md z-10">
              <User className="text-teal-900" size={20} strokeWidth={2} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-16 pr-4 py-3 bg-white/20 rounded-full text-white placeholder-white/50 outline-none focus:bg-white/30 transition-colors text-base"
            />
          </div>

          {/* Password Input */}
          <div className="relative flex items-center">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="w-full pl-4 pr-16 py-3 bg-white/20 rounded-full text-white placeholder-white/50 outline-none focus:bg-white/30 transition-colors text-base"
            />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md z-10">
              <Lock className="text-teal-900" size={20} strokeWidth={2} />
            </div>
          </div>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-white/100 hover:bg-white text-teal-900 font-bold py-3 rounded-full transition-all duration-200 text-lg shadow-md hover:shadow-lg"
          >
            LOGIN
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center text-white/100 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-semibold hover:text-teal-300 transition-colors">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
