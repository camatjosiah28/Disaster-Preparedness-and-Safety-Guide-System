import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { MapPin, Phone, Mail, User, Heart, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useSnackbar } from '../../contexts/SnackbarContext';

const PWDManagement = ({ refreshTrigger }) => {
  const { showSnackbar } = useSnackbar();
  const [pwdList, setPwdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchPWDList = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pwd_registry')
        .select(`
          *,
          users:user_id (
            user_id,
            full_name,
            email,
            contact_number,
            address
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPwdList(data || []);
      
    } catch (error) {
      console.error('Error fetching PWD list:', error);
      showSnackbar('Error fetching PWD registry data!', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchPWDList();
  }, [fetchPWDList, refreshTrigger]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPWDList();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPWDList]);

  const toggleExpand = (pwdId) => {
    setExpandedRow(expandedRow === pwdId ? null : pwdId);
  };

  // Helper function to get priority level for rescue
  const getPriorityLevel = (pwd) => {
    if (pwd.mobility_level === 'Bedridden') return { level: 'CRITICAL', color: '#ef4444', bg: '#fee2e2' };
    if (pwd.needs_medical_device) return { level: 'HIGH', color: '#f59e0b', bg: '#fed7aa' };
    if (pwd.mobility_level === 'Needs Assistance') return { level: 'MEDIUM', color: '#f97316', bg: '#ffedd5' };
    return { level: 'NORMAL', color: '#10b981', bg: '#d1fae5' };
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="pwd-management-container" style={{ padding: '0 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Heart size={24} color="#ec4899" />
          PWD Registry
        </h2>
        <p style={{ color: 'var(--gray-dark)', marginBottom: '0' }}>
          List of registered Persons with Disabilities - For Priority Rescue
        </p>
      </div>

      {/* Priority Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: '#fee2e2',
          padding: '12px',
          borderRadius: '10px',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ fontSize: '11px', color: '#991b1b' }}>Critical Priority</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
            {pwdList.filter(p => p.mobility_level === 'Bedridden').length}
          </div>
          <div style={{ fontSize: '10px', color: '#991b1b' }}>Bedridden - Immediate Rescue</div>
        </div>
        <div style={{
          background: '#fed7aa',
          padding: '12px',
          borderRadius: '10px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '11px', color: '#92400e' }}>High Priority</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {pwdList.filter(p => p.needs_medical_device && p.mobility_level !== 'Bedridden').length}
          </div>
          <div style={{ fontSize: '10px', color: '#92400e' }}>Needs Medical Device</div>
        </div>
        <div style={{
          background: '#ffedd5',
          padding: '12px',
          borderRadius: '10px',
          borderLeft: '4px solid #f97316'
        }}>
          <div style={{ fontSize: '11px', color: '#9a3412' }}>Medium Priority</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>
            {pwdList.filter(p => p.mobility_level === 'Needs Assistance' && !p.needs_medical_device).length}
          </div>
          <div style={{ fontSize: '10px', color: '#9a3412' }}>Needs Assistance</div>
        </div>
        <div style={{
          background: '#d1fae5',
          padding: '12px',
          borderRadius: '10px',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '11px', color: '#065f46' }}>Total Registered</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{pwdList.length}</div>
          <div style={{ fontSize: '10px', color: '#065f46' }}>All PWDs</div>
        </div>
      </div>

      {/* Table Container - Responsive with horizontal scroll */}
      <div className="admin-table-container" style={{ 
        overflowX: 'auto', 
        WebkitOverflowScrolling: 'touch',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <table className="admin-table" style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          minWidth: '800px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'center', width: '40px' }}></th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Contact</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Address</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Mobility</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Medical Device</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Priority</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Registered</th>
             </tr>
          </thead>
          <tbody>
            {pwdList.map((pwd, index) => {
              const priority = getPriorityLevel(pwd);
              const isExpanded = expandedRow === pwd.pwd_id;
              
              return (
                <React.Fragment key={pwd.pwd_id}>
                  <tr style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: priority.level === 'CRITICAL' ? '#fef2f2' : 'white'
                  }}>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleExpand(pwd.pwd_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500' }}>
                      <div>
                        {pwd.users?.full_name || 'N/A'}
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          {pwd.users?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {pwd.users?.contact_number || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', maxWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                        <MapPin size={14} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '13px', color: '#374151', wordBreak: 'break-word' }}>
                          {pwd.users?.address || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: pwd.mobility_level === 'Independent' ? '#d1fae5' :
                                       pwd.mobility_level === 'Needs Assistance' ? '#fed7aa' : '#fee2e2',
                        color: pwd.mobility_level === 'Independent' ? '#065f46' :
                               pwd.mobility_level === 'Needs Assistance' ? '#92400e' : '#991b1b'
                      }}>
                        {pwd.mobility_level || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: pwd.needs_medical_device ? '#fee2e2' : '#e5e7eb',
                        color: pwd.needs_medical_device ? '#991b1b' : '#4b5563'
                      }}>
                        {pwd.needs_medical_device ? (pwd.device_details || 'Yes') : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: priority.bg,
                        color: priority.color
                      }}>
                        {priority.level}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {new Date(pwd.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  
                  {/* Expanded Row - Full Details for Priority Rescue */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td colSpan="8" style={{ padding: '20px' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '20px',
                          backgroundColor: 'white',
                          padding: '20px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {/* Left Column - Personal Information */}
                          <div>
                            <h4 style={{ 
                              margin: '0 0 15px 0', 
                              color: '#1f2937', 
                              fontSize: '14px', 
                              fontWeight: 'bold', 
                              borderBottom: '2px solid #ef4444', 
                              paddingBottom: '8px', 
                              display: 'inline-block' 
                            }}>
                              PERSONAL INFORMATION
                            </h4>
                            <div style={{ marginTop: '15px' }}>
                              <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                                <User size={14} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <strong style={{ minWidth: '100px' }}>Full Name:</strong>
                                <span style={{ flex: 1, wordBreak: 'break-word' }}>{pwd.users?.full_name || 'N/A'}</span>
                              </p>
                              <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                                <Mail size={14} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <strong style={{ minWidth: '100px' }}>Email:</strong>
                                <span style={{ flex: 1, wordBreak: 'break-word' }}>{pwd.users?.email || 'N/A'}</span>
                              </p>
                              <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                                <Phone size={14} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <strong style={{ minWidth: '100px' }}>Contact Number:</strong>
                                <span>{pwd.users?.contact_number || 'N/A'}</span>
                              </p>
                              <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                                <MapPin size={14} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <strong style={{ minWidth: '100px' }}>Full Address:</strong>
                                <span style={{ flex: 1, wordBreak: 'break-word' }}>{pwd.users?.address || 'N/A'}</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Middle Column - Disability Information */}
                          <div>
                            <h4 style={{ 
                              margin: '0 0 15px 0', 
                              color: '#1f2937', 
                              fontSize: '14px', 
                              fontWeight: 'bold', 
                              borderBottom: '2px solid #ef4444', 
                              paddingBottom: '8px', 
                              display: 'inline-block' 
                            }}>
                              DISABILITY INFORMATION
                            </h4>
                            <div style={{ marginTop: '15px' }}>
                              <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                <strong style={{ minWidth: '130px' }}>Disability Category:</strong>
                                <span>{pwd.disability_category || 'N/A'}</span>
                              </p>
                              <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                <strong style={{ minWidth: '130px' }}>Mobility Level:</strong>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  backgroundColor: pwd.mobility_level === 'Independent' ? '#d1fae5' :
                                                 pwd.mobility_level === 'Needs Assistance' ? '#fed7aa' : '#fee2e2',
                                  color: pwd.mobility_level === 'Independent' ? '#065f46' :
                                         pwd.mobility_level === 'Needs Assistance' ? '#92400e' : '#991b1b'
                                }}>
                                  {pwd.mobility_level || 'N/A'}
                                </span>
                              </p>
                              <p style={{ margin: '8px 0', fontSize: '13px' }}>
                                <strong>Needs Medical Device:</strong> {pwd.needs_medical_device ? 'Yes' : 'No'}
                              </p>
                              {pwd.needs_medical_device && pwd.device_details && (
                                <p style={{ margin: '8px 0', fontSize: '13px', background: '#fef3c7', padding: '8px', borderRadius: '8px', wordBreak: 'break-word' }}>
                                  <strong>Device Details:</strong> {pwd.device_details}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Right Column - Emergency Contact */}
                          <div>
                            <h4 style={{ 
                              margin: '0 0 15px 0', 
                              color: '#1f2937', 
                              fontSize: '14px', 
                              fontWeight: 'bold', 
                              borderBottom: '2px solid #ef4444', 
                              paddingBottom: '8px', 
                              display: 'inline-block' 
                            }}>
                              EMERGENCY CONTACT
                            </h4>
                            <div style={{ marginTop: '15px' }}>
                              {pwd.emergency_contact_name || pwd.emergency_contact_number ? (
                                <>
                                  <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    <strong style={{ minWidth: '120px' }}>Contact Person:</strong>
                                    <span>{pwd.emergency_contact_name || 'N/A'}</span>
                                  </p>
                                  <p style={{ margin: '8px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <Phone size={14} color="#6b7280" />
                                    <strong style={{ minWidth: '120px' }}>Contact Number:</strong>
                                    <span>{pwd.emergency_contact_number || 'N/A'}</span>
                                  </p>
                                </>
                              ) : (
                                <p style={{ margin: '8px 0', fontSize: '13px', color: '#9ca3af' }}>
                                  No emergency contact provided
                                </p>
                              )}
                            </div>
                            
                            {/* Priority Rescue Note */}
                            <div style={{
                              marginTop: '20px',
                              padding: '12px',
                              backgroundColor: priority.bg,
                              borderRadius: '8px',
                              borderLeft: `4px solid ${priority.color}`
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <AlertCircle size={16} color={priority.color} />
                                <strong style={{ color: priority.color, fontSize: '12px' }}>PRIORITY RESCUE - {priority.level}</strong>
                              </div>
                              <p style={{ fontSize: '11px', color: priority.color === '#ef4444' ? '#991b1b' : '#92400e', marginTop: '8px', lineHeight: '1.4' }}>
                                {priority.level === 'CRITICAL' && 'This person is bedridden and requires immediate assistance during emergencies. Need stretcher or ambulance for transport.'}
                                {priority.level === 'HIGH' && 'This person needs medical device/s (wheelchair, oxygen tank, etc.). Ensure device is available during rescue operation.'}
                                {priority.level === 'MEDIUM' && 'This person needs assistance with mobility. Assign a rescuer to help them during evacuation.'}
                                {priority.level === 'NORMAL' && 'This person is independent but still requires monitoring during emergencies.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {pwdList.length === 0 && (
        <div className="no-data" style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginTop: '20px',
          color: '#6b7280'
        }}>
          No PWD registrations found
        </div>
      )}
    </div>
  );
};

export default PWDManagement;