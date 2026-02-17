import { Router } from 'express';
import {
  getDashboard, getProfile, updateDoctorProfile, updateAvailability,
  listDoctors, getDoctorById, getMyPatients, getPatientDetail,
} from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

// Public routes
router.get('/', listDoctors);
router.get('/public/:id', getDoctorById);

// Protected doctor routes
router.get('/dashboard', protect, authorize('doctor'), getDashboard);
router.get('/profile', protect, authorize('doctor'), getProfile);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), updateAvailability);
router.get('/my-patients', protect, authorize('doctor'), getMyPatients);
router.get('/patients/:patientId', protect, authorize('doctor'), getPatientDetail);

export default router;
