import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Settings, ClipboardList, DollarSign,
  CheckCircle, Navigation, Loader, MapPin, RefreshCw, Star
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useDataStore from '../../store/dataStore';
import { updateBookingStatus } from '../../lib/db';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const GPS_STATUS = {
  idle:    { label: 'Share Location', bg: 'rgba(26,115,232,0.08)', border: 'rgba(26,115,232,0.2)', color: '#1A73E8', btnBg: 'linear-gradient(135deg,#1A73E8,#0D47A1)' },
  loading: { label: 'Detecting…',    bg: 'rgba(255,152,0,0.08)',   border: 'rgba(255,152,0,0.2)',  color: '#FF9800', btnBg: 'linear-gradient(135deg,#FF9800,#F57C00)' },
  success: { label: 'Live Location', bg: 'rgba(0,200,83,0.08)',    border: 'rgba(0,200,83,0.25)', color: '#00C853', btnBg: 'linear-gradient(135deg,#00C853,#69F0AE)' },
  error:   { label: 'GPS Error',     bg: 'rgba(244,67,54,0.08)',   border: 'rgba(244,67,54,0.2)', color: '#F44336', btnBg: 'linear-gradient(135deg,#F44336,#FF7043)' },
};

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { profile, setProfile } = useAuthStore();
  const { bookings, fetchBookings, updateBookingStatus } = useDataStore();
  const [isOnline, setIsOnline] = useState(profile?.is_available ?? true);
  const [toggling, setToggling] = useState(false);

  // GPS state
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsAddress, setGpsAddress] = useState('');
  const [gpsLastUpdated, setGpsLastUpdated] = useState(null);

  useEffect(() => {
    if (profile?.id) fetchBookings(profile.id, 'provider');
  }, [profile?.id]);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const todayEarnings = completedBookings
    .filter(b => b.completed_at && new Date(b.completed_at).toDateString() === new Date().toDateString())
    .reduce((s, b) => s + (b.amount || 0), 0);

  const handleToggle = async () => {
    setToggling(true);
    await new Promise(r => setTimeout(r, 400));
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    const updatedProfile = { ...profile, is_available: newStatus };
    setProfile(updatedProfile);
    try {
      const demoProfiles = JSON.parse(localStorage.getItem('quickfix_demo_profiles') || '{}');
      if (demoProfiles[profile?.id]) {
        demoProfiles[profile?.id].is_available = newStatus;
        localStorage.setItem('quickfix_demo_profiles', JSON.stringify(demoProfiles));
      }
    } catch(e) {}
    toast.success(newStatus ? '🟢 You are now Online!' : '⚫ You are now Offline');
    setToggling(false);
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      return;
    }
    setGpsStatus('loading');
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000, enableHighAccuracy: true,
        })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      setGpsCoords({ lat, lng });
      setGpsLastUpdated(new Date());

      // Reverse geocode for a human-readable address
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const addr = data.address || {};
        const area = addr.suburb || addr.neighbourhood || addr.road || '';
        const city = addr.city || addr.town || addr.village || '';
        setGpsAddress([area, city].filter(Boolean).join(', ') || data.display_name?.split(',')[0] || '');
      } catch {
        setGpsAddress('Location captured');
      }

      // Save to Supabase provider_profiles if real mode
      const isConfigured = import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');
      if (isConfigured && profile?.id) {
        await supabase
          .from('provider_profiles')
          .update({ current_lat: lat, current_lng: lng, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
      } else {
        // Demo: save to localStorage
        try {
          const demoProfiles = JSON.parse(localStorage.getItem('quickfix_demo_profiles') || '{}');
          if (demoProfiles[profile?.id]) {
            demoProfiles[profile?.id].current_lat = lat;
            demoProfiles[profile?.id].current_lng = lng;
            localStorage.setItem('quickfix_demo_profiles', JSON.stringify(demoProfiles));
          }
        } catch(e) {}
      }

      setGpsStatus('success');
      toast.success('📍 Live location updated!');
    } catch (err) {
      setGpsStatus('error');
      if (err.code === 1) toast.error('Location permission denied. Enable in browser settings.');
      else if (err.code === 2) toast.error('GPS signal unavailable.');
      else toast.error('Location request timed out. Try again.');
    }
  };

  const gpsStyle = GPS_STATUS[gpsStatus];

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '48px 16px 20px',
        background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)',
        borderBottom: '1px solid var(--border-light)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#fff',
            }}>
              {profile?.profile_photo
                ? <img src={profile.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : (profile?.full_name?.[0] || '🔧')}
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500 }}>Welcome back 👋</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 1 }}>
                {profile?.full_name?.split(' ')[0] || 'Provider'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2, textTransform: 'capitalize' }}>
                💼 {profile?.profession || 'Service Partner'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="header__back"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', position: 'relative' }}
              onClick={() => navigate('/provider/notifications')}
            >
              <Bell size={18} />
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#FF5722',
                position: 'absolute', top: 6, right: 6,
                boxShadow: '0 0 0 2px rgba(26,115,232,0.6)',
              }} />
            </button>
            <button
              className="header__back"
              onClick={() => navigate('/provider/profile')}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Online/Offline toggle */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '12px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', zIndex: 1,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: isOnline ? '#00C853' : 'var(--text-secondary)' }}>
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {isOnline ? 'Visible & accepting bookings' : 'Go online to receive requests'}
            </div>
          </div>
          <div
            onClick={toggling ? undefined : handleToggle}
            style={{
              width: 50, height: 28, borderRadius: 100,
              background: isOnline ? '#00C853' : '#BDBDBD',
              cursor: toggling ? 'not-allowed' : 'pointer',
              position: 'relative', transition: 'background 0.3s',
              boxShadow: isOnline ? '0 2px 8px rgba(0,200,83,0.35)' : 'none',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, left: isOnline ? 25 : 3,
              transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* ── GPS Location Card ── */}
        <div style={{
          background: gpsStyle.bg,
          border: `1.5px solid ${gpsStyle.border}`,
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 16,
          transition: 'all 0.4s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, color: gpsStyle.color }}>
                <MapPin size={14} />
                {gpsStyle.label}
                {gpsStatus === 'success' && (
                  <span style={{
                    fontSize: 10, background: 'rgba(0,200,83,0.15)',
                    color: '#00C853', padding: '2px 7px', borderRadius: 20, fontWeight: 600,
                  }}>LIVE</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                {gpsStatus === 'success'
                  ? <>{gpsAddress && <><b style={{ color: 'var(--text-secondary)' }}>{gpsAddress}</b> · </>}{gpsCoords?.lat?.toFixed(4)}, {gpsCoords?.lng?.toFixed(4)} · Updated {formatTime(gpsLastUpdated)}</>
                  : gpsStatus === 'loading'
                  ? 'Accessing GPS, please wait…'
                  : gpsStatus === 'error'
                  ? 'Failed to get location. Check browser permissions.'
                  : 'Share live location so customers can find you nearby'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 10 }}>
              {gpsStatus === 'success' && (
                <a
                  href={`https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(0,200,83,0.12)', border: '1px solid rgba(0,200,83,0.2)',
                    color: '#00C853', textDecoration: 'none',
                  }}
                  title="Open in Maps"
                >
                  <MapPin size={15} />
                </a>
              )}
              <button
                onClick={handleShareLocation}
                disabled={gpsStatus === 'loading'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: gpsStatus === 'loading' ? 'not-allowed' : 'pointer',
                  background: gpsStyle.btnBg,
                  color: '#fff',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                  transition: 'all 0.3s',
                  opacity: gpsStatus === 'loading' ? 0.75 : 1,
                }}
              >
                {gpsStatus === 'loading' ? (
                  <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
                ) : gpsStatus === 'success' ? (
                  <RefreshCw size={13} />
                ) : (
                  <Navigation size={13} />
                )}
                {gpsStatus === 'loading' ? 'Wait…' : gpsStatus === 'success' ? 'Refresh' : gpsStatus === 'error' ? 'Retry' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: "Today's Earnings", value: todayEarnings > 0 ? `₹${todayEarnings.toLocaleString()}` : '₹0', icon: '💰', color: '#1A73E8', sub: totalEarnings > 0 ? `₹${totalEarnings.toLocaleString()} all time` : 'No earnings yet' },
            { label: 'Pending Requests', value: String(pendingBookings.length), icon: '🔔', color: '#FF9800', sub: pendingBookings.length > 0 ? 'Needs response' : 'All clear!' },
            { label: 'Completed Jobs', value: String(completedBookings.length || profile?.completed_jobs || 0), icon: '✅', color: '#00C853', sub: 'All time' },
            { label: 'Avg Rating', value: profile?.avg_rating ? `${profile.avg_rating}★` : '—', icon: '⭐', color: '#F59E0B', sub: profile?.total_reviews > 0 ? `${profile.total_reviews} reviews` : 'No reviews yet' },
            { label: 'Active Jobs', value: String(acceptedBookings.length), icon: '🔄', color: '#9C27B0', sub: acceptedBookings.length > 0 ? 'In progress' : 'None active' },
            { label: 'Total Bookings', value: String(bookings.length), icon: '📋', color: '#2196F3', sub: 'All time' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${s.color}14`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 17,
                }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 900, marginTop: 10, color: 'var(--text-primary)' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 10, color: s.color, marginTop: 3, fontWeight: 600 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* ── New Booking Requests ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>New Requests 🔔</h3>
            <button
              className="btn btn--ghost btn--sm"
              style={{ color: '#1A73E8', fontWeight: 700 }}
              onClick={() => navigate('/provider/bookings')}
            >
              View All
            </button>
          </div>

          {pendingBookings.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '28px 20px',
              background: 'var(--bg-card)', borderRadius: 16,
              border: '1.5px dashed var(--border-color)',
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>All caught up!</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No pending booking requests right now.</p>
            </div>
          ) : (
            pendingBookings.map(b => {
              const customerName = b.customer?.full_name || b.customer_name || 'Customer';
              const serviceName = b.service_name || b.profession || 'Service';
              const amount = b.amount || b.total_amount || 0;
              return (
                <div key={b.id} style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid rgba(26,115,232,0.12)',
                  borderRadius: 16, padding: 14,
                  marginBottom: 12,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12, fontSize: 18,
                      background: 'rgba(26,115,232,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#1A73E8', overflow: 'hidden',
                    }}>
                      {b.customer?.avatar_url
                        ? <img src={b.customer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : customerName[0]?.toUpperCase() || '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{customerName}</div>
                        {amount > 0 && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, color: '#1A73E8' }}>₹{amount}</div>}
                      </div>
                      <div style={{ color: '#1A73E8', fontSize: 12, fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>{serviceName}</div>
                      {b.address && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>📍 {b.address}</div>}
                      {b.scheduled_at && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>🕐 {new Date(b.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'rgba(244,67,54,0.06)', color: '#F44336', border: '1px solid rgba(244,67,54,0.18)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                      onClick={async () => { await updateBookingStatus(b.id, 'cancelled'); toast.error('Booking rejected'); }}
                    >
                      ✕ Reject
                    </button>
                    <button
                      style={{ flex: 2, padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg,#1A73E8,#0D47A1)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 3px 10px rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={async () => { await updateBookingStatus(b.id, 'accepted'); toast.success('✅ Booking accepted!'); navigate(`/provider/booking/${b.id}`); }}
                    >
                      <CheckCircle size={15} /> Accept & View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>



        {/* ── Quick Actions ── */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { icon: <ClipboardList size={20} />, label: 'Bookings', path: '/provider/bookings', color: '#1A73E8' },
              { icon: <DollarSign size={20} />, label: 'Earnings', path: '/provider/earnings', color: '#00C853' },
              { icon: <Star size={20} />, label: 'Reviews', path: '/provider/reviews', color: '#F59E0B' },
              { icon: <Settings size={20} />, label: 'Profile', path: '/provider/profile', color: '#9C27B0' },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'var(--bg-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  color: a.color,
                }}
              >
                {a.icon}
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Performance Summary ── */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>This Week 📊</h3>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)' }}>
            {[
              { label: 'Weekly Earnings', value: '₹6,840', pos: true },
              { label: 'Jobs Completed', value: '18 jobs', pos: true },
              { label: 'Commission Fee (15%)', value: '₹1,026', pos: false },
              { label: 'Net Payout', value: '₹5,814', pos: true },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: s.pos ? '#1A73E8' : '#F44336', fontSize: 14 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
