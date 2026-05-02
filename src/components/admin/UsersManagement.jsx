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
      
      // Update local state
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
        // First check if user has PWD registry entry
        const { data: pwdData } = await supabase
          .from('pwd_registry')
          .select('pwd_id')
          .eq('user_id', userId);
        
        // Delete PWD registry if exists
        if (pwdData && pwdData.length > 0) {
          await supabase
            .from('pwd_registry')
            .delete()
            .eq('user_id', userId);
        }
        
        // Delete user
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
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h2>Users Management</h2>
        <p style={{ color: 'var(--gray-dark)' }}>Manage system users and their roles</p>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Role</th>
              <th>Disability Type</th>
              <th>Registered Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.contact_number || 'N/A'}</td>
                <td>
                  <select
                    value={user.role || 'resident'}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    className={`admin-status ${getRoleBadgeClass(user.role)}`}
                    style={{ 
                      padding: '4px 8px', 
                      borderRadius: '20px', 
                      border: '1px solid currentColor',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                    <option value="pwd">PWD</option>
                  </select>
                </td>
                <td>{user.disability_type || 'N/A'}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.user_id)}
                    className="admin-action-icon delete"
                    title="Delete User"
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
        <div className="no-data">No users found</div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit User Role</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingUser) {
                handleRoleChange(editingUser.user_id, formData.role);
                setShowModal(false);
              }
            }}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">User: {editingUser?.full_name}</label>
                  <select
                    className="admin-form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                    <option value="pwd">PWD</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
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