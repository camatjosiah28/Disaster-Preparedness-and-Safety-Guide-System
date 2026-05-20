import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { Mail, Phone, MapPin, Calendar, User, Shield, Heart, Activity, Save, X, Edit2 } from 'lucide-react';

const UserProfile = ({ refreshTrigger }) => {
  const { userProfile, user } = useAuth();
  const [pwdInfo, setPwdInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
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
    } else if (data) {
      setProfileData(data);
    }
    setLoading(false);
  }, [user?.id]);

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
      
      alert('Profile updated successfully');
      
      // Refresh the profile data
      await fetchUserProfile();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
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
              {/* ITO ANG TINANGGAL KO - DISABILITY TYPE */}
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
          <button onClick={startEdit} className="btn-main">
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;