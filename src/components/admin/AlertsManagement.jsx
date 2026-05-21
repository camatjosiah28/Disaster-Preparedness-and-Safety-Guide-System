import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const AlertsManagement = () => {
  const { userProfile } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    alert_type: 'Warning',
    status: 'Active'
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAlert) {
        const { error } = await supabase
          .from('alerts')
          .update(formData)
          .eq('alert_id', editingAlert.alert_id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alerts')
          .insert([{ ...formData, created_by: userProfile?.user_id }]);
        
        if (error) throw error;
      }
      
      fetchAlerts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving alert:', error);
      alert('Error saving alert. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        const { error } = await supabase
          .from('alerts')
          .delete()
          .eq('alert_id', id);
        
        if (error) throw error;
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingAlert(null);
    setFormData({
      title: '',
      message: '',
      alert_type: 'Warning',
      status: 'Active'
    });
  };

  const getAlertTypeClass = (type) => {
    switch(type) {
      case 'Emergency': return 'alert-evacuation';
      case 'Warning': return 'alert-flood';
      default: return 'alert-weather';
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
    <div className="alerts-management-container">
      {/* Header - Responsive */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2>Alerts Management</h2>
          <p style={{ color: 'var(--gray-dark)' }}>Create and manage emergency alerts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="admin-btn admin-btn-primary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            minHeight: '44px'
          }}
        >
          <Plus size={18} /> Send Alert
        </button>
      </div>

      {/* Alerts List - Responsive */}
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.alert_id} className={`alert-card ${getAlertTypeClass(alert.alert_type)}`} style={{
            marginBottom: '16px',
            borderRadius: '8px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div className="alert-badge weather">{alert.alert_type}</div>
                <h3 style={{ margin: '10px 0' }}>{alert.title}</h3>
                <p>{alert.message}</p>
                <small>Created: {new Date(alert.created_at).toLocaleString()}</small>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span className={`admin-status ${alert.status === 'Active' ? 'admin-status-active' : 'admin-status-inactive'}`}>
                  {alert.status}
                </span>
                <button
                  onClick={() => {
                    setEditingAlert(alert);
                    setFormData(alert);
                    setShowModal(true);
                  }}
                  className="admin-action-icon edit"
                  style={{ minHeight: '36px', minWidth: '36px' }}
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(alert.alert_id)}
                  className="admin-action-icon delete"
                  style={{ minHeight: '36px', minWidth: '36px' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="no-data">No alerts found. Create your first alert!</div>
      )}

      {/* Modal - Responsive */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{
            width: '90%',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <div className="admin-modal-header">
              <h3>{editingAlert ? 'Edit Alert' : 'Send New Alert'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Alert Title *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Alert Type *</label>
                  <select
                    required
                    className="admin-form-input"
                    value={formData.alert_type}
                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Information</option>
                  </select>
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Message *</label>
                  <textarea
                    required
                    rows="4"
                    className="admin-form-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    className="admin-form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer" style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingAlert ? 'Update' : 'Send Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsManagement;