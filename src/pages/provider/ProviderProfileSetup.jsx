import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, MapPin, ChevronRight, User, Briefcase, DollarSign,
  Clock, Shield, Image, Check, Star, LogOut
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const PROFESSIONS = [
  { id: 'plumber', label: 'Plumber', emoji: '🔧' },
  { id: 'electrician', label: 'Electrician', emoji: '⚡' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🪚' },
  { id: 'mechanic', label: 'Mechanic', emoji: '🔩' },
  { id: 'painter', label: 'Painter', emoji: '🖌️' },
  { id: 'ac_repair', label: 'AC Technician', emoji: '❄️' },
  { id: 'other', label: 'Other', emoji: '🛠️' },
];

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'hindi',   label: 'Hindi' },
  { id: 'kannada', label: 'Kannada' },
  { id: 'tamil',   label: 'Tamil' },
  { id: 'telugu',  label: 'Telugu' },
  { id: 'malayalam', label: 'Malayalam' },
];

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

function readFileAsDataURL(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });
}

export default function ProviderProfileSetup() {
  const navigate = useNavigate();
  const { profile, setProfile, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal'); // personal | professional | pricing | availability | verification
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Form State initialized from current profile or defaults
  const [form, setForm] = useState({
    // Personal Details
    full_name:         profile?.full_name || '',
    phone:             profile?.phone || '',
    alternate_phone:   profile?.alternate_phone || '',
    email:             profile?.email || '',
    dob:               profile?.dob || '',
    gender:            profile?.gender || '',
    country:           profile?.country || 'India',
    state:             profile?.state || '',
    city:              profile?.city || '',
    address:           profile?.address || '',

    // Professional Details
    profession:        profile?.profession || 'plumber',
    experience_years:  profile?.experience_years?.toString() || '5',
    bio:               profile?.bio || '',
    service_areas:     profile?.service_areas || '',
    languages:         profile?.languages || ['english', 'hindi'],

    // Pricing
    min_charge:        profile?.min_charge?.toString() || '250',
    service_charge:    profile?.service_charge?.toString() || '150', // Hourly rate
    emergency_charge:  profile?.emergency_charge?.toString() || '',

    // Availability
    working_days:      profile?.working_days || ['mon', 'tue', 'wed', 'thu', 'fri'],
    working_hours_start: profile?.working_hours_start || '09:00',
    working_hours_end:   profile?.working_hours_end || '18:00',
    is_available:      profile?.is_available ?? true,

    // Verification
    id_proof_type:     profile?.id_proof_type || 'Aadhaar Card',
    project_descriptions: profile?.project_descriptions || ''
  });

  const [profilePhoto, setProfilePhoto] = useState(profile?.profile_photo || null);
  const [idProofPhoto, setIdProofPhoto] = useState(profile?.id_proof_url || null);
  const [workPhotos, setWorkPhotos] = useState(profile?.work_photos || []);
  const [servicePhotos, setServicePhotos] = useState(profile?.service_photos || []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleLanguage = (id) => {
    setForm(p => ({
      ...p,
      languages: p.languages.includes(id)
        ? p.languages.filter(l => l !== id)
        : [...p.languages, id],
    }));
  };

  const toggleDay = (id) => {
    setForm(p => ({
      ...p,
      working_days: p.working_days.includes(id)
        ? p.working_days.filter(d => d !== id)
        : [...p.working_days, id],
    }));
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Full Name is required'); return; }
    if (!form.phone.trim()) { toast.error('Phone number is required'); return; }
    setLoading(true);

    try {
      const updatedData = {
        ...profile,
        full_name:         form.full_name,
        phone:             form.phone,
        alternate_phone:   form.alternate_phone,
        email:             form.email,
        dob:               form.dob,
        gender:            form.gender,
        country:           form.country,
        state:             form.state,
        city:              form.city,
        address:           form.address,
        profession:        form.profession,
        experience_years:  parseInt(form.experience_years) || 0,
        bio:               form.bio,
        service_areas:     form.service_areas,
        languages:         form.languages,
        min_charge:        parseFloat(form.min_charge) || 0,
        service_charge:    parseFloat(form.service_charge) || 0,
        emergency_charge:  parseFloat(form.emergency_charge) || 0,
        working_days:      form.working_days,
        working_hours_start: form.working_hours_start,
        working_hours_end:   form.working_hours_end,
        is_available:      form.is_available,
        id_proof_type:     form.id_proof_type,
        profile_photo:     profilePhoto,
        id_proof_url:      idProofPhoto,
        work_photos:       workPhotos,
        service_photos:    servicePhotos,
        project_descriptions: form.project_descriptions,
      };

      // Save to Supabase (if configured)
      const isConfigured = import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');
      if (isConfigured && profile?.id && !profile.id.startsWith('demo-')) {
        const { error: pErr } = await supabase
          .from('profiles')
          .update({
            full_name: form.full_name,
            phone:     form.phone,
            avatar_url: profilePhoto,
          })
          .eq('id', profile.id);
        if (pErr) throw pErr;

        const { error: ppErr } = await supabase
          .from('provider_profiles')
          .update({
            profession:        form.profession,
            experience_years:  parseInt(form.experience_years) || 0,
            bio:               form.bio,
            min_charge:        parseFloat(form.min_charge) || 0,
            service_charge:    parseFloat(form.service_charge) || 0,
            emergency_charge:  parseFloat(form.emergency_charge) || 0,
            address:           form.address,
            city:              form.city,
            state:             form.state,
            is_available:      form.is_available,
            working_days:      form.working_days,
            working_hours_start: form.working_hours_start,
            working_hours_end:   form.working_hours_end,
            service_areas:     form.service_areas,
            languages:         form.languages,
          })
          .eq('id', profile.id);
        if (ppErr) throw ppErr;
      }

      // Save to localStorage
      setProfile(updatedData);
      try {
        const demoProfiles = JSON.parse(localStorage.getItem('quickfix_demo_profiles') || '{}');
        demoProfiles[profile?.id] = updatedData;
        localStorage.setItem('quickfix_demo_profiles', JSON.stringify(demoProfiles));

        const allProviders = JSON.parse(localStorage.getItem('quickfix_all_providers') || '[]');
        const idx = allProviders.findIndex(p => p.id === profile?.id);
        if (idx >= 0) allProviders[idx] = updatedData;
        else allProviders.push(updatedData);
        localStorage.setItem('quickfix_all_providers', JSON.stringify(allProviders));
      } catch (e) {
        console.error(e);
      }

      toast.success('Changes saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error saving changes.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const fileRef = useRef();
  const idRef = useRef();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Profile Header Block */}
      <div style={{
        background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
        padding: '48px 16px 24px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-light)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        
        {/* Selfie Profile Photo Picker */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              width: 90, height: 90, borderRadius: '50%',
              background: '#FFFFFF',
              border: '3px solid #fff',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 28, color: '#1A73E8', fontWeight: 800 }}>
                {form.full_name?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <button
            onClick={() => fileRef.current.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)', cursor: 'pointer'
            }}
          >
            <Camera size={14} color="#1A73E8" />
          </button>
          <input
            ref={fileRef}
            type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const url = await readFileAsDataURL(file);
                setProfilePhoto(url);
              }
            }}
          />
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
          {form.full_name || 'Partner Profile'}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4, textTransform: 'capitalize' }}>
          {PROFESSIONS.find(p => p.id === form.profession)?.emoji} {PROFESSIONS.find(p => p.id === form.profession)?.label} Partner
        </div>
        
        {/* Verification Status */}
        <span className="badge" style={{
          marginTop: 8, display: 'inline-flex',
          background: '#FFFFFF', color: '#00C853',
          border: 'none', fontWeight: 700, fontSize: 11, padding: '4px 12px', borderRadius: 100
        }}>
          ✓ Profile Verified
        </span>
      </div>

      {/* Editing Section Tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 4px',
        overflowX: 'auto',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {[
          { id: 'personal', label: '👤 Personal', icon: User },
          { id: 'professional', label: '💼 Professional', icon: Briefcase },
          { id: 'pricing', label: '₹ Pricing', icon: DollarSign },
          { id: 'availability', label: '📅 Availability', icon: Clock },
          { id: 'verification', label: '🛡️ Portfolio', icon: Shield },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '14px 16px',
              borderBottom: `3px solid ${activeTab === t.id ? '#1A73E8' : 'transparent'}`,
              color: activeTab === t.id ? '#1A73E8' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 800 : 500,
              fontSize: 13,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Edit Form Area */}
      <div style={{ padding: 16, paddingBottom: 120 }}>
        
        {/* Tab 1: Personal Details */}
        {activeTab === 'personal' && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={form.dob} onChange={e => update('dob', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={e => update('gender', e.target.value)} style={{ height: 44 }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-input" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))} />
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Number</label>
              <input className="form-input" value={form.alternate_phone} onChange={e => update('alternate_phone', e.target.value.replace(/\D/g, ''))} placeholder="Optional secondary contact" />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input className="form-input" style={{ background: '#f5f5f5', color: 'var(--text-muted)' }} value={form.email} readOnly />
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '16px 0 8px', color: 'var(--text-primary)' }}>Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" value={form.country} onChange={e => update('country', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={form.state} onChange={e => update('state', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={e => update('city', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Full Address</label>
              <textarea className="form-input" value={form.address} onChange={e => update('address', e.target.value)} rows={2} style={{ resize: 'none' }} />
            </div>
          </div>
        )}

        {/* Tab 2: Professional Details */}
        {activeTab === 'professional' && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Profession Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {PROFESSIONS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => update('profession', p.id)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: 12,
                      border: `1.5px solid ${form.profession === p.id ? '#1A73E8' : 'var(--border-color)'}`,
                      background: form.profession === p.id ? 'rgba(26,115,232,0.06)' : 'var(--bg-card)',
                      color: form.profession === p.id ? '#1A73E8' : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{p.emoji}</div>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input className="form-input" type="number" value={form.experience_years} onChange={e => update('experience_years', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Service Areas Covered</label>
              <input className="form-input" value={form.service_areas} onChange={e => update('service_areas', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Languages Known</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {LANGUAGES.map(l => {
                  const selected = form.languages.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleLanguage(l.id)}
                      style={{
                        padding: '8px 0',
                        borderRadius: 8,
                        border: `1.5px solid ${selected ? '#1A73E8' : 'var(--border-color)'}`,
                        background: selected ? 'rgba(26,115,232,0.05)' : 'var(--bg-card)',
                        color: selected ? '#1A73E8' : 'var(--text-secondary)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Service / Bio Description</label>
              <textarea className="form-input" value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} style={{ resize: 'none' }} />
            </div>
          </div>
        )}

        {/* Tab 3: Pricing */}
        {activeTab === 'pricing' && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Minimum Service Charge (₹)</label>
              <input className="form-input" type="number" value={form.min_charge} onChange={e => update('min_charge', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Labor Charge (₹)</label>
              <input className="form-input" type="number" value={form.service_charge} onChange={e => update('service_charge', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Service Charge (₹)</label>
              <input className="form-input" type="number" value={form.emergency_charge} onChange={e => update('emergency_charge', e.target.value)} />
            </div>
          </div>
        )}

        {/* Tab 4: Availability */}
        {activeTab === 'availability' && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Select Active Work Days</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DAYS.map(day => {
                  const selected = form.working_days.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: `1.5px solid ${selected ? '#1A73E8' : 'var(--border-color)'}`,
                        background: selected ? 'rgba(26,115,232,0.05)' : 'var(--bg-card)',
                        color: selected ? '#1A73E8' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: 12, cursor: 'pointer'
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">Working Hours Start</label>
                <input className="form-input" type="time" value={form.working_hours_start} onChange={e => update('working_hours_start', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Working Hours End</label>
                <input className="form-input" type="time" value={form.working_hours_end} onChange={e => update('working_hours_end', e.target.value)} />
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Online Status Toggle</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Toggle your active availability state</div>
              </div>
              <button
                onClick={() => update('is_available', !form.is_available)}
                style={{
                  width: 46, height: 24, borderRadius: 100, border: 'none',
                  background: form.is_available ? '#00C853' : 'var(--border-color)',
                  cursor: 'pointer', position: 'relative'
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3, left: form.is_available ? 25 : 3,
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Portfolio & ID verification */}
        {activeTab === 'verification' && (
          <div className="animate-fadeIn">
            {/* Gov ID */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>📄 ID Verification Document</h3>
              
              <div className="form-group" style={{ margin: '12px 0 16px' }}>
                <label className="form-label">Gov ID Type</label>
                <select className="form-input" value={form.id_proof_type} onChange={e => update('id_proof_type', e.target.value)} style={{ height: 42 }}>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              {idProofPhoto ? (
                <div style={{ position: 'relative', marginTop: 10 }}>
                  <img src={idProofPhoto} alt="ID Document" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-color)' }} />
                  <button
                    onClick={() => setIdProofPhoto(null)}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%',
                      width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}
                  ><X size={12} /></button>
                </div>
              ) : (
                <button
                  onClick={() => idRef.current.click()}
                  style={{
                    width: '100%', padding: '18px 0', border: '2px dashed rgba(26,115,232,0.3)',
                    background: 'rgba(26,115,232,0.03)', borderRadius: 12, color: '#1A73E8', fontWeight: 600, fontSize: 13,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer'
                  }}
                >
                  <Shield size={20} />
                  Upload updated {form.id_proof_type}
                </button>
              )}
              <input
                ref={idRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = await readFileAsDataURL(file);
                    setIdProofPhoto(url);
                  }
                }}
              />
            </div>

            {/* Portfolio Grid */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
              <MultiPhotoGrid
                label="📁 Previous Work Photos"
                photos={workPhotos}
                max={6}
                onAdd={url => setWorkPhotos(p => [...p, url])}
                onRemove={i => setWorkPhotos(p => p.filter((_, idx) => idx !== i))}
              />
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
              <MultiPhotoGrid
                label="🛠️ Service / Equipment Images"
                photos={servicePhotos}
                max={4}
                onAdd={url => setServicePhotos(p => [...p, url])}
                onRemove={i => setServicePhotos(p => p.filter((_, idx) => idx !== i))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Details</label>
              <textarea className="form-input" value={form.project_descriptions} onChange={e => update('project_descriptions', e.target.value)} rows={3} style={{ resize: 'none' }} />
            </div>
          </div>
        )}

        {/* Global Save Button at bottom of forms */}
        <div style={{
          position: 'fixed', bottom: 'var(--bottom-nav-height)', left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480, padding: 16, background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12, zIndex: 5
        }}>
          <button className="btn btn--primary btn--full btn--lg" onClick={handleSave} disabled={loading} style={{
            background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
            boxShadow: '0 4px 16px rgba(26,115,232,0.25)',
            borderRadius: 12, fontWeight: 700
          }}>
            {loading ? <div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> : 'Save Profile Changes'}
          </button>
          
          <button
            onClick={() => setShowLogout(true)}
            style={{
              width: 48, height: 48, borderRadius: 12, border: '1px solid #F44336',
              background: 'rgba(244,67,54,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} color="#F44336" />
          </button>
        </div>
      </div>

      {showLogout && (
        <div className="modal-overlay modal-overlay--center" style={{ zIndex: 100 }}>
          <div className="modal modal--center" style={{ borderRadius: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
              <h3 className="modal__title" style={{ fontWeight: 800 }}>Log Out?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Are you sure you want to log out of QuickFix?</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn--secondary" style={{ flex: 1, borderRadius: 10 }} onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn btn--danger" style={{ flex: 1, borderRadius: 10, background: '#F44336' }} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
