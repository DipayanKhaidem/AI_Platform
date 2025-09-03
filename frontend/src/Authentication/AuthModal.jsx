import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignup ? 'signup' : 'login';

    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        localStorage.setItem('token', data.token);
        onLoginSuccess(); // update state in App.js
        onClose();        // close modal
      }
    } catch (err) {
      console.error(err);
      setError('Server unreachable. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (isSignup ? 'Signing up...' : 'Logging in...') : (isSignup ? 'Sign Up' : 'Login')}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>

        <p className="toggle-auth">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="toggle-btn" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Login here' : 'Sign up here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
