import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const roles = [
  {
    id: 'customer',
    emoji: '🛠️',
    title: 'Customer',
    desc: 'Book services for home repair, maintenance & more',
    gradient: 'linear-gradient(135deg,#7C3AED,#A855F7)',
  },
  {
    id: 'provider',
    emoji: '👷',
    title: 'Service Provider',
    desc: 'Offer your skills and earn money on your schedule',
    gradient: 'linear-gradient(135deg,#F59E0B,#F97316)',
  },
  {
    id: 'admin',
    emoji: '🛡️',
    title: 'Admin',
    desc: 'Manage users, bookings, and platform settings',
    gradient: 'linear-gradient(135deg,#10B981,#059669)',
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setProfile } = useAuthStore();

  const isDemoUser = user?.demo === true || !import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');

  const handleContinue = async () => {
    if (!selected) { toast.error('Please select a role'); return; }
    setLoading(true);

    // Demo mode — set profile locally without Supabase
    if (isDemoUser) {
      const demoProfile = {
        id: user?.id || 'demo-user',
        role: selected,
        full_name: selected === 'admin' ? 'Admin User' : selected === 'provider' ? 'Demo Provider' : 'Demo Customer',
        phone: user?.phone || '+91 9999999999',
        is_active: true,
        is_verified: selected === 'provider' ? false : true,
        demo: true,
      };
      setProfile(demoProfile);
      toast.success(`Welcome! Logged in as ${selected} 🎉`);
      if (selected === 'customer') navigate('/customer/home', { replace: true });
      else if (selected === 'provider') navigate('/provider-setup', { replace: true });
      else navigate('/admin/dashboard', { replace: true });
      setLoading(false);
      return;
    }

    // Real Supabase
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { id: user?.id, role: selected, phone: user?.phone || user?.email },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) { toast.error('Something went wrong. Try again.'); setLoading(false); return; }
    setProfile(data);
    if (selected === 'customer') navigate('/customer/home', { replace: true });
    else if (selected === 'provider') navigate('/provider-setup', { replace: true });
    else navigate('/admin/dashboard', { replace: true });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', padding: '60px 24px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>👋</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Who are you?</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Choose your role to get the right experience</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            style={{
              width: '100%', textAlign: 'left', padding: '20px 20px',
              background: selected === r.id ? 'rgba(124,58,237,0.08)' : 'var(--bg-card)',
              border: `2px solid ${selected === r.id ? 'var(--brand-primary)' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-xl)', cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: selected === r.id ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: r.gradient, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 28, flexShrink: 0,
                boxShadow: selected === r.id ? 'var(--shadow-brand)' : 'none',
              }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.desc}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${selected === r.id ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                background: selected === r.id ? 'var(--brand-primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {selected === r.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        className="btn btn--primary btn--full btn--lg"
        style={{ marginTop: 28 }}
        onClick={handleContinue}
        disabled={!selected || loading}
      >
        {loading
          ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} />
          : <>Continue <ChevronRight size={18} /></>
        }
      </button>

      {isDemoUser && (
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          🎭 Demo mode — select any role to explore
        </p>
      )}
    </div>
  );
}
