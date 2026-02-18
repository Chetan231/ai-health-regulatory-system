import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Report from '../models/Report.js';
import Prescription from '../models/Prescription.js';
import Vital from '../models/Vital.js';

// Get patient profile
export const getProfile = async (req, res) => {
  try {
    const profile = await Patient.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient profile
export const updateProfile = async (req, res) => {
  try {
    const profile = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient dashboard stats
export const getDashboard = async (req, res) => {
  try {
    const [appointments, reports, prescriptions, vitals] = await Promise.all([
      Appointment.countDocuments({ patient: req.user._id }),
      Report.countDocuments({ patient: req.user._id }),
      Prescription.countDocuments({ patient: req.user._id }),
      Vital.countDocuments({ patient: req.user._id }),
    ]);

    const upcomingAppointments = await Appointment.find({
      patient: req.user._id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('doctor', 'name avatar')
      .sort({ date: 1 })
      .limit(5);

    const recentReports = await Report.find({ patient: req.user._id })
      .populate('doctor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentVitals = await Vital.find({ patient: req.user._id })
      .sort({ recordedAt: -1 })
      .limit(10);

    res.json({
      stats: { appointments, reports, prescriptions, vitals },
      upcomingAppointments,
      recentReports,
      recentVitals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
