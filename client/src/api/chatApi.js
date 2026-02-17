import API from './axios';

export const createChat = (participantId) => API.post('/chat', { participantId });
export const getMyChats = () => API.get('/chat');
export const getMessages = (chatId, params) => API.get(`/chat/${chatId}/messages`, { params });
export const sendMessageApi = (chatId, data) => API.post(`/chat/${chatId}/messages`, data);
