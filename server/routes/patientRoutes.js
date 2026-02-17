import { Router } from 'express';
import { getDashboard, getProfile, updateProfile, getHealthTimeline } from '../controllers/patientController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(protect, authorize('patient'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/health-timeline', getHealthTimeline);

export default router;
