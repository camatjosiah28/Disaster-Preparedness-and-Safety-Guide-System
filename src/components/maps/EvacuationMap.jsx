import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../supabaseClient';
import 'leaflet/dist/leaflet.css';

// Import professional icons
import { MdPhone, MdGroup, MdLocationOn, MdDirections, MdSchool, MdBusiness, MdSportsCricket, MdShield } from 'react-icons/md';
import { FaExternalLinkAlt } from 'react-icons/fa';

// IMPORTANT: Fix para sa Leaflet markers sa production
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (status) => {
  const color = status?.toLowerCase() === 'closed' ? '#f44336' : '#4caf50';
  return L.divIcon({
    html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    popupAnchor: [0, -14]
  });
};

// Component for zooming to a specific center - WITHOUT shaking
function ZoomController({ center, mapRef }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.latitude && center.longitude && map) {
      map.flyTo([center.latitude, center.longitude], 15, {
        duration: 1,
        easeLinearity: 0.5
      });
    }
  }, [center, map]);
  
  return null;
}

const EvacuationMap = ({ refreshTrigger }) => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const mapRef = useRef(null);

  const fetchCenters = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evacuation_centers')
        .select('*')
        .order('center_name');
      
      if (error) throw error;
      console.log('Fetched centers:', data);
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
    let searchQuery = '';
    
    if (center.plus_code) {
      searchQuery = center.plus_code;
      console.log('Opening with plus_code:', searchQuery);
    } 
    else if (center.address) {
      searchQuery = center.address;
      console.log('Opening with address:', searchQuery);
    }
    else if (center.latitude && center.longitude) {
      searchQuery = `${center.latitude},${center.longitude}`;
      console.log('Opening with coordinates:', searchQuery);
    }
    else {
      searchQuery = center.center_name;
      console.log('Opening with center name:', searchQuery);
    }
    
    const encodedQuery = encodeURIComponent(searchQuery);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`, '_blank');
  };

  const zoomToCenter = (center) => {
    setSelectedCenter(center);
  };

  const getCenterIcon = (centerName) => {
    const name = centerName?.toLowerCase() || '';
    
    if (name.includes('school')) {
      return <MdSchool size={24} color="#2196f3" />;
    }
    if (name.includes('barangay')) {
      return <MdBusiness size={24} color="#4caf50" />;
    }
    if (name.includes('sports') || name.includes('gym')) {
      return <MdSportsCricket size={24} color="#ff9800" />;
    }
    return <MdShield size={24} color="#f44336" />;
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open': return '#4caf50';
      case 'closed': return '#f44336';
      case 'full': return '#ff9800';
      default: return '#4caf50';
    }
  };

  if (loading) {
    return <div className="loading-map" style={{ textAlign: 'center', padding: '40px' }}>Loading evacuation centers...</div>;
  }

  return (
    <div className="evacuation-map-container">
      {/* Map Container - Responsive height */}
      <div className="map-wrapper" style={{ marginBottom: '30px' }}>
        <MapContainer 
          center={[14.4190, 120.9350]} 
          zoom={13} 
          style={{ height: '100%', width: '100%', borderRadius: '10px' }}
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {centers.map((center) => (
            center.latitude && center.longitude && (
              <Marker 
                key={center.center_id}
                position={[center.latitude, center.longitude]}
                icon={createCustomIcon(center.status)}
                eventHandlers={{
                  click: () => {
                    setSelectedCenter(center);
                  }
                }}
              >
                <Popup>
                  <div className="evac-popup" style={{ minWidth: '220px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{center.center_name}</h3>
                    <p className="address" style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      <MdLocationOn size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {center.address}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px' }}>
                      <strong>Contact:</strong> {center.contact_number || 'N/A'}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px' }}>
                      <strong>Capacity:</strong> {center.capacity} persons
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px' }}>
                      <strong>Status:</strong> 
                      <span style={{ 
                        color: getStatusColor(center.status),
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {center.status || 'Open'}
                      </span>
                    </p>
                    <button 
                      className="directions-btn"
                      onClick={() => openGoogleMaps(center)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '10px',
                        padding: '8px 12px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        width: '100%',
                        justifyContent: 'center',
                        fontWeight: '500',
                        fontSize: '13px'
                      }}
                    >
                      <MdDirections size={16} />
                      Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          
          {selectedCenter && (
            <ZoomController center={selectedCenter} mapRef={mapRef} />
          )}
        </MapContainer>
      </div>

      {/* List of Evacuation Centers */}
      <div className="centers-list">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <MdLocationOn size={24} color="#f44336" />
          List of Evacuation Centers
        </h3>
        <div className="centers-grid">
          {centers.map((center) => (
            <div 
              key={center.center_id} 
              className="center-card" 
              onClick={() => zoomToCenter(center)}
              style={{
                backgroundColor: selectedCenter?.center_id === center.center_id ? '#e3f2fd' : 'white',
                borderRadius: '10px',
                padding: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, background-color 0.2s',
                cursor: 'pointer',
                border: selectedCenter?.center_id === center.center_id ? '2px solid #2196f3' : '1px solid #e0e0e0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div className="center-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div className="center-icon" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
                  {getCenterIcon(center.center_name)}
                </div>
                <span 
                  className={`status-badge ${center.status?.toLowerCase() || 'open'}`}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: getStatusColor(center.status),
                    color: 'white'
                  }}
                >
                  {center.status || 'Open'}
                </span>
              </div>
              <h4 style={{ margin: '10px 0 8px 0', fontSize: '1rem', fontWeight: 'bold' }}>{center.center_name}</h4>
              <p className="center-address" style={{ margin: '5px 0', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                <MdLocationOn size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{center.address}</span>
              </p>
              <p className="center-capacity" style={{ margin: '5px 0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MdGroup size={14} color="#4caf50" />
                <span>{center.capacity} persons</span>
              </p>
              {center.contact_number && (
                <p className="center-contact" style={{ margin: '5px 0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MdPhone size={14} color="#2196f3" />
                  <span>{center.contact_number}</span>
                </p>
              )}
              {center.plus_code && (
                <p className="center-plus-code" style={{ margin: '5px 0', fontSize: '10px', color: '#999', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MdLocationOn size={12} />
                  <span>Plus Code: {center.plus_code}</span>
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openGoogleMaps(center);
                }}
                className="google-maps-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
              >
                <MdDirections size={16} color="white" />
                View on Google Maps
                <FaExternalLinkAlt size={10} color="white" style={{ opacity: 0.7 }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvacuationMap;