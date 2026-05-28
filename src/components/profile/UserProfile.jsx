import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { supabase } from '../../supabaseClient';
import { Mail, Phone, MapPin, Calendar, User, Shield, Heart, Activity, Save, X, Edit2, Key, Eye, EyeOff } from 'lucide-react';

const UserProfile = ({ refreshTrigger }) => {
  const { userProfile, user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [pwdInfo, setPwdInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password validation states
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasMinLength, setHasMinLength] = useState(false);

  const [editForm, setEditForm] = useState({
    contact_number: '',
    street: '',
    barangay: ''
  });

  // Barangay options
  const barangays = [
    { value: 'Alapan 1-A', label: 'Alapan 1-A' },
    { value: 'Alapan 1-B', label: 'Alapan 1-B' },
    { value: 'Alapan 1-C', label: 'Alapan 1-C' }
  ];

  // Function to parse address into street and barangay
  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { street: '', barangay: '' };
    const parts = fullAddress.split(',');
    return {
      street: parts[0] || '',
      barangay: parts[1] ? parts[1].trim() : ''
    };
  };

  // Validate new password
  const validateNewPassword = (password) => {
    setHasUppercase(/[A-Z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasMinLength(password.length >= 6);
    
    return /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 6;
  };

  const handleNewPasswordChange = (e) => {
    const newPassword = e.target.value;
    setPasswordForm(prev => ({ ...prev, newPassword }));
    validateNewPassword(newPassword);
  };

  // Fetch user profile directly from Supabase
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Error fetching profile data', 'error');
    } else if (data) {
      setProfileData(data);
    }
    setLoading(false);
  }, [user?.id, showSnackbar]);

  // Fetch PWD info
  const fetchPWDInfo = useCallback(async () => {
    if (!profileData?.user_id) return;
    
    const { data, error } = await supabase
      .from('pwd_registry')
      .select('*')
      .eq('user_id', profileData.user_id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching PWD info:', error);
    } else if (data) {
      setPwdInfo(data);
    }
  }, [profileData?.user_id]);

  // Initial load
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, refreshTrigger]);

  // Load PWD info when profile is loaded
  useEffect(() => {
    if (profileData) {
      fetchPWDInfo();
    }
  }, [profileData, fetchPWDInfo]);

  const startEdit = () => {
    if (profileData) {
      const parsed = parseAddress(profileData.address);
      setEditForm({
        contact_number: profileData.contact_number || '',
        street: parsed.street,
        barangay: parsed.barangay
      });
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profileData) return;
    
    setSaving(true);
    
    const fullAddress = `${editForm.street}, ${editForm.barangay}, Imus Cavite`;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          contact_number: editForm.contact_number,
          address: fullAddress
        })
        .eq('user_id', profileData.user_id);
      
      if (error) throw error;
      
      showSnackbar('Profile updated successfully', 'success');
      
      // Refresh the profile data
      await fetchUserProfile();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Error updating profile: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate current password
    if (!passwordForm.currentPassword) {
      showSnackbar('Please enter your current password', 'error');
      return;
    }
    
    // Validate new password
    if (!passwordForm.newPassword) {
      showSnackbar('Please enter a new password', 'error');
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
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }
    
    // Check if new password is same as current
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      showSnackbar('New password cannot be the same as your current password', 'error');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // First, verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: passwordForm.currentPassword
      });
      
      if (signInError) {
        showSnackbar('Current password is incorrect', 'error');
        setIsChangingPassword(false);
        return;
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (updateError) throw updateError;
      
      showSnackbar('Password changed successfully! Please login again with your new password.', 'success');
      
      // Clear form and close modal
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setHasUppercase(false);
      setHasNumber(false);
      setHasMinLength(false);
      setShowPasswordModal(false);
      
      // Sign out and redirect to login after 2 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      showSnackbar('Error changing password. Please try again.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && !profileData) {
    return <div className="loading-profile">Loading profile...</div>;
  }

  if (!profileData) {
    return <div className="loading-profile">No profile data found</div>;
  }

  const parsedAddress = parseAddress(profileData.address);

  return (
    <>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div>
            <h3>{profileData.full_name}</h3>
            <span className={`role-badge ${profileData.role}`}>
              {profileData.role === 'pwd' ? 'Person with Disability' : 'Resident'}
            </span>
          </div>
        </div>
        
        <div className="profile-details">
          <p>
            <Mail size={18} />
            <strong>Email:</strong> 
            <span>{profileData.email}</span>
          </p>
          
          <p>
            <Phone size={18} />
            <strong>Contact:</strong> 
            {isEditing ? (
              <input 
                type="tel" 
                value={editForm.contact_number} 
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                className="edit-input"
                placeholder="Enter your contact number"
              />
            ) : (
              <span>{profileData.contact_number || 'Not provided'}</span>
            )}
          </p>
          
          <p>
            <MapPin size={18} />
            <strong>Address:</strong>
            {isEditing ? (
              <div className="address-edit-group">
                <input 
                  type="text" 
                  placeholder="Street / Block / Lot No."
                  value={editForm.street} 
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="edit-input"
                />
                <select 
                  value={editForm.barangay} 
                  onChange={(e) => handleInputChange('barangay', e.target.value)}
                  className="edit-input"
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay.value} value={barangay.value}>
                      {barangay.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span>{profileData.address || 'Not provided'}</span>
            )}
          </p>
          
          <p>
            <Calendar size={18} />
            <strong>Registered:</strong> 
            <span>{new Date(profileData.created_at).toLocaleDateString()}</span>
          </p>
          
          {profileData.role === 'pwd' && pwdInfo && (
            <>
              <div className="pwd-divider"></div>
              <div className="pwd-section">
                <h4>
                  <Heart size={18} />
                  PWD Information
                </h4>
                <p>
                  <Activity size={16} />
                  <strong>Mobility Level:</strong> 
                  <span>{pwdInfo.mobility_level || 'Not specified'}</span>
                </p>
                {pwdInfo.needs_medical_device && (
                  <p>
                    <Activity size={16} />
                    <strong>Medical Device:</strong> 
                    <span>{pwdInfo.device_details || 'Yes'}</span>
                  </p>
                )}
                {pwdInfo.emergency_contact_name && (
                  <p>
                    <Shield size={16} />
                    <strong>Emergency Contact:</strong> 
                    <span>{pwdInfo.emergency_contact_name} ({pwdInfo.emergency_contact_number || 'No number provided'})</span>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="btn-main" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={cancelEdit} className="btn-guest-outline" disabled={saving}>
                <X size={16} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={startEdit} className="btn-main">
                <Edit2 size={16} />
                Edit Profile
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)} 
                className="btn-guest-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
              >
                <Key size={16} />
                Change Password
              </button>
            </>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="admin-modal-header">
              <h3>Change Password</h3>
              <button className="admin-modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              {/* Current Password */}
              <div className="admin-form-group">
                <label className="admin-form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="admin-form-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="admin-form-group">
                <label className="admin-form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="admin-form-input"
                    value={passwordForm.newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter new password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password requirements */}
                {passwordForm.newPassword && (
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ color: hasMinLength ? '#4caf50' : '#999' }}>
                      {hasMinLength ? '✓' : '○'} 6+ characters
                    </span>
                    <span style={{ color: hasUppercase ? '#4caf50' : '#999' }}>
                      {hasUppercase ? '✓' : '○'} Uppercase letter
                    </span>
                    <span style={{ color: hasNumber ? '#4caf50' : '#999' }}>
                      {hasNumber ? '✓' : '○'} Number
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="admin-form-group">
                <label className="admin-form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="admin-form-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#f44336' }}>
                    Passwords do not match
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="admin-btn admin-btn-primary" 
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;