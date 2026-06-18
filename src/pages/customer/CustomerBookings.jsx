import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Star } from 'lucide-react';

const MOCK_BOOKINGS = [
  { id: 'BK001', provider: 'Rajesh Kumar', profession: 'Plumber', avatar: '👨‍🔧', status: 'completed', date: '15 Jun 2026', time: '10:00 AM', amount: 385, rating: 5 },
  { id: 'BK002', provider: 'Suresh Sharma', profession: 'Electrician', avatar: '👷', status: 'in_progress', date: '19 Jun 2026', time: '2:00 PM', amount: 437, rating: null },
  { id: 'BK003', provider: 'Amit Patel', profession: 'Carpenter', avatar: '🧑‍🏭', status: 'pending', date: '20 Jun 2026', time: '11:00 AM', amount: 499, rating: null },
  { id: 'BK004', provider: 'Vijay Yadav', profession: 'Mechanic', avatar: '👨‍🔧', status: 'cancelled', date: '12 Jun 2026', time: '9:00 AM', amount: 308, rating: null },
];

const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', rejected: 'Rejected' };

export default function CustomerBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 16 }}>My Bookings</h1>
        <div className="scroll-x">
          {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`filter-chip ${activeTab === t ? 'active' : ''}`}>
              {t === 'all' ? '📋 All' : t === 'in_progress' ? '🔄 In Progress' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><ClipboardList size={32} color="var(--text-muted)" /></div>
            <p className="empty-state__title">No bookings yet</p>
            <p className="empty-state__text">Book a service to get started</p>
            <button className="btn btn--primary btn--sm" onClick={() => navigate('/customer/search')}>Browse Services</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(b => (
              <div key={b.id} className="card card--interactive" onClick={() => navigate(`/customer/tracking/${b.id}`)}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="avatar avatar--md" style={{ background: 'var(--bg-tertiary)', fontSize: 22 }}>{b.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{b.provider}</div>
                        <div style={{ color: 'var(--brand-primary-light)', fontSize: 12, fontWeight: 500 }}>{b.profession}</div>
                      </div>
                      <span className={`badge badge--${b.status.replace('_', '-')}`}>{STATUS_LABEL[b.status]}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.date} • {b.time}</span>
                      <span style={{ fontWeight: 700, color: 'var(--brand-accent)', fontFamily: 'var(--font-display)' }}>₹{b.amount}</span>
                    </div>
                    {b.status === 'completed' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        {b.rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < b.rating ? '#F59E0B' : 'transparent'} color={i < b.rating ? '#F59E0B' : 'var(--text-muted)'} />)}
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rated</span>
                          </div>
                        ) : (
                          <button className="btn btn--sm btn--outline" onClick={e => { e.stopPropagation(); }}>Rate Service</button>
                        )}
                        <button className="btn btn--sm btn--ghost" onClick={e => { e.stopPropagation(); navigate('/customer/search'); }}>Re-book</button>
                      </div>
                    )}
                    {b.status === 'in_progress' && (
                      <button className="btn btn--sm btn--primary" style={{ marginTop: 8 }} onClick={e => { e.stopPropagation(); navigate(`/customer/tracking/${b.id}`); }}>
                        Track Live
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>#{b.id}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
