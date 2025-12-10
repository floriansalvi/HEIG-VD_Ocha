<template>
  <nav class="bottom-nav">
    <RouterLink
      to="/"
      class="item"
      :class="{ active: current === 'home' }"
    >
      <span class="icon">🏠</span>
      <span class="label">Home</span>
    </RouterLink>

    <RouterLink
      to="/products"
      class="item"
      :class="{ active: current === 'products' }"
    >
      <span class="icon">🥤</span>
      <span class="label">Drinks</span>
    </RouterLink>

    <RouterLink
      to="/cart"
      class="item"
      :class="{ active: current === 'cart' }"
    >
      <span class="icon">🧾</span>
      <span class="label">Order</span>
    </RouterLink>

    <RouterLink
      to="/account"
      class="item"
      :class="{ active: current === 'account' }"
    >
      <span class="icon">👤</span>
      <span class="label">Account</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const current = computed(() => {
  const path = route.path;

  if (path.startsWith("/products")) return "products";
  if (path.startsWith("/orders")) return "orders";
  if (path.startsWith("/account")) return "account";

  return "home";
});
</script>

<style scoped>
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  height: 64px;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;

  display: flex;
  align-items: center;
  justify-content: space-around;

  z-index: 20;
}

.item {
  flex: 1;
  text-decoration: none;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  color: #9a958c;
}

.item.active {
  color: var(--ocha-green);
  font-weight: 600;
}

.icon {
  font-size: 20px;
  line-height: 1;
}

.label {
  margin-top: 3px;
}
</style>