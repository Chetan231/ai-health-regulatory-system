import Vitals from '../models/Vitals.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Record new vitals
// @route   POST /api/vitals
export const recordVitals = async (req, res, next) => {
  try {
    const vitals = await Vitals.create({
      patientId: req.user._id,
      ...req.body,
    });

    sendResponse(res, 201, 'Vitals recorded', { vitals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vitals history
// @route   GET /api/vitals
export const getVitals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    const skip = (page - 1) * limit;

    const query = { patientId: req.user._id };
    if (from || to) {
      query.recordedAt = {};
      if (from) query.recordedAt.$gte = new Date(from);
      if (to) query.recordedAt.$lte = new Date(to);
    }

    const [vitals, total] = await Promise.all([
      Vitals.find(query).sort({ recordedAt: -1 }).skip(skip).limit(Number(limit)),
      Vitals.countDocuments(query),
    ]);

    sendResponse(res, 200, 'Vitals history', {
      vitals,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest vitals
// @route   GET /api/vitals/latest
export const getLatestVitals = async (req, res, next) => {
  try {
    const vitals = await Vitals.findOne({ patientId: req.user._id }).sort({ recordedAt: -1 });

    if (!vitals) {
      return sendResponse(res, 200, 'No vitals recorded yet', { vitals: null });
    }

    sendResponse(res, 200, 'Latest vitals', { vitals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vitals analytics (for charts)
// @route   GET /api/vitals/analytics
export const getVitalsAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - Number(days));

    const vitals = await Vitals.find({
      patientId: req.user._id,
      recordedAt: { $gte: fromDate },
    }).sort({ recordedAt: 1 });

    // Build chart data
    const chartData = vitals.map((v) => ({
      date: v.recordedAt,
      systolic: v.bloodPressure?.systolic || null,
      diastolic: v.bloodPressure?.diastolic || null,
      heartRate: v.heartRate || null,
      temperature: v.temperature || null,
      oxygenSaturation: v.oxygenSaturation || null,
      weight: v.weight || null,
      fastingSugar: v.bloodSugar?.fasting || null,
      bmi: v.bmi || null,
    }));

    // Calculate averages
    const avg = (arr) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

    const heartRates = vitals.filter((v) => v.heartRate).map((v) => v.heartRate);
    const systolics = vitals.filter((v) => v.bloodPressure?.systolic).map((v) => v.bloodPressure.systolic);
    const o2 = vitals.filter((v) => v.oxygenSaturation).map((v) => v.oxygenSaturation);

    sendResponse(res, 200, 'Vitals analytics', {
      chartData,
      averages: {
        heartRate: avg(heartRates),
        systolicBP: avg(systolics),
        oxygenSaturation: avg(o2),
      },
      totalRecords: vitals.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vitals record
// @route   DELETE /api/vitals/:id
export const deleteVitals = async (req, res, next) => {
  try {
    const vitals = await Vitals.findOne({ _id: req.params.id, patientId: req.user._id });
    if (!vitals) {
      return sendError(res, 404, 'Vitals record not found');
    }

    await vitals.deleteOne();
    sendResponse(res, 200, 'Vitals record deleted');
  } catch (error) {
    next(error);
  }
};
