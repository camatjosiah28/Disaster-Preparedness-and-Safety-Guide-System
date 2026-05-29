import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const EmergencyContacts = ({ refreshTrigger }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('agency_name');
    
    if (error) {
      console.error('Error fetching contacts:', error);
    } else if (data) {
      const filteredData = data.filter(contact => 
        !contact.agency_name.toLowerCase().includes('imus city rescue') &&
        !contact.agency_name.toLowerCase().includes('rescue')
      );
      setContacts(filteredData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, refreshTrigger]);

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

  const getLogoPath = (agencyName) => {
    const name = agencyName.toLowerCase();

    if (name.includes('alapan 1-a') || name.includes('alapan 1a')) {
      return '/logos/alapan 1-a.png';
    }
    if (name.includes('alapan 1-b') || name.includes('alapan 1b')) {
      return '/logos/alapan 1-b.png';
    }
    if (name.includes('alapan 1-c') || name.includes('alapan 1c')) {
      return '/logos/alapan 1-c.png';
    }
    
    if (name.includes('fire') || name.includes('bfp') || name.includes('bureau of fire')) {
      return '/logos/bfp-logo.png';
    }
    if (name.includes('police') || name.includes('pnp') || name.includes('station')) {
      return '/logos/pnp-logo.png';
    }
    if (name.includes('disaster') || name.includes('cdrrmo') || name.includes('drrm') || name.includes('risk reduction')) {
      return '/logos/cdrrmo-logo.png';
    }
    if (name.includes('911') || name.includes('national emergency') || name.includes('national hotline')) {
      return '/logos/911-logo.png';
    }
    
    return null;
  };

  const getFallbackIcon = (agencyName) => {
    const name = agencyName.toLowerCase();
    if (name.includes('alapan')) return 'BRGY';
    if (name.includes('fire')) return 'FIRE';
    if (name.includes('police')) return 'PNP';
    if (name.includes('disaster')) return 'DRRM';
    if (name.includes('911')) return '911';
    return 'HOTLINE';
  };

  const handleImageError = (contactId) => {
    setImageErrors(prev => ({ ...prev, [contactId]: true }));
  };

  if (loading) {
    return (
      <div className="loading-contacts" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p>Loading emergency contacts...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return <p className="no-data" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No emergency contacts available.</p>;
  }

  return (
    <div className="contacts-container">
      <div className="contacts-grid">
        {contacts.map(contact => {
          const logoPath = getLogoPath(contact.agency_name);
          const showFallback = imageErrors[contact.contact_id] || !logoPath;
          
          return (
            <div key={contact.contact_id} className="contact-card" style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}>
              <div className="contact-icon-wrapper" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                {!showFallback ? (
                  <img 
                    src={logoPath}
                    alt={`${contact.agency_name} logo`}
                    className="official-logo"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'contain'
                    }}
                    onError={() => handleImageError(contact.contact_id)}
                  />
                ) : (
                  <div className="fallback-icon" style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#f97316'
                  }}>
                    {getFallbackIcon(contact.agency_name)}
                  </div>
                )}
              </div>
              <div className="contact-info" style={{ textAlign: 'center' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#111827'
                }}>{contact.agency_name}</h4>
                <p className="contact-number" style={{
                  fontSize: '14px',
                  color: '#f97316',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>{contact.contact_number}</p>
                {contact.description && (
                  <p className="contact-description" style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>{contact.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyContacts;