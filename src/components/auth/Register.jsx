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
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

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

  // STRICT EMAIL VALIDATION - .com LANG TALAGA!
  const validateEmail = (email) => {
    // Remove spaces
    email = email.trim().toLowerCase();
    
    // Check if empty
    if (!email) return 'Email is required';
    
    // Check if email contains @
    if (!email.includes('@')) return 'Email must contain @ symbol';
    
    // Split email into local part and domain
    const parts = email.split('@');
    if (parts.length !== 2) return 'Invalid email format';
    
    const localPart = parts[0];
    const domain = parts[1];
    
    // Check local part is not empty
    if (localPart.length === 0) return 'Email cannot start with @';
    
    // Check domain is not empty
    if (domain.length === 0) return 'Domain cannot be empty';
    
    // MUST end with .com EXACTLY
    if (!domain.endsWith('.com')) {
      return 'Email must end with .com (e.g., name@gmail.com)';
    }
    
    // Check na hindi pwedeng .com lang ang buong domain (dapat may something before .com)
    if (domain === '.com') {
      return 'Invalid domain (e.g., gmail.com, yahoo.com)';
    }
    
    // Check na dapat may laman bago ang .com
    const domainWithoutCom = domain.slice(0, -4); // Remove .com
    if (domainWithoutCom.length === 0) {
      return 'Invalid domain (e.g., gmail.com, yahoo.com)';
    }
    
    // Check na hindi pwedeng magkaroon ng additional dots after .com
    if (domain.split('.').length > 2) {
      return 'Invalid domain (use simple domain like gmail.com, not gmail.com.ph)';
    }
    
    // Check na walang special characters sa domain except dot
    const domainName = domainWithoutCom;
    if (!/^[a-zA-Z0-9\-]+$/.test(domainName)) {
      return 'Domain name can only contain letters, numbers, and hyphens';
    }
    
    return '';
  };

  // Philippine mobile number validation (11 digits)
  const validatePhilippineNumber = (number) => {
    // Remove spaces, dashes, plus sign, parentheses
    let cleanNumber = number.replace(/[\s\-\(\)\+]/g, '');
    
    // Check if empty
    if (!cleanNumber) return 'Contact number is required';
    
    // Handle 63 prefix (convert to 0)
    if (cleanNumber.startsWith('63')) {
      cleanNumber = '0' + cleanNumber.slice(2);
    }
    
    // Should start with 0 and have 11 digits total for PH mobile
    if (!cleanNumber.startsWith('0')) {
      return 'Must start with 0 (e.g., 09123456789)';
    }
    
    // Check if exactly 11 digits
    if (!/^\d{11}$/.test(cleanNumber)) {
      return 'Must be exactly 11 digits (e.g., 09123456789)';
    }
    
    // Check if valid mobile prefix (common Philippine prefixes)
    const prefix = cleanNumber.slice(0, 4);
    const validPrefixes = [
      '0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', '0926', '0927',
      '0935', '0936', '0937', '0938', '0939', '0945', '0946', '0947', '0948', '0949',
      '0950', '0951', '0955', '0956', '0957', '0960', '0961', '0965', '0966', '0967',
      '0970', '0971', '0975', '0976', '0977', '0978', '0979', '0981', '0989', '0995', '0997',
      '0813', '0817', '0905', '0906', '0907', '0908', '0909', '0910', '0911', '0912', '0913',
      '0914', '0915', '0916', '0928', '0929', '0930', '0931', '0932', '0933', '0934',
      '0942', '0943', '0944', '0994', '0998', '0999'
    ];
    
    // Check first 4 digits or first 3 digits for some prefixes
    const first4 = cleanNumber.slice(0, 4);
    const first3 = cleanNumber.slice(0, 3);
    
    if (!validPrefixes.includes(first4) && !validPrefixes.some(p => p.startsWith(first3))) {
      return 'Please enter a valid Philippine mobile number (Globe/Smart/Sun/DITO)';
    }
    
    return '';
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
    // Allow only numbers, spaces, dashes, plus, parentheses
    value = value.replace(/[^\d\s\-\(\)\+]/g, '');
    
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
    const { fullName, email, password, contactNumber, address, street, isPWD, disabilityType } = formData;
    
    // Check required fields
    if (!fullName || !email || !password || !contactNumber || !address || !street) {
      setError('Please fill in all required fields');
      return false;
    }

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError(emailValidationError);
      return false;
    }

    // Validate phone number
    const phoneValidationError = validatePhilippineNumber(contactNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setError(phoneValidationError);
      return false;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password must have at least 6 characters, 1 uppercase letter, and 1 number');
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

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid = passwordValidation.isValid;

  // Function to sign out after registration
  const signOutAfterRegistration = async () => {
    try {
      await supabase.auth.signOut();
      console.log('Auto sign-out after registration successful');
    } catch (error) {
      console.error('Error during auto sign-out:', error);
    }
  };

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

      // Clean phone number before saving (remove spaces, dashes, etc.)
      const cleanPhoneNumber = formData.contactNumber.replace(/[\s\-\(\)\+]/g, '');

      // STEP 2: Insert into users table
      const userData = {
        auth_id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        contact_number: cleanPhoneNumber,
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
          // Clean emergency contact number as well
          const cleanEmergencyNumber = formData.emergencyContactNumber.replace(/[\s\-\(\)\+]/g, '');
          pwdData.emergency_contact_number = cleanEmergencyNumber;
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

      // STEP 5: Sign out the user to prevent auto-login
      await signOutAfterRegistration();

      setSuccess('✅ Registration Successful! Please login with your credentials.');
      setFormData(initialState);
      setEmailError('');
      setPhoneError('');
      
      // Redirect to login tab after 2 seconds
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
          
          {/* Email field - .com ONLY */}
          <div>
            <input 
              name="email"
              type="email" 
              placeholder="Email * (must end with .com)" 
              className="auth-input" 
              value={formData.email}
              onChange={handleEmailChange}
              disabled={loading}
              style={{ 
                borderColor: emailError ? '#ff9800' : undefined
              }}
              required
            />
            {emailError && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#e65100',
                marginTop: '4px',
                marginLeft: '4px'
              }}>
                ⚠️ {emailError}
              </div>
            )}
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#4caf50',
              marginTop: '4px',
              marginLeft: '4px',
              fontWeight: '500'
            }}>
              ✓ Only .com domains are allowed (e.g., name@gmail.com, name@yahoo.com)
            </div>
          </div>
          
          {/* Password field */}
          <div>
            <input 
              name="password"
              type="password" 
              placeholder="Password *" 
              className="auth-input" 
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              style={{ 
                borderColor: formData.password && !isPasswordValid ? '#ff9800' : undefined
              }}
              required
            />
            
            {formData.password && (
              <div style={{ 
                marginTop: '8px',
                fontSize: '0.75rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                color: '#666'
              }}>
                <span style={{ 
                  color: passwordValidation.hasMinLength ? '#4caf50' : '#999',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {passwordValidation.hasMinLength ? '✓' : '○'} 6+ characters
                </span>
                <span style={{ 
                  color: passwordValidation.hasUpperCase ? '#4caf50' : '#999',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {passwordValidation.hasUpperCase ? '✓' : '○'} Uppercase
                </span>
                <span style={{ 
                  color: passwordValidation.hasNumber ? '#4caf50' : '#999',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {passwordValidation.hasNumber ? '✓' : '○'} Number
                </span>
              </div>
            )}
          </div>
          
          {/* Contact Number field with Philippine format validation */}
          <div>
            <input 
              name="contactNumber"
              type="tel" 
              placeholder="Contact Number * (e.g., 09123456789)" 
              className="auth-input" 
              value={formData.contactNumber}
              onChange={handlePhoneChange}
              disabled={loading}
              style={{ 
                borderColor: phoneError ? '#ff9800' : undefined
              }}
              required
            />
            {phoneError && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#e65100',
                marginTop: '4px',
                marginLeft: '4px'
              }}>
                ⚠️ {phoneError}
              </div>
            )}
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#999',
              marginTop: '4px',
              marginLeft: '4px'
            }}>
              Format: 09123456789 (11 digits, starts with 0)
            </div>
          </div>
          
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