import LabReport from '../models/LabReport.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Upload/create lab report
// @route   POST /api/lab-reports
export const createReport = async (req, res, next) => {
  try {
    const { title, type, results, date, labName, fileUrl } = req.body;
    if (!title) return sendError(res, 400, 'Title is required');

    const report = await LabReport.create({
      patientId: req.user.role === 'patient' ? req.user._id : req.body.patientId,
      doctorId: req.user.role === 'doctor' ? req.user._id : undefined,
      title, type, results, date, labName, fileUrl,
    });

    sendResponse(res, 201, 'Lab report created', { report });
  } catch (error) { next(error); }
};

// @desc    Get lab reports
// @route   GET /api/lab-reports
export const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    if (req.user.role === 'patient') query.patientId = req.user._id;
    if (req.user.role === 'doctor') query.doctorId = req.user._id;

    const [reports, total] = await Promise.all([
      LabReport.find(query).populate('patientId', 'name email').populate('doctorId', 'name').sort({ date: -1 }).skip(skip).limit(Number(limit)),
      LabReport.countDocuments(query),
    ]);

    sendResponse(res, 200, 'Lab reports', { reports, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// @desc    Get single report
// @route   GET /api/lab-reports/:id
export const getReport = async (req, res, next) => {
  try {
    const report = await LabReport.findById(req.params.id).populate('patientId', 'name email').populate('doctorId', 'name');
    if (!report) return sendError(res, 404, 'Report not found');
    sendResponse(res, 200, 'Lab report', { report });
  } catch (error) { next(error); }
};
