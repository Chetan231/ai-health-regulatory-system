import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  type: {
    type: String,
    enum: ['blood-test', 'urine-test', 'imaging', 'ecg', 'lipid-panel', 'cbc', 'thyroid', 'liver', 'kidney', 'x-ray', 'mri', 'ct-scan', 'other'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  results: [{
    parameter: String,
    value: String,
    unit: String,
    normalRange: String,
    status: { type: String, enum: ['normal', 'low', 'high', 'critical'], default: 'normal' },
  }],
  files: [{
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  aiSummary: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
