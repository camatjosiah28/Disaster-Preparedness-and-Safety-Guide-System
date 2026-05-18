import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
// Import professional icons - same sa EvacuationMap
import { MdPhone, MdGroup, MdLocationOn, MdDirections, MdSchool, MdBusiness, MdSportsCricket, MdShield, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { FaExternalLinkAlt, FaGoogle, FaWaze } from 'react-icons/fa';

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
    status: 'Open',
    plus_code: ''
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

  // Get icon based on center name - same sa EvacuationMap
  const getCenterIcon = (centerName) => {
    const name = centerName?.toLowerCase() || '';
    
    if (name.includes('school')) {
      return <MdSchool size={28} color="#2196f3" />;
    }
    if (name.includes('barangay')) {
      return <MdBusiness size={28} color="#4caf50" />;
    }
    if (name.includes('sports') || name.includes('gym')) {
      return <MdSportsCricket size={28} color="#ff9800" />;
    }
    return <MdShield size={28} color="#f44336" />;
  };

  // Get status color - same sa EvacuationMap
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open': return '#4caf50';
      case 'closed': return '#f44336';
      case 'full': return '#ff9800';
      default: return '#4caf50';
    }
  };

  const openGoogleMaps = (center) => {
    let searchQuery = '';
    
    if (center.plus_code) {
      searchQuery = center.plus_code;
    } else if (center.latitude && center.longitude) {
      searchQuery = `${center.latitude},${center.longitude}`;
    } else if (center.address) {
      searchQuery = center.address;
    } else {
      alert('No location data available for this center.');
      return;
    }
    
    const encodedQuery = encodeURIComponent(searchQuery);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`, '_blank');
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
    
    if (loading) return;
    
    try {
      const centerData = {
        center_name: formData.center_name,
        address: formData.address,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        contact_number: formData.contact_number || null,
        status: formData.status,
        plus_code: formData.plus_code || null
      };

      if (editingCenter) {
        const { error } = await supabase
          .from('evacuation_centers')
          .update(centerData)
          .eq('center_id', editingCenter.center_id);
        
        if (error) throw error;
        console.log('Center updated successfully');
      } else {
        const { error } = await supabase
          .from('evacuation_centers')
          .insert([centerData]);
        
        if (error) throw error;
        console.log('Center created successfully');
      }
      
      await fetchCenters();
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
      status: 'Open',
      plus_code: ''
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
        status: center.status || 'Open',
        plus_code: center.plus_code || ''
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
          <MdAdd size={18} /> Add New Center
        </button>
      </div>

      <div className="centers-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '20px' 
      }}>
        {centers.map((center) => (
          <div 
            key={center.center_id} 
            className="center-card safe-center"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
          >
            <div className="center-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="center-icon" style={{ 
                width: '55px', 
                height: '55px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '12px'
              }}>
                {getCenterIcon(center.center_name)}
              </div>
              <span 
                className={`status-badge ${center.status === 'Open' ? 'open' : center.status === 'Full' ? 'full' : 'closed'}`}
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: getStatusColor(center.status),
                  color: 'white'
                }}
              >
                {center.status || 'Open'}
              </span>
            </div>
            
            <h4 style={{ margin: '10px 0 5px 0', fontSize: '1rem', fontWeight: 'bold' }}>{center.center_name}</h4>
            
            <div className="center-address" style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '8px' }}>
              <MdLocationOn size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{center.address}</span>
            </div>
            
            {center.contact_number && (
              <div style={{ margin: '8px 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdPhone size={14} color="#2196f3" />
                <span>{center.contact_number}</span>
              </div>
            )}
            
            <div className="center-capacity" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '8px' }}>
              <MdGroup size={14} color="#4caf50" />
              <span>{center.current_occupancy || 0} / {center.capacity || 0} occupants</span>
            </div>
            
            {/* Display plus code if available */}
            {center.plus_code && (
              <div style={{ margin: '8px 0', fontSize: '10px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdLocationOn size={12} />
                <span>Plus Code: {center.plus_code}</span>
              </div>
            )}
            
            {/* Map Buttons */}
            {(center.latitude || center.address || center.plus_code) && (
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
                    gap: '6px',
                    padding: '8px',
                    background: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <FaGoogle size={14} /> Google Maps
                </button>
                <button
                  onClick={() => openWaze(center)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    background: '#33ccff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <FaWaze size={14} /> Waze
                </button>
              </div>
            )}
            
            {/* Action Buttons */}
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => openModal(center)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <MdEdit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(center.center_id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <MdDelete size={14} /> Delete
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
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Plus Code (Google Maps Plus Code)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g., CWC8+QF Imus, Cavite"
                    value={formData.plus_code}
                    onChange={(e) => setFormData({ ...formData, plus_code: e.target.value })}
                  />
                  <small style={{ color: '#666', fontSize: '11px' }}>Optional: Exact Google Maps location code</small>
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