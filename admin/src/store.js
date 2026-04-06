import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const useAdminStore = create(
  persist(
    (set, get) => ({
      user: null, token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      sidebarOpen: true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
    }),
    { name: 'admin-store', partialize: s => ({ user: s.user, token: s.token }) }
  )
);

const api = axios.create({ baseURL: '/api', timeout: 15000 });
api.interceptors.request.use(config => {
  const token = useAdminStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) { useAdminStore.getState().logout(); window.location.href = '/login'; }
  return Promise.reject(err);
});
export default api;
