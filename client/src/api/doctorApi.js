import API from './axios';

export const getDoctorDashboard = () => API.get('/doctors/dashboard');
export const getDoctorProfile = () => API.get('/doctors/profile');
export const updateDoctorProfile = (data) => API.put('/doctors/profile', data);
export const updateAvailability = (data) => API.put('/doctors/availability', data);
export const getMyPatients = (params) => API.get('/doctors/my-patients', { params });
export const getPatientDetail = (id) => API.get(`/doctors/patients/${id}`);

// Public
export const listDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => API.get(`/doctors/public/${id}`);
