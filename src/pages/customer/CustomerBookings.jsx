import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Star, RefreshCw, MapPin } from 'lucide-react';
import { getBookings } from '../../lib/db';
import useAuthStore from '../../store/authStore';

const STATUS_LABEL = {
  pending:     { label: 'Pending',     color: '#E65100', bg: '#FFF3E0' },
  accepted:    { label: 'Accepted',    color: '#1565C0', bg: '#E3F2FD' },
  in_progress: { label: 'In Progress', color: '#6A1B9A', bg: '#F3E5F5' },
  completed:   { label: 'Completed',   color: '#2E7D32', bg: '#E8F5E9' },
  cancelled:   { label: 'Cancelled',   color: '#C62828', bg: '#FFEBEE' },
};

export default function CustomerBookings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getBookings(user.id, 'customer');
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    in_progress: bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>My Bookings</h1>
          <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E' }}>
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          {[
            ['all', '📋 All'],
            ['pending', '⏳ Pending'],
            ['in_progress', '🔄 Active'],
            ['completed', '✅ Done'],
            ['cancelled', '❌ Cancelled'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', flexShrink: 0,
                background: tab === id ? '#FF5722' : 'var(--bg-tertiary)',
                color: tab === id ? '#fff' : 'var(--text-secondary)',
                boxShadow: tab === id ? '0 2px 8px rgba(255,87,34,0.3)' : 'none',
              }}
            >
              {label}
              {counts[id] > 0 && (
                <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 800, background: tab === id ? 'rgba(255,255,255,0.25)' : 'rgba(255,87,34,0.1)', color: tab === id ? '#fff' : '#FF5722', borderRadius: 10, padding: '1px 5px' }}>
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 14, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '35%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', background: 'var(--bg-card)', borderRadius: 20, border: '1.5px dashed var(--border-color)' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>
              {tab === 'all' ? '📋' : tab === 'completed' ? '🏆' : tab === 'cancelled' ? '😔' : '🕐'}
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
              {tab === 'all' ? 'No bookings yet' : `No ${tab} bookings`}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              {tab === 'all' ? 'Book a service to get started!' : 'Nothing here yet.'}
            </p>
            {tab === 'all' && (
              <button
                onClick={() => navigate('/customer/search')}
                style={{ padding: '12px 24px', borderRadius: 12, background: '#FF5722', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                Browse Services
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(b => {
              const statusStyle = STATUS_LABEL[b.status] || STATUS_LABEL.pending;
              const providerName = b.provider?.full_name || b.provider_name || 'Provider';
              const providerAvatar = b.provider?.avatar_url;
              const date = b.scheduled_at
                ? new Date(b.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                : new Date(b.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/customer/tracking/${b.id}`)}
                  style={{
                    background: 'var(--bg-card)', borderRadius: 14, padding: 14,
                    border: `1.5px solid ${statusStyle.color}22`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Provider avatar */}
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: statusStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
                      {providerAvatar
                        ? <img src={providerAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : providerName[0]?.toUpperCase() || '🔧'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{providerName}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: statusStyle.bg, color: statusStyle.color, flexShrink: 0, marginLeft: 8 }}>
                          {statusStyle.label}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#FF5722', fontWeight: 600, textTransform: 'capitalize', marginBottom: 6 }}>
                        {b.service_name || 'Service'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕐 {date}</span>
                        {b.amount && <span style={{ fontWeight: 800, color: '#00C853', fontSize: 14 }}>₹{b.amount}</span>}
                      </div>

                      {b.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                          <MapPin size={10} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.address}</span>
                        </div>
                      )}

                      {/* Active booking CTA */}
                      {(b.status === 'accepted' || b.status === 'in_progress') && (
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/customer/tracking/${b.id}`); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #FF5722, #FF8A65)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                        >
                          📍 Track Live
                        </button>
                      )}

                      {/* Completed: star rating display */}
                      {b.status === 'completed' && b.rating && (
                        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={11} fill={i <= b.rating ? '#F59E0B' : 'transparent'} color={i <= b.rating ? '#F59E0B' : 'var(--text-muted)'} />
                          ))}
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>Rated {b.rating}/5</span>
                        </div>
                      )}

                      {/* Booking ID */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{b.id?.slice(-8)}</span>
                        <ChevronRight size={14} color="var(--text-muted)" />
                      </div>
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
