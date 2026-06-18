import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && role) {
        if (role === 'customer') navigate('/customer/home', { replace: true });
        else if (role === 'provider') navigate('/provider/dashboard', { replace: true });
        else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
        else navigate('/role-select', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '8%', left: '15%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', animation: 'float 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '12%', right: '10%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', animation: 'float 5s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', top: '40%', right: '5%', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', animation: 'float 3.5s ease-in-out infinite 0.5s' }} />

      {/* Logo */}
      <div className="animate-float" style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 100, height: 100,
          background: 'var(--gradient-primary)',
          borderRadius: 30, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 52, margin: '0 auto 24px',
          boxShadow: '0 8px 40px rgba(124,58,237,0.5)',
        }}>⚡</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900,
          background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', letterSpacing: '-1.5px', lineHeight: 1,
        }}>QuickFix</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 10, fontWeight: 500 }}>
          Services at your doorstep
        </p>
      </div>

      {/* Service pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', padding: '0 32px', marginBottom: 48 }}>
        {['🔧 Plumber', '⚡ Electrician', '🪚 Carpenter', '🔩 Mechanic'].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-full)', padding: '6px 16px',
            fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
            animation: `fadeIn 0.5s ease ${i * 0.12 + 0.4}s both`,
          }}>{s}</div>
        ))}
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--brand-primary-light)',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      {/* Version */}
      <div style={{ position: 'absolute', bottom: 28, color: 'var(--text-muted)', fontSize: 12 }}>
        v1.0.0 • Made with ❤️ in India 🇮🇳
      </div>
    </div>
  );
}
