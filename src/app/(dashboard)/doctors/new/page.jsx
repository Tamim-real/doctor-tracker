'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Stethoscope, Building2, Phone, Mail, UserPlus2 } from 'lucide-react';

/* ---------------------------------------------------------
   Same "clinical readout" token system as every other page —
   kept identical for one coherent product.
--------------------------------------------------------- */
const tokens = {
  paper: '#FAFBFC',
  ink: '#101828',
  slate: '#475467',
  slateLight: '#98A2B3',
  teal: '#0E7C86',
  tealSoft: '#E3F2F1',
  amber: '#C76E00',
  amberSoft: '#FBEDDC',
  red: '#B42318',
  redSoft: '#FEF3F2',
  line: '#E4E7EC',
};

// These read the CSS variables set by next/font/google in app/layout.js.
// The literal names after them are just a fallback chain in case that
// font hasn't loaded yet.
const fontDisplay = "var(--font-display), 'Space Grotesk', sans-serif";
const fontBody = "var(--font-body), 'Inter', system-ui, sans-serif";
const fontMono = "var(--font-mono), 'IBM Plex Mono', 'SFMono-Regular', monospace";

const SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
  'Gynecology',
  'Psychiatry',
];

const inputStyle = {
  width: '100%',
  fontFamily: fontBody,
  fontSize: 14,
  color: tokens.ink,
  background: '#fff',
  border: `1px solid ${tokens.line}`,
  borderRadius: 10,
  padding: '10px 12px 10px 38px',
  outline: 'none',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontFamily: fontBody,
  fontSize: 10.5,
  fontWeight: 700,
  color: tokens.slate,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 6,
};

function FieldIcon({ icon: Icon }) {
  return (
    <Icon
      size={15}
      style={{ position: 'absolute', left: 12, top: 12, color: tokens.slateLight, pointerEvents: 'none' }}
    />
  );
}

function FormField({ label, required, icon, children }) {
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: tokens.red }}>*</span>}
      </label>
      <div className="relative">
        {icon && <FieldIcon icon={icon} />}
        {children}
      </div>
    </div>
  );
}

export default function NewDoctorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'General Medicine',
    hospital: '',
    phone: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to create doctor');
      }

      router.push('/doctors');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: tokens.paper, fontFamily: fontBody }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1 mb-2"
              style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 600, color: tokens.teal }}
            >
              <ArrowLeft size={13} /> Back to Doctors Directory
            </Link>
            <h1 style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700, color: tokens.ink }}>
              Add New Doctor
            </h1>
            <p style={{ fontSize: 13, color: tokens.slate, marginTop: 4 }}>
              Register a new doctor into the healthcare system
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: tokens.tealSoft, color: tokens.teal }}
          >
            <UserPlus2 size={20} />
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-6" style={{ background: '#fff', border: `1px solid ${tokens.line}` }}>
          {error && (
            <div
              className="mb-6 p-3.5 rounded-xl"
              style={{ background: tokens.redSoft, color: tokens.red, fontSize: 13, fontWeight: 500 }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Doctor Name" required icon={Stethoscope}>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. John Doe"
                style={inputStyle}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>
                  Specialization <span style={{ color: tokens.red }}>*</span>
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingLeft: 12 }}
                >
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <FormField label="Hospital / Clinic" required icon={Building2}>
                <input
                  type="text"
                  name="hospital"
                  required
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="e.g. City General Hospital"
                  style={inputStyle}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Phone Number" required icon={Phone}>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 234 567 890"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Email Address" required icon={Mail}>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. doctor@hospital.com"
                  style={inputStyle}
                />
              </FormField>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3" style={{ borderTop: `1px solid ${tokens.line}` }}>
              <Link
                href="/doctors"
                className="px-5 py-2.5 rounded-xl transition mt-4"
                style={{ border: `1px solid ${tokens.line}`, color: tokens.slate, fontSize: 13.5, fontWeight: 600 }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl transition disabled:opacity-50 mt-4"
                style={{ background: tokens.teal, color: '#fff', fontSize: 13.5, fontWeight: 600 }}
              >
                {loading ? 'Saving Doctor…' : 'Save Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}