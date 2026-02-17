import API from './axios';

export const getNotifications = (params) => API.get('/notifications', { params });
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
