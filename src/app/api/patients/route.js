import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Patient from '@/models/Patient';

// GET: Fetch all patients with search, filters & pagination
export async function GET(req) {
  try {
    await verifyAuth();
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const condition = searchParams.get('condition') || '';
    const gender = searchParams.get('gender') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;
    const skip = (page - 1) * limit;

    let query = {};

    // 1. Search by Name or Condition
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { condition: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Filter by specific condition
    if (condition) {
      query.condition = { $regex: condition, $options: 'i' };
    }

    // Filter by Gender
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // 3. Date-wise Filter Fix
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); 
        query.createdAt.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 
        query.createdAt.$lte = end;
      }
    }

    const [patients, totalPatients] = await Promise.all([
      Patient.find(query)
        .populate('doctor', 'name specialization hospital')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPatients / limit);

    return NextResponse.json(
      {
        success: true,
        data: patients,
        pagination: {
          totalPatients,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patients', error: error.message },
      { status: 500 }
    );
  }
}