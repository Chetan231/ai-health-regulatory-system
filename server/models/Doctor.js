import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  experience: { type: Number, default: 0 }, // years
  qualifications: [{ type: String }],
  availability: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    startTime: String,
    endTime: String,
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalPatients: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  bio: { type: String },
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
