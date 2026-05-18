import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../supabaseClient';
import 'leaflet/dist/leaflet.css';

// IMPORTANT: Fix para sa Leaflet markers sa production
// Ito ang pumipigil sa "c is not a function" error
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
    }
  };

  if (loading) {
    return <div className="loading-map">Loading evacuation centers...</div>;
  }

  return (
    <div>
      {/* Map Container */}
      <div className="map-wrapper">
        <MapContainer 
          center={[14.4190, 120.9350]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {centers.map((center) => (
            center.latitude && center.longitude && (
              <Marker 
                key={center.center_id}
                position={[center.latitude, center.longitude]}
              >
                <Popup>
                  <div className="evac-popup">
                    <h3>{center.center_name}</h3>
                    <p className="address">{center.address}</p>
                    <p><strong>📞 Contact:</strong> {center.contact_number || 'N/A'}</p>
                    <p><strong>👥 Capacity:</strong> {center.capacity} persons</p>
                    <p><strong>📊 Status:</strong> <span className={`status-${center.status?.toLowerCase() || 'open'}`}>{center.status || 'Open'}</span></p>
                    <button 
                      className="directions-btn"
                      onClick={() => openGoogleMaps(center)}
                    >
                      🗺️ Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* List of Evacuation Centers */}
      <div className="centers-list">
        <h3>📋 List of Evacuation Centers</h3>
        <div className="centers-grid">
          {centers.map((center) => (
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
                <p className="center-contact">📞 {center.contact_number}</p>
              )}
              <button
                onClick={() => openGoogleMaps(center)}
                className="google-maps-btn"
              >
                🗺️ View on Google Maps
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvacuationMap;