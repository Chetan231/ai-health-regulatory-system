import API from './axios';

export const symptomCheck = (data) => API.post('/ai/symptom-check', data);
export const diagnosisAssist = (data) => API.post('/ai/diagnosis-assist', data);
export const reportSummary = (data) => API.post('/ai/report-summary', data);
export const riskAssessment = (data) => API.post('/ai/risk-assessment', data);
export const healthTips = () => API.post('/ai/health-tips');

// Lab Reports
export const createLabReport = (data) => API.post('/lab-reports', data);
export const getLabReports = (params) => API.get('/lab-reports', { params });
export const getLabReport = (id) => API.get(`/lab-reports/${id}`);
