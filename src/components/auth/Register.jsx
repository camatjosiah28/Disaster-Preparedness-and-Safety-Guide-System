import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import PWDRegistration from './PWDRegistration';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = ({ setView }) => {
  const initialState = {
    fullName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    street: '',
    isPWD: false,
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
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const barangays = [
    { value: 'Alapan 1-A', label: 'Alapan 1-A' },
    { value: 'Alapan 1-B', label: 'Alapan 1-B' },
    { value: 'Alapan 1-C', label: 'Alapan 1-C' }
  ];

  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return {
      isValid: hasMinLength && hasUpperCase && hasNumber,
      hasMinLength,
      hasUpperCase,
      hasNumber
    };
  };

  const validateEmail = (email) => {
    email = email.trim().toLowerCase();
    
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Email must contain @ symbol';
    
    const parts = email.split('@');
    if (parts.length !== 2) return 'Invalid email format';
    
    const localPart = parts[0];
    const domain = parts[1];
    
    if (localPart.length === 0) return 'Email cannot start with @';
    if (domain.length === 0) return 'Domain cannot be empty';
    
    if (!domain.endsWith('.com')) {
      return 'Email must end with .com (e.g., name@gmail.com)';
    }
    
    if (domain === '.com') {
      return 'Invalid domain (e.g., gmail.com, yahoo.com)';
    }
    
    const domainWithoutCom = domain.slice(0, -4);
    if (domainWithoutCom.length === 0) {
      return 'Invalid domain (e.g., gmail.com, yahoo.com)';
    }
    
    if (domain.split('.').length > 2) {
      return 'Invalid domain (use simple domain like gmail.com, not gmail.com.ph)';
    }
    
    const domainName = domainWithoutCom;
    if (!/^[a-zA-Z0-9\-]+$/.test(domainName)) {
      return 'Domain name can only contain letters, numbers, and hyphens';
    }
    
    return '';
  };

  const validatePhilippineNumber = (number) => {
    let cleanNumber = number.replace(/\D/g, '');
    
    if (!cleanNumber) return 'Contact number is required';
    
    if (cleanNumber.startsWith('63')) {
      cleanNumber = '0' + cleanNumber.slice(2);
    }
    
    if (cleanNumber.length === 10 && cleanNumber.startsWith('9')) {
      cleanNumber = '0' + cleanNumber;
    }
    
    if (!cleanNumber.startsWith('0')) {
      return 'Must start with 0 (e.g., 09123456789)';
    }
    
    if (cleanNumber.length !== 11) {
      return 'Must be exactly 11 digits (e.g., 09123456789)';
    }
    
    const validPrefixes = [
      '0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', '0926', '0927',
      '0935', '0936', '0937', '0938', '0939', '0945', '0946', '0947', '0948', '0949',
      '0950', '0951', '0955', '0956', '0957', '0960', '0961', '0965', '0966', '0967',
      '0970', '0971', '0975', '0976', '0977', '0978', '0979', '0981', '0989', '0995', '0997',
      '0813', '0817', '0905', '0906', '0907', '0908', '0909', '0910', '0911', '0912', '0913',
      '0914', '0915', '0916', '0928', '0929', '0930', '0931', '0932', '0933', '0934',
      '0942', '0943', '0944', '0994', '0998', '0999'
    ];
    
    const first4 = cleanNumber.slice(0, 4);
    const first3 = cleanNumber.slice(0, 3);
    
    if (!validPrefixes.includes(first4) && !validPrefixes.some(p => p.startsWith(first3))) {
      return 'Please enter a valid Philippine mobile number';
    }
    
    return '';
  };

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('63')) {
      cleaned = '0' + cleaned.slice(2);
    }
    
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      cleaned = '0' + cleaned;
    }
    
    return cleaned;
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, email: value }));
    if (value) {
      const emailValidationError = validateEmail(value);
      setEmailError(emailValidationError);
    } else {
      setEmailError('');
    }
    setError('');
  };

  const handlePhoneChange = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    setFormData(prev => ({ ...prev, contactNumber: value }));
    
    if (value) {
      const phoneValidationError = validatePhilippineNumber(value);
      setPhoneError(phoneValidationError);
    } else {
      setPhoneError('');
    }
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    const { fullName, email, password, contactNumber, address, street, isPWD, mobilityLevel, emergencyContactName, emergencyContactNumber } = formData;
    
    if (!fullName || !email || !password || !contactNumber || !address || !street) {
      setError('Please fill in all required fields');
      return false;
    }

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError(emailValidationError);
      return false;
    }

    const phoneValidationError = validatePhilippineNumber(contactNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setError(phoneValidationError);
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password must have at least 6 characters, 1 uppercase letter, and 1 number');
      return false;
    }

    if (isPWD) {
      if (!mobilityLevel) {
        setError('Please select level of assistance needed for PWD registration');
        return false;
      }
      
      if (!emergencyContactName) {
        setError('Please provide emergency contact name for PWD registration');
        return false;
      }
      
      if (!emergencyContactNumber) {
        setError('Please provide emergency contact number for PWD registration');
        return false;
      }

      if (formData.needsMedicalDevice && !formData.deviceDetails) {
        setError('Please specify medical device/s needed');
        return false;
      }
    }

    return true;
  };

  const getFullAddress = () => {
    const barangay = barangays.find(b => b.value === formData.address);
    const barangayName = barangay ? barangay.label : formData.address;
    return `${formData.street}, ${barangayName}, Imus Cavite`;
  };

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid = passwordValidation.isValid;

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setEmailError('');
    setPhoneError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const fullAddress = getFullAddress();
      const cleanedPhone = cleanPhoneNumber(formData.contactNumber);
      const emailToUse = formData.email.trim().toLowerCase();
      
      // STEP 1: Check if email exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', emailToUse)
        .maybeSingle();
      
      if (existingUser) {
        throw new Error('Email already registered. Please login instead.');
      }
      
      // STEP 2: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailToUse,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.isPWD ? 'pwd' : 'resident',
            address: fullAddress,
            contact_number: cleanedPhone
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || 
            authError.message.includes('User already registered')) {
          throw new Error('Email already registered. Please login instead.');
        }
        throw new Error(authError.message);
      }

      if (authData?.user && !authData.user.identities?.length) {
        throw new Error('Email already registered. Please login instead.');
      }

      if (!authData?.user) {
        throw new Error('No user data returned from authentication');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // STEP 3: Wait for trigger or manual insert
      await new Promise(resolve => setTimeout(resolve, 1500));

      // STEP 4: Get user record
      let { data: userRecord, error: fetchError } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      let userId = userRecord?.user_id;

      if (!userId) {
        console.log('No trigger detected, manually inserting user...');
        
        const userData = {
          auth_id: authData.user.id,
          email: emailToUse,
          full_name: formData.fullName,
          contact_number: cleanedPhone,
          address: fullAddress,
          role: formData.isPWD ? 'pwd' : 'resident',
          created_at: new Date().toISOString()
        };

        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert([userData])
          .select();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Registration failed: ${insertError.message}`);
        }

        userId = insertData[0]?.user_id;
        console.log('Manual insert successful, userId:', userId);
      } else {
        console.log('Trigger inserted user automatically, userId:', userId);
      }

      // STEP 5: Insert PWD record if applicable (GUMAAGANA NA ITO)
      if (formData.isPWD && userId) {
        const cleanedEmergencyNumber = cleanPhoneNumber(formData.emergencyContactNumber);
        
        const pwdData = {
          user_id: userId,
          mobility_level: formData.mobilityLevel || 'Independent',
          needs_medical_device: formData.needsMedicalDevice || false,
          auth_id: authData.user.id,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_number: cleanedEmergencyNumber || null,
        };

        if (formData.deviceDetails) {
          pwdData.device_details = formData.deviceDetails;
        }

        console.log('Inserting PWD data:', pwdData);

        const { error: pwdError } = await supabase
          .from('pwd_registry')
          .insert([pwdData]);

        if (pwdError) {
          console.error('PWD registration error:', pwdError.message);
        } else {
          console.log('PWD registration successful');
        }
      }

      // STEP 6: Sign out the user
      await supabase.auth.signOut();

      setSuccess('Registration Successful! Please check your email to confirm your account, then login.');
      setFormData(initialState);
      setEmailError('');
      setPhoneError('');
      setShowPassword(false);
      
      setTimeout(() => {
        setView('login');
      }, 3000);
      
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
          <div style={{
            background: '#fff3e0',
            borderLeft: '4px solid #ff9800',
            color: '#e65100',
            padding: '10px 12px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            background: '#e8f5e9',
            borderLeft: '4px solid #4caf50',
            color: '#2e7d32',
            padding: '10px 12px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '0.9rem'
          }}>
            ✓ {success}
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
          
          <div>
            <input 
              name="email"
              type="email" 
              placeholder="Email * (must end with .com)" 
              className="auth-input" 
              value={formData.email}
              onChange={handleEmailChange}
              disabled={loading}
              style={{ borderColor: emailError ? '#ff9800' : undefined }}
              required
            />
            {emailError && (
              <div style={{ fontSize: '0.75rem', color: '#e65100', marginTop: '4px', marginLeft: '4px' }}>
                ⚠️ {emailError}
              </div>
            )}
          </div>
          
          <div style={{ position: 'relative' }}>
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              placeholder="Password *" 
              className="auth-input" 
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              style={{ 
                borderColor: formData.password && !isPasswordValid ? '#ff9800' : undefined,
                paddingRight: '40px'
              }}
              required
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
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '1.1rem',
                opacity: loading ? 0.5 : 1,
                pointerEvents: loading ? 'none' : 'auto'
              }}
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {formData.password && (
            <div style={{ marginTop: '8px', fontSize: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#666' }}>
              <span style={{ color: passwordValidation.hasMinLength ? '#4caf50' : '#999' }}>
                {passwordValidation.hasMinLength ? '✓' : '○'} 6+ characters
              </span>
              <span style={{ color: passwordValidation.hasUpperCase ? '#4caf50' : '#999' }}>
                {passwordValidation.hasUpperCase ? '✓' : '○'} Uppercase
              </span>
              <span style={{ color: passwordValidation.hasNumber ? '#4caf50' : '#999' }}>
                {passwordValidation.hasNumber ? '✓' : '○'} Number
              </span>
            </div>
          )}
          
          <div>
            <input 
              name="contactNumber"
              type="tel" 
              placeholder="Contact Number * (e.g., 09123456789)" 
              className="auth-input" 
              value={formData.contactNumber}
              onChange={handlePhoneChange}
              disabled={loading}
              style={{ borderColor: phoneError ? '#ff9800' : undefined }}
              required
            />
            {phoneError && (
              <div style={{ fontSize: '0.75rem', color: '#e65100', marginTop: '4px', marginLeft: '4px' }}>
                ⚠️ {phoneError}
              </div>
            )}
          </div>
          
          <input 
            name="street"
            type="text" 
            placeholder="Street/Block/Lot No. *" 
            className="auth-input" 
            value={formData.street}
            onChange={handleChange}
            disabled={loading}
            required
          />
          
          <select
            name="address"
            className="auth-input"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            required
          >
            <option value="">Select Barangay *</option>
            {barangays.map((barangay) => (
              <option key={barangay.value} value={barangay.value}>
                {barangay.label}
              </option>
            ))}
          </select>
          
          <div style={{ margin: '15px 0', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
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

          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          May account na? <span className="link" onClick={() => !loading && setView('login')}>Login Here</span>
        </p>
        <button className="btn-guest-outline" onClick={() => !loading && setView('guest')} disabled={loading}>
          Back as Guest
        </button>
      </div>
    </div>
  );
};

export default Register;