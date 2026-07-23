import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPicker({ onLocationSelect }) {
  // Default to Doha, Qatar
  const [position, setPosition] = useState({ lat: 25.2854, lng: 51.5310 });
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    onLocationSelect(`Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <MapContainer 
        center={[25.2854, 51.5310]} 
        zoom={13} 
        style={{ height: '300px', width: '100%', borderRadius: '8px', border: `2px solid ${confirmed ? '#2ecc71' : 'var(--border-color)'}`, zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {confirmed ? 'Location confirmed!' : 'Click the map to place your delivery pin.'}
        </span>
        <button type="button" onClick={handleConfirm} style={{ padding: '0.8rem 1.5rem', backgroundColor: confirmed ? '#2ecc71' : 'var(--brand-red)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          {confirmed ? 'Location Saved' : 'Confirm Location'}
        </button>
      </div>
    </div>
  );
}
