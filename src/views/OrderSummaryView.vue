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

      <!-- Ligne shop (cliquable → overlay) -->
      <div class="order-info-row order-info-row--clickable" @click="openStoreOverlay">
        <div class="order-info-left">
          <span class="order-info-icon">📍</span>
          <div>
            <p class="order-info-label">The shop</p>
            <p class="order-info-value">{{ shopName }}</p>
          </div>
        </div>
      </div>

      <!-- MAP (maquette pour l’instant) -->
      <div class="order-map-card">
        <div class="order-map-placeholder">
          Map here ({{ shopName }})
        </div>
      </div>

      <!-- Ligne time (cliquable → overlay) -->
      <div
        class="order-info-row order-info-row--time order-info-row--clickable"
        @click="openTimeOverlay"
      >
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

    <!-- OVERLAYS -->
    <StoreSelectOverlay
      v-model="showStoreOverlay"
      :stores="stores"
      @select="handleStoreSelect"
    />

    <TimeSelectOverlay
      v-model="showTimeOverlay"
      :times="timeSlots"
      @select="handleTimeSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

/**
 * On récupère les valeurs depuis la query si dispo
 * sinon on garde des valeurs par défaut.
 */
const total = ref(route.query.total || '17.80');
const shopName = ref(route.query.shop || 'Lausanne, Ocha Matcha');
const pickupTime = ref(route.query.time || '16:15');

const isPlacing = ref(false);

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
    router.push('/orders');
  }, 800);
};

const goBack = () => {
  router.back();
};
</script>