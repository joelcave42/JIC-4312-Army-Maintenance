import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../styles/LoginPage.css';
import armyimage from '../assets/armyimage.png';
import armyImageWhite from '../assets/armyImageWhite.png';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUsername } from '../features/globalValues/globalSlice';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Indicate loading

    try {
      console.log('Attempting login with username:', username);
      const response = await axios.post('http://localhost:3000/api/v1/accounts/login', {
        username,
        password,
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        console.log('Login successful:', response.data);
        localStorage.setItem("username", username);
        dispatch({
          type: 'globalValues/setUsername',
          payload: username
        });
        onLogin(response.data);
      } else {
        console.error('Login failed:', response.data);
        setError(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="centered-page">
      <div className="login-container">
        {/* Army Logo */}
        <img src={armyImageWhite} alt="U.S. Army Logo" className="army-logo" />

        {/* Main Heading */}
        <h2>Log In</h2>

        {/* Small, single-line disclaimer text */}
        <p className="disclaimer">
          For official use by authorized U.S. Army personnel.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message */}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* Submit Button */}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign in'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p
          style={{
            marginTop: '20px',
            color: '#ffc317',
            cursor: 'pointer',
            textAlign: 'center',
          }}
          onClick={() => navigate('/signup')}
        >
          Don't have an account? Sign up here.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
