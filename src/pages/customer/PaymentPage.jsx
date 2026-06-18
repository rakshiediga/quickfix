import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Paytm, Amazon Pay' },
];

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', icon: '🟢' },
  { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
  { id: 'paytm', label: 'Paytm', icon: '🔵' },
  { id: 'bhim', label: 'BHIM', icon: '🟠' },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const amount = 437;

  const handlePay = async () => {
    if (method === 'upi' && !upiId && !upiApp) { toast.error('Select a UPI app or enter UPI ID'); return; }
    setLoading(true);
    // Razorpay integration
    // In production: call Edge Function to create Razorpay order, then open Razorpay.open()
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'QuickFix',
      description: `Booking #${bookingId}`,
      prefill: { contact: '9876543210', email: 'customer@quickfix.app' },
      theme: { color: '#7C3AED' },
      handler: () => { setSuccess(true); setLoading(false); },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Demo mode
      setTimeout(() => { setSuccess(true); setLoading(false); }, 2000);
    }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '2px solid var(--brand-accent)' }}>
        <CheckCircle size={48} color="var(--brand-accent)" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Payment Successful!</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 6 }}>₹{amount} paid successfully</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Booking #{bookingId} • Ref: TXN{Date.now().toString().slice(-8)}</p>
      <div className="card" style={{ width: '100%', marginBottom: 24, textAlign: 'left' }}>
        {[['Service', 'Electrical Repair'], ['Provider', 'Suresh Sharma'], ['Amount', `₹${amount}`], ['Method', 'UPI'], ['Status', '✅ Paid']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{k}</span>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{v}</span>
          </div>
        ))}
      </div>
      <button className="btn btn--primary btn--full" onClick={() => navigate('/customer/bookings')}>View My Bookings</button>
      <button className="btn btn--ghost btn--full" style={{ marginTop: 12 }} onClick={() => navigate('/customer/home')}>Go to Home</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="header">
        <button className="header__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1 className="header__title">Payment</h1>
      </div>

      <div style={{ padding: 16, paddingBottom: 100 }}>
        {/* Amount card */}
        <div style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius-xl)', padding: '24px 20px', marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Amount to Pay</p>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: '#fff', marginBottom: 4 }}>₹{amount}</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Booking #{bookingId} • Electrician Service</p>
        </div>

        {/* Payment Methods */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>Payment Method</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {METHODS.map(m => (
            <div key={m.id} onClick={() => setMethod(m.id)} style={{
              padding: '14px 16px', borderRadius: 'var(--radius-md)',
              background: method === m.id ? 'rgba(124,58,237,0.08)' : 'var(--bg-card)',
              border: `1.5px solid ${method === m.id ? 'var(--brand-primary)' : 'var(--border-light)'}`,
              display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${method === m.id ? 'var(--brand-primary)' : 'var(--border-light)'}`, background: method === m.id ? 'var(--brand-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {method === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </div>
          ))}
        </div>

        {/* UPI sub-options */}
        {method === 'upi' && (
          <div className="animate-fadeIn card" style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Quick Pay with UPI Apps</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
              {UPI_APPS.map(app => (
                <button key={app.id} onClick={() => { setUpiApp(app.id); setUpiId(''); }} style={{
                  padding: '10px 6px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                  background: upiApp === app.id ? 'rgba(124,58,237,0.1)' : 'var(--bg-tertiary)',
                  border: `1.5px solid ${upiApp === app.id ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 22 }}>{app.icon}</div>
                  <div style={{ fontSize: 10, marginTop: 4, color: upiApp === app.id ? 'var(--brand-primary-light)' : 'var(--text-muted)', fontWeight: 500 }}>{app.label}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or enter UPI ID</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            </div>
            <input className="form-input" placeholder="yourname@upi" value={upiId} onChange={e => { setUpiId(e.target.value); setUpiApp(''); }} />
          </div>
        )}

        {/* Security note */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <Shield size={16} color="var(--brand-accent)" />
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>100% Secure payment • Powered by Razorpay</p>
        </div>
      </div>

      {/* Pay CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: 16, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
        <button className="btn btn--primary btn--full btn--lg" onClick={handlePay} disabled={loading}>
          {loading ? <><div className="spinner spinner--sm" style={{ borderTopColor: '#fff' }} /> Processing...</> : `Pay ₹${amount} →`}
        </button>
      </div>
    </div>
  );
}
