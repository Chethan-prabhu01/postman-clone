import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Collections
export const collectionsApi = {
  list: () => api.get('/api/collections/'),
  create: (data: any) => api.post('/api/collections/', data),
  update: (id: number, data: any) => api.patch(`/api/collections/${id}`, data),
  delete: (id: number) => api.delete(`/api/collections/${id}`),
  getTree: (id: number) => api.get(`/api/collections/${id}/tree`),
  createFolder: (collectionId: number, data: any) => api.post(`/api/collections/${collectionId}/folders`, data),
  deleteFolder: (collectionId: number, folderId: number) => api.delete(`/api/collections/${collectionId}/folders/${folderId}`),
}

// Requests
export const requestsApi = {
  create: (data: any) => api.post('/api/requests/', data),
  update: (id: number, data: any) => api.patch(`/api/requests/${id}`, data),
  delete: (id: number) => api.delete(`/api/requests/${id}`),
}

// Environments
export const environmentsApi = {
  list: () => api.get('/api/environments/'),
  create: (data: any) => api.post('/api/environments/', data),
  update: (id: number, data: any) => api.patch(`/api/environments/${id}`, data),
  delete: (id: number) => api.delete(`/api/environments/${id}`),
  activate: (id: number) => api.post(`/api/environments/${id}/activate`),
}

// History
export const historyApi = {
  list: (limit = 100) => api.get(`/api/history/?limit=${limit}`),
  get: (id: number) => api.get(`/api/history/${id}`),
  delete: (id: number) => api.delete(`/api/history/${id}`),
  clear: () => api.delete('/api/history/'),
}

// Runner
export const runnerApi = {
  send: (data: any) => api.post('/api/runner/send', data),
}
