'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Mail, Lock, Eye, EyeOff, X, Sparkles } from 'lucide-react';


const tokens = {
  paper: '#FAFBFC',
  ink: '#101828',
  slate: '#475467',
  slateLight: '#98A2B3',
  teal: '#0E7C86',
  tealSoft: '#E3F2F1',
  red: '#B42318',
  redSoft: '#FEF3F2',
  line: '#E4E7EC',
};


const fontDisplay = "var(--font-display), 'Space Grotesk', sans-serif";
const fontBody = "var(--font-body), 'Inter', system-ui, sans-serif";
const fontMono = "var(--font-mono), 'IBM Plex Mono', 'SFMono-Regular', monospace";

const inputStyle = {
  width: '100%',
  fontFamily: fontBody,
  fontSize: 14,
  color: tokens.ink,
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: 10,
  padding: '10px 12px 10px 38px',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontFamily: fontBody,
  fontSize: 10.5,
  fontWeight: 700,
  color: tokens.slate,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 6,
};

function ECGDivider() {
  return (
    <svg width="100%" height="14" viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points="0,7 150,7 163,2 174,12 185,7 400,7"
        fill="none"
        stroke={tokens.line}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@doctortracker.com');
    setPassword('admin123456');
  };

  return (
    <div
      className="w-full rounded-2xl p-8"
      style={{ background: '#fff', border: `1px solid ${tokens.line}`, boxShadow: '0 20px 48px rgba(16,24,40,0.08)', fontFamily: fontBody }}
    >
      {/* Header */}
      <div className="text-center mb-7">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: tokens.tealSoft, color: tokens.teal }}
        >
          <HeartPulse size={22} strokeWidth={2} />
        </div>
        <h1 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, color: tokens.ink }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: tokens.slate, marginTop: 4 }}>
          Sign in to the Doctor Tracker admin portal
        </p>
      </div>

      <ECGDivider />

      {/* Error Alert */}
      {error && (
        <div
          className="mt-6 mb-2 p-3.5 rounded-xl flex items-center justify-between"
          style={{ background: tokens.redSoft, color: tokens.red, fontSize: 13, fontWeight: 500 }}
        >
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ color: tokens.red, marginLeft: 8 }} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5 mt-6">
        <div>
          <label style={labelStyle}>Email Address</label>
          <div className="relative">
            <Mail size={15} style={{ position: 'absolute', left: 12, top: 12, color: tokens.slateLight }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="admin@doctortracker.com"
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <div className="relative">
            <Lock size={15} style={{ position: 'absolute', left: 12, top: 12, color: tokens.slateLight }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: 38 }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{ position: 'absolute', right: 12, top: 11, color: tokens.slateLight }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: tokens.teal, color: '#fff', fontSize: 14, fontWeight: 600 }}
        >
          {loading && (
            <span
              className="rounded-full h-3.5 w-3.5 animate-spin"
              style={{ border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff' }}
            />
          )}
          {loading ? 'Logging in…' : 'Sign In'}
        </button>
      </form>

      {/* Demo Helper */}
      <div
        className="mt-6 pt-5 flex items-center justify-between"
        style={{ borderTop: `1px solid ${tokens.line}` }}
      >
        
        <button
          type="button"
          onClick={fillDemoAdmin}
          style={{ fontSize: 12, fontWeight: 600, color: tokens.teal }}
        >
          Fill demo admin
        </button>
      </div>
    </div>
  );
}