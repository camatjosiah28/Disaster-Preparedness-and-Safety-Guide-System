import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';

const UserProfile = ({ refreshTrigger }) => {
  const { userProfile, refreshProfile, user } = useAuth();
  const [pwdInfo, setPwdInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPWDInfo = useCallback(async () => {
    if (!userProfile?.user_id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('pwd_registry')
      .select('*')
      .eq('user_id', userProfile.user_id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching PWD info:', error);
    } else if (data) {
      setPwdInfo(data);
    }
    setLoading(false);
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchPWDInfo();
      refreshProfile();
    }
  }, [userProfile, fetchPWDInfo, refreshTrigger, refreshProfile]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userProfile) {
        refreshProfile();
        fetchPWDInfo();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userProfile, refreshProfile, fetchPWDInfo]);

  if (!userProfile) {
    return <div className="loading-profile">Loading profile...</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <span className="profile-avatar">
          {userProfile.full_name?.charAt(0).toUpperCase() || 'U'}
        </span>
        <div>
          <h3>{userProfile.full_name}</h3>
          <span className={`role-badge ${userProfile.role}`}>
            {userProfile.role === 'pwd' ? 'Person with Disability' : 'Resident'}
          </span>
        </div>
      </div>
      
      <div className="profile-details">
        <p><strong>📧 Email:</strong> {userProfile.email}</p>
        <p><strong>📱 Contact:</strong> {userProfile.contact_number || 'Not provided'}</p>
        <p><strong>🏠 Address:</strong> {userProfile.address || 'Not provided'}</p>
        <p><strong>📅 Registered:</strong> {new Date(userProfile.created_at).toLocaleDateString()}</p>
        
        {userProfile.role === 'pwd' && pwdInfo && (
          <>
            <hr />
            <h4>♿ PWD Information</h4>
            <p><strong>Disability Type:</strong> {pwdInfo.disability_category}</p>
            <p><strong>Mobility Level:</strong> {pwdInfo.mobility_level}</p>
            {pwdInfo.needs_medical_device && (
              <p><strong>Medical Device:</strong> {pwdInfo.device_details || 'Yes'}</p>
            )}
            {pwdInfo.emergency_contact_name && (
              <p><strong>Emergency Contact:</strong> {pwdInfo.emergency_contact_name} ({pwdInfo.emergency_contact_number})</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;