import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Shopping Notes API
export const shoppingAPI = {
  getAll: () => api.get('/shopping'),
  create: (data) => api.post('/shopping', data),
  update: (id, data) => api.put(`/shopping/${id}`, data),
  delete: (id) => api.delete(`/shopping/${id}`),
};

// Chores API
export const choresAPI = {
  getAll: () => api.get('/chores'),
  create: (data) => api.post('/chores', data),
  update: (id, data) => api.put(`/chores/${id}`, data),
  delete: (id) => api.delete(`/chores/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Todos API
export const todosAPI = {
  getAll: () => api.get('/todos'),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
  addItem: (id, text) => api.post(`/todos/${id}/items`, { text }),
  updateItem: (id, itemId, data) => api.put(`/todos/${id}/items/${itemId}`, data),
  deleteItem: (id, itemId) => api.delete(`/todos/${id}/items/${itemId}`),
};

// Reminders API
export const remindersAPI = {
  getAll: () => api.get('/reminders'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
};

export default api;
