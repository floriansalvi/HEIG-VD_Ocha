<template>
  <div class="overlay-backdrop" @click.self="onClose">
    <div class="overlay-card">
      <div class="overlay-header">
        <h2 class="overlay-title">Choose store</h2>
        <button class="overlay-close" type="button" @click="onClose">×</button>
      </div>

      <div class="overlay-map">
        <div class="overlay-map-placeholder">
          Map / store locations
        </div>
      </div>

      <ul class="overlay-list">
        <li
          v-for="store in stores"
          :key="store.id"
        >
          <button
            type="button"
            class="overlay-list-item"
            :class="{ 'overlay-list-item--selected': store.id === modelValue }"
            @click="select(store)"
          >
            <span class="overlay-list-main">
              <strong>{{ store.name }}</strong>
              <span class="overlay-list-city">{{ store.city }}</span>
            </span>
          </button>
        </li>
      </ul>

      <!-- Si tu veux garder un bouton -->
      <!--
      <button
        class="overlay-primary-btn"
        type="button"
        :disabled="!modelValue"
        @click="onClose"
      >
        Close
      </button>
      -->
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:modelValue', 'close']);

// mêmes shops que dans la maquette
const stores = [
  { id: 'lausanne', name: 'Ocha Matcha Lausanne', city: 'Lausanne' },
  { id: 'geneve', name: 'Ocha Matcha Genève', city: 'Genève' },
];

const select = (store) => {
  // ✅ on informe le parent (CartView) directement
  emits('update:modelValue', store.id);
  emits('close');
};

const onClose = () => {
  emits('close');
};
</script>