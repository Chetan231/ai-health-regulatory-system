import { Router } from 'express';
import { createReport, getReports, getReport } from '../controllers/labReportController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', createReport);
router.get('/', getReports);
router.get('/:id', getReport);

export default router;
