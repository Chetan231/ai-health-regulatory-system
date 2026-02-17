import { Router } from 'express';
import {
  createPrescription, getPrescriptions, getPrescription, updatePrescription,
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(protect);

router.post('/', authorize('doctor'), createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescription);
router.put('/:id', authorize('doctor'), updatePrescription);

export default router;
