import React, { useState } from 'react';
import { Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 1, name: 'Plumber', emoji: '🔧', rate: 15 },
  { id: 2, name: 'Electrician', emoji: '⚡', rate: 15 },
  { id: 3, name: 'Carpenter', emoji: '🪚', rate: 12 },
  { id: 4, name: 'Mechanic', emoji: '🔩', rate: 18 },
  { id: 5, name: 'Painter', emoji: '🖌️', rate: 12 },
  { id: 6, name: 'Cleaner', emoji: '🧹', rate: 10 },
  { id: 7, name: 'AC Repair', emoji: '❄️', rate: 20 },
  { id: 8, name: 'Pest Control', emoji: '🐛', rate: 15 },
];

export default function AdminCommissions() {
  const [rates, setRates] = useState(Object.fromEntries(CATEGORIES.map(c => [c.id, c.rate])));
  const [globalRate, setGlobalRate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Commission rates updated successfully!');
    setSaving(false);
  };

  const applyGlobal = () => {
    if (!globalRate || isNaN(globalRate) || globalRate < 0 || globalRate > 50) {
      toast.error('Enter a valid rate between 0-50%'); return;
    }
    setRates(Object.fromEntries(CATEGORIES.map(c => [c.id, parseFloat(globalRate)])));
    toast.success('Global rate applied to all categories');
    setGlobalRate('');
  };

  const avgRate = (Object.values(rates).reduce((s, r) => s + r, 0) / CATEGORIES.length).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Commission Rates</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage platform commission per service category</p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Avg Rate', value: `${avgRate}%` },
            { label: 'Total Earned', value: '₹1.2L' },
            { label: 'This Month', value: '₹18K' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
          <Info size={16} color="#3B82F6" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Commission is deducted from provider's earnings for each completed booking. Changes apply to all new bookings.
          </p>
        </div>

        {/* Global rate setter */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Apply Global Rate</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input className="form-input" type="number" placeholder="e.g. 15" value={globalRate} onChange={e => setGlobalRate(e.target.value)} min="0" max="50" style={{ paddingRight: 36 }} />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>%</span>
            </div>
            <button className="btn btn--secondary" onClick={applyGlobal}>Apply All</button>
          </div>
        </div>

        {/* Per-category rates */}
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Per Category Rates</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{cat.emoji}</div>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{cat.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={rates[cat.id]}
                    onChange={e => setRates(prev => ({ ...prev, [cat.id]: parseFloat(e.target.value) || 0 }))}
                    min="0" max="50"
                    style={{
                      width: 68, padding: '8px 24px 8px 10px',
                      background: 'var(--bg-input)', border: '1.5px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                      fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)',
                      outline: 'none', textAlign: 'center',
                    }}
                  />
                  <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary-light)', fontSize: 13, fontWeight: 700 }}>%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn--primary btn--full btn--lg" onClick={handleSave} disabled={saving}>
          {saving ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> : <><Save size={18} /> Save Commission Rates</>}
        </button>
      </div>
    </div>
  );
}
