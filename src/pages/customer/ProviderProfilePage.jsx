import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Shield, Phone, MessageCircle, Award, Navigation, ExternalLink, Loader } from 'lucide-react';
import ProviderLocationMap from '../../components/ProviderLocationMap';
import { getProviderById, getReviews } from '../../lib/db';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const load = async () => {
      setLoadingProvider(true);
      const data = await getProviderById(id);
      setProvider(data);
      setLoadingProvider(false);
      // load reviews
      const revData = await getReviews(id);
      setReviews(revData || []);
    };
    load();
  }, [id]);

  if (loadingProvider) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader size={32} color="#FF5722" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#9E9E9E', fontSize: 14 }}>Loading provider profile…</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Provider not found</h2>
        <p style={{ color: '#9E9E9E', fontSize: 14, marginBottom: 20 }}>This provider may have removed their profile.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '12px 24px', borderRadius: 10, background: '#FF5722', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Display helpers
  const name = provider.full_name || 'Provider';
  const profession = provider.profession || 'Service Provider';
  const rating = provider.avg_rating;
  const reviewCount = provider.total_reviews || 0;
  const experience = provider.experience_years || 0;
  const bio = provider.bio || 'Experienced service professional.';
  const serviceArea = provider.service_areas || provider.city || '—';
  const price = provider.per_visit_charge || provider.service_charge || null;
  const lat = provider.lat || provider.current_lat || provider.gps_lat;
  const lng = provider.lng || provider.current_lng || provider.gps_lng;
  const address = provider.address || [provider.city, provider.state].filter(Boolean).join(', ') || '';
  const avatar = provider.profile_photo || provider.avatar_url;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div style={{ background: 'var(--gradient-primary)', padding: '48px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
        <button className="header__back" onClick={() => navigate(-1)} style={{ marginBottom: 20, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}>
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div className="avatar avatar--xl" style={{
            background: '#FFFFFF', fontSize: 38,
            border: provider.is_available ? '3px solid var(--brand-accent)' : '3px solid var(--border-light)',
            overflow: 'hidden',
          }}>
            {avatar
              ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : name[0]?.toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>{name}</h1>
              <span className={`badge ${provider.is_available ? 'badge--online' : 'badge--offline'}`}>
                {provider.is_available ? '● Online' : '● Offline'}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: 'capitalize' }}>
              {profession} • {experience} yrs exp
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>{rating}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>({reviewCount} reviews)</span>
                </div>
              )}
              {provider.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                  <MapPin size={13} />
                  <span>{provider.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20 }}>
          {[
            { label: 'Jobs Done', value: provider.completed_jobs || '0', icon: '✅' },
            { label: 'Rating', value: rating ? `${rating}⭐` : 'New', icon: '' },
            { label: 'Experience', value: `${experience}y`, icon: '🏆' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px' }}>
        <div className="tab-bar" style={{ margin: '16px 0' }}>
          {['about', ...(lat && lng ? ['location'] : []), 'services', 'reviews'].map(t => (
            <div key={t} className={`tab-item ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)} style={{ fontSize: 12, position: 'relative' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'reviews' && reviews.length > 0 && (
                <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 800, background: '#FF5722', color: '#fff', borderRadius: 8, padding: '0 4px' }}>{reviews.length}</span>
              )}
            </div>
          ))}
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="animate-fadeIn">
            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 8 }}>About</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{bio}</p>
            </div>
            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Details</h4>
              {[
                { icon: <MapPin size={16} />, label: 'Service Area', value: serviceArea },
                { icon: <Clock size={16} />, label: 'Working Hours', value: provider.working_hours_start && provider.working_hours_end ? `${provider.working_hours_start} – ${provider.working_hours_end}` : 'Flexible' },
                { icon: <Shield size={16} />, label: 'Emergency Service', value: provider.emergency_available ? '✅ Available' : '❌ Not available' },
                { icon: <Award size={16} />, label: 'Languages', value: Array.isArray(provider.languages) && provider.languages.length > 0 ? provider.languages.join(', ') : '—' },
              ].filter(d => d.value && d.value !== '—').map(d => (
                <div key={d.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--brand-primary-light)', marginTop: 1 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{d.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{d.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && lat && lng && (
          <div className="animate-fadeIn">
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <ProviderLocationMap
                providerLat={lat}
                providerLng={lng}
                providerName={name}
                height="260px"
                zoom={15}
                showRadius={true}
                serviceRadius={3}
              />
            </div>
            <div className="card" style={{ marginBottom: 12, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="#FF5722" /> Provider Location
                  </div>
                  {address && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{address}</div>}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 10 }}>
                  <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#FF5722,#FF8A65)', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <Navigation size={13} /> Get Directions
                  </a>
                  <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'rgba(255,87,34,0.06)', border: '1px solid rgba(255,87,34,0.2)', color: '#FF5722', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <ExternalLink size={13} /> Google Maps
                  </a>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,87,34,0.04)', border: '1px solid rgba(255,87,34,0.15)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px dashed #FF5722', flexShrink: 0 }} />
              Serves within <b style={{ color: '#FF5722', margin: '0 3px' }}>3 km</b> radius · {serviceArea}
            </div>
          </div>
        )}

        {/* Services / Pricing Tab */}
        {activeTab === 'services' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              provider.per_visit_charge && { name: 'Per Visit', price: provider.per_visit_charge, desc: 'Flat visit charge', time: '30 min–2 hrs' },
              provider.service_charge && { name: 'Hourly Rate', price: provider.service_charge, desc: 'Charged per hour of work', time: 'Varies' },
              provider.fixed_price && { name: 'Fixed Package', price: provider.fixed_price, desc: 'All-inclusive fixed price', time: '2–4 hrs' },
              provider.emergency_available && { name: 'Emergency Call', price: (provider.per_visit_charge || 0) + 200, desc: 'Available 24/7, urgent response', time: 'Immediate' },
            ].filter(Boolean).map(s => (
              <div key={s.name} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc} · {s.time}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--brand-accent)' }}>₹{s.price}</div>
              </div>
            ))}
            {!provider.per_visit_charge && !provider.service_charge && !provider.fixed_price && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9E9E9E' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                <p style={{ fontSize: 13 }}>Contact provider for pricing details</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="animate-fadeIn">
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1.5px dashed var(--border-color)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No reviews yet</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Be the first to book and review this provider!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map(r => (
                  <div key={r.id} className="card">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                        {r.customer?.avatar_url
                          ? <img src={r.customer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : r.customer?.full_name?.[0]?.toUpperCase() || '👤'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.customer?.full_name || 'Customer'}</div>
                        <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={i <= r.rating ? '#F59E0B' : 'transparent'} color={i <= r.rating ? '#F59E0B' : '#E0E0E0'} />)}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12 }}>
        <button className="btn btn--secondary btn--icon" onClick={() => navigate(`/customer/chat/book-${provider.id}`)} title="Message">
          <MessageCircle size={20} />
        </button>
        <a href={`tel:${provider.phone}`} className="btn btn--secondary btn--icon" title="Call">
          <Phone size={20} />
        </a>
        <button
          className="btn btn--primary"
          style={{ flex: 1 }}
          disabled={!provider.is_available}
          onClick={() => navigate(`/customer/book/${provider.id}`)}
        >
          {provider.is_available
            ? price ? `Book Now • ₹${price}` : 'Book Now'
            : 'Currently Unavailable'}
        </button>
      </div>
      <div style={{ height: 88 }} />
    </div>
  );
}
