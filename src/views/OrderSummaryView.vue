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
      <!-- TOP ROW -->
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

        <span class="order-product-price">{{ formatCHF(displayTotal) }} CHF</span>
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
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/services/api";
import { useCartStore } from "@/stores/cart";

const router = useRouter();
const route = useRoute();
const cart = useCartStore();

const isPlacing = ref(false);
const showSuccessOverlay = ref(false);
const error = ref("");

// ---- DB state (après création) ----
const createdOrderId = ref("");
const dbItems = ref([]); // items depuis GET /orders/:id/items
const dbTotal = ref(null); // total_price_chf depuis réponse POST

// Reçus depuis CartView (query)
const storeId = computed(() => (typeof route.query.storeId === "string" ? route.query.storeId : ""));
const storeName = computed(() => (typeof route.query.storeName === "string" ? route.query.storeName : ""));
const pickupHHMM = computed(() => (typeof route.query.time === "string" ? route.query.time : ""));

const shopLabel = computed(() => storeName.value || "No shop selected");
const pickupTimeLabel = computed(() => pickupHHMM.value || "No time selected");

// ---------- helpers ----------
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

// construit une vraie Date ISO à partir de "HH:MM" (aujourd’hui)
// -> compatible avec pickup: Date (mongoose)
function buildPickupISO(hhmm) {
  const [h, m] = String(hhmm || "").split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// ---------- cart -> payload ----------
const canPlace = computed(() => {
  const items = Array.isArray(cart.items) ? cart.items : [];
  return !!storeId.value && !!pickupHHMM.value && items.length > 0;
});

// total affiché : DB si dispo, sinon panier
const displayTotal = computed(() => {
  if (Number.isFinite(Number(dbTotal.value))) return Number(dbTotal.value);
  return Number(cart.totalAmount) || 0;
});

// --------- IMAGE (du panier) ---------
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

// ---------- META affichée ----------
// ✅ Avant création : basé sur panier (nom + xqty)
// ✅ Après création : basé sur DB (product_name + xquantity)
const orderMeta = computed(() => {
  // priorité DB
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

  // fallback panier
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

// ---------- API: load items from DB ----------
async function fetchOrderItems(orderId) {
  try {
    const { data } = await api.get(`/orders/${orderId}/items`);
    dbItems.value = Array.isArray(data?.items) ? data.items : [];
  } catch (e) {
    // pas bloquant pour l’UI : on garde le fallback panier
    console.log("LOAD ORDER ITEMS status:", e?.response?.status);
    console.log("LOAD ORDER ITEMS data:", e?.response?.data);
  }
}

// ---------- actions ----------
function goBack() {
  router.back();
}

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

  const payload = {
    store_id: storeId.value,
    pickup: pickupISO, // ✅ Date ISO
    items: (cart.items || []).map((it) => ({
      product_id: it.productId,
      size: it.size,
      quantity: Number(it.quantity) || 1, // ✅ quantity envoyé
    })),
  };

  try {
    const { data } = await api.post("/orders", payload);

    const orderId = data?.order?._id || data?._id || data?.id;
    if (!orderId) throw new Error("Order created but missing id");

    createdOrderId.value = String(orderId);
    dbTotal.value = Number(data?.order?.total_price_chf);

    // ✅ récupère les quantités depuis la DB
    await fetchOrderItems(createdOrderId.value);

    showSuccessOverlay.value = true;

    // optionnel: vider le panier après succès
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

function goToCart() {
  showSuccessOverlay.value = false;
  router.push("/cart");
}
</script>

<style scoped>
/* erreurs */
.order-error {
  margin: 0 16px 10px;
  font-size: 12px;
  color: #b00020;
}

/* thumb */
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

/* success overlay */
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