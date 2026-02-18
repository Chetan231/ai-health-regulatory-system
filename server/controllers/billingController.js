import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);

    await Notification.create({
      user: invoice.patient,
      title: 'New Invoice',
      message: `Invoice ${invoice.invoiceNumber} for ₹${invoice.total} has been generated`,
      type: 'billing',
    });

    const io = req.app.get('io');
    io?.to(invoice.patient.toString()).emit('notification', { type: 'billing', message: 'New invoice generated' });

    const populated = await invoice.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get invoices
export const getInvoices = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Invoice.countDocuments(query);

    // Summary stats
    const allInvoices = await Invoice.find(req.user.role === 'patient' ? { patient: req.user._id } : {});
    const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = allInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pending = allInvoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.total, 0);

    res.json({
      invoices, total, page: Number(page), pages: Math.ceil(total / limit),
      summary: { totalAmount, paid, pending, overdue: totalAmount - paid - pending },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.status === 'paid') update.paidAt = new Date();

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single invoice
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email')
      .populate('appointment');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
