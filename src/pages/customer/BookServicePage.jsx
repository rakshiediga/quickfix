import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, Loader, Star, Navigation } from 'lucide-react';
import { getProviderById, createBooking } from '../../lib/db';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','01:00 PM','02:00 PM','03:00 PM',
  '04:00 PM','05:00 PM','06:00 PM','07:00 PM',
];

export default function BookServicePage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user, profile: customerProfile } = useAuthStore();

  const [provider, setProvider] = useState(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  const [bookingType, setBookingType] = useState('instant');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load real provider data
  useEffect(() => {
    const load = async () => {
      const data = await getProviderById(providerId);
      setProvider(data);
      setLoadingProvider(false);
    };
    load();
  }, [providerId]);

  const handleGPS = () => {
    if (!navigator.geolocation) { toast.error('GPS not supported'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json();
          const a = data.address || {};
          const label = [a.house_number, a.road, a.suburb, a.city, a.state_district, a.state, a.postcode].filter(Boolean).join(', ');
          setAddress(label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          toast.success('📍 Location detected');
        } catch {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setGpsLoading(false);
      },
      () => { toast.error('Could not get location'); setGpsLoading(false); },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleBook = async () => {
    if (!address.trim()) { toast.error('Please enter your service address'); return; }
    if (bookingType === 'scheduled') {
      if (!scheduledDate) { toast.error('Please select a date'); return; }
      if (!scheduledTime) { toast.error('Please select a time'); return; }
    }
    if (!user?.id) { toast.error('Please log in to book'); return; }

    setLoading(true);
    try {
      const price = provider?.per_visit_charge || provider?.service_charge || 0;
      const platform = 29;
      const gst = Math.round(price * 0.18);
      const total = price + platform + gst;

      let scheduledAt = new Date().toISOString();
      if (bookingType === 'scheduled' && scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate} ${scheduledTime}`).toISOString();
      }

      const booking = await createBooking({
        customerId: user.id,
        providerId,
        serviceType: provider?.profession || 'General Service',
        scheduledAt,
        address,
        notes,
        amount: total,
      });

      toast.success('🎉 Booking sent! Waiting for provider to accept.', { duration: 3000 });
      setTimeout(() => navigate(`/customer/tracking/${booking.id}`), 800);
    } catch (err) {
      toast.error('Booking failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProvider) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader size={32} color="#FF5722" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9E9E9E', fontSize: 14 }}>Loading provider info…</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Provider not found</h2>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 24px', borderRadius: 10, background: '#FF5722', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const avatar = provider.profile_photo || provider.avatar_url;
  const price = provider.per_visit_charge || provider.service_charge || 0;
  const platform = 29;
  const gst = Math.round(price * 0.18);
  const total = price + platform + gst;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="header">
        <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1 className="header__title">Book Service</h1>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 120 }}>

        {/* Provider card */}
        <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, background: 'linear-gradient(135deg, #FF5722, #E64A19)', borderRadius: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)' }}>
            {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (provider.full_name?.[0]?.toUpperCase() || '🔧')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-display)', color: '#fff' }}>{provider.full_name}</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, textTransform: 'capitalize', marginTop: 2 }}>{provider.profession} · {provider.experience_years || 0}y exp</div>
            {provider.avg_rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Star size={11} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{provider.avg_rating}</span>
              </div>
            )}
          </div>
          {price > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: '#fff' }}>₹{price}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>per visit</div>
            </div>
          )}
        </div>

        {/* Booking type */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Booking Type</label>
          <div className="tab-bar">
            <div className={`tab-item ${bookingType === 'instant' ? 'active' : ''}`} onClick={() => setBookingType('instant')}>⚡ Instant</div>
            <div className={`tab-item ${bookingType === 'scheduled' ? 'active' : ''}`} onClick={() => setBookingType('scheduled')}>📅 Schedule</div>
          </div>
        </div>

        {/* Scheduled date/time */}
        {bookingType === 'scheduled' && (
          <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />Date</label>
              <input className="form-input" type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={today} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Clock size={13} style={{ display: 'inline', marginRight: 4 }} />Time</label>
              <select className="form-input" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}>
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Instant booking note */}
        {bookingType === 'instant' && (
          <div className="card" style={{ marginBottom: 20, background: 'rgba(0,200,83,0.06)', borderColor: 'rgba(0,200,83,0.2)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <div>
                <div style={{ fontWeight: 700, color: '#00C853' }}>Instant Booking</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Provider will arrive within 30–60 minutes</div>
              </div>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="form-group">
          <label className="form-label"><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />Service Address *</label>
          <textarea
            className="form-input"
            placeholder="Enter your full address where service is needed..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={3}
            style={{ resize: 'none' }}
          />
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF5722', fontSize: 13, fontWeight: 600, marginTop: 6, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={14} />}
            {gpsLoading ? 'Detecting…' : 'Use current location'}
          </button>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label"><FileText size={13} style={{ display: 'inline', marginRight: 4 }} />Describe the Issue (optional)</label>
          <textarea className="form-input" placeholder="e.g., Tap is leaking, pipe burst under sink..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: 'none' }} />
        </div>

        {/* Price summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 14, fontFamily: 'var(--font-display)' }}>Price Estimate</h4>
          {[
            { label: 'Service Charge', value: price > 0 ? `₹${price}` : 'To be discussed' },
            { label: 'Platform Fee', value: '₹29' },
            { label: `GST (18%)`, value: price > 0 ? `₹${gst}` : '—' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{item.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: '#00C853' }}>
              {price > 0 ? `₹${total}` : 'Negotiable'}
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>* Final amount will be confirmed after inspection</p>
        </div>

      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: 16, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!provider.is_available && (
          <div style={{ background: '#FFF3E0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#E65100', fontWeight: 600, textAlign: 'center' }}>
            ⚠️ This provider is currently offline. You can still send a booking request.
          </div>
        )}
        <button className="btn btn--primary btn--full btn--lg" onClick={handleBook} disabled={loading}>
          {loading
            ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            : `Confirm Booking${price > 0 ? ` • ₹${total}` : ''} →`}
        </button>
      </div>
    </div>
  );
}
