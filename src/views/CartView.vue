<!-- src/views/CartView.vue -->
<template>
  <div class="cart-page">
    <!-- HEADER -->
    <header class="cart-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="cart-title">Order</h1>
      <span class="cart-header-spacer"></span>
    </header>

    <!-- LOADING / ERROR: stores -->
    <p v-if="storesLoading" class="hint">Loading stores…</p>
    <p v-if="storesError" class="error">{{ storesError }}</p>

    <!-- ✅ ONGOING ORDER (depuis DB) -->
    <section v-if="ongoingOrder" class="ongoing-card">
      <div class="ongoing-top">
        <div class="ongoing-title-wrap">
          <p class="ongoing-title">Ongoing order</p>
          <div class="ongoing-status">
            <span class="ongoing-dot"></span>
            <span class="ongoing-status-text">{{ ongoingOrderStatusLabel }}</span>
          </div>
        </div>
        <p class="ongoing-total">{{ formatCHF(ongoingTotal) }} CHF</p>
      </div>

      <div class="ongoing-meta">
        <div class="ongoing-meta-row">
          <span class="ongoing-ico">📍</span>
          <span class="ongoing-meta-text">{{ ongoingShopLabel }}</span>
        </div>
        <div class="ongoing-meta-row">
          <span class="ongoing-ico">⏰</span>
          <span class="ongoing-meta-text">Pick up at {{ ongoingPickupLabel }}</span>
        </div>
      </div>

      <div class="ongoing-items" v-if="ongoingItems.length">
        <article v-for="it in ongoingItems" :key="it._key" class="ongoing-item">
          <div class="ongoing-item-left">
            <div class="ongoing-thumb"></div>
            <div class="ongoing-item-info">
              <p class="ongoing-item-name">{{ it.name }}</p>
              <p class="ongoing-item-sub">Size: {{ it.size || "—" }}</p>
              <p class="ongoing-item-sub2">x{{ it.quantity }}</p>
            </div>
          </div>
          <p class="ongoing-item-price">{{ formatCHF(it.lineTotal) }} CHF</p>
        </article>

        <div class="ongoing-divider"></div>

        <div class="ongoing-total-row">
          <span>Total</span>
          <span class="ongoing-total-amount">{{ formatCHF(ongoingTotal) }} CHF</span>
        </div>
      </div>

      <p v-else class="hint" style="margin-top: 8px;">
        Items not loaded.
      </p>
    </section>

    <!-- LOADING / ERROR: orders -->
    <p v-if="ordersLoading" class="hint">Loading your orders…</p>
    <p v-if="ordersError" class="error">{{ ordersError }}</p>

    <!-- CART LIST (draft local) -->
    <section class="cart-list">
      <article v-for="item in cartItems" :key="item.key" class="cart-item">
        <div class="cart-item-main">
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

          <div class="cart-item-info">
            <p class="cart-item-name">{{ item.name }}</p>
            <p class="cart-item-size">Size: {{ item.size }}</p>
          </div>

          <p class="cart-item-price">{{ formatCHF(item.lineTotal) }} CHF</p>
        </div>

        <div class="cart-item-meta-row">
          <p class="cart-item-meta">{{ formatCHF(item.unitPrice) }} CHF / unit</p>

          <div class="cart-qty-controls">
            <button class="qty-btn" type="button" @click="decrease(item)" :disabled="item.quantity <= 1">−</button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button class="qty-btn" type="button" @click="increase(item)">+</button>

            <button class="cart-remove-btn" type="button" @click="remove(item)">Remove</button>
          </div>
        </div>
      </article>

      <p v-if="cartItems.length === 0" class="hint" style="text-align:center;">
        Your cart is empty.
      </p>
    </section>

    <!-- SUMMARY -->
    <section class="cart-summary">
      <div class="cart-total-line">
        <span>Total</span>
        <span class="cart-total-amount">{{ formatCHF(totalPrice) }} CHF</span>
      </div>

      <!-- CHOOSE STORE -->
      <button class="cart-choose-btn" type="button" :disabled="cartItems.length === 0" @click="openStoreOverlay">
        <div class="cart-choose-main">
          <span>Choose store</span>
          <span class="cart-choose-sub">{{ selectedStoreLabel }}</span>
        </div>
      </button>

      <!-- CHOOSE TIME -->
      <button class="cart-choose-btn" type="button" :disabled="cartItems.length === 0" @click="openTimeOverlay">
        <div class="cart-choose-main">
          <span>Choose time</span>
          <span class="cart-choose-sub">{{ selectedTimeLabel }}</span>
        </div>
      </button>

      <!-- CONTINUE -->
      <button
        class="cart-place-btn"
        type="button"
        :disabled="cartItems.length === 0 || !selectedStore || !selectedTime"
        @click="goToOrderSummary"
      >
        Continue
      </button>
    </section>

    <!-- OVERLAYS -->
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";

