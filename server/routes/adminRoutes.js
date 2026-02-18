import express from 'express';
import {
  getDashboard, getDoctors, verifyDoctor, getPatients,
  createDepartment, getDepartments, updateDepartment, deleteDepartment,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/doctors', getDoctors);
router.put('/doctors/:id/verify', verifyDoctor);
router.get('/patients', getPatients);
router.post('/departments', createDepartment);
router.get('/departments', getDepartments);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

export default router;
