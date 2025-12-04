<template>
  <div class="product-page">
    <!-- HEADER -->
    <header class="product-header">
      <button class="icon-btn product-back" type="button" @click="goBack">
        ←
      </button>
      <h1 class="product-header-title">Product informations</h1>
      <span class="product-header-spacer"></span>
    </header>

    <!-- IMAGE / HERO -->
    <div class="product-hero">
      <!-- Remplace l'image quand tu auras les vraies -->
      <div class="product-hero-img-placeholder">
        Vanilla Matcha Latte
      </div>
      <!--
      <img
        src="@/assets/vanilla-matcha.png"
        alt="Vanilla Matcha Latte"
        class="product-hero-img"
      />
      -->
    </div>

    <!-- QUANTITÉ + PRIX -->
    <section class="product-qty-block">
      <div class="product-qty-controls">
        <button
          type="button"
          class="qty-btn"
          @click="decreaseQty"
          :disabled="quantity === 1"
        >
          −
        </button>
        <span class="qty-value">{{ quantity }}</span>
        <button type="button" class="qty-btn" @click="increaseQty">
          +
        </button>
      </div>

      <div class="product-price-pill">
        {{ totalPrice }} CHF
      </div>
    </section>

    <!-- OPTIONS + BOUTON ADD TO CART -->
    <section class="product-options-card">
      <h2 class="product-name">Vanilla Matcha Latte</h2>
      <p class="product-subtitle">Choose your options</p>

      <div class="product-option-group">
        <p class="product-option-label">Size</p>
        <div class="product-option-row">
          <button
            type="button"
            class="product-option-pill"
            :class="{ 'product-option-pill--active': size === 'small' }"
            @click="size = 'small'"
          >
            Small
          </button>
          <button
            type="button"
            class="product-option-pill"
            :class="{ 'product-option-pill--active': size === 'medium' }"
            @click="size = 'medium'"
          >
            Medium
          </button>
          <button
            type="button"
            class="product-option-pill"
            :class="{ 'product-option-pill--active': size === 'large' }"
            @click="size = 'large'"
          >
            Large
          </button>
        </div>
      </div>

      <button class="product-add-btn" type="button" @click="addToCart">
        add to cart ({{ quantity }})
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// plus tard on pourra récupérer le produit via l'API et le route param
const basePrice = 8.9;

const quantity = ref(1);
const size = ref('medium');

const unitPrice = computed(() => {
  if (size.value === 'small') return basePrice - 0.5;
  if (size.value === 'large') return basePrice + 1;
  return basePrice;
});

const totalPrice = computed(() =>
  (unitPrice.value * quantity.value).toFixed(2)
);

const increaseQty = () => {
  quantity.value += 1;
};

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

const addToCart = () => {
  console.log('ADD TO CART', {
    productId: 'demo-vanilla',
    quantity: quantity.value,
    size: size.value,
    unitPrice: unitPrice.value,
    total: totalPrice.value,
  });
  // plus tard: appel à ton store / API
};

const goBack = () => {
  router.back();
};
</script>