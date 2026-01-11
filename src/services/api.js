import axios from "axios";

const TOKEN_KEY = "auth_token";

// Base URL:
// - If VITE_API_URL is set, we use it.
// - Otherwise we fallback to the deployed API (or localhost if you prefer).
const RAW_BASE = import.meta.env.VITE_API_URL || "https://heig-vd-ocha-api.onrender.com";
const base = RAW_BASE.replace(/\/$/, ""); // remove trailing slash

// Ensure we always end on /api/v1 exactly once.
const baseURL = base.endsWith("/api/v1") ? base : `${base}/api/v1`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT token on every request (if present)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;

  return config;
});

export default api;