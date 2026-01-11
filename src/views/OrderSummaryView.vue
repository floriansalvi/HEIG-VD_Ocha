<template>
  <div class="order-page">
    <!-- Header / back navigation -->
    <header class="order-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="order-header-title">Order</h1>
      <span class="order-header-spacer"></span>
    </header>

    <!-- API error banner -->
    <p v-if="error" class="order-error">{{ error }}</p>

    <section class="order-card">
      <!-- Order preview (thumbnail + meta + total) -->
      <div class="order-product-row">
        <div class="order-product-thumb">
          <img
            v-if="thumbSrc"
            :src="thumbSrc"
            :alt="thumbAlt"
            class="order-product-thumb-img"
            loading="lazy"
            @error="onThumbError"
          />
          <div v-else class="order-product-img-placeholder"></div>
        </div>

        <div class="order-product-info">
          <p class="order-product-name">My order</p>
          <p class="order-product-meta">
            {{ orderMeta }}
          </p>
        </div>

        <!-- Total amount: DB total (after creation) or cart total (before creation) -->
        <span class="order-product-price">{{ formatCHF(displayTotal) }} CHF</span>
      </div>

      <!-- Selected store -->
      <div class="order-info-row">
        <div class="order-info-left">
          <span class="order-info-icon">📍</span>
          <div>
            <p class="order-info-label">The shop</p>
            <p class="order-info-value">{{ shopLabel }}</p>
          </div>
        </div>
      </div>

      <!-- Selected pickup time -->
      <div class="order-info-row order-info-row--time">
        <div class="order-info-left">
          <span class="order-info-icon">⏰</span>
          <div>
            <p class="order-info-label">Pick up time</p>
            <p class="order-info-value">{{ pickupTimeLabel }}</p>
          </div>
        </div>
      </div>

      <!-- Place order action -->
      <button
        class="order-place-btn"
        type="button"
        :disabled="isPlacing || !canPlace"
        @click="placeOrder"
      >
        <span v-if="!isPlacing">Place order</span>
        <span v-else>Placing…</span>
      </button>
    </section>

    <!-- Success overlay (shown after order creation) -->
    <div v-if="showSuccessOverlay" class="order-success-backdrop">
      <div class="order-success-card">
        <div class="order-success-icon">✅</div>
        <h2 class="order-success-title">Order confirmed</h2>
        <p class="order-success-text">
          Your drinks will be ready at <strong>{{ pickupTimeLabel }}</strong> at
          <strong>{{ shopLabel }}</strong>.
        </p>

        <button type="button" class="order-success-btn" @click="goToCart">
          Go to cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/services/api";
import { useCartStore } from "@/stores/cart";

const router = useRouter();
const route = useRoute();
const cart = useCartStore();

/* =========================
   UI state
   ========================= */
const isPlacing = ref(false);
const showSuccessOverlay = ref(false);
const error = ref("");

/* =========================
   DB state (after creation)
   ========================= */
const createdOrderId = ref("");
const dbItems = ref([]);     // items fetched from GET /orders/:id/items
const dbTotal = ref(null);   // total_price_chf returned by POST /orders

/* =========================
   Data received from CartView (route query)
   ========================= */
const storeId = computed(() =>
  typeof route.query.storeId === "string" ? route.query.storeId : ""
);
const storeName = computed(() =>
  typeof route.query.storeName === "string" ? route.query.storeName : ""
);
const pickupHHMM = computed(() =>
  typeof route.query.time === "string" ? route.query.time : ""
);

const shopLabel = computed(() => storeName.value || "No shop selected");
const pickupTimeLabel = computed(() => pickupHHMM.value || "No time selected");

/* =========================
   Helpers
   ========================= */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

/**
 * Convert an "HH:mm" string into an ISO date for today's date.
 * Backend expects pickup as a Date (ISO string works fine).
 */
