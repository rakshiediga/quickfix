import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const PROVIDERS = [
  { id: '1', name: 'Rajesh Kumar', profession: 'plumber', phone: '+91 98765 43210', experience: 5, rating: 4.8, jobs: 124, verified: true, joined: '1 Jan 2026', avatar: '👨‍🔧', doc: true },
  { id: '2', name: 'Suresh Sharma', profession: 'electrician', phone: '+91 87654 32109', experience: 8, rating: 4.9, jobs: 87, verified: true, joined: '20 Jan 2026', avatar: '👷', doc: true },
  { id: '3', name: 'Deepak Verma', profession: 'carpenter', phone: '+91 76543 21098', experience: 3, rating: 0, jobs: 0, verified: false, joined: '18 Jun 2026', avatar: '👨', doc: true },
  { id: '4', name: 'Meena Pillai', profession: 'cleaner', phone: '+91 65432 10987', experience: 2, rating: 0, jobs: 0, verified: false, joined: '17 Jun 2026', avatar: '👩', doc: false },
  { id: '5', name: 'Hari Krishnan', profession: 'mechanic', phone: '+91 54321 09876', experience: 6, rating: 0, jobs: 0, verified: false, joined: '16 Jun 2026', avatar: '👨‍🏭', doc: true },
];

export default function AdminProviders() {
  const [providers, setProviders] = useState(PROVIDERS);
  const [tab, setTab] = useState('pending');

  const filtered = tab === 'all' ? providers : tab === 'pending' ? providers.filter(p => !p.verified) : providers.filter(p => p.verified);

  const verify = (id) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p));
    toast.success('Provider verified successfully! ✅');
  };

  const reject = (id) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    toast('Provider application rejected.', { icon: '❌' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 14 }}>Provider Verification</h1>
        <div className="tab-bar">
          {[['pending','⏳ Pending'],['verified','✅ Verified'],['all','All']].map(([id, label]) => (
            <div key={id} className={`tab-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">✅</div>
            <p className="empty-state__title">All caught up!</p>
            <p className="empty-state__text">No pending verifications</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} className="card" style={{ borderColor: !p.verified ? 'rgba(245,158,11,0.2)' : 'var(--border-light)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div className="avatar avatar--md" style={{ background: 'var(--bg-tertiary)', fontSize: 22 }}>{p.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                      {p.verified ? <span className="badge badge--verified">✓ Verified</span> : <span className="badge badge--pending">⏳ Pending</span>}
                    </div>
                    <div style={{ color: 'var(--brand-primary-light)', fontSize: 12, fontWeight: 500, textTransform: 'capitalize', marginTop: 2 }}>{p.profession} • {p.experience}y exp</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.phone} • Joined {p.joined}</div>
                    {p.verified && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.jobs} jobs • {p.rating}⭐ rating</div>}
                  </div>
                </div>

                {/* Doc status */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: p.doc ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                  {p.doc ? <CheckCircle size={14} color="var(--brand-accent)" /> : <XCircle size={14} color="var(--brand-danger)" />}
                  <span style={{ fontSize: 12, color: p.doc ? 'var(--brand-accent)' : 'var(--brand-danger)', fontWeight: 500 }}>
                    {p.doc ? 'ID document uploaded' : 'No document uploaded'}
                  </span>
                </div>

                {!p.verified && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn--secondary btn--sm" style={{ flex: 1 }}>
                      <Eye size={14} /> View Doc
                    </button>
                    <button className="btn btn--danger btn--sm" style={{ flex: 1 }} onClick={() => reject(p.id)}>Reject</button>
                    <button className="btn btn--success btn--sm" style={{ flex: 1 }} onClick={() => verify(p.id)}>Verify ✓</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
