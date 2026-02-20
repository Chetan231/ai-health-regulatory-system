import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Report from '../models/Report.js';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';

// Get all doctors (public)
export const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    const query = { isApproved: true };

    if (specialization) query.specialization = specialization;

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email avatar phone')
      .populate('department', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(query);

    // Filter by search on populated name
    let filtered = doctors;
    if (search) {
      const re = new RegExp(search, 'i');
      filtered = doctors.filter(d => re.test(d.userId?.name) || re.test(d.specialization));
    }

    res.json({ doctors: filtered, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single doctor
export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email avatar phone')
      .populate('department', 'name');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
export const updateProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Profile not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor's patient list
export const getMyPatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email avatar phone')
      .sort({ date: -1 });

    // Unique patients
    const seen = new Set();
    const patients = [];
    for (const apt of appointments) {
      const id = apt.patient?._id?.toString();
      if (id && !seen.has(id)) {
        seen.add(id);
        const profile = await Patient.findOne({ userId: apt.patient._id });
        patients.push({ user: apt.patient, profile, lastVisit: apt.date });
      }
    }

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove patient from doctor's list (deletes all related data)
export const removePatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Delete all data between this doctor and patient
    await Promise.all([
      Appointment.deleteMany({ doctor: req.user._id, patient: patientId }),
      Report.deleteMany({ doctor: req.user._id, patient: patientId }),
      Prescription.deleteMany({ doctor: req.user._id, patient: patientId }),
    ]);

    res.json({ message: 'Patient and all related records removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor dashboard stats
export const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, todayAppointments, pendingReports, completedToday] = await Promise.all([
      Appointment.distinct('patient', { doctor: req.user._id }).then(ids => ids.length),
      Appointment.countDocuments({ doctor: req.user._id, date: { $gte: today, $lt: tomorrow } }),
      Report.countDocuments({ doctor: req.user._id, aiSummary: null }),
      Appointment.countDocuments({ doctor: req.user._id, date: { $gte: today, $lt: tomorrow }, status: 'completed' }),
    ]);

    const todaySchedule = await Appointment.find({
      doctor: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate('patient', 'name avatar')
      .sort({ timeSlot: 1 });

    res.json({
      stats: { totalPatients, todayAppointments, pendingReports, completedToday },
      todaySchedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
