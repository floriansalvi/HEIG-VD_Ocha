<template>
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-card">
      <div class="overlay-header">
        <h3 class="overlay-title">Choose the shop</h3>
        <button class="overlay-close" type="button" @click="emit('close')">×</button>
      </div>

      <!-- INFO GEOLOC -->
      <p v-if="geoStatus === 'loading'" class="overlay-geo-text">
        Getting your location…
      </p>
      <p v-else-if="geoStatus === 'denied'" class="overlay-geo-text">
        Location access denied — showing default order.
      </p>

      <!-- MAP -->
      <div class="overlay-map">
        <LeafletMiniMap
          :center="mapCenter"
          :zoom="13"
          :markers="mapMarkers"
          :selectedStoreId="localSelectedId"
          :fitToMarkers="true"
        />
      </div>

      <!-- STORES AROUND YOU -->
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

              <span class="overlay-list-distance">
                {{ formatKm(s._distanceKm) }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <!-- OTHER STORES -->
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
  stores: { type: Array, default: () => [] },
  selectedId: { type: [String, null], default: null },
});

const emit = defineEmits(["close", "select"]);
const localSelectedId = ref(props.selectedId);

watch(() => props.selectedId, (v) => (localSelectedId.value = v));

const geoStatus = ref("idle"); // idle | loading | ok | denied | error
const userLoc = ref(null); // { lat, lng }
const geoOk = computed(() => geoStatus.value === "ok" && !!userLoc.value);

function getLatLngFromStore(store) {
  const coords = store?.location?.coordinates; // [lng, lat]
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

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

function formatKm(km) {
  if (!Number.isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

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

const AROUND_RADIUS_KM = 8;
const AROUND_MAX = 3;

const storesAroundYou = computed(() => {
  if (!geoOk.value) return [];
  const list = storesWithDistance.value.filter((s) => s._distanceKm != null);
  const inRadius = list.filter((s) => s._distanceKm <= AROUND_RADIUS_KM);
  if (inRadius.length) return inRadius.slice(0, AROUND_MAX);
  return list.slice(0, AROUND_MAX);
});

const otherStores = computed(() => {
  const idsAround = new Set(storesAroundYou.value.map((s) => s._id));
  return storesWithDistance.value.filter((s) => !idsAround.has(s._id));
});

const current = computed(
  () => props.stores.find((s) => s._id === localSelectedId.value) || null
);

/**
 * ✅ 3 shops “fixes” sur la map :
 * - si geoOk -> 3 plus proches (storesWithDistance est déjà trié)
 * - sinon -> 3 premiers
 * - si store sélectionné pas dedans -> on le force dans le top3
 */
const storesForMap = computed(() => {
  const base = geoOk.value ? storesWithDistance.value : (props.stores || []);
  let top = base.filter((s) => getLatLngFromStore(s)).slice(0, 3);

  if (current.value && getLatLngFromStore(current.value)) {
    const already = top.some((s) => s._id === current.value._id);
    if (!already) top = [current.value, ...top].slice(0, 3);
  }
  return top;
});

const mapCenter = computed(() => {
  if (geoOk.value && userLoc.value) return userLoc.value;

  const first = storesForMap.value[0];
  const ll = first ? getLatLngFromStore(first) : null;
  if (ll) return ll;

  return { lat: 46.5197, lng: 6.6323 };
});

const mapMarkers = computed(() => {
  const markers = [];

  if (geoOk.value && userLoc.value) {
    markers.push({
      id: "me",
      type: "user",
      lat: userLoc.value.lat,
      lng: userLoc.value.lng,
    });
  }

  for (const s of storesForMap.value) {
    const ll = getLatLngFromStore(s);
    if (!ll) continue;
    markers.push({ id: s._id, type: "store", ...ll });
  }

  return markers;
});

function confirm() {
  if (!current.value) return;
  emit("select", current.value);
  emit("close");
}

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