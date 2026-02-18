import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';
import Report from '../models/Report.js';
import Invoice from '../models/Invoice.js';

// Admin dashboard analytics
export const getDashboard = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalDepartments, totalAppointments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Department.countDocuments(),
      Appointment.countDocuments(),
    ]);

    // Revenue
    const invoices = await Invoice.find({ status: 'paid' });
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const monthInvoices = await Invoice.find({
        status: 'paid',
        paidAt: { $gte: start, $lt: end },
      });
      monthlyRevenue.push({
        month: start.toLocaleString('default', { month: 'short' }),
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
      });
    }

    // Appointment stats
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Department stats
    const departments = await Department.find().populate('headDoctor', 'name');
    const deptStats = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({ department: dept._id });
        return { ...dept.toObject(), doctorCount };
      })
    );

    // Recent registrations
    const recentPatients = await User.find({ role: 'patient' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt avatar');
    const recentDoctors = await User.find({ role: 'doctor' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt avatar');

    res.json({
      stats: { totalPatients, totalDoctors, totalDepartments, totalAppointments, totalRevenue },
      monthlyRevenue,
      appointmentsByStatus,
      departments: deptStats,
      recentPatients,
      recentDoctors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manage doctors
export const getDoctors = async (req, res) => {
  try {
    const { approved, page = 1, limit = 10 } = req.query;
    const query = {};
    if (approved !== undefined) query.isApproved = approved === 'true';

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email avatar phone createdAt')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(query);
    res.json({ doctors, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve/reject doctor
export const verifyDoctor = async (req, res) => {
  try {
    const { approved } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: approved },
      { new: true }
    ).populate('userId', 'name email');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ message: `Doctor ${approved ? 'approved' : 'rejected'}`, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all patients (admin)
export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { role: 'patient' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    // Attach profiles
    const result = await Promise.all(
      patients.map(async (p) => {
        const profile = await Patient.findOne({ userId: p._id });
        return { user: p, profile };
      })
    );

    res.json({ patients: result, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Department CRUD
export const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find().populate('headDoctor', 'name');
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
