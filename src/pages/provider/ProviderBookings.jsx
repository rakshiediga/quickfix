import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ClipboardCheck, Loader } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useDataStore from '../../store/dataStore';
import toast from 'react-hot-toast';

const STATUS_LABEL = {
  pending: 'New',
  accepted: 'Active',
  in_progress: 'In Progress',
  completed: 'Done',
  cancelled: 'Cancelled'
};

export default function ProviderBookings() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { bookings, isLoading, fetchBookings, updateBookingStatus } = useDataStore();
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (profile?.id) {
      fetchBookings(profile.id, 'provider');
    }
  }, [profile?.id]);

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  const handleAccept = async (e, bookingId) => {
    e.stopPropagation();
    await updateBookingStatus(bookingId, 'accepted');
    toast.success('✅ Booking accepted!');
  };

  const handleReject = async (e, bookingId) => {
    e.stopPropagation();
    await updateBookingStatus(bookingId, 'cancelled');
    toast.error('Booking rejected');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sticky Header */}
      <div style={{
        padding: '48px 16px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 14 }}>
          Bookings
        </h1>

        {/* Count badge */}
        {bookings.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
          </div>
        )}

        <div className="scroll-x" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            ['all', '📋 All'],
            ['pending', '🔔 New'],
            ['accepted', '🔄 Active'],
            ['in_progress', '⚙️ In Progress'],
            ['completed', '✅ Done'],
            ['cancelled', '❌ Cancelled']
          ].map(([id, label]) => {
            const active = tab === id;
            const count = id === 'all' ? bookings.length : bookings.filter(b => b.status === id).length;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: active ? 'linear-gradient(135deg, #1A73E8, #0D47A1)' : 'var(--bg-tertiary)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  boxShadow: active ? '0 2px 8px rgba(26,115,232,0.2)' : 'none',
                  position: 'relative',
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    marginLeft: 4, fontSize: 10, fontWeight: 800,
                    background: active ? 'rgba(255,255,255,0.3)' : 'rgba(26,115,232,0.12)',
                    color: active ? '#fff' : '#1A73E8',
                    borderRadius: 20, padding: '1px 6px',
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {isLoading ? (
          // Skeleton loader
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)', padding: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '55%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>
              {tab === 'all' ? '📋' : tab === 'pending' ? '🔔' : tab === 'completed' ? '✅' : '🗓️'}
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 6 }}>
              {tab === 'all' ? 'No bookings yet' : `No ${STATUS_LABEL[tab]?.toLowerCase() || tab} bookings`}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
              {tab === 'all'
                ? 'When customers book your services,\nthey will appear here.'
                : 'No bookings match this filter.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(b => {
              const customerName = b.customer?.full_name || b.customer_name || 'Customer';
              const serviceName = b.service_name || b.profession || 'Service';
              const bookingDate = b.scheduled_at
                ? new Date(b.scheduled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                : b.date || '—';
              const bookingTime = b.scheduled_at
                ? new Date(b.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                : b.time || '';
              const amount = b.amount || b.total_amount || 0;

              return (
                <div
                  key={b.id}
                  className="card card--interactive"
                  onClick={() => navigate(`/provider/booking/${b.id}`)}
                  style={{ borderRadius: 16, border: '1px solid var(--border-light)', padding: 16 }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'rgba(26,115,232,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 700, color: '#1A73E8', flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {b.customer?.avatar_url
                        ? <img src={b.customer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : customerName[0]?.toUpperCase() || '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{customerName}</div>
                          <div style={{ color: '#1A73E8', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{serviceName}</div>
                        </div>
                        <span className={`badge badge--${b.status?.replace('_', '-') || 'pending'}`} style={{ textTransform: 'capitalize', flexShrink: 0, marginLeft: 8 }}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {bookingDate}{bookingTime ? ` • ${bookingTime}` : ''}{b.address ? ` • ${b.address}` : ''}
                        </span>
                        {amount > 0 && <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>₹{amount}</span>}
                      </div>

                      {b.rating > 0 && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 8, alignItems: 'center' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < b.rating ? '#F59E0B' : 'transparent'} color={i < b.rating ? '#F59E0B' : 'var(--text-muted)'} />
                          ))}
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Rated {b.rating}/5</span>
                        </div>
                      )}

                      {b.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button
                            style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'rgba(244,67,54,0.06)', color: '#F44336', border: '1px solid rgba(244,67,54,0.15)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                            onClick={(e) => handleReject(e, b.id)}
                          >
                            Reject
                          </button>
                          <button
                            style={{ flex: 2, padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg,#1A73E8,#0D47A1)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 3px 10px rgba(26,115,232,0.3)' }}
                            onClick={(e) => handleAccept(e, b.id)}
                          >
                            ✓ Accept
                          </button>
                        </div>
                      )}

                      {b.status === 'accepted' && (
                        <button
                          style={{ marginTop: 12, width: '100%', padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg,#1A73E8,#0D47A1)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/provider/booking/${b.id}`); }}
                        >
                          View & Navigate →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
