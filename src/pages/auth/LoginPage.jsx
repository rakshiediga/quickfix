import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Shield,
  ArrowLeft,
  Mail,
  MapPin,
  CheckCircle,
  Loader,
  Lock,
  Settings,
  Eye,
  EyeOff,
  Smartphone,
  KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { api } from '../../lib/api';
import useAuthStore from '../../store/authStore';

const ROLE_META = {
  customer: {
    emoji: '🏠',
    label: 'Customer',
    color: '#0284C7',
    gradient: 'linear-gradient(135deg,#0284C7,#38BDF8)',
    hint: 'Book home services in minutes',
    bgColor: 'rgba(2,132,199,0.08)',
    borderColor: 'rgba(2,132,199,0.25)',
  },
  provider: {
    emoji: '👷',
    label: 'Service Provider',
    color: '#10B981',
    gradient: 'linear-gradient(135deg,#10B981,#059669)',
    hint: 'Offer your skills & earn money',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'customer';
  const meta = ROLE_META[role] || ROLE_META.customer;
  const { setUser, setProfile } = useAuthStore();

  const [authMode, setAuthMode] = useState('otp_login'); // otp_login | password_login | forgot_password | register
  const [otpMethod, setOtpMethod] = useState('email'); // email | phone
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | requesting | granted | denied
  const [locationData, setLocationData] = useState(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(1); // 1 = send code, 2 = verify & set password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [apiIp, setApiIp] = useState(localStorage.getItem('quickfix_custom_api_ip') || '');
  const [showApiSettings, setShowApiSettings] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isForgotEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail);
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);

  const requestLocation = useCallback(() => {
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
  }, []);

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Send Email OTP
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (!isEmailValid) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    const targetEmail = email.trim().toLowerCase();
    try {
      await api.post('/auth/send-otp', { email: targetEmail, role });
      toast.success(`Verification code sent to ${targetEmail}!`);
      navigate('/otp', { state: { email: targetEmail, role, locationData } });
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send Phone OTP
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!isPhoneValid) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    const fullPhone = `+91${phone}`;
    try {
      const isFakeKey = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.startsWith("AIzaSyFakeKey");
      if (isFakeKey || phone === '9999999999' || phone === '8888888888' || phone === '9876543210' || phone === '1234567890') {
        toast.success('✅ Demo OTP sent (Bypassed Firebase)!');
        navigate('/otp', { state: { phone: fullPhone, role, locationData, demo: true } });
        setLoading(false);
        return;
      }

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;

      toast.success('✅ OTP sent to your mobile number!');
      navigate('/otp', { state: { phone: fullPhone, role, locationData } });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send OTP. Try again.');
    }
    setLoading(false);
  };

  // Sign in with Email & Password
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!isEmailValid) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    setLoading(true);
    const targetEmail = email.trim().toLowerCase();
    try {
      const data = await api.post('/auth/login-password', {
        email: targetEmail,
        password,
        role,
      });

      if (data?.access_token) {
        localStorage.setItem('quickfix_token', data.access_token);
        setUser({ id: data.user_id, role: data.role });
        setProfile({ id: data.user_id, role: data.role, setup_complete: data.setup_complete });

        toast.success('Welcome back! 🎉');
        if (data.setup_complete) {
          if (data.role === 'customer') navigate('/customer/home', { replace: true });
          else if (data.role === 'provider') navigate('/provider/dashboard', { replace: true });
          else navigate('/admin/dashboard', { replace: true });
        } else {
          if (role === 'provider') navigate('/provider-setup', { replace: true, state: { locationData } });
          else navigate('/customer-setup', { replace: true, state: { locationData } });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Send Forgot Password OTP
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!isForgotEmailValid) {
      toast.error('Enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/send-otp', { email: targetEmail });
      toast.success(`Verification code sent to ${targetEmail}!`);
      setForgotStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      toast.error('Enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset', {
        email: targetEmail,
        code: forgotOtp.trim(),
        new_password: newPassword,
      });
      toast.success(res.message || '🎉 Password reset successfully! Please sign in.');
      setEmail(targetEmail);
      setPassword('');
      setForgotStep(1);
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setAuthMode('password_login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Please check OTP code.');
    } finally {
      setLoading(false);
    }
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
          if (authMode === 'forgot_password') {
            setAuthMode('password_login');
            setForgotStep(1);
          } else if (authMode === 'password_login') {
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
        <div style={{
          width: 72, height: 72, borderRadius: 24,
          background: meta.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 32,
          boxShadow: `0 8px 24px ${meta.color}40`,
        }}>
          {authMode === 'forgot_password' ? '🔑' : meta.emoji}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: meta.bgColor, border: `1px solid ${meta.borderColor}`,
          borderRadius: 100, padding: '4px 14px', marginBottom: 12,
        }}>
          <span style={{ fontSize: 13 }}>{meta.emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, letterSpacing: '0.3px' }}>
            {meta.label.toUpperCase()} PORTAL
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900,
          marginBottom: 8, letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
        }}>
          {authMode === 'forgot_password'
            ? 'Reset Password'
            : 'Welcome to QuickFix'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
          {authMode === 'forgot_password'
            ? 'Authenticate with an OTP sent to your email to set a new password.'
            : `${meta.hint}. Choose your preferred login method.`}
        </p>
      </div>

      {/* Primary Auth Tabs */}
      {authMode !== 'forgot_password' && (
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
              border: 'none',
              cursor: 'pointer',
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
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🔒 Password Login
          </button>
        </div>
      )}

      {/* Main Form Card */}
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
          {/* TAB 1: OTP LOGIN */}
          {authMode === 'otp_login' && (
            <div>
              {/* Method Switch: Email OTP vs Phone OTP */}
              <div style={{
                display: 'flex', gap: 8, marginBottom: 20,
                background: 'var(--bg-tertiary)', padding: 4, borderRadius: 10
              }}>
                <button
                  type="button"
                  onClick={() => setOtpMethod('email')}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: otpMethod === 'email' ? 'var(--bg-card)' : 'transparent',
                    color: otpMethod === 'email' ? meta.color : 'var(--text-muted)',
                    boxShadow: otpMethod === 'email' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Mail size={14} /> Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => setOtpMethod('phone')}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: otpMethod === 'phone' ? 'var(--bg-card)' : 'transparent',
                    color: otpMethod === 'phone' ? meta.color : 'var(--text-muted)',
                    boxShadow: otpMethod === 'phone' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Smartphone size={14} /> Mobile OTP
                </button>
              </div>

              {otpMethod === 'email' ? (
                <form onSubmit={handleSendEmailOtp}>
                  <div className="form-group" style={{ marginBottom: 20 }}>
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
                        id="login-email-otp-input"
                        type="email"
                        className="form-input"
                        style={{
                          paddingLeft: 44, fontSize: 15,
                          borderColor: emailFocused ? meta.color : undefined,
                          boxShadow: emailFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                        }}
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        autoFocus
                        autoComplete="email"
                      />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      We will send a 6-digit OTP to your email. You can create a password right after verifying.
                    </p>
                  </div>

                  <button
                    id="login-email-otp-btn"
                    type="submit"
                    className="btn btn--primary btn--full btn--lg"
                    disabled={loading || !isEmailValid}
                    style={{
                      background: isEmailValid ? meta.gradient : undefined,
                      fontSize: 15, fontWeight: 700,
                      borderRadius: 14,
                      transition: 'all 0.3s',
                      boxShadow: isEmailValid ? `0 6px 20px ${meta.color}40` : 'none',
                    }}
                  >
                    {loading
                      ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Sending Email Code...</>
                      : <>Send Verification Code <ChevronRight size={18} /></>
                    }
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSendPhoneOtp}>
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
                        autoComplete="tel"
                        inputMode="numeric"
                      />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      We will send a 6-digit OTP code to your phone.
                    </p>
                  </div>

                  <button
                    id="login-phone-otp-btn"
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
                  <div id="recaptcha-container"></div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
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
                    id="login-password-email-input"
                    type="email"
                    className="form-input"
                    style={{
                      paddingLeft: 44, fontSize: 15,
                      borderColor: emailFocused ? meta.color : undefined,
                      boxShadow: emailFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                    }}
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>
                    🔒 Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotStep(1);
                      setAuthMode('forgot_password');
                    }}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: meta.color, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', textDecoration: 'underline',
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: passFocused ? meta.color : 'var(--text-muted)',
                    pointerEvents: 'none', zIndex: 1, transition: 'color 0.2s',
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{
                      paddingLeft: 44, paddingRight: 44, fontSize: 15,
                      borderColor: passFocused ? meta.color : undefined,
                      boxShadow: passFocused ? `0 0 0 3px ${meta.color}18` : undefined,
                    }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                      padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-password-submit-btn"
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={loading || !isEmailValid || !password}
                style={{
                  marginTop: 16,
                  background: (isEmailValid && password) ? meta.gradient : undefined,
                  fontSize: 15, fontWeight: 700,
                  borderRadius: 14,
                  transition: 'all 0.3s',
                  boxShadow: (isEmailValid && password) ? `0 6px 20px ${meta.color}40` : 'none',
                }}
              >
                {loading
                  ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Logging In...</>
                  : <>Log In <ChevronRight size={18} /></>
                }
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD FLOW */}
          {authMode === 'forgot_password' && (
            <div>
              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotOtp}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <KeyRound size={20} color={meta.color} />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Verify Your Email
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
                    Enter your email below. We'll send a 6-digit verification code to authenticate and reset your password.
                  </p>

                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                      📧 Registered Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1
                      }}>
                        <Mail size={18} />
                      </div>
                      <input
                        id="forgot-email-input"
                        type="email"
                        className="form-input"
                        style={{ paddingLeft: 44, fontSize: 15 }}
                        placeholder="yourname@gmail.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        autoFocus
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    id="forgot-send-otp-btn"
                    type="submit"
                    className="btn btn--primary btn--full btn--lg"
                    disabled={loading || !isForgotEmailValid}
                    style={{
                      background: isForgotEmailValid ? meta.gradient : undefined,
                      fontSize: 15, fontWeight: 700, borderRadius: 14,
                      boxShadow: isForgotEmailValid ? `0 6px 20px ${meta.color}40` : 'none',
                    }}
                  >
                    {loading
                      ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Sending OTP...</>
                      : <>Send Reset OTP <ChevronRight size={18} /></>
                    }
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => setAuthMode('password_login')}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      ← Back to Password Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Lock size={20} color={meta.color} />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Create New Password
                    </h3>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Enter the code sent to <b>{forgotEmail}</b> and choose a new password.
                  </p>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                      🔢 6-Digit Verification Code
                    </label>
                    <input
                      id="forgot-otp-input"
                      type="text"
                      className="form-input"
                      style={{ fontSize: 18, letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
                      placeholder="123456"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={e => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                      🔒 New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="forgot-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingRight: 44, fontSize: 15 }}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                          padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                      🔒 Confirm New Password
                    </label>
                    <input
                      id="forgot-confirm-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ fontSize: 15 }}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    id="forgot-reset-submit-btn"
                    type="submit"
                    className="btn btn--primary btn--full btn--lg"
                    disabled={loading || forgotOtp.length !== 6 || newPassword.length < 6 || newPassword !== confirmNewPassword}
                    style={{
                      background: (forgotOtp.length === 6 && newPassword.length >= 6 && newPassword === confirmNewPassword)
                        ? meta.gradient : undefined,
                      fontSize: 15, fontWeight: 700, borderRadius: 14,
                    }}
                  >
                    {loading
                      ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Updating Password...</>
                      : <>Reset Password & Log In <ChevronRight size={18} /></>
                    }
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      style={{
                        background: 'none', border: 'none', color: meta.color,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('password_login')}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom Switch between OTP & Password login */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          {authMode === 'password_login' ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Prefer instant code?{' '}
              <span
                onClick={() => setAuthMode('otp_login')}
                style={{ color: meta.color, fontWeight: 700, cursor: 'pointer' }}
              >
                Sign in with OTP
              </span>
            </p>
          ) : authMode === 'otp_login' ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Already set a password?{' '}
              <span
                onClick={() => setAuthMode('password_login')}
                style={{ color: meta.color, fontWeight: 700, cursor: 'pointer' }}
              >
                Sign in with Password
              </span>
            </p>
          ) : null}
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

        {/* Security badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          <Shield size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>256-bit encrypted authentication</span>
        </div>

        {/* Developer API IP Config */}
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
                  placeholder="https://quickfix-ebly.onrender.com"
                  value={apiIp}
                  onChange={e => setApiIp(e.target.value.trim())}
                />
                <button
                  onClick={() => {
                    if (apiIp) {
                      localStorage.setItem('quickfix_custom_api_ip', apiIp);
                      toast.success('Backend Saved! Restarting web frame...');
                      setTimeout(() => window.location.reload(), 1000);
                    } else {
                      localStorage.removeItem('quickfix_custom_api_ip');
                      toast.success('Cleared! Resets to Render Cloud backend.');
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
                Default: https://quickfix-ebly.onrender.com
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: '14px 16px',
          background: `${meta.color}08`,
          border: `1px solid ${meta.color}20`,
          borderRadius: 14,
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, color: meta.color, marginBottom: 4, fontSize: 13 }}>
            💡 Quick Tip
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Use <b>Email OTP</b> to verify your email and set a password on signup.<br />
            For local/demo testing, code <b style={{ color: 'var(--text-primary)' }}>123456</b> works for any address!
          </p>
        </div>
      </div>

      <p style={{ textAlign: 'center', padding: '0 24px 24px', color: 'var(--text-muted)', fontSize: 11 }}>
        By continuing, you agree to our{' '}
        <span style={{ color: 'var(--text-link)' }}>Terms of Service</span> &{' '}
        <span style={{ color: 'var(--text-link)' }}>Privacy Policy</span>
      </p>
    </div>
  );
}
