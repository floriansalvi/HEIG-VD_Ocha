<template>
  <div class="phone-wrapper">
    <div class="phone-shell">
      <div class="phone-content">
        <RouterView />
      </div>

      <!-- bottom nav visible sauf sur login / register -->
      <BottomNav v-if="showBottomNav" />
    </div>
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router';
import { computed } from 'vue';

// ✅ bon chemin
import BottomNav from '@/components/ui/BottomNav.vue';

const route = useRoute();

const showBottomNav = computed(() => {
  return !['login', 'register'].includes(route.name);
});
</script>