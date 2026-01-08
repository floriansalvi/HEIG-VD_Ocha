<!-- src/views/OrderSummaryView.vue -->
<template>
  <div class="order-page">
    <header class="order-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="order-header-title">Order</h1>
      <span class="order-header-spacer"></span>
    </header>

    <p v-if="error" class="order-error">{{ error }}</p>

    <section class="order-card">
      <div class="order-product-row">
        <div class="order-product-img-placeholder"></div>

        <div class="order-product-info">
          <p class="order-product-name">My order</p>
          <p class="order-product-meta">{{ oneItemMeta }}</p>
        </div>

        <span class="order-product-price">{{ formatCHF(totalAmount) }} CHF</span>
      </div>

      <div class="order-info-row">
        <div class="order-info-left">
          <span class="order-info-icon">📍</span>
          <div>
            <p class="order-info-label">The shop</p>
            <p class="order-info-value">{{ shopLabel }}</p>
          </div>
        </div>
      </div>

      <div class="order-info-row order-info-row--time">
        <div class="order-info-left">
          <span class="order-info-icon">⏰</span>
          <div>
            <p class="order-info-label">Pick up time</p>
            <p class="order-info-value">{{ pickupTimeLabel }}</p>
          </div>
        </div>
      </div>

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

    <!-- SUCCESS -->
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
import { computed, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/services/api";
import { useCartStore } from "@/stores/cart";

const router = useRouter();
const route = useRoute();
const cart = useCartStore();

const isPlacing = ref(false);
const showSuccessOverlay = ref(false);
const error = ref("");

function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

// query depuis CartView
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

// panier
const cartItems = computed(() => (Array.isArray(cart.items) ? cart.items : []));
const totalAmount = computed(() => Number(cart.totalAmount) || 0);

// ✅ 1 item affiché (comme ton screen)
const oneItemMeta = computed(() => {
  const items = cartItems.value;
  if (!items.length) return "No items";
  const it = items[0];
  const q = Number(it.quantity) || 1;
  return `${it.name}${q ? ` x${q}` : ""}`;
});

const canPlace = computed(() => {
  return (
    !!storeId.value &&
    !!pickupHHMM.value &&
    cartItems.value.length > 0 &&
    !!toPickupISO(pickupHHMM.value)
  );
});

/**
 * ✅ Convertit "HH:MM" en ISO Date
 * - aujourd’hui à HH:MM
 * - si c’est déjà passé -> demain
 */
function toPickupISO(hhmm) {
  const parts = String(hhmm || "").split(":");
  if (parts.length !== 2) return null;

  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;

  const now = new Date();
  const d = new Date(now);
  d.setSeconds(0, 0);
  d.setHours(hh, mm, 0, 0);

  // si l'heure est passée -> demain
  if (d.getTime() < now.getTime()) {
    d.setDate(d.getDate() + 1);
  }

  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function goBack() {
  router.back();
}

async function placeOrder() {
  if (isPlacing.value || !canPlace.value) {
    if (!cartItems.value.length) error.value = "Your cart is empty.";
    return;
  }

  error.value = "";
  showSuccessOverlay.value = false;
  isPlacing.value = true;

  const pickupISO = toPickupISO(pickupHHMM.value);
  if (!pickupISO) {
    error.value = "Invalid pickup time.";
    isPlacing.value = false;
    return;
  }

  // ✅ backend attend: store_id, pickup(Date), items[]
  const payload = {
    store_id: storeId.value,
    pickup: pickupISO,
    items: cartItems.value.map((it) => ({
      product_id: it.productId,
      size: it.size,
      // quantity ignorée côté backend actuel => ok de l'envoyer ou pas
    })),
  };

  try {
    const res = await api.post("/orders", payload);

    // ✅ success UNIQUEMENT si status 201/200
    if (res?.status !== 201 && res?.status !== 200) {
      throw new Error("Unexpected response");
    }

    const data = res.data;
    const orderId = data?.order?._id || data?.order?.id || data?._id || data?.id;
    if (orderId) localStorage.setItem("active_order_id", String(orderId));

    showSuccessOverlay.value = true;
  } catch (e) {
    console.log("PLACE ORDER status:", e?.response?.status);
    console.log("PLACE ORDER data:", e?.response?.data);

    showSuccessOverlay.value = false;
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Impossible de créer la commande.";
  } finally {
    isPlacing.value = false;
  }
}

function goToCart() {
  showSuccessOverlay.value = false;
  router.push("/cart");
}

// optionnel: si l’utilisateur arrive ici sans items, on l’empêche direct
onMounted(() => {
  if (!cartItems.value.length) {
    error.value = "Your cart is empty.";
  }
});
</script>

<style scoped>
.order-error {
  margin: 0 16px 10px;
  font-size: 12px;
  color: #b00020;
}

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