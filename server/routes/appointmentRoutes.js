import express from 'express';
import {
  createAppointment, getAppointments, getAppointment,
  updateAppointment, cancelAppointment, getAvailableSlots,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/slots', getAvailableSlots);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

export default router;
