import API from './axios';

export const bookAppointment = (data) => API.post('/appointments', data);
export const getAppointments = (params) => API.get('/appointments', { params });
export const getAppointment = (id) => API.get(`/appointments/${id}`);
export const updateAppointmentStatus = (id, data) => API.put(`/appointments/${id}/status`, data);
export const getAvailableSlots = (doctorId, date) => API.get(`/appointments/slots/${doctorId}/${date}`);
