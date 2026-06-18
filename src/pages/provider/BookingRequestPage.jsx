import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, CheckCircle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK = {
  BK101: { customer: 'Priya M.', avatar: '👩', phone: '+91 98765 43210', address: '123, 4th Cross, Koramangala, Bengaluru - 560034', service: 'Plumbing Repair', desc: 'Bathroom sink is leaking badly. Need immediate repair.', amount: 385, time: '10:30 AM', date: '19 Jun 2026', status: 'pending' },
  BK102: { customer: 'Arjun K.', avatar: '👨', phone: '+91 87654 32109', address: '45, 2nd Main, HSR Layout, Bengaluru - 560102', service: 'Pipe Leak Fix', desc: 'Kitchen pipe is leaking under the sink.', amount: 450, time: '2:00 PM', date: '19 Jun 2026', status: 'accepted' },
};

export default function BookingRequestPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const booking = MOCK[bookingId] || MOCK['BK101'];
  const [status, setStatus] = useState(booking.status);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setStatus('accepted');
    toast.success('Booking accepted! Head to customer location.');
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setStatus('rejected');
    toast('Booking rejected.', { icon: '❌' });
    setLoading(false);
    setTimeout(() => navigate(-1), 1000);
  };

  const handleComplete = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setStatus('completed');
    toast.success('Job marked as completed! 🎉');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="header">
        <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1 className="header__title">Booking Details</h1>
        <span className={`badge badge--${status.replace('_','-')}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>

      <div style={{ padding: 16, paddingBottom: 100 }}>
        {/* Customer info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <div className="avatar avatar--lg" style={{ background: 'var(--bg-tertiary)', fontSize: 26 }}>{booking.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-display)' }}>{booking.customer}</div>
              <div style={{ color: 'var(--brand-primary-light)', fontSize: 13, fontWeight: 500 }}>{booking.service}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>📅 {booking.date} • 🕐 {booking.time}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--brand-accent)' }}>₹{booking.amount}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn--secondary btn--sm" style={{ flex: 1 }} onClick={() => navigate(`/customer/chat/${bookingId}`)}>
              <MessageCircle size={15} /> Chat
            </button>
            <button className="btn btn--secondary btn--sm" style={{ flex: 1 }} onClick={() => window.open(`tel:${booking.phone}`)}>
              <Phone size={15} /> Call
            </button>
          </div>
        </div>

        {/* Service address */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
            <MapPin size={18} color="var(--brand-primary-light)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Service Location</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{booking.address}</div>
            </div>
          </div>
          <button className="btn btn--outline btn--sm btn--full">
            <Navigation size={15} /> Navigate on Maps
          </button>
        </div>

        {/* Description */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Issue Description</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{booking.desc}</p>
        </div>

        {/* Map */}
        <div className="map-container" style={{ marginBottom: 16, height: 180 }}>
          <div className="map-placeholder">
            <div style={{ fontSize: 28 }}>📍</div>
            <p style={{ fontSize: 12 }}>Customer location on map</p>
          </div>
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
            <div style={{ background: 'var(--brand-danger)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: 12, fontWeight: 700, boxShadow: 'var(--shadow-brand)' }}>
              📍 {booking.customer}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Earnings Breakdown</div>
          {[
            { label: 'Service Amount', value: `₹${booking.amount}` },
            { label: 'Commission (15%)', value: `-₹${Math.round(booking.amount * 0.15)}` },
            { label: 'Your Earnings', value: `₹${Math.round(booking.amount * 0.85)}`, bold: true },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: r.bold ? 'none' : '1px solid var(--border-light)' }}>
              <span style={{ color: r.bold ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: r.bold ? 700 : 400, fontSize: 14 }}>{r.label}</span>
              <span style={{ fontWeight: r.bold ? 800 : 500, color: r.bold ? 'var(--brand-accent)' : r.value.startsWith('-') ? 'var(--brand-danger)' : 'var(--text-primary)', fontFamily: r.bold ? 'var(--font-display)' : 'inherit', fontSize: r.bold ? 16 : 14 }}>{r.value}</span>
            </div>
          ))}
        </div>

        {status === 'completed' && (
          <div className="card" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)', textAlign: 'center', padding: 24 }}>
            <CheckCircle size={40} color="var(--brand-accent)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--brand-accent)' }}>Job Completed!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Payment will be processed within 24 hours</div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      {status !== 'completed' && status !== 'rejected' && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: 16, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12 }}>
          {status === 'pending' && (
            <>
              <button className="btn btn--danger" style={{ flex: 1 }} onClick={handleReject} disabled={loading}>Reject</button>
              <button className="btn btn--success" style={{ flex: 2 }} onClick={handleAccept} disabled={loading}>
                {loading ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> : '✓ Accept Booking'}
              </button>
            </>
          )}
          {status === 'accepted' && (
            <button className="btn btn--primary btn--full btn--lg" onClick={handleComplete} disabled={loading}>
              {loading ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> : '✓ Mark as Completed'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
