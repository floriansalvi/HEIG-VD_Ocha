<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="item" :class="{ active: isActive('/') }">
      <span>🏠</span>
      <span class="label">Home</span>
    </RouterLink>

    <RouterLink to="/products" class="item" :class="{ active: isActive('/products') }">
      <span>🧋</span>
      <span class="label">Boissons</span>
    </RouterLink>

    <RouterLink to="/orders" class="item" :class="{ active: isActive('/orders') }">
      <span>📦</span>
      <span class="label">Commandes</span>
    </RouterLink>

    <RouterLink to="/account" class="item" :class="{ active: isActive('/account') }">
      <span>👤</span>
      <span class="label">Compte</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const isActive = (path) => route.path === path;
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  border-top: 1px solid #e0ddd6;
  background: #ffffff;
  z-index: 10;
}

.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 12px;
  color: #999;
}

.item span:first-child {
  font-size: 18px;
  line-height: 1;
}

.item.active {
  color: #5f8f3e;
  font-weight: 600;
}
.label {
  margin-top: 2px;
}
</style>