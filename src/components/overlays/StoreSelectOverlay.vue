<!-- src/components/overlays/StoreSelectOverlay.vue -->
<template>
  <!-- Backdrop: click outside the card closes the overlay -->
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-card">
      <!-- Header: title + close button -->
      <div class="overlay-header">
        <h3 class="overlay-title">Choose the shop</h3>
        <button class="overlay-close" type="button" @click="emit('close')">×</button>
      </div>

      <!-- Geolocation helper messages (optional UI feedback) -->
      <p v-if="geoStatus === 'loading'" class="overlay-geo-text">
        Getting your location…
      </p>
      <p v-else-if="geoStatus === 'denied'" class="overlay-geo-text">
        Location access denied — showing default order.
      </p>

      <!-- Mini map: user marker + all stores markers -->
      <div class="overlay-map">
        <LeafletMiniMap
          :center="mapCenter"
          :zoom="13"
          :markers="mapMarkers"
          :selectedStoreId="localSelectedId"
          :fitToMarkers="true"
          @select-store="(id) => (localSelectedId = id)"
        />
      </div>

      <!-- Stores near the user (only shown if geolocation is available) -->
      <div v-if="geoOk && storesAroundYou.length" class="overlay-section">
        <p class="overlay-section-title">Stores around you</p>

        <ul class="overlay-list">
          <li v-for="s in storesAroundYou" :key="s._id">
            <button
              type="button"
              class="overlay-list-item"
              :class="{ 'overlay-list-item--selected': s._id === localSelectedId }"
              @click="localSelectedId = s._id"
            >
              <span class="overlay-list-main">
                <strong>{{ s.name }}</strong>
                <span class="overlay-list-city">{{ s.address?.city }}</span>
              </span>

              <span v-if="s._distanceKm != null" class="overlay-list-distance">
                {{ formatKm(s._distanceKm) }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Full stores list (sorted by distance when geolocation is available) -->
      <div class="overlay-section">
        <p class="overlay-section-title">{{ geoOk ? "Other stores" : "Stores" }}</p>

        <ul class="overlay-list">
          <li v-for="s in otherStores" :key="s._id">
            <button
              type="button"
              class="overlay-list-item"
              :class="{ 'overlay-list-item--selected': s._id === localSelectedId }"
              @click="localSelectedId = s._id"
            >
              <span class="overlay-list-main">
                <strong>{{ s.name }}</strong>
                <span class="overlay-list-city">{{ s.address?.city }}</span>
              </span>

              <span v-if="geoOk && s._distanceKm != null" class="overlay-list-distance">
                {{ formatKm(s._distanceKm) }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Confirm button returns the selected store object to the parent -->
      <button class="overlay-primary-btn" type="button" :disabled="!current" @click="confirm">
        Confirm
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import LeafletMiniMap from "@/components/ui/OchaMap.vue";

const props = defineProps({
  // Stores list from the parent view (already fetched from the API)
  stores: { type: Array, default: () => [] },
  // Current selected store id coming from the parent
  selectedId: { type: [String, null], default: null },
});

const emit = defineEmits(["close", "select"]);

// Local selection state so the overlay can change selection without mutating props
const localSelectedId = ref(props.selectedId);
watch(() => props.selectedId, (v) => (localSelectedId.value = v));

/* ---------- GEOLOCATION STATE ---------- */
// idle | loading | ok | denied | error
const geoStatus = ref("idle");
// user location stored as { lat, lng }
const userLoc = ref(null);
// convenience boolean used across the UI/computed props
const geoOk = computed(() => geoStatus.value === "ok" && !!userLoc.value);

/* ---------- COORDS HELPERS ---------- */
/**
 * Backend stores coordinates in GeoJSON format: [lng, lat]
 * This helper converts it to { lat, lng } for the UI/map.
 */
function getLatLngFromStore(store) {
  const coords = store?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/* ---------- DISTANCE HELPERS ---------- */
/**
 * Haversine distance in km between 2 points:
 * a = {lat,lng}, b = {lat,lng}
 */
function distanceKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Small formatter for distances (m under 1km, km otherwise). */
function formatKm(km) {
  if (!Number.isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/* ---------- STORES SORTED BY DISTANCE ---------- */
/**
 * Adds a temporary _distanceKm field to stores when geolocation is available.
 * Then sorts by distance (unknown distances go at the end).
 */
const storesWithDistance = computed(() => {
  const base = Array.isArray(props.stores) ? props.stores : [];
  if (!geoOk.value) return base.map((s) => ({ ...s, _distanceKm: null }));

  const me = userLoc.value;
  return base
    .map((s) => {
      const ll = getLatLngFromStore(s);
      const d = ll ? distanceKm(me, ll) : null;
      return { ...s, _distanceKm: d };
    })
    .sort((a, b) => {
      if (a._distanceKm == null && b._distanceKm == null) return 0;
      if (a._distanceKm == null) return 1;
      if (b._distanceKm == null) return -1;
      return a._distanceKm - b._distanceKm;
    });
});

// "around you" section settings
const AROUND_RADIUS_KM = 8;
const AROUND_MAX = 3;

/**
 * Picks up to 3 stores:
 * - preferably within radius
 * - otherwise nearest 3 stores
 */
const storesAroundYou = computed(() => {
  if (!geoOk.value) return [];
  const list = storesWithDistance.value.filter((s) => s._distanceKm != null);
  const inRadius = list.filter((s) => s._distanceKm <= AROUND_RADIUS_KM);
  if (inRadius.length) return inRadius.slice(0, AROUND_MAX);
  return list.slice(0, AROUND_MAX);
});

/** "Other stores" excludes those already shown in "around you". */
const otherStores = computed(() => {
  const idsAround = new Set(storesAroundYou.value.map((s) => s._id));
  return storesWithDistance.value.filter((s) => !idsAround.has(s._id));
});

/** Current selected store object (used for "Confirm"). */
const current = computed(() => {
  const list = Array.isArray(props.stores) ? props.stores : [];
  return list.find((s) => String(s._id) === String(localSelectedId.value)) || null;
});

/* ---------- MAP COMPUTED DATA ---------- */
/** Only keep stores that have valid coordinates for map markers. */
const storesForMap = computed(() => {
  const base = Array.isArray(props.stores) ? props.stores : [];
  return base.filter((s) => !!getLatLngFromStore(s));
});

/**
 * Map center priority:
 * 1) user location (if available)
 * 2) first valid store
 * 3) Lausanne fallback
 */
const mapCenter = computed(() => {
  if (geoOk.value && userLoc.value) return userLoc.value;

  const first = storesForMap.value[0];
  const ll = first ? getLatLngFromStore(first) : null;
  if (ll) return ll;

  return { lat: 46.5197, lng: 6.6323 };
});

/**
 * Map markers:
 * - user marker (optional)
 * - all store markers + tooltip data
 */
const mapMarkers = computed(() => {
  const markers = [];

  if (geoOk.value && userLoc.value) {
    markers.push({ id: "me", type: "user", lat: userLoc.value.lat, lng: userLoc.value.lng });
  }

  for (const s of storesForMap.value) {
    const ll = getLatLngFromStore(s);
    if (!ll) continue;

    markers.push({
      id: s._id,
      type: "store",
      ...ll,
      // Tooltip infos used by the map component
      name: s.name,
      opening_hours: s.opening_hours,
    });
  }

  return markers;
});

/* ---------- ACTIONS ---------- */
/** Confirms selection and closes overlay. */
function confirm() {
  if (!current.value) return;
  emit("select", current.value);
  emit("close");
}

/* ---------- GEOLOCATION INIT ---------- */
/**
 * Try to get user's position once.
 * If blocked/denied, we just keep default ordering (no crash).
 */
onMounted(() => {
  if (!navigator.geolocation) {
    geoStatus.value = "error";
    return;
  }

  geoStatus.value = "loading";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLoc.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      geoStatus.value = "ok";
    },
    (err) => {
      geoStatus.value = err?.code === 1 ? "denied" : "error";
      userLoc.value = null;
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
  );
});
</script>

<style scoped>
/* Geolocation helper text (small + subtle) */
.overlay-geo-text {
  margin: 0 0 10px;
  font-size: 12px;
  color: #8b8375;
}

.overlay-section {
  margin-top: 10px;
}

.overlay-section-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #6c6254;
}

.overlay-list-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.overlay-list-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.overlay-list-main strong {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overlay-list-city {
  font-size: 12px;
  color: #8b8375;
  font-weight: 600;
}

.overlay-list-distance {
  font-size: 12px;
  color: #8b8375;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>