import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Doctor from '@/models/Doctor';

// GET: Single Doctor by ID
export async function GET(req, { params }) {
  try {
    await verifyAuth();
    await connectDB();
    const { id } = await params;

    const doctor = await Doctor.findById(id).lean();

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: doctor }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctor', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update Doctor Details
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Doctor updated successfully', data: updatedDoctor },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update doctor', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete Doctor
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedDoctor = await Doctor.findByIdAndDelete(id);

    if (!deletedDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Doctor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete doctor', error: error.message },
      { status: 500 }
    );
  }
}