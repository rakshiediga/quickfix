import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Bell, Star, ChevronRight, Search, Zap,
  Navigation, Loader, Map, RefreshCw, SlidersHorizontal, X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useNearbyProviders from '../../hooks/useNearbyProviders';
import useRealtimeNotifications from '../../hooks/useRealtimeNotifications';
import NearbyProvidersMap from '../../components/NearbyProvidersMap';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'all',         label: 'All',          emoji: '🌟' },
  { id: 'plumber',     label: 'Plumber',       emoji: '🔧', color: '#2196F3', bg: '#E3F2FD' },
  { id: 'electrician', label: 'Electrician',   emoji: '⚡', color: '#FF9800', bg: '#FFF3E0' },
  { id: 'carpenter',   label: 'Carpenter',     emoji: '🪚', color: '#9C27B0', bg: '#F3E5F5' },
  { id: 'mechanic',    label: 'Mechanic',      emoji: '🔩', color: '#00BCD4', bg: '#E0F7FA' },
  { id: 'painter',     label: 'Painter',       emoji: '🖌️', color: '#F44336', bg: '#FFEBEE' },
  { id: 'cleaner',     label: 'Cleaner',       emoji: '🧹', color: '#009688', bg: '#E0F2F1' },
  { id: 'ac_repair',   label: 'AC Repair',     emoji: '❄️', color: '#3F51B5', bg: '#E8EAF6' },
  { id: 'pest',        label: 'Pest Control',  emoji: '🐛', color: '#4CAF50', bg: '#E8F5E9' },
];

