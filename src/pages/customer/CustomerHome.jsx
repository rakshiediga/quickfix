import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bell, Star, ChevronRight, Search, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const CATEGORIES = [
  { id: 'plumber', label: 'Plumber', emoji: '🔧', color: '#3B82F6' },
  { id: 'electrician', label: 'Electrician', emoji: '⚡', color: '#F59E0B' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🪚', color: '#8B5CF6' },
  { id: 'mechanic', label: 'Mechanic', emoji: '🔩', color: '#10B981' },
  { id: 'painter', label: 'Painter', emoji: '🖌️', color: '#EF4444' },
  { id: 'cleaner', label: 'Cleaner', emoji: '🧹', color: '#06B6D4' },
  { id: 'ac_repair', label: 'AC Repair', emoji: '❄️', color: '#6366F1' },
  { id: 'pest', label: 'Pest Control', emoji: '🐛', color: '#84CC16' },
];

const MOCK_PROVIDERS = [
  { id: '1', full_name: 'Rajesh Kumar', profession: 'plumber', avg_rating: 4.8, total_reviews: 124, distance: '1.2 km', price: '₹299', avatar: '👨‍🔧', is_available: true, experience_years: 5 },
  { id: '2', full_name: 'Suresh Sharma', profession: 'electrician', avg_rating: 4.9, total_reviews: 87, distance: '0.8 km', price: '₹349', avatar: '👷', is_available: true, experience_years: 8 },
  { id: '3', full_name: 'Amit Patel', profession: 'carpenter', avg_rating: 4.7, total_reviews: 63, distance: '2.1 km', price: '₹399', avatar: '🧑‍🏭', is_available: true, experience_years: 6 },
  { id: '4', full_name: 'Vijay Yadav', profession: 'mechanic', avg_rating: 4.6, total_reviews: 45, distance: '3.0 km', price: '₹249', avatar: '👨‍🔧', is_available: false, experience_years: 4 },
];

export default function CustomerHome() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [providers] = useState(MOCK_PROVIDERS);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 20px', background: 'var(--gradient-dark)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,0.12)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>{greeting} 👋</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginTop: 2 }}>
              {profile?.full_name?.split(' ')[0] || 'Welcome'}
            </h2>
          </div>
          <button onClick={() => navigate('/customer/profile')}>
            <div className="avatar avatar--md" style={{ background: 'var(--gradient-primary)', color: '#fff', border: '2px solid rgba(124,58,237,0.4)', fontSize: 20 }}>
              {profile?.full_name?.[0] || '?'}
            </div>
          </button>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', padding: '8px 14px', color: 'var(--text-secondary)', fontSize: 14 }}>
          <MapPin size={14} style={{ color: 'var(--brand-primary-light)' }} />
          <span>Koramangala, Bengaluru</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Search */}
        <div className="search-bar" onClick={() => navigate('/customer/search')} style={{ cursor: 'pointer' }}>
          <Search className="search-bar__icon" size={18} />
          <input readOnly placeholder="Search plumbers, electricians..." style={{ cursor: 'pointer', background: 'var(--bg-input)' }} />
        </div>

        {/* Hero Banner */}
        <div className="hero-banner">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              <Zap size={12} /> Special Offer
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>First booking FREE!</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 14 }}>Use code: <b>QUICKFIX1</b></p>
            <button className="btn btn--sm" onClick={() => navigate('/customer/search')} style={{ background: '#fff', color: 'var(--brand-primary-dark)', fontWeight: 700, borderRadius: 'var(--radius-full)' }}>
              Book Now
            </button>
          </div>
          <div style={{ position: 'absolute', right: 20, bottom: 16, fontSize: 48, opacity: 0.25 }}>🛠️</div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h3 className="section-title">Services</h3>
            <button className="btn btn--ghost btn--sm" style={{ color: 'var(--text-link)' }} onClick={() => navigate('/customer/search')}>See all</button>
          </div>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="category-item" onClick={() => navigate(`/customer/search?category=${cat.id}`)}>
                <div className="category-icon" style={{ background: `${cat.color}18` }}>
                  <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                </div>
                <span className="category-label">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Providers */}
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h3 className="section-title">Nearby Providers</h3>
            <button className="btn btn--ghost btn--sm" style={{ color: 'var(--text-link)' }} onClick={() => navigate('/customer/search')}>View all</button>
          </div>

          {/* Map preview */}
          <div className="map-container" style={{ marginBottom: 16 }}>
            <div className="map-placeholder">
              <div style={{ fontSize: 40 }}>🗺️</div>
              <p style={{ fontSize: 13, fontWeight: 500 }}>Map View</p>
              <p style={{ fontSize: 11 }}>Configure Google Maps API key to enable</p>
            </div>
            {MOCK_PROVIDERS.filter(p => p.is_available).map((p, i) => (
              <div key={p.id} onClick={() => navigate(`/customer/provider/${p.id}`)} style={{
                position: 'absolute',
                top: `${20 + i * 20}%`, left: `${15 + i * 22}%`,
                background: 'var(--brand-primary)', color: '#fff',
                borderRadius: 'var(--radius-full)', padding: '3px 10px',
                fontSize: 11, fontWeight: 700,
                boxShadow: 'var(--shadow-brand)',
                border: '2px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', zIndex: 2,
              }}>
                {p.profession === 'plumber' ? '🔧' : p.profession === 'electrician' ? '⚡' : '🪚'} {p.price}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {providers.map(p => (
              <div key={p.id} className="provider-card" onClick={() => navigate(`/customer/provider/${p.id}`)}>
                <div className="avatar avatar--lg" style={{ background: 'var(--bg-tertiary)', fontSize: 26, border: p.is_available ? '2px solid var(--brand-accent)' : '2px solid var(--border-light)' }}>
                  {p.avatar}
                </div>
                <div className="provider-card__info">
                  <div className="provider-card__name">{p.full_name}</div>
                  <div className="provider-card__profession">{p.profession.charAt(0).toUpperCase() + p.profession.slice(1)} • {p.experience_years}y exp</div>
                  <div className="provider-card__meta">
                    <div className="provider-card__rating">
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span>{p.avg_rating}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({p.total_reviews})</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span className="provider-card__distance">{p.distance}</span>
                    <span className="provider-card__price">{p.price}</span>
                  </div>
                </div>
                <span className={`badge ${p.is_available ? 'badge--online' : 'badge--offline'}`}>{p.is_available ? 'Online' : 'Busy'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
