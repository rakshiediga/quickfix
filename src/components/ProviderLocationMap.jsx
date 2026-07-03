/**
 * ProviderLocationMap.jsx
 * Reusable map component showing a provider's location pin
 * Uses react-leaflet + OpenStreetMap (free, no API key)
 */
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom orange provider pin
const makeProviderIcon = (color = '#FF5722') =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:${color};
        transform:rotate(-45deg);
        border:3px solid #fff;
        box-shadow:0 3px 12px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="transform:rotate(45deg);font-size:16px;">🔧</div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });

// Custom blue customer pin
const customerIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:16px;height:16px;border-radius:50%;
      background:#1A73E8;
      border:3px solid #fff;
      box-shadow:0 0 0 4px rgba(26,115,232,0.25);
    "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Inner component to recenter map when coords change
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng]);
  return null;
}

/**
 * Props:
 *  providerLat, providerLng  — provider's GPS coords
 *  customerLat, customerLng  — (optional) customer's GPS coords
 *  providerName              — shown in popup
 *  serviceRadius             — (optional) km radius circle around provider
 *  height                    — CSS height string (default '220px')
 *  zoom                      — initial zoom level (default 14)
 *  showRadius                — show service radius circle (default false)
 */
export default function ProviderLocationMap({
  providerLat   = 12.9352,   // default: Koramangala, Bengaluru
  providerLng   = 77.6245,
  customerLat   = null,
  customerLng   = null,
  providerName  = 'Provider Location',
  serviceRadius = 5,
  height        = '220px',
  zoom          = 14,
  showRadius    = false,
}) {
  const providerIcon = makeProviderIcon('#FF5722');

  return (
    <div style={{ height, borderRadius: 'inherit', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={[providerLat, providerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={true}
      >
        <MapRecenter lat={providerLat} lng={providerLng} />

        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Service radius ring */}
        {showRadius && (
          <Circle
            center={[providerLat, providerLng]}
            radius={serviceRadius * 1000}
            pathOptions={{ color: '#FF5722', fillColor: '#FF5722', fillOpacity: 0.07, weight: 1.5, dashArray: '5 5' }}
          />
        )}

        {/* Provider marker */}
        <Marker position={[providerLat, providerLng]} icon={providerIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 140 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>🔧 {providerName}</div>
              <div style={{ fontSize: 12, color: '#616161' }}>
                📍 {providerLat.toFixed(4)}, {providerLng.toFixed(4)}
              </div>
              <a
                href={`https://www.google.com/maps?q=${providerLat},${providerLng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', marginTop: 6, fontSize: 12, color: '#FF5722', fontWeight: 700 }}
              >
                Open in Google Maps ↗
              </a>
            </div>
          </Popup>
        </Marker>

        {/* Customer marker */}
        {customerLat && customerLng && (
          <Marker position={[customerLat, customerLng]} icon={customerIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>
                📍 Your location
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
