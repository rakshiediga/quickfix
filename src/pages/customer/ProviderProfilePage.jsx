import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Shield, Phone, MessageCircle, ChevronRight, Award } from 'lucide-react';

const MOCK = {
  '1': { id: '1', full_name: 'Rajesh Kumar', profession: 'plumber', avg_rating: 4.8, total_reviews: 124, distance: '1.2 km', price: 299, avatar: '👨‍🔧', is_available: true, experience_years: 5, bio: 'Expert plumber with 5+ years of experience. Specialized in pipe repairs, bathroom fittings, and drainage issues. Available 24/7 for emergencies.', service_area: 'Koramangala, HSR Layout, Indiranagar', completed_jobs: 340 },
  '2': { id: '2', full_name: 'Suresh Sharma', profession: 'electrician', avg_rating: 4.9, total_reviews: 87, distance: '0.8 km', price: 349, avatar: '👷', is_available: true, experience_years: 8, bio: 'Certified electrician with 8 years of experience. Expert in wiring, panel upgrades, and appliance repairs. Safety-first approach.', service_area: 'Koramangala, BTM Layout, Jayanagar', completed_jobs: 280 },
  '3': { id: '3', full_name: 'Amit Patel', profession: 'carpenter', avg_rating: 4.7, total_reviews: 63, distance: '2.1 km', price: 399, avatar: '🧑‍🏭', is_available: true, experience_years: 6, bio: 'Skilled carpenter specializing in custom furniture, door repairs, and wood work. Quality craftsmanship guaranteed.', service_area: 'HSR Layout, Bellandur, Sarjapur', completed_jobs: 195 },
  '4': { id: '4', full_name: 'Vijay Yadav', profession: 'mechanic', avg_rating: 4.6, total_reviews: 45, distance: '3.0 km', price: 249, avatar: '👨‍🔧', is_available: false, experience_years: 4, bio: 'Experienced auto mechanic handling two-wheelers and four-wheelers. Honest service, fair pricing.', service_area: 'Electronic City, Bommanahalli', completed_jobs: 120 },
};

const REVIEWS = [
  { name: 'Priya M.', rating: 5, comment: 'Excellent work! Very professional and punctual.', date: '2 days ago' },
  { name: 'Arjun K.', rating: 5, comment: 'Fixed the issue quickly. Highly recommended!', date: '1 week ago' },
  { name: 'Sana R.', rating: 4, comment: 'Good service. A bit late but work quality is great.', date: '2 weeks ago' },
];

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = MOCK[id] || MOCK['1'];
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div style={{ background: 'var(--gradient-dark)', padding: '48px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(124,58,237,0.1)' }} />
        <button className="header__back" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}><ArrowLeft size={18} /></button>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div className="avatar avatar--xl" style={{ background: 'var(--bg-tertiary)', fontSize: 38, border: provider.is_available ? '3px solid var(--brand-accent)' : '3px solid var(--border-light)' }}>
            {provider.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{provider.full_name}</h1>
              <span className={`badge ${provider.is_available ? 'badge--online' : 'badge--offline'}`}>{provider.is_available ? '● Online' : '● Offline'}</span>
            </div>
            <p style={{ color: 'var(--brand-primary-light)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
              {provider.profession.charAt(0).toUpperCase() + provider.profession.slice(1)} • {provider.experience_years} yrs exp
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{provider.avg_rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>({provider.total_reviews} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                <MapPin size={13} />
                <span>{provider.distance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20 }}>
          {[
            { label: 'Jobs Done', value: provider.completed_jobs, icon: '✅' },
            { label: 'Rating', value: `${provider.avg_rating}⭐`, icon: '' },
            { label: 'Experience', value: `${provider.experience_years}y`, icon: '🏆' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', padding: '12px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px' }}>
        <div className="tab-bar" style={{ margin: '16px 0' }}>
          {['about', 'reviews', 'services'].map(t => (
            <div key={t} className={`tab-item ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="animate-fadeIn">
            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 8 }}>About</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{provider.bio}</p>
            </div>
            <div className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Details</h4>
              {[
                { icon: <MapPin size={16} />, label: 'Service Area', value: provider.service_area },
                { icon: <Clock size={16} />, label: 'Response Time', value: 'Within 30 minutes' },
                { icon: <Shield size={16} />, label: 'Background Check', value: 'Verified ✅' },
                { icon: <Award size={16} />, label: 'Certifications', value: 'Licensed Professional' },
              ].map(d => (
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

        {activeTab === 'reviews' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={j < r.rating ? '#F59E0B' : 'transparent'} color={j < r.rating ? '#F59E0B' : 'var(--text-muted)'} />)}
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>{r.comment}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{r.date}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Basic Repair', price: provider.price, time: '1-2 hrs' },
              { name: 'Deep Service', price: provider.price * 2, time: '3-4 hrs' },
              { name: 'Emergency Call', price: provider.price + 100, time: 'Immediate' },
            ].map(s => (
              <div key={s.name} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Est. {s.time}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--brand-accent)' }}>₹{s.price}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 12 }}>
        <button className="btn btn--secondary btn--icon" onClick={() => navigate(`/customer/chat/book-${provider.id}`)} title="Message">
          <MessageCircle size={20} />
        </button>
        <button className="btn btn--secondary btn--icon" title="Call" onClick={() => alert('Call feature requires phone permission')}>
          <Phone size={20} />
        </button>
        <button
          className="btn btn--primary"
          style={{ flex: 1 }}
          disabled={!provider.is_available}
          onClick={() => navigate(`/customer/book/${provider.id}`)}
        >
          {provider.is_available ? `Book Now • ₹${provider.price}` : 'Currently Unavailable'}
        </button>
      </div>
      <div style={{ height: 88 }} />
    </div>
  );
}
