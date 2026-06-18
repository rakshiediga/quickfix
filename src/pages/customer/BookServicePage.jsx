import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const PROVIDERS = {
  '1': { full_name: 'Rajesh Kumar', profession: 'plumber', price: 299, avatar: '👨‍🔧' },
  '2': { full_name: 'Suresh Sharma', profession: 'electrician', price: 349, avatar: '👷' },
  '3': { full_name: 'Amit Patel', profession: 'carpenter', price: 399, avatar: '🧑‍🏭' },
  '4': { full_name: 'Vijay Yadav', profession: 'mechanic', price: 249, avatar: '👨‍🔧' },
};

export default function BookServicePage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const provider = PROVIDERS[providerId] || PROVIDERS['1'];
  const [bookingType, setBookingType] = useState('instant');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!address) { toast.error('Enter your service address'); return; }
    if (bookingType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      toast.error('Pick a date and time for scheduling'); return;
    }
    setLoading(true);
    // In production, insert to Supabase bookings table
    // Simulating booking creation for demo
    const mockBookingId = `BK${Date.now().toString().slice(-6)}`;
    toast.success('Booking created! Waiting for provider to accept.', { duration: 3000 });
    setTimeout(() => navigate(`/customer/tracking/${mockBookingId}`), 1000);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="header">
        <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1 className="header__title">Book Service</h1>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 100 }}>
        {/* Provider summary */}
        <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
          <div className="avatar avatar--lg" style={{ background: 'var(--bg-tertiary)', fontSize: 26 }}>{provider.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)' }}>{provider.full_name}</div>
            <div style={{ color: 'var(--brand-primary-light)', fontSize: 13, fontWeight: 500 }}>{provider.profession.charAt(0).toUpperCase() + provider.profession.slice(1)}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--brand-accent)' }}>₹{provider.price}</div>
        </div>

        {/* Booking type */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Booking Type</label>
          <div className="tab-bar">
            <div className={`tab-item ${bookingType === 'instant' ? 'active' : ''}`} onClick={() => setBookingType('instant')}>
              ⚡ Instant
            </div>
            <div className={`tab-item ${bookingType === 'scheduled' ? 'active' : ''}`} onClick={() => setBookingType('scheduled')}>
              📅 Schedule
            </div>
          </div>
        </div>

        {/* Schedule picker */}
        {bookingType === 'scheduled' && (
          <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />Date</label>
              <input className="form-input" type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Clock size={13} style={{ display: 'inline', marginRight: 4 }} />Time</label>
              <input className="form-input" type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
            </div>
          </div>
        )}

        {/* Address */}
        <div className="form-group">
          <label className="form-label"><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />Service Address *</label>
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-input"
              placeholder="Enter your full address where service is needed..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-primary-light)', fontSize: 13, fontWeight: 500, marginTop: 6 }}
            onClick={() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(() => { setAddress('Current Location (GPS)'); toast.success('Location detected!'); }); } }}>
            <MapPin size={14} /> Use current location
          </button>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label"><FileText size={13} style={{ display: 'inline', marginRight: 4 }} />Describe the Issue</label>
          <textarea className="form-input" placeholder="Briefly describe the problem (optional)..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'none' }} />
        </div>

        {/* Time slots (instant) */}
        {bookingType === 'instant' && (
          <div className="card" style={{ marginBottom: 16, background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--brand-accent)' }}>Instant Booking</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Provider will arrive within 30-60 minutes</div>
              </div>
            </div>
          </div>
        )}

        {/* Price summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Price Estimate</h4>
          {[
            { label: 'Service Charge', value: `₹${provider.price}` },
            { label: 'Platform Fee', value: '₹29' },
            { label: 'GST (18%)', value: `₹${Math.round(provider.price * 0.18)}` },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{item.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--brand-accent)' }}>
              ₹{provider.price + 29 + Math.round(provider.price * 0.18)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: 16, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
        <button className="btn btn--primary btn--full btn--lg" onClick={handleBook} disabled={loading}>
          {loading ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> : `Confirm Booking • ₹${provider.price + 29 + Math.round(provider.price * 0.18)}`}
        </button>
      </div>
    </div>
  );
}
