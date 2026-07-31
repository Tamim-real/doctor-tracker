'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Stethoscope, Users, Activity, HeartPulse, LogOut, Inbox } from 'lucide-react';

// Shadcn UI Components
import { Card, CardContent} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


function CountUp({ value, decimals = 0, duration = 700 }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef();

  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return <>{display.toFixed(decimals)}</>;
}

function ReadoutTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-mono text-base font-semibold">
        {payload[0].value} <span className="text-slate-400 text-xs">{unit}</span>
      </p>
    </div>
  );
}

function VitalCard({ label, value, decimals, icon: Icon, accentColor, bgColor, suffix }) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 font-mono text-3xl font-semibold text-foreground">
            <CountUp value={value} decimals={decimals} />
            {suffix && <span className="font-sans text-sm text-muted-foreground ml-1">{suffix}</span>}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${accentColor}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}

function VitalCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </Card>
  );
}

function ECGDivider() {
  return (
    <div className="w-full flex items-center gap-3" aria-hidden="true">
      <svg width="100%" height="16" viewBox="0 0 400 16" preserveAspectRatio="none" className="flex-1">
        <polyline
          points="0,8 140,8 155,2 165,14 178,8 400,8"
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function PanelHeader({ title, caption, dotColor, total, totalLabel }) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{caption}</p>
      </div>
      {typeof total === 'number' && (
        <Badge variant="outline" className="font-mono text-xs">
          {total} {totalLabel}
        </Badge>
      )}
    </div>
  );
}

function EmptyChartState({ label }) {
  return (
    <div className="h-72 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <Inbox className="h-7 w-7" strokeWidth={1.5} />
      <p className="text-xs">{label}</p>
    </div>
  );
}

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
      } catch (err) {
        if (!cancelled) {
          toast.error('Network error. Failed to load analytics.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const { summary, patientsPerDoctor = [], dateStats = [] } = data || {};
  const avg = summary?.avgPatientsPerDoctor;
  const avgDisplay = typeof avg === 'number' ? avg : Number(avg) || 0;
  const totalNewPatients = dateStats.reduce((sum, d) => sum + (d.count || 0), 0);

  const getInitials = (name) => {
    return (name || 'Dr Admin')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="space-y-8 p-8 min-h-screen bg-background text-foreground">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                <HeartPulse className="h-3 w-3 text-teal-600 animate-pulse" />
                <span className="font-mono text-[10px] font-semibold tracking-wider">LIVE</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              System metrics and patient analytics overview
            </p>
          </div>

          {/* Admin Profile & Logout */}
          <div className="hidden sm:flex items-center gap-3 p-2 pr-3 rounded-2xl bg-card border shadow-sm">
            <Avatar className="h-9 w-9 bg-teal-100 text-teal-800 font-mono text-xs font-bold">
              <AvatarFallback className="bg-teal-100 text-teal-800">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold truncate">{user?.name || 'Dr. Admin'}</p>
              <p className="font-mono text-[11px] text-muted-foreground truncate">
                {user?.email || 'admin@hospital.com'}
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
              <TooltipContent>
                <p>Sign out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <ECGDivider />

        {/* Vitals Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {loading ? (
            <>
              <VitalCardSkeleton />
              <VitalCardSkeleton />
              <VitalCardSkeleton />
            </>
          ) : (
            <>
              <VitalCard
                label="Total Doctors"
                value={summary?.totalDoctors ?? 0}
                icon={Stethoscope}
                accentColor="text-teal-700"
                bgColor="bg-teal-50"
              />
              <VitalCard
                label="Total Patients"
                value={summary?.totalPatients ?? 0}
                icon={Users}
                accentColor="text-amber-700"
                bgColor="bg-amber-50"
              />
              <VitalCard
                label="Avg. Patients / Doctor"
                value={avgDisplay}
                decimals={1}
                icon={Activity}
                accentColor="text-slate-800"
                bgColor="bg-slate-100"
              />
            </>
          )}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <Card className="p-6 transition-shadow duration-200 hover:shadow-md">
                <PanelHeader
                  title="Patients per Doctor"
                  caption="Distribution of patients assigned to each doctor"
                  dotColor="bg-teal-600"
                  total={patientsPerDoctor.length}
                  totalLabel="doctors"
                />
                <div className="h-72 w-full pt-2">
                  {patientsPerDoctor.length === 0 ? (
                    <EmptyChartState label="No doctors have assigned patients yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patientsPerDoctor} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<ReadoutTooltip unit="patients" />} cursor={{ fill: '#E3F2F1' }} />
                        <Bar dataKey="patientCount" name="Patients" fill="#0E7C86" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              <Card className="p-6 transition-shadow duration-200 hover:shadow-md">
                <PanelHeader
                  title="Patient Registration Trend"
                  caption="Date-based patient additions over time"
                  dotColor="bg-amber-600"
                  total={totalNewPatients}
                  totalLabel="this period"
                />
                <div className="h-72 w-full pt-2">
                  {dateStats.length === 0 ? (
                    <EmptyChartState label="No registration activity in this range yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dateStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                        <XAxis dataKey="_id" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<ReadoutTooltip unit="new" />} cursor={{ stroke: '#C76E00', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="New Patients"
                          stroke="#C76E00"
                          strokeWidth={2.5}
                          dot={{ fill: '#C76E00', r: 3.5, strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}