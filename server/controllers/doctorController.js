import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Vitals from '../models/Vitals.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) return sendError(res, 404, 'Doctor profile not found');

    // Stats will grow as we add appointments/prescriptions
    sendResponse(res, 200, 'Doctor dashboard', {
      profile: doctorProfile,
      stats: {
        todayAppointments: 0,
        totalPatients: 0,
        pendingConsults: 0,
        prescriptionsWritten: 0,
        rating: doctorProfile.rating,
        totalReviews: doctorProfile.totalReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's own profile
// @route   GET /api/doctors/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await Doctor.findOne({ userId: req.user._id }).populate('departmentId', 'name');

    if (!profile) return sendError(res, 404, 'Doctor profile not found');

    sendResponse(res, 200, 'Doctor profile', {
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const allowedFields = ['specialization', 'qualification', 'experience', 'consultationFee', 'isAvailable'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const profile = await Doctor.findOneAndUpdate({ userId: req.user._id }, updates, { new: true, runValidators: true });
    if (!profile) return sendError(res, 404, 'Doctor profile not found');

    sendResponse(res, 200, 'Profile updated', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update availability schedule
// @route   PUT /api/doctors/availability
export const updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    if (!Array.isArray(availability)) {
      return sendError(res, 400, 'Availability must be an array');
    }

    const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (const slot of availability) {
      if (!validDays.includes(slot.day)) return sendError(res, 400, `Invalid day: ${slot.day}`);
      if (!slot.startTime || !slot.endTime) return sendError(res, 400, 'Each slot needs startTime and endTime');
    }

    const profile = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );

    if (!profile) return sendError(res, 404, 'Doctor profile not found');

    sendResponse(res, 200, 'Availability updated', { availability: profile.availability });
  } catch (error) {
    next(error);
  }
};

// @desc    List all doctors (public, with filters)
// @route   GET /api/doctors
export const listDoctors = async (req, res, next) => {
  try {
    const { specialization, search, available, sortBy = 'rating', page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    // Build doctor filter
    const doctorFilter = {};
    if (specialization) doctorFilter.specialization = { $regex: specialization, $options: 'i' };
    if (available === 'true') doctorFilter.isAvailable = true;

    // If searching by name, find matching user IDs first
    let userIds = null;
    if (search) {
      const users = await User.find({
        role: 'doctor',
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      userIds = users.map((u) => u._id);
      doctorFilter.userId = { $in: userIds };
    }

    const sortOptions = {};
    if (sortBy === 'rating') sortOptions.rating = -1;
    else if (sortBy === 'experience') sortOptions.experience = -1;
    else if (sortBy === 'fee') sortOptions.consultationFee = 1;

    const [doctors, total] = await Promise.all([
      Doctor.find(doctorFilter)
        .populate('userId', 'name email phone avatar')
        .populate('departmentId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Doctor.countDocuments(doctorFilter),
    ]);

    // Get unique specializations for filter dropdown
    const specializations = await Doctor.distinct('specialization');

    sendResponse(res, 200, 'Doctors list', {
      doctors,
      specializations,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor profile (public)
// @route   GET /api/doctors/:id
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.id })
      .populate('userId', 'name email phone avatar')
      .populate('departmentId', 'name');

    if (!doctor) return sendError(res, 404, 'Doctor not found');

    sendResponse(res, 200, 'Doctor profile', { doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's patients (from appointments — placeholder uses vitals for now)
// @route   GET /api/doctors/my-patients
export const getMyPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // For now, return all patients (will filter by appointments in Sprint 4)
    let userFilter = { role: 'patient' };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(userFilter).select('name email phone avatar').skip(skip).limit(Number(limit)).sort({ name: 1 }),
      User.countDocuments(userFilter),
    ]);

    // Attach patient profiles and latest vitals
    const patients = await Promise.all(
      users.map(async (u) => {
        const profile = await Patient.findOne({ userId: u._id });
        const latestVitals = await Vitals.findOne({ patientId: u._id }).sort({ recordedAt: -1 });
        return { user: u, profile, latestVitals };
      })
    );

    sendResponse(res, 200, 'My patients', {
      patients,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific patient's detail (for doctor view)
// @route   GET /api/doctors/patients/:patientId
export const getPatientDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.patientId).select('name email phone avatar');
    if (!user || user.role === 'admin') return sendError(res, 404, 'Patient not found');

    const profile = await Patient.findOne({ userId: req.params.patientId });
    const vitals = await Vitals.find({ patientId: req.params.patientId }).sort({ recordedAt: -1 }).limit(20);
    const latestVitals = vitals[0] || null;

    sendResponse(res, 200, 'Patient detail', { user, profile, vitals, latestVitals });
  } catch (error) {
    next(error);
  }
};
