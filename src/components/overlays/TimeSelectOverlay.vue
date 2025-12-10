<template>
  <div class="overlay-backdrop" @click.self="onClose">
    <div class="overlay-card overlay-card--time">
      <div class="overlay-header">
        <h2 class="overlay-title">Pick up time</h2>
        <button class="overlay-close" type="button" @click="onClose">×</button>
      </div>

      <div class="overlay-list overlay-list--time">
        <button
          v-for="slot in slots"
          :key="slot"
          type="button"
          class="overlay-list-item overlay-list-item--time"
          :class="{ 'overlay-list-item--selected': slot === selectedTime }"
          @click="selectedTime = slot"
        >
          {{ slot }}
        </button>
      </div>

      <button
        class="overlay-primary-btn"
        type="button"
        :disabled="!selectedTime"
        @click="confirm"
      >
        Confirm time
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:modelValue', 'close']);

const slots = [
  '16:00',
  '16:15',
  '16:30',
  '16:45',
  '17:00',
  '17:15',
];

const selectedTime = ref(props.modelValue || '');

const confirm = () => {
  if (!selectedTime.value) return;
  emits('update:modelValue', selectedTime.value);
  emits('close');
};

const onClose = () => {
  emits('close');
};
</script>