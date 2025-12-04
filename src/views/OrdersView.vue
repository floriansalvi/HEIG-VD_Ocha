<template>
  <div class="cart-page">
    <!-- HEADER -->
    <header class="cart-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1>Cart</h1>
      <span class="cart-header-spacer"></span>
    </header>

    <!-- LISTE DES BOISSONS -->
    <section class="cart-list">
      <article
        v-for="item in items"
        :key="item.id"
        class="cart-item"
      >
        <div class="cart-item-main">
          <p class="cart-item-name">{{ item.name }}</p>
          <p class="cart-item-meta">
            {{ item.size }}
          </p>
        </div>
        <span class="cart-item-qty">{{ item.qty }}x</span>
      </article>
    </section>

    <!-- TOTAL -->
    <div class="cart-total-row">
      <span class="cart-total-pill">
        {{ total }} CHF
      </span>
    </div>

    <!-- BOUTON CHOOSE STORE -->
    <button class="cart-main-btn" type="button" @click="showShopOverlay = true">
      Choose store
    </button>
  </div>

  <!-- OVERLAY CHOOSE SHOP -->
  <div v-if="showShopOverlay" class="overlay-backdrop">
    <div class="overlay-panel overlay-panel--map">
      <h2 class="overlay-title">Choose the shop</h2>

      <div class="overlay-map-placeholder">
        Map here (Lausanne & co)
      </div>

      <button
        class="overlay-main-btn"
        type="button"
        @click="openTimeOverlay"
      >
        Choose the time
      </button>

      <button
        class="overlay-close-btn"
        type="button"
        @click="showShopOverlay = false"
      >
        ✕
      </button>
    </div>
  </div>

  <!-- OVERLAY CHOOSE TIME -->
  <div v-if="showTimeOverlay" class="overlay-backdrop">
    <div class="overlay-panel overlay-panel--time">
      <h2 class="overlay-title">Choose the time of pick up</h2>

      <ul class="time-list">
        <li
          v-for="slot in timeSlots"
          :key="slot"
          class="time-item"
          :class="{ 'time-item--active': selectedTime === slot }"
          @click="selectedTime = slot"
        >
          {{ slot }}
        </li>
      </ul>

      <button
        class="overlay-main-btn"
        type="button"
        @click="confirmTime"
      >
        Choose the time
      </button>

      <button
        class="overlay-close-btn"
        type="button"
        @click="showTimeOverlay = false"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * Données statiques pour l’instant
 * (on branchera l’API / store plus tard)
 */
const items = ref([
  {
    id: 1,
    name: 'Vanilla Matcha Latte',
    size: 'Medium',
    qty: 1,
    price: 8.9,
  },
  {
    id: 2,
    name: 'Classic Matcha Latte',
    size: 'Medium',
    qty: 1,
    price: 8.9,
  },
]);

const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
);

/* Overlays */
const showShopOverlay = ref(false);
const showTimeOverlay = ref(false);

const timeSlots = ['13:30', '13:45', '14:00', '14:15', '14:30', '14:45'];
const selectedTime = ref(timeSlots[0]);

const openTimeOverlay = () => {
  showShopOverlay.value = false;
  showTimeOverlay.value = true;
};

const confirmTime = () => {
  console.log('Store chosen, time:', selectedTime.value);
  showTimeOverlay.value = false;
  // plus tard: router.push vers un écran "Order summary"
};

const goBack = () => {
  router.back();
};
</script>