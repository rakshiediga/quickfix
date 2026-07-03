import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import useRealtimeNotifications from '../../hooks/useRealtimeNotifications';
import useAuthStore from '../../store/authStore';

const NOTIF_ICONS = {
  new_booking:        { icon: '🔔', color: '#FF9800', bg: '#FFF3E0' },
  booking_accepted:   { icon: '✅', color: '#4CAF50', bg: '#E8F5E9' },
  booking_rejected:   { icon: '❌', color: '#F44336', bg: '#FFEBEE' },
  service_started:    { icon: '🔧', color: '#2196F3', bg: '#E3F2FD' },
  service_completed:  { icon: '🎉', color: '#9C27B0', bg: '#F3E5F5' },
  new_review:         { icon: '⭐', color: '#FF9800', bg: '#FFF3E0' },
  account_approved:   { icon: '🎊', color: '#4CAF50', bg: '#E8F5E9' },
  account_rejected:   { icon: '⚠️', color: '#F44336', bg: '#FFEBEE' },
  default:            { icon: '📢', color: '#9E9E9E', bg: '#F5F5F5' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CustomerNotifications() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { notifications, unreadCount, markAllRead } = useRealtimeNotifications(profile?.id);

  const handleTap = (notif) => {
    if (notif.booking_id) {
      navigate(`/customer/tracking/${notif.booking_id}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: '#FF5722', color: '#fff', verticalAlign: 'middle' }}>
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#FF5722', background: 'none', border: 'none', cursor: 'pointer' }}>
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 20, border: '1.5px dashed var(--border-color)', marginTop: 20 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🔔</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>No notifications yet</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
              Booking confirmations and updates<br />will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => {
              const style = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
              return (
                <div
                  key={n.id}
                  onClick={() => handleTap(n)}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: n.is_read ? 'var(--bg-card)' : 'rgba(255,87,34,0.04)',
                    borderRadius: 14, padding: 14,
                    border: n.is_read ? '1px solid var(--border-light)' : '1.5px solid rgba(255,87,34,0.15)',
                    cursor: n.booking_id ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.is_read ? 600 : 800, fontSize: 14, marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 4 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5722', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
