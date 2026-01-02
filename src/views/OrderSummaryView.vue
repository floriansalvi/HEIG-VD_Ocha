<!-- src/views/OrderSummaryView.vue -->
<template>
  <div class="order-page">
    <!-- HEADER -->
    <header class="order-header">
      <button class="icon-btn" type="button" @click="goBack">
        ←
      </button>
      <h1 class="order-header-title">Order</h1>
      <span class="order-header-spacer"></span>
    </header>

    <!-- CARTE RÉSUMÉ -->
    <section class="order-card">
      <!-- Ligne “My order” -->
      <div class="order-product-row">
        <div class="order-product-img-placeholder"></div>

        <div class="order-product-info">
          <p class="order-product-name">My order</p>
          <p class="order-product-meta">
            Vanilla Matcha Latte, Classic Matcha Latte
          </p>
        </div>

        <span class="order-product-price">{{ total }} CHF</span>
      </div>

      <!-- Ligne shop -->
      <div class="order-info-row">
        <div class="order-info-left">
          <span class="order-info-icon">📍</span>
          <div>
            <p class="order-info-label">The shop</p>
            <p class="order-info-value">{{ shopName }}</p>
          </div>
        </div>
      </div>

      <!-- MAP (placeholder) -->
      <div class="order-map-card">
        <div class="order-map-placeholder">
          Map here ({{ shopName }})
        </div>
      </div>

      <!-- Ligne time -->
      <div class="order-info-row order-info-row--time">
        <div class="order-info-left">
          <span class="order-info-icon">⏰</span>
          <div>
            <p class="order-info-label">Pick up time</p>
            <p class="order-info-value">{{ pickupTime }}</p>
          </div>
        </div>
      </div>

      <!-- Bouton principal -->
      <button
        class="order-place-btn"
        type="button"
        :disabled="isPlacing"
        @click="placeOrder"
      >
        <span v-if="!isPlacing">Place order</span>
        <span v-else>Placing…</span>
      </button>
    </section>

    <!-- OVERLAY SUCCESS -->
    <div
      v-if="showSuccessOverlay"
      class="overlay-backdrop order-success-backdrop"
    >
      <div class="order-success-card">
        <div class="order-success-icon">✅</div>
        <h2 class="order-success-title">Order confirmed</h2>
        <p class="order-success-text">
          Your drinks will be ready at
          <strong>{{ pickupTime }}</strong>
          at
          <strong>{{ shopName }}</strong>.
        </p>
        <button
          type="button"
          class="order-success-btn"
          @click="goToCart"
        >
          Go to cart
        </button>
      </div>
    </div>
  </div>
</template>

<!-- src/views/OrderSummaryView.vue (seulement la partie <script setup>) -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const total = ref('17.80');
const shopName = ref('Lausanne, Ocha Matcha');
const pickupTime = ref('16:15');

const isPlacing = ref(false);
const showSuccessOverlay = ref(false);

const placeOrder = () => {
  if (isPlacing.value) return;
  isPlacing.value = true;

  console.log('PLACE ORDER', {
    total: total.value,
    shop: shopName.value,
    pickupTime: pickupTime.value,
  });

  setTimeout(() => {
    isPlacing.value = false;
    showSuccessOverlay.value = true;
  }, 700);
};

const goBack = () => {
  router.back();
};

const goToCart = () => {
  showSuccessOverlay.value = false;

  router.push({
    path: '/cart',
    query: {
      activeOrder: '1',
      total: total.value,
      shop: shopName.value,
      time: pickupTime.value,
    },
  });
};
</script>