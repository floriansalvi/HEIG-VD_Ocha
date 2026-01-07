<template>
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-card overlay-card--time">
      <div class="overlay-header">
        <h3 class="overlay-title">Pick up time</h3>
        <button class="overlay-close" type="button" @click="emit('close')">×</button>
      </div>

      <ul class="overlay-list overlay-list--time">
        <li v-for="t in times" :key="t">
          <button
            type="button"
            class="overlay-list-item overlay-list-item--time"
            :class="{ 'overlay-list-item--selected': t === localSelectedTime }"
            @click="localSelectedTime = t"
          >
            {{ t }}
          </button>
        </li>
      </ul>

      <button class="overlay-primary-btn" type="button" :disabled="!localSelectedTime" @click="confirm">
        Confirm
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  times: { type: Array, default: () => [] },
  selectedTime: { type: String, default: "" },
});

const emit = defineEmits(["close", "select"]);

const localSelectedTime = ref(props.selectedTime);

watch(
  () => props.selectedTime,
  (v) => (localSelectedTime.value = v || "")
);

function confirm() {
  if (!localSelectedTime.value) return;
  emit("select", localSelectedTime.value);
  emit("close");
}
</script>