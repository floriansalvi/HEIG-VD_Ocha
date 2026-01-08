import { defineStore } from "pinia";
import api from "@/services/api";

function loadToken() {
  return localStorage.getItem("auth_token") || "";
}
function saveToken(token) {
  if (!token) localStorage.removeItem("auth_token");
  else localStorage.setItem("auth_token", token);
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
    this.setToken(data?.token || "");
    this.user = data?.user || null;
    if (!data?.token) throw new Error("No token returned by API");
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
    this.setToken(data?.token || "");
    this.user = data?.user || null;
    if (!data?.token) throw new Error("No token returned by API");
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

    logout() {
      this.setToken("");
      this.user = null;
    },
  },
});