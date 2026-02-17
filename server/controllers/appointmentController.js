import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// Generate 30-min slots from availability
const generateSlots = (startTime, endTime) => {
  const slots = [];
  let [h, m] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  while (h < eh || (h === eh && m < em)) {
    const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    m += 30;
    if (m >= 60) { h++; m -= 60; }
    if (h > eh || (h === eh && m > em)) break;
    const end = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(`${start}-${end}`);
  }
  return slots;
};

// @desc    Get available slots for a doctor on a date
// @route   GET /api/appointments/slots/:doctorId/:date
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.params;
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) return sendError(res, 404, 'Doctor not found');

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const dayMap = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun' };
    const daySlots = doctor.availability.filter((a) => a.day === dayMap[dayOfWeek]);

    if (daySlots.length === 0) {
      return sendResponse(res, 200, 'Doctor not available on this day', { slots: [], bookedSlots: [] });
    }

    // Generate all possible slots
    let allSlots = [];
    daySlots.forEach((s) => {
      allSlots = [...allSlots, ...generateSlots(s.startTime, s.endTime)];
    });

    // Find already booked slots
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = booked.map((b) => b.timeSlot);
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    sendResponse(res, 200, 'Available slots', { slots: availableSlots, bookedSlots, allSlots });
  } catch (error) {
    next(error);
  }
};

// @desc    Book appointment
// @route   POST /api/appointments
export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, type, symptoms } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return sendError(res, 400, 'doctorId, date, and timeSlot are required');
    }

    // Check doctor exists
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) return sendError(res, 404, 'Doctor not found');
    if (!doctor.isAvailable) return sendError(res, 400, 'Doctor is currently unavailable');

    // Check slot not already booked
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) return sendError(res, 400, 'This time slot is already booked');

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date: startOfDay,
      timeSlot,
      type: type || 'in-person',
      symptoms,
    });

    sendResponse(res, 201, 'Appointment booked successfully', { appointment });
  } catch (error) {
    if (error.code === 11000) return sendError(res, 400, 'This time slot is already booked');
    next(error);
  }
};

// @desc    Get appointments (filtered by role)
// @route   GET /api/appointments
export const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, upcoming } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role === 'patient') query.patientId = req.user._id;
    else if (req.user.role === 'doctor') query.doctorId = req.user._id;

    if (status) query.status = status;
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patientId', 'name email phone avatar')
        .populate('doctorId', 'name email phone avatar')
        .sort({ date: upcoming === 'true' ? 1 : -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(query),
    ]);

    sendResponse(res, 200, 'Appointments', {
      appointments,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name email phone avatar');

    if (!appointment) return sendError(res, 404, 'Appointment not found');

    // Verify access
    const userId = req.user._id.toString();
    if (appointment.patientId._id.toString() !== userId && appointment.doctorId._id.toString() !== userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized');
    }

    sendResponse(res, 200, 'Appointment detail', { appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
export const updateStatus = async (req, res, next) => {
  try {
    const { status, cancelReason, diagnosis, notes, followUpDate } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return sendError(res, 404, 'Appointment not found');

    // Validate transitions
    const allowed = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!allowed[appointment.status]?.includes(status)) {
      return sendError(res, 400, `Cannot change status from ${appointment.status} to ${status}`);
    }

    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancelReason = cancelReason || '';
      appointment.cancelledBy = req.user.role === 'patient' ? 'patient' : 'doctor';
    }
    if (status === 'completed') {
      if (diagnosis) appointment.diagnosis = diagnosis;
      if (notes) appointment.notes = notes;
      if (followUpDate) appointment.followUpDate = followUpDate;
    }

    await appointment.save();

    sendResponse(res, 200, `Appointment ${status}`, { appointment });
  } catch (error) {
    next(error);
  }
};
