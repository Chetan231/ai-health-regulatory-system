import { Router } from 'express';
import { recordVitals, getVitals, getLatestVitals, getVitalsAnalytics, deleteVitals } from '../controllers/vitalsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(protect, authorize('patient', 'doctor'));

router.post('/', recordVitals);
router.get('/', getVitals);
router.get('/latest', getLatestVitals);
router.get('/analytics', getVitalsAnalytics);
router.delete('/:id', deleteVitals);

export default router;
