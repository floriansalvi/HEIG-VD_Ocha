<template>
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-card">
      <div class="overlay-header">
        <h3 class="overlay-title">Choose the shop</h3>
        <button class="overlay-close" type="button" @click="emit('close')">×</button>
      </div>

      <div class="overlay-map">
        <LeafletMiniMap :center="mapCenter" :marker="mapCenter" />
      </div>

      <ul class="overlay-list">
        <li v-for="s in stores" :key="s.id">
          <button
            type="button"
            class="overlay-list-item"
            :class="{ 'overlay-list-item--selected': s.id === localSelectedId }"
            @click="localSelectedId = s.id"
          >
            <span class="overlay-list-main">
              <strong>{{ s.name }}</strong>
              <span class="overlay-list-city">{{ s.city }}</span>
            </span>
          </button>
        </li>
      </ul>

      <button
        class="overlay-primary-btn"
        type="button"
        :disabled="!current"
        @click="confirm"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import LeafletMiniMap from '@/components/ui/OchaMap.vue';

const props = defineProps({
  stores: { type: Array, default: () => [] },
  selectedId: { type: [String, Number, null], default: null },
});

const emit = defineEmits(['close', 'select']);

const localSelectedId = ref(props.selectedId);

watch(
  () => props.selectedId,
  (v) => (localSelectedId.value = v)
);

const current = computed(() => props.stores.find((s) => s.id === localSelectedId.value) || null);

// Pour l’instant on centre Lausanne.
// Quand tu auras lat/lng par store, tu pourras faire mapCenter = current.value
const mapCenter = computed(() => {
  // Lausanne approx
  return { lat: 46.5197, lng: 6.6323 };
});

function confirm() {
  if (!current.value) return;
  emit('select', current.value);
  emit('close');
}
</script>