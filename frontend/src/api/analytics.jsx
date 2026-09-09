import api from './axios';

export const analyticsAPI = {
  getTrafficStats: (params) => api.get('/analytics/traffic/stats', { params }),
  getRealtimeTraffic: (params) => api.get('/analytics/traffic/realtime', { params }),
  getMaliciousTraffic: (params) => api.get('/analytics/traffic/malicious', { params }),
  getTrafficTrends: (params) => api.get('/analytics/traffic/trends', { params }),
  analyzeTrafficLog: (logId) => api.get(`/analytics/traffic/logs/${logId}/analyze`),
  getGeographicAnalysis: (params) => api.get('/analytics/geographic', { params }),
  getProtocolAnalysis: (params) => api.get('/analytics/protocol', { params }),
  getThreatIntelligence: (params) => api.get('/analytics/threat-intelligence', { params }),
};