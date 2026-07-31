import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Doctor from '@/models/Doctor';

// GET: Fetch Doctors with Search, Filter & Pagination
export async function GET(req) {
  try {
    await verifyAuth();
    await connectDB();

    const { searchParams } = new URL(req.url);

    // Query parameters
    const search = searchParams.get('search') || '';
    const specialization = searchParams.get('specialization') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;
    const skip = (page - 1) * limit;

    // Filter Query Object
    let query = {};

    // 1. Search by Name, Specialization or Hospital
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Filter by Specialization
    if (specialization && specialization !== 'All') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // 3. Date-wise Filter 
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

  
    const [doctors, totalDoctors] = await Promise.all([
      Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDoctors / limit);

    return NextResponse.json(
      {
        success: true,
        data: doctors,
        pagination: {
          totalDoctors,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctors', error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new Doctor
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, specialization, hospital, phone, email } = body;

    // Basic Validation
    if (!name || !specialization || !hospital || !phone || !email) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check Duplicate Email
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor with this email already exists' },
        { status: 400 }
      );
    }

    const newDoctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Doctor created successfully',
        data: newDoctor,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create doctor', error: error.message },
      { status: 500 }
    );
  }
}