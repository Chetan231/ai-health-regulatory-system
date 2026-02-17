import API from './axios';

export const recordVitals = (data) => API.post('/vitals', data);
export const getVitals = (params) => API.get('/vitals', { params });
export const getLatestVitals = () => API.get('/vitals/latest');
export const getVitalsAnalytics = (days) => API.get('/vitals/analytics', { params: { days } });
export const deleteVitals = (id) => API.delete(`/vitals/${id}`);
