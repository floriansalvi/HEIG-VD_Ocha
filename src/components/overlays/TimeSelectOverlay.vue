<template>
  <div class="overlay-backdrop" @click.self="$emit('close')">
    <div class="overlay-card overlay-card--time">
      <div class="overlay-header">
        <h3 class="overlay-title">Pick up time</h3>
        <button class="overlay-close" type="button" @click="$emit('close')">×</button>
      </div>

      <ul class="overlay-list overlay-list--time">
        <li v-for="t in times" :key="t">
          <button
            type="button"
            class="overlay-list-item overlay-list-item--time"
            :class="{ 'overlay-list-item--selected': t === selectedTime }"
            @click="selectedTime = t"
          >
            {{ t }}
          </button>
        </li>
      </ul>

      <button
        class="overlay-primary-btn"
        type="button"
        :disabled="!selectedTime"
        @click="confirm"
      >
        Confirm
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' }, // heure sélectionnée
  times: {
    type: Array,
    default: () => ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30'],
  },
});

const emit = defineEmits(['close', 'select']);

const selectedTime = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => (selectedTime.value = v || '')
);

function confirm() {
  if (!selectedTime.value) return;
  emit('select', selectedTime.value);
  emit('close');
}
</script>