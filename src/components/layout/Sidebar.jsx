'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Doctors', href: '/doctors', icon: '🩺' },
  { name: 'Patients', href: '/patients', icon: '🩺' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col border-r border-slate-800">
      {/* App Branding */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">
          D
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-white">DoctorTracker</h1>
          <p className="text-xs text-slate-400">Admin Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Doctor Tracker v1.0 &copy; 2026
      </div>
    </aside>
  );
}