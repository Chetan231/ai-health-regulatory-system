import API from './axios';

export const getPatientDashboard = () => API.get('/patients/dashboard');
export const getPatientProfile = () => API.get('/patients/profile');
export const updatePatientProfile = (data) => API.put('/patients/profile', data);
export const getHealthTimeline = (params) => API.get('/patients/health-timeline', { params });
