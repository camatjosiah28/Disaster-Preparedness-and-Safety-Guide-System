import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { Shield, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { showSnackbar } = useSnackbar();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Password validation states
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasMinLength, setHasMinLength] = useState(false);

  useEffect(() => {
    // Check if user came from reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const validatePassword = (pass) => {
    setHasUppercase(/[A-Z]/.test(pass));
    setHasNumber(/[0-9]/.test(pass));
    setHasMinLength(pass.length >= 6);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showSnackbar('Passwords do not match', 'error');
      return;
    }
    
    if (!hasUppercase) {
      showSnackbar('Password must contain at least 1 uppercase letter (A-Z)', 'error');
      return;
    }
    
    if (!hasNumber) {
      showSnackbar('Password must contain at least 1 number (0-9)', 'error');
      return;
    }
    
    if (!hasMinLength) {
      showSnackbar('Password must be at least 6 characters long', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      if (error) throw error;
      
      setSuccess(true);
      showSnackbar('Password reset successfully! Please login with your new password.', 'success');
      
      // Sign out
      await supabase.auth.signOut();
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      showSnackbar(error.message || 'Failed to reset password. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <Shield size={60} color="#f44336" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Invalid Reset Link</h2>
          <p style={{ marginBottom: '20px', color: 'var(--gray-dark)' }}>{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-main"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <CheckCircle size={60} color="#2e7d32" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Password Reset Successfully!</h2>
          <p style={{ marginBottom: '20px', color: 'var(--gray-dark)' }}>
            Your password has been updated. Redirecting to login...
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-main"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ArrowLeft size={18} />
            Go to Login
          </button>
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
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--dark)' }}>
          Create New Password
        </h2>
        <p style={{ marginBottom: '20px', color: 'var(--gray-dark)', fontSize: '0.9rem' }}>
          Enter your new password below
        </p>
        
        {/* Password Requirements Box */}
        <div style={{
          background: '#f5f5f5',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.8rem'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Password Requirements:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: hasMinLength ? '#4caf50' : '#999' }}>{hasMinLength ? '✓' : '○'}</span>
              <span style={{ color: hasMinLength ? '#4caf50' : '#666' }}>At least 6 characters</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: hasUppercase ? '#4caf50' : '#999' }}>{hasUppercase ? '✓' : '○'}</span>
              <span style={{ color: hasUppercase ? '#4caf50' : '#666' }}>At least 1 uppercase letter (A-Z)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: hasNumber ? '#4caf50' : '#999' }}>{hasNumber ? '✓' : '○'}</span>
              <span style={{ color: hasNumber ? '#4caf50' : '#666' }}>At least 1 number (0-9)</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleResetPassword}>
          {/* New Password */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="New Password" 
              className="auth-input" 
              value={password}
              onChange={handlePasswordChange} 
              disabled={isLoading}
              required
              style={{ paddingRight: '45px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: '#6b7280'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {/* Confirm Password */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm New Password" 
              className="auth-input" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              disabled={isLoading}
              required
              style={{ paddingRight: '45px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: '#6b7280'
              }}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button 
            type="submit"
            className="btn-main"
            disabled={isLoading || !hasUppercase || !hasNumber || !hasMinLength}
            style={{
              opacity: (isLoading || !hasUppercase || !hasNumber || !hasMinLength) ? 0.6 : 1
            }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/login" style={{ color: 'var(--danger)' }}>Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;