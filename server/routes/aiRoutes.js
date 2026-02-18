import express from 'express';
import { checkSymptoms, getReportSummary, getHealthRisk } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/symptom-check', checkSymptoms);
router.post('/report-summary/:id', getReportSummary);
router.get('/health-risk', getHealthRisk);

export default router;