import StoreSelectOverlay from "@/components/overlays/StoreSelectOverlay.vue";
import TimeSelectOverlay from "@/components/overlays/TimeSelectOverlay.vue";

const router = useRouter();
const cart = useCartStore();
const auth = useAuthStore();

/* ---------- helpers ---------- */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

function toHHMM(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function minutesOf(hhmm) {
  const [h, m] = String(hhmm || "").split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function ceilToNextStepMinutes(date, step = 15) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime();
  const stepMs = step * 60 * 1000;
  return new Date(Math.ceil(ms / stepMs) * stepMs);
}

/* ---------- local draft cart ---------- */
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

function increase(item) {
  cart.setQuantity(item.productId, item.size, item.quantity + 1);
}
function decrease(item) {
  cart.setQuantity(item.productId, item.size, item.quantity - 1);
}
function remove(item) {
  cart.removeItem(item.productId, item.size);
}

/* ---------- stores ---------- */
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
    storesError.value = e?.response?.data?.message || "Impossible de charger les stores (API).";
  } finally {
    storesLoading.value = false;
  }
}

/* ---------- orders from DB (ongoing) ---------- */
const ordersLoading = ref(false);
const ordersError = ref("");
const myOrders = ref([]);

async function loadMyOrders() {
  ordersError.value = "";
  myOrders.value = [];

  if (!auth.isAuthenticated) return;

  ordersLoading.value = true;
  try {
    // ✅ backend route: GET /auth/me/orders
    const { data } = await api.get("/auth/me/orders");
    myOrders.value = Array.isArray(data?.orders) ? data.orders : [];
  } catch (e) {
    ordersError.value = e?.response?.data?.message || "Failed to load orders";
  } finally {
    ordersLoading.value = false;
  }
}

const ongoingOrder = computed(() => {
  const list = Array.isArray(myOrders.value) ? myOrders.value : [];
  // on garde tout ce qui n'est pas "récupérée"
  return list.find((o) => String(o?.status || "").toLowerCase() !== "récupérée") || null;
});

const ongoingOrderStatusLabel = computed(() => ongoingOrder.value?.status || "en préparation");

const ongoingPickupLabel = computed(() => {
  const v = ongoingOrder.value?.pickup;
  if (!v) return "—";
  return toHHMM(v);
});

const ongoingShopLabel = computed(() => {
  const s = ongoingOrder.value?.store_id; // populated par backend
  if (!s) return "—";
  const city = s?.address?.city;
  return city ? `${s.name} — ${city}` : s.name;
});

// items: GET /orders/:id/items
const ongoingItems = ref([]);
const ongoingItemsLoading = ref(false);

async function loadOngoingItems() {
  ongoingItems.value = [];
  const id = ongoingOrder.value?._id;
  if (!id) return;

  ongoingItemsLoading.value = true;
  try {
    const { data } = await api.get(`/orders/${id}/items`);
    const items = Array.isArray(data?.items) ? data.items : [];
    ongoingItems.value = items.map((it, idx) => {
      const qty = Number(it?.quantity) || 1; // si ton modèle n'a pas quantity, ça restera 1
      const unit = Number(it?.final_price_chf) || 0;
      return {
        _key: it?._id || `${idx}`,
        name: it?.product_name || it?.product_id?.name || "Product",
        size: it?.size,
        quantity: qty,
        lineTotal: unit * qty,
      };
    });
  } catch {
    // on laisse l'UI afficher "Items not loaded."
  } finally {
    ongoingItemsLoading.value = false;
  }
}

