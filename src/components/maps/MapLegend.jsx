import React from 'react';

const MapLegend = () => {
  return (
    <div className="map-legend">
      <h4>Map Legend</h4>
      <div className="legend-item">
        <span className="legend-dot school"></span> School
      </div>
      <div className="legend-item">
        <span className="legend-dot barangay"></span> Barangay Hall
      </div>
      <div className="legend-item">
        <span className="legend-dot sports"></span> Sports Complex
      </div>
      <div className="legend-item">
        <span className="legend-dot safe"></span> Safe Center
      </div>
    </div>
  );
};

export default MapLegend;