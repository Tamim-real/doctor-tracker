'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Users, Building2, TrendingUp, CalendarCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function DoctorStats({ doctors = [], totalDoctors = 0 }) {
  // ১. বিভাগ অনুযায়ী ডাক্তারের সংখ্যা গণনা (Analytics Data Preparation)
  const specCounts = doctors.reduce((acc, doc) => {
    const spec = doc.specialization || 'General Medicine';
    acc[spec] = (acc[spec] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(specCounts).map((key) => ({
    name: key,
    count: specCounts[key],
  }));

  // ২. ইউনিক হাসপাতালের সংখ্যা
  const uniqueHospitals = new Set(doctors.map((d) => d.hospital)).size;

  const barColors = ['#0E7C86', '#14B8A6', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-4">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Doctors */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Doctors
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Stethoscope className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalDoctors}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Active on network</span>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Hospitals */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hospitals Covered
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueHospitals}</div>
            <p className="text-xs text-muted-foreground mt-1">Partner healthcare centers</p>
          </CardContent>
        </Card>

        {/* Top Department */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Top Specialty
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">
              {chartData[0]?.name || 'N/A'}
            </div>
            <div className="mt-1">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[11px]">
                {chartData[0]?.count || 0} Specialists
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Metric */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg. Availability
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5 Days / wk</div>
            <p className="text-xs text-muted-foreground mt-1">Standard roster allocation</p>
          </CardContent>
        </Card>
      </div>

      {/* Specialty Distribution Mini Chart */}
      {chartData.length > 0 && (
        <Card className="border-border">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Specialty Distribution (Current Page)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #E4E7EC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}