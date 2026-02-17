import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema(
  {
    bedNumber: { type: String, required: true, unique: true, trim: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    type: { type: String, enum: ['general', 'icu', 'private', 'semi-private'], default: 'general' },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    admittedAt: { type: Date },
    dailyRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Bed', bedSchema);
