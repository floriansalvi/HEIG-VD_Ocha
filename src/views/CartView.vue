<!-- src/views/CartView.vue -->
<template>
  <div class="cart-page">
    <!-- HEADER -->
    <header class="cart-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="cart-title">Order</h1>
      <span class="cart-header-spacer"></span>
    </header>

    <!-- ONGOING ORDER (joli) -->
    <section v-if="hasActiveOrder" class="ongoing-card">
      <div class="ongoing-top">
        <div class="ongoing-title-wrap">
          <p class="ongoing-title">Ongoing order</p>
          <div class="ongoing-status">
            <span class="ongoing-dot"></span>
            <span class="ongoing-status-text">in preparation</span>
          </div>
        </div>

        <p class="ongoing-total">{{ activeOrder.total }} CHF</p>
      </div>

      <div class="ongoing-meta">
        <div class="ongoing-meta-row">
          <span class="ongoing-ico">📍</span>
          <span class="ongoing-meta-text">{{ activeOrder.shop }}</span>
        </div>
        <div class="ongoing-meta-row">
          <span class="ongoing-ico">⏰</span>
          <span class="ongoing-meta-text">Pick up at {{ activeOrder.time }}</span>
        </div>
      </div>

      <!-- mini liste items -->
      <div class="ongoing-items">
        <article
          v-for="item in activeOrderItems"
          :key="item.id"
          class="ongoing-item"
        >
          <div class="ongoing-item-left">
            <div class="ongoing-thumb"></div>
            <div class="ongoing-item-info">
              <p class="ongoing-item-name">{{ item.name }}</p>
              <p class="ongoing-item-sub">{{ item.size }} • {{ item.temperature }}</p>
              <p class="ongoing-item-sub2">x{{ item.quantity }} • No sugar</p>
            </div>
          </div>
          <p class="ongoing-item-price">{{ item.price }} CHF</p>
        </article>

        <div class="ongoing-divider"></div>

        <div class="ongoing-total-row">
          <span>Total</span>
          <span class="ongoing-total-amount">{{ activeOrder.total }} CHF</span>
        </div>
      </div>
    </section>

    <!-- NEW ORDER (panier normal) -->
    <section class="cart-list">
      <article v-for="item in cartItems" :key="item.id" class="cart-item">
        <div class="cart-item-main">
          <div class="cart-thumb"></div>
          <div class="cart-item-info">
            <p class="cart-item-name">{{ item.name }}</p>
            <p class="cart-item-size">{{ item.size }} • {{ item.temperature }}</p>
          </div>
          <p class="cart-item-price">{{ item.price }} CHF</p>
        </div>

        <p class="cart-item-meta">x{{ item.quantity }} • No sugar</p>
      </article>
    </section>

    <!-- SUMMARY -->
    <section class="cart-summary">
      <div class="cart-total-line">
        <span>Total</span>
        <span class="cart-total-amount">{{ totalPrice }} CHF</span>
      </div>

      <button class="cart-choose-btn" type="button" @click="openStoreOverlay">
        <div class="cart-choose-main">
          <span>Choose store</span>
          <span class="cart-choose-sub">{{ selectedStoreLabel }}</span>
        </div>
      </button>

      <button
        class="cart-choose-btn"
        type="button"
        :disabled="!selectedStore"
        @click="openTimeOverlay"
      >
        <div class="cart-choose-main">
          <span>Choose time</span>
          <span class="cart-choose-sub">{{ selectedTimeLabel }}</span>
        </div>
      </button>

      <button
        class="cart-place-btn"
        type="button"
        :disabled="!selectedStore || !selectedTime"
        @click="goToOrderSummary"
      >
        Continue
      </button>
    </section>

    <!-- OVERLAYS -->
    <StoreSelectOverlay
      v-if="showStoreOverlay"
      :stores="stores"
      :selected-id="selectedStore?.id || null"
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
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StoreSelectOverlay from '@/components/overlays/StoreSelectOverlay.vue';
import TimeSelectOverlay from '@/components/overlays/TimeSelectOverlay.vue';

const router = useRouter();
const route = useRoute();

/* Ongoing order depuis query */
const hasActiveOrder = computed(() => !!route.query.activeOrder);

const activeOrder = computed(() => ({
  total: route.query.total || '17.80',
  shop: route.query.shop || 'Lausanne, Ocha Matcha',
  time: route.query.time || '16:15',
}));

/* (mock) items ongoing */
const activeOrderItems = ref([
  { id: 1, name: 'Vanilla Matcha Latte', size: 'Medium', temperature: 'iced', price: '8.9', quantity: 1 },
  { id: 2, name: 'Classic Matcha Latte', size: 'Medium', temperature: 'iced', price: '8.9', quantity: 1 },
]);

/* panier normal */
const cartItems = ref([
  { id: 1, name: 'Vanilla Matcha Latte', size: 'Medium', temperature: 'iced', price: 8.9, quantity: 1 },
  { id: 2, name: 'Classic Matcha Latte', size: 'Medium', temperature: 'iced', price: 8.9, quantity: 1 },
]);

const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
);

/* stores + times (mock) */
const stores = ref([
  { id: 1, name: 'Ocha Matcha Lausanne', city: 'Lausanne' },
  { id: 2, name: 'Ocha Matcha Renens', city: 'Renens' },
]);

const availableTimes = ref(['13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00']);

const selectedStore = ref(null);
const selectedTime = ref(null);

const selectedStoreLabel = computed(() =>
  selectedStore.value ? `${selectedStore.value.name}, ${selectedStore.value.city}` : 'No store selected'
);
const selectedTimeLabel = computed(() => (selectedTime.value ? selectedTime.value : 'No time selected'));

/* overlays */
const showStoreOverlay = ref(false);
const showTimeOverlay = ref(false);

const openStoreOverlay = () => (showStoreOverlay.value = true);
const openTimeOverlay = () => {
  if (!selectedStore.value) return;
  showTimeOverlay.value = true;
};

const handleStoreSelected = (store) => {
  selectedStore.value = store;
  selectedTime.value = null; // important: reset time si on change de store
  showStoreOverlay.value = false;
};

const handleTimeSelected = (time) => {
  selectedTime.value = time;
  showTimeOverlay.value = false;
};

/* navigation */
const goBack = () => router.back();
const goToOrderSummary = () => router.push({ name: 'order-summary' });
</script>