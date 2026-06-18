import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, ChevronRight } from 'lucide-react';
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
];

export default function ProviderProfileSetup() {
  const navigate = useNavigate();
  const { profile, setProfile, signOut } = useAuthStore();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    profession: 'plumber',
    experience_years: '5',
    bio: 'Expert plumber with 5+ years of experience.',
    service_radius_km: '5',
  });
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.full_name) { toast.error('Name is required'); return; }
    setLoading(true);
    const { data, error } = await supabase.from('profiles').update({ full_name: form.full_name }).eq('id', profile?.id).select().single();
    if (!error && data) setProfile(data);
    await supabase.from('provider_profiles').upsert({ id: profile?.id, profession: form.profession, experience_years: parseInt(form.experience_years) || 0, bio: form.bio, service_radius_km: parseFloat(form.service_radius_km) || 5 }, { onConflict: 'id' });
    toast.success('Profile updated!');
    setLoading(false);
  };

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header avatar section */}
      <div style={{ background: 'var(--gradient-dark)', padding: '48px 16px 28px', textAlign: 'center', borderBottom: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(124,58,237,0.1)' }} />
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div className="avatar avatar--xl" style={{ background: 'var(--gradient-primary)', color: '#fff', fontSize: 32, fontWeight: 800, margin: '0 auto' }}>
            {form.full_name?.[0] || '?'}
          </div>
          <button style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--brand-primary)', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={14} color="#fff" />
          </button>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>{form.full_name || 'Your Name'}</div>
        <div style={{ color: 'var(--brand-primary-light)', fontSize: 13, marginTop: 4 }}>
          {PROFESSIONS.find(p => p.id === form.profession)?.emoji} {PROFESSIONS.find(p => p.id === form.profession)?.label}
        </div>
        <span className={`badge ${profile?.is_verified ? 'badge--verified' : 'badge--pending'}`} style={{ marginTop: 8, display: 'inline-flex' }}>
          {profile?.is_verified ? '✓ Verified' : '⏳ Pending Verification'}
        </span>
      </div>

      <div style={{ padding: 16, paddingBottom: 100 }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Your full name" />
        </div>

        <div className="form-group">
          <label className="form-label">Profession</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {PROFESSIONS.map(p => (
              <button key={p.id} onClick={() => update('profession', p.id)} style={{
                padding: '10px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                background: form.profession === p.id ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                border: `1.5px solid ${form.profession === p.id ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                color: form.profession === p.id ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{p.emoji}</div>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Years of Experience</label>
          <input className="form-input" type="number" value={form.experience_years} onChange={e => update('experience_years', e.target.value)} min="0" max="50" />
        </div>

        <div className="form-group">
          <label className="form-label">About You</label>
          <textarea className="form-input" value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} placeholder="Describe your expertise..." style={{ resize: 'none' }} />
        </div>

        <div className="form-group">
          <label className="form-label">Service Radius</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['2','5','10','20'].map(r => (
              <button key={r} onClick={() => update('service_radius_km', r)} style={{
                flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)',
                background: form.service_radius_km === r ? 'rgba(124,58,237,0.12)' : 'var(--bg-card)',
                border: `1.5px solid ${form.service_radius_km === r ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                color: form.service_radius_km === r ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}>{r} km</button>
            ))}
          </div>
        </div>

        {/* Document upload */}
        <div className="card" style={{ marginBottom: 16, cursor: 'pointer', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Upload ID Proof</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Aadhar, PAN, or Driving License (for verification)</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>

        <button className="btn btn--primary btn--full btn--lg" onClick={handleSave} disabled={loading} style={{ marginBottom: 12 }}>
          {loading ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> : 'Save Changes'}
        </button>
        <button className="btn btn--danger btn--full" onClick={() => setShowLogout(true)}>Log Out</button>
      </div>

      {showLogout && (
        <div className="modal-overlay modal-overlay--center">
          <div className="modal modal--center">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
              <h3 className="modal__title">Log Out?</h3>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn btn--danger" style={{ flex: 1 }} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
