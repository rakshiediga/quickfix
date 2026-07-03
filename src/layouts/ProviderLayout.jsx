import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, DollarSign, User, Star, Bell } from 'lucide-react';
import useRealtimeNotifications from '../hooks/useRealtimeNotifications';
import useAuthStore from '../store/authStore';

export default function ProviderLayout() {
  const { profile } = useAuthStore();
  const { unreadCount } = useRealtimeNotifications(profile?.id);

  return (
    <div className="page provider-layout-root">
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--bottom-nav-height)' }}>
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLink to="/provider/dashboard" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={22} />
          <span className="bottom-nav__label">Dashboard</span>
        </NavLink>
        <NavLink to="/provider/bookings" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <ClipboardList size={22} />
          <span className="bottom-nav__label">Bookings</span>
        </NavLink>
        <NavLink to="/provider/notifications" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Bell size={22} />
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -6,
                minWidth: 16, height: 16, borderRadius: 8,
                background: '#FF5722', color: '#fff',
                fontSize: 10, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <span className="bottom-nav__label">Alerts</span>
        </NavLink>
        <NavLink to="/provider/reviews" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Star size={22} />
          <span className="bottom-nav__label">Reviews</span>
        </NavLink>
        <NavLink to="/provider/profile" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span className="bottom-nav__label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
