import { Router } from 'express';
import {
  bookAppointment, getAppointments, getAppointment,
  updateStatus, getAvailableSlots,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', bookAppointment);
router.get('/', getAppointments);
router.get('/slots/:doctorId/:date', getAvailableSlots);
router.get('/:id', getAppointment);
router.put('/:id/status', updateStatus);

export default router;
