import api from './axios';

export const alertsAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getAlertById: (id) => api.get(`/alerts/${id}`),
  createAlert: (alertData) => api.post('/alerts', alertData),
  updateAlert: (id, alertData) => api.put(`/alerts/${id}`, alertData),
  acknowledgeAlert: (id, data) => api.put(`/alerts/${id}/acknowledge`, data),
  resolveAlert: (id, data) => api.put(`/alerts/${id}/resolve`, data),
  closeAlert: (id) => api.put(`/alerts/${id}/close`),
  assignAlert: (id, data) => api.put(`/alerts/${id}/assign`, data),
  addNote: (id, data) => api.post(`/alerts/${id}/notes`, data),
  getAlertStatistics: (params) => api.get('/alerts/stats', { params }),
  bulkUpdateAlerts: (data) => api.post('/alerts/bulk-update', data),
};