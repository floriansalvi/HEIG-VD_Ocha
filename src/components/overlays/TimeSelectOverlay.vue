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

        <li v-if="times.length === 0" class="overlay-hint" style="list-style:none; padding: 10px 0;">
          No available times today.
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
  storeSelected: { type: Boolean, default: false }, // ✅ IMPORTANT
});

const emit = defineEmits(["close", "select"]);

const localSelectedTime = ref(props.selectedTime);

watch(
  () => props.selectedTime,
  (v) => (localSelectedTime.value = v || "")
);

// Si on change de store (storeSelected passe à false), on reset la sélection
watch(
  () => props.storeSelected,
  (v) => {
    if (!v) localSelectedTime.value = "";
  }
);

function confirm() {
  if (!props.storeSelected) return;
  if (!localSelectedTime.value) return;

  emit("select", localSelectedTime.value);
  emit("close");
}
</script>

<style scoped>
.overlay-hint {
  margin: 6px 0 12px;
  color: #8b8375;
  font-size: 13px;
}
</style>