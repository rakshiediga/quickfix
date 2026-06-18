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
      <div style={{ padding: '48px 16px 20px', background: 'var(--gradient-dark)', borderBottom: '1px solid var(--border-light)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Earnings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Track your income and payouts</p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Earned', value: '₹42,800', sub: 'All time' },
            { label: 'This Month', value: '₹8,640', sub: 'June 2026' },
            { label: 'Pending', value: '₹1,200', sub: 'Processing' },
            { label: 'Commission', value: '₹6,420', sub: 'Platform fee' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__value" style={{ fontSize: 20 }}>{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Period toggle */}
        <div className="tab-bar" style={{ marginBottom: 16 }}>
          {['weekly','monthly'].map(p => (
            <div key={p} className={`tab-item ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="chart-area" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {period === 'weekly' ? 'This Week' : 'This Month'}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ₹{total.toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-full)', padding: '4px 10px' }}>
              <span style={{ color: 'var(--brand-accent)', fontSize: 12, fontWeight: 700 }}>↑ 12%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={key} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}
                formatter={(v) => [`₹${v}`, 'Earnings']}
              />
              <Area type="monotone" dataKey="earnings" stroke="#7C3AED" strokeWidth={2.5} fill="url(#earningsGrad)" dot={{ fill: '#7C3AED', r: 3 }} activeDot={{ r: 5, fill: '#A78BFA' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction history */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 12 }}>Recent Payouts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRANSACTIONS.map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💰</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.service}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.customer} • {t.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--brand-accent)', fontSize: 15 }}>+₹{t.amount}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{t.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
