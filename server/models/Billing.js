import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    items: [{ description: String, amount: Number }],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['razorpay', 'cash', 'insurance'] },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    invoiceNumber: { type: String, unique: true },
    paidAt: Date,
  },
  { timestamps: true }
);

// Auto-generate invoice number
billingSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Billing').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Billing', billingSchema);
