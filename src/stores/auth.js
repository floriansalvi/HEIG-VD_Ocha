import { defineStore } from "pinia";
import api from "@/services/api";

const TOKEN_KEY = "auth_token";

function loadToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
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
    isAuthenticated: (s) => !!s.token,
  },

  actions: {
    setToken(token) {
      this.token = token || "";
      saveToken(this.token);
    },

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

    // ✅ logout = on détruit le token + user
    logout() {
      this.setToken("");
      this.user = null;
      this.error = "";
    },
  },
});