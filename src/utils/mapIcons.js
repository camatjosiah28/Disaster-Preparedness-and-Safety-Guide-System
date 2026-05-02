import L from 'leaflet';

const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 45px;
        height: 45px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        cursor: pointer;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 24px;
          font-weight: bold;
        ">${emoji}</span>
      </div>
    `,
    className: "custom-evac-pin",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -45]
  });
};

export const schoolIcon = createCustomIcon('#FF6B6B', '🏫');
export const barangayIcon = createCustomIcon('#4ECDC4', '🏛️');
export const sportsIcon = createCustomIcon('#FFD93D', '🏟️');
export const safeCenterIcon = createCustomIcon('#6BCB77', '🛡️');

export const getCenterIcon = (centerName) => {
  const name = centerName.toLowerCase();
  if (name.includes('elementary') || name.includes('school')) return schoolIcon;
  if (name.includes('barangay')) return barangayIcon;
  if (name.includes('sports')) return sportsIcon;
  if (name.includes('safe') || name.includes('cosulich')) return safeCenterIcon;
  return new L.Icon.Default();
};

export const getDirections = (lat, lng) => {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
};