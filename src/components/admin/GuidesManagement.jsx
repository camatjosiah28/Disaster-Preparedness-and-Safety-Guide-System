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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
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
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add Guide
        </button>
      </div>

      <div className="guides-grid">
        {guides.map((guide) => (
          <div key={guide.guide_id} className="guide-card">
            <h3>{guide.title}</h3>
            <p>{guide.description}</p>
            {guide.video_url && (
              <a href={guide.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
                <Youtube size={16} /> Watch Video
              </a>
            )}
            {guide.infographic_url && (
              <a href={guide.infographic_url} target="_blank" rel="noopener noreferrer" className="video-link" style={{ marginLeft: '10px' }}>
                <Image size={16} /> View Infographic
              </a>
            )}
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setEditingGuide(guide);
                  setFormData(guide);
                  setShowModal(true);
                }}
                className="admin-action-icon edit"
                title="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(guide.guide_id)}
                className="admin-action-icon delete"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {guides.length === 0 && (
        <div className="no-data">No guides found. Create your first preparedness guide!</div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingGuide ? 'Edit Guide' : 'Add New Guide'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Title *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Description *</label>
                  <textarea
                    required
                    rows="2"
                    className="admin-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Content</label>
                  <textarea
                    rows="4"
                    className="admin-form-textarea"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Detailed guide content..."
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Video URL (YouTube)</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Infographic URL</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    value={formData.infographic_url}
                    onChange={(e) => setFormData({ ...formData, infographic_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
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