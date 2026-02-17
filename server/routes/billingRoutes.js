import { Router } from 'express';
import { createInvoice, getInvoices, getInvoice, createOrder, verifyPayment } from '../controllers/billingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;
