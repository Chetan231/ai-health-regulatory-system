import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Create prescription
// @route   POST /api/prescriptions
export const createPrescription = async (req, res, next) => {
  try {
    const { patientId, appointmentId, medicines, diagnosis, notes } = req.body;

    if (!patientId || !medicines || medicines.length === 0) {
      return sendError(res, 400, 'patientId and at least one medicine are required');
    }

    // Validate medicines
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return sendError(res, 400, 'Each medicine needs name, dosage, frequency, and duration');
      }
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      appointmentId: appointmentId || undefined,
      medicines,
      diagnosis,
      notes,
    });

    sendResponse(res, 201, 'Prescription created', { prescription });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions (filtered by role)
// @route   GET /api/prescriptions
export const getPrescriptions = async (req, res, next) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role === 'patient') query.patientId = req.user._id;
    else if (req.user.role === 'doctor') query.doctorId = req.user._id;

    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('patientId', 'name email avatar')
        .populate('doctorId', 'name email avatar')
        .populate('appointmentId', 'date timeSlot')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Prescription.countDocuments(query),
    ]);

    sendResponse(res, 200, 'Prescriptions', {
      prescriptions,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
export const getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name email phone avatar')
      .populate('appointmentId', 'date timeSlot type');

    if (!prescription) return sendError(res, 404, 'Prescription not found');

    const userId = req.user._id.toString();
    if (prescription.patientId._id.toString() !== userId && prescription.doctorId._id.toString() !== userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized');
    }

    sendResponse(res, 200, 'Prescription detail', { prescription });
  } catch (error) {
    next(error);
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
export const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return sendError(res, 404, 'Prescription not found');
    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the prescribing doctor can update');
    }

    const { medicines, diagnosis, notes, isActive } = req.body;
    if (medicines) prescription.medicines = medicines;
    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (notes !== undefined) prescription.notes = notes;
    if (isActive !== undefined) prescription.isActive = isActive;

    await prescription.save();
    sendResponse(res, 200, 'Prescription updated', { prescription });
  } catch (error) {
    next(error);
  }
};
