<template>
  <div class="cart-page">
    <!-- HEADER: back button + screen title -->
    <header class="cart-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="cart-title">Order</h1>
      <span class="cart-header-spacer"></span>
    </header>

    <!-- STORES: loading + error states -->
    <p v-if="storesLoading" class="hint">Loading stores…</p>
    <p v-if="storesError" class="error">{{ storesError }}</p>

    <!-- ORDERS: loading + empty + error states -->
    <p v-if="ordersLoading" class="hint">Loading your orders…</p>
    <p v-else-if="!ordersLoading && activeOrders.length === 0" class="hint">
      No orders in progress
    </p>
    <p v-if="ordersError" class="error">{{ ordersError }}</p>

    <!-- ACTIVE ORDERS (DB): "en préparation" + "prête" only -->
    <section v-if="activeOrders.length" class="ongoing-list">
      <article v-for="order in activeOrders" :key="order._id" class="ongoing-card">
        <div class="ongoing-top">
          <div class="ongoing-title-wrap">
            <p class="ongoing-title">Ongoing order</p>

            <!-- Status pill: dot + label -->
            <div class="ongoing-status">
              <span
                class="ongoing-dot"
                :class="{ 'ongoing-dot--ready': statusLower(order.status) === 'prête' }"
              ></span>

              <!-- UI shows EN status, DB keeps FR -->
              <span class="ongoing-status-text">
                {{ statusLabelEn(order.status) }}
              </span>
            </div>
          </div>

          <!-- Total displayed once (top right) -->
          <p class="ongoing-total">{{ formatCHF(orderComputedTotal(order)) }} CHF</p>
        </div>

        <!-- Store + pickup time -->
        <div class="ongoing-meta">
          <div class="ongoing-meta-row">
            <span class="ongoing-ico">📍</span>
            <span class="ongoing-meta-text">{{ shopLabel(order) }}</span>
          </div>

          <div class="ongoing-meta-row">
            <span class="ongoing-ico">⏰</span>
            <span class="ongoing-meta-text">Pick up at {{ pickupLabel(order) }}</span>
          </div>
        </div>

        <!-- Short items summary (loaded per order) -->
        <div class="ongoing-bottom">
          <p class="ongoing-summary">{{ orderSummary(order) }}</p>
          <!-- duplicated bottom price intentionally removed -->
        </div>
      </article>
    </section>

    <!-- LOCAL CART (Pinia + localStorage) -->
    <section class="cart-list">
      <article v-for="item in cartItems" :key="item.key" class="cart-item">
        <div class="cart-item-main">
          <!-- Thumbnail (optional) -->
          <div class="cart-thumb">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="cart-thumb-img"
              loading="lazy"
              @error="item.imageUrl = ''"
            />
          </div>

          <!-- Product info -->
          <div class="cart-item-info">
            <p class="cart-item-name">{{ item.name }}</p>
            <p class="cart-item-size">Size: {{ item.size }}</p>
          </div>

          <!-- Line total -->
          <p class="cart-item-price">{{ formatCHF(item.lineTotal) }} CHF</p>
        </div>

        <!-- Unit price + quantity controls -->
        <div class="cart-item-meta-row">
          <p class="cart-item-meta">{{ formatCHF(item.unitPrice) }} CHF / unit</p>

          <div class="cart-qty-controls">
            <button
              class="qty-btn"
              type="button"
              @click="decrease(item)"
              :disabled="item.quantity <= 1"
            >
              −
            </button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button class="qty-btn" type="button" @click="increase(item)">+</button>

            <button class="cart-remove-btn" type="button" @click="remove(item)">
              Remove
            </button>
          </div>
        </div>
      </article>

      <!-- Empty cart state -->
      <p v-if="cartItems.length === 0" class="hint" style="text-align:center;">
        Your cart is empty.
      </p>
    </section>

    <!-- CHECKOUT SUMMARY -->
    <section class="cart-summary">
      <div class="cart-total-line">
        <span>Total</span>
        <span class="cart-total-amount">{{ formatCHF(totalPrice) }} CHF</span>
      </div>

      <!-- Store selection -->
      <button
        class="cart-choose-btn"
        type="button"
        :disabled="cartItems.length === 0"
        @click="openStoreOverlay"
      >
        <div class="cart-choose-main">
          <span>Choose store</span>
          <span class="cart-choose-sub">{{ selectedStoreLabel }}</span>
        </div>
      </button>

      <!-- Pickup time selection -->
      <button
        class="cart-choose-btn"
        type="button"
        :disabled="cartItems.length === 0"
        @click="openTimeOverlay"
      >
        <div class="cart-choose-main">
          <span>Choose time</span>
          <span class="cart-choose-sub">{{ selectedTimeLabel }}</span>
        </div>
      </button>

      <!-- Continue to order summary screen -->
      <button
        class="cart-place-btn"
        type="button"
        :disabled="cartItems.length === 0 || !selectedStore || !selectedTime"
        @click="goToOrderSummary"
      >
        Continue
      </button>
    </section>

    <!-- OVERLAYS: store + time pickers -->
    <StoreSelectOverlay
      v-if="showStoreOverlay"
      :stores="stores"
      :selected-id="selectedStore?._id || null"
      @close="showStoreOverlay = false"
      @select="handleStoreSelected"
    />

    <TimeSelectOverlay
      v-if="showTimeOverlay"
      :times="availableTimes"
      :selected-time="selectedTime"
      :store-selected="!!selectedStore"
      @close="showTimeOverlay = false"
      @select="handleTimeSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onActivated } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";

