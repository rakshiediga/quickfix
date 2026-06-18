import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, User, MapPin, Bell, Shield, HelpCircle, Star, Phone } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const menuItems = [
    { icon: <User size={18} />, label: 'Personal Information', action: () => {} },
    { icon: <MapPin size={18} />, label: 'Saved Addresses', action: () => {} },
    { icon: <Bell size={18} />, label: 'Notifications', action: () => {} },
    { icon: <Shield size={18} />, label: 'Privacy & Security', action: () => {} },
    { icon: <HelpCircle size={18} />, label: 'Help & Support', action: () => {} },
    { icon: <Star size={18} />, label: 'Rate the App', action: () => {} },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Profile header */}
      <div style={{ background: 'var(--gradient-dark)', padding: '48px 20px 32px', borderBottom: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(124,58,237,0.1)' }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div className="avatar avatar--xl" style={{ background: 'var(--gradient-primary)', color: '#fff', fontSize: 32, fontWeight: 800 }}>
            {profile?.full_name?.[0] || '?'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              {profile?.full_name || 'Customer'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
              <Phone size={13} />
              <span>{profile?.phone || '+91 98765 43210'}</span>
            </div>
            <span className="badge badge--verified" style={{ marginTop: 6 }}>✓ Verified</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20, position: 'relative', zIndex: 1 }}>
          {[{ label: 'Bookings', value: '12' }, { label: 'Reviews', value: '8' }, { label: 'Saved', value: '5' }].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {menuItems.map(item => (
            <button key={item.label} onClick={item.action} className="list-item">
              <div className="list-item__icon" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--brand-primary-light)' }}>
                {item.icon}
              </div>
              <div className="list-item__content">
                <div className="list-item__title" style={{ fontSize: 14 }}>{item.label}</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>
          ))}
        </div>

        {/* App info */}
        <div style={{ textAlign: 'center', marginBottom: 24, color: 'var(--text-muted)', fontSize: 12 }}>
          <p>QuickFix v1.0.0</p>
          <p style={{ marginTop: 4 }}>Made with ❤️ in India</p>
        </div>

        {/* Logout */}
        <button className="btn btn--danger btn--full" onClick={() => setShowLogout(true)}>
          <LogOut size={18} /> Log Out
        </button>
      </div>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="modal-overlay modal-overlay--center">
          <div className="modal modal--center">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
              <h3 className="modal__title">Log Out?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Are you sure you want to log out of QuickFix?</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn btn--danger" style={{ flex: 1 }} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
