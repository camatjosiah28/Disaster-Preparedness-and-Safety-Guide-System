import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Shield, UserX } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    role: 'resident'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
      
      alert(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const { data: pwdData } = await supabase
          .from('pwd_registry')
          .select('pwd_id')
          .eq('user_id', userId);
        
        if (pwdData && pwdData.length > 0) {
          await supabase
            .from('pwd_registry')
            .delete()
            .eq('user_id', userId);
        }
        
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('user_id', userId);
        
        if (error) throw error;
        
        fetchUsers();
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin':
        return 'admin-status-active';
      case 'pwd':
        return 'admin-status-pending';
      default:
        return 'admin-status-inactive';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="users-management-container" style={{ padding: '0 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <h2>Users Management</h2>
        <p style={{ color: 'var(--gray-dark)' }}>Manage system users and their roles</p>
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
          minWidth: '900px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Full Name</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Contact Number</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Disability Type</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Registered Date</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
             </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.user_id} style={{ 
                borderBottom: index < users.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>
                  {user.user_id}
                </td>
                <td style={{ padding: '16px' }}>
                  {user.full_name}
                </td>
                <td style={{ padding: '16px' }}>
                  {user.email}
                </td>
                <td style={{ padding: '16px' }}>
                  {user.contact_number || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  <select
                    value={user.role || 'resident'}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    className={`admin-status ${getRoleBadgeClass(user.role)}`}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      border: '1px solid currentColor',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: 'white',
                      minWidth: '100px'
                    }}
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                    <option value="pwd">PWD</option>
                  </select>
                </td>
                <td style={{ padding: '16px' }}>
                  {user.disability_type || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDeleteUser(user.user_id)}
                    className="admin-action-icon delete"
                    title="Delete User"
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'white',
                      minWidth: '36px',
                      minHeight: '36px'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="no-data" style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginTop: '20px',
          color: '#6b7280'
        }}>
          No users found
        </div>
      )}

      {/* Modal - Responsive */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '450px',
            maxWidth: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="admin-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0 }}>Edit User Role</h3>
              <button 
                className="admin-modal-close" 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  minWidth: '36px',
                  minHeight: '36px'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingUser) {
                handleRoleChange(editingUser.user_id, formData.role);
                setShowModal(false);
              }
            }}>
              <div className="admin-modal-body" style={{ padding: '20px' }}>
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    User: {editingUser?.full_name}
                  </label>
                  <select
                    className="admin-form-input"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                    <option value="pwd">PWD</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer" style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                flexWrap: 'wrap'
              }}>
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e5e7eb',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    minHeight: '44px'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    minHeight: '44px'
                  }}
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;