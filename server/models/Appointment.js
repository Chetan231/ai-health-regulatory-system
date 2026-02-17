import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "09:00-09:30"
    type: { type: String, enum: ['in-person', 'video'], default: 'in-person' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    symptoms: { type: String },
    notes: { type: String },
    diagnosis: { type: String },
    followUpDate: { type: Date },
    cancelReason: { type: String },
    cancelledBy: { type: String, enum: ['patient', 'doctor'] },
  },
  { timestamps: true }
);

// Compound index to prevent double booking
appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.model('Appointment', appointmentSchema);
