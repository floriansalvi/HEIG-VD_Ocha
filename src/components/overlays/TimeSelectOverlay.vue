<template>
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-card overlay-card--time">
      <div class="overlay-header">
        <h3 class="overlay-title">Pick up time</h3>
        <button class="overlay-close" type="button" @click="emit('close')">×</button>
      </div>

      <p v-if="!storeSelected" class="overlay-hint">
        Select a store first.
      </p>

      <p v-else-if="!times.length" class="overlay-hint">
        No pick up times available (store closed or opening hours missing).
      </p>

      <ul v-else class="overlay-list overlay-list--time">
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

      <button
        class="overlay-primary-btn"
        type="button"
        :disabled="!storeSelected || !localSelectedTime"
        @click="confirm"
      >
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
  storeSelected: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "select"]);

const localSelectedTime = ref(props.selectedTime);

watch(
  () => props.selectedTime,
  (v) => (localSelectedTime.value = v || "")
);

watch(
  () => props.times,
  () => {
    // si la time sélectionnée n'existe plus dans la liste, reset
    if (localSelectedTime.value && !props.times.includes(localSelectedTime.value)) {
      localSelectedTime.value = "";
    }
  }
);

function confirm() {
  if (!props.storeSelected || !localSelectedTime.value) return;
  emit("select", localSelectedTime.value);
  emit("close");
}
</script>

<style scoped>
.overlay-hint {
  margin: 8px 0 12px;
  font-size: 12px;
  color: #8b8375;
}
</style>