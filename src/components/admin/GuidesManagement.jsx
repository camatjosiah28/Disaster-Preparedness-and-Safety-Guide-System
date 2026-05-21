import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Youtube, Image } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const GuidesManagement = () => {
  const { userProfile } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    infographic_url: ''
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('preparedness_guides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuide) {
        const { error } = await supabase
          .from('preparedness_guides')
          .update(formData)
          .eq('guide_id', editingGuide.guide_id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('preparedness_guides')
          .insert([{ ...formData, created_by: userProfile?.user_id }]);
        
        if (error) throw error;
      }
      
      fetchGuides();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving guide:', error);
      alert('Error saving guide. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      try {
        const { error } = await supabase
          .from('preparedness_guides')
          .delete()
          .eq('guide_id', id);
        
        if (error) throw error;
        fetchGuides();
      } catch (error) {
        console.error('Error deleting guide:', error);
        alert('Error deleting guide. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setEditingGuide(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      video_url: '',
      infographic_url: ''
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
    <div className="guides-management-container" style={{ padding: '0 16px' }}>
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
          <h2>Preparedness Guides</h2>
          <p style={{ color: 'var(--gray-dark)' }}>Manage disaster preparedness guides and resources</p>
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
          <Plus size={18} /> Add Guide
        </button>
      </div>

      {/* Guides Grid - Responsive */}
      <div className="guides-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '20px' 
      }}>
        {guides.map((guide) => (
          <div key={guide.guide_id} className="guide-card" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>{guide.title}</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>{guide.description}</p>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              {guide.video_url && (
                <a 
                  href={guide.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="video-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f97316',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <Youtube size={16} /> Watch Video
                </a>
              )}
              {guide.infographic_url && (
                <a 
                  href={guide.infographic_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="video-link" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <Image size={16} /> View Infographic
                </a>
              )}
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setEditingGuide(guide);
                  setFormData(guide);
                  setShowModal(true);
                }}
                className="admin-action-icon edit"
                title="Edit"
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'white',
                  minWidth: '36px',
                  minHeight: '36px'
                }}
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(guide.guide_id)}
                className="admin-action-icon delete"
                title="Delete"
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
            </div>
          </div>
        ))}
      </div>

      {guides.length === 0 && (
        <div className="no-data" style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginTop: '20px',
          color: '#6b7280'
        }}>
          No guides found. Create your first preparedness guide!
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
            width: '550px',
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
              <h3 style={{ margin: 0 }}>{editingGuide ? 'Edit Guide' : 'Add New Guide'}</h3>
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
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ padding: '20px' }}>
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
                  <textarea
                    required
                    rows="2"
                    className="admin-form-textarea"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Content</label>
                  <textarea
                    rows="4"
                    className="admin-form-textarea"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Detailed guide content..."
                  />
                </div>
                
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Video URL (YouTube)</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Infographic URL</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                    value={formData.infographic_url}
                    onChange={(e) => setFormData({ ...formData, infographic_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
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
                  {editingGuide ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidesManagement;