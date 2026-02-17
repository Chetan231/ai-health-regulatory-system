import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Vitals from '../models/Vitals.js';
import Department from '../models/Department.js';
import Bed from '../models/Bed.js';
import Billing from '../models/Billing.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Admin dashboard analytics
// @route   GET /api/admin/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalPatients, totalDoctors, totalAppointments, todayAppointments,
      pendingAppointments, completedAppointments, cancelledAppointments,
      totalPrescriptions, totalDepartments, totalBeds, availableBeds,
      occupiedBeds, recentAppointments, monthlyAppointments, totalRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Prescription.countDocuments(),
      Department.countDocuments({ isActive: true }),
      Bed.countDocuments(),
      Bed.countDocuments({ status: 'available' }),
      Bed.countDocuments({ status: 'occupied' }),
      Appointment.find().populate('patientId', 'name').populate('doctorId', 'name').sort({ createdAt: -1 }).limit(10),
      Appointment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Billing.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$finalAmount' } } }]),
    ]);

    // Monthly registration trend (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' }, role: '$role' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Appointment status distribution
    const appointmentStats = { pending: pendingAppointments, confirmed: 0, completed: completedAppointments, cancelled: cancelledAppointments };
    appointmentStats.confirmed = totalAppointments - pendingAppointments - completedAppointments - cancelledAppointments;

    sendResponse(res, 200, 'Admin dashboard', {
      stats: {
        totalPatients, totalDoctors, totalAppointments, todayAppointments,
        totalPrescriptions, totalDepartments, totalBeds, availableBeds, occupiedBeds,
        monthlyAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      appointmentStats,
      registrationTrend,
      recentAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    sendResponse(res, 200, 'Users list', { users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified }, { new: true }).select('-password');
    if (!user) return sendError(res, 404, 'User not found');
    sendResponse(res, 200, `User ${isVerified ? 'activated' : 'deactivated'}`, { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    if (user.role === 'admin') return sendError(res, 400, 'Cannot delete admin');

    // Clean up related data
    if (user.role === 'patient') {
      await Patient.deleteOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      await Doctor.deleteOne({ userId: user._id });
    }
    await user.deleteOne();

    sendResponse(res, 200, 'User deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending doctor verifications
// @route   GET /api/admin/doctors/pending
export const getPendingDoctors = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ role: 'doctor', isVerified: false }).select('-password');
    const doctors = await Promise.all(
      pendingUsers.map(async (u) => {
        const profile = await Doctor.findOne({ userId: u._id });
        return { user: u, profile };
      })
    );
    sendResponse(res, 200, 'Pending doctors', { doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify doctor
// @route   PUT /api/admin/doctors/:id/verify
export const verifyDoctor = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'doctor') return sendError(res, 404, 'Doctor not found');
    user.isVerified = true;
    await user.save();
    sendResponse(res, 200, 'Doctor verified', { user });
  } catch (error) {
    next(error);
  }
};

// ——— Department CRUD ———

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('headDoctorId', 'name email').sort({ name: 1 });
    sendResponse(res, 200, 'Departments', { departments });
  } catch (error) { next(error); }
};

export const createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    sendResponse(res, 201, 'Department created', { department });
  } catch (error) { next(error); }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return sendError(res, 404, 'Department not found');
    sendResponse(res, 200, 'Department updated', { department });
  } catch (error) { next(error); }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return sendError(res, 404, 'Department not found');
    sendResponse(res, 200, 'Department deleted');
  } catch (error) { next(error); }
};

// ——— Bed CRUD ———

export const getBeds = async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const query = {};
    if (department) query.departmentId = department;
    if (status) query.status = status;
    const beds = await Bed.find(query).populate('departmentId', 'name').populate('patientId', 'name').sort({ bedNumber: 1 });
    sendResponse(res, 200, 'Beds', { beds });
  } catch (error) { next(error); }
};

export const createBed = async (req, res, next) => {
  try {
    const bed = await Bed.create(req.body);
    sendResponse(res, 201, 'Bed created', { bed });
  } catch (error) { next(error); }
};

export const updateBed = async (req, res, next) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bed) return sendError(res, 404, 'Bed not found');
    sendResponse(res, 200, 'Bed updated', { bed });
  } catch (error) { next(error); }
};

export const deleteBed = async (req, res, next) => {
  try {
    const bed = await Bed.findByIdAndDelete(req.params.id);
    if (!bed) return sendError(res, 404, 'Bed not found');
    sendResponse(res, 200, 'Bed deleted');
  } catch (error) { next(error); }
};

export const getBedStats = async (req, res, next) => {
  try {
    const stats = await Bed.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byType = await Bed.aggregate([
      { $group: { _id: { type: '$type', status: '$status' }, count: { $sum: 1 } } },
    ]);
    sendResponse(res, 200, 'Bed stats', { stats, byType });
  } catch (error) { next(error); }
};
