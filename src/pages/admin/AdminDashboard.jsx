import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, ClipboardList, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';

const CHART_DATA = [
  { month: 'Jan', bookings: 42, revenue: 18000 },
  { month: 'Feb', bookings: 68, revenue: 29000 },
  { month: 'Mar', bookings: 55, revenue: 23500 },
  { month: 'Apr', bookings: 91, revenue: 38700 },
  { month: 'May', bookings: 76, revenue: 32400 },
  { month: 'Jun', bookings: 113, revenue: 48100 },
];

const STATS = [
  { label: 'Total Users', value: '2,841', icon: <Users size={20} />, color: '#3B82F6', change: '+12%' },
  { label: 'Providers', value: '384', icon: <Briefcase size={20} />, color: '#8B5CF6', change: '+8%' },
  { label: 'Bookings', value: '1,247', icon: <ClipboardList size={20} />, color: '#F59E0B', change: '+24%' },
  { label: 'Revenue', value: '₹4.8L', icon: <TrendingUp size={20} />, color: '#10B981', change: '+18%' },
];

const RECENT_ACTIONS = [
  { action: 'New provider registered', name: 'Deepak Verma', time: '5 min ago', type: 'provider' },
  { action: 'Booking completed', name: 'BK#1247', time: '12 min ago', type: 'booking' },
  { action: 'Provider verified', name: 'Neha Sharma', time: '1 hr ago', type: 'verify' },
  { action: 'Dispute raised', name: 'BK#1241', time: '2 hr ago', type: 'alert' },
  { action: 'New customer signup', name: 'Rohan Das', time: '3 hr ago', type: 'customer' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '48px 16px 20px', background: 'var(--gradient-dark)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Admin Panel</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900 }}>⚡ QuickFix</h1>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-full)', padding: '6px 12px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-accent)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--brand-accent)', fontWeight: 600 }}>Live</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-card" style={{ cursor: 'pointer' }}>
              <div className="stat-card__icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--brand-accent)', fontWeight: 600, marginTop: 2 }}>{s.change} this month</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Verify Providers', icon: <ShieldCheck size={18} />, path: '/admin/providers', color: '#8B5CF6', count: 5 },
            { label: 'Pending Disputes', icon: <AlertTriangle size={18} />, path: '/admin/bookings', color: '#EF4444', count: 2 },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)} style={{
              padding: 16, borderRadius: 'var(--radius-lg)', background: `${a.color}10`,
              border: `1.5px solid ${a.color}30`, display: 'flex', gap: 10, alignItems: 'center',
              cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color }}>{a.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: a.color, fontWeight: 700 }}>{a.count} pending</div>
              </div>
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="chart-area" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Bookings & Revenue (2026)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CHART_DATA} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
              <Bar dataKey="bookings" fill="#7C3AED" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 12 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RECENT_ACTIONS.map((a, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: a.type === 'alert' ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {a.type === 'provider' ? '👷' : a.type === 'booking' ? '📋' : a.type === 'verify' ? '✅' : a.type === 'alert' ? '⚠️' : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.action}</div>
                  <div style={{ fontSize: 12, color: 'var(--brand-primary-light)', fontWeight: 600 }}>{a.name}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
