import axios from 'axios';
import { SiteContent, Event, NewsArticle, Hall, GalleryImage } from '../types';

const api = axios.create({ baseURL: '/api' });

// Auth token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Public
export const getContent = (): Promise<SiteContent> =>
  api.get('/content').then((r) => r.data);

export const getEvents = (): Promise<Event[]> =>
  api.get('/events').then((r) => r.data);

export const getEvent = (id: number): Promise<Event> =>
  api.get(`/events/${id}`).then((r) => r.data);

export const getNews = (): Promise<NewsArticle[]> =>
  api.get('/news').then((r) => r.data);

export const getNewsItem = (id: number): Promise<NewsArticle> =>
  api.get(`/news/${id}`).then((r) => r.data);

export const getHalls = (): Promise<Hall[]> =>
  api.get('/halls').then((r) => r.data);

export const getGallery = (): Promise<GalleryImage[]> =>
  api.get('/gallery').then((r) => r.data);

// Admin Auth
export const adminLogin = (email: string, password: string) =>
  api.post('/admin/login', { email, password }).then((r) => {
    localStorage.setItem('admin_token', r.data.access_token);
    return r.data;
  });

export const adminLogout = () => {
  localStorage.removeItem('admin_token');
};

export const getMe = () =>
  api.get('/admin/me').then((r) => r.data);

// Admin CRUD
export const adminApi = {
  // Settings
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (settings: { key: string; value_ru: string; value_en: string }[]) =>
    api.put('/admin/settings', { settings }).then((r) => r.data),

  // Events
  getEvents: () => api.get('/admin/events').then((r) => r.data),
  createEvent: (data: unknown) => api.post('/admin/events', data).then((r) => r.data),
  updateEvent: (id: number, data: unknown) => api.put(`/admin/events/${id}`, data).then((r) => r.data),
  deleteEvent: (id: number) => api.delete(`/admin/events/${id}`).then((r) => r.data),

  // News
  getNews: () => api.get('/admin/news').then((r) => r.data),
  createNews: (data: unknown) => api.post('/admin/news', data).then((r) => r.data),
  updateNews: (id: number, data: unknown) => api.put(`/admin/news/${id}`, data).then((r) => r.data),
  deleteNews: (id: number) => api.delete(`/admin/news/${id}`).then((r) => r.data),

  // Halls
  getHalls: () => api.get('/admin/halls').then((r) => r.data),
  createHall: (data: unknown) => api.post('/admin/halls', data).then((r) => r.data),
  updateHall: (id: number, data: unknown) => api.put(`/admin/halls/${id}`, data).then((r) => r.data),
  deleteHall: (id: number) => api.delete(`/admin/halls/${id}`).then((r) => r.data),

  // Gallery
  getGallery: () => api.get('/admin/gallery').then((r) => r.data),
  createGallery: (data: unknown) => api.post('/admin/gallery', data).then((r) => r.data),
  updateGallery: (id: number, data: unknown) => api.put(`/admin/gallery/${id}`, data).then((r) => r.data),
  deleteGallery: (id: number) => api.delete(`/admin/gallery/${id}`).then((r) => r.data),

  // Upload
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const r = await api.post('/admin/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data.url;
  },

  changePassword: (current_password: string, new_password: string) =>
    api.post('/admin/change-password', { current_password, new_password }).then((r) => r.data),
};
