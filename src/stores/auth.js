import { defineStore } from "pinia";
import api from "@/services/api";

// LocalStorage key used everywhere in the app (axios interceptor + stores)
const TOKEN_KEY = "auth_token";

/**
 * Read token from localStorage on app start / refresh.
 * Keeping it in the store allows reactive access (isAuthenticated, etc.).
 */
function loadToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

/**
 * Persist token in localStorage so the session survives page reloads.
 * If token is empty, we remove it.
 */
function saveToken(token) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: loadToken(),
    user: null,
    loading: false,
    error: "",
  }),

  getters: {
    // Simple boolean derived from the token presence
    isAuthenticated: (s) => !!s.token,
  },

  actions: {
    /**
     * Single place to update token in both Pinia + localStorage.
     */
    setToken(token) {
      this.token = token || "";
      saveToken(this.token);
    },

    /**
     * Login: calls backend, stores token, stores user (if returned).
     * Axios interceptor will automatically attach the token to next requests.
     */
    async login({ email, password }) {
      this.loading = true;
      this.error = "";

      try {
        const { data } = await api.post("/auth/login", { email, password });

        const token = data?.token || "";
        if (!token) throw new Error("No token returned by API");

        this.setToken(token);
        this.user = data?.user || null;

        return data;
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || "Login failed";
        this.setToken("");
        this.user = null;
        throw e;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Register: creates the user and logs in directly if backend returns a token.
     */
    async register({ email, password, display_name }) {
      this.loading = true;
      this.error = "";

      try {
        const { data } = await api.post("/auth", { email, password, display_name });

        const token = data?.token || "";
        if (!token) throw new Error("No token returned by API");

        this.setToken(token);
        this.user = data?.user || null;

        return data;
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || "Register failed";
        this.setToken("");
        this.user = null;
        throw e;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout: remove token + reset user state.
     */
    logout() {
      this.setToken("");
      this.user = null;
      this.error = "";
    },
  },
});