function buildPickupISO(hhmm) {
  const [h, m] = String(hhmm || "").split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/* =========================
   Cart -> payload / validation
   ========================= */
const canPlace = computed(() => {
  const items = Array.isArray(cart.items) ? cart.items : [];
  return !!storeId.value && !!pickupHHMM.value && items.length > 0;
});

/**
 * Display total:
 * - if DB total exists (after creation), use it
 * - otherwise show the cart total (before creation)
 */
const displayTotal = computed(() => {
  if (Number.isFinite(Number(dbTotal.value))) return Number(dbTotal.value);
  return Number(cart.totalAmount) || 0;
});

/* =========================
   Thumbnail (take the first cart item's image)
   ========================= */
const firstCartItem = computed(() => {
  const items = Array.isArray(cart.items) ? cart.items : [];
  return items.length ? items[0] : null;
});

const thumbSrc = ref("");

watch(
  () => firstCartItem.value,
  (it) => {
    thumbSrc.value = it?.imageUrl || it?.image_url || it?.image || "";
  },
  { immediate: true }
);

const thumbAlt = computed(() => firstCartItem.value?.name || "Product");

function onThumbError() {
  thumbSrc.value = "";
}

/* =========================
   Meta text under "My order"
   - Prefer DB items (after order is created)
   - Fallback to cart items (before creation)
   ========================= */
const orderMeta = computed(() => {
  // DB priority (more reliable quantities)
  if (Array.isArray(dbItems.value) && dbItems.value.length) {
    return dbItems.value
      .slice(0, 3)
      .map((it) => {
        const name = it?.product_name || it?.product_id?.name || "Product";
        const qty = Number(it?.quantity) || 1;
        return `${name} x${qty}`;
      })
      .join(", ");
  }

  // Cart fallback
  const items = Array.isArray(cart.items) ? cart.items : [];
  if (!items.length) return "No items";
  return items
    .slice(0, 3)
    .map((it) => {
      const qty = Number(it?.quantity) || 1;
      return `${it.name} x${qty}`;
    })
    .join(", ");
});

/* =========================
   API: load items from DB for the created order
   (non-blocking: UI can still fallback to cart)
   ========================= */
async function fetchOrderItems(orderId) {
  try {
    const { data } = await api.get(`/orders/${orderId}/items`);
    dbItems.value = Array.isArray(data?.items) ? data.items : [];
  } catch (e) {
    // Not blocking: keep cart-based meta if it fails
    console.log("LOAD ORDER ITEMS status:", e?.response?.status);
    console.log("LOAD ORDER ITEMS data:", e?.response?.data);
  }
}

/* =========================
   Navigation
   ========================= */
function goBack() {
  router.back();
}

/* =========================
   Place order (POST /orders)
   ========================= */
async function placeOrder() {
  if (isPlacing.value || !canPlace.value) return;

  error.value = "";
  isPlacing.value = true;

  const pickupISO = buildPickupISO(pickupHHMM.value);
  if (!pickupISO) {
    error.value = "Invalid pickup time.";
    isPlacing.value = false;
    return;
  }

  // Build payload from cart data (backend expects store_id, pickup and items[])
  const payload = {
    store_id: storeId.value,
    pickup: pickupISO,
    items: (cart.items || []).map((it) => ({
      product_id: it.productId,
      size: it.size,
      quantity: Number(it.quantity) || 1,
    })),
  };

  try {
    const { data } = await api.post("/orders", payload);

    // Handle different possible shapes from the backend response
    const orderId = data?.order?._id || data?._id || data?.id;
    if (!orderId) throw new Error("Order created but missing id");

    createdOrderId.value = String(orderId);
    dbTotal.value = Number(data?.order?.total_price_chf);

    // Fetch DB items to display accurate quantities/prices if needed
    await fetchOrderItems(createdOrderId.value);

    showSuccessOverlay.value = true;

    // Clear local cart after success
    if (typeof cart.clear === "function") cart.clear();
  } catch (e) {
    console.log("PLACE ORDER status:", e?.response?.status);
    console.log("PLACE ORDER data:", e?.response?.data);

    error.value =
      e?.response?.data?.message ||
      e?.message ||
      "Impossible de créer la commande.";
  } finally {
    isPlacing.value = false;
  }
}

/* =========================
   Close success overlay + go back to cart
   ========================= */
function goToCart() {
  showSuccessOverlay.value = false;
  router.push("/cart");
}
</script>

<style scoped>
/* Error message (top of page) */
.order-error {
  margin: 0 16px 10px;
  font-size: 12px;
  color: #b00020;
}

/* Thumbnail container */
.order-product-thumb {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: #d4e6b8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.order-product-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.order-product-img-placeholder {
  width: 100%;
  height: 100%;
  background: #d4e6b8;
}

/* Success overlay (covers the phone content only) */
.order-success-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}
.order-success-card {
  width: 100%;
  max-width: 320px;
  border-radius: 20px;
  padding: 18px 16px 16px;
  background: #5f8f3e;
  color: #fff;
  text-align: center;
}
.order-success-btn {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 700;
  background: #fff;
  color: #2f2a24;
  cursor: pointer;
}
</style>