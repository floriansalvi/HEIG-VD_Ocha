<!-- src/views/CartView.vue -->
<template>
  <div class="cart-page">
    <!-- HEADER -->
    <header class="cart-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="cart-title">Order</h1>
      <span class="cart-header-spacer"></span>
    </header>

    <!-- LOADING / ERROR stores -->
    <p v-if="storesLoading" style="margin: 0 0 10px; font-size: 12px; color: #8b8375;">
      Loading stores…
    </p>
    <p v-if="storesError" style="margin: 0 0 10px; font-size: 12px; color: #b00020;">
      {{ storesError }}
    </p>

    <!-- CART LIST -->
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

      <p
        v-if="cartItems.length === 0"
        style="margin: 12px 0 0; font-size: 12px; color: #8b8375; text-align: center;"
      >
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

      <!-- CHOOSE TIME -->
      <button
        class="cart-choose-btn"
        type="button"
        :disabled="!selectedStore || cartItems.length === 0"
        @click="openTimeOverlay"
      >
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
      @close="showTimeOverlay = false"
      @select="handleTimeSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useCartStore } from "@/stores/cart";

import StoreSelectOverlay from "@/components/overlays/StoreSelectOverlay.vue";
import TimeSelectOverlay from "@/components/overlays/TimeSelectOverlay.vue";

const router = useRouter();
const cart = useCartStore();

/* ---------- helpers ---------- */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

/* ---------- cart computed ---------- */
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

const totalPrice = computed(() => cart.totalAmount);

/* ---------- qty actions ---------- */
function increase(item) {
  cart.setQuantity(item.productId, item.size, item.quantity + 1);
}
function decrease(item) {
  cart.setQuantity(item.productId, item.size, item.quantity - 1);
}
function remove(item) {
  cart.removeItem(item.productId, item.size);
}

/* ---------- stores from API ---------- */
const stores = ref([]);
const storesLoading = ref(false);
const storesError = ref("");

async function loadStores() {
  storesLoading.value = true;
  storesError.value = "";

  try {
    // API: GET /api/v1/stores
    const { data } = await api.get("/stores", {
      params: { active: "true", page: 1, limit: 50 },
    });

    const list = Array.isArray(data?.stores) ? data.stores : [];
    // On garde le format Mongo (_id, name, address...)
    stores.value = list;
  } catch (e) {
    console.error(e);
    storesError.value = "Impossible de charger les stores (API).";
  } finally {
    storesLoading.value = false;
  }
}

onMounted(loadStores);

/* ---------- choose store/time ---------- */
const selectedStore = ref(null);
const selectedTime = ref(null);

const selectedStoreLabel = computed(() => {
  if (!selectedStore.value) return "No store selected";
  const city = selectedStore.value?.address?.city || "";
  return city ? `${selectedStore.value.name}, ${city}` : selectedStore.value.name;
});

const selectedTimeLabel = computed(() => (selectedTime.value ? selectedTime.value : "No time selected"));

const availableTimes = ref(["13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00"]);

const showStoreOverlay = ref(false);
const showTimeOverlay = ref(false);

function openStoreOverlay() {
  showStoreOverlay.value = true;
}
function openTimeOverlay() {
  if (!selectedStore.value) return;
  showTimeOverlay.value = true;
}

function handleStoreSelected(store) {
  // store vient de l’overlay
  selectedStore.value = store;
  selectedTime.value = null; // reset time si store change
  showStoreOverlay.value = false;
}

function handleTimeSelected(time) {
  selectedTime.value = time;
  showTimeOverlay.value = false;
}

/* ---------- navigation ---------- */
function goBack() {
  router.back();
}

function goToOrderSummary() {
  // tu peux passer store/time en query si tu veux les afficher après
  router.push({
    name: "order-summary",
    query: {
      storeId: selectedStore.value?._id,
      storeName: selectedStore.value?.name,
      time: selectedTime.value,
    },
  });
}
</script>

<style scoped>
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