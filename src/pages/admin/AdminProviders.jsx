import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search, RefreshCw, MapPin, Phone, Briefcase, Star, Loader } from 'lucide-react';
import { getPendingProviders, approveProvider } from '../../lib/db';
import toast from 'react-hot-toast';

const TAB_FILTERS = {
  pending:  p => !p.approval_status || p.approval_status === 'pending',
  approved: p => p.approval_status === 'approved',
  rejected: p => p.approval_status === 'rejected',
  all:      ()  => true,
};

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await getPendingProviders();
    setProviders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = providers
    .filter(TAB_FILTERS[tab] || TAB_FILTERS.all)
    .filter(p => !query || p.full_name?.toLowerCase().includes(query.toLowerCase()) || p.profession?.toLowerCase().includes(query.toLowerCase()));

  const handleApprove = async (id) => {
    setActionId(id);
    await approveProvider(id, true);
    setProviders(prev => prev.map(p => p.id === id ? { ...p, approval_status: 'approved' } : p));
    toast.success('✅ Provider approved! Now visible to customers.');
    setActionId(null);
  };

  const handleReject = async (id) => {
    setActionId(id);
    await approveProvider(id, false);
    setProviders(prev => prev.map(p => p.id === id ? { ...p, approval_status: 'rejected' } : p));
    toast('Provider application rejected.', { icon: '❌' });
    setActionId(null);
  };

  const counts = {
    pending:  providers.filter(TAB_FILTERS.pending).length,
    approved: providers.filter(TAB_FILTERS.approved).length,
    rejected: providers.filter(TAB_FILTERS.rejected).length,
    all:      providers.length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Provider Approval</h1>
          <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E' }} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, border: '1px solid var(--border-light)' }}>
          <Search size={16} color="#9E9E9E" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search providers..."
            style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: 14, color: 'var(--text-primary)' }}
          />
        </div>

        {/* Tabs */}
        <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          {[
            ['pending', '⏳ Pending'],
            ['approved', '✅ Approved'],
            ['rejected', '❌ Rejected'],
            ['all', '📋 All'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', flexShrink: 0,
                background: tab === id ? '#1A73E8' : 'var(--bg-tertiary)',
                color: tab === id ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {label}
              {counts[id] > 0 && (
                <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 800, background: tab === id ? 'rgba(255,255,255,0.25)' : 'rgba(26,115,232,0.1)', color: tab === id ? '#fff' : '#1A73E8', borderRadius: 10, padding: '1px 5px' }}>
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 16, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '45%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '35%', borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', background: 'var(--bg-card)', borderRadius: 20, border: '1.5px dashed var(--border-color)', marginTop: 8 }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>
              {tab === 'pending' ? '🎉' : tab === 'approved' ? '✅' : '🔍'}
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>
              {tab === 'pending' ? 'No pending applications!' : `No ${tab} providers`}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {tab === 'pending' ? 'All provider applications have been reviewed.' : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(p => {
              const avatar = p.profile_photo || p.avatar_url;
              const approval = p.approval_status || 'pending';
              const isActioning = actionId === p.id;

              return (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--bg-card)', borderRadius: 16, padding: 16,
                    border: `1.5px solid ${
                      approval === 'approved' ? 'rgba(76,175,80,0.2)' :
                      approval === 'rejected' ? 'rgba(244,67,54,0.15)' :
                      'rgba(245,158,11,0.2)'
                    }`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Provider Header */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
                      {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.full_name?.[0]?.toUpperCase() || '👤'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{p.full_name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                          background: approval === 'approved' ? '#E8F5E9' : approval === 'rejected' ? '#FFEBEE' : '#FFF3E0',
                          color: approval === 'approved' ? '#2E7D32' : approval === 'rejected' ? '#C62828' : '#E65100',
                        }}>
                          {approval === 'approved' ? '✓ Approved' : approval === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1A73E8', fontWeight: 600, textTransform: 'capitalize' }}>
                        <Briefcase size={11} /> {p.profession} · {p.experience_years || 0}y exp
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                        {p.phone && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Phone size={10} /> {p.phone}
                          </span>
                        )}
                        {(p.city || p.state) && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={10} /> {[p.city, p.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {p.avg_rating > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={10} fill="#F59E0B" color="#F59E0B" /> {p.avg_rating} ({p.total_reviews})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Email', value: p.email || '—' },
                      { label: 'Service Area', value: p.service_areas || p.city || '—' },
                      { label: 'Charge', value: p.per_visit_charge ? `₹${p.per_visit_charge}/visit` : p.service_charge ? `₹${p.service_charge}/hr` : '—' },
                      { label: 'Registered', value: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '6px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{item.label.toUpperCase()}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Docs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, marginBottom: 14, background: p.id_proof_url ? 'rgba(76,175,80,0.07)' : 'rgba(244,67,54,0.06)', border: `1px solid ${p.id_proof_url ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.15)'}` }}>
                    {p.id_proof_url ? <CheckCircle size={13} color="#4CAF50" /> : <XCircle size={13} color="#F44336" />}
                    <span style={{ fontSize: 12, color: p.id_proof_url ? '#2E7D32' : '#C62828', fontWeight: 600 }}>
                      {p.id_proof_url ? 'ID document uploaded' : 'No ID document'}
                    </span>
                    {p.selfie_photo && (
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#4CAF50', fontWeight: 600 }}>✓ Selfie</span>
                    )}
                  </div>

                  {/* Bio */}
                  {p.bio && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14, padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                      "{p.bio.slice(0, 120)}{p.bio.length > 120 ? '…' : ''}"
                    </div>
                  )}

                  {/* Action buttons — only for pending */}
                  {approval === 'pending' && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => handleReject(p.id)}
                        disabled={isActioning}
                        style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(244,67,54,0.07)', color: '#F44336', border: '1.5px solid rgba(244,67,54,0.18)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <XCircle size={15} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={isActioning}
                        style={{ flex: 2, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 12px rgba(76,175,80,0.35)' }}
                      >
                        {isActioning ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle size={15} /> Approve & Publish</>}
                      </button>
                    </div>
                  )}

                  {/* Already approved — revoke option */}
                  {approval === 'approved' && (
                    <button
                      onClick={() => handleReject(p.id)}
                      disabled={isActioning}
                      style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'rgba(244,67,54,0.05)', color: '#F44336', border: '1px solid rgba(244,67,54,0.15)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >
                      Revoke Approval
                    </button>
                  )}

                  {/* Rejected — can re-approve */}
                  {approval === 'rejected' && (
                    <button
                      onClick={() => handleApprove(p.id)}
                      disabled={isActioning}
                      style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >
                      ↩ Approve Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
