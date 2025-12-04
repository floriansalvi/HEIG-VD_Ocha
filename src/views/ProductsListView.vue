<template>
  <div class="products-page">
  

    <section class="products-panel">
      <h1 class="products-panel-title">Our matchas</h1>

      <!-- onglets iced / warm -->
      <div class="products-tabs">
        <button
          type="button"
          class="products-tab"
          :class="{ 'products-tab--active': activeTab === 'iced' }"
          @click="activeTab = 'iced'"
        >
          iced
        </button>
        <button
          type="button"
          class="products-tab"
          :class="{ 'products-tab--active': activeTab === 'warm' }"
          @click="activeTab = 'warm'"
        >
          warm
        </button>
      </div>

      <!-- grille de boissons -->
      <div class="products-grid">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="product-card-header">
            <span class="product-price-tag">From {{ product.price }}</span>
            <button class="product-fav-btn" type="button">☆</button>
          </div>

          <div class="product-image-placeholder">
            <!-- ici tu mettras <img :src="product.imageUrl" /> quand l'API sera branchée -->
          </div>

          <div class="product-card-body">
            <p class="product-name">{{ product.name }}</p>
            <p class="product-type">Matcha Latte</p>
          </div>

          <button class="product-arrow-btn" type="button">
            &gt;
          </button>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const activeTab = ref('iced');

const products = [
  { id: 1, name: 'Classic Matcha Latte', price: '6.50 CHF', type: 'iced' },
  { id: 2, name: 'Vanilla Matcha Latte', price: '6.90 CHF', type: 'iced' },
  { id: 3, name: 'Coconut Matcha Latte', price: '6.90 CHF', type: 'iced' },
  { id: 4, name: 'Lavender Matcha Latte', price: '6.90 CHF', type: 'iced' },
  { id: 5, name: 'Strawberry Matcha Latte', price: '6.90 CHF', type: 'iced' },
  { id: 6, name: 'Apricot Matcha Latte', price: '6.90 CHF', type: 'iced' },
  { id: 7, name: 'Mixed Berries Matcha Latte', price: '6.90 CHF', type: 'iced' },
  { id: 8, name: 'Açaí Matcha Latte', price: '6.90 CHF', type: 'iced' },
  { id: 9, name: 'Mango Matcha Latte', price: '6.90 CHF', type: 'warm' },
  { id: 10, name: 'Blueberry Matcha Latte', price: '6.90 CHF', type: 'warm' },
];

const filteredProducts = computed(() =>
  products.filter((p) => p.type === activeTab.value)
);
</script>