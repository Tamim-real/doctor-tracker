'use client';

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
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox } from 'lucide-react';
import { PanelHeader, ReadoutTooltip } from './dashboard-helpers';

function EmptyChartState({ label }) {
  return (
    <div className="h-72 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <Inbox className="h-7 w-7" strokeWidth={1.5} />
      <p className="text-xs">{label}</p>
    </div>
  );
}

export function ChartSkeleton() {
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

export function PatientsPerDoctorChart({ data = [] }) {
  return (
    <Card className="p-6 transition-shadow duration-200 hover:shadow-md">
      <PanelHeader
        title="Patients per Doctor"
        caption="Distribution of patients assigned to each doctor"
        dotColor="bg-teal-600"
        total={data.length}
        totalLabel="doctors"
      />
      <div className="h-72 w-full pt-2">
        {data.length === 0 ? (
          <EmptyChartState label="No doctors have assigned patients yet." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
  );
}

export function RegistrationTrendChart({ data = [], totalNewPatients = 0 }) {
  return (
    <Card className="p-6 transition-shadow duration-200 hover:shadow-md">
      <PanelHeader
        title="Patient Registration Trend"
        caption="Date-based patient additions over time"
        dotColor="bg-amber-600"
        total={totalNewPatients}
        totalLabel="this period"
      />
      <div className="h-72 w-full pt-2">
        {data.length === 0 ? (
          <EmptyChartState label="No registration activity in this range yet." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
  );
}