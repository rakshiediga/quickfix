import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const roles = [
  {
    id: 'customer',
    emoji: '🏠',
    title: 'Customer',
    subtitle: 'I need home services',
    desc: 'Book plumbers, electricians, carpenters & more near you.',
    color: '#FF5722',
    bg: '#FFF3E0',
    features: ['Book in 60 seconds', 'Track in real-time', 'Pay after service'],
  },
  {
    id: 'provider',
    emoji: '👷',
    title: 'Service Provider',
    subtitle: 'I offer services',
    desc: 'Get job requests, earn money on your own schedule.',
    color: '#1A73E8',
    bg: '#E3F2FD',
    features: ['Get nearby job requests', 'Set your availability', 'Daily payouts'],
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    if (!selected) return;
    navigate('/login', { state: { role: selected } });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top orange bar */}
      <div style={{
        height: 5,
        background: 'linear-gradient(90deg, #FF5722, #FF8A65)',
      }} />

      {/* Header */}
      <div style={{ padding: '36px 24px 24px', textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg,#FF5722,#FF7043)',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 16px',
          boxShadow: '0 6px 20px rgba(255,87,34,0.3)',
        }}>⚡</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 900,
          color: '#212121', marginBottom: 8, letterSpacing: '-0.5px',
        }}>Welcome to QuickFix</h1>
        <p style={{ color: '#9E9E9E', fontSize: 14, fontWeight: 500 }}>
          Tell us who you are to get started
        </p>
      </div>

      {/* Role Cards */}
      <div style={{ flex: 1, padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {roles.map((r) => {
          const isSelected = selected === r.id;
          return (
            <button
              key={r.id}
              id={`role-card-${r.id}`}
              onClick={() => setSelected(r.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                borderRadius: 16,
                outline: 'none',
              }}
            >
              <div style={{
                borderRadius: 16,
                border: `2.5px solid ${isSelected ? r.color : '#E0E0E0'}`,
                background: isSelected ? r.bg : '#fff',
                padding: '18px 18px',
                boxShadow: isSelected
                  ? `0 4px 20px ${r.color}25`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Icon */}
                  <div style={{
                    width: 60, height: 60,
                    borderRadius: 14, flexShrink: 0,
                    background: isSelected ? r.color : '#F5F5F5',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 28,
                    transition: 'all 0.2s ease',
                  }}>{r.emoji}</div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      color: isSelected ? r.color : '#9E9E9E',
                      letterSpacing: 1, textTransform: 'uppercase',
                      marginBottom: 2,
                    }}>{r.subtitle}</div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 20, fontWeight: 800,
                      color: '#212121', marginBottom: 6,
                    }}>{r.title}</div>
                    <p style={{
                      fontSize: 13, color: '#757575',
                      lineHeight: 1.5, marginBottom: 12,
                    }}>{r.desc}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {r.features.map(f => (
                        <div key={f} style={{
                          display: 'flex', alignItems: 'center',
                          gap: 7, fontSize: 12,
                          color: isSelected ? '#424242' : '#9E9E9E',
                        }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%',
                            background: isSelected ? r.color : '#E0E0E0',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 8, color: '#fff',
                            fontWeight: 900, flexShrink: 0,
                          }}>✓</div>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radio */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2.5px solid ${isSelected ? r.color : '#BDBDBD'}`,
                    background: isSelected ? r.color : '#fff',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, marginTop: 2,
                    transition: 'all 0.2s ease',
                  }}>
                    {isSelected && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div style={{ padding: '20px 20px 36px' }}>
        <button
          id="role-continue-btn"
          onClick={handleContinue}
          disabled={!selected}
          style={{
            width: '100%',
            padding: '17px 24px',
            background: selected
              ? (selected === 'customer' ? '#FF5722' : '#1A73E8')
              : '#E0E0E0',
            color: selected ? '#fff' : '#9E9E9E',
            border: 'none',
            borderRadius: 12,
            fontSize: 16, fontWeight: 700,
            cursor: selected ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            transition: 'all 0.2s ease',
            boxShadow: selected ? '0 4px 16px rgba(255,87,34,0.3)' : 'none',
          }}
        >
          {selected
            ? `Continue as ${roles.find(r => r.id === selected)?.title}`
            : 'Select your role to continue'
          }
          {selected && <ChevronRight size={18} />}
        </button>
        <p style={{
          textAlign: 'center', marginTop: 14,
          fontSize: 12, color: '#BDBDBD',
        }}>
          You can update your profile anytime
        </p>
      </div>
    </div>
  );
}
