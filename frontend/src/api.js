import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (username, password) => API.post('/auth/register', null, { params: { username, password } });
export const login = (username, password) => API.post('/auth/login', null, { params: { username, password } });
export const me = () => API.get('/auth/me');

export const getCards = () => API.get('/cards/');
export const uploadCard = (formData) => API.post('/cards/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCard = (id) => API.delete(`/cards/${id}`);

export const getStories = () => API.get('/stories/');
export const getStory = (id) => API.get(`/stories/${id}`);
export const createStory = (data) => API.post('/stories/', data);
export const updateStory = (id, data) => API.put(`/stories/${id}`, data);
export const deleteStory = (id) => API.delete(`/stories/${id}`);
export const attachCard = (storyId, cardId) => API.post(`/stories/${storyId}/cards/${cardId}`);
export const detachCard = (storyId, cardId) => API.delete(`/stories/${storyId}/cards/${cardId}`);
export const addSegment = (storyId, content) => API.post(`/stories/${storyId}/segments`, null, { params: { content } });
export const editSegment = (storyId, segmentId, content) => API.put(`/stories/${storyId}/segments/${segmentId}`, { content });
export const deleteSegment = (storyId, segmentId) => API.delete(`/stories/${storyId}/segments/${segmentId}`);

export const getSettings = () => API.get('/settings/');
export const updateSettings = (data) => API.put('/settings/', data);

export const generateChunk = (storyId, steering) => {
  const token = localStorage.getItem('token');
  return fetch('/api/generate/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ story_id: storyId, steering }),
  });
};

export const summarizeStory = (storyId) => API.post('/generate/summarize', null, { params: { story_id: storyId } });
