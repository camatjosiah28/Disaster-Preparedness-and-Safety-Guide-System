import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Phone, Users, MapPin, Navigation } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const CentersManagement = ({ refreshTrigger }) => {
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

  const fetchCenters = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters, refreshTrigger]);

  const openGoogleMaps = (center) => {
    if (center.latitude && center.longitude) {
      window.open(`https://www.google.com/maps?q=${center.latitude},${center.longitude}`, '_blank');
    } else if (center.address) {
      const encodedAddress = encodeURIComponent(center.address);
      window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
    } else {
      alert('No location data available for this center.');
    }
  };

  const openWaze = (center) => {
    if (center.latitude && center.longitude) {
      window.open(`https://www.waze.com/ul?ll=${center.latitude},${center.longitude}&navigate=yes`, '_blank');
    } else if (center.address) {
      const encodedAddress = encodeURIComponent(center.address);
      window.open(`https://www.waze.com/ul?q=${encodedAddress}&navigate=yes`, '_blank');
    } else {
      alert('No location data available for this center.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    try {
      if (editingCenter) {
        // Update existing center
        const { error } = await supabase
          .from('evacuation_centers')
          .update({
            center_name: formData.center_name,
            address: formData.address,
            latitude: formData.latitude || null,
            longitude: formData.longitude || null,
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            contact_number: formData.contact_number || null,
            status: formData.status
          })
          .eq('center_id', editingCenter.center_id);
        
        if (error) throw error;
        console.log('Center updated successfully');
      } else {
        // Insert new center
        const { error } = await supabase
          .from('evacuation_centers')
          .insert([{
            center_name: formData.center_name,
            address: formData.address,
            latitude: formData.latitude || null,
            longitude: formData.longitude || null,
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            contact_number: formData.contact_number || null,
            status: formData.status
          }]);
        
        if (error) throw error;
        console.log('Center created successfully');
      }
      
      // Refresh the list
      await fetchCenters();
      
      // Close modal and reset form
      setShowModal(false);
      resetForm();
      
    } catch (error) {
      console.error('Error saving center:', error);
      alert('Error saving center: ' + error.message);
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

  const openModal = (center = null) => {
    if (center) {
      setEditingCenter(center);
      setFormData({
        center_name: center.center_name || '',
        address: center.address || '',
        latitude: center.latitude || '',
        longitude: center.longitude || '',
        capacity: center.capacity || '',
        contact_number: center.contact_number || '',
        status: center.status || 'Open'
      });
    } else {
      resetForm();
    }
    setShowModal(true);
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
          onClick={() => openModal()}
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
              <div className={`status-badge ${center.status === 'Open' ? 'open' : center.status === 'Full' ? 'full' : 'closed'}`}>
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
            
            {/* Map Buttons */}
            {(center.latitude || center.address) && (
              <div style={{ 
                marginTop: '15px', 
                display: 'flex', 
                gap: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button
                  onClick={() => openGoogleMaps(center)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '8px',
                    background: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <MapPin size={14} /> Google Maps
                </button>
                <button
                  onClick={() => openWaze(center)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '8px',
                    background: '#33ccff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <Navigation size={14} /> Waze
                </button>
              </div>
            )}
            
            {/* Original Action Buttons Design */}
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => openModal(center)}
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

      {centers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p>No evacuation centers found. Click "Add New Center" to create one.</p>
        </div>
      )}

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