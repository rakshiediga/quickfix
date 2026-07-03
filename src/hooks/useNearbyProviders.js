/**
 * useNearbyProviders.js
 * Fetches GPS location, then returns providers sorted by distance.
 * Now uses FastAPI backend — no Supabase dependency.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchNearbyProviders } from '../lib/db';
import toast from 'react-hot-toast';

export default function useNearbyProviders({ radiusKm = 10, category = null } = {}) {
  const [providers, setProviders] = useState([]);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [locStatus, setLocStatus] = useState('idle'); // idle | loading | success | error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load providers whenever location or category changes
  const loadProviders = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const list = await fetchNearbyProviders({ userLat: lat, userLng: lng, radiusKm, category });
      setProviders(list || []);
    } catch (e) {
      setError(e.message);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [radiusKm, category]);

  // Request location on first call
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      // Still load providers without filtering by distance
      loadProviders(null, null);
      return;
    }

    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setLocStatus('success');

        // Reverse geocode label
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const label = addr.suburb || addr.neighbourhood || addr.city || addr.town || '';
          setLocationLabel(label);
        } catch {}

        loadProviders(lat, lng);
      },
      (err) => {
        setLocStatus('error');
        if (err.code === 1) {
          toast('Location permission denied — showing all providers', { icon: '📍' });
        }
        loadProviders(null, null);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  }, [loadProviders]);

  // Initial load
  useEffect(() => {
    requestLocation();
  }, []);

  // Re-fetch when category changes
  useEffect(() => {
    if (locStatus === 'success') {
      loadProviders(userLat, userLng);
    } else if (locStatus !== 'idle') {
      loadProviders(null, null);
    }
  }, [category]);

  return {
    providers,
    loading,
    error,
    userLat,
    userLng,
    locationLabel,
    locStatus,
    requestLocation,
    refresh: () => loadProviders(userLat, userLng),
  };
}
