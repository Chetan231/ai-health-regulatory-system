import Billing from '../models/Billing.js';
import Appointment from '../models/Appointment.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Create invoice
// @route   POST /api/billing
export const createInvoice = async (req, res, next) => {
  try {
    const { patientId, appointmentId, items, discount, tax } = req.body;
    if (!patientId || !items || items.length === 0) {
      return sendError(res, 400, 'patientId and items are required');
    }

    const totalAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);
    const discountAmt = discount || 0;
    const taxAmt = tax || 0;
    const finalAmount = totalAmount - discountAmt + taxAmt;

    const billing = await Billing.create({
      patientId, appointmentId, items,
      totalAmount, discount: discountAmt, tax: taxAmt, finalAmount,
    });

    sendResponse(res, 201, 'Invoice created', { billing });
  } catch (error) { next(error); }
};

// @desc    Get invoices (filtered by role)
// @route   GET /api/billing
export const getInvoices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    if (req.user.role === 'patient') query.patientId = req.user._id;
    if (status) query.paymentStatus = status;

    const [invoices, total] = await Promise.all([
      Billing.find(query)
        .populate('patientId', 'name email')
        .populate('appointmentId', 'date timeSlot')
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)),
      Billing.countDocuments(query),
    ]);

    sendResponse(res, 200, 'Invoices', { invoices, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// @desc    Get single invoice
// @route   GET /api/billing/:id
export const getInvoice = async (req, res, next) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('appointmentId', 'date timeSlot type');
    if (!billing) return sendError(res, 404, 'Invoice not found');
    sendResponse(res, 200, 'Invoice', { billing });
  } catch (error) { next(error); }
};

// @desc    Create Razorpay order
// @route   POST /api/billing/create-order
export const createOrder = async (req, res, next) => {
  try {
    const { billingId } = req.body;
    const billing = await Billing.findById(billingId);
    if (!billing) return sendError(res, 404, 'Invoice not found');
    if (billing.paymentStatus === 'paid') return sendError(res, 400, 'Already paid');

    // If Razorpay is configured
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await razorpay.orders.create({
        amount: billing.finalAmount * 100, // paise
        currency: 'INR',
        receipt: billing.invoiceNumber,
      });

      billing.razorpayOrderId = order.id;
      await billing.save();

      return sendResponse(res, 200, 'Order created', { order, billing });
    }

    // Simulate order for demo
    const fakeOrderId = `order_demo_${Date.now()}`;
    billing.razorpayOrderId = fakeOrderId;
    await billing.save();

    sendResponse(res, 200, 'Order created (demo mode)', {
      order: { id: fakeOrderId, amount: billing.finalAmount * 100, currency: 'INR' },
      billing,
      demo: true,
    });
  } catch (error) { next(error); }
};

// @desc    Verify payment
// @route   POST /api/billing/verify-payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { billingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const billing = await Billing.findById(billingId);
    if (!billing) return sendError(res, 404, 'Invoice not found');

    // If Razorpay configured, verify signature
    if (process.env.RAZORPAY_KEY_SECRET && razorpaySignature) {
      const crypto = await import('crypto');
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
      if (expectedSignature !== razorpaySignature) {
        return sendError(res, 400, 'Payment verification failed');
      }
    }

    billing.paymentStatus = 'paid';
    billing.paymentMethod = 'razorpay';
    billing.razorpayPaymentId = razorpayPaymentId || `pay_demo_${Date.now()}`;
    billing.paidAt = new Date();
    await billing.save();

    sendResponse(res, 200, 'Payment verified', { billing });
  } catch (error) { next(error); }
};
