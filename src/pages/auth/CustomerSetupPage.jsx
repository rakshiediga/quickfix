import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, User, Phone } from 'lucide-react';
import { api } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Your Details', icon: '👤' },
  { id: 2, label: 'Your Address', icon: '📍' },
];

const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad',
  'Chennai', 'Pune', 'Kolkata', 'Ahmedabad',
];

export default function CustomerSetupPage() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  
  const rawPhone = profile?.phone || user?.phone || '';
  const cleanPhone = rawPhone.startsWith('+91') ? rawPhone.slice(3) : rawPhone;

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: cleanPhone,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isDemoUser = user?.demo === true || !import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');

  const validateStep1 = () => {
    if (!form.full_name.trim()) { toast.error('Enter your full name'); return false; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit phone number'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.address_line1.trim()) { toast.error('Enter your address'); return false; }
    if (!form.city.trim()) { toast.error('Select or enter your city'); return false; }
    if (!form.pincode.trim() || form.pincode.length < 6) { toast.error('Enter a valid 6-digit pincode'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);

    const formattedPhone = form.phone.startsWith('+91') ? form.phone : `+91${form.phone}`;
    const addressStr = [form.address_line1, form.address_line2, form.landmark, form.city, form.state, form.pincode].filter(Boolean).join(', ');

    try {
      const data = await api.post('/customer/profile', {
        full_name: form.full_name,
        address: addressStr,
        city: form.city,
        state: form.state,
      });
      if (data) {
        setProfile({ ...profile, ...data, id: data.user_id, role: 'customer', setup_complete: true });
        toast.success('Welcome to QuickFix! 🎉');
        navigate('/customer/home', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Could not save details. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{
        background: 'var(--gradient-primary)',
        padding: '52px 24px 28px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ fontSize: 38, marginBottom: 10 }}>🏠</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          Complete Your Profile
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 16 }}>
          Step {step} of {STEPS.length}
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {STEPS.map(s => (
            <div key={s.id} style={{
              height: 4, borderRadius: 2,
              width: s.id <= step ? 36 : 18,
              background: s.id <= step ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          {STEPS.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: s.id <= step ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              borderRadius: 100, padding: '4px 12px',
              fontSize: 12, color: s.id <= step ? '#fff' : 'rgba(255,255,255,0.5)',
              fontWeight: s.id === step ? 700 : 500,
              transition: 'all 0.3s',
            }}>
              <span>{s.icon}</span><span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Body */}
      <div style={{ padding: '28px 20px' }}>

        {/* ─── STEP 1: Personal Details ─── */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <User size={16} />
                </div>
                <input
                  id="customer-name-input"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, pointerEvents: 'none', zIndex: 1,
                }}>
                  <span>🇮🇳</span><span>+91</span>
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                </div>
                <input
                  id="customer-phone-input"
                  type="tel"
                  className="form-input"
                  style={{ paddingLeft: 82 }}
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Info card */}
            <div style={{
              marginTop: 8, padding: '14px 16px',
              background: 'rgba(255,87,34,0.07)',
              border: '1px solid rgba(255,87,34,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13, color: 'var(--text-secondary)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <span>Your phone number helps service providers contact you when they arrive.</span>
            </div>

            <button
              id="customer-step1-next"
              className="btn btn--primary btn--full btn--lg"
              style={{ marginTop: 24, background: 'var(--gradient-primary)' }}
              onClick={() => { if (validateStep1()) setStep(2); }}
            >
              Next — Add Address <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: Address Details ─── */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
              color: 'var(--text-secondary)', fontSize: 14,
            }}>
              <MapPin size={16} style={{ color: 'var(--brand-primary)' }} />
              <span>Where should providers come to you?</span>
            </div>

            <div className="form-group">
              <label className="form-label">Address Line 1 *</label>
              <input
                id="customer-address1-input"
                className="form-input"
                placeholder="House/Flat no., Street name"
                value={form.address_line1}
                onChange={e => update('address_line1', e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input
                id="customer-address2-input"
                className="form-input"
                placeholder="Area, Colony (optional)"
                value={form.address_line2}
                onChange={e => update('address_line2', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Landmark</label>
              <input
                id="customer-landmark-input"
                className="form-input"
                placeholder="Near temple, school, etc. (optional)"
                value={form.landmark}
                onChange={e => update('landmark', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City *</label>
                <input
                  id="customer-city-input"
                  className="form-input"
                  placeholder="City"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  list="city-list"
                />
                <datalist id="city-list">
                  {CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Pincode *</label>
                <input
                  id="customer-pincode-input"
                  className="form-input"
                  placeholder="560001"
                  value={form.pincode}
                  onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                id="customer-state-input"
                className="form-input"
                placeholder="State (optional)"
                value={form.state}
                onChange={e => update('state', e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                className="btn btn--secondary"
                style={{ flex: 1 }}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                id="customer-submit-btn"
                className="btn btn--primary"
                style={{ flex: 2, background: 'var(--gradient-primary)' }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} />
                  : 'Save & Get Started 🚀'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
