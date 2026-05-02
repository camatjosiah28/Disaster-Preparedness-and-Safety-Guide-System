import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Phone, Users } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const CentersManagement = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [formData, setFormData] = useState({
    center_name: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    contact_number: '',
    status: 'Open'
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evacuation_centers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCenters(data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        const { error } = await supabase
          .from('evacuation_centers')
          .update(formData)
          .eq('center_id', editingCenter.center_id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('evacuation_centers')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      fetchCenters();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving center:', error);
      alert('Error saving center. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this center?')) {
      try {
        const { error } = await supabase
          .from('evacuation_centers')
          .delete()
          .eq('center_id', id);
        
        if (error) throw error;
        fetchCenters();
      } catch (error) {
        console.error('Error deleting center:', error);
        alert('Error deleting center. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setEditingCenter(null);
    setFormData({
      center_name: '',
      address: '',
      latitude: '',
      longitude: '',
      capacity: '',
      contact_number: '',
      status: 'Open'
    });
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2>Evacuation Centers</h2>
          <p style={{ color: 'var(--gray-dark)' }}>Manage all evacuation centers and their status</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="admin-btn admin-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add New Center
        </button>
      </div>

      <div className="centers-grid">
        {centers.map((center) => (
          <div key={center.center_id} className="center-card safe-center">
            <div className="center-header">
              <div className="center-icon">🏥</div>
              <div className={`status-badge ${center.status === 'Open' ? 'open' : 'closed'}`}>
                {center.status || 'Open'}
              </div>
            </div>
            <h4>{center.center_name}</h4>
            <div className="center-address">{center.address}</div>
            {center.contact_number && (
              <div style={{ margin: '10px 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={14} /> {center.contact_number}
              </div>
            )}
            <div className="center-capacity">
              <Users size={14} /> {center.current_occupancy || 0} / {center.capacity || 0} occupants
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setEditingCenter(center);
                  setFormData(center);
                  setShowModal(true);
                }}
                className="admin-action-icon edit"
                title="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(center.center_id)}
                className="admin-action-icon delete"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingCenter ? 'Edit Center' : 'Add New Center'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Center Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={formData.center_name}
                    onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Address *</label>
                  <textarea
                    required
                    rows="2"
                    className="admin-form-textarea"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="admin-form-input"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="admin-form-input"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Capacity *</label>
                    <input
                      type="number"
                      required
                      className="admin-form-input"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Contact Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    className="admin-form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingCenter ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentersManagement;