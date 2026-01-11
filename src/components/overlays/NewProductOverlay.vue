<template>
  <div v-if="open" class="np-backdrop" @click.self="close">
    <div class="np-card" role="dialog" aria-modal="true">
      <div class="np-top">
        <div class="np-icon">🆕</div>
        <button class="np-close" type="button" @click="close" aria-label="Close">×</button>
      </div>

      <p class="np-title">New product</p>
      <p class="np-text">
        Nouveau produit : <strong>{{ productName }}</strong>
      </p>

      <button class="np-btn" type="button" @click="close">OK</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  product: { type: Object, default: null },
});

const emit = defineEmits(["close"]);

const productName = computed(() => props.product?.name || "—");

function close() {
  emit("close");
}
</script>

<style scoped>
/* centered overlay matching your UI: white card, soft shadow, rounded */
.np-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 2000;
}

.np-card {
  width: 100%;
  max-width: 320px;
  background: #fff;
  border-radius: 22px;
  padding: 16px 16px 14px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
}

.np-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.np-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e4f4d9;
  font-size: 18px;
}

.np-close {
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  color: #8b8375;
}

.np-title {
  margin: 10px 0 2px;
  font-size: 14px;
  font-weight: 800;
  color: #2f2a24;
}

.np-text {
  margin: 0 0 12px;
  font-size: 12px;
  color: #6d655a;
}

.np-btn {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  background: #000;
  color: #fff;
  cursor: pointer;
}
</style>