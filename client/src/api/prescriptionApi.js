import API from './axios';

export const createPrescription = (data) => API.post('/prescriptions', data);
export const getPrescriptions = (params) => API.get('/prescriptions', { params });
export const getPrescription = (id) => API.get(`/prescriptions/${id}`);
export const updatePrescription = (id, data) => API.put(`/prescriptions/${id}`, data);
