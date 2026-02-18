import Prescription from '../models/Prescription.js';
import Notification from '../models/Notification.js';

// Create prescription (doctor)
export const createPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.create({ ...req.body, doctor: req.user._id });

    await Notification.create({
      user: prescription.patient,
      title: 'New Prescription',
      message: `Dr. ${req.user.name} created a prescription for: ${prescription.diagnosis}`,
      type: 'prescription',
    });

    const io = req.app.get('io');
    io?.to(prescription.patient.toString()).emit('notification', { type: 'prescription', message: 'New prescription' });

    const populated = await prescription.populate([
      { path: 'patient', select: 'name email avatar' },
      { path: 'doctor', select: 'name email avatar' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Prescription.countDocuments(query);
    res.json({ prescriptions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single prescription
export const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email avatar');
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
