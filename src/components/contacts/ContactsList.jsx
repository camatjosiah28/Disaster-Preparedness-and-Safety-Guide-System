import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const ContactsList = ({ refreshTrigger }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('agency_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching contacts:', error);
    } else if (data) {
      setContacts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, refreshTrigger]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchContacts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchContacts]);

  if (loading && contacts.length === 0) {
    return <div>Loading contacts...</div>;
  }

  if (contacts.length === 0) {
    return <p>No emergency contacts available.</p>;
  }

  return (
    <div className="contacts-list">
      {contacts.map(contact => (
        <div key={contact.contact_id} className="contact-item">
          <strong>{contact.agency_name}:</strong> {contact.contact_number}
          {contact.description && <small> - {contact.description}</small>}
        </div>
      ))}
    </div>
  );
};

export default ContactsList;