import StoreSelectOverlay from "@/components/overlays/StoreSelectOverlay.vue";
import TimeSelectOverlay from "@/components/overlays/TimeSelectOverlay.vue";

const router = useRouter();
const cart = useCartStore();
const auth = useAuthStore();

/* ---------------- helpers ---------------- */

/** Format CHF numbers (UI adds "CHF" separately in most places). */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

/** Convert a date to "HH:mm" (used for pickup time display). */
function toHHMM(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Normalize status for comparisons. */
function statusLower(s) {
  return String(s || "").toLowerCase().trim();
}

/** FR -> EN mapping for the UI (backend remains in FR). */
const STATUS_TO_EN = {
  "en préparation": "In preparation",
  "prête": "Ready",
  "récupérée": "Picked up",
};
function statusLabelEn(status) {
  const s = String(status || "en préparation").toLowerCase().trim();
  return STATUS_TO_EN[s] || "In preparation";
}

/** Convert "HH:mm" into minutes since midnight. */
function minutesOf(hhmm) {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/** Round a date up to the next step (ex: next 15 min). */
function ceilToNextStepMinutes(date, step = 15) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const stepMs = step * 60 * 1000;
  return new Date(Math.ceil(d.getTime() / stepMs) * stepMs);
}

/* ---------------- local cart (Pinia) ---------------- */

/**
 * UI-friendly cart items:
 * - adds a stable key (productId + size)
 * - computes line totals
 */
const cartItems = computed(() => {
  const items = Array.isArray(cart.items) ? cart.items : [];
  return items.map((it) => ({
    key: `${it.productId}-${it.size}`,
    productId: it.productId,
    name: it.name,
    size: it.size,
    unitPrice: Number(it.unitPrice) || 0,
    quantity: Number(it.quantity) || 1,
    imageUrl: it.imageUrl || "",
    lineTotal: (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
  }));
});

const totalPrice = computed(() => Number(cart.totalAmount) || 0);

/** Quantity controls rely on the cart store to persist changes. */
function increase(item) {
  cart.setQuantity(item.productId, item.size, item.quantity + 1);
}
function decrease(item) {
  cart.setQuantity(item.productId, item.size, item.quantity - 1);
}
function remove(item) {
  cart.removeItem(item.productId, item.size);
}

/* ---------------- stores (DB) ---------------- */

const stores = ref([]);
const storesLoading = ref(false);
const storesError = ref("");

async function loadStores() {
  storesLoading.value = true;
  storesError.value = "";
  try {
    const { data } = await api.get("/stores", {
      params: { active: "true", page: 1, limit: 50 },
    });
    stores.value = Array.isArray(data?.stores) ? data.stores : [];
  } catch (e) {
    storesError.value = e?.response?.data?.message || "Failed to load stores";
  } finally {
    storesLoading.value = false;
  }
}

/* ---------------- orders (DB) ---------------- */

const ordersLoading = ref(false);
const ordersError = ref("");
const myOrders = ref([]);

/** Cache items per orderId to avoid refetching on every render. */
const orderItemsById = ref({});

async function loadMyOrders() {
  ordersError.value = "";
  myOrders.value = [];

  // No API call if user isn't authenticated
  if (!auth.isAuthenticated) return;

  ordersLoading.value = true;
  try {
    const { data } = await api.get("/users/orders", { params: { page: 1, limit: 20 } });
    myOrders.value = Array.isArray(data?.orders) ? data.orders : [];
  } catch (e) {
    console.error("Error loading orders:", e);
    ordersError.value = e?.response?.data?.message || "Failed to load orders";
  } finally {
    ordersLoading.value = false;
  }
}

/** Active orders = everything except "récupérée". */
const activeOrders = computed(() => {
  const list = Array.isArray(myOrders.value) ? myOrders.value : [];
  return list.filter((o) => statusLower(o?.status) !== "récupérée");
});

/**
 * Lazy-load order items (per order) and store them in a local cache.
 * This is used for summaries + computed totals.
 */
async function ensureOrderItemsLoaded(orderId) {
  if (!orderId) return;
  if (orderItemsById.value[orderId]) return;

  try {
    const { data } = await api.get(`/orders/${orderId}/items`);
    const raw = Array.isArray(data?.items) ? data.items : [];

    orderItemsById.value = {
      ...orderItemsById.value,
      [orderId]: raw.map((it, idx) => ({
        _key: it?._id || String(idx),
        name: it?.product_name || it?.product_id?.name || "Product",
        quantity: Number(it?.quantity) || 1,
        unitPrice: Number(it?.final_price_chf) || 0,
      })),
    };
  } catch (e) {
    console.error("Error loading items for order", orderId, e);
    orderItemsById.value = { ...orderItemsById.value, [orderId]: [] };
  }
}

/**
 * When active orders change, ensure item data is loaded for each order.
 * immediate: true => runs once on mount as well.
 */
watch(
  activeOrders,
  (orders) => {
    for (const o of orders) ensureOrderItemsLoaded(o?._id);
  },
  { immediate: true }
);

/** Format pickup time for a given order. */
function pickupLabel(order) {
  return order?.pickup ? toHHMM(order.pickup) : "—";
}

/** Store label uses populated store_id with an optional city. */
function shopLabel(order) {
  const s = order?.store_id;
  if (!s) return "—";
  const city = s?.address?.city;
  return city ? `${s.name} — ${city}` : s.name;
}

/** Get cached items for one order. */
function orderItems(order) {
  const id = order?._id;
  if (!id) return [];
  return Array.isArray(orderItemsById.value[id]) ? orderItemsById.value[id] : [];
}

/**
 * Compute the order total:
 * - prefer items sum if items are loaded
 * - fallback to backend total_price_chf if available
 */
function orderComputedTotal(order) {
  const items = orderItems(order);
  if (items.length) {
    return items.reduce((sum, it) => {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unitPrice) || 0;
      return sum + p * q;
    }, 0);
  }
  const fallback = Number(order?.total_price_chf);
  return Number.isFinite(fallback) ? fallback : 0;
}

/**
 * Build a short summary:
 * - group by product name
 * - show max 3 items, then "and X more"
 */
function orderSummary(order) {
  const items = orderItems(order);
  if (!items.length) return "—";

  const grouped = new Map();
  for (const it of items) {
    const name = it.name || "Product";
    grouped.set(name, (grouped.get(name) || 0) + (Number(it.quantity) || 1));
  }

  const parts = Array.from(grouped.entries())
    .slice(0, 3)
    .map(([name, qty]) => (qty > 1 ? `${name} (×${qty})` : name));

  if (grouped.size > 3) return `${parts.join(", ")}, and ${grouped.size - 3} more`;
  return parts.join(", ");
}

/* ---------------- store/time selection ---------------- */

const selectedStore = ref(null);
const selectedTime = ref("");

/** Human-readable store label for the selection button. */
const selectedStoreLabel = computed(() => {
  if (!selectedStore.value) return "No store selected";
  const city = selectedStore.value?.address?.city || "";
  return city ? `${selectedStore.value.name}, ${city}` : selectedStore.value.name;
});

/** Human-readable time label for the selection button. */
const selectedTimeLabel = computed(() =>
  selectedTime.value ? selectedTime.value : "No time selected"
);

/**
 * Read today's opening hours from the store document.
 * Assumes opening_hours is an array of 7 entries, indexed by JS day (0=Sunday).
 */
function openingHoursForToday(store) {
  const oh = store?.opening_hours;
  if (!Array.isArray(oh) || oh.length < 7) return null;
  const day = new Date().getDay();
  const range = oh[day];
  if (!Array.isArray(range) || range.length < 2) return null;
  const [open, close] = range;
  if (!open || !close) return null;
  return { open, close };
}

/**
 * Generate pickup times every 15 minutes:
 * - inside opening hours
 * - starting from the next quarter-hour from "now"
 */
const availableTimes = computed(() => {
  const s = selectedStore.value;
  if (!s) return [];

  const oh = openingHoursForToday(s);
  if (!oh) return [];

  const openMin = minutesOf(oh.open);
  const closeMin = minutesOf(oh.close);
  if (openMin == null || closeMin == null) return [];
  if (closeMin <= openMin) return [];

  const start = ceilToNextStepMinutes(new Date(), 15);
  if (!start) return [];

  const startMin = start.getHours() * 60 + start.getMinutes();
  const firstMin = Math.max(openMin, startMin);

  const out = [];
  for (let m = firstMin; m <= closeMin; m += 15) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
  }
  return out;
});

