<!-- src/views/AccountView.vue -->
<template>
  <div class="account-page">
    <!-- HEADER -->
    <header class="account-header">
      <button class="icon-btn" type="button" @click="goBack">
        ←
      </button>
      <h1 class="account-title">My account</h1>
      <span class="account-header-spacer"></span>
    </header>

    <!-- SCAN CARD -->
    <section class="account-card account-card--barcode">
      <p class="account-section-label">Scan your card !</p>

      <div class="account-barcode-wrapper">
        <div class="account-barcode-inner">
          <div class="account-barcode-stripes"></div>
        </div>
        <p class="account-barcode-number">9007438329951</p>
      </div>
    </section>

    <!-- FIDELITY JOURNEY -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Your fidelity journey</p>
        <button type="button" class="account-link-btn">Infos</button>
      </div>

      <div class="account-fidelity-card">
        <div class="account-fidelity-bg"></div>
        <div class="account-fidelity-content">
          <p class="account-fidelity-main">{{ cupsLeft }} cups left</p>
          <p class="account-fidelity-sub">Buy {{ cupsLeft }} more to get 1 free !</p>

          <div class="account-fidelity-dots">
            <span
              v-for="n in totalStamps"
              :key="n"
              class="account-dot"
              :class="{ 'account-dot--filled': n <= usedStamps }"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ORDER HISTORY -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Order history</p>
        <button type="button" class="account-link-btn">
          See all orders
        </button>
      </div>

      <ul class="account-orders-list">
        <li
          v-for="order in orders"
          :key="order.id"
          class="account-order-item"
        >
          <div class="account-order-main">
            <p class="account-order-date">{{ order.date }}</p>
            <p class="account-order-summary">{{ order.summary }}</p>
          </div>

          <div class="account-order-right">
            <span
              class="account-order-status"
              :class="{
                'account-order-status--preparation': order.status === 'in preparation',
                'account-order-status--finished': order.status === 'finished'
              }"
            >
              {{ order.statusLabel }}
            </span>
            <span class="account-order-arrow">›</span>
          </div>
        </li>
      </ul>
    </section>

    <!-- USUAL ORDER -->
    <section class="account-card">
      <p class="account-section-title">Usual order</p>

      <div class="account-usual-card">
        <div class="account-usual-row">
          <span class="account-usual-label">Product</span>
          <span class="account-usual-qty">Quantity</span>
        </div>
        <div class="account-usual-row">
          <span class="account-usual-value">{{ usualOrder.product }}</span>
          <span class="account-usual-value">{{ usualOrder.quantity }}</span>
        </div>

        <div class="account-usual-row account-usual-row--store">
          <div>
            <span class="account-usual-label">Store</span>
            <p class="account-usual-value">{{ usualOrder.store }}</p>
          </div>

          <button
            type="button"
            class="account-usual-edit-btn"
            @click="editUsualOrder"
          >
            ✏️ Edit order
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Mock fidélité
const cupsLeft = ref(2);
const totalStamps = 5;
const usedStamps = 3;

// Mock historique des commandes
const orders = ref([
  {
    id: 1,
    date: '25.09.2025',
    summary: '2× Classic Matcha latte',
    status: 'in preparation',
    statusLabel: 'in preparation',
  },
  {
    id: 2,
    date: '12.09.2025',
    summary: '4× Vanilla Matcha latte',
    status: 'finished',
    statusLabel: 'finished',
  },
  {
    id: 3,
    date: '05.08.2025',
    summary: '1× Vanilla Matcha latte',
    status: 'finished',
    statusLabel: 'finished',
  },
]);

// Mock usual order
const usualOrder = ref({
  product: 'Vanilla Matcha latte',
  quantity: 'x3',
  store: 'Grancy, Lausanne',
});

const goBack = () => {
  router.back();
};

const editUsualOrder = () => {
  // plus tard : ouvrir un flow pour modifier la commande habituelle
  console.log('EDIT USUAL ORDER', usualOrder.value);
};
</script>