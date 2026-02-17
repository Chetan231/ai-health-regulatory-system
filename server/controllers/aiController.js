import { analyzeSymptoms, getDiagnosisSuggestions, summarizeLabReport, assessHealthRisk, getHealthTips } from '../services/aiService.js';
import Patient from '../models/Patient.js';
import Vitals from '../models/Vitals.js';
import LabReport from '../models/LabReport.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    AI Symptom Checker (Patient)
// @route   POST /api/ai/symptom-check
export const symptomCheck = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return sendError(res, 400, 'Please describe your symptoms');

    const profile = await Patient.findOne({ userId: req.user._id });
    const patientInfo = {
      age: profile?.dateOfBirth ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / 31557600000) : null,
      gender: profile?.gender,
      allergies: profile?.allergies,
      chronicConditions: profile?.chronicConditions,
    };

    const result = await analyzeSymptoms(symptoms, patientInfo);
    sendResponse(res, 200, 'Symptom analysis complete', { analysis: result });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Diagnosis Suggestions (Doctor)
// @route   POST /api/ai/diagnosis-assist
export const diagnosisAssist = async (req, res, next) => {
  try {
    const { symptoms, patientId } = req.body;
    if (!symptoms) return sendError(res, 400, 'Please provide symptoms');

    let patientHistory = {};
    if (patientId) {
      const profile = await Patient.findOne({ userId: patientId });
      const recentVitals = await Vitals.find({ patientId }).sort({ recordedAt: -1 }).limit(5);
      patientHistory = {
        allergies: profile?.allergies,
        chronicConditions: profile?.chronicConditions,
        recentVitals: recentVitals.map((v) => ({
          bp: v.bloodPressure, hr: v.heartRate, temp: v.temperature,
          o2: v.oxygenSaturation, sugar: v.bloodSugar, date: v.recordedAt,
        })),
      };
    }

    const result = await getDiagnosisSuggestions(symptoms, patientHistory);
    sendResponse(res, 200, 'Diagnosis suggestions', { suggestions: result });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Lab Report Summary
// @route   POST /api/ai/report-summary
export const reportSummary = async (req, res, next) => {
  try {
    const { reportId, reportData } = req.body;

    let data = reportData;
    if (reportId) {
      const report = await LabReport.findById(reportId);
      if (!report) return sendError(res, 404, 'Report not found');
      data = report.results || `Report: ${report.title}, Type: ${report.type}`;

      // Save AI summary back to report
      const summary = await summarizeLabReport(data);
      report.aiSummary = JSON.stringify(summary);
      await report.save();

      return sendResponse(res, 200, 'Report summarized', { summary, report });
    }

    if (!data) return sendError(res, 400, 'Provide reportId or reportData');

    const summary = await summarizeLabReport(data);
    sendResponse(res, 200, 'Report summarized', { summary });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Health Risk Assessment
// @route   POST /api/ai/risk-assessment
export const riskAssessment = async (req, res, next) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user._id : req.body.patientId;
    if (!patientId) return sendError(res, 400, 'Patient ID required');

    const profile = await Patient.findOne({ userId: patientId });
    const vitals = await Vitals.find({ patientId }).sort({ recordedAt: -1 }).limit(20);

    if (vitals.length === 0) {
      return sendError(res, 400, 'Not enough vitals data for risk assessment. Record at least a few readings first.');
    }

    const vitalsHistory = vitals.map((v) => ({
      bp: v.bloodPressure, hr: v.heartRate, temp: v.temperature,
      o2: v.oxygenSaturation, sugar: v.bloodSugar, weight: v.weight,
      bmi: v.bmi, date: v.recordedAt,
    }));

    const patientProfile = {
      age: profile?.dateOfBirth ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / 31557600000) : null,
      gender: profile?.gender,
      allergies: profile?.allergies,
      chronicConditions: profile?.chronicConditions,
      height: profile?.height,
      weight: profile?.weight,
    };

    const result = await assessHealthRisk(vitalsHistory, patientProfile);
    sendResponse(res, 200, 'Risk assessment complete', { assessment: result });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Personalized Health Tips
// @route   POST /api/ai/health-tips
export const healthTips = async (req, res, next) => {
  try {
    const profile = await Patient.findOne({ userId: req.user._id });
    const latestVitals = await Vitals.findOne({ patientId: req.user._id }).sort({ recordedAt: -1 });

    const patientProfile = {
      age: profile?.dateOfBirth ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / 31557600000) : null,
      gender: profile?.gender,
      allergies: profile?.allergies,
      chronicConditions: profile?.chronicConditions,
      height: profile?.height,
      weight: profile?.weight,
    };

    const vitals = latestVitals ? {
      bp: latestVitals.bloodPressure, hr: latestVitals.heartRate,
      temp: latestVitals.temperature, o2: latestVitals.oxygenSaturation,
      sugar: latestVitals.bloodSugar, weight: latestVitals.weight,
    } : null;

    const result = await getHealthTips(patientProfile, vitals);
    sendResponse(res, 200, 'Health tips', { tips: result });
  } catch (error) {
    next(error);
  }
};
