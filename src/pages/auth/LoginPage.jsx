import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const COUNTRY_CODE = '+91';

export default function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    const fullPhone = `${COUNTRY_CODE}${phone}`;

    const isConfigured = import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');

    if (isConfigured) {
      // Real Supabase OTP
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
        if (error) throw error;
        toast.success('OTP sent to your number!');
        navigate('/otp', { state: { phone: fullPhone } });
      } catch (err) {
        toast('OTP service unavailable. Using demo mode.', { icon: '⚠️' });
        navigate('/otp', { state: { phone: fullPhone, demo: true } });
      }
    } else {
      // Demo mode
      toast.success('Demo mode: OTP is 123456', { duration: 3000, icon: '🎭' });
      navigate('/otp', { state: { phone: fullPhone, demo: true } });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

      {/* Header */}
      <div style={{ padding: '64px 32px 48px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          width: 76, height: 76, background: 'var(--gradient-primary)',
          borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, margin: '0 auto 20px', boxShadow: 'var(--shadow-brand)',
        }}>⚡</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.5px' }}>Welcome to QuickFix</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.5 }}>
          Enter your mobile number to get started
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '0 24px', maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)',
                fontWeight: 600, fontSize: 15, zIndex: 1, pointerEvents: 'none',
              }}>
                <span>🇮🇳</span><span>+91</span>
                <span style={{ color: 'var(--border-color)', marginLeft: 2 }}>|</span>
              </div>
              <input
                type="tel"
                className="form-input"
                style={{ paddingLeft: 90 }}
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                autoFocus
                autoComplete="tel"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full btn--lg"
            disabled={loading || phone.length !== 10}
            style={{ marginTop: 8 }}
          >
            {loading
              ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Sending...</>
              : <>Get OTP <ChevronRight size={18} /></>
            }
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, color: 'var(--text-muted)', fontSize: 13 }}>
          <Shield size={14} />
          <span>Your number is safe with us</span>
        </div>

        {/* Demo banner */}
        <div style={{
          marginTop: 32, padding: '16px 18px',
          background: 'rgba(124, 58, 237, 0.07)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, color: 'var(--brand-primary-light)', marginBottom: 6, fontSize: 14 }}>
            🎭 Demo Mode Active
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Enter any 10-digit number.<br />
            Use <b style={{ color: 'var(--text-primary)' }}>123456</b> as OTP on next screen.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            {[['Customer', '🛠️'], ['Provider', '👷'], ['Admin', '🛡️']].map(([role, emoji]) => (
              <span key={role} style={{ fontSize: 12, background: 'var(--bg-tertiary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                {emoji} {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 12 }}>
        By continuing, you agree to our{' '}
        <span style={{ color: 'var(--text-link)' }}>Terms of Service</span> &{' '}
        <span style={{ color: 'var(--text-link)' }}>Privacy Policy</span>
      </p>
    </div>
  );
}
