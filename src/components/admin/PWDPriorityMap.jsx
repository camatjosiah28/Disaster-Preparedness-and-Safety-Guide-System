import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../supabaseClient';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PWDPriorityMap = () => {
  const [pwdResidents, setPwdResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPWDWithLocations = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          user_id,
          full_name,
          email,
          contact_number,
          address,
          latitude,
          longitude,
          disability_type
        `)
        .eq('role', 'pwd')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) throw error;
      
      // Get PWD additional info
      const { data: pwdInfo } = await supabase
        .from('pwd_registry')
        .select('*');
      
      const pwdMap = {};
      pwdInfo?.forEach(info => {
        pwdMap[info.user_id] = info;
      });
      
      const combinedData = data.map(user => ({
        ...user,
        pwd_details: pwdMap[user.user_id] || null
      }));
      
      setPwdResidents(combinedData);
    } catch (error) {
      console.error('Error fetching PWD locations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPWDWithLocations();
  }, [fetchPWDWithLocations]);

  const getPriorityColor = (mobilityLevel) => {
    switch(mobilityLevel?.toLowerCase()) {
      case 'bedridden': return '#dc3545'; // Red - Critical
      case 'withassistance': return '#fd7e14'; // Orange - High
      case 'independent': return '#ffc107'; // Yellow - Medium
      default: return '#28a745'; // Green - Normal
    }
  };

  const getPriorityLabel = (mobilityLevel) => {
    switch(mobilityLevel?.toLowerCase()) {
      case 'bedridden': return 'CRITICAL (Priority 1)';
      case 'withassistance': return 'HIGH (Priority 2)';
      case 'independent': return 'MEDIUM (Priority 3)';
      default: return 'NORMAL (Priority 4)';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading PWD locations...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>🗺️ PWD Rescue Priority Map</h2>
        <p>Locations of PWD residents for emergency rescue prioritization</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ background: '#dc3545', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
          Critical: {pwdResidents.filter(p => p.pwd_details?.mobility_level?.toLowerCase() === 'bedridden').length}
        </div>
        <div style={{ background: '#fd7e14', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
          High: {pwdResidents.filter(p => p.pwd_details?.mobility_level?.toLowerCase() === 'withassistance').length}
        </div>
        <div style={{ background: '#ffc107', color: '#333', padding: '10px 20px', borderRadius: '8px' }}>
          Medium: {pwdResidents.filter(p => p.pwd_details?.mobility_level?.toLowerCase() === 'independent').length}
        </div>
        <div style={{ background: '#28a745', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
          Total Located: {pwdResidents.length}
        </div>
      </div>

      {/* Map */}
      <div className="map-wrapper" style={{ height: '500px', marginBottom: '20px' }}>
        <MapContainer 
          center={[14.4190, 120.9350]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {pwdResidents.map(pwd => (
            <Marker 
              key={pwd.user_id}
              position={[pwd.latitude, pwd.longitude]}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ color: '#d32f2f', marginBottom: '10px' }}>{pwd.full_name}</h3>
                  <p><strong>📍 Address:</strong> {pwd.address}</p>
                  <p><strong>📞 Contact:</strong> {pwd.contact_number || 'N/A'}</p>
                  <p><strong>♿ Disability:</strong> {pwd.disability_type || pwd.pwd_details?.disability_category || 'N/A'}</p>
                  <p><strong>🚶 Mobility:</strong> {pwd.pwd_details?.mobility_level || 'Independent'}</p>
                  <p style={{
                    background: getPriorityColor(pwd.pwd_details?.mobility_level),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    marginTop: '10px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {getPriorityLabel(pwd.pwd_details?.mobility_level)}
                  </p>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps?q=${pwd.latitude},${pwd.longitude}`, '_blank')}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '8px',
                      background: '#4285f4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    🗺️ Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List of PWD with locations */}
      <div className="admin-table-container">
        <h3 style={{ marginBottom: '15px' }}>📋 PWD Residents with Location</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Name</th>
              <th>Address</th>
              <th>Mobility</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pwdResidents.map(pwd => {
              const priority = getPriorityLabel(pwd.pwd_details?.mobility_level);
              const priorityColor = getPriorityColor(pwd.pwd_details?.mobility_level);
              
              return (
                <tr key={pwd.user_id}>
                  <td>
                    <span style={{
                      background: priorityColor,
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {priority.split(' ')[0]}
                    </span>
                  </td>
                  <td><strong>{pwd.full_name}</strong></td>
                  <td>{pwd.address}</td>
                  <td>{pwd.pwd_details?.mobility_level || 'Independent'}</td>
                  <td>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps?q=${pwd.latitude},${pwd.longitude}`, '_blank')}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '5px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      📍 View on Map
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pwdResidents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p>No PWD residents with location data yet.</p>
          <p style={{ fontSize: '13px', color: '#666' }}>
            Go to PWD Registry and add coordinates for each resident to see them on the map.
          </p>
        </div>
      )}
    </div>
  );
};

export default PWDPriorityMap;