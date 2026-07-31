import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';

// GET: Fetch all patients under a specific doctor
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id: doctorId } = await params;

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    const patients = await Patient.find({ doctor: doctorId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        count: patients.length,
        data: patients,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctor patients', error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new patient under a specific doctor
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id: doctorId } = await params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, age, gender, phone, condition } = body;

    if (!name || !age || !gender || !phone || !condition) {
      return NextResponse.json(
        { success: false, message: 'All patient fields are required' },
        { status: 400 }
      );
    }

    const newPatient = await Patient.create({
      name,
      age,
      gender,
      phone,
      condition,
      doctor: doctorId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Patient added under doctor successfully',
        data: newPatient,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to add patient', error: error.message },
      { status: 500 }
    );
  }
}