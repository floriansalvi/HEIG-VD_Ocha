<template>
  <div class="cart-page">
    <!-- HEADER -->
    <header class="cart-header">
      <button class="icon-btn" type="button" @click="goBack">
        ←
      </button>
      <h1 class="cart-title">Cart</h1>
      <span class="cart-header-spacer"></span>
    </header>

    <!-- LISTE DES BOISSONS -->
    <section v-if="cartItems.length" class="cart-list">
      <article
        v-for="item in cartItems"
        :key="item.id"
        class="cart-item"
      >
        <div class="cart-item-main">
          <div class="cart-thumb"></div>

          <div class="cart-item-info">
            <p class="cart-item-name">{{ item.name }}</p>
            <p class="cart-item-size">
              {{ item.size }} · {{ item.temperature }}
            </p>
          </div>

          <p class="cart-item-price">
            {{ (item.price * item.quantity).toFixed(2) }} CHF
          </p>
        </div>

        <p class="cart-item-meta">
          x{{ item.quantity }} · {{ item.milk }} milk
        </p>
      </article>
    </section>

    <!-- MESSAGE SI PANIER VIDE -->
    <p v-else class="cart-item-meta">
      Your cart is empty.
    </p>

    <!-- SUMMARY + CHOICE STORE / TIME -->
    <section v-if="cartItems.length" class="cart-summary">
      <div class="cart-total-line">
        <span>Total</span>
        <span class="cart-total-amount">{{ total }} CHF</span>
      </div>

      <!-- BOUTON CHOIX MAGASIN -->
      <button
        type="button"
        class="cart-choose-btn"
        @click="isStoreOverlayOpen = true"
      >
        <div class="cart-choose-main">
          <span>The shop</span>
          <span class="cart-choose-sub">
            {{ selectedStoreLabel }}
          </span>
        </div>
      </button>

      <!-- BOUTON CHOIX HEURE -->
      <button
        type="button"
        class="cart-choose-btn"
        @click="isTimeOverlayOpen = true"
      >
        <div class="cart-choose-main">
          <span>Pick up time</span>
          <span class="cart-choose-sub">
            {{ selectedTime || 'Choose time' }}
          </span>
        </div>
      </button>

      <!-- BOUTON CONTINUE -->
      <button
        class="cart-place-btn"
        type="button"
        :disabled="!canContinue"
        @click="goToOrder"
      >
        Continue
      </button>
    </section>

    <!-- OVERLAYS -->
    <StoreSelectOverlay
      v-if="isStoreOverlayOpen"
      v-model="selectedStoreId"
      @close="isStoreOverlayOpen = false"
    />

    <TimeSelectOverlay
      v-if="isTimeOverlayOpen"
      v-model="selectedTime"
      @close="isTimeOverlayOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import StoreSelectOverlay from '@/components/overlays/StoreSelectOverlay.vue';
import TimeSelectOverlay from '@/components/overlays/TimeSelectOverlay.vue';

const router = useRouter();

/**
 * Panier MOCK
 * Plus tard ça viendra du backend / Pinia
 */
const cartItems = ref([
  {
    id: 1,
    name: 'Vanilla Matcha Latte',
    size: 'M',
    temperature: 'iced',
    milk: 'oat',
    price: 6.9,
    quantity: 1,
  },
  {
    id: 2,
    name: 'Classic Matcha Latte',
    size: 'L',
    temperature: 'warm',
    milk: 'almond',
    price: 7.5,
    quantity: 1,
  },
]);

/**
 * Total auto-calculé
 */
const total = computed(() => {
  const sum = cartItems.value.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return sum.toFixed(2);
});

/**
 * Store & time
 */
const selectedStoreId = ref(''); // 'lausanne' / 'geneve'
const selectedTime = ref('');    // ex '16:15'

// Liste de magasins (pour afficher le label)
const stores = [
  { id: 'lausanne', label: 'Ocha Matcha Lausanne' },
  { id: 'geneve', label: 'Ocha Matcha Genève' },
];

const selectedStoreLabel = computed(() => {
  if (!selectedStoreId.value) return 'Choose store';
  const s = stores.find((s) => s.id === selectedStoreId.value);
  return s ? s.label : 'Choose store';
});

/**
 * Overlays
 */
const isStoreOverlayOpen = ref(false);
const isTimeOverlayOpen = ref(false);

/**
 * Peut-on continuer ?
 */
const canContinue = computed(() => {
  return (
    cartItems.value.length > 0 &&
    !!selectedStoreId.value &&
    !!selectedTime.value
  );
});

/**
 * Actions
 */
const goBack = () => {
  router.back();
};

const goToOrder = () => {
  if (!canContinue.value) return;

  // plus tard on enverra ces infos à OrderSummary via store / params
  console.log('GO TO ORDER', {
    total: total.value,
    store: selectedStoreLabel.value,
    pickupTime: selectedTime.value,
  });

  router.push('/order');
};
</script>