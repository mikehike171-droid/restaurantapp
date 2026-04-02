// src/lib/api.ts
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://50.16.16.127:5000/api/v1';

export const api = axios.create({ baseURL: API_BASE });

// Attach JWT token on admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Location APIs ----
export const locationApi = {
  getAll: () => api.get('/locations').then(r => r.data),
  getById: (id: any) => api.get(`/locations/${id}`).then(r => r.data),
  getByToken: (token: string) => api.get(`/locations/token/${token}`).then(r => r.data),
  getStats: (id: any) => api.get(`/locations/${id}/stats`).then(r => r.data),
  create: (data: any) => api.post('/locations', data).then(r => r.data),
  update: (id: any, data: any) => api.put(`/locations/${id}`, data).then(r => r.data),
};

// ---- Food Item APIs ----
export const foodApi = {
  getMenu: (locationId: any) => api.get(`/food-items/menu/${locationId}`).then(r => r.data),
  getByLocation: (locationId: any, categoryId?: any) =>
    api.get(`/food-items/location/${locationId}`, { params: { categoryId } }).then(r => r.data),
  create: (data: any) => api.post('/food-items', data).then(r => r.data),
  update: (id: any, data: any) => api.put(`/food-items/${id}`, data).then(r => r.data),
  toggle: (id: any) => api.patch(`/food-items/${id}/toggle-availability`).then(r => r.data),
  toggleVisibility: (id: any) => api.patch(`/food-items/${id}/toggle-visibility`).then(r => r.data),
  delete: (id: any) => api.delete(`/food-items/${id}`).then(r => r.data),
};

// ---- Order APIs ----
export const orderApi = {
  place: (data: any) => api.post('/orders', data).then(r => r.data),
  getById: (id: any) => api.get(`/orders/${id}`).then(r => r.data),
  getByLocation: (locationId: any, status?: string) =>
    api.get(`/orders/location/${locationId}`, { params: { status } }).then(r => r.data),
  getLive: (locationId: any) => api.get(`/orders/location/${locationId}/live`).then(r => r.data),
  getTables: (locationId: any) => api.get(`/orders/location/${locationId}/tables`).then(r => r.data),
  createTable: (locationId: any, data: any) => api.post(`/orders/location/${locationId}/tables`, data).then(r => r.data),
  updateTable: (id: any, data: any) => api.put(`/orders/tables/${id}`, data).then(r => r.data),
  deleteTable: (id: any) => api.delete(`/orders/tables/${id}`).then(r => r.data),
  updateStatus: (id: any, status: string) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
  updateDetails: (id: any, data: any) => api.patch(`/orders/${id}/details`, data).then(r => r.data),
};

export const userApi = {
  getAll: () => api.get('/users').then(r => r.data),
  getById: (id: string) => api.get(`/users/${id}`).then(r => r.data),
  create: (data: any) => api.post('/users', data).then(r => r.data),
  update: (id: any, data: any) => api.put(`/users/${id}`, data).then(r => r.data),
  delete: (id: any) => api.delete(`/users/${id}`).then(r => r.data),
};

// ---- QR Code APIs ----
export const qrApi = {
  generate: (locationId: any) => api.get(`/qr-codes/generate/${locationId}`).then(r => r.data),
  getDownloadUrl: (locationId: any) => `${API_BASE}/qr-codes/download/${locationId}`,
};

// ---- Role APIs ----
export const roleApi = {
  getAll: () => api.get('/roles').then(r => r.data),
  getById: (id: string) => api.get(`/roles/${id}`).then(r => r.data),
  create: (data: any) => api.post('/roles', data).then(r => r.data),
  update: (id: any, data: any) => api.put(`/roles/${id}`, data).then(r => r.data),
  delete: (id: any) => api.delete(`/roles/${id}`).then(r => r.data),
  getPermissions: () => api.get('/roles/permissions').then(r => r.data),
};

// ---- Auth APIs ----
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data),
};

// ---- Pincode APIs ----
export const pincodeApi = {
  // Admin
  getAll: () => api.get('/admin/pincodes').then(r => r.data),
  create: (data: any) => api.post('/admin/pincodes', data).then(r => r.data),
  update: (id: any, data: any) => api.put(`/admin/pincodes/${id}`, data).then(r => r.data),
  remove: (id: any) => api.delete(`/admin/pincodes/${id}`).then(r => r.data),
  toggleStatus: (id: any) => api.patch(`/admin/pincodes/${id}/status`).then(r => r.data),
  bulkCreate: (rows: any[]) => api.post('/admin/pincodes/bulk', { rows }).then(r => r.data),
  // Customer / Public
  check: (pincode: string) => api.get(`/pincodes/check?pincode=${pincode}`).then(r => r.data),
  getBranch: (pincode: string) => api.get(`/pincodes/branch?pincode=${pincode}`).then(r => r.data),
  suggest: (q: string) => api.get(`/pincodes/suggest?q=${q}`).then(r => r.data),
  notify: (data: any) => api.post('/pincodes/notify', data).then(r => r.data),
  geocode: (lat: number, lng: number) => api.get(`/geocode?lat=${lat}&lng=${lng}`).then(r => r.data),
};

// ---- Category APIs ----
export const categoryApi = {
  getAll: () => api.get('/categories').then(r => r.data),
  create: (data: FormData) => api.post('/categories', data).then(r => r.data),
  update: (id: any, data: FormData) => api.put(`/categories/${id}`, data).then(r => r.data),
  delete: (id: any) => api.delete(`/categories/${id}`).then(r => r.data),
};
// ---- Offer APIs ----
export const offerApi = {
  getAll: () => api.get('/offers/admin').then(r => r.data),
  getActive: () => api.get('/offers').then(r => r.data),
  create: (data: any) => api.post('/offers', data).then(r => r.data),
  update: (id: any, data: any) => api.put(`/offers/${id}`, data).then(r => r.data),
  delete: (id: any) => api.delete(`/offers/${id}`).then(r => r.data),
};
