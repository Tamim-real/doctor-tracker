import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Patient from '@/models/Patient';

// GET: Single Patient
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const patient = await Patient.findById(id).populate('doctor', 'name specialization').lean();

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patient }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch patient', error: error.message }, { status: 500 });
  }
}

// PATCH: Edit Patient Information
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updatedPatient = await Patient.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPatient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Patient updated successfully', data: updatedPatient },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update patient', error: error.message }, { status: 500 });
  }
}

// DELETE: Remove Patient
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Patient deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete patient', error: error.message }, { status: 500 });
  }
}