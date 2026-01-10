<template>
  <div ref="el" class="leaflet-mini-map"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import L from "leaflet";

const props = defineProps({
  center: { type: Object, required: true }, // { lat, lng }
  zoom: { type: Number, default: 13 },
  markers: { type: Array, default: () => [] }, // store markers MUST include: id, lat, lng, name, opening_hours
  selectedStoreId: { type: [String, null], default: null },
  fitToMarkers: { type: Boolean, default: true },
});

const emit = defineEmits(["select-store"]);

const el = ref(null);
let map = null;
let layer = null;

function clearLayer() {
  if (layer) {
    layer.remove();
    layer = null;
  }
}

function userIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:999px;
      background:#2563eb;border:2px solid #fff;
      box-shadow:0 6px 14px rgba(0,0,0,.25);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function storeIcon(isSelected) {
  const fill = isSelected ? "#111827" : "#16a34a";
  return L.divIcon({
    className: "",
    html: `
      <div style="transform: translate(-50%, -100%);">
        <svg width="28" height="34" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"
             style="filter: drop-shadow(0 6px 14px rgba(0,0,0,.25));">
          <path d="M12 0C6.9 0 2.8 4.1 2.8 9.2c0 6.9 9.2 22.8 9.2 22.8s9.2-15.9 9.2-22.8C21.2 4.1 17.1 0 12 0z"
                fill="${fill}"/>
          <circle cx="12" cy="9.5" r="4" fill="#ffffff"/>
        </svg>
      </div>`,
    iconSize: [28, 34],
    iconAnchor: [14, 34],
  });
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function weekdayEn(dayIndex) {
  // JS: 0=Sun ... 6=Sat
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return names[dayIndex] || "Today";
}

// opening_hours: [ [], ["09:00","18:30"], ... ] (0..6)
function todayHoursLine(opening_hours) {
  const day = new Date().getDay();
  const label = weekdayEn(day);

  if (!Array.isArray(opening_hours) || opening_hours.length < 7) {
    return `${label}: —`;
  }

  const range = opening_hours[day];
  if (!Array.isArray(range) || range.length < 2 || !range[0] || !range[1]) {
    return `${label}: Closed`;
  }

  return `${label}: ${range[0]}–${range[1]}`;
}

function tooltipHtml(m) {
  const title = esc(m?.name || "Store");
  const line = esc(todayHoursLine(m?.opening_hours));
  return `
    <div style="min-width:180px">
      <div style="font-weight:800;margin-bottom:2px;">${title}</div>
      <div style="font-size:12px;opacity:.85;">${line}</div>
    </div>
  `;
}

function renderMarkers() {
  if (!map) return;

  clearLayer();
  layer = L.layerGroup().addTo(map);

  const list = Array.isArray(props.markers) ? props.markers : [];
  const latLngs = [];

  for (const m of list) {
    if (!Number.isFinite(Number(m?.lat)) || !Number.isFinite(Number(m?.lng))) continue;

    const isSelected = !!props.selectedStoreId && String(m.id) === String(props.selectedStoreId);

    if (m.type === "user") {
      L.marker([m.lat, m.lng], { icon: userIcon(), interactive: false }).addTo(layer);
      latLngs.push([m.lat, m.lng]);
      continue;
    }

    // store marker
    const marker = L.marker([m.lat, m.lng], { icon: storeIcon(isSelected) }).addTo(layer);

    // ✅ tooltip au hover (et sticky)
    marker.bindTooltip(tooltipHtml(m), {
      direction: "top",
      offset: [0, -12],
      opacity: 0.95,
      sticky: true,
      className: "ocha-tooltip",
    });

    // ✅ click = sélection (utile overlay)
    marker.on("click", () => {
      if (m?.id) emit("select-store", String(m.id));
      // Option: ouvrir tooltip au click aussi
      marker.openTooltip();
    });

    // ✅ si sélectionné, montre le tooltip direct
    if (isSelected) {
      setTimeout(() => marker.openTooltip(), 0);
    }

    latLngs.push([m.lat, m.lng]);
  }

  if (props.fitToMarkers && latLngs.length >= 2) {
    map.fitBounds(L.latLngBounds(latLngs), { padding: [18, 18] });
  } else if (props.fitToMarkers && latLngs.length === 1) {
    map.setView(latLngs[0], props.zoom);
  }
}

onMounted(() => {
  map = L.map(el.value, {
    zoomControl: true,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: true,
    touchZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: false,
  }).setView([props.center.lat, props.center.lng], props.zoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

  renderMarkers();
  setTimeout(() => map?.invalidateSize(), 80);
});

watch(
  () => props.center,
  (c) => {
    if (!map || !c) return;
    if (!props.fitToMarkers) map.setView([c.lat, c.lng], props.zoom);
  },
  { deep: true }
);

watch(() => props.markers, renderMarkers, { deep: true });
watch(() => props.selectedStoreId, renderMarkers);

onBeforeUnmount(() => {
  clearLayer();
  map?.remove();
  map = null;
});
</script>

<style scoped>
.leaflet-mini-map {
  width: 100%;
  height: 150px;
  border-radius: 14px;
  overflow: hidden;
  touch-action: none;
}
</style>

<style>
/* tooltip style (global, car Leaflet l’injecte hors scope) */
.ocha-tooltip {
  border-radius: 12px;
  padding: 8px 10px;
  border: none;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
}
</style>