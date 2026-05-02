// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PWDRegistration from './PWDRegistration';

const Register = ({ setView }) => {
  const initialState = {
    fullName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    isPWD: false,
    disabilityType: '',
    mobilityLevel: 'Independent',
    needsMedicalDevice: false,
    deviceDetails: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register } = useAuth(); // Use AuthContext

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    const { fullName, email, password, contactNumber, address, isPWD, disabilityType } = formData;
    
    if (!fullName || !email || !password || !address || !contactNumber) {
      setError('Please fill in all required fields');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (isPWD && !disabilityType) {
      setError('Please select disability type for PWD registration');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('Starting registration for:', formData.email);
      
      // Prepare user data for registration
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        contact_number: formData.contactNumber,
        address: formData.address,
        role: formData.isPWD ? 'pwd' : 'resident',
        isPWD: formData.isPWD,
        disabilityType: formData.disabilityType,
        mobilityLevel: formData.mobilityLevel,
        needsMedicalDevice: formData.needsMedicalDevice,
        deviceDetails: formData.deviceDetails,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber
      };
      
      // Use register function from AuthContext
      const result = await register(userData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setSuccess('✅ Registration Successful! You can now login.');
      setFormData(initialState);
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        setView('login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand">Alapan Ready</h1>
        <h2>Resident Registration</h2>
        
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
        
        {success && (
          <div className="success-message" style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input 
            name="fullName"
            type="text" 
            placeholder="Full Name *" 
            className="auth-input" 
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input 
            name="email"
            type="email" 
            placeholder="Email *" 
            className="auth-input" 
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input 
            name="password"
            type="password" 
            placeholder="Password (min. 6 characters) *" 
            className="auth-input" 
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input 
            name="contactNumber"
            type="tel" 
            placeholder="Contact Number *" 
            className="auth-input" 
            value={formData.contactNumber}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input 
            name="address"
            type="text" 
            placeholder="Address *" 
            className="auth-input" 
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            required
          />
          
          <div style={{ 
            margin: '15px 0', 
            padding: '10px', 
            background: '#f5f5f5', 
            borderRadius: '5px',
            textAlign: 'left'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isPWD"
                checked={formData.isPWD}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Register as Person with Disability (PWD)?</span>
            </label>
          </div>

          {formData.isPWD && (
            <PWDRegistration 
              formData={formData}
              handleChange={handleChange}
              handleCheckbox={handleChange}
              loading={loading}
            />
          )}

          <button 
            type="submit"
            className="btn-main"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>
        
        <p>May account na? <span className="link" onClick={() => !loading && setView('login')}>Login Here</span></p>
        <button 
          className="btn-guest-outline" 
          onClick={() => !loading && setView('guest')}
          disabled={loading}
        >
          Back as Guest
        </button>
      </div>
    </div>
  );
};

export default Register;