const ongoingTotal = computed(() => {
  const o = ongoingOrder.value;
  if (!o) return 0;
  const backendTotal = Number(o.total_price_chf);
  if (Number.isFinite(backendTotal)) return backendTotal;
  return ongoingItems.value.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
});

watch(ongoingOrder, loadOngoingItems, { immediate: true });

/* ---------- choose store/time (from backend opening_hours) ---------- */
const selectedStore = ref(null);
const selectedTime = ref("");

const selectedStoreLabel = computed(() => {
  if (!selectedStore.value) return "No store selected";
  const city = selectedStore.value?.address?.city || "";
  return city ? `${selectedStore.value.name}, ${city}` : selectedStore.value.name;
});

const selectedTimeLabel = computed(() => (selectedTime.value ? selectedTime.value : "No time selected"));

function openingHoursForToday(store) {
  // opening_hours: [ [], ["09:00","18:30"], ... ] (Dimanche=0)
  const oh = store?.opening_hours;
  if (!Array.isArray(oh) || oh.length < 7) return null;

  const day = new Date().getDay(); // 0..6
  const range = oh[day];
  if (!Array.isArray(range) || range.length < 2) return null;
  const [open, close] = range;
  if (!open || !close) return null;
  return { open, close };
}

// propose des horaires uniquement après l'heure actuelle (+ arrondi 15min)
const availableTimes = computed(() => {
  const s = selectedStore.value;
  if (!s) return [];

  const oh = openingHoursForToday(s);
  if (!oh) return [];

  const openMin = minutesOf(oh.open);
  const closeMin = minutesOf(oh.close);
  if (openMin == null || closeMin == null) return [];
  if (closeMin <= openMin) return [];

  const now = new Date();
  const start = ceilToNextStepMinutes(now, 15);
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

watch([selectedStore, availableTimes], () => {
  if (selectedTime.value && !availableTimes.value.includes(selectedTime.value)) {
    selectedTime.value = "";
  }
});

/* ---------- overlays ---------- */
const showStoreOverlay = ref(false);
const showTimeOverlay = ref(false);

function openStoreOverlay() {
  showStoreOverlay.value = true;
}

function openTimeOverlay() {
  // si pas de store -> on ouvre quand même l'overlay, il montrera "Select a store first."
  showTimeOverlay.value = true;
}

// ✅ robuste: overlay peut renvoyer objet store OU juste l'id
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

/* ---------- nav ---------- */
function goBack() {
  router.back();
}

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

onMounted(async () => {
  await loadStores();
  await loadMyOrders();
});
</script>

<style scoped>
.hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: #8b8375;
}
.error {
  margin: 0 0 10px;
  font-size: 12px;
  color: #b00020;
}

/* thumbs */
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

/* ongoing block (minimal: si tu as déjà tes styles, tu peux enlever) */
.ongoing-card {
  margin: 12px 16px;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}
.ongoing-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.ongoing-title {
  margin: 0;
  font-weight: 700;
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
  background: #5f8f3e;
  display: inline-block;
}
.ongoing-total {
  margin: 0;
  font-weight: 700;
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
.ongoing-items {
  margin-top: 12px;
}
.ongoing-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
}
.ongoing-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ongoing-thumb {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #d4e6b8;
}
.ongoing-item-name {
  margin: 0;
  font-weight: 600;
  font-size: 13px;
}
.ongoing-item-sub,
.ongoing-item-sub2 {
  margin: 0;
  font-size: 12px;
  color: #6d655a;
}
.ongoing-item-price {
  margin: 0;
  font-weight: 600;
  font-size: 13px;
}
.ongoing-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 8px 0;
}
.ongoing-total-row {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
}
</style>