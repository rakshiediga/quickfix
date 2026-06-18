import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, demo } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const refs = useRef([]);
  const { setUser, setProfile, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (!phone) { navigate('/login'); return; }
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
      // Demo mode — accept 123456 or any code and create a mock session
      if (demo || code === '123456' || !import.meta.env.VITE_SUPABASE_URL?.startsWith('https://')) {
        // Create a demo user object
        const demoUser = {
          id: `demo-${phone.replace(/\D/g, '')}`,
          phone,
          email: `${phone.replace(/\D/g, '')}@quickfix.demo`,
          demo: true,
        };
        setUser(demoUser);
        // No profile yet → go to role select
        navigate('/role-select', { replace: true });
        toast.success('✅ Demo login successful!');
        setLoading(false);
        return;
      }

      // Real Supabase OTP verify
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms',
      });

      if (error) throw error;

      if (data?.session) {
        setUser(data.session.user);
        const profile = await fetchProfile(data.session.user.id);
        if (!profile) navigate('/role-select', { replace: true });
        else if (profile.role === 'customer') navigate('/customer/home', { replace: true });
        else if (profile.role === 'provider') navigate('/provider/dashboard', { replace: true });
        else navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', padding: '0 24px' }}>
      <div style={{ paddingTop: 56 }}>
        <button onClick={() => navigate('/login')} className="header__back" style={{ marginBottom: 32 }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Verify OTP</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 8 }}>
          Enter the 6-digit code sent to
        </p>
        <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--brand-primary-light)', marginBottom: 40 }}>
          {phone}
        </p>

        {/* OTP inputs */}
        <div className="otp-container" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              className="otp-input"
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <button
          className="btn btn--primary btn--full btn--lg"
          style={{ marginTop: 36 }}
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading
            ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Verifying...</>
            : 'Verify & Continue →'
          }
        </button>

        {/* Resend */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          {timer > 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Resend OTP in <span style={{ color: 'var(--brand-primary-light)', fontWeight: 600 }}>{timer}s</span>
            </p>
          ) : (
            <button
              className="btn btn--ghost"
              onClick={() => { setTimer(30); toast.success('OTP resent!'); }}
              style={{ color: 'var(--brand-primary-light)' }}
            >
              <RefreshCw size={16} /> Resend OTP
            </button>
          )}
        </div>

        <div style={{ marginTop: 32, padding: 16, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>🎭 Demo Mode</p>
          <p>Use <b style={{ color: 'var(--text-primary)' }}>123456</b> as OTP to continue</p>
        </div>
      </div>
    </div>
  );
}
