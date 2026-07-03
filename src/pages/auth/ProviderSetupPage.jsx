import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, User, Phone, Briefcase,
  Camera, FileText, MapPin, CheckCircle, Upload, X,
  Clock, Star, Zap, Shield, HelpCircle, DollarSign, Languages, Navigation, Loader
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

/* ─── Constants ──────────────────────────────────────────────────────── */
const SERVICES = [
  { id: 'plumber',      label: 'Plumber',        emoji: '🔧', desc: 'Pipes, taps, drainage' },
  { id: 'electrician',  label: 'Electrician',    emoji: '⚡', desc: 'Wiring, switches, MCB' },
  { id: 'carpenter',    label: 'Carpenter',      emoji: '🪚', desc: 'Furniture, doors, shelves' },
  { id: 'mechanic',     label: 'Mechanic',       emoji: '🔩', desc: 'Vehicle repairs' },
  { id: 'painter',      label: 'Painter',        emoji: '🖌️', desc: 'Interior & exterior' },
  { id: 'ac_repair',    label: 'AC Technician',  emoji: '❄️', desc: 'Installation & service' },
  { id: 'other',        label: 'Other Service',  emoji: '🛠️', desc: 'General maintenance' },
];

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'hindi',   label: 'Hindi' },
  { id: 'kannada', label: 'Kannada' },
  { id: 'tamil',   label: 'Tamil' },
  { id: 'telugu',  label: 'Telugu' },
  { id: 'malayalam', label: 'Malayalam' },
];

const WORKING_DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

const TOTAL_STEPS = 7;

const STEP_META = [
  { icon: User,      title: 'Basic Details',        subtitle: 'Personal & contact info',       color: '#1A73E8' },
  { icon: Briefcase, title: 'Professional Details', subtitle: 'Skills & experience',           color: '#0D47A1' },
  { icon: Shield,    title: 'Identity Verification',subtitle: 'Upload Aadhaar, PAN & Selfie',  color: '#1976D2' },
  { icon: Camera,    title: 'Your Portfolio',       subtitle: 'Photos & certificates',         color: '#0288D1' },
  { icon: Zap,       title: 'Service Details',      subtitle: 'Services & charges',            color: '#0097A7' },
  { icon: Clock,     title: 'Availability',         subtitle: 'Days, slots & status',          color: '#00796B' },
  { icon: Star,      title: 'Ratings & Reviews',    subtitle: 'Preview & submit',              color: '#2E7D32' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function readFileAsDataURL(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });
}

/* ─── Profile Photo Picker ────────────────────────────────────────────── */
function ProfilePhotoPicker({ photo, onPhoto, onRemove }) {
  const ref = useRef();
  return (
    <div style={{ textAlign: 'center', marginBottom: 20 }}>
      <div
        onClick={() => ref.current.click()}
        style={{
          width: 110, height: 110, borderRadius: '50%',
          margin: '0 auto 12px',
          background: photo ? 'transparent' : 'rgba(26,115,232,0.06)',
          border: photo ? '3px solid #1A73E8' : '2.5px dashed rgba(26,115,232,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          boxShadow: photo ? '0 4px 20px rgba(26,115,232,0.2)' : 'none',
          transition: 'all 0.3s',
        }}
      >
        {photo ? (
          <img src={photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Camera size={28} color="#1A73E8" />
            <div style={{ fontSize: 11, color: '#1A73E8', fontWeight: 600, marginTop: 4 }}>Add Selfie</div>
          </div>
        )}
        {photo && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'all 0.2s',
          }}>
            <Camera size={24} color="#fff" />
          </div>
        )}
      </div>
      {photo && (
        <button
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', color: '#F44336',
            fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Remove Photo
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = await readFileAsDataURL(file);
          onPhoto(url);
        }
      }} />
    </div>
  );
}

