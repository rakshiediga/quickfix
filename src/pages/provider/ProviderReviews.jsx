import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
  { customer: 'Priya M.', avatar: '👩', rating: 5, comment: 'Excellent work! Very professional and arrived on time. Fixed the issue in no time.', date: '2 days ago', service: 'Plumbing Repair' },
  { customer: 'Arjun K.', avatar: '👨', rating: 5, comment: 'Highly recommended! Suresh is very skilled and explained everything clearly.', date: '1 week ago', service: 'Pipe Leak Fix' },
  { customer: 'Sana R.', avatar: '👩‍💼', rating: 4, comment: 'Good service. A bit late but work quality is great. Will book again.', date: '2 weeks ago', service: 'Tap Replacement' },
  { customer: 'Ravi T.', avatar: '👨‍💼', rating: 5, comment: 'Perfect job. Very neat and clean work. Highly professional.', date: '3 weeks ago', service: 'Drain Cleaning' },
  { customer: 'Meenal S.', avatar: '👩', rating: 3, comment: 'Average experience. Work was done but took longer than expected.', date: '1 month ago', service: 'Water Heater Repair' },
];

const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
const dist = [5,4,3,2,1].map(r => ({ rating: r, count: REVIEWS.filter(rv => rv.rating === r).length }));

export default function ProviderReviews() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>My Reviews</h1>
      </div>

      <div style={{ padding: 16 }}>
        {/* Rating summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, background: 'var(--gradient-secondary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{avg}</div>
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginBottom: 4 }}>
                {[...Array(5)].map((_,i) => <Star key={i} size={14} fill={i < Math.round(avg) ? '#F59E0B' : 'transparent'} color={i < Math.round(avg) ? '#F59E0B' : 'var(--text-muted)'} />)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{REVIEWS.length} reviews</div>
            </div>
            <div style={{ flex: 1 }}>
              {dist.map(d => (
                <div key={d.rating} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 10 }}>{d.rating}</span>
                  <Star size={10} fill="#F59E0B" color="#F59E0B" />
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(d.count / REVIEWS.length) * 100}%`, background: 'var(--gradient-secondary)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 16 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="avatar avatar--sm" style={{ background: 'var(--bg-tertiary)', fontSize: 18 }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.customer}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.service}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_,j) => <Star key={j} size={12} fill={j < r.rating ? '#F59E0B' : 'transparent'} color={j < r.rating ? '#F59E0B' : 'var(--text-muted)'} />)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.date}</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
