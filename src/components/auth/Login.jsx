import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { Shield, User, Eye, EyeOff, Mail, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const Login = ({ setView }) => {
  const { showSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const { login } = useAuth();

  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    if (!email || !password) {
      showSnackbar('Please enter email and password', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching user role:', fetchError);
      }
      
      const userRole = userData?.role || 'resident';
      
      if (loginType === 'user' && userRole === 'admin') {
        showSnackbar('Admin accounts cannot login as Resident. Please use Admin Portal.', 'error');
        setIsLoading(false);
        return;
      }
      
      if (loginType === 'admin' && userRole !== 'admin') {
        showSnackbar('This account is not an admin. Please use Resident Portal.', 'error');
        setIsLoading(false);
        return;
      }
      
      const result = await login(email, password);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      showSnackbar('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      showSnackbar(error.message || 'Invalid email or password', 'error');
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      showSnackbar('Please enter your email address', 'error');
      return;
    }
    
    setIsResetting(true);
    
    try {
      // Check if email exists in users table
      const { data: userData, error: findError } = await supabase
        .from('users')
        .select('email')
        .eq('email', resetEmail)
        .maybeSingle();
      
      if (findError || !userData) {
        showSnackbar(`Email "${resetEmail}" not found in our system.`, 'error');
        setIsResetting(false);
        return;
      }
      
const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
  redirectTo: 'https://disaster-preparedness-and-safety-guide.vercel.app/reset-password',
});
      
      if (error) throw error;
      
      setResetSent(true);
      showSnackbar(`Password reset link sent to ${resetEmail}. Please check your email.`, 'success');
      
    } catch (error) {
      console.error('Reset password error:', error);
      showSnackbar('Unable to send reset link. Please try again later.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Forgot password modal
  if (showForgotPassword) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo-container">
            {logoSrc ? (
              <img src={logoSrc} alt="Alapan Ready Logo" className="auth-logo" />
            ) : (
              <Shield size={60} color="var(--danger)" />
            )}
          </div>

          {!resetSent ? (
            <>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--dark)' }}>
                Forgot Password?
              </h2>
              <p style={{ marginBottom: '20px', color: 'var(--gray-dark)', fontSize: '0.9rem' }}>
                Enter your email address to reset your password.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
                  <Mail size={18} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="auth-input" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)} 
                    disabled={isResetting}
                    autoComplete="email"
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                
                <button 
                  type="submit"
                  className="btn-main"
                  disabled={isResetting}
                  style={{ marginBottom: '15px' }}
                >
                  {isResetting ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="btn-guest-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <CheckCircle size={50} color="#4caf50" />
              </div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--dark)', textAlign: 'center' }}>
                Check Your Email
              </h2>
              <p style={{ marginBottom: '20px', color: 'var(--gray-dark)', fontSize: '0.85rem', textAlign: 'center' }}>
                We sent a password reset link to <strong>{resetEmail}</strong>
              </p>
              <button 
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                  setResetEmail('');
                }}
                className="btn-main"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-container">
          {logoSrc ? (
            <img src={logoSrc} alt="Alapan Ready Logo" className="auth-logo" />
          ) : (
            <Shield size={60} color="var(--danger)" />
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          background: 'var(--light-gray)',
          padding: '5px',
          borderRadius: 'var(--border-radius-md)'
        }}>
          <button
            type="button"
            onClick={() => setLoginType('user')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: loginType === 'user' ? 'var(--danger)' : 'transparent',
              color: loginType === 'user' ? 'white' : 'var(--gray-dark)',
              transition: 'all 0.3s ease'
            }}
          >
            <User size={18} />
            Resident Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: loginType === 'admin' ? 'var(--danger)' : 'transparent',
              color: loginType === 'admin' ? 'white' : 'var(--gray-dark)',
              transition: 'all 0.3s ease'
            }}
          >
            <Shield size={18} />
            Admin Login
          </button>
        </div>
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--dark)' }}>
          {loginType === 'admin' ? 'Admin Portal' : 'Resident Portal'}
        </h2>
        
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="auth-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            disabled={isLoading}
            autoComplete="email"
            required
          />
          
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="auth-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              disabled={isLoading}
              autoComplete="current-password"
              required
              style={{ paddingRight: '45px' }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '5px' }}>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setResetSent(false);
                setResetEmail('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textDecoration: 'underline',
                padding: '5px'
              }}
            >
              Forgot Password?
            </button>
          </div>
          
          <button 
            type="submit"
            className="btn-main"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : `Sign in as ${loginType === 'admin' ? 'Admin' : 'Resident'}`}
          </button>
        </form>
        
        {loginType === 'user' && (
          <>
            <p style={{ marginTop: '20px' }}>
              Don't have an account?{' '}
              <span 
                className="link" 
                onClick={() => !isLoading && setView('register')}
                style={{ cursor: 'pointer', color: '#d32f2f' }}
              >
                Register Here
              </span>
            </p>
            <button 
              className="btn-guest-outline" 
              onClick={() => !isLoading && setView('guest')}
              disabled={isLoading}
            >
              Continue as Guest
            </button>
          </>
        )}
        
        {loginType === 'admin' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'var(--blue-light)', 
            borderRadius: 'var(--border-radius-md)',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            <Shield size={16} style={{ display: 'inline', marginRight: '5px' }} />
            <span>Admin access is restricted to authorized personnel only</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;