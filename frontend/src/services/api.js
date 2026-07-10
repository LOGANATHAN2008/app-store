import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
})

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err?.response?.data || err)
)

export const appsApi = {
  getAll: (params) => api.get('/api/apps', { params }),
  getFeatured: () => api.get('/api/apps/featured'),
  getTop: (params) => api.get('/api/apps/top', { params }),
  getById: (id) => api.get(`/api/apps/${id}`),
  create: (data) => api.post('/api/apps', data),
  update: (id, data) => api.put(`/api/apps/${id}`, data),
  delete: (id) => api.delete(`/api/apps/${id}`),
  getReviews: (id) => api.get(`/api/apps/${id}/reviews`),
  postReview: (id, data) => api.post(`/api/apps/${id}/reviews`, data),
  install: (id) => api.post(`/api/apps/${id}/install`),
  uninstall: (id) => api.delete(`/api/apps/${id}/install`),
}

export const searchApi = {
  search: (q, params) => api.get('/api/search', { params: { q, ...params } }),
  trending: () => api.get('/api/search/trending'),
}

export const categoriesApi = {
  getAll: () => api.get('/api/categories'),
  getApps: (slug, params) => api.get(`/api/categories/${slug}/apps`, { params }),
}

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  google: (data) => api.post('/api/auth/google', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  verifyPin: (pin) => api.post('/api/auth/verify-pin', { pin })
}

export const settingsApi = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (data) => api.post('/api/settings', data),
};

export const promoApi = {
  getAds: () => api.get('/api/promotions'),
  updateAds: (data) => api.put('/api/promotions', data),
};

export const uploadApi = {
  icon: (file) => { const fd = new FormData(); fd.append('icon', file); return api.post('/api/upload/icon', fd) },
  screenshots: (files) => { const fd = new FormData(); Array.from(files).forEach(f => fd.append('screenshots', f)); return api.post('/api/upload/screenshots', fd) },
  banner: (file) => { const fd = new FormData(); fd.append('banner', file); return api.post('/api/upload/banner', fd) },
  apk: (file) => { const fd = new FormData(); fd.append('apk', file); return api.post('/api/upload/apk', fd) },
}

export const queueApi = {
  getQueue: (status) => api.get('/api/admin/queue', { params: { status } }),
  getStats: () => api.get('/api/admin/queue/stats'),
  approve: (id) => api.put(`/api/admin/queue/${id}/approve`),
  reject: (id, reason) => api.put(`/api/admin/queue/${id}/reject`, { reason }),
  hold: (id, reason) => api.put(`/api/admin/queue/${id}/hold`, { reason }),
  schedule: (id, date) => api.put(`/api/admin/queue/${id}/schedule`, { date }),
}

export const featuredApi = {
  getFeatured: () => api.get('/api/featured'),
  saveFeatured: (data) => api.put('/api/featured', data),
}

export const updatesApi = {
  pushUpdate: (id, data) => api.put(`/api/apps/${id}/update`, data),
  getHistory: (id) => api.get(`/api/apps/${id}/history`),
}

export const usersApi = {
  getMe: () => api.get('/api/users/me'),        // own profile — safe for any logged-in role
  getAll: (params) => api.get('/api/users', { params }),  // admin only
  updateStatus: (id, status) => api.put(`/api/users/${id}/status`, { status }),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/api/users/${id}`),
  addStaff: (data) => api.post('/api/users/staff', data),
}

export const reviewsApi = {
  getAll: (params) => api.get('/api/reviews', { params }),
  unflag: (id) => api.put(`/api/reviews/${id}/unflag`),
  delete: (id) => api.delete(`/api/reviews/${id}`),
}

export const paymentsApi = {
  createOrder: (data) => api.post('/api/payments/create-order', data),
  verify: (data) => api.post('/api/payments/verify', data),
  getTransactions: () => api.get('/api/payments/transactions'),
  getUserHistory: (userId) => api.get(`/api/payments/history/${userId}`),
}

export const statsApi = {
  getBadges: () => api.get('/api/stats/badges'),
}

export const eventsApi = {
  getAll: () => api.get('/api/events'),
  create: (data) => api.post('/api/events', data),
  generateLink: (eventId) => api.post(`/api/events/${eventId}/links`),
  disableLink: (eventId, linkId) => api.put(`/api/events/${eventId}/links/${linkId}/disable`),
  getSubmissions: (eventId) => api.get('/api/events/submissions', { params: { eventId } }),
  approveSubmission: (id) => api.put(`/api/events/submissions/${id}/approve`),
  rejectSubmission: (id, reason) => api.put(`/api/events/submissions/${id}/reject`, { reason }),
  // Public
  validateLink: (token) => api.get(`/api/events/public/links/${token}`),
  submitApp: (token, data) => api.post(`/api/events/public/links/${token}/submit`, data)
}

export const launchpadApi = {
  // Public
  getUpcoming: (sort = 'date') => api.get(`/api/launchpad?sort=${sort}`),
  vote: (id) => api.post(`/api/launchpad/${id}/vote`),
  notify: (id, email) => api.post(`/api/launchpad/${id}/notify`, { email }),
  
  // Admin
  addApp: (data) => api.post('/api/launchpad', data),
  launchApp: (id) => api.post(`/api/launchpad/${id}/launch`),
  deleteApp: (id) => api.delete(`/api/launchpad/${id}`),
}

export const developerWebsitesApi = {
  getAll: () => api.get('/api/developer-websites'),
  create: (data) => api.post('/api/developer-websites', data),
  delete: (id) => api.delete(`/api/developer-websites/${id}`),
}

export default api
