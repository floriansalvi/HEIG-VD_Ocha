<template>
  <nav class="bottom-nav">
    <RouterLink
      to="/"
      class="item"
      :class="{ active: $route.name === 'home' }"
    >
      <span>🏠</span>
      <span class="label">Home</span>
    </RouterLink>

    <RouterLink
      to="/products"
      class="item"
      :class="{ active: $route.name === 'products-list' }"
    >
      <span>🥤</span>
      <span class="label">Drinks</span>
    </RouterLink>

    <RouterLink
      to="/orders"
      class="item"
      :class="{ active: $route.name === 'orders' }"
    >
      <span>🧾</span>
      <span class="label">Orders</span>
    </RouterLink>

    <RouterLink
      to="/account"
      class="item"
      :class="{ active: $route.name === 'account' }"
    >
      <span>👤</span>
      <span class="label">Account</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>