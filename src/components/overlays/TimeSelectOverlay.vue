<!-- src/components/overlays/TimeSelectOverlay.vue -->
<template>
  <!-- Backdrop: clicking outside the card closes the overlay -->
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-card overlay-card--time">
      <!-- Header: title + close button -->
      <div class="overlay-header">
        <h3 class="overlay-title">Pick up time</h3>
        <button class="overlay-close" type="button" @click="emit('close')">×</button>
      </div>

      <!-- Hint shown when no store is selected yet -->
      <p v-if="!storeSelected" class="overlay-hint">
        Select a store first.
      </p>

      <!-- Available times list (only shown if a store is selected) -->
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

        <!-- Fallback when no time slots are available -->
        <li
          v-if="times.length === 0"
          class="overlay-hint"
          style="list-style:none; padding: 10px 0;"
        >
          No available times today.
        </li>
      </ul>

      <!-- Confirm button: disabled until a store and a time are selected -->
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
  // List of available pickup times (HH:mm)
  times: { type: Array, default: () => [] },
  // Currently selected time coming from parent
  selectedTime: { type: String, default: "" },
  // Indicates whether a store has been selected
  storeSelected: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "select"]);

// Local state to allow selection without mutating props directly
const localSelectedTime = ref(props.selectedTime);

// Sync local state when parent-selected time changes
watch(
  () => props.selectedTime,
  (v) => (localSelectedTime.value = v || "")
);

// Reset selected time when store changes (or is unselected)
watch(
  () => props.storeSelected,
  (v) => {
    if (!v) localSelectedTime.value = "";
  }
);

/**
 * Confirms the selected time and sends it back to the parent,
 * then closes the overlay.
 */
function confirm() {
  if (!props.storeSelected) return;
  if (!localSelectedTime.value) return;

  emit("select", localSelectedTime.value);
  emit("close");
}
</script>

<style scoped>
/* Small helper text used for hints and empty states */
.overlay-hint {
  margin: 6px 0 12px;
  color: #8b8375;
  font-size: 13px;
}
</style>