export default function CustomerHome() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { unreadCount } = useRealtimeNotifications(profile?.id);

  const [activeCategory, setActiveCategory] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);

  const {
    providers, loading, userLat, userLng,
    locationLabel, locStatus, requestLocation, refresh
  } = useNearbyProviders({ radiusKm, category: activeCategory === 'all' ? null : activeCategory });

  const providersWithCoords = providers.filter(p => p.lat && p.lng);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>

      {/* ─── Hero Header ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)',
        padding: '48px 20px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>{greeting} 👋</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 2 }}>
              {profile?.full_name?.split(' ')[0] || 'Welcome'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/customer/notifications')}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', border: 'none', cursor: 'pointer', position: 'relative',
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#FF9800', border: '2px solid #FF5722',
                }} />
              )}
            </button>
            <button onClick={() => navigate('/customer/profile')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: '#fff', overflow: 'hidden',
              }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
            </button>
          </div>
        </div>

        {/* Location button */}
        <button
          onClick={locStatus === 'loading' ? undefined : requestLocation}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: locStatus === 'success' ? 'rgba(0,200,83,0.25)' : 'rgba(255,255,255,0.2)',
            border: `1px solid ${locStatus === 'success' ? 'rgba(0,200,83,0.5)' : 'rgba(255,255,255,0.3)'}`,
            borderRadius: 100, padding: '7px 14px',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: locStatus === 'loading' ? 'wait' : 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {locStatus === 'loading' ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : locStatus === 'success' ? <MapPin size={13} /> : <Navigation size={13} />}
          <span>
            {locStatus === 'success' && locationLabel ? locationLabel
              : locStatus === 'loading' ? 'Detecting location…'
              : 'Share location'}
          </span>
          {locStatus !== 'loading' && <ChevronRight size={13} />}
        </button>
      </div>

      {/* ─── Search bar ─── */}
      <div style={{ padding: '0 16px', marginTop: -20, marginBottom: 4, position: 'relative', zIndex: 2 }}>
        <div className="search-bar" onClick={() => navigate('/customer/search')} style={{ cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          <Search size={18} color="#9E9E9E" />
          <input readOnly placeholder="Search plumbers, electricians, AC repair..." style={{ cursor: 'pointer' }} />
          <div style={{ background: '#FF5722', color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>Search</div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ─── Promo Banner ─── */}
        <div className="hero-banner" style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              <Zap size={11} /> LIMITED OFFER
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>First booking FREE! 🎉</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 14 }}>Use code: <b>QUICKFIX1</b></p>
            <button onClick={() => navigate('/customer/search')} style={{ background: '#fff', color: '#FF5722', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Book Now</button>
          </div>
          <div style={{ position: 'absolute', right: 16, bottom: 12, fontSize: 52, opacity: 0.2 }}>🛠️</div>
        </div>

        {/* ─── Category Chips (horizontal scroll) ─── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#212121' }}>Our Services</h3>
            <button onClick={() => navigate('/customer/search')} style={{ color: '#FF5722', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: activeCategory === cat.id ? '#FF5722' : '#fff',
                  color: activeCategory === cat.id ? '#fff' : '#424242',
                  boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(255,87,34,0.35)' : '0 1px 4px rgba(0,0,0,0.07)',
                  transition: 'all 0.2s', flexShrink: 0, minWidth: 68,
                }}
              >
                <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { icon: '⚡', label: 'Response', value: '< 5 min' },
            { icon: '🏆', label: 'Providers', value: providers.length > 0 ? `${providers.length}` : '0' },
            { icon: '📍', label: 'Radius', value: `${radiusKm} km` },
          ].map((s, i) => (
            <div key={i}
              onClick={i === 2 ? () => setShowRadiusSlider(v => !v) : undefined}
              style={{
                background: '#fff', borderRadius: 12, padding: '12px 10px', textAlign: 'center',
                border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                cursor: i === 2 ? 'pointer' : 'default',
              }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: '#FF5722' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#9E9E9E', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Radius slider ─── */}
        {showRadiusSlider && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #F0F0F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Search Radius</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#FF5722' }}>{radiusKm} km</span>
            </div>
            <input type="range" min="2" max="50" step="2" value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#FF5722' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9E9E9E' }}>
              <span>2 km</span><span>50 km</span>
            </div>
          </div>
        )}

        {/* ─── Map section ─── */}
        {providersWithCoords.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#212121', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Map size={16} color="#FF5722" /> Nearby on Map
              </h3>
              <button
                onClick={() => setShowMap(v => !v)}
                style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, border: '1.5px solid #FF5722', background: showMap ? '#FF5722' : 'transparent', color: showMap ? '#fff' : '#FF5722', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {showMap ? 'Hide' : 'Show Map'}
              </button>
            </div>
            {showMap && (
              <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                <NearbyProvidersMap
                  providers={providersWithCoords}
                  userLat={userLat} userLng={userLng}
                  center={[userLat ?? 12.9352, userLng ?? 77.6245]}
                  zoom={13} height="260px"
                  onSelect={p => navigate(`/customer/provider/${p.id}`)}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── Provider List ─── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#212121' }}>
              {activeCategory === 'all' ? 'Nearby Providers' : `${CATEGORIES.find(c => c.id === activeCategory)?.label}s`}
              {locStatus === 'success' && <span style={{ fontSize: 11, color: '#9E9E9E', fontWeight: 500, marginLeft: 6 }}>within {radiusKm} km</span>}
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E' }} title="Refresh">
                <RefreshCw size={16} />
              </button>
              <button onClick={() => navigate('/customer/search')} style={{ color: '#FF5722', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
            </div>
          </div>

          {loading ? (
            /* Skeleton */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F0F0F0' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 14 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, width: '55%', borderRadius: 6, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 6 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#fff', borderRadius: 16, border: '1.5px dashed #E0E0E0' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#212121', marginBottom: 6 }}>
                {locStatus === 'idle' || locStatus === 'loading' ? 'Detecting location…' : 'No providers nearby'}
              </div>
              <p style={{ color: '#9E9E9E', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
                {locStatus === 'error'
                  ? `No registered providers found. Try increasing the radius.`
                  : 'Approved providers will appear here once they register.'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={refresh} style={{ padding: '10px 20px', borderRadius: 10, background: '#FF5722', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🔄 Refresh</button>
                <button onClick={() => setRadiusKm(r => Math.min(r + 10, 50))} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,87,34,0.08)', color: '#FF5722', border: '1px solid rgba(255,87,34,0.2)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📍 Expand Radius</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {providers.map(p => {
                const avatar = p.profile_photo || p.avatar_url;
                const price = p.per_visit_charge || p.service_charge;
                const dist = p.distKm != null ? `${p.distKm.toFixed(1)} km` : p.city || '';
                return (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: p.is_available ? '2.5px solid #00C853' : '2px solid #E0E0E0', overflow: 'hidden' }}>
                      {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.full_name?.[0]?.toUpperCase() || '🔧')}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#212121' }}>{p.full_name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: p.is_available ? '#E8F5E9' : '#F5F5F5', color: p.is_available ? '#2E7D32' : '#9E9E9E', flexShrink: 0, marginLeft: 6 }}>
                          {p.is_available ? '● Online' : '● Offline'}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#FF5722', fontWeight: 600, marginBottom: 5, textTransform: 'capitalize' }}>
                        {p.profession || 'Service Provider'} · {p.experience_years || 0}y exp
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        {p.avg_rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700 }}>
                            <Star size={11} fill="#FF9800" color="#FF9800" />
                            <span style={{ color: '#212121' }}>{p.avg_rating}</span>
                            {p.total_reviews > 0 && <span style={{ color: '#9E9E9E', fontWeight: 400 }}>({p.total_reviews})</span>}
                          </div>
                        )}
                        {dist && (
                          <>
                            <span style={{ color: '#BDBDBD', fontSize: 11 }}>·</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#9E9E9E' }}>
                              <MapPin size={10} />{dist}
                            </div>
                          </>
                        )}
                        {price && <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: '#00C853' }}>₹{price}/visit</span>}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => navigate(`/customer/provider/${p.id}`)}
                          style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'rgba(255,87,34,0.08)', color: '#FF5722', border: '1px solid rgba(255,87,34,0.2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => navigate(`/customer/book/${p.id}`)}
                          disabled={!p.is_available}
                          style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: p.is_available ? 'linear-gradient(135deg,#FF5722,#FF8A65)' : '#F5F5F5', color: p.is_available ? '#fff' : '#BDBDBD', border: 'none', fontSize: 12, fontWeight: 700, cursor: p.is_available ? 'pointer' : 'not-allowed', boxShadow: p.is_available ? '0 2px 8px rgba(255,87,34,0.3)' : 'none' }}
                        >
                          {p.is_available ? 'Book Now' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── How it works ─── */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 16, color: '#212121' }}>How it works</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { icon: '📍', title: 'Share your location', desc: 'We find nearby approved providers' },
              { icon: '📋', title: 'Book a provider', desc: 'Pick date, time and describe the issue' },
              { icon: '✅', title: 'Get it done', desc: 'Provider arrives and completes the job' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: i < 2 ? 16 : 0, position: 'relative' }}>
                {i < 2 && <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: '#F0F0F0' }} />}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF3E0', border: '2px solid #FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1 }}>{item.icon}</div>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#212121' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
