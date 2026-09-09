import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socApi = {
  // Overview
  getOverview: () => api.get('/soc/overview'),

  // SIEM-Lite Logs
  getSiemEvents: (params = {}) => api.get('/soc/siem/events', { params }),
  ingestSiemLog: (data) => api.post('/soc/siem/ingest', data),

  // MITRE ATT&CK Detection Engineering
  getDetectionRules: () => api.get('/soc/detection-rules'),
  evaluateDetectionRules: (limit = 50) => api.post(`/soc/detection-rules/evaluate?limit=${limit}`),
  toggleDetectionRule: (id, enabled) => api.patch(`/soc/detection-rules/${id}/toggle`, { enabled }),

  // Threat Intelligence Feed
  getThreatIntelIocs: (params = {}) => api.get('/soc/threat-intel/iocs', { params }),
  addThreatIntelIoc: (data) => api.post('/soc/threat-intel/iocs', data),
  matchThreatIntel: (text) => api.post('/soc/threat-intel/match', { text }),

  // Threat Hunting Workspace
  getThreatHunts: (params = {}) => api.get('/soc/hunting', { params }),
  createThreatHunt: (data) => api.post('/soc/hunting', data),
  executeThreatHunt: (id) => api.post(`/soc/hunting/${id}/execute`),
  promoteHuntToRule: (id, data = {}) => api.post(`/soc/hunting/${id}/convert-to-rule`, data),

  // Time Integrity & Clock Synchronization (A.8.17)
  getTimeIntegrity: () => api.get('/soc/time-integrity'),
  triggerNtpSync: (server) => api.post('/soc/time-integrity/sync', { server }),

  // Tamper-Evident Audit Trails & RBAC
  getAuditLogs: (params = {}) => api.get('/soc/audit-logs', { params }),
  verifyAuditLog: (id) => api.get(`/soc/audit-logs/${id}/verify`),

  // Tiered Retention & Forensic Archive (A.8.15)
  getRetentionStatus: () => api.get('/soc/retention-status'),
  createArchivePackage: (notes) => api.post('/soc/retention/archive', { notes }),

  // 7-Phase Incident Lifecycle & SOAR Playbooks (A.5.24-A.5.27)
  updateCasePhase: (id, data) => api.patch(`/soc/cases/${id}/lifecycle`, data),
  executeCasePlaybook: (id, data) => api.post(`/soc/cases/${id}/playbook`, data),

  // Operational Runbooks
  getRunbooks: () => api.get('/soc/runbooks')
};

export default socApi;
