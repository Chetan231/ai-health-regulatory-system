import mongoose from 'mongoose';

const vitalSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['blood-pressure', 'heart-rate', 'glucose', 'temperature', 'weight', 'bmi', 'oxygen-saturation'],
    required: true,
  },
  value: { type: String, required: true },
  unit: { type: String, required: true },
  notes: { type: String },
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Vital', vitalSchema);
