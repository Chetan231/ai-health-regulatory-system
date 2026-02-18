import express from 'express';
import { getAllDoctors, getDoctor, updateProfile, getMyPatients, getDashboard } from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/:id', getDoctor);

router.use(protect, authorize('doctor'));
router.put('/profile', updateProfile);
router.get('/my-patients', getMyPatients);
router.get('/dashboard/stats', getDashboard);

export default router;
