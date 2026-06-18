import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
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

export default api;

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  // 2FA
  generate2FA: () => api.post('/auth/2fa/generate'),
  enable2FA: (code) => api.post('/auth/2fa/enable', { code }),
  disable2FA: (code) => api.post('/auth/2fa/disable', { code }),
  verifyLogin2FA: (tempToken, code) => api.post('/auth/login/verify-2fa', { tempToken, code }),
};

// Projects
export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  scrape: (id) => api.post(`/projects/${id}/scrape`),
  runs: (id, params) => api.get(`/projects/${id}/runs`, { params }),
  data: (id, params) => api.get(`/projects/${id}/data`, { params }),
  changes: (id, params) => api.get(`/projects/${id}/changes`, { params }),
  analytics: (id) => api.get(`/projects/${id}/analytics`),
  history: (id) => api.get(`/projects/${id}/history`),
  export: (id, format) => api.get(`/projects/${id}/export`, { params: { format }, responseType: 'blob' }),
  exportRun: (id, runId, format) =>
    api.get(`/projects/${id}/runs/${runId}/export`, { params: { format }, responseType: 'blob' }),
  chatHistory: (id) => api.get(`/projects/${id}/chat`),
  clearChat: (id) => api.delete(`/projects/${id}/chat`),
};

export async function streamChat(projectId, message, onChunk, onDone, onError) {
  const token = localStorage.getItem('webpulse_token');
  const response = await fetch(`/api/projects/${projectId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Chat failed' } }));
    onError?.(err.error?.message || 'Chat failed');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.error) onError?.(data.error);
          else if (data.done) onDone?.();
          else if (data.content) onChunk?.(data.content);
        } catch {
          /* ignore parse errors */
        }
      }
    }
  }
}

// Dashboard
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
};

// Notifications
export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Billing
export const billingApi = {
  createCheckoutSession: () => api.post('/billing/create-checkout-session'),
  createPortalSession: () => api.post('/billing/create-portal-session'),
  getSubscription: () => api.get('/billing/subscription'),
};

// Webhooks
export const webhooksApi = {
  list: (projectId) => api.get(`/projects/${projectId}/webhooks`),
  create: (projectId, data) => api.post(`/projects/${projectId}/webhooks`, data),
  remove: (projectId, webhookId) => api.delete(`/projects/${projectId}/webhooks/${webhookId}`),
  test: (projectId, webhookId) => api.post(`/projects/${projectId}/webhooks/${webhookId}/test`),
};

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
