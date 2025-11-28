// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation, useGetMeQuery } from '../store/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading, error }] = useLoginMutation();
  const { data: userData, isSuccess } = useGetMeQuery(undefined, { skip: !useSelector(state => state.auth.currentUser) });

  // Auto redirect if already logged in
  useEffect(() => {
    if (useSelector(state => state.auth.currentUser) && isSuccess) {
      navigate('/dashboard');
    }
  }, [userData, isSuccess, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();

      const userPayload = {
        ...result.data.user,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      };

      dispatch(setCredentials(userPayload));
      localStorage.setItem('instiwise-user', JSON.stringify(userPayload));

      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    // ... same beautiful JSX from previous version ...
    // Just replace the form submission:
    <form onSubmit={handleLogin} className="login-form">
      {/* ... inputs ... */}

      <button type="submit" className="signin-btn" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      {error && (
        <div className="text-red-500 text-sm mt-2 text-center">
          {error?.data?.message || 'Invalid email or password'}
        </div>
      )}
    </form>
  );
}