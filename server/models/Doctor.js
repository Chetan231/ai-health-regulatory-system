import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, default: 0 },
    licenseNumber: { type: String, required: true, unique: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    consultationFee: { type: Number, default: 0 },
    availability: [
      {
        day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        startTime: String,
        endTime: String,
      },
    ],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
