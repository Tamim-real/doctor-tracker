import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';

export async function GET() {
  try {
    await connectDB();

    
    const [
      totalDoctors,
      totalPatients,
      specializationStats,
      patientsPerDoctor,
      recentPatients,
    ] = await Promise.all([
     
      Doctor.countDocuments(),

      
      Patient.countDocuments(),

     
      Doctor.aggregate([
        {
          $group: {
            _id: '$specialization',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

    
      Patient.aggregate([
        {
          $group: {
            _id: '$doctor',
            totalPatients: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctorInfo',
          },
        },
        { $unwind: '$doctorInfo' },
        {
          $project: {
            _id: 1,
            totalPatients: 1,
            doctorName: '$doctorInfo.name',
            specialization: '$doctorInfo.specialization',
          },
        },
        { $sort: { totalPatients: -1 } },
        { $limit: 5 }, 
      ]),

      
      Patient.find()
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            totalDoctors,
            totalPatients,
          },
          charts: {
            specializationStats: specializationStats.map((item) => ({
              specialization: item._id,
              count: item.count,
            })),
            topDoctors: patientsPerDoctor,
          },
          recentPatients,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: error.message,
      },
      { status: 500 }
    );
  }
}