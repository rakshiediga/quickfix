import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle, Mail } from 'lucide-react';
import { api } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ROLE_META = {
  customer: { emoji: '🏠', label: 'Customer', color: '#FF5722', gradient: 'var(--gradient-primary)' },
  provider: { emoji: '👷', label: 'Service Provider', color: '#1A73E8', gradient: 'linear-gradient(135deg,#1A73E8,#0D47A1)' },
};

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, email, role, demo, locationData } = location.state || {};
  const meta = ROLE_META[role] || ROLE_META.customer;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [verified, setVerified] = useState(false);
  const refs = useRef([]);
  const { setUser, setProfile, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (!phone && !email) { navigate('/login'); return; }
    refs.current[0]?.focus();
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);

    try {
      const payload = phone
        ? { phone, code, role }
        : { email, code, role };

      const data = await api.post('/auth/verify-otp', payload);

      if (data?.access_token) {
        // Persist JWT token for future requests
        localStorage.setItem('quickfix_token', data.access_token);

        // Set user/profile in auth store
        setUser({ id: data.user_id, role: data.role });
        setProfile({ id: data.user_id, role: data.role, setup_complete: data.setup_complete });

        setVerified(true);
        await new Promise(r => setTimeout(r, 800));

        if (data.setup_complete) {
          toast.success(`Welcome back! 🎉`);
          if (data.role === 'customer') navigate('/customer/home', { replace: true });
          else if (data.role === 'provider') navigate('/provider/dashboard', { replace: true });
          else navigate('/admin/dashboard', { replace: true });
        } else {
          toast.success('✅ Verified! Let\'s set up your profile.');
          if (role === 'provider') navigate('/provider-setup', { replace: true });
          else navigate('/customer-setup', { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    }
    setLoading(false);
  };

  const otpFilled = otp.join('').length === 6;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${meta.color}15 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '0 24px', paddingTop: 52, position: 'relative' }}>
        {/* Back button */}
        <button
          id="otp-back-btn"
          onClick={() => navigate('/login', { state: { role } })}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 12, width: 42, height: 42,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)', marginBottom: 32,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Email icon + heading */}
        {!verified ? (
          <>
            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: meta.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: `0 8px 24px ${meta.color}40`,
            }}>
              <Mail size={32} color="#fff" />
            </div>

            {/* Role badge */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 16,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
                borderRadius: 100, padding: '5px 14px',
              }}>
                <span style={{ fontSize: 13 }}>{meta.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
              </div>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900,
              marginBottom: 8, textAlign: 'center',
            }}>
              {phone ? 'Check your phone' : 'Check your email'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', marginBottom: 4 }}>
              {phone ? 'We sent a 6-digit code via SMS to' : 'We sent a 6-digit code to'}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, marginBottom: 36,
            }}>
              <div style={{
                background: `${meta.color}12`,
                border: `1px solid ${meta.color}30`,
                borderRadius: 100, padding: '6px 16px',
                fontWeight: 700, fontSize: 14, color: meta.color,
              }}>
                {phone || email}
              </div>
            </div>

            {/* OTP Input card */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 20,
              padding: '24px 20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: '1px solid var(--border-light)',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>
                Enter 6-digit OTP
              </p>
              <div className="otp-container" onPaste={handlePaste} style={{ gap: 8 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-digit-${i}`}
                    ref={el => refs.current[i] = el}
                    className="otp-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e.target.value, i)}
                    onKeyDown={e => handleKeyDown(e, i)}
                    autoComplete="one-time-code"
                    style={{
                      borderColor: digit ? meta.color : undefined,
                      boxShadow: digit ? `0 0 0 3px ${meta.color}25` : undefined,
                      background: digit ? `${meta.color}08` : undefined,
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>

              <button
                id="otp-verify-btn"
                className="btn btn--primary btn--full btn--lg"
                style={{
                  marginTop: 24,
                  background: otpFilled ? meta.gradient : 'var(--bg-secondary)',
                  color: otpFilled ? '#fff' : 'var(--text-muted)',
                  boxShadow: otpFilled ? `0 6px 20px ${meta.color}40` : 'none',
                  fontSize: 15, fontWeight: 700, borderRadius: 14,
                  transition: 'all 0.3s',
                }}
                onClick={handleVerify}
                disabled={loading || !otpFilled}
              >
                {loading
                  ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Verifying...</>
                  : '✅ Verify & Continue'
                }
              </button>
            </div>

            {/* Resend */}
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              {timer > 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  Resend OTP in{' '}
                  <span style={{
                    color: meta.color, fontWeight: 700,
                    background: `${meta.color}12`,
                    padding: '2px 8px', borderRadius: 100,
                  }}>
                    {timer}s
                  </span>
                </p>
              ) : (
                <button
                  id="otp-resend-btn"
                  className="btn btn--ghost"
                  onClick={() => { setTimer(30); toast.success('OTP resent!'); }}
                  style={{ color: meta.color, fontWeight: 700, fontSize: 14 }}
                >
                  <RefreshCw size={15} /> Resend OTP
                </button>
              )}
            </div>

            {/* Demo hint */}
            <div style={{
              marginTop: 28, padding: '14px 16px',
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 14,
              fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center',
            }}>
              <p style={{ fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>🎭 Demo Mode</p>
              <p>Use <b style={{ color: 'var(--text-primary)', fontSize: 16 }}>123456</b> as OTP</p>
            </div>
          </>
        ) : (
          /* Success animation */
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', gap: 20, textAlign: 'center',
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(0,200,83,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'bounceIn 0.5s ease',
              border: '3px solid #00C853',
            }}>
              <CheckCircle size={46} color="#00C853" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>
              Verified! 🎉
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Taking you in…
            </p>
            <div className="spinner spinner--lg" style={{ borderTopColor: meta.color }} />
          </div>
        )}
      </div>
    </div>
  );
}
