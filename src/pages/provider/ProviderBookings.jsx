import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, MessageCircle } from 'lucide-react';

const MOCK_BOOKINGS = [
  { id: 'BK101', customer: 'Priya M.', service: 'Plumbing Repair', avatar: '👩', status: 'pending', date: '19 Jun', time: '10:30 AM', amount: 385 },
  { id: 'BK102', customer: 'Arjun K.', service: 'Pipe Leak Fix', avatar: '👨', status: 'accepted', date: '19 Jun', time: '2:00 PM', amount: 450 },
  { id: 'BK103', customer: 'Sana R.', service: 'Tap Replacement', avatar: '👩‍💼', status: 'completed', date: '18 Jun', time: '11:00 AM', amount: 320, rating: 4 },
  { id: 'BK104', customer: 'Ravi T.', service: 'Drain Cleaning', avatar: '👨‍💼', status: 'completed', date: '17 Jun', time: '3:00 PM', amount: 280, rating: 5 },
  { id: 'BK105', customer: 'Meenal S.', service: 'Water Heater', avatar: '👩', status: 'cancelled', date: '16 Jun', time: '9:00 AM', amount: 550 },
];

const STATUS_LABEL = { pending: 'New', accepted: 'Active', in_progress: 'In Progress', completed: 'Done', cancelled: 'Cancelled' };

export default function ProviderBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const filtered = tab === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === tab);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Bookings</h1>
        <div className="scroll-x">
          {[['all','📋 All'],['pending','🔔 New'],['accepted','🔄 Active'],['completed','✅ Done'],['cancelled','❌ Cancelled']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`filter-chip ${tab === id ? 'active' : ''}`}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <p className="empty-state__title">No bookings here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(b => (
              <div key={b.id} className="card card--interactive" onClick={() => navigate(`/provider/booking/${b.id}`)}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="avatar avatar--md" style={{ background: 'var(--bg-tertiary)', fontSize: 22 }}>{b.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{b.customer}</div>
                        <div style={{ color: 'var(--brand-primary-light)', fontSize: 12, fontWeight: 500 }}>{b.service}</div>
                      </div>
                      <span className={`badge badge--${b.status.replace('_','-')}`}>{STATUS_LABEL[b.status]}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.date} • {b.time}</span>
                      <span style={{ fontWeight: 700, color: 'var(--brand-accent)' }}>₹{b.amount}</span>
                    </div>
                    {b.rating && (
                      <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                        {[...Array(5)].map((_,i) => <Star key={i} size={12} fill={i < b.rating ? '#F59E0B' : 'transparent'} color={i < b.rating ? '#F59E0B' : 'var(--text-muted)'} />)}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Customer rated</span>
                      </div>
                    )}
                    {b.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button className="btn btn--danger btn--sm" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); }}>Reject</button>
                        <button className="btn btn--success btn--sm" style={{ flex: 2 }} onClick={e => { e.stopPropagation(); navigate(`/provider/booking/${b.id}`); }}>Accept</button>
                      </div>
                    )}
                    {b.status === 'accepted' && (
                      <button className="btn btn--primary btn--sm" style={{ marginTop: 10, width: '100%' }} onClick={e => { e.stopPropagation(); navigate(`/provider/booking/${b.id}`); }}>
                        View & Navigate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
