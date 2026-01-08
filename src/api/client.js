// src/api/client.js
import axios from "axios";

const client = axios.create({
  // Important: ici on met /api/v1 pour que tes appels soient "/auth", "/orders", etc.
  baseURL: import.meta.env.VITE_API_URL || "https://heig-vd-ocha-api.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  // ✅ même clé partout
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;