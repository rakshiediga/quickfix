/**
 * NearbyProvidersMap.jsx
 * Shows multiple provider pins on a map for the Customer Home page.
 * Uses react-leaflet + OpenStreetMap (free, no API key)
 */
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix Vite icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_COLORS = {
  plumber:     '#2196F3',
  electrician: '#FF9800',
  carpenter:   '#9C27B0',
  mechanic:    '#00BCD4',
  painter:     '#F44336',
  cleaner:     '#009688',
  ac_repair:   '#3F51B5',
  pest:        '#4CAF50',
};

const EMOJI_MAP = {
  plumber: '🔧', electrician: '⚡', carpenter: '🪚', mechanic: '🔩',
  painter: '🖌️', cleaner: '🧹', ac_repair: '❄️', pest: '🐛',
};

const makePin = (color, emoji, online) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:38px;height:38px;
        border-radius:50% 50% 50% 0;
        background:${online ? color : '#9E9E9E'};
        transform:rotate(-45deg);
        border:3px solid #fff;
        box-shadow:0 3px 14px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:17px;">${emoji}</span>
      </div>
      ${online ? `<div style="
        width:10px;height:10px;border-radius:50%;
        background:#00C853;border:2px solid #fff;
        position:absolute;top:0;right:0;
        box-shadow:0 0 0 2px rgba(0,200,83,0.4);
      "></div>` : ''}`,
    iconSize:   [38, 38],
    iconAnchor: [19, 38],
    popupAnchor:[0, -42],
  });

const myLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:18px;height:18px;border-radius:50%;
      background:#1A73E8;
      border:3px solid #fff;
      box-shadow:0 0 0 5px rgba(26,115,232,0.2);
    "></div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
});

/**
 * Props:
 *  providers     — array of { id, full_name, profession, avg_rating, is_available, lat, lng, price, distance }
 *  userLat/Lng   — customer's current location (optional)
 *  center        — [lat, lng] for map center
 *  zoom          — initial zoom (default 13)
 *  height        — CSS height (default '260px')
 *  onSelect      — callback(provider) when a pin popup "View" button clicked
 */
export default function NearbyProvidersMap({
  providers = [],
  userLat   = null,
  userLng   = null,
  center    = [12.9352, 77.6245],
  zoom      = 13,
  height    = '260px',
  onSelect  = () => {},
}) {
  return (
    <div style={{ height, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1.5px solid #E0E0E0' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer location */}
        {userLat && userLng && (
          <>
            <Circle
              center={[userLat, userLng]}
              radius={300}
              pathOptions={{ color: '#1A73E8', fillColor: '#1A73E8', fillOpacity: 0.1, weight: 1 }}
            />
            <Marker position={[userLat, userLng]} icon={myLocationIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700 }}>
                  📍 Your Location
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Provider pins */}
        {providers.map(p => {
          const color = CATEGORY_COLORS[p.profession] || '#FF5722';
          const emoji = EMOJI_MAP[p.profession] || '🔧';
          const icon  = makePin(color, emoji, p.is_available);
          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{p.full_name}</div>
                      <div style={{ fontSize: 11, color: color, fontWeight: 600, textTransform: 'capitalize' }}>
                        {p.profession}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 8 }}>
                    <span style={{ color: '#616161' }}>⭐ {p.avg_rating} · 📍 {p.distance}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      background: p.is_available ? '#E8F5E9' : '#F5F5F5',
                      color: p.is_available ? '#2E7D32' : '#9E9E9E',
                    }}>
                      {p.is_available ? '● Online' : '● Busy'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#00C853', marginBottom: 8 }}>
                    {p.price}
                  </div>
                  <button
                    onClick={() => onSelect(p)}
                    style={{
                      width: '100%', padding: '7px 0', borderRadius: 8,
                      background: 'linear-gradient(135deg,#FF5722,#FF8A65)',
                      color: '#fff', border: 'none', fontWeight: 700,
                      fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    View Profile →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
