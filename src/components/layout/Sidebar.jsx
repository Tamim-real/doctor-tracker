'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LayoutDashboard, Stethoscope, UserRound, Menu, X, HeartPulse, LogOut } from 'lucide-react';

/* ---------------------------------------------------------
   Same "clinical readout" token system
--------------------------------------------------------- */
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

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  { label: 'Patients', href: '/patients', icon: UserRound },
];

export default function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error();
      router.push('/login');
      router.refresh();
    } catch (err) {
      toast.error('Could not sign out. Please try again.');
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div
        className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
        style={{ background: '#fff', borderBottom: `1px solid ${tokens.line}`, fontFamily: fontBody }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: tokens.tealSoft, color: tokens.teal }}
          >
            <HeartPulse size={16} />
          </div>
          <span style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 16, color: tokens.ink }}>
            HealthCare
          </span>
        </div>

        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="p-2 rounded-lg"
          style={{ color: tokens.slate }}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 lg:hidden transition-opacity"
          style={{ background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: '#fff', borderRight: `1px solid ${tokens.line}`, fontFamily: fontBody }}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div
            className="h-16 flex items-center justify-between px-6"
            style={{ borderBottom: `1px solid ${tokens.line}` }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: tokens.tealSoft, color: tokens.teal }}
              >
                <HeartPulse size={16} />
              </div>
              <span style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 16, color: tokens.ink }}>
                HealthCare
              </span>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden"
              style={{ color: tokens.slateLight }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors relative"
                  style={{
                    background: isActive ? tokens.tealSoft : 'transparent',
                    color: isActive ? tokens.teal : tokens.slate,
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r"
                      style={{ width: 3, height: 18, background: tokens.teal }}
                    />
                  )}
                  <Icon size={17} strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile / LogOut Section (Only visible on Mobile/Tablet drawer) */}
        <div className="p-4 block lg:hidden" style={{ borderTop: `1px solid ${tokens.line}` }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: tokens.tealSoft, color: tokens.teal, fontFamily: fontMono, fontSize: 11, fontWeight: 700 }}
            >
              {(user?.name || 'Dr. Admin')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }} className="truncate">
                {user?.name || 'Dr. Admin'}
              </p>
              <p style={{ fontFamily: fontMono, fontSize: 11, color: tokens.slateLight }} className="truncate">
                {user?.email || 'admin@hospital.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Sign out"
              title="Sign out"
              className="p-2 rounded-lg flex-shrink-0 transition disabled:opacity-50"
              style={{ color: tokens.slateLight }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tokens.redSoft;
                e.currentTarget.style.color = tokens.red;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = tokens.slateLight;
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}