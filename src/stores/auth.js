// src/stores/auth.js
import { defineStore } from 'pinia';
import api from '../api/client';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('authToken') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        // ⚠️ adapte l’URL / la réponse à ton backend
        const res = await api.post('/auth/login', { email, password });

        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem('authToken', this.token);
      } catch (err) {
        console.error(err);
        this.error =
          err.response?.data?.message || "Impossible de se connecter.";
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        // ⚠️ adapte l’URL / les champs à ton backend
        const res = await api.post('/auth/register', payload);

        // Certains backends renvoient directement token + user, d’autres non.
        // Si le tien ne renvoie rien, tu pourras enchaîner avec login().
        if (res.data.token) {
          this.token = res.data.token;
          this.user = res.data.user;
          localStorage.setItem('authToken', this.token);
        }
      } catch (err) {
        console.error(err);
        this.error =
          err.response?.data?.message || "Impossible de créer le compte.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
    },
  },
});