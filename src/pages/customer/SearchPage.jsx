import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Star, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { fetchNearbyProviders } from '../../lib/db';
import useAuthStore from '../../store/authStore';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'plumber', label: 'Plumber', emoji: '🔧' },
  { id: 'electrician', label: 'Electrician', emoji: '⚡' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🪚' },
  { id: 'mechanic', label: 'Mechanic', emoji: '🔩' },
  { id: 'painter', label: 'Painter', emoji: '🖌️' },
  { id: 'cleaner', label: 'Cleaner', emoji: '🧹' },
  { id: 'ac_repair', label: 'AC Repair', emoji: '❄️' },
  { id: 'pest', label: 'Pest Control', emoji: '🐛' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuthStore();

  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [radiusKm, setRadiusKm] = useState(20);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => {},
        { timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  // Load providers
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchNearbyProviders({ userLat, userLng, radiusKm: 100 }); // fetch all, filter client-side
      setAllProviders(list);
      setLoading(false);
    };
    load();
  }, [userLat, userLng]);

  // Apply filters + sort client-side
  const filtered = useMemo(() => {
    let list = [...allProviders];

    // Category
    if (category !== 'all') list = list.filter(p => p.profession === category);

    // Available only
    if (onlyAvailable) list = list.filter(p => p.is_available);

    // Text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(p =>
        p.full_name?.toLowerCase().includes(q) ||
        p.profession?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
      );
    }

    // Price
    list = list.filter(p => {
      const price = p.per_visit_charge || p.service_charge || 0;
      return price <= maxPrice;
    });

    // Rating
    if (minRating > 0) list = list.filter(p => (p.avg_rating || 0) >= minRating);

    // Distance radius (if we have location)
    if (userLat != null && userLng != null) {
      list = list.filter(p => p.distKm == null || p.distKm <= radiusKm);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'distance') {
        if (a.distKm == null) return 1;
        if (b.distKm == null) return -1;
        return a.distKm - b.distKm;
      }
      if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === 'price_asc') return (a.per_visit_charge || a.service_charge || 9999) - (b.per_visit_charge || b.service_charge || 9999);
      if (sortBy === 'price_desc') return (b.per_visit_charge || b.service_charge || 0) - (a.per_visit_charge || a.service_charge || 0);
      return 0;
    });

    return list;
  }, [allProviders, category, onlyAvailable, query, maxPrice, minRating, radiusKm, sortBy]);

  const activeFiltersCount = [onlyAvailable, minRating > 0, maxPrice < 2000].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sticky header */}
      <div style={{ padding: '48px 16px 12px', background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <div className="search-bar" style={{ flex: 1, margin: 0 }}>
            <Search className="search-bar__icon" size={18} />
            <input autoFocus placeholder="Search by name or service..." value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button className="input-action" onClick={() => setQuery('')}><X size={16} /></button>}
          </div>
          <button
            className="btn btn--icon btn--secondary"
            onClick={() => setShowFilters(!showFilters)}
            style={{ position: 'relative', background: showFilters ? '#FF5722' : 'var(--bg-tertiary)', color: showFilters ? '#fff' : 'var(--text-primary)' }}
          >
            <SlidersHorizontal size={18} />
            {activeFiltersCount > 0 && (
              <div style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#FF9800', fontSize: 9, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFiltersCount}
              </div>
            )}
          </button>
        </div>

        {/* Category chips */}
        <div className="scroll-x" style={{ paddingBottom: 4, display: 'flex', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`filter-chip ${category === c.id ? 'active' : ''}`}
              style={{ flexShrink: 0 }}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Sort */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>SORT BY</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'distance', label: '📍 Nearest' },
                  { id: 'rating', label: '⭐ Top Rated' },
                  { id: 'price_asc', label: '💰 Low Price' },
                  { id: 'price_desc', label: '💎 High Price' },
                ].map(s => (
                  <button key={s.id} onClick={() => setSortBy(s.id)} className={`filter-chip ${sortBy === s.id ? 'active' : ''}`} style={{ padding: '5px 12px', fontSize: 12 }}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>MAX PRICE</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#FF5722' }}>₹{maxPrice}</span>
              </div>
              <input type="range" min="100" max="2000" step="50" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: '#FF5722' }} />
            </div>

            {/* Rating */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>MIN RATING</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 3, 4, 4.5].map(r => (
                  <button key={r} onClick={() => setMinRating(r)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: minRating === r ? '#FF5722' : 'var(--bg-tertiary)', color: minRating === r ? '#fff' : 'var(--text-secondary)' }}>
                    {r === 0 ? 'Any' : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance radius */}
            {userLat != null && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>RADIUS</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FF5722' }}>{radiusKm} km</span>
                </div>
                <input type="range" min="1" max="50" step="1" value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))} style={{ width: '100%', accentColor: '#FF5722' }} />
              </div>
            )}

            {/* Available toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Available providers only</span>
              <label className="toggle">
                <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Reset */}
            <button onClick={() => { setOnlyAvailable(false); setMaxPrice(2000); setMinRating(0); setRadiusKm(20); setSortBy('distance'); }}
              style={{ padding: '8px 0', borderRadius: 10, background: 'rgba(244,67,54,0.06)', color: '#F44336', border: '1px solid rgba(244,67,54,0.15)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            {loading ? 'Searching…' : `${filtered.length} provider${filtered.length !== 1 ? 's' : ''} found`}
            {userLat != null && !loading && <span> · {radiusKm} km radius</span>}
          </p>
          {!loading && allProviders.length === 0 && (
            <span style={{ fontSize: 11, color: '#FF9800', fontWeight: 600 }}>No providers registered yet</span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 14, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 14 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '35%', borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '75%', borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">{allProviders.length === 0 ? '👤' : '🔍'}</div>
            <p className="empty-state__title">{allProviders.length === 0 ? 'No providers registered yet' : 'No providers found'}</p>
            <p className="empty-state__text">
              {allProviders.length === 0
                ? 'Be the first to join as a service provider!'
                : 'Try different keywords or adjust your filters'}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={() => { setOnlyAvailable(false); setMaxPrice(2000); setMinRating(0); setQuery(''); setCategory('all'); }}
                style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: '#FF5722', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => {
              const avatar = p.profile_photo || p.avatar_url;
              const price = p.per_visit_charge || p.service_charge;
              const dist = p.distKm != null ? `${p.distKm.toFixed(1)} km` : p.city || '';
              return (
                <div key={p.id} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 14, border: '1px solid var(--border-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}
                  onClick={() => navigate(`/customer/provider/${p.id}`)}>
                  {/* Avatar */}
                  <div style={{ width: 60, height: 60, borderRadius: 14, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: p.is_available ? '2.5px solid #00C853' : '2px solid var(--border-light)', overflow: 'hidden' }}>
                    {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.full_name?.[0]?.toUpperCase() || '🔧')}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>{p.full_name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: p.is_available ? '#E8F5E9' : '#F5F5F5', color: p.is_available ? '#2E7D32' : '#9E9E9E', flexShrink: 0, marginLeft: 6 }}>
                        {p.is_available ? '● Online' : '● Offline'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#FF5722', fontWeight: 600, marginBottom: 6, textTransform: 'capitalize' }}>
                      {p.profession || 'Service Provider'} · {p.experience_years || 0}y exp
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                      {p.avg_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700 }}>
                          <Star size={11} fill="#FF9800" color="#FF9800" />
                          <span>{p.avg_rating}</span>
                          {p.total_reviews > 0 && <span style={{ color: '#9E9E9E', fontWeight: 400 }}>({p.total_reviews})</span>}
                        </div>
                      )}
                      {dist && (
                        <>
                          <span style={{ color: '#BDBDBD' }}>·</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#9E9E9E' }}>
                            <MapPin size={10} />{dist}
                          </div>
                        </>
                      )}
                      {price && <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: '#00C853' }}>₹{price}</span>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/customer/book/${p.id}`); }}
                      disabled={!p.is_available}
                      style={{ width: '100%', padding: '9px 0', borderRadius: 8, background: p.is_available ? 'linear-gradient(135deg,#FF5722,#FF8A65)' : '#F5F5F5', color: p.is_available ? '#fff' : '#BDBDBD', border: 'none', fontWeight: 700, fontSize: 13, cursor: p.is_available ? 'pointer' : 'not-allowed' }}
                    >
                      {p.is_available ? '⚡ Book Now' : 'Currently Unavailable'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
