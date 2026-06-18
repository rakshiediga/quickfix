import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, MapPin, CheckCircle, Clock, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TIMELINE = [
  { id: 'placed', label: 'Booking Placed', time: '2:00 PM', done: true },
  { id: 'accepted', label: 'Provider Accepted', time: '2:05 PM', done: true },
  { id: 'en_route', label: 'Provider En Route', time: '2:10 PM', done: true },
  { id: 'arrived', label: 'Provider Arrived', time: null, done: false, active: true },
  { id: 'completed', label: 'Service Completed', time: null, done: false },
];

export default function BookingTrackerPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleOtpComplete = () => {
    toast.success('Service marked as completed! 🎉');
    setShowOtpModal(false);
    setShowRateModal(true);
  };

  const handleRateSubmit = () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    toast.success('Thank you for your review! ⭐');
    setShowRateModal(false);
    navigate('/customer/payment/BK001');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="header">
        <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1 className="header__title">Track Booking</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--icon btn--secondary" style={{ width: 36, height: 36, padding: 0 }} onClick={() => navigate(`/customer/chat/${bookingId}`)}>
            <MessageCircle size={18} />
          </button>
          <button className="btn btn--icon btn--secondary" style={{ width: 36, height: 36, padding: 0 }}>
            <Phone size={18} />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Provider card */}
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <div className="avatar avatar--lg" style={{ background: 'var(--bg-tertiary)', fontSize: 26 }}>👷</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Suresh Sharma</div>
            <div style={{ color: 'var(--brand-primary-light)', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Electrician</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-accent)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--brand-accent)', fontWeight: 600 }}>En Route to you</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Arrival in</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--brand-primary-light)' }}>~8 min</div>
          </div>
        </div>

        {/* Map */}
        <div className="map-container" style={{ marginBottom: 20, height: 200 }}>
          <div className="map-placeholder">
            <div style={{ fontSize: 32 }}>📍</div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Live Tracking</p>
            <p style={{ fontSize: 11 }}>Google Maps will show provider location</p>
          </div>
          {/* Animated provider pin */}
          <div style={{ position: 'absolute', top: '40%', left: '35%', zIndex: 2, animation: 'float 2s ease-in-out infinite' }}>
            <div style={{ background: 'var(--brand-primary)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '6px 12px', fontSize: 12, fontWeight: 700, boxShadow: 'var(--shadow-brand)' }}>
              👷 Provider
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '30%', right: '30%', zIndex: 2 }}>
            <div style={{ background: 'var(--brand-accent)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>
              🏠 You
            </div>
          </div>
        </div>

        {/* Booking info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Booking ID</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>#{bookingId}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <MapPin size={14} style={{ color: 'var(--brand-primary-light)', marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>123, 4th Cross, Koramangala, Bengaluru - 560034</span>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Booking Progress</h3>
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <div key={item.id} className={`timeline-item ${item.done ? 'completed' : ''}`}>
                <div className={`timeline-dot ${item.done ? 'completed' : item.active ? 'active' : ''}`}>
                  {item.done ? <CheckCircle size={14} /> : item.active ? <Clock size={14} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)' }} />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-title" style={{ color: item.done ? 'var(--text-primary)' : item.active ? 'var(--brand-primary-light)' : 'var(--text-muted)' }}>
                    {item.label}
                  </div>
                  {item.time && <div className="timeline-time">{item.time}</div>}
                  {item.active && <div style={{ fontSize: 11, color: 'var(--brand-accent)', fontWeight: 500, marginTop: 2 }}>In progress...</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OTP verify button */}
        <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'var(--border-color)', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            🔐 Share this OTP with the provider to confirm service completion
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: 6, color: 'var(--brand-primary-light)' }}>
              4 8 2 1
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => setShowOtpModal(true)}>
              Verify OTP
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay modal-overlay--center">
          <div className="modal modal--center">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
              <h3 className="modal__title">Enter Provider OTP</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>The provider will give you a 4-digit code</p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
              {[0,1,2,3].map(i => (
                <input key={i} className="otp-input" style={{ width: 56, height: 64 }} type="tel" inputMode="numeric" maxLength={1} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowOtpModal(false)}>Cancel</button>
              <button className="btn btn--success" style={{ flex: 1 }} onClick={handleOtpComplete}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__handle" />
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
              <h3 className="modal__title">Rate Your Experience</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>How was the service by Suresh Sharma?</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {[1,2,3,4,5].map(r => (
                <Star key={r} size={36} fill={r <= rating ? '#F59E0B' : 'transparent'} color={r <= rating ? '#F59E0B' : 'var(--text-muted)'} onClick={() => setRating(r)} style={{ cursor: 'pointer', transition: 'all 0.15s' }} />
              ))}
            </div>
            <textarea className="form-input" placeholder="Share your experience (optional)..." value={review} onChange={e => setReview(e.target.value)} rows={3} style={{ resize: 'none', marginBottom: 16 }} />
            <button className="btn btn--primary btn--full" onClick={handleRateSubmit}>Submit Review</button>
          </div>
        </div>
      )}
    </div>
  );
}
