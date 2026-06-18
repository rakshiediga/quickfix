import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, ClipboardList, Percent } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="page">
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--bottom-nav-height)' }}>
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span className="bottom-nav__label">Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span className="bottom-nav__label">Users</span>
        </NavLink>
        <NavLink to="/admin/providers" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <ShieldCheck size={20} />
          <span className="bottom-nav__label">Providers</span>
        </NavLink>
        <NavLink to="/admin/bookings" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span className="bottom-nav__label">Bookings</span>
        </NavLink>
        <NavLink to="/admin/commissions" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Percent size={20} />
          <span className="bottom-nav__label">Commission</span>
        </NavLink>
      </nav>
    </div>
  );
}