/** Reset selected time if it becomes invalid after changing store/hours. */
watch([selectedStore, availableTimes], () => {
  if (selectedTime.value && !availableTimes.value.includes(selectedTime.value)) {
    selectedTime.value = "";
  }
});

/* ---------------- overlays ---------------- */

const showStoreOverlay = ref(false);
const showTimeOverlay = ref(false);

function openStoreOverlay() {
  showStoreOverlay.value = true;
}
function openTimeOverlay() {
  showTimeOverlay.value = true;
}

/** Accept either a store object or a storeId from the overlay component. */
function handleStoreSelected(storeOrId) {
  const s =
    typeof storeOrId === "string"
      ? stores.value.find((x) => x?._id === storeOrId) || null
      : storeOrId || null;

  selectedStore.value = s;
  selectedTime.value = "";
  showStoreOverlay.value = false;
}

function handleTimeSelected(time) {
  selectedTime.value = time || "";
  showTimeOverlay.value = false;
}

/* ---------------- navigation ---------------- */

function goBack() {
  router.back();
}

/**
 * Continue to the OrderSummary screen:
 * passing selection via query params keeps the flow simple for the UI.
 */
function goToOrderSummary() {
  router.push({
    name: "order-summary",
    query: {
      storeId: selectedStore.value?._id,
      storeName: selectedStore.value?.name,
      time: selectedTime.value,
    },
  });
}

