import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const EmergencyContactsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    agency_name: '',
    contact_number: '',
    description: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('contact_id', { ascending: true });
      
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update(formData)
          .eq('contact_id', editingContact.contact_id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      fetchContacts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const { error } = await supabase
          .from('emergency_contacts')
          .delete()
          .eq('contact_id', id);
        
        if (error) throw error;
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingContact(null);
    setFormData({
      agency_name: '',
      contact_number: '',
      description: ''
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
          <h2>Emergency Contacts</h2>
          <p style={{ color: 'var(--gray-dark)' }}>Manage emergency hotlines and contacts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="admin-btn admin-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Agency Name</th>
              <th>Contact Number</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.contact_id}>
                <td>{contact.agency_name}</td>
                <td>{contact.contact_number}</td>
                <td>{contact.description}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditingContact(contact);
                      setFormData(contact);
                      setShowModal(true);
                    }}
                    className="admin-action-icon edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.contact_id)}
                    className="admin-action-icon delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Agency Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Contact Number *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    rows="3"
                    className="admin-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingContact ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsManagement;