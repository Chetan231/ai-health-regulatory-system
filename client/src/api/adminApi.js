import API from './axios';

// Dashboard
export const getAdminDashboard = () => API.get('/admin/dashboard');

// Users
export const getUsers = (params) => API.get('/admin/users', { params });
export const updateUserStatus = (id, data) => API.put(`/admin/users/${id}/status`, data);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

// Doctors
export const getPendingDoctors = () => API.get('/admin/doctors/pending');
export const verifyDoctor = (id) => API.put(`/admin/doctors/${id}/verify`);

// Departments
export const getDepartments = () => API.get('/admin/departments');
export const createDepartment = (data) => API.post('/admin/departments', data);
export const updateDepartment = (id, data) => API.put(`/admin/departments/${id}`, data);
export const deleteDepartment = (id) => API.delete(`/admin/departments/${id}`);

// Beds
export const getBeds = (params) => API.get('/admin/beds', { params });
export const getBedStats = () => API.get('/admin/beds/stats');
export const createBed = (data) => API.post('/admin/beds', data);
export const updateBed = (id, data) => API.put(`/admin/beds/${id}`, data);
export const deleteBed = (id) => API.delete(`/admin/beds/${id}`);
