import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, DollarSign, User, Star } from 'lucide-react';

export default function ProviderLayout() {
  return (
    <div className="page">
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
        <NavLink to="/provider/earnings" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <DollarSign size={22} />
          <span className="bottom-nav__label">Earnings</span>
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
