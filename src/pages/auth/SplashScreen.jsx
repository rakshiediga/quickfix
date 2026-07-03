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
        navigate('/role-select', { replace: true });
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top color bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        background: 'linear-gradient(90deg, #FF5722, #FF8A65)',
      }} />

      {/* Background shape */}
      <div style={{
        position: 'absolute', top: '8%', left: '-20%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,87,34,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '12%', right: '-15%',
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,87,34,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div className="animate-float" style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 96, height: 96,
          background: 'linear-gradient(135deg, #FF5722, #FF7043)',
          borderRadius: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 50, margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(255,87,34,0.35)',
        }}>⚡</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 42, fontWeight: 900,
          color: '#212121',
          letterSpacing: '-1.5px', lineHeight: 1,
        }}>QuickFix</h1>
        <p style={{
          color: '#9E9E9E', fontSize: 15, marginTop: 10,
          fontWeight: 500,
        }}>
          Services at your doorstep
        </p>
      </div>

      {/* Service chips */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap',
        justifyContent: 'center', padding: '0 32px', marginBottom: 52,
      }}>
        {['🔧 Plumber', '⚡ Electrician', '🪚 Carpenter', '🔩 Mechanic'].map((s, i) => (
          <div key={i} style={{
            background: '#F5F5F5',
            border: '1px solid #E0E0E0',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: 13, fontWeight: 600, color: '#616161',
            animation: `fadeIn 0.5s ease ${i * 0.12 + 0.4}s both`,
          }}>{s}</div>
        ))}
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#FF5722',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 24,
        color: '#BDBDBD', fontSize: 12,
      }}>
        v1.0.0 • Made with ❤️ in India 🇮🇳
      </div>
    </div>
  );
}
