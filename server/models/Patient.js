import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
  },
  address: { type: String },
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
