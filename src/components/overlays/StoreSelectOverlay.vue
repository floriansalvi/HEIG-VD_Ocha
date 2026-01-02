<template>
  <div class="overlay-backdrop" @click.self="$emit('close')">
    <div class="overlay-card">
      <div class="overlay-header">
        <h3 class="overlay-title">Choose the shop</h3>
        <button class="overlay-close" type="button" @click="$emit('close')">×</button>
      </div>

      <div class="overlay-map">
        <div class="overlay-map-placeholder">
          Map placeholder
        </div>
      </div>

      <ul class="overlay-list">
        <li v-for="s in stores" :key="s.id">
          <button
            type="button"
            class="overlay-list-item"
            :class="{ 'overlay-list-item--selected': s.id === selectedId }"
            @click="selectStore(s)"
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

const props = defineProps({
  modelValue: { type: Object, default: null }, // store sélectionné
  stores: {
    type: Array,
    default: () => [
      { id: 'lausanne', name: 'Ocha Matcha', city: 'Lausanne' },
      { id: 'vevey', name: 'Ocha Matcha', city: 'Vevey' },
      { id: 'montreux', name: 'Ocha Matcha', city: 'Montreux' },
    ],
  },
});

const emit = defineEmits(['close', 'select']);

const selectedId = ref(props.modelValue?.id ?? null);

watch(
  () => props.modelValue,
  (v) => (selectedId.value = v?.id ?? null)
);

const current = computed(() => props.stores.find((s) => s.id === selectedId.value) || null);

function selectStore(store) {
  selectedId.value = store.id;
}

function confirm() {
  if (!current.value) return;
  emit('select', current.value);
  emit('close');
}
</script>