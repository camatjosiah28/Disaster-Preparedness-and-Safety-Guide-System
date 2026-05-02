import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const EmergencyContacts = ({ refreshTrigger }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('agency_name');
    
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

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('emergency_contacts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'emergency_contacts'
        }, 
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchContacts]);

  if (loading) {
    return <div className="loading-contacts">Loading emergency contacts...</div>;
  }

  if (contacts.length === 0) {
    return <p className="no-data">No emergency contacts available.</p>;
  }

  return (
    <div className="contacts-grid">
      {contacts.map(contact => (
        <div key={contact.contact_id} className="contact-card">
          <span className="contact-icon">{contact.icon || '📞'}</span>
          <h4>{contact.agency_name}</h4>
          <p className="contact-number">{contact.contact_number}</p>
          <p className="contact-description">{contact.description}</p>
        </div>
      ))}
    </div>
  );
};

export default EmergencyContacts;