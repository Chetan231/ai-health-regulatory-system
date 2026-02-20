import express from 'express';
import { createInvoice, getInvoices, updateInvoice, getInvoice, payInvoice } from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.post('/', authorize('doctor', 'admin'), createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.put('/:id', authorize('doctor', 'admin'), updateInvoice);
router.post('/:id/pay', authorize('patient'), payInvoice);

export default router;
