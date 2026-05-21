import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const PWDManagement = ({ refreshTrigger }) => {
  const [pwdList, setPwdList] = useState([]);
  const [loading, setLoading] = useState(true);

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
            contact_number
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPwdList(data || []);
      
    } catch (error) {
      console.error('Error fetching PWD list:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        <h2>PWD Registry</h2>
        <p style={{ color: 'var(--gray-dark)', marginBottom: '0' }}>
          List of registered Persons with Disabilities
        </p>
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
              <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Contact</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Disability Category</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Mobility Level</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Medical Device</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Registered Date</th>
             </tr>
          </thead>
          <tbody>
            {pwdList.map((pwd, index) => (
              <tr key={pwd.pwd_id} style={{ 
                borderBottom: index < pwdList.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>
                  {pwd.users?.full_name || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  {pwd.users?.email || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  {pwd.users?.contact_number || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  {pwd.disability_category || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
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
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '500',
                    backgroundColor: pwd.needs_medical_device ? '#fee2e2' : '#e5e7eb',
                    color: pwd.needs_medical_device ? '#991b1b' : '#4b5563'
                  }}>
                    {pwd.needs_medical_device ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {new Date(pwd.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
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