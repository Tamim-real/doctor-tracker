import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'], 
      trim: true 
    },
    specialization: { 
      type: String, 
      required: [true, 'Specialization is required'], 
      trim: true 
    },
    hospital: { 
      type: String, 
      required: [true, 'Hospital name is required'], 
      trim: true 
    },
    phone: { 
      type: String, 
      required: [true, 'Phone number is required'], 
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
  },
  { 
    timestamps: true 
  }
);


doctorSchema.index({ name: 'text', specialization: 'text' });


const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;