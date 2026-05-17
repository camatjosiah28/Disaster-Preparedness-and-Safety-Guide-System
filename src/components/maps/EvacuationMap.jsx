import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../supabaseClient';
import { getCenterIcon, getDirections } from '../../utils/mapIcons';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';

const EvacuationMap = ({ refreshTrigger }) => {
  const [centers, setCenters] = useState([]);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select('*')
      .order('center_name');
    
    if (error) {
      console.error('Error fetching centers:', error);
    } else if (data) {
      setCenters(data);
    }
    setLoading(false);
  }, []);

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    fetchCenters();
  }, [fetchCenters, refreshTrigger]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCenters();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCenters]);

  // Real-time subscription for automatic updates
  useEffect(() => {
    const subscription = supabase
      .channel('evacuation_centers_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'evacuation_centers'
        }, 
        () => {
          fetchCenters();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCenters]);

  // Function to open Google Maps
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

  // Function to open Waze
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

  // Function to get driving directions from current location
  const getDrivingDirections = (center) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (center.latitude && center.longitude) {
            window.open(`https://www.google.com/maps/dir/${latitude},${longitude}/${center.latitude},${center.longitude}`, '_blank');
          } else {
            openGoogleMaps(center);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          openGoogleMaps(center);
        }
      );
    } else {
      openGoogleMaps(center);
    }
  };

  if (loading && centers.length === 0) {
    return <div className="loading-map">Loading evacuation centers...</div>;
  }

  return (
    <>
      <div className="map-wrapper">
        <MapContainer 
          center={[14.4190, 120.9350]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMap}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapLegend />
          
          {centers.map(center => (
            <Marker 
              key={center.center_id}
              position={[center.latitude, center.longitude]}
              icon={getCenterIcon(center.center_name)}
            >
              <Popup>
                <div className="evac-popup">
                  <h3>{center.center_name}</h3>
                  <p className="address">{center.address}</p>
                  <p><strong>📞 Contact:</strong> {center.contact_number || 'N/A'}</p>
                  <p><strong>👥 Capacity:</strong> {center.capacity} persons</p>
                  <p><strong>📊 Status:</strong> <span className={`status-${center.status.toLowerCase()}`}>{center.status}</span></p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button 
                      className="directions-btn"
                      onClick={() => getDrivingDirections(center)}
                      style={{ flex: 1 }}
                    >
                      🚗 Get Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="centers-list">
        <h3>📋 List of Evacuation Centers</h3>
        <div className="centers-grid">
          {centers.map(center => (
            <div key={center.center_id} className="center-card">
              <div className="center-header">
                <span className="center-icon">
                  {center.center_name.toLowerCase().includes('school') ? '🏫' : 
                   center.center_name.toLowerCase().includes('barangay') ? '🏛️' : 
                   center.center_name.toLowerCase().includes('sports') ? '🏟️' : '🛡️'}
                </span>
                <span className={`status-badge ${center.status.toLowerCase()}`}>{center.status}</span>
              </div>
              <h4>{center.center_name}</h4>
              <p className="center-address">{center.address}</p>
              <p className="center-capacity">👥 {center.capacity} persons</p>
              
              {/* Google Maps and Waze Buttons */}
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
                    padding: '8px 12px',
                    background: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#3367d6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#4285f4'}
                >
                  🗺️ Google Maps
                </button>
                <button
                  onClick={() => openWaze(center)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#33ccff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#00b8e6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#33ccff'}
                >
                  🧭 Waze
                </button>
              </div>

              {/* Directions from current location button */}
              <button
                onClick={() => getDrivingDirections(center)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#218838'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#28a745'}
              >
                🚗 Get Directions from My Location
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EvacuationMap;