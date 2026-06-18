import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const BOOKINGS = [
  { id: 'BK1247', customer: 'Priya M.', provider: 'Rajesh K.', service: 'Plumbing', status: 'completed', amount: 385, date: '19 Jun', commission: 58 },
  { id: 'BK1246', customer: 'Arjun K.', provider: 'Suresh S.', service: 'Electrical', status: 'in_progress', amount: 437, date: '19 Jun', commission: 66 },
  { id: 'BK1245', customer: 'Sana R.', provider: 'Amit P.', service: 'Carpentry', status: 'pending', amount: 499, date: '19 Jun', commission: 75 },
  { id: 'BK1244', customer: 'Ravi T.', provider: 'Vijay Y.', service: 'Mechanic', status: 'cancelled', amount: 308, date: '18 Jun', commission: 0 },
  { id: 'BK1243', customer: 'Meena S.', provider: 'Deepa N.', service: 'Cleaning', status: 'completed', amount: 249, date: '18 Jun', commission: 37 },
  { id: 'BK1242', customer: 'Karan M.', provider: 'Rajesh K.', service: 'Plumbing', status: 'completed', amount: 320, date: '17 Jun', commission: 48 },
];

const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };

export default function AdminBookings() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = BOOKINGS
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => !query || b.id.toLowerCase().includes(query.toLowerCase()) || b.customer.toLowerCase().includes(query.toLowerCase()) || b.provider.toLowerCase().includes(query.toLowerCase()));

  const totalRevenue = filtered.filter(b => b.status === 'completed').reduce((s, b) => s + b.amount, 0);
  const totalCommission = filtered.filter(b => b.status === 'completed').reduce((s, b) => s + b.commission, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Booking Management</h1>
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <Search className="search-bar__icon" size={16} />
          <input placeholder="Search bookings, customers..." value={query} onChange={e => setQuery(e.target.value)} />
          {query && <button className="input-action" onClick={() => setQuery('')}><X size={14} /></button>}
        </div>
        <div className="scroll-x">
          {[['all','All'],['pending','Pending'],['in_progress','Active'],['completed','Completed'],['cancelled','Cancelled']].map(([id, label]) => (
            <button key={id} onClick={() => setStatusFilter(id)} className={`filter-chip ${statusFilter === id ? 'active' : ''}`}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total', value: filtered.length },
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}` },
            { label: 'Commission', value: `₹${totalCommission}` },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--brand-primary-light)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => (
            <div key={b.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>#{b.id}</span>
                    <span className={`badge badge--${b.status.replace('_','-')}`}>{STATUS_LABEL[b.status]}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.service} • {b.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--brand-accent)', fontFamily: 'var(--font-display)' }}>₹{b.amount}</div>
                  {b.commission > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+₹{b.commission} commission</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👤 <b>{b.customer}</b></div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👷 <b>{b.provider}</b></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
