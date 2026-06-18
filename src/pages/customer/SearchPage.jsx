import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Star, SlidersHorizontal, X } from 'lucide-react';

const ALL_PROVIDERS = [
  { id: '1', full_name: 'Rajesh Kumar', profession: 'plumber', avg_rating: 4.8, total_reviews: 124, distance: 1.2, price: 299, avatar: '👨‍🔧', is_available: true, experience_years: 5 },
  { id: '2', full_name: 'Suresh Sharma', profession: 'electrician', avg_rating: 4.9, total_reviews: 87, distance: 0.8, price: 349, avatar: '👷', is_available: true, experience_years: 8 },
  { id: '3', full_name: 'Amit Patel', profession: 'carpenter', avg_rating: 4.7, total_reviews: 63, distance: 2.1, price: 399, avatar: '🧑‍🏭', is_available: true, experience_years: 6 },
  { id: '4', full_name: 'Vijay Yadav', profession: 'mechanic', avg_rating: 4.6, total_reviews: 45, distance: 3.0, price: 249, avatar: '👨‍🔧', is_available: false, experience_years: 4 },
  { id: '5', full_name: 'Priya Singh', profession: 'painter', avg_rating: 4.9, total_reviews: 32, distance: 1.8, price: 350, avatar: '👩‍🎨', is_available: true, experience_years: 3 },
  { id: '6', full_name: 'Kiran Rao', profession: 'electrician', avg_rating: 4.5, total_reviews: 71, distance: 4.2, price: 299, avatar: '👷', is_available: true, experience_years: 7 },
  { id: '7', full_name: 'Mohan Das', profession: 'plumber', avg_rating: 4.3, total_reviews: 98, distance: 2.5, price: 249, avatar: '👨‍🔧', is_available: true, experience_years: 10 },
  { id: '8', full_name: 'Deepa Nair', profession: 'cleaner', avg_rating: 4.8, total_reviews: 156, distance: 0.5, price: 199, avatar: '👩', is_available: true, experience_years: 2 },
];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'plumber', label: 'Plumber', emoji: '🔧' },
  { id: 'electrician', label: 'Electrician', emoji: '⚡' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🪚' },
  { id: 'mechanic', label: 'Mechanic', emoji: '🔩' },
  { id: 'painter', label: 'Painter', emoji: '🖌️' },
  { id: 'cleaner', label: 'Cleaner', emoji: '🧹' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = ALL_PROVIDERS
    .filter(p => category === 'all' || p.profession === category)
    .filter(p => !onlyAvailable || p.is_available)
    .filter(p => !query || p.full_name.toLowerCase().includes(query.toLowerCase()) || p.profession.includes(query.toLowerCase()))
    .sort((a, b) => sortBy === 'rating' ? b.avg_rating - a.avg_rating : sortBy === 'distance' ? a.distance - b.distance : a.price - b.price);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ padding: '48px 16px 16px', background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <div className="search-bar" style={{ flex: 1, margin: 0 }}>
            <Search className="search-bar__icon" size={18} />
            <input autoFocus placeholder="Search services..." value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button className="input-action" onClick={() => setQuery('')}><X size={16} /></button>}
          </div>
          <button className="btn btn--icon btn--secondary" onClick={() => setShowFilters(!showFilters)} style={{ position: 'relative' }}>
            <SlidersHorizontal size={18} />
            {onlyAvailable && <div className="notif-dot" />}
          </button>
        </div>

        {/* Category chips */}
        <div className="scroll-x" style={{ paddingBottom: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`filter-chip ${category === c.id ? 'active' : ''}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Sort + filter bar */}
        {showFilters && (
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Sort:</span>
            {[{ id: 'rating', label: '⭐ Rating' }, { id: 'distance', label: '📍 Distance' }, { id: 'price', label: '💰 Price' }].map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)} className={`filter-chip ${sortBy === s.id ? 'active' : ''}`} style={{ padding: '4px 10px' }}>{s.label}</button>
            ))}
            <label className="toggle-wrapper" style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Available only</span>
              <label className="toggle"><input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} /><span className="toggle-slider" /></label>
            </label>
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{filtered.length} providers found</p>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p className="empty-state__title">No providers found</p>
            <p className="empty-state__text">Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => (
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
                    <span className="provider-card__distance">{p.distance} km</span>
                    <span className="provider-card__price">₹{p.price}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <span className={`badge ${p.is_available ? 'badge--online' : 'badge--offline'}`}>{p.is_available ? 'Online' : 'Busy'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
