import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';

export async function GET() {
  try {
    await verifyAuth();
    await connectDB();

    // 1. Total counts
    const [totalDoctors, totalPatients] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
    ]);

    // 2. Patients per Doctor (Bar chart data)
    const patientsPerDoctor = await Doctor.aggregate([
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: 'doctor',
          as: 'assignedPatients',
        },
      },
      {
        $project: {
          name: 1,
          specialization: 1,
          patientCount: { $size: '$assignedPatients' },
        },
      },
      { $sort: { patientCount: -1 } },
      { $limit: 10 },
    ]);

    // 3. Date-based Registration Statistics (Line chart data)
    const dateStats = await Patient.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalDoctors,
          totalPatients,
          avgPatientsPerDoctor: totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : 0,
        },
        patientsPerDoctor,
        dateStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics', error: error.message },
      { status: 500 }
    );
  }
} 