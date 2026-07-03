import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Shield, ArrowLeft, Mail, MapPin, CheckCircle, Loader, Lock, Settings } from 'lucide-react';
import { api } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ROLE_META = {
  customer: {
    emoji: '🏠',
    label: 'Customer',
    color: '#FF5722',
    gradient: 'var(--gradient-primary)',
    hint: 'Book home services in minutes',
    bgColor: 'rgba(255,87,34,0.08)',
    borderColor: 'rgba(255,87,34,0.25)',
  },
  provider: {
    emoji: '👷',
    label: 'Service Provider',
    color: '#1A73E8',
    gradient: 'linear-gradient(135deg,#1A73E8,#0D47A1)',
    hint: 'Offer your skills & earn money',
    bgColor: 'rgba(26,115,232,0.08)',
    borderColor: 'rgba(26,115,232,0.25)',
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'customer';
  const meta = ROLE_META[role] || ROLE_META.customer;
  const { setUser, setProfile, fetchProfile } = useAuthStore();

  const [authMode, setAuthMode] = useState('otp_login'); // otp_login | password_login | register
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | requesting | granted | denied
  const [locationData, setLocationData] = useState(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
  
  const [apiIp, setApiIp] = useState(localStorage.getItem('quickfix_custom_api_ip') || '');
  const [showApiSettings, setShowApiSettings] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationData({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus('granted');
        toast.success('📍 Location detected!', { duration: 2000 });
      },
      () => {
        setLocationStatus('denied');
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isPhoneValid) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone: `+91${phone}`, role });
      toast.success('✅ OTP sent to your mobile number!');
      navigate('/otp', { state: { phone: `+91${phone}`, role, locationData } });
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Try again.');
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    toast('Password login not supported in FastAPI mode. Please use OTP login.', { icon: 'ℹ️' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    toast('Registration uses OTP. Enter your mobile number above.', { icon: 'ℹ️' });
  };

  const locationBadge = () => {
    if (locationStatus === 'requesting') {
      return {
        icon: <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />,
        text: 'Detecting location...',
        bg: 'rgba(100,100,100,0.08)',
        border: 'rgba(100,100,100,0.2)',
        color: 'var(--text-muted)',
      };
    }
    if (locationStatus === 'granted') {
      return {
        icon: <CheckCircle size={13} />,
        text: 'Location detected',
        bg: 'rgba(0,200,83,0.08)',
        border: 'rgba(0,200,83,0.25)',
        color: '#00C853',
      };
    }
    if (locationStatus === 'denied') {
      return {
        icon: <MapPin size={13} />,
        text: 'Allow location',
        bg: 'rgba(255,87,34,0.08)',
        border: 'rgba(255,87,34,0.25)',
        color: 'var(--brand-primary)',
        clickable: true,
      };
    }
    return null;
  };

  const badge = locationBadge();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: -80, left: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${meta.color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
        animation: 'float 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: 120, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${meta.color}10 0%, transparent 70%)`,
        pointerEvents: 'none',
        animation: 'float 8s ease-in-out infinite reverse',
      }} />

      {/* Back button */}
      <button
        id="login-back-btn"
        onClick={() => {
          if (authMode === 'register' || authMode === 'password_login') {
            setAuthMode('otp_login');
          } else {
            navigate('/role-select');
          }
        }}
        style={{
          position: 'absolute', top: 52, left: 20,
          background: 'var(--bg-card)', border: '1px solid var(--border-light)',
          borderRadius: 12, width: 42, height: 42,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-primary)', zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <ArrowLeft size={18} />
      </button>

      {/* Location badge top-right */}
      {badge && (
        <div
          onClick={badge.clickable ? requestLocation : undefined}
          style={{
            position: 'absolute', top: 58, right: 20,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: badge.bg, border: `1px solid ${badge.border}`,
            borderRadius: 100, padding: '5px 10px',
            color: badge.color, fontSize: 12, fontWeight: 600,
            cursor: badge.clickable ? 'pointer' : 'default',
            zIndex: 10, transition: 'all 0.3s',
          }}
        >
          {badge.icon}
          <span>{badge.text}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '90px 28px 20px', textAlign: 'center', position: 'relative' }}>
        {/* Big icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 24,
          background: meta.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 32,
          boxShadow: `0 8px 24px ${meta.color}40`,
        }}>
          {meta.emoji}
        </div>

        {/* Role badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: meta.bgColor, border: `1px solid ${meta.borderColor}`,
          borderRadius: 100, padding: '5px 14px', marginBottom: 16,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
            {meta.label}
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900,
          marginBottom: 8, letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
        }}>
          {authMode === 'register' ? 'Create Account' : 'Welcome to QuickFix'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          {authMode === 'register'
            ? 'Sign up to begin your profile setup.'
            : `${meta.hint}. Choose your preferred login method.`}
        </p>
      </div>

      {/* Tabs (only when not in register mode) */}
      {authMode !== 'register' && (
        <div style={{
          display: 'flex',
          maxWidth: 400,
          margin: '0 auto 16px',
          width: 'calc(100% - 40px)',
          background: 'var(--bg-tertiary)',
          borderRadius: 12,
          padding: 4,
        }}>
          <button
            onClick={() => setAuthMode('otp_login')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: authMode === 'otp_login' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: authMode === 'otp_login' ? 'var(--bg-card)' : 'transparent',
              boxShadow: authMode === 'otp_login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            ✉️ OTP Login
          </button>
          <button
            onClick={() => setAuthMode('password_login')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: authMode === 'password_login' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: authMode === 'password_login' ? 'var(--bg-card)' : 'transparent',
              boxShadow: authMode === 'password_login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🔒 Password Login
          </button>
        </div>
      )}

      {/* Form card */}
      <div style={{
        flex: 1, padding: '0 20px 32px',
        maxWidth: 460, margin: '0 auto', width: '100%',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 20,
          padding: '24px 20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid var(--border-light)',
          marginBottom: 16,
        }}>
          {authMode === 'otp_login' && (
            <form onSubmit={handleSendOtp}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                  📱 Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: phoneFocused ? meta.color : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 15, pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s',
                  }}>
                    <span>🇮🇳</span><span>+91</span>
                    <span style={{ color: 'var(--border-color)', fontWeight: 300 }}>|</span>
                  </div>
                  <input
                    id="login-phone-input"
                    type="tel"
                    className="form-input"
                    style={{
                      paddingLeft: 76, fontSize: 16, letterSpacing: '0.5px', fontWeight: '600',
                      borderColor: phoneFocused ? meta.color : undefined,
                      boxShadow: phoneFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                      transition: 'all 0.2s',
                    }}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    autoFocus
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  We'll send a 6-digit OTP via SMS
                </p>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={loading || !isPhoneValid}
                style={{
                  background: isPhoneValid ? meta.gradient : undefined,
                  fontSize: 15, fontWeight: 700,
                  borderRadius: 14,
                  transition: 'all 0.3s',
                  boxShadow: isPhoneValid ? `0 6px 20px ${meta.color}40` : 'none',
                }}
              >
                {loading
                  ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Sending OTP...</>
                  : <>Send OTP <ChevronRight size={18} /></>
                }
              </button>
            </form>
          )}

          {authMode === 'password_login' && (
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                  📧 Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: emailFocused ? meta.color : 'var(--text-muted)',
                    pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s',
                  }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className="form-input"
                    style={{
                      paddingLeft: 44, fontSize: 15,
                      borderColor: emailFocused ? meta.color : undefined,
                      boxShadow: emailFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                    }}
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value.trim())}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                  🔒 Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: passFocused ? meta.color : 'var(--text-muted)',
                    pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s',
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    className="form-input"
                    style={{
                      paddingLeft: 44, fontSize: 15,
                      borderColor: passFocused ? meta.color : undefined,
                      boxShadow: passFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={loading || !isEmailValid || !password}
                style={{
                  background: (isEmailValid && password) ? meta.gradient : undefined,
                  fontSize: 15, fontWeight: 700,
                  borderRadius: 14,
                  transition: 'all 0.3s',
                  boxShadow: (isEmailValid && password) ? `0 6px 20px ${meta.color}40` : 'none',
                }}
              >
                {loading
                  ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Logging in...</>
                  : <>Log In <ChevronRight size={18} /></>
                }
              </button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                  📧 Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: emailFocused ? meta.color : 'var(--text-muted)',
                    pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s',
                  }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className="form-input"
                    style={{
                      paddingLeft: 44, fontSize: 15,
                      borderColor: emailFocused ? meta.color : undefined,
                      boxShadow: emailFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                    }}
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value.trim())}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                  🔒 Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: passFocused ? meta.color : 'var(--text-muted)',
                    pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s',
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    className="form-input"
                    style={{
                      paddingLeft: 44, fontSize: 15,
                      borderColor: passFocused ? meta.color : undefined,
                      boxShadow: passFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                  🔒 Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: confirmPassFocused ? meta.color : 'var(--text-muted)',
                    pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s',
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    className="form-input"
                    style={{
                      paddingLeft: 44, fontSize: 15,
                      borderColor: confirmPassFocused ? meta.color : undefined,
                      boxShadow: confirmPassFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                    }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setConfirmPassFocused(true)}
                    onBlur={() => setConfirmPassFocused(false)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={loading || !isEmailValid || !password || password !== confirmPassword}
                style={{
                  background: (isEmailValid && password && password === confirmPassword) ? meta.gradient : undefined,
                  fontSize: 15, fontWeight: 700,
                  borderRadius: 14,
                  transition: 'all 0.3s',
                  boxShadow: (isEmailValid && password && password === confirmPassword) ? `0 6px 20px ${meta.color}40` : 'none',
                }}
              >
                {loading
                  ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Registering...</>
                  : <>Create Account & Continue <ChevronRight size={18} /></>
                }
              </button>
            </form>
          )}
        </div>

        {/* Toggle between Login and Register */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {authMode === 'register' ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <span
                onClick={() => setAuthMode('otp_login')}
                style={{ color: meta.color, fontWeight: 700, cursor: 'pointer' }}
              >
                Log In
              </span>
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              New to QuickFix?{' '}
              <span
                onClick={() => setAuthMode('register')}
                style={{ color: meta.color, fontWeight: 700, cursor: 'pointer' }}
              >
                Create Account
              </span>
            </p>
          )}
        </div>

        {/* Location status card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: '16px 18px',
          border: `1px solid ${locationStatus === 'granted' ? 'rgba(0,200,83,0.2)' : 'var(--border-light)'}`,
          marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: locationStatus === 'granted' ? 'rgba(0,200,83,0.1)' : `${meta.color}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <MapPin size={20} color={locationStatus === 'granted' ? '#00C853' : meta.color} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
              {locationStatus === 'granted' ? '📍 Location Access Granted' :
               locationStatus === 'requesting' ? '🔄 Detecting your location...' :
               '📍 Location Access'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {locationStatus === 'granted' ? 'Nearby providers will be shown' :
               locationStatus === 'requesting' ? 'Please allow location in your browser' :
               'Enable to find services near you'}
            </p>
          </div>
          {locationStatus === 'denied' && (
            <button
              onClick={requestLocation}
              style={{
                background: meta.gradient, border: 'none',
                borderRadius: 10, padding: '8px 14px',
                color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              Allow
            </button>
          )}
          {locationStatus === 'granted' && (
            <CheckCircle size={20} color="#00C853" />
          )}
        </div>

        {/* Security + demo info */}
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          <Shield size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Secure authentication standard</span>
        </div>

        {/* API IP Config settings row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, alignItems: 'center' }}>
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer'
            }}
          >
            <Settings size={13} />
            <span>Developer API Settings</span>
          </button>
          
          {showApiSettings && (
            <div className="card animate-fadeIn" style={{ width: '100%', maxWidth: 360, padding: 12, borderRadius: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>⚙️ Backend Host IP</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                  placeholder="e.g. 192.168.1.5"
                  value={apiIp}
                  onChange={e => setApiIp(e.target.value.trim())}
                />
                <button
                  onClick={() => {
                    if (apiIp) {
                      localStorage.setItem('quickfix_custom_api_ip', apiIp);
                      toast.success('IP Saved! Restarting web frame...');
                      setTimeout(() => window.location.reload(), 1000);
                    } else {
                      localStorage.removeItem('quickfix_custom_api_ip');
                      toast.success('Cleared! Resets to localhost.');
                      setTimeout(() => window.location.reload(), 1000);
                    }
                  }}
                  className="btn btn--primary"
                  style={{ padding: '6px 12px', fontSize: 12, borderRadius: 10 }}
                >
                  Save
                </button>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Leave empty for localhost. Rebuild & sync after update.
              </div>
            </div>
          )}
        </div>

        {!import.meta.env.VITE_SUPABASE_URL?.startsWith('https://') && (
          <div style={{
            padding: '14px 16px',
            background: `${meta.color}08`,
            border: `1px solid ${meta.color}20`,
            borderRadius: 14,
            textAlign: 'center',
          }}>
            <p style={{ fontWeight: 700, color: meta.color, marginBottom: 4, fontSize: 13 }}>
              🎭 Demo Mode Active
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Enter any email & password to test. <br />
              For OTP: use OTP Login → use code <b style={{ color: 'var(--text-primary)' }}>123456</b>.
            </p>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', padding: '0 24px 24px', color: 'var(--text-muted)', fontSize: 11 }}>
        By continuing, you agree to our{' '}
        <span style={{ color: 'var(--text-link)' }}>Terms of Service</span> &{' '}
        <span style={{ color: 'var(--text-link)' }}>Privacy Policy</span>
      </p>
    </div>
  );
}
