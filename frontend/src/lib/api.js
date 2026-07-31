import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const apiBaseUrl = rawApiUrl.endsWith('/api')
  ? rawApiUrl.replace(/\/$/, '')
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('webpulse_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('webpulse_token');
      localStorage.removeItem('webpulse_user');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);


// ================= AUTH APIs =================

export const authApi = {
  register: (data) => api.post('/auth/register', data),

  login: (data) => api.post('/auth/login', data),

  verifyOtp: (data) => api.post('/auth/verify-otp', data),

  resendOtp: (data) => api.post('/auth/resend-otp', data),

  me: () => api.get('/auth/me'),

  updateProfile: (data) => api.put('/auth/profile', data),
};


// ================= PROJECT APIs =================

export const projectsApi = {
  list: () => api.get('/projects'),

  get: (id) => api.get(`/projects/${id}`),

  create: (data) => api.post('/projects', data),

  update: (id, data) => api.put(`/projects/${id}`, data),

  delete: (id) => api.delete(`/projects/${id}`),

  chatHistory: (projectId) => api.get(`/projects/${projectId}/chat/history`),

  clearChat: (projectId) => api.delete(`/projects/${projectId}/chat`),

  export: (id, format) => api.get(`/projects/${id}/export`, { params: { format } }),

  scrape: (id) => api.post(`/projects/${id}/scrape`),

  runs: (id) => api.get(`/projects/${id}/runs`),

  data: (id, params) => api.get(`/projects/${id}/data`, { params }),

  changes: (id) => api.get(`/projects/${id}/changes`),

  analytics: (id) => api.get(`/projects/${id}/analytics`),

  history: (id) => api.get(`/projects/${id}/history`),
};


// ================= WEBHOOK APIs =================

export const webhooksApi = {
  list: (projectId) => api.get(`/projects/${projectId}/webhooks`),

  create: (projectId, data) => api.post(`/projects/${projectId}/webhooks`, data),

  remove: (projectId, webhookId) => api.delete(`/projects/${projectId}/webhooks/${webhookId}`),

  test: (projectId, webhookId) => api.post(`/projects/${projectId}/webhooks/${webhookId}/test`),
};


// ================= DOWNLOAD HELPERS =================

export const downloadBlob = (data, filename) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const streamChat = (projectId, message, onChunk, onDone, onError) => {
  const token = localStorage.getItem('webpulse_token');
  const url = `${apiBaseUrl}/projects/${projectId}/chat/stream?message=${encodeURIComponent(message)}`;
  const eventSource = new EventSource(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close();
      onDone?.();
      return;
    }

    onChunk?.(event.data);
  };

  eventSource.onerror = () => {
    eventSource.close();
    onError?.('Streaming failed');
  };
};


// ================= DASHBOARD APIs =================

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
};


// ================= NOTIFICATION APIs =================

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
};


// ================= BILLING APIs =================

export const billingApi = {
  createCheckoutSession: () =>
    api.post('/billing/create-checkout-session'),

  createPortalSession: () =>
    api.post('/billing/create-portal-session'),

  getSubscription: () =>
    api.get('/billing/subscription'),
};


// Default axios instance export
export default api;