import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, CheckCircle, XCircle, Clock, Loader, Navigation } from 'lucide-react';
import { getBookingById, updateBookingStatus, getProviderById } from '../../lib/db';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  pending:     { bg: '#FFF3E0', color: '#E65100', label: '🔔 New Request' },
  accepted:    { bg: '#E8F5E9', color: '#2E7D32', label: '✅ Accepted' },
  in_progress: { bg: '#E3F2FD', color: '#1565C0', label: '🔧 In Progress' },
  completed:   { bg: '#F3E5F5', color: '#6A1B9A', label: '🎉 Completed' },
  cancelled:   { bg: '#FFEBEE', color: '#C62828', label: '❌ Cancelled' },
};

export default function BookingRequestPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    const data = await getBookingById(bookingId);
    setBooking(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [bookingId]);

  const handleAccept = async () => {
    setActionLoading(true);
    const updated = await updateBookingStatus(bookingId, 'accepted');
    if (updated) {
      setBooking(updated);
      toast.success('✅ Booking accepted! Customer has been notified.');
    } else {
      toast.error('Failed to accept booking');
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    const updated = await updateBookingStatus(bookingId, 'cancelled');
    if (updated) {
      setBooking(updated);
      toast.error('Booking declined. Customer notified.');
    }
    setActionLoading(false);
  };

  const handleStart = async () => {
    setActionLoading(true);
    const updated = await updateBookingStatus(bookingId, 'in_progress');
    if (updated) {
      setBooking(updated);
      toast.success('🔧 Service started!');
    }
    setActionLoading(false);
  };

  const handleComplete = async () => {
    setActionLoading(true);
    const updated = await updateBookingStatus(bookingId, 'completed', { completed_at: new Date().toISOString() });
    if (updated) {
      setBooking(updated);
      toast.success('🎉 Service completed! Customer will be asked to review.');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader size={32} color="#1A73E8" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9E9E9E', fontSize: 14 }}>Loading booking details…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Booking not found</h2>
        <button onClick={() => navigate('/provider/bookings')} style={{ padding: '12px 24px', borderRadius: 10, background: '#1A73E8', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Back to Bookings</button>
      </div>
    );
  }

  const statusStyle = STATUS_COLOR[booking.status] || STATUS_COLOR.pending;
  const customerName = booking.customer?.full_name || booking.customer_name || 'Customer';
  const customerPhone = booking.customer?.phone || booking.customer_phone || '';
  const scheduledDate = booking.scheduled_at
    ? new Date(booking.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Instant';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="header">
        <button className="header__back" onClick={() => navigate('/provider/bookings')}><ArrowLeft size={18} /></button>
        <h1 className="header__title">Booking #{booking.id?.slice(-6)}</h1>
      </div>

      <div style={{ padding: '16px 16px 120px' }}>

        {/* Status banner */}
        <div style={{
          background: statusStyle.bg, borderRadius: 16, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          border: `1.5px solid ${statusStyle.color}22`,
        }}>
          <div style={{ fontSize: 24 }}>{statusStyle.label.split(' ')[0]}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: statusStyle.color }}>{statusStyle.label.slice(2)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Updated: {new Date(booking.updated_at || booking.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="card" style={{ marginBottom: 14 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 12 }}>👤 Customer</h4>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#1A73E8', overflow: 'hidden', flexShrink: 0 }}>
              {booking.customer?.avatar_url
                ? <img src={booking.customer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : customerName[0]?.toUpperCase() || '👤'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{customerName}</div>
              {customerPhone && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{customerPhone}</div>}
            </div>
          </div>
          {customerPhone && (
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`tel:${customerPhone}`} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(33,150,243,0.08)', color: '#2196F3', border: '1px solid rgba(33,150,243,0.2)', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Phone size={14} /> Call Customer
              </a>
              <button onClick={() => navigate(`/customer/chat/${bookingId}`)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(76,175,80,0.08)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <MessageCircle size={14} /> Chat
              </button>
            </div>
          )}
        </div>

        {/* Booking details */}
        <div className="card" style={{ marginBottom: 14 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 12 }}>📋 Booking Details</h4>
          {[
            { label: 'Service', value: booking.service_name, capitalize: true },
            { label: 'Scheduled', value: scheduledDate },
            { label: 'Amount', value: booking.amount ? `₹${booking.amount}` : '—' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.label}</span>
              <span style={{ fontWeight: 600, fontSize: 13, textTransform: item.capitalize ? 'capitalize' : 'none' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Address */}
        {booking.address && (
          <div className="card" style={{ marginBottom: 14 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 10 }}>📍 Service Location</h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{booking.address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#1A73E8,#0D47A1)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
            >
              <Navigation size={14} /> Get Directions
            </a>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="card" style={{ marginBottom: 14, background: 'rgba(26,115,232,0.04)', borderColor: 'rgba(26,115,232,0.12)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 6 }}>📝 Customer Notes</h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{booking.notes}</p>
          </div>
        )}

      </div>

      {/* Sticky Action Buttons */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
        {booking.status === 'pending' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              style={{ flex: 1, padding: '14px 0', borderRadius: 12, background: 'rgba(244,67,54,0.08)', color: '#F44336', border: '1.5px solid rgba(244,67,54,0.2)', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <XCircle size={18} /> Reject
            </button>
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              style={{ flex: 2, padding: '14px 0', borderRadius: 12, background: 'linear-gradient(135deg,#1A73E8,#0D47A1)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(26,115,232,0.4)' }}
            >
              {actionLoading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle size={18} /> Accept Booking</>}
            </button>
          </div>
        )}

        {booking.status === 'accepted' && (
          <button
            onClick={handleStart}
            disabled={actionLoading}
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: 'linear-gradient(135deg,#FF9800,#F57C00)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(255,152,0,0.35)' }}
          >
            {actionLoading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : '🔧 Start Service'}
          </button>
        )}

        {booking.status === 'in_progress' && (
          <button
            onClick={handleComplete}
            disabled={actionLoading}
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: 'linear-gradient(135deg,#00C853,#1B5E20)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,200,83,0.35)' }}
          >
            {actionLoading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : '✅ Mark as Completed'}
          </button>
        )}

        {(booking.status === 'completed' || booking.status === 'cancelled') && (
          <button
            onClick={() => navigate('/provider/bookings')}
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            ← Back to All Bookings
          </button>
        )}
      </div>
    </div>
  );
}
