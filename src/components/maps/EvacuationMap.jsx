import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const EvacuationMap = ({ refreshTrigger }) => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCenters = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evacuation_centers')
        .select('*')
        .order('center_name');
      
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

  if (loading) {
    return <div className="loading-map">Loading evacuation centers...</div>;
  }

  return (
    <>
      <div className="centers-list">
        <h3>📋 List of Evacuation Centers</h3>
        <div className="centers-grid">
          {centers.map(center => (
            <div key={center.center_id} className="center-card">
              <div className="center-header">
                <span className="center-icon">
                  {center.center_name?.toLowerCase().includes('school') ? '🏫' : 
                   center.center_name?.toLowerCase().includes('barangay') ? '🏛️' : 
                   center.center_name?.toLowerCase().includes('sports') ? '🏟️' : '🛡️'}
                </span>
                <span className={`status-badge ${center.status?.toLowerCase() || 'open'}`}>
                  {center.status || 'Open'}
                </span>
              </div>
              <h4>{center.center_name}</h4>
              <p className="center-address">{center.address}</p>
              <p className="center-capacity">👥 {center.capacity} persons</p>
              {center.contact_number && (
                <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#666' }}>
                  📞 {center.contact_number}
                </p>
              )}
              
              {/* Google Maps Button */}
              <button
                onClick={() => openGoogleMaps(center)}
                style={{
                  width: '100%',
                  marginTop: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3367d6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#4285f4'}
              >
                🗺️ View on Google Maps
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Tips */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fff3cd',
        borderRadius: '12px',
        border: '1px solid #ffecb5'
      }}>
        <h4 style={{ margin: '0 0 10px', color: '#856404' }}>🚨 Emergency Tips</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
          <li>Alamin ang pinakamalapit na evacuation center sa inyong lugar</li>
          <li>I-save ang mga emergency hotlines sa iyong phone</li>
          <li>Maghanda ng emergency bag na may first aid, tubig, at pagkain</li>
          <li>Sundin ang mga anunsyo mula sa barangay at lokal na pamahalaan</li>
        </ul>
      </div>
    </>
  );
};

export default EvacuationMap;