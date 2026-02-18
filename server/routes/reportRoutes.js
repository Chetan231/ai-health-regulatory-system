import express from 'express';
import { createReport, getReports, getReport, updateReport, uploadFile, deleteReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();
router.use(protect);

router.post('/', authorize('doctor'), createReport);
router.get('/', getReports);
router.get('/:id', getReport);
router.put('/:id', authorize('doctor'), updateReport);
router.post('/:id/upload', authorize('doctor'), upload.single('file'), uploadFile);
router.delete('/:id', authorize('doctor', 'admin'), deleteReport);

export default router;
