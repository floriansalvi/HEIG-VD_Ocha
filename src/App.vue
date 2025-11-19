<template>
  <div class="app">
    <RouterView />
    <BottomNav />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
.app {
  padding-bottom: 72px; /* pour laisser la place à la bottom nav */
  min-height: 100vh;
}
</style>