// src/main.js

// Core Vue API
import { createApp } from "vue";

// State management (Pinia)
import { createPinia } from "pinia";

// Root component
import App from "./App.vue";

// Vue Router instance
import router from "./router";

// Global styles (design system, layout, components)
import "./assets/main.css";

// Leaflet styles (required for maps)
import "leaflet/dist/leaflet.css";

/**
 * Create Vue application instance
 */
const app = createApp(App);

/**
 * Register global plugins
 * - Pinia: global state management
 * - Router: client-side navigation
 */
app.use(createPinia());
app.use(router);

/**
 * Mount the app to the DOM
 * (#app is defined in index.html)
 */
app.mount("#app");