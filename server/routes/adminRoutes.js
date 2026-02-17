import { Router } from 'express';
import {
  getDashboard, getUsers, updateUserStatus, deleteUser,
  getPendingDoctors, verifyDoctor,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getBeds, createBed, updateBed, deleteBed, getBedStats,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Users
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Doctor verification
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/verify', verifyDoctor);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Beds
router.get('/beds', getBeds);
router.get('/beds/stats', getBedStats);
router.post('/beds', createBed);
router.put('/beds/:id', updateBed);
router.delete('/beds/:id', deleteBed);

export default router;
