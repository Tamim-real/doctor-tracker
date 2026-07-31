'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const result = await res.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch dashboard statistics');
        }

        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  const { summary, charts, recentPatients } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back! Here is what is happening across your healthcare platform.
        </p>
      </div>

      {/* Top Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Registered Doctors"
          value={summary?.totalDoctors || 0}
          icon="🩺"
          bgAccent="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Total Assigned Patients"
          value={summary?.totalPatients || 0}
          icon="🩺"
          bgAccent="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Analytics & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Specialization Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Doctors by Specialization</h2>
          {charts?.specializationStats?.length === 0 ? (
            <p className="text-slate-400 text-sm">No doctor data available yet.</p>
          ) : (
            <div className="space-y-4">
              {charts?.specializationStats?.map((item, index) => {
                const percentage = Math.round((item.count / summary.totalDoctors) * 100) || 0;
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.specialization}</span>
                      <span className="text-slate-500 font-semibold">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Doctors by Patient Capacity */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Top Doctors (Most Patients)</h2>
          {charts?.topDoctors?.length === 0 ? (
            <p className="text-slate-400 text-sm">No patients assigned to doctors yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {charts?.topDoctors?.map((doc) => (
                <div key={doc._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{doc.doctorName}</p>
                    <p className="text-xs text-slate-500">{doc.specialization}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full">
                    {doc.totalPatients} Patients
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recently Registered Patients</h2>
            <p className="text-xs text-slate-500">Latest patient registrations in the system</p>
          </div>
          <Link
            href="/patients"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Patient Name</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Assigned Doctor</th>
                <th className="px-4 py-3 rounded-r-lg">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPatients?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400">
                    No recent patients found.
                  </td>
                </tr>
              ) : (
                recentPatients?.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{patient.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md text-xs font-medium">
                        {patient.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {patient.doctor?.name ? (
                        <div>
                          <p className="font-medium">{patient.doctor.name}</p>
                          <p className="text-xs text-slate-400">{patient.doctor.specialization}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}