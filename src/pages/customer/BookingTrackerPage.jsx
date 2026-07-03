import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Star, MapPin, Loader, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import useRealtimeBooking from '../../hooks/useRealtimeBooking';
import { getProviderById, submitReview, updateBookingStatus } from '../../lib/db';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'pending',     label: 'Request Sent',     icon: '📤', desc: 'Waiting for provider to accept' },
  { key: 'accepted',    label: 'Accepted',          icon: '✅', desc: 'Provider is on the way' },
  { key: 'in_progress', label: 'In Progress',       icon: '🔧', desc: 'Service is being performed' },
  { key: 'completed',   label: 'Completed',         icon: '🎉', desc: 'Service done successfully' },
];

const STATUS_ORDER = ['pending', 'accepted', 'in_progress', 'completed'];

export default function BookingTrackerPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  const { booking, loading } = useRealtimeBooking(bookingId);
  const [provider, setProvider] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (booking?.provider_id) {
      getProviderById(booking.provider_id).then(setProvider);
    }
  }, [booking?.provider_id]);

  // Show review panel when completed
  useEffect(() => {
    if (booking?.status === 'completed' && !reviewDone) {
      setTimeout(() => setShowReview(true), 1200);
    }
  }, [booking?.status]);

  // Notify on status change
  const prevStatus = React.useRef(null);
  useEffect(() => {
    if (!booking) return;
    if (prevStatus.current && prevStatus.current !== booking.status) {
      const msgs = {
        accepted: '✅ Provider accepted your booking!',
        in_progress: '🔧 Service has started!',
        completed: '🎉 Service completed!',
        cancelled: '❌ Booking was declined.',
      };
      if (msgs[booking.status]) toast(msgs[booking.status], { duration: 4000 });
    }
    prevStatus.current = booking.status;
  }, [booking?.status]);

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      await submitReview({
        bookingId,
        customerId: user.id,
        providerId: booking.provider_id,
        rating,
        comment,
      });
      toast.success('⭐ Review submitted! Thank you.');
      setShowReview(false);
      setReviewDone(true);
    } catch (e) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader size={32} color="#FF5722" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9E9E9E', fontSize: 14 }}>Loading booking…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Booking not found</h2>
        <button onClick={() => navigate('/customer/home')} style={{ padding: '12px 24px', borderRadius: 10, background: '#FF5722', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Go Home</button>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(booking.status);
  const isCancelled = booking.status === 'cancelled';
  const avatar = provider?.profile_photo || provider?.avatar_url;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="header">
        <button className="header__back" onClick={() => navigate('/customer/home')}><ArrowLeft size={18} /></button>
        <h1 className="header__title">Booking #{booking.id?.slice(-6)}</h1>
      </div>

      <div style={{ padding: '16px 16px 120px' }}>

        {/* Status Hero */}
        <div style={{
          background: isCancelled
            ? 'linear-gradient(135deg, #F44336, #B71C1C)'
            : booking.status === 'completed'
            ? 'linear-gradient(135deg, #00C853, #1B5E20)'
            : 'linear-gradient(135deg, #FF5722, #E64A19)',
          borderRadius: 20, padding: 24, marginBottom: 20, textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize: 52, marginBottom: 8 }}>
            {isCancelled ? '❌' : STATUS_STEPS.find(s => s.key === booking.status)?.icon || '📤'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            {isCancelled ? 'Booking Declined' : STATUS_STEPS.find(s => s.key === booking.status)?.label || booking.status}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
            {isCancelled
              ? 'Sorry, the provider could not accept your request. Please try another provider.'
              : STATUS_STEPS.find(s => s.key === booking.status)?.desc || ''}
          </div>
          {!isCancelled && booking.status === 'pending' && (
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
              Waiting for provider response…
            </div>
          )}
        </div>

        {/* Progress Steps */}
        {!isCancelled && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Booking Progress</h4>
            {STATUS_STEPS.map((step, i) => {
              const isDone = currentIdx > i;
              const isCurrent = currentIdx === i;
              return (
                <div key={step.key} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: i < STATUS_STEPS.length - 1 ? 18 : 0, position: 'relative' }}>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: 16, top: 36, bottom: 0, width: 2, background: isDone ? '#FF5722' : 'var(--border-light)', transition: 'background 0.5s' }} />
                  )}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    background: isDone ? '#FF5722' : isCurrent ? 'rgba(255,87,34,0.12)' : 'var(--bg-tertiary)',
                    border: isCurrent ? '2px solid #FF5722' : isDone ? 'none' : '2px solid var(--border-light)',
                    transition: 'all 0.4s',
                  }}>
                    {isDone ? <CheckCircle size={18} color="#fff" /> : step.icon}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontWeight: isDone || isCurrent ? 700 : 500, fontSize: 14, color: isDone || isCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{step.desc}</div>
                    {isCurrent && booking.updated_at && (
                      <div style={{ fontSize: 11, color: '#FF5722', fontWeight: 600, marginTop: 2 }}>
                        Updated {new Date(booking.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Provider card */}
        {provider && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Service Provider</h4>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
                {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : provider.full_name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{provider.full_name}</div>
                <div style={{ fontSize: 12, color: '#FF5722', fontWeight: 600, textTransform: 'capitalize' }}>{provider.profession}</div>
                {provider.avg_rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Star size={11} fill="#FF9800" color="#FF9800" />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{provider.avg_rating}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`tel:${provider.phone}`} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(33,150,243,0.08)', color: '#2196F3', border: '1px solid rgba(33,150,243,0.2)', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Phone size={14} /> Call
              </a>
              <button onClick={() => navigate(`/customer/chat/${bookingId}`)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(76,175,80,0.08)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <MessageCircle size={14} /> Chat
              </button>
            </div>
          </div>
        )}

        {/* Booking details */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Booking Details</h4>
          {[
            { label: 'Booking ID', value: `#${booking.id}` },
            { label: 'Service', value: booking.service_name, capitalize: true },
            { label: 'Address', value: booking.address },
            { label: 'Scheduled', value: booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Instant' },
            { label: 'Total Amount', value: booking.amount ? `₹${booking.amount}` : '—' },
            booking.notes && { label: 'Notes', value: booking.notes },
          ].filter(Boolean).map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.label}</span>
              <span style={{ fontWeight: 600, fontSize: 13, maxWidth: '55%', textAlign: 'right', textTransform: item.capitalize ? 'capitalize' : 'none' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Review prompt */}
        {booking.status === 'completed' && !reviewDone && showReview && (
          <div className="card animate-fadeIn" style={{ marginBottom: 16, border: '1.5px solid rgba(255,193,7,0.3)', background: 'rgba(255,193,7,0.04)' }}>
            <h4 style={{ fontWeight: 800, marginBottom: 4 }}>⭐ Rate your experience</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>How was the service by {provider?.full_name}?</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setRating(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, transition: 'transform 0.2s', transform: rating >= r ? 'scale(1.2)' : 'scale(1)' }}>
                  <Star size={32} fill={rating >= r ? '#F59E0B' : 'transparent'} color={rating >= r ? '#F59E0B' : '#BDBDBD'} />
                </button>
              ))}
            </div>
            <textarea className="form-input" placeholder="Write a review (optional)..." value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ resize: 'none', marginBottom: 12 }} />
            <button onClick={handleSubmitReview} disabled={submittingReview} style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: 'linear-gradient(135deg, #FF5722, #FF8A65)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {submittingReview ? 'Submitting…' : 'Submit Review ⭐'}
            </button>
          </div>
        )}

        {/* Cancelled actions */}
        {isCancelled && (
          <button onClick={() => navigate('/customer/search')} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#FF5722', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Find Another Provider
          </button>
        )}

      </div>
    </div>
  );
}
