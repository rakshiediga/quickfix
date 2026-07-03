import React, { useEffect } from 'react';
import { Star } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useDataStore from '../../store/dataStore';

export default function ProviderReviews() {
  const { profile } = useAuthStore();
  const { reviews, isLoading, fetchReviews } = useDataStore();

  useEffect(() => {
    if (profile?.id) {
      fetchReviews(profile.id);
    }
  }, [profile?.id]);

  // Calculate stats from real reviews
  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const dist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rv => rv.rating === r).length,
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        padding: '48px 16px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>My Reviews</h1>
        {reviews.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
            {reviews.length} customer review{reviews.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div style={{ padding: 16 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => (
              <div key={i} className="card" style={{ borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6, marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 10, width: '25%', borderRadius: 6 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: 12, width: '90%', borderRadius: 6, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          // Empty state
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--bg-card)', borderRadius: 20,
            border: '1.5px dashed var(--border-color)',
          }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>⭐</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>
              No reviews yet
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
              Complete bookings and customers<br />will leave you reviews here.
            </p>
          </div>
        ) : (
          <>
            {/* Rating summary card */}
            <div className="card" style={{ marginBottom: 20, borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 48, fontWeight: 950,
                    background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {avg}
                  </div>
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginBottom: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i} size={14}
                        fill={i < Math.round(avg) ? '#F59E0B' : 'transparent'}
                        color={i < Math.round(avg) ? '#F59E0B' : 'var(--text-muted)'}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{reviews.length} ratings</div>
                </div>

                <div style={{ flex: 1 }}>
                  {dist.map(d => (
                    <div key={d.rating} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 10, fontWeight: 700 }}>{d.rating}</span>
                      <Star size={10} fill="#F59E0B" color="#F59E0B" />
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${reviews.length > 0 ? (d.count / reviews.length) * 100 : 0}%`,
                          background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
                          borderRadius: 3, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 16 }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r, i) => {
                const name = r.customer?.full_name || r.customer_name || 'Customer';
                const service = r.service_name || '';
                const date = r.created_at
                  ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : r.date || '';
                const avatar = r.customer?.avatar_url;

                return (
                  <div key={r.id || i} className="card" style={{ borderRadius: 16, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div className="avatar avatar--sm" style={{ background: 'var(--bg-tertiary)', fontSize: 18, overflow: 'hidden' }}>
                          {avatar
                            ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : name[0]?.toUpperCase() || '👤'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
                          {service && <div style={{ fontSize: 11, color: '#1A73E8', fontWeight: 600 }}>{service}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={11} fill={j < r.rating ? '#F59E0B' : 'transparent'} color={j < r.rating ? '#F59E0B' : 'var(--text-muted)'} />
                          ))}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{date}</span>
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{r.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
