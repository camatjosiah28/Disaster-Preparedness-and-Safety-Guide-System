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
                  
                  <button 
                    className="directions-btn"
                    onClick={() => getDirections(center.latitude, center.longitude)}
                  >
                    🗺️ Get Directions
                  </button>
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EvacuationMap;