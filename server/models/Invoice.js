import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  invoiceNumber: { type: String, unique: true },
  items: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  dueDate: { type: Date },
  paidAt: { type: Date },
  paymentMethod: { type: String },
}, { timestamps: true });

// Auto-generate invoice number
invoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
});

export default mongoose.model('Invoice', invoiceSchema);
