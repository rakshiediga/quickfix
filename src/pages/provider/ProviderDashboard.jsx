import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Star, Settings } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const PENDING_BOOKINGS = [
  { id: 'BK101', customer: 'Priya M.', address: 'Koramangala, 4th Block', service: 'Plumbing Repair', time: '10:30 AM', amount: 385, avatar: '👩' },
  { id: 'BK102', customer: 'Arjun K.', address: 'HSR Layout, Sector 2', service: 'Pipe Leak Fix', time: '2:00 PM', amount: 450, avatar: '👨' },
];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await new Promise(r => setTimeout(r, 400));
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    toast.success(newStatus ? '🟢 You are now Online!' : '⚫ You are now Offline');
    setToggling(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 20px', background: 'var(--gradient-dark)', borderBottom: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,158,11,0.1)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Welcome back 👋</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{profile?.full_name?.split(' ')[0] || 'Provider'}</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="header__back" style={{ position: 'relative' }}><Bell size={18} /><div className="notif-dot" /></button>
            <button className="header__back" onClick={() => navigate('/provider/profile')}><Settings size={18} /></button>
          </div>
        </div>
        <div className={`availability-bar ${isOnline ? 'online' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{isOnline ? '🟢 Online' : '⚫ Offline'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{isOnline ? 'Accepting new bookings' : 'Not accepting bookings'}</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isOnline} onChange={handleToggle} disabled={toggling} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: "Today's Earnings", value: '₹1,240', icon: '💰' },
            { label: 'Jobs Today', value: '3', icon: '✅' },
            { label: 'Avg Rating', value: '4.8 ⭐', icon: '⭐' },
            { label: 'Pending', value: `${PENDING_BOOKINGS.length}`, icon: '🕐' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__icon" style={{ background: 'rgba(124,58,237,0.1)' }}><span style={{ fontSize: 20 }}>{s.icon}</span></div>
              <div className="stat-card__value" style={{ fontSize: 22 }}>{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="section-header">
            <h3 className="section-title">New Requests</h3>
            <button className="btn btn--ghost btn--sm" style={{ color: 'var(--text-link)' }} onClick={() => navigate('/provider/bookings')}>View all</button>
          </div>
          {PENDING_BOOKINGS.map(b => (
            <div key={b.id} className="card" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div className="avatar avatar--md" style={{ background: 'var(--bg-tertiary)', fontSize: 22 }}>{b.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{b.customer}</div>
                  <div style={{ color: 'var(--brand-primary-light)', fontSize: 12 }}>{b.service}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>📍 {b.address} • 🕐 {b.time}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--brand-accent)', fontSize: 16 }}>₹{b.amount}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn--danger btn--sm" style={{ flex: 1 }}>Reject</button>
                <button className="btn btn--success btn--sm" style={{ flex: 2 }} onClick={() => navigate(`/provider/booking/${b.id}`)}>Accept & View</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="section-title" style={{ marginBottom: 12 }}>This Week</h3>
          <div className="card">
            {[
              { label: 'Total Earnings', value: '₹6,840', pos: true },
              { label: 'Jobs Completed', value: '18 jobs', pos: true },
              { label: 'Commission Paid', value: '₹1,026', pos: false },
              { label: 'Net Earnings', value: '₹5,814', pos: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: s.pos ? 'var(--brand-accent)' : 'var(--brand-danger)', fontSize: 14 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
