'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Stethoscope, Users, Activity, HeartPulse, LogOut } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { VitalCard, VitalCardSkeleton } from '@/components/dashboard/vital-card';
import { PatientsPerDoctorChart, RegistrationTrendChart, ChartSkeleton } from '@/components/dashboard/analytics-charts';
import { ECGDivider } from '@/components/dashboard/dashboard-helpers';

const getInitials = (name = 'Admin') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function DashboardPage({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const result = await res.json();

        if (!cancelled) {
          if (res.ok && result.success) {
            setData(result.data);
          } else {
            toast.error(result.message || 'Could not load analytics.');
          }
        }
      } catch {
        if (!cancelled) toast.error('Network error. Failed to load analytics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error();
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Could not sign out. Please try again.');
      setLoggingOut(false);
    }
  };

  const { summary, patientsPerDoctor = [], dateStats = [] } = data || {};

  const avgDisplay = useMemo(() => {
    const avg = summary?.avgPatientsPerDoctor;
    return typeof avg === 'number' ? avg : Number(avg) || 0;
  }, [summary]);

  const totalNewPatients = useMemo(
    () => dateStats.reduce((sum, d) => sum + (d.count || 0), 0),
    [dateStats]
  );

  const vitalsConfig = [
    { label: 'Total Doctors', value: summary?.totalDoctors ?? 0, icon: Stethoscope, accentColor: 'text-teal-700', bgColor: 'bg-teal-50' },
    { label: 'Total Patients', value: summary?.totalPatients ?? 0, icon: Users, accentColor: 'text-amber-700', bgColor: 'bg-amber-50' },
    { label: 'Avg. Patients / Doctor', value: avgDisplay, decimals: 1, icon: Activity, accentColor: 'text-slate-800', bgColor: 'bg-slate-100' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-8 p-8 min-h-screen bg-background text-foreground">
        
        {/* Header */}
        <header className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <Badge variant="secondary" className="bg-teal-50 text-teal-700 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                <HeartPulse className="h-3 w-3 text-teal-600 animate-pulse" />
                <span className="font-mono text-[10px] font-semibold tracking-wider">LIVE</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              System metrics and patient analytics overview
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 p-2 pr-3 rounded-2xl bg-card border shadow-sm">
            <Avatar className="h-9 w-9 bg-teal-100 text-teal-800 font-mono text-xs font-bold">
              <AvatarFallback className="bg-teal-100 text-teal-800">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="font-mono text-[11px] text-muted-foreground truncate">
                {user?.email || 'admin@doctortracker.com'}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Sign out</p></TooltipContent>
            </Tooltip>
          </div>
        </header>

        <ECGDivider />

        {/* Vitals Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <VitalCardSkeleton key={i} />)
            : vitalsConfig.map((vital) => <VitalCard key={vital.label} {...vital} />)}
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <PatientsPerDoctorChart data={patientsPerDoctor} />
              <RegistrationTrendChart data={dateStats} totalNewPatients={totalNewPatients} />
            </>
          )}
        </section>

      </div>
    </TooltipProvider>
  );
}