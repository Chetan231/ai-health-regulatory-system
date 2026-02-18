import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';

// Create appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, timeSlot, type, symptoms } = req.body;

    // Check if slot is taken
    const existing = await Appointment.findOne({
      doctor, date, timeSlot, status: { $ne: 'cancelled' },
    });
    if (existing) return res.status(400).json({ message: 'This time slot is already booked' });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor, date, timeSlot, type, symptoms,
    });

    // Notify doctor
    await Notification.create({
      user: doctor,
      title: 'New Appointment',
      message: `${req.user.name} booked an appointment for ${new Date(date).toLocaleDateString()} at ${timeSlot}`,
      type: 'appointment',
    });

    // Emit socket event
    const io = req.app.get('io');
    io?.to(doctor).emit('notification', { type: 'appointment', message: 'New appointment booked' });

    const populated = await appointment.populate([
      { path: 'patient', select: 'name email avatar' },
      { path: 'doctor', select: 'name email avatar' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointments (filtered by role)
export const getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email avatar phone')
      .populate('doctor', 'name email avatar phone')
      .sort({ date: -1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(query);

    res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single appointment
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email avatar phone')
      .populate('doctor', 'name email avatar phone');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name email avatar' },
      { path: 'doctor', select: 'name email avatar' },
    ]);

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Notify the other party
    const notifyUser = req.user.role === 'doctor' ? appointment.patient._id : appointment.doctor._id;
    await Notification.create({
      user: notifyUser,
      title: `Appointment ${req.body.status || 'Updated'}`,
      message: `Appointment on ${new Date(appointment.date).toLocaleDateString()} has been ${req.body.status || 'updated'}`,
      type: 'appointment',
    });

    const io = req.app.get('io');
    io?.to(notifyUser.toString()).emit('notification', { type: 'appointment', message: `Appointment ${req.body.status}` });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || '';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available time slots for a doctor on a date
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvail = doctor.availability.find(a => a.day === dayName);

    if (!dayAvail) return res.json({ slots: [], message: 'Doctor not available on this day' });

    // Generate hourly slots
    const allSlots = [];
    const start = parseInt(dayAvail.startTime.split(':')[0]);
    const end = parseInt(dayAvail.endTime.split(':')[0]);
    for (let h = start; h < end; h++) {
      allSlots.push(`${String(h).padStart(2, '0')}:00`);
      allSlots.push(`${String(h).padStart(2, '0')}:30`);
    }

    // Find booked slots
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const booked = await Appointment.find({
      doctor: doctorId, date: { $gte: d, $lt: next }, status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSlots = new Set(booked.map(a => a.timeSlot));
    const available = allSlots.map(slot => ({ time: slot, available: !bookedSlots.has(slot) }));

    res.json({ slots: available, day: dayName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
