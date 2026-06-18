import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Search, ClipboardList, User } from 'lucide-react';

export default function CustomerLayout() {
  return (
    <div className="page">
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--bottom-nav-height)' }}>
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLink to="/customer/home" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Home size={22} />
          <span className="bottom-nav__label">Home</span>
        </NavLink>
        <NavLink to="/customer/search" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Search size={22} />
          <span className="bottom-nav__label">Search</span>
        </NavLink>
        <NavLink to="/customer/bookings" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <ClipboardList size={22} />
          <span className="bottom-nav__label">Bookings</span>
        </NavLink>
        <NavLink to="/customer/profile" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span className="bottom-nav__label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
