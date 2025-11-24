<template>
  <div class="app">
    <RouterView class="view" />
    <BottomNav />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import BottomNav from './components/BottomNav.vue';
</script>

<style>
.app {
  min-height: 100vh;
  padding-bottom: 56px; /* place pour la bottom nav */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #faf6f0;
  box-sizing: border-box;
}

.view {
  padding: 16px;
}
</style>