/* ─── Upload Box ──────────────────────────────────────────────────────── */
function UploadBox({ label, preview, onFile, onRemove, accept = 'image/*', hint, height = 130 }) {
  const ref = useRef();
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</p>}
      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img
            src={preview} alt="preview"
            style={{ width: '100%', height, objectFit: 'cover', borderRadius: 14, border: '2px solid #1A73E8' }}
          />
          <button
            onClick={onRemove}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          ><X size={14} /></button>
        </div>
      ) : (
        <button
          onClick={() => ref.current.click()}
          style={{
            width: '100%', height,
            border: '2px dashed rgba(26,115,232,0.35)',
            borderRadius: 14, background: 'rgba(26,115,232,0.03)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 8, cursor: 'pointer',
            color: 'var(--text-muted)', transition: 'all 0.2s',
          }}
        >
          <Upload size={24} color="#1A73E8" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A73E8' }}>Tap to Upload</span>
          {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>}
        </button>
      )}
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = await readFileAsDataURL(file);
          onFile(url, file);
        }
      }} />
    </div>
  );
}

/* ─── Multi-photo Grid ────────────────────────────────────────────────── */
function MultiPhotoGrid({ photos, onAdd, onRemove, max = 6, label, hint }) {
  const ref = useRef();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        {label && (
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            {label} ({photos.length}/{max})
          </p>
        )}
        {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {photos.map((p, i) => (
          <div key={i} style={{
            position: 'relative', aspectRatio: '1',
            borderRadius: 12, overflow: 'hidden',
            border: '2px solid rgba(26,115,232,0.3)',
          }}>
            <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => onRemove(i)}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%',
                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            ><X size={11} /></button>
          </div>
        ))}
        {photos.length < max && (
          <button
            onClick={() => ref.current.click()}
            style={{
              aspectRatio: '1', border: '2px dashed rgba(26,115,232,0.35)',
              borderRadius: 12, background: 'rgba(26,115,232,0.03)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, cursor: 'pointer', color: '#1A73E8',
              transition: 'all 0.2s',
            }}
          >
            <Camera size={20} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Add</span>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = await readFileAsDataURL(file);
          onAdd(url);
        }
      }} />
    </div>
  );
}

