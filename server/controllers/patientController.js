import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Vitals from '../models/Vitals.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Get patient dashboard stats
// @route   GET /api/patients/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const [profile, latestVitals, vitalsCount, recentAlerts, upcomingAppts, activePrescriptions] = await Promise.all([
      Patient.findOne({ userId: patientId }),
      Vitals.findOne({ patientId }).sort({ recordedAt: -1 }),
      Vitals.countDocuments({ patientId }),
      Vitals.find({ patientId, 'alerts.0': { $exists: true } })
        .sort({ recordedAt: -1 })
        .limit(5)
        .select('alerts recordedAt'),
      Appointment.countDocuments({ patientId, date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } }),
      Prescription.countDocuments({ patientId, isActive: true }),
    ]);

    // Flatten recent alerts
    const alerts = recentAlerts.flatMap((v) =>
      v.alerts.map((a) => ({ ...a.toObject(), recordedAt: v.recordedAt }))
    );

    sendResponse(res, 200, 'Patient dashboard', {
      profile,
      latestVitals,
      vitalsCount,
      alerts,
      stats: {
        appointments: upcomingAppts,
        prescriptions: activePrescriptions,
        labReports: 0,
        vitalsRecorded: vitalsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient profile
// @route   GET /api/patients/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await Patient.findOne({ userId: req.user._id });

    if (!profile) {
      return sendError(res, 404, 'Patient profile not found');
    }

    sendResponse(res, 200, 'Patient profile', {
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile (health info)
// @route   PUT /api/patients/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'dateOfBirth', 'gender', 'bloodGroup', 'height', 'weight',
      'allergies', 'chronicConditions', 'emergencyContact', 'address', 'insuranceInfo',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return sendError(res, 404, 'Patient profile not found');
    }

    sendResponse(res, 200, 'Profile updated', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get health timeline (vitals + future: appointments, reports, prescriptions)
// @route   GET /api/patients/health-timeline
export const getHealthTimeline = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [vitals, total] = await Promise.all([
      Vitals.find({ patientId: req.user._id })
        .sort({ recordedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Vitals.countDocuments({ patientId: req.user._id }),
    ]);

    // Build timeline entries from vitals
    const timeline = vitals.map((v) => ({
      type: 'vitals',
      date: v.recordedAt,
      data: v,
      alerts: v.alerts,
    }));

    sendResponse(res, 200, 'Health timeline', {
      timeline,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
