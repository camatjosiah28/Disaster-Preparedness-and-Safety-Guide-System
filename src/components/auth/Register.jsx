import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import PWDRegistration from './PWDRegistration';

const Register = ({ setView }) => {
  const initialState = {
    fullName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    street: '',
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

  // List of barangays - Alapan 1 lang
  const barangays = [
    { value: 'Alapan 1-A', label: 'Alapan 1-A' },
    { value: 'Alapan 1-B', label: 'Alapan 1-B' },
    { value: 'Alapan 1-C', label: 'Alapan 1-C' }
  ];

  // Import logo from assets
  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    const { fullName, email, password, contactNumber, address, street, isPWD, disabilityType } = formData;
    
    if (!fullName || !email || !password || !contactNumber || !address || !street) {
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

  // Combine address and street for full address
  const getFullAddress = () => {
    const barangay = barangays.find(b => b.value === formData.address);
    const barangayName = barangay ? barangay.label : formData.address;
    return `${formData.street}, ${barangayName}, Imus Cavite`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const fullAddress = getFullAddress();
      console.log('Full address:', fullAddress);
      
      // STEP 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.isPWD ? 'pwd' : 'resident',
            address: fullAddress
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('User already registered')) {
          throw new Error('Email already registered. Please login instead.');
        } else {
          throw new Error(authError.message);
        }
      }

      if (!authData?.user) {
        throw new Error('No user data returned from authentication');
      }

      console.log('Auth user created:', authData.user.id);

      // STEP 2: Insert into users table
      const userData = {
        auth_id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        contact_number: formData.contactNumber,
        address: fullAddress,
        role: formData.isPWD ? 'pwd' : 'resident',
        created_at: new Date().toISOString()
      };

      if (formData.isPWD && formData.disabilityType) {
        userData.disability_type = formData.disabilityType;
      }

      console.log('Inserting user data:', userData);

      const { error: insertError } = await supabase
        .from('users')
        .insert([userData]);

      if (insertError) {
        console.error('Insert error:', insertError);
      }

      // STEP 3: Get user_id for PWD registration
      const { data: userRecord, error: fetchError } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      // STEP 4: Insert PWD record if applicable
      if (formData.isPWD && formData.disabilityType && userRecord) {
        const pwdData = {
          user_id: userRecord.user_id,
          disability_category: formData.disabilityType,
          mobility_level: formData.mobilityLevel || 'Independent',
          needs_medical_device: formData.needsMedicalDevice || false,
          auth_id: authData.user.id,
          created_at: new Date().toISOString()
        };

        if (formData.deviceDetails) {
          pwdData.device_details = formData.deviceDetails;
        }
        if (formData.emergencyContactName) {
          pwdData.emergency_contact_name = formData.emergencyContactName;
        }
        if (formData.emergencyContactNumber) {
          pwdData.emergency_contact_number = formData.emergencyContactNumber;
        }

        console.log('Inserting PWD data:', pwdData);

        const { error: pwdError } = await supabase
          .from('pwd_registry')
          .insert([pwdData]);

        if (pwdError) {
          console.warn('PWD registration warning:', pwdError.message);
        } else {
          console.log('PWD registration successful');
        }
      }

      setSuccess('✅ Registration Successful! You can now login.');
      setFormData(initialState);
      
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
      <div className="auth-card register-card">
        {/* Logo */}
        <div className="auth-logo-container" style={{ marginBottom: '10px' }}>
          {logoSrc ? (
            <img src={logoSrc} alt="Alapan Ready Logo" className="auth-logo" style={{ height: '60px' }} />
          ) : (
            <div style={{ fontSize: '2.5rem', textAlign: 'center' }}>🏥</div>
          )}
        </div>
        
        <h2 style={{ 
          fontSize: '1.3rem', 
          marginBottom: '20px', 
          textAlign: 'center',
          color: 'var(--dark)',
          fontWeight: 'bold'
        }}>
          Resident Registration
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
          
          {/* Street/Block/Lot Field */}
          <input 
            name="street"
            type="text" 
            placeholder="Street/Block/Lot No. * (e.g., Phase 1 Block 5 Lot 12)" 
            className="auth-input" 
            value={formData.street}
            onChange={handleChange}
            disabled={loading}
            required
          />
          
          {/* Barangay Dropdown - Alapan 1 only */}
          <select
            name="address"
            className="auth-input"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            required
            style={{ 
              appearance: 'menulist',
              backgroundImage: 'none'
            }}
          >
            <option value="">Select Barangay *</option>
            {barangays.map((barangay) => (
              <option key={barangay.value} value={barangay.value}>
                {barangay.label}
              </option>
            ))}
          </select>
          
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
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          May account na? <span className="link" onClick={() => !loading && setView('login')}>Login Here</span>
        </p>
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