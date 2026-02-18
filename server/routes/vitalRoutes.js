import express from 'express';
import { recordVital, getVitals, getVitalTrends, deleteVital } from '../controllers/vitalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('patient'));

router.post('/', recordVital);
router.get('/', getVitals);
router.get('/trends', getVitalTrends);
router.delete('/:id', deleteVital);

export default router;
