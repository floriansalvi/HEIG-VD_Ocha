<template>
  <div ref="el" class="leaflet-mini-map"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import L from 'leaflet';

// Fix icons (souvent nécessaire avec Vite)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const props = defineProps({
  center: { type: Object, required: true }, // { lat, lng }
  zoom: { type: Number, default: 13 },
  marker: { type: Object, default: null }, // { lat, lng } ou null
});

const el = ref(null);
let map = null;
let markerLayer = null;

function setMarker(m) {
  if (!map) return;

  if (markerLayer) {
    markerLayer.remove();
    markerLayer = null;
  }

  if (m?.lat != null && m?.lng != null) {
    markerLayer = L.marker([m.lat, m.lng]).addTo(map);
  }
}

onMounted(() => {
  map = L.map(el.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([props.center.lat, props.center.lng], props.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  setMarker(props.marker ?? props.center);

  // Important si la map est dans une card/overlay: force le recalcul
  setTimeout(() => {
    map?.invalidateSize();
  }, 0);
});

watch(
  () => props.center,
  (c) => {
    if (!map) return;
    map.setView([c.lat, c.lng], props.zoom);
    setMarker(props.marker ?? c);
  },
  { deep: true }
);

watch(
  () => props.marker,
  (m) => setMarker(m),
  { deep: true }
);

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<style scoped>
.leaflet-mini-map {
  width: 100%;
  height: 150px; /* ✅ sans ça, rien ne s’affiche */
  border-radius: 14px;
  overflow: hidden;
}
</style>