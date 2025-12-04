<template>
  <div class="phone-wrapper">
    <div class="phone-shell">
      <!-- Contenu scrollable à l'intérieur du "téléphone" -->
      <div class="phone-content">
        <RouterView />
      </div>

      <!-- Bottom nav seulement si on n'est pas sur login / register -->
      <BottomNav v-if="showBottomNav" />
    </div>
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router';
import { computed } from 'vue';
import BottomNav from './components/BottomNav.vue';

const route = useRoute();

const showBottomNav = computed(
  () => !['login', 'register'].includes(route.name)
);
</script>