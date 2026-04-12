import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (otpSent) {
        // Verify OTP flow
        const response = await fetch('http://localhost:5000/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Verification failed');
        login(data.user, data.token);
        navigate('/');
      } else {
        // Standard Login / Register flow
        const endpoint = isLogin ? '/api/login' : '/api/register';
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isLogin 
              ? { email: formData.email, password: formData.password } 
              : formData
          )
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        if (data.requiresOtp) {
          setOtpSent(true);
          setLoading(false);
          return;
        }

        // Success for Login
        login(data.user, data.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-box glass"
      >
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to continue your journey' : 'Join us to get personalized recommendations'}</p>
        </div>

        <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin && !otpSent ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setOtpSent(false); setError(''); }}
            >
              Login
            </button>
            <button 
              className={`auth-tab ${!isLogin && !otpSent ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setOtpSent(false); setError(''); }}
            >
              Register
            </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {otpSent ? (
            <AnimatePresence mode="popLayout">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="input-group"
              >
                <Lock className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="otp"
                  placeholder="Enter 6-digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  maxLength={6}
                />
              </motion.div>
              <p style={{textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '10px'}}>
                Check your terminal for the OTP.
              </p>
            </AnimatePresence>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="input-group"
                  >
                    <UserIcon className="input-icon" size={20} />
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Full Name" 
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="input-group">
                <Mail className="input-icon" size={20} />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
            </>
          )}

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="auth-error"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : (otpSent ? 'Verify OTP' : (isLogin ? 'Sign In' : 'Sign Up'))}
          </button>
          {isLogin && !otpSent && (
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => setFormData({ ...formData, email: 'user@soundmatch.com', password: 'password123', name: '' })}
            >
              Use demo credentials
            </button>
          )}
        </form>
      </motion.div>

      <div className="auth-admin-gateway">
        <span>Are you an admin?</span>
        <a href="/admin/login" className="auth-admin-link">Go to Admin Portal →</a>
      </div>
    </div>
  );
};

export default Auth;
