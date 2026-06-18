import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const PROFESSIONS = [
  { id: 'plumber', label: 'Plumber', emoji: '🔧' },
  { id: 'electrician', label: 'Electrician', emoji: '⚡' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🪚' },
  { id: 'mechanic', label: 'Mechanic', emoji: '🔩' },
  { id: 'painter', label: 'Painter', emoji: '🖌️' },
  { id: 'cleaner', label: 'Cleaner', emoji: '🧹' },
  { id: 'ac_repair', label: 'AC Repair', emoji: '❄️' },
  { id: 'pest_control', label: 'Pest Control', emoji: '🐛' },
];

export default function ProviderSetupPage() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    profession: 'plumber',
    experience_years: '',
    bio: '',
    service_radius_km: '5',
  });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isDemoUser = user?.demo === true || !import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');

  const handleSubmit = async () => {
    if (!form.full_name || !form.profession) { toast.error('Fill all required fields'); return; }
    setLoading(true);

    if (isDemoUser) {
      // Demo mode — save locally
      const updatedProfile = {
        ...profile,
        full_name: form.full_name,
        profession: form.profession,
        experience_years: parseInt(form.experience_years) || 0,
        bio: form.bio,
        service_radius_km: parseFloat(form.service_radius_km) || 5,
        is_available: false,
        avg_rating: 0,
        total_reviews: 0,
      };
      setProfile(updatedProfile);
      toast.success('Profile created! Welcome to QuickFix 🎉');
      navigate('/provider/dashboard', { replace: true });
      setLoading(false);
      return;
    }

    // Real Supabase
    const { data: profileData, error: pErr } = await supabase
      .from('profiles')
      .upsert({ id: user?.id, role: 'provider', full_name: form.full_name }, { onConflict: 'id' })
      .select().single();
    if (pErr) { toast.error('Profile update failed'); setLoading(false); return; }

    await supabase.from('provider_profiles').upsert({
      id: user?.id,
      profession: form.profession,
      experience_years: parseInt(form.experience_years) || 0,
      bio: form.bio,
      service_radius_km: parseFloat(form.service_radius_km) || 5,
    }, { onConflict: 'id' });

    setProfile(profileData);
    toast.success('Profile created! Welcome to QuickFix 🎉');
    navigate('/provider/dashboard', { replace: true });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'var(--gradient-primary)', padding: '48px 24px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ fontSize: 40, marginBottom: 12 }}>👷</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Set Up Your Profile</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Step {step} of 2</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              height: 4, borderRadius: 2,
              width: s <= step ? 32 : 16,
              background: s <= step ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 20px' }}>
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Your full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Select Your Profession *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                {PROFESSIONS.map(p => (
                  <button key={p.id} onClick={() => update('profession', p.id)} style={{
                    padding: '14px 12px', borderRadius: 'var(--radius-md)',
                    background: form.profession === p.id ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                    border: `1.5px solid ${form.profession === p.id ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                    color: form.profession === p.id ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 20 }}>{p.emoji}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn btn--primary btn--full btn--lg"
              style={{ marginTop: 8 }}
              onClick={() => {
                if (!form.full_name) { toast.error('Enter your name'); return; }
                if (!form.profession) { toast.error('Select a profession'); return; }
                setStep(2);
              }}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input className="form-input" type="number" placeholder="e.g. 3" value={form.experience_years} onChange={e => update('experience_years', e.target.value)} min="0" max="50" />
            </div>
            <div className="form-group">
              <label className="form-label">About You</label>
              <textarea className="form-input" placeholder="Describe your skills and expertise..." value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} style={{ resize: 'none' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Service Radius</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['2', '5', '10', '20'].map(r => (
                  <button key={r} onClick={() => update('service_radius_km', r)} style={{
                    flex: 1, padding: '10px 0',
                    background: form.service_radius_km === r ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                    border: `1.5px solid ${form.service_radius_km === r ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: form.service_radius_km === r ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  }}>{r} km</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn btn--secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
                {loading
                  ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} />
                  : 'Create Profile 🚀'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
