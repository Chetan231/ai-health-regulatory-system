import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    height: Number,
    weight: Number,
    allergies: [String],
    chronicConditions: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      validTill: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
