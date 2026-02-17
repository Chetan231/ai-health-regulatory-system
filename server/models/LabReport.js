import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    type: { type: String, enum: ['blood', 'urine', 'xray', 'mri', 'ct', 'ecg', 'other'], default: 'other' },
    fileUrl: { type: String },
    results: { type: String },
    aiSummary: { type: String },
    date: { type: Date, default: Date.now },
    labName: { type: String },
    status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  },
  { timestamps: true }
);

export default mongoose.model('LabReport', labReportSchema);
