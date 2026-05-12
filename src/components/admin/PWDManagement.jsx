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
    <div>
      <h2>PWD Registry</h2>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '25px' }}>
        List of registered Persons with Disabilities
      </p>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Disability Category</th>
              <th>Mobility Level</th>
              <th>Medical Device</th>
              <th>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {pwdList.map((pwd) => (
              <tr key={pwd.pwd_id}>
                <td>{pwd.users?.full_name || 'N/A'}</td>
                <td>{pwd.users?.email || 'N/A'}</td>
                <td>{pwd.users?.contact_number || 'N/A'}</td>
                <td>{pwd.disability_category || 'N/A'}</td>
                <td>{pwd.mobility_level || 'N/A'}</td>
                <td>{pwd.needs_medical_device ? 'Yes' : 'No'}</td>
                <td>{new Date(pwd.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pwdList.length === 0 && (
        <div className="no-data">No PWD registrations found</div>
      )}
    </div>
  );
};

export default PWDManagement;