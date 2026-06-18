import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Phone, MoreVertical, Image, Mic } from 'lucide-react';

const MOCK_MESSAGES = [
  { id: 1, from: 'provider', text: 'Hello! I am on my way. Will reach in about 15 minutes.', time: '2:05 PM' },
  { id: 2, from: 'customer', text: 'Ok! Please call when you arrive. The gate is on the left side.', time: '2:07 PM' },
  { id: 3, from: 'provider', text: 'Sure, I will call you. Do you have the tools or should I bring everything?', time: '2:08 PM' },
  { id: 4, from: 'customer', text: 'Please bring all the tools needed.', time: '2:09 PM' },
  { id: 5, from: 'provider', text: 'No problem! See you soon 👍', time: '2:10 PM' },
];

export default function ChatPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'customer', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    // Auto reply simulation
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'provider', text: 'Got it! I\'ll be there shortly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="header" style={{ position: 'sticky', top: 0 }}>
        <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="avatar avatar--sm" style={{ background: 'var(--bg-tertiary)', fontSize: 18 }}>👷</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-display)' }}>Suresh Sharma</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-accent)' }} />
              <span style={{ fontSize: 11, color: 'var(--brand-accent)', fontWeight: 500 }}>Online</span>
            </div>
          </div>
        </div>
        <button className="btn btn--icon btn--secondary" style={{ width: 36, height: 36, padding: 0 }}>
          <Phone size={16} />
        </button>
        <button className="btn btn--icon btn--secondary" style={{ width: 36, height: 36, padding: 0 }}>
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Booking context bar */}
      <div style={{ background: 'rgba(124,58,237,0.08)', border: '0', borderBottom: '1px solid var(--border-color)', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Booking: <b style={{ color: 'var(--brand-primary-light)' }}>#{bookingId}</b></span>
        <button onClick={() => navigate(`/customer/tracking/${bookingId}`)} style={{ fontSize: 12, color: 'var(--brand-primary-light)', fontWeight: 600 }}>Track →</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Date divider */}
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <span style={{ background: 'var(--bg-tertiary)', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Today</span>
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`message-row ${msg.from === 'customer' ? 'message-row--sent' : ''}`}>
            {msg.from === 'provider' && (
              <div className="avatar avatar--sm" style={{ background: 'var(--bg-tertiary)', fontSize: 14, flexShrink: 0 }}>👷</div>
            )}
            <div>
              <div className={`message-bubble ${msg.from === 'customer' ? 'message-bubble--sent' : 'message-bubble--received'}`}>
                {msg.text}
              </div>
              <div className="message-time">{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-end', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <button className="btn btn--icon btn--secondary" style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}>
          <Image size={18} />
        </button>
        <div style={{ flex: 1, background: 'var(--bg-input)', border: '1.5px solid var(--border-light)', borderRadius: 20, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button><Mic size={16} color="var(--text-muted)" /></button>
        </div>
        <button
          onClick={sendMessage}
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-brand)' }}
        >
          <Send size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}
