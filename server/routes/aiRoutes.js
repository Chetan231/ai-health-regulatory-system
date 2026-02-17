import { Router } from 'express';
import { symptomCheck, diagnosisAssist, reportSummary, riskAssessment, healthTips } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();
router.use(protect);

router.post('/symptom-check', authorize('patient'), symptomCheck);
router.post('/diagnosis-assist', authorize('doctor'), diagnosisAssist);
router.post('/report-summary', reportSummary);
router.post('/risk-assessment', riskAssessment);
router.post('/health-tips', authorize('patient'), healthTips);

export default router;