/* ─── Step Progress ───────────────────────────────────────────────────── */
function StepProgress({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '14px 0 8px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 4, borderRadius: 4, flex: 1,
          background: i < step ? '#ffffff' : 'rgba(255,255,255,0.3)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  );
}

/* ─── Saving Overlay ──────────────────────────────────────────────────── */
function SavingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 20,
    }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 1.2s ease-in-out infinite',
        boxShadow: '0 0 40px rgba(26,115,232,0.4)',
      }}>
        <Zap size={40} color="#fff" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          Saving your profile...
        </p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
          Setting up your professional dashboard
        </p>
      </div>
      <div className="spinner spinner--lg" style={{ borderTopColor: '#1A73E8' }} />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function ProviderSetupPage() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const rawPhone = profile?.phone || user?.phone || '';
  const cleanPhone = rawPhone.startsWith('+91') ? rawPhone.slice(3) : rawPhone;

  const [form, setForm] = useState({
    // Step 1: Basic Details
    full_name:         profile?.full_name || '',
    phone:             cleanPhone,
    email:             user?.email || '',
    dob:               '',
    gender:            '',
    country:           'India',
    state:             '',
    city:              '',
    address:           '',
    pincode:           '',
    
    // Step 2: Professional Details
    profession:        '',
    experience_years:  '',
    bio:               '',
    service_areas:     '',
    languages:         [],

    // Step 3: Identity Verification (Handled via photos state)
    // Step 4: Portfolio (Handled via photos state)

    // Step 5: Service Details
    services_offered:  '',
    service_charge:    '', // Per Hour
    per_visit_charge:  '', // Per Visit
    fixed_price:       '', // Fixed Price
    emergency_available: false,

    // Step 6: Availability
    is_available:      true,
    working_days:      ['mon','tue','wed','thu','fri'],
    working_hours_start: '09:00',
    working_hours_end:   '18:00',
  });

  // Step 3 Uploads
  const [idProofPhoto,  setIdProofPhoto]  = useState(null); // Aadhaar
  const [panCardPhoto,  setPanCardPhoto]  = useState(null); // PAN
  const [selfiePhoto,   setSelfiePhoto]   = useState(null); // Selfie

  // Step 4 Uploads
  const [profilePhoto,  setProfilePhoto]  = useState(null); // Profile/Display Photo
  const [workPhotos,    setWorkPhotos]    = useState([]);
  const [servicePhotos, setServicePhotos] = useState([]);
  const [certificates,  setCertificates]  = useState([]);

  // GPS Location state
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | error
  const [gpsData, setGpsData] = useState(null);

  const isDemo = user?.demo === true || !import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // GPS Location fetcher — gets coords and reverse geocodes city/state/pincode
  const useGPSLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      return;
    }
    setGpsStatus('loading');
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000, enableHighAccuracy: true,
        })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      setGpsData({ lat, lng });

      // Reverse geocode using free Nominatim API
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const addr = data.address || {};

        // Auto-fill address fields from geocoding result
        const city = addr.city || addr.town || addr.village || addr.county || '';
        const state = addr.state || '';
        const postcode = addr.postcode || '';
        const road = addr.road || addr.suburb || '';
        const neighbourhood = addr.neighbourhood || addr.suburb || '';
        const fullAddress = [road, neighbourhood].filter(Boolean).join(', ');

        setForm(prev => ({
          ...prev,
          city:    city    || prev.city,
          state:   state   || prev.state,
          pincode: postcode || prev.pincode,
          address: fullAddress || prev.address,
          gps_lat: lat,
          gps_lng: lng,
        }));

        setGpsStatus('success');
        toast.success(`📍 Location detected: ${city || 'your area'}`);
      } catch {
        // Coords saved even if geocoding fails
        setForm(prev => ({ ...prev, gps_lat: lat, gps_lng: lng }));
        setGpsStatus('success');
        toast.success('📍 GPS coordinates captured!');
      }
    } catch (err) {
      setGpsStatus('error');
      if (err.code === 1) toast.error('Location permission denied. Please allow in browser settings.');
      else if (err.code === 2) toast.error('Location unavailable. Check GPS signal.');
      else toast.error('Location request timed out. Try again.');
    }
  };

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

  /* ── Validation ── */
  const canProceed = () => {
    if (step === 1) {
      return form.full_name.trim().length >= 3 &&
             form.phone.trim().length >= 10 &&
             form.dob !== '' &&
             form.gender !== '' &&
             form.state.trim().length >= 2 &&
             form.city.trim().length >= 2 &&
             form.address.trim().length >= 5 &&
             form.pincode.trim().length >= 6;
    }
    if (step === 2) {
      return form.profession !== '' &&
             form.experience_years !== '' &&
             form.service_areas.trim().length >= 3 &&
             form.languages.length >= 1;
    }
    if (step === 3) {
      return !!idProofPhoto && !!selfiePhoto; // PAN is optional
    }
    if (step === 4) {
      return !!profilePhoto; // Work photos, service images, and certificates are technically optional but we require at least profile photo
    }
    if (step === 5) {
      // Need at least one pricing option to be valid, and services offered
      return form.services_offered.trim().length >= 3 &&
             (form.service_charge !== '' || form.per_visit_charge !== '' || form.fixed_price !== '');
    }
    if (step === 6) {
      return form.working_days.length >= 1 &&
             form.working_hours_start !== '' &&
             form.working_hours_end !== '';
    }
    if (step === 7) return true;
    return false;
  };

  const next = () => {
    if (!canProceed()) {
      const msgs = {
        1: 'Please fill in all basic details, DOB, Address, Pincode, and 10-digit mobile number.',
        2: 'Select a profession, years of experience, service areas, and at least 1 language.',
        3: 'Please upload your Aadhaar Card and Selfie Photo.',
        4: 'Please upload your Profile Photo.',
        5: 'Enter the services you offer and at least one pricing structure.',
        6: 'Select working hours and at least 1 working day.',
      };
      toast.error(msgs[step] || 'Please complete all required fields.');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  /* ── Submit & Save ── */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedPhone = form.phone.startsWith('+91') ? form.phone : `+91${form.phone}`;

      const providerData = {
        id:                user?.id,
        role:              'provider',
        full_name:         form.full_name,
        phone:             formattedPhone,
        email:             form.email,
        dob:               form.dob,
        gender:            form.gender,
        country:           form.country,
        state:             form.state,
        city:              form.city,
        address:           form.address,
        pincode:           form.pincode,
        profession:        form.profession,
        experience_years:  parseInt(form.experience_years) || 0,
        bio:               form.bio || `Professional ${form.profession}.`,
        service_areas:     form.service_areas,
        languages:         form.languages,
        
        services_offered:  form.services_offered,
        service_charge:    parseFloat(form.service_charge) || 0,
        per_visit_charge:  parseFloat(form.per_visit_charge) || 0,
        fixed_price:       parseFloat(form.fixed_price) || 0,
        emergency_available: form.emergency_available,
        
        is_available:      form.is_available,
        working_days:      form.working_days,
        working_hours_start: form.working_hours_start,
        working_hours_end:   form.working_hours_end,
        
        id_proof_url:      idProofPhoto,
        pan_card_url:      panCardPhoto,
        selfie_photo:      selfiePhoto,
        
        profile_photo:     profilePhoto,
        work_photos:       workPhotos,
        service_photos:    servicePhotos,
        certificates:      certificates,
        
        avg_rating:        4.8, // Pre-populated stats
        total_reviews:     12,
        completed_jobs:    25,
        setup_complete:    true,
        created_at:        new Date().toISOString(),
      };

      if (!isDemo) {
        // Save to Supabase (Omitted for brevity in local demo but this would run)
        const { error: pErr } = await supabase
          .from('profiles')
          .upsert({
            id:        user?.id,
            role:      'provider',
            full_name: form.full_name,
            phone:     formattedPhone,
            avatar_url: profilePhoto,
            setup_complete: true
          }, { onConflict: 'id' });
        if (pErr) throw pErr;

        const { error: ppErr } = await supabase
          .from('provider_profiles')
          .upsert({
            id:                user?.id,
            profession:        form.profession,
            experience_years:  parseInt(form.experience_years) || 0,
            bio:               form.bio,
            service_charge:    parseFloat(form.service_charge) || 0,
            per_visit_charge:  parseFloat(form.per_visit_charge) || 0,
            fixed_price:       parseFloat(form.fixed_price) || 0,
            emergency_available: form.emergency_available,
            address:           form.address,
            city:              form.city,
            state:             form.state,
            pincode:           form.pincode,
            is_available:      form.is_available,
            working_days:      form.working_days,
            working_hours_start: form.working_hours_start,
            working_hours_end:   form.working_hours_end,
            service_areas:     form.service_areas,
            languages:         form.languages,
            avg_rating:        4.8,
            total_reviews:     12,
            completed_jobs:    25,
          }, { onConflict: 'id' });
        if (ppErr) throw ppErr;
      }

      // Save to localStorage
      setProfile(providerData);
      try {
        const demoProfiles = JSON.parse(localStorage.getItem('quickfix_demo_profiles') || '{}');
        demoProfiles[user?.id] = providerData;
        localStorage.setItem('quickfix_demo_profiles', JSON.stringify(demoProfiles));

        const allProviders = JSON.parse(localStorage.getItem('quickfix_all_providers') || '[]');
        const idx = allProviders.findIndex(p => p.id === user?.id);
        if (idx >= 0) allProviders[idx] = providerData;
        else allProviders.push(providerData);
        localStorage.setItem('quickfix_all_providers', JSON.stringify(allProviders));
      } catch (e) {
        console.error('localStorage error:', e);
      }

      await new Promise(r => setTimeout(r, 1200));
      toast.success('🎉 Profile created successfully!');
      navigate('/provider/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please check your data and try again.');
      setLoading(false);
    }
  };

  const stepMeta = STEP_META[step - 1];
  const StepIcon = stepMeta.icon;

  const headerGradients = [
    'linear-gradient(135deg, #1A73E8, #0D47A1)',
    'linear-gradient(135deg, #0D47A1, #1565C0)',
    'linear-gradient(135deg, #1565C0, #1976D2)',
    'linear-gradient(135deg, #1976D2, #0288D1)',
    'linear-gradient(135deg, #0288D1, #0097A7)',
    'linear-gradient(135deg, #0097A7, #00796B)',
    'linear-gradient(135deg, #00796B, #2E7D32)',
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <SavingOverlay visible={loading} />

      {/* ── Header ── */}
      <div style={{
        background: headerGradients[step - 1],
        padding: '44px 20px 18px',
        position: 'relative', overflow: 'hidden',
        transition: 'background 0.5s ease',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />

        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              position: 'absolute', top: 48, left: 16,
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: 12, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)',
            }}
          ><ArrowLeft size={18} /></button>
        )}

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: 'rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px', backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}>
            <StepIcon size={26} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 20,
            fontWeight: 800, color: '#fff', marginBottom: 2,
          }}>
            {stepMeta.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
            {stepMeta.subtitle}
          </p>
          <StepProgress step={step} total={TOTAL_STEPS} />
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
            Step {step} of {TOTAL_STEPS} · {Math.round((step / TOTAL_STEPS) * 100)}% complete
          </p>
        </div>
      </div>

      {/* ── Step Content ── */}
      <div style={{ flex: 1, padding: '20px 18px 100px', overflowY: 'auto' }}>

        {/* ══ STEP 1 — Basic Details ══ */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.dob}
                  onChange={e => update('dob', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  className="form-input"
                  value={form.gender}
                  onChange={e => update('gender', e.target.value)}
                  style={{ height: 46 }}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 12px', background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)', borderRadius: 12,
                  fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
                }}>🇮🇳 +91</div>
                <input
                  className="form-input"
                  type="tel" inputMode="numeric"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  className="form-input"
                  value={form.country}
                  onChange={e => update('country', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  className="form-input"
                  value={form.state}
                  onChange={e => update('state', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  className="form-input"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 560001"
                  value={form.pincode}
                  onChange={e => update('pincode', e.target.value.slice(0, 6))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <textarea
                className="form-input"
                placeholder="House No, Street Name, Area..."
                value={form.address}
                onChange={e => update('address', e.target.value)}
                rows={2}
                style={{ resize: 'none' }}
              />
            </div>

            {/* GPS Location Button */}
            <div style={{
              background: gpsStatus === 'success'
                ? 'rgba(0,200,83,0.06)'
                : gpsStatus === 'error'
                ? 'rgba(244,67,54,0.06)'
                : 'rgba(26,115,232,0.04)',
              border: `1.5px solid ${
                gpsStatus === 'success' ? 'rgba(0,200,83,0.25)'
                : gpsStatus === 'error' ? 'rgba(244,67,54,0.2)'
                : 'rgba(26,115,232,0.15)'}`,
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              transition: 'all 0.3s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: gpsStatus === 'success' ? 10 : 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color={gpsStatus === 'success' ? '#00C853' : '#1A73E8'} />
                    GPS Location
                    {gpsStatus === 'success' && <span style={{ fontSize: 11, color: '#00C853', fontWeight: 600 }}>✓ Captured</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {gpsStatus === 'success'
                      ? `${gpsData?.lat?.toFixed(5)}, ${gpsData?.lng?.toFixed(5)}`
                      : 'Auto-fill city, state & pincode from GPS'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={useGPSLocation}
                  disabled={gpsStatus === 'loading'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    border: 'none', cursor: gpsStatus === 'loading' ? 'not-allowed' : 'pointer',
                    background: gpsStatus === 'success'
                      ? 'linear-gradient(135deg,#00C853,#69F0AE)'
                      : gpsStatus === 'error'
                      ? 'linear-gradient(135deg,#F44336,#FF7043)'
                      : 'linear-gradient(135deg,#1A73E8,#0D47A1)',
                    color: '#fff',
                    boxShadow: gpsStatus === 'loading' ? 'none'
                      : gpsStatus === 'success' ? '0 4px 12px rgba(0,200,83,0.3)'
                      : '0 4px 12px rgba(26,115,232,0.3)',
                    transition: 'all 0.3s',
                    opacity: gpsStatus === 'loading' ? 0.7 : 1,
                  }}
                >
                  {gpsStatus === 'loading' ? (
                    <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Detecting...</>
                  ) : gpsStatus === 'success' ? (
                    <><Navigation size={13} /> Update</>
                  ) : gpsStatus === 'error' ? (
                    <><Navigation size={13} /> Retry</>
                  ) : (
                    <><Navigation size={13} /> Use GPS</>
                  )}
                </button>
              </div>

              {gpsStatus === 'success' && gpsData && (
                <a
                  href={`https://www.google.com/maps?q=${gpsData.lat},${gpsData.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, color: '#1A73E8', fontWeight: 600, textDecoration: 'none',
                    marginTop: 2,
                  }}
                >
                  <MapPin size={11} /> View on Google Maps ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* ══ STEP 2 — Professional Details ══ */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Profession Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => update('profession', s.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 14,
                      background: form.profession === s.id ? 'rgba(26,115,232,0.06)' : 'var(--bg-card)',
                      border: `2px solid ${form.profession === s.id ? '#1A73E8' : 'var(--border-color)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{s.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: form.profession === s.id ? '#1A73E8' : 'var(--text-primary)' }}>{s.label}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience *</label>
              <input
                className="form-input"
                type="number" placeholder="e.g. 5"
                value={form.experience_years}
                onChange={e => update('experience_years', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Description / Bio</label>
              <textarea
                className="form-input"
                placeholder="Describe your specialized services..."
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Areas Covered *</label>
              <input
                className="form-input"
                placeholder="e.g. HSR Layout, Koramangala"
                value={form.service_areas}
                onChange={e => update('service_areas', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Languages Known *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {LANGUAGES.map(l => {
                  const selected = form.languages.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleLanguage(l.id)}
                      style={{
                        padding: '10px 0',
                        borderRadius: 10,
                        border: `1.5px solid ${selected ? '#1A73E8' : 'var(--border-color)'}`,
                        background: selected ? 'rgba(26,115,232,0.06)' : 'var(--bg-card)',
                        color: selected ? '#1A73E8' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Identity Verification ══ */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div style={{
              background: 'var(--bg-card)', borderRadius: 16,
              padding: '18px', marginBottom: 16, border: '1px solid var(--border-light)'
            }}>
              <UploadBox
                label="Upload Aadhaar Card *"
                preview={idProofPhoto}
                onFile={url => setIdProofPhoto(url)}
                onRemove={() => setIdProofPhoto(null)}
              />
              <UploadBox
                label="Upload PAN Card (Optional)"
                preview={panCardPhoto}
                onFile={url => setPanCardPhoto(url)}
                onRemove={() => setPanCardPhoto(null)}
              />
              <UploadBox
                label="Upload Selfie Photo *"
                preview={selfiePhoto}
                onFile={url => setSelfiePhoto(url)}
                onRemove={() => setSelfiePhoto(null)}
              />
            </div>
          </div>
        )}

        {/* ══ STEP 4 — Portfolio ══ */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div style={{
              background: 'var(--bg-card)', borderRadius: 16,
              padding: '18px', marginBottom: 16, border: '1px solid var(--border-light)'
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Profile Photo *</p>
              <ProfilePhotoPicker
                photo={profilePhoto}
                onPhoto={url => setProfilePhoto(url)}
                onRemove={() => setProfilePhoto(null)}
              />

              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <MultiPhotoGrid
                  label="Previous Work Photos"
                  photos={workPhotos} max={6}
                  onAdd={url => setWorkPhotos(p => [...p, url])}
                  onRemove={i => setWorkPhotos(p => p.filter((_, idx) => idx !== i))}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <MultiPhotoGrid
                  label="Service Gallery Images"
                  photos={servicePhotos} max={6}
                  onAdd={url => setServicePhotos(p => [...p, url])}
                  onRemove={i => setServicePhotos(p => p.filter((_, idx) => idx !== i))}
                />
              </div>

              <div>
                <MultiPhotoGrid
                  label="Upload Certificates (Optional)"
                  photos={certificates} max={4}
                  onAdd={url => setCertificates(p => [...p, url])}
                  onRemove={i => setCertificates(p => p.filter((_, idx) => idx !== i))}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 5 — Service Details ══ */}
        {step === 5 && (
          <div className="animate-fadeIn">
            <div className="form-group">
              <label className="form-label">Add Services Offered *</label>
              <textarea
                className="form-input"
                placeholder="e.g. AC Gas Filing, Switchboard Repair, Tap Leakage Fix..."
                value={form.services_offered}
                onChange={e => update('services_offered', e.target.value)}
                rows={3}
              />
            </div>

            <p style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 10px' }}>Set Service Charges</p>

            <div className="form-group">
              <label className="form-label">Per Hour Charge (₹)</label>
              <input
                className="form-input" type="number" placeholder="e.g. 250"
                value={form.service_charge}
                onChange={e => update('service_charge', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Per Visit Charge (₹)</label>
              <input
                className="form-input" type="number" placeholder="e.g. 150"
                value={form.per_visit_charge}
                onChange={e => update('per_visit_charge', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fixed Price (₹) (Optional)</label>
              <input
                className="form-input" type="number" placeholder="e.g. 1500"
                value={form.fixed_price}
                onChange={e => update('fixed_price', e.target.value)}
              />
            </div>

            <div style={{
              background: 'var(--bg-card)', borderRadius: 14, padding: '16px 18px',
              border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 14, marginTop: 16
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Emergency Service Available</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Are you available for urgent requests?</p>
              </div>
              <button
                onClick={() => update('emergency_available', !form.emergency_available)}
                style={{
                  width: 48, height: 26, borderRadius: 100, border: 'none',
                  background: form.emergency_available ? '#00C853' : 'var(--border-color)',
                  cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3, left: form.emergency_available ? 25 : 3, transition: 'all 0.2s'
                }} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 6 — Availability ══ */}
        {step === 6 && (
          <div className="animate-fadeIn">
            <div style={{
              background: 'var(--bg-card)', borderRadius: 14, padding: '16px 18px',
              border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Online / Offline Toggle</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Set your profile visible right away.</p>
              </div>
              <button
                onClick={() => update('is_available', !form.is_available)}
                style={{
                  width: 48, height: 26, borderRadius: 100, border: 'none',
                  background: form.is_available ? '#1A73E8' : 'var(--border-color)',
                  cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3, left: form.is_available ? 25 : 3, transition: 'all 0.2s'
                }} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Available Days *</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {WORKING_DAYS.map(day => {
                  const selected = form.working_days.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      style={{
                        padding: '10px 14px', borderRadius: 12,
                        border: `1.5px solid ${selected ? '#1976D2' : 'var(--border-color)'}`,
                        background: selected ? 'rgba(25,118,210,0.06)' : 'var(--bg-card)',
                        color: selected ? '#1976D2' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Available Time Slots Start *</label>
                <input
                  className="form-input" type="time"
                  value={form.working_hours_start}
                  onChange={e => update('working_hours_start', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Available Time Slots End *</label>
                <input
                  className="form-input" type="time"
                  value={form.working_hours_end}
                  onChange={e => update('working_hours_end', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 7 — Ratings & Reviews ══ */}
        {step === 7 && (
          <div className="animate-fadeIn">
            <div style={{
              background: 'rgba(46,125,50,0.06)', borderRadius: 14,
              padding: '14px 16px', border: '1px solid rgba(46,125,50,0.15)',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
            }}>
              <CheckCircle size={22} color="#2E7D32" />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Your profile is almost ready! Here is how your stats will appear.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)', borderRadius: 18,
              padding: 24, border: '1px solid var(--border-light)',
              boxShadow: '0 2px 14px rgba(0,0,0,0.04)',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20
              }}>
                <div style={{ flex: 1, padding: 16, background: '#FFF8E1', borderRadius: 16 }}>
                  <Star size={32} color="#FFB300" style={{ margin: '0 auto 8px' }} fill="#FFB300" />
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#333' }}>4.8</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average Rating</p>
                </div>
                <div style={{ flex: 1, padding: 16, background: '#E3F2FD', borderRadius: 16 }}>
                  <FileText size={32} color="#1E88E5" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#333' }}>12</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Reviews</p>
                </div>
              </div>

              <div style={{ padding: 16, background: '#E8F5E9', borderRadius: 16 }}>
                <Briefcase size={32} color="#43A047" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 24, fontWeight: 800, color: '#333' }}>25</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed Jobs</p>
              </div>

              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{form.full_name}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {SERVICES.find(s => s.id === form.profession)?.label} • {form.city}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom Navigation Action Bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, padding: 16,
        background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)',
        display: 'flex', gap: 12, zIndex: 10,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
      }}>
        <button
          onClick={next}
          className="btn btn--primary btn--full btn--lg"
          style={{
            background: step === 7 ? 'linear-gradient(135deg, #2E7D32, #1B5E20)' : 'linear-gradient(135deg, #1A73E8, #0D47A1)',
            boxShadow: step === 7 ? '0 4px 16px rgba(46,125,50,0.3)' : '0 4px 16px rgba(26,115,232,0.3)',
            borderRadius: 14, fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {step === 7 ? '✓ Finish & Submit Profile' : <>Continue <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  );
}
