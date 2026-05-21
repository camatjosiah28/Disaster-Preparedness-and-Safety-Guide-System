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
    <div className="emergency-contacts-management" style={{ padding: '0 16px' }}>
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
          <h2>Emergency Contacts</h2>
          <p style={{ color: 'var(--gray-dark)' }}>Manage emergency hotlines and contacts</p>
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
          <Plus size={18} /> Add Contact
        </button>
      </div>

      {/* Table Container - Responsive with horizontal scroll */}
      <div className="admin-table-container" style={{ 
        overflowX: 'auto', 
        WebkitOverflowScrolling: 'touch',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <table className="admin-table" style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          minWidth: '500px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left' }}>Agency Name</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Contact Number</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr key={contact.contact_id} style={{ 
                borderBottom: index < contacts.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>{contact.agency_name}</td>
                <td style={{ padding: '16px' }}>{contact.contact_number}</td>
                <td style={{ padding: '16px' }}>{contact.description || '-'}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => {
                      setEditingContact(contact);
                      setFormData(contact);
                      setShowModal(true);
                    }}
                    className="admin-action-icon edit"
                    style={{ 
                      background: '#3b82f6', 
                      border: 'none', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      marginRight: '8px',
                      color: 'white',
                      minWidth: '36px',
                      minHeight: '36px'
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.contact_id)}
                    className="admin-action-icon delete"
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

      {contacts.length === 0 && (
        <div className="no-data" style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          No emergency contacts found. Click "Add Contact" to create one.
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
            width: '500px',
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
              <h3 style={{ margin: 0 }}>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h3>
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
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Agency Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Contact Number *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  />
                </div>
                
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                  <textarea
                    rows="3"
                    className="admin-form-textarea"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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