<template>
  <div class="phone-wrapper">
    <div class="phone-shell">
      <!-- Main scrollable content -->
      <div class="phone-content">
        <RouterView />
      </div>

      <!-- Bottom navigation (hidden on auth pages) -->
      <BottomNav v-if="showBottomNav" />

      <!-- Global overlay: displayed when a new product is pushed via WebSocket -->
      <NewProductOverlay
        :open="newProductOpen"
        :product="newProduct"
        @close="newProductOpen = false"
      />
    </div>
  </div>
</template>

<script setup>
import { RouterView, useRoute } from "vue-router";
import { computed, ref, onMounted, onBeforeUnmount } from "vue";

import BottomNav from "@/components/ui/BottomNav.vue";
import NewProductOverlay from "@/components/overlays/NewProductOverlay.vue";

/* ======================================================
   ROUTING / LAYOUT
   ====================================================== */

const route = useRoute();

/**
 * Hide bottom navigation on authentication pages
 */
const showBottomNav = computed(() => {
  return !["login", "register"].includes(route.name);
});

/* ======================================================
   NEW PRODUCT OVERLAY STATE
   ====================================================== */

const newProductOpen = ref(false);
const newProduct = ref(null);

/* ======================================================
   GLOBAL WEBSOCKET CONNECTION
   ====================================================== */

/**
 * Single WebSocket connection for the whole application.
 * Used to receive real-time backend events (e.g. new product).
 */

let socket = null;
let reconnectTimer = null;

// Backend WebSocket endpoint (Render)
const WS_URL = "wss://heig-vd-ocha-api.onrender.com";

/**
 * Establish WebSocket connection with automatic reconnection.
 */
function connectWebSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("[WS] connected");
  };

  socket.onmessage = (event) => {
    let data = event.data;

    // Backend may send JSON or plain text
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    /**
     * Expected payload example:
     * {
     *   type: "new_product",
     *   product: { name: "Matcha Latte" }
     * }
     */
    if (data?.type === "new_product" && data?.product) {
      newProduct.value = data.product;
      newProductOpen.value = true;
    }
  };

  socket.onerror = (err) => {
    console.error("[WS] error", err);
  };

  socket.onclose = () => {
    console.warn("[WS] disconnected, retrying…");
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectWebSocket, 1500);
  };
}

/* ======================================================
   LIFECYCLE
   ====================================================== */

onMounted(() => {
  connectWebSocket();
});

onBeforeUnmount(() => {
  clearTimeout(reconnectTimer);
  if (socket) socket.close();
});
</script>