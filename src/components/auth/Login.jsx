// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, User } from 'lucide-react';

const Login = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loginType, setLoginType] = useState('user');
  
  const { login } = useAuth(); // Use AuthContext instead of direct supabase

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    if (!email || !password) {
      setError('Please enter email and password');
      setIsLoading(false);
      return;
    }

    console.log('🔵 Login attempt as:', loginType, email);
    
    try {
      // Use the login function from AuthContext
      const result = await login(email, password);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('✅ Login successful');
      
      // After login, get the user role from the context's userProfile
      // Need to wait a bit for context to update
      setTimeout(async () => {
        // Import supabase dynamically to check role
        const { supabase } = await import('../../supabaseClient');
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .maybeSingle();
        
        const userRole = userData?.role || 'resident';
        console.log('User role:', userRole);
        
        // If trying to login as admin but not admin role
        if (loginType === 'admin' && userRole !== 'admin') {
          // Sign out immediately
          const { supabase } = await import('../../supabaseClient');
          await supabase.auth.signOut();
          setError('You are not authorized as admin. Please login as resident.');
          setIsLoading(false);
          return;
        }
        
        setSuccessMessage('Login successful! Redirecting...');
        
        // Redirect based on role
        setTimeout(() => {
          if (userRole === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/';
          }
        }, 1500);
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand">Alapan Ready</h1>
        
        {/* Login Type Toggle */}
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
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
          {loginType === 'admin' ? 'Admin Portal' : 'Resident Portal'}
        </h2>
        
        {error && (
          <div className="error-message" style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="success-message" style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}
        
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
          <input 
            type="password" 
            placeholder="Password" 
            className="auth-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            disabled={isLoading}
            autoComplete="current-password"
            required
          />
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