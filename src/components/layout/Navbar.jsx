'use client';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h2 className="text-slate-700 font-semibold text-lg">Healthcare Management System</h2>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-800 leading-none">Super Admin</p>
            <p className="text-xs text-slate-500 mt-1">admin@doctortracker.com</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition duration-200 border border-red-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}