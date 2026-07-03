import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WEEKLY = [
  { day: 'Mon', earnings: 1200 }, { day: 'Tue', earnings: 800 },
  { day: 'Wed', earnings: 1500 }, { day: 'Thu', earnings: 600 },
  { day: 'Fri', earnings: 1800 }, { day: 'Sat', earnings: 2200 }, { day: 'Sun', earnings: 740 },
];

const MONTHLY = [
  { week: 'Wk 1', earnings: 5400 }, { week: 'Wk 2', earnings: 7200 },
  { week: 'Wk 3', earnings: 6100 }, { week: 'Wk 4', earnings: 8300 },
];

const TRANSACTIONS = [
  { id: 'BK103', customer: 'Sana R.', service: 'Tap Replacement', amount: 272, date: '18 Jun', status: 'paid' },
  { id: 'BK104', customer: 'Ravi T.', service: 'Drain Cleaning', amount: 238, date: '17 Jun', status: 'paid' },
  { id: 'BK099', customer: 'Kavya M.', service: 'Pipe Repair', amount: 340, date: '16 Jun', status: 'paid' },
  { id: 'BK095', customer: 'Neel S.', service: 'Shower Fix', amount: 425, date: '15 Jun', status: 'paid' },
];

export default function ProviderEarnings() {
  const [period, setPeriod] = useState('weekly');
  const data = period === 'weekly' ? WEEKLY : MONTHLY;
  const key = period === 'weekly' ? 'day' : 'week';
  const total = data.reduce((s, d) => s + d.earnings, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header banner */}
      <div style={{
        padding: '48px 16px 20px',
        background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#FFFFFF' }}>
          Earnings
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Track your income and payouts</p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Summary grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Earned', value: '₹42,800', sub: 'All time', color: '#1A73E8' },
            { label: 'This Month', value: '₹8,640', sub: 'June 2026', color: '#0D47A1' },
            { label: 'Pending Payout', value: '₹1,200', sub: 'Processing', color: '#1976D2' },
            { label: 'Commission Fee', value: '₹6,420', sub: 'Platform fee (15%)', color: '#F44336' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card__value" style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
              <div className="stat-card__label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Period toggle tab bar */}
        <div className="tab-bar" style={{
          marginBottom: 16,
          background: 'var(--bg-tertiary)',
          borderRadius: 12,
          display: 'flex',
          padding: 4
        }}>
          {['weekly', 'monthly'].map(p => {
            const active = period === p;
            return (
              <div
                key={p}
                className={`tab-item ${active ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px 0',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? '#1A73E8' : 'var(--text-muted)',
                  boxShadow: active ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </div>
            );
          })}
        </div>

        {/* Chart Card */}
        <div className="chart-area" style={{
          marginBottom: 20,
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {period === 'weekly' ? 'This Week' : 'This Month'}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ₹{total.toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,200,83,0.1)', borderRadius: 100, padding: '4px 10px' }}>
              <span style={{ color: '#00C853', fontSize: 11, fontWeight: 700 }}>↑ 12%</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
              <XAxis dataKey={key} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}
                formatter={(v) => [`₹${v}`, 'Earnings']}
              />
              <Area type="monotone" dataKey="earnings" stroke="#1A73E8" strokeWidth={2.5} fill="url(#earningsGrad)" dot={{ fill: '#1A73E8', r: 3 }} activeDot={{ r: 5, fill: '#0D47A1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions List */}
        <div>
          <h3 className="section-title" style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Recent Payouts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRANSACTIONS.map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,200,83,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    💰
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{t.service}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.customer} • {t.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#00C853', fontSize: 14 }}>
                    +₹{t.amount}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{t.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
