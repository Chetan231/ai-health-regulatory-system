import API from './axios';

export const createInvoice = (data) => API.post('/billing', data);
export const getInvoices = (params) => API.get('/billing', { params });
export const getInvoice = (id) => API.get(`/billing/${id}`);
export const createOrder = (billingId) => API.post('/billing/create-order', { billingId });
export const verifyPayment = (data) => API.post('/billing/verify-payment', data);
