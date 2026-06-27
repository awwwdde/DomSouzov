import axios from 'axios';
import { SiteContent, Event, NewsArticle, Hall, GalleryImage } from '../types';

const api = axios.create({ baseURL: '/api' });

const extractApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    return detail || error.message || 'Ошибка запроса';
  }
  return error instanceof Error ? error.message : 'Неизвестная ошибка';
};

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

export const subscribeNewsletter = async (email: string): Promise<void> => {
  try {
    await api.post('/subscribe', { email });
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export interface OrganizerRequestPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
}

export const submitOrganizerRequest = async (payload: OrganizerRequestPayload): Promise<void> => {
  try {
    await api.post('/organizers/request', payload);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

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

  // Gallery categories (блоки-темы)
  getGalleryCategories: () => api.get('/admin/gallery-categories').then((r) => r.data),
  createGalleryCategory: (data: unknown) => api.post('/admin/gallery-categories', data).then((r) => r.data),
  updateGalleryCategory: (id: number, data: unknown) => api.put(`/admin/gallery-categories/${id}`, data).then((r) => r.data),
  deleteGalleryCategory: (id: number) => api.delete(`/admin/gallery-categories/${id}`).then((r) => r.data),

  // Partners
  getPartners: () => api.get('/admin/partners').then((r) => r.data),
  createPartner: (data: unknown) => api.post('/admin/partners', data).then((r) => r.data),
  updatePartner: (id: number, data: unknown) => api.put(`/admin/partners/${id}`, data).then((r) => r.data),
  deletePartner: (id: number) => api.delete(`/admin/partners/${id}`).then((r) => r.data),

  // Upload
  uploadFile: async (file: File): Promise<string> => {
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await api.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return r.data.url;
    } catch (error) {
      throw new Error(extractApiErrorMessage(error));
    }
  },

  uploadImage: async (file: File): Promise<string> => {
    return adminApi.uploadFile(file);
  },

  // About — «Дом в кадрах» (scattered photos)
  getAboutPhotos: () => api.get('/admin/about/photos').then((r) => r.data),
  createAboutPhoto: (data: unknown) => api.post('/admin/about/photos', data).then((r) => r.data),
  updateAboutPhoto: (id: number, data: unknown) => api.put(`/admin/about/photos/${id}`, data).then((r) => r.data),
  deleteAboutPhoto: (id: number) => api.delete(`/admin/about/photos/${id}`).then((r) => r.data),

  // About — таймлайн (хронология)
  getAboutTimeline: () => api.get('/admin/about/timeline').then((r) => r.data),
  createAboutTimeline: (data: unknown) => api.post('/admin/about/timeline', data).then((r) => r.data),
  updateAboutTimeline: (id: number, data: unknown) => api.put(`/admin/about/timeline/${id}`, data).then((r) => r.data),
  deleteAboutTimeline: (id: number) => api.delete(`/admin/about/timeline/${id}`).then((r) => r.data),

  // Newsletter
  getSubscribers: () => api.get('/admin/subscribers').then((r) => r.data),

  // Заявки с формы «Организаторам»
  getOrganizerRequests: () => api.get('/admin/organizer-requests').then((r) => r.data),
  updateOrganizerRequest: (id: number, data: unknown) =>
    api.put(`/admin/organizer-requests/${id}`, data).then((r) => r.data),
  deleteOrganizerRequest: (id: number) =>
    api.delete(`/admin/organizer-requests/${id}`).then((r) => r.data),

  changePassword: (current_password: string, new_password: string) =>
    api.post('/admin/change-password', { current_password, new_password }).then((r) => r.data),

  // Администраторы (только супер-админ)
  getAdmins: () => api.get('/admin/admins').then((r) => r.data),
  createAdmin: (email: string, password: string) =>
    api.post('/admin/admins', { email, password }).then((r) => r.data),
  resetAdminPassword: (id: number, password: string) =>
    api.post(`/admin/admins/${id}/reset-password`, { password }).then((r) => r.data),
  deleteAdmin: (id: number) => api.delete(`/admin/admins/${id}`).then((r) => r.data),
};
