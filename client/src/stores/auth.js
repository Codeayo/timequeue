import { defineStore } from 'pinia';
import api from '../api/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isHost: (state) => state.user?.role === 'HOST',
  },
  actions: {
    setAuth(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Set default header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      delete api.defaults.headers.common['Authorization'];
    },
    init() {
      // Rehydrate defaults
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    }
  }
});
