import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Patient condition/diagnosis is required'],
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Assigned Doctor ID is required'],
    },
  },
  { timestamps: true }
);

// Performance optimization query indexing
patientSchema.index({ name: 'text', condition: 'text' });
patientSchema.index({ doctor: 1 });
patientSchema.index({ createdAt: -1 });

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;