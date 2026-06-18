import React, { useState } from 'react';
import { Search, Ban, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const USERS = [
  { id: '1', name: 'Priya Mehta', role: 'customer', phone: '+91 98765 43210', bookings: 8, joined: '10 Jan 2026', active: true, avatar: '👩' },
  { id: '2', name: 'Arjun Kumar', role: 'customer', phone: '+91 87654 32109', bookings: 3, joined: '15 Feb 2026', active: true, avatar: '👨' },
  { id: '3', name: 'Sana Raza', role: 'customer', phone: '+91 76543 21098', bookings: 12, joined: '5 Mar 2026', active: false, avatar: '👩‍💼' },
  { id: '4', name: 'Rajesh Kumar', role: 'provider', phone: '+91 65432 10987', bookings: 124, joined: '1 Jan 2026', active: true, avatar: '👨‍🔧' },
  { id: '5', name: 'Suresh Sharma', role: 'provider', phone: '+91 54321 09876', bookings: 87, joined: '20 Jan 2026', active: true, avatar: '👷' },
  { id: '6', name: 'Deepa Nair', role: 'provider', phone: '+91 43210 98765', bookings: 156, joined: '8 Feb 2026', active: true, avatar: '👩' },
];

export default function AdminUsers() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState(USERS);

  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.phone.includes(query));

  const toggleActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
    const user = users.find(u => u.id === id);
    toast.success(`${user?.name} ${user?.active ? 'deactivated' : 'activated'}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 14 }}>User Management</h1>
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <Search className="search-bar__icon" size={16} />
          <input placeholder="Search by name or phone..." value={query} onChange={e => setQuery(e.target.value)} />
          {query && <button className="input-action" onClick={() => setQuery('')}><X size={14} /></button>}
        </div>
        <div className="tab-bar">
          {[['all','All'],['customer','Customers'],['provider','Providers']].map(([id, label]) => (
            <div key={id} className={`tab-item ${roleFilter === id ? 'active' : ''}`} onClick={() => setRoleFilter(id)}>{label}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{filtered.length} users found</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(u => (
            <div key={u.id} className="card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="avatar avatar--md" style={{ background: 'var(--bg-tertiary)', fontSize: 22 }}>{u.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</span>
                    <span className={`badge ${u.role === 'provider' ? 'badge--in-progress' : 'badge--accepted'}`} style={{ fontSize: 10 }}>{u.role}</span>
                    {!u.active && <span className="badge badge--cancelled" style={{ fontSize: 10 }}>Banned</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.phone}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {u.bookings} bookings • Joined {u.joined}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(u.id)}
                  style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                    background: u.active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  title={u.active ? 'Deactivate' : 'Activate'}
                >
                  {u.active ? <Ban size={16} color="var(--brand-danger)" /> : <CheckCircle size={16} color="var(--brand-accent)" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
