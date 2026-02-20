import express from 'express';
import { getAllDoctors, getDoctor, updateProfile, getMyPatients, getDashboard } from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);

// Protected doctor routes (BEFORE /:id so Express doesn't match "my-patients" as an id)
router.get('/my-patients', protect, authorize('doctor'), getMyPatients);
router.get('/dashboard/stats', protect, authorize('doctor'), getDashboard);
router.put('/profile', protect, authorize('doctor'), updateProfile);

// Public - get single doctor (LAST because /:id catches everything)
router.get('/:id', getDoctor);

export default router;