/* ---------------- lifecycle ---------------- */

/** Lightweight refresh when returning to this view (keep-alive). */
async function refreshOrdersLight() {
  await loadMyOrders();
}

onMounted(async () => {
  await loadStores();
  await loadMyOrders();
});

onActivated(() => {
  refreshOrdersLight();
});
</script>

<style scoped>
.hint {
  margin: 0 16px 10px;
  font-size: 12px;
  color: #8b8375;
}
.error {
  margin: 0 16px 10px;
  font-size: 12px;
  color: #b00020;
}

/* list container */
.ongoing-list {
  margin: 0;
  padding: 0;
}

/* ongoing */
.ongoing-card {
  margin: 12px 16px;
  padding: 14px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.07);
}
.ongoing-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.ongoing-title {
  margin: 0;
  font-weight: 800;
  font-size: 14px;
}
.ongoing-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
  color: #6d655a;
}
.ongoing-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #5f8f3e; /* in preparation */
}
.ongoing-dot--ready {
  background: #f0b429; /* ready */
}
.ongoing-total {
  margin: 0;
  font-weight: 800;
  font-size: 14px;
}
.ongoing-meta {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}
.ongoing-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.ongoing-bottom {
  margin-top: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.ongoing-summary {
  margin: 0;
  font-size: 12px;
  color: #6d655a;
  line-height: 1.3;
  max-width: 100%;
}

/* cart thumbs */
.cart-thumb {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #d4e6b8;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.cart-item-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 6px;
}
.cart-qty-controls {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.cart-remove-btn {
  margin-left: 8px;
  border: none;
  background: transparent;
  color: #8b8375;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}
</style>