<!-- src/views/CartView.vue -->
<template>
  <div class="cart-page">
    <!-- HEADER -->
    <header class="cart-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="cart-title">Order</h1>
      <span class="cart-header-spacer"></span>
    </header>

    <!-- STORES LOADING/ERROR -->
    <p v-if="storesLoading" class="hint">Loading stores…</p>
    <p v-if="storesError" class="error">{{ storesError }}</p>

    <!-- ONGOING ORDER -->
    <section v-if="ongoingOrder" class="ongoing-card">
      <div class="ongoing-top">
        <div class="ongoing-title-wrap">
          <p class="ongoing-title">Ongoing order</p>
          <div class="ongoing-status">
            <span class="ongoing-dot"></span>
            <span class="ongoing-status-text">{{ ongoingStatusLabel }}</span>
          </div>
        </div>

        <!-- ✅ total recalculé depuis les items (quantités incluses) -->
        <p class="ongoing-total">{{ formatCHF(ongoingComputedTotal) }} CHF</p>
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

      <div class="ongoing-bottom">
        <p class="ongoing-summary">
          {{ ongoingSummary }}
        </p>

        <!-- ✅ en bas à droite: total recalculé (pas le prix d’un item) -->
        <p class="ongoing-bottom-price">{{ formatCHF(ongoingComputedTotal) }} CHF</p>
      </div>
    </section>

    <!-- ORDERS LOADING/ERROR -->
    <p v-if="ordersLoading" class="hint">Loading your orders…</p>
    <p v-else-if="!ordersLoading && !ongoingOrder" class="hint">No orders in progress</p>
    <p v-if="ordersError" class="error">{{ ordersError }}</p>

    <!-- CART LIST (local) -->
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

            <button class="cart-remove-btn" type="button" @click="remove(item)">
              Remove
            </button>
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

      <button class="cart-choose-btn" type="button" :disabled="cartItems.length === 0" @click="openStoreOverlay">
        <div class="cart-choose-main">
          <span>Choose store</span>
          <span class="cart-choose-sub">{{ selectedStoreLabel }}</span>
        </div>
      </button>

      <button class="cart-choose-btn" type="button" :disabled="cartItems.length === 0" @click="openTimeOverlay">
        <div class="cart-choose-main">
          <span>Choose time</span>
          <span class="cart-choose-sub">{{ selectedTimeLabel }}</span>
        </div>
      </button>

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

/* ---------- helpers ---------- */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

function toHHMM(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function minutesOf(hhmm) {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function ceilToNextStepMinutes(date, step = 15) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const stepMs = step * 60 * 1000;
  return new Date(Math.ceil(d.getTime() / stepMs) * stepMs);
}

/* ---------- local cart ---------- */
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
    storesError.value = e?.response?.data?.message || "Failed to load stores";
  } finally {
    storesLoading.value = false;
  }
}

/* ---------- orders (DB) ---------- */
const ordersLoading = ref(false);
const ordersError = ref("");
const myOrders = ref([]);

async function loadMyOrders() {
  ordersError.value = "";
  myOrders.value = [];

  if (!auth.isAuthenticated) return;

  ordersLoading.value = true;
  try {
    // ✅ chez toi ça marche: /api/v1/users/orders (sans "me")
    const { data } = await api.get("/users/orders", { params: { page: 1, limit: 10 } });
    myOrders.value = Array.isArray(data?.orders) ? data.orders : [];
  } catch (e) {
    console.error("Error loading orders:", e);
    ordersError.value = e?.response?.data?.message || "Failed to load orders";
  } finally {
    ordersLoading.value = false;
  }
}

const ongoingOrder = computed(() => {
  const list = Array.isArray(myOrders.value) ? myOrders.value : [];
  // status enum: ["en préparation", "prête", "récupérée"]
  return list.find((o) => String(o?.status || "").toLowerCase() !== "récupérée") || null;
});

const ongoingStatusLabel = computed(() => ongoingOrder.value?.status || "en préparation");

const ongoingPickupLabel = computed(() => {
  const pickup = ongoingOrder.value?.pickup;
  return pickup ? toHHMM(pickup) : "—";
});

const ongoingShopLabel = computed(() => {
  const s = ongoingOrder.value?.store_id; // populate("store_id") côté backend
  if (!s) return "—";
  const city = s?.address?.city;
  return city ? `${s.name} — ${city}` : s.name;
});

/* ---------- order items (DB) -> résumé + total recalculé ---------- */
const ongoingItems = ref([]); // UI items: { name, quantity, unitPrice }

async function loadOngoingItems() {
  ongoingItems.value = [];
  const id = ongoingOrder.value?._id;
  if (!id) return;

  try {
    const { data } = await api.get(`/orders/${id}/items`);
    const raw = Array.isArray(data?.items) ? data.items : [];

    ongoingItems.value = raw.map((it, idx) => ({
      _key: it?._id || String(idx),
      name: it?.product_name || it?.product_id?.name || "Product",
      quantity: Number(it?.quantity) || 1,
      unitPrice: Number(it?.final_price_chf) || 0, // prix unitaire
    }));
  } catch (e) {
    console.error("Error loading ongoing items:", e);
    ongoingItems.value = [];
  }
}

const ongoingComputedTotal = computed(() => {
  const items = Array.isArray(ongoingItems.value) ? ongoingItems.value : [];
  return items.reduce((sum, it) => {
    const q = Number(it.quantity) || 1;
    const p = Number(it.unitPrice) || 0;
    return sum + p * q;
  }, 0);
});

const ongoingSummary = computed(() => {
  const items = Array.isArray(ongoingItems.value) ? ongoingItems.value : [];
  if (!items.length) return "—";

  // regroupe par nom pour afficher xN proprement
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
});

watch(ongoingOrder, () => loadOngoingItems(), { immediate: true });

/* ---------- choose store/time (opening_hours) ---------- */
const selectedStore = ref(null);
const selectedTime = ref("");

const selectedStoreLabel = computed(() => {
  if (!selectedStore.value) return "No store selected";
  const city = selectedStore.value?.address?.city || "";
  return city ? `${selectedStore.value.name}, ${city}` : selectedStore.value.name;
});

const selectedTimeLabel = computed(() => (selectedTime.value ? selectedTime.value : "No time selected"));

function openingHoursForToday(store) {
  const oh = store?.opening_hours;
  if (!Array.isArray(oh) || oh.length < 7) return null;
  const day = new Date().getDay(); // 0..6 (dimanche=0)
  const range = oh[day];
  if (!Array.isArray(range) || range.length < 2) return null;
  const [open, close] = range;
  if (!open || !close) return null;
  return { open, close };
}

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
  showTimeOverlay.value = true;
}

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

/* ---------- lifecycle ---------- */
async function refreshOrdersLight() {
  // refresh léger au retour sur l’onglet Order (si page keep-alive)
  await loadMyOrders();
}

onMounted(async () => {
  await loadStores();
  await loadMyOrders();
});

// si tu utilises <keep-alive>, ça se déclenche au retour sur l’onglet
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
  background: #5f8f3e;
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
  max-width: 75%;
}
.ongoing-bottom-price {
  margin: 0;
  font-weight: 800;
  font-size: 13px;
  white-space: nowrap;
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