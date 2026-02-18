import Report from '../models/Report.js';
import Notification from '../models/Notification.js';

// Create report (doctor)
export const createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, doctor: req.user._id });
    
    await Notification.create({
      user: report.patient,
      title: 'New Report Available',
      message: `Dr. ${req.user.name} uploaded a new ${report.type} report: ${report.title}`,
      type: 'report',
    });

    const io = req.app.get('io');
    io?.to(report.patient.toString()).emit('notification', { type: 'report', message: 'New report available' });

    const populated = await report.populate([
      { path: 'patient', select: 'name email avatar' },
      { path: 'doctor', select: 'name email avatar' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports
export const getReports = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    if (type) query.type = type;

    const reports = await Report.find(query)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Report.countDocuments(query);
    res.json({ reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single report
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email avatar')
      .populate('appointment');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update report
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email avatar');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload file to report
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.files.push({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.originalname,
    });
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete report
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
