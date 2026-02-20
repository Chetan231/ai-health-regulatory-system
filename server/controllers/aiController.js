import { analyzeSymptoms, summarizeReport, predictHealthRisk, chatResponse } from '../utils/aiHelper.js';
import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import Vital from '../models/Vital.js';

// Symptom checker
export const checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ message: 'Please describe your symptoms' });

    const analysis = await analyzeSymptoms(symptoms);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Report summary
export const getReportSummary = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const summary = await summarizeReport(report);

    // Save AI summary to report
    report.aiSummary = summary.summary;
    await report.save();

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// AI Chat
export const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const response = await chatResponse(message, history || []);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Health risk prediction
export const getHealthRisk = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const recentVitals = await Vital.find({ patient: req.user._id })
      .sort({ recordedAt: -1 })
      .limit(20);

    const patientData = {
      profile: patient,
      vitals: recentVitals,
    };

    const risk = await predictHealthRisk(patientData);
    res.json(risk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
