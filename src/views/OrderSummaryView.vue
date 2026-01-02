<!-- src/views/OrderSummaryView.vue -->
<template>
  <div class="order-page">
    <!-- HEADER -->
    <header class="order-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="order-header-title">Order</h1>
      <span class="order-header-spacer"></span>
    </header>

    <!-- CARTE RÉSUMÉ -->
    <section class="order-card">
      <!-- Ligne “My order” -->
      <div class="order-product-row">
        <div class="order-product-img-placeholder"></div>

        <div class="order-product-info">
          <p class="order-product-name">My order</p>
          <p class="order-product-meta">
            {{ orderMeta }}
          </p>
        </div>

        <span class="order-product-price">{{ total }} CHF</span>
      </div>

      <!-- Ligne shop -->
      <div class="order-info-row">
        <div class="order-info-left">
          <span class="order-info-icon">📍</span>
          <div>
            <p class="order-info-label">The shop</p>
            <p class="order-info-value">{{ shopName }}</p>
          </div>
        </div>
      </div>

      <!-- MAP (Leaflet) -->
      <div class="order-map-card">
        <div ref="mapEl" class="order-map"></div>
      </div>

      <!-- Ligne time -->
      <div class="order-info-row order-info-row--time">
        <div class="order-info-left">
          <span class="order-info-icon">⏰</span>
          <div>
            <p class="order-info-label">Pick up time</p>
            <p class="order-info-value">{{ pickupTime }}</p>
          </div>
        </div>
      </div>

      <!-- Bouton principal -->
      <button
        class="order-place-btn"
        type="button"
        :disabled="isPlacing"
        @click="placeOrder"
      >
        <span v-if="!isPlacing">Place order</span>
        <span v-else>Placing…</span>
      </button>
    </section>

    <!-- OVERLAY SUCCESS -->
    <div v-if="showSuccessOverlay" class="order-success-backdrop">
      <div class="order-success-card">
        <div class="order-success-icon">✅</div>
        <h2 class="order-success-title">Order confirmed</h2>
        <p class="order-success-text">
          Your drinks will be ready at <strong>{{ pickupTime }}</strong> at
          <strong>{{ shopName }}</strong>.
        </p>

        <button type="button" class="order-success-btn" @click="goToCart">
          Go to cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ Fix icônes Leaflet (sinon markers souvent invisibles avec Vite)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const router = useRouter();

/**
 * Pour l’instant: valeurs mock.
 * Après, tu peux les prendre depuis Pinia + selection store/time.
 */
const total = ref('17.80');
const shopName = ref('Lausanne, Ocha Matcha');
const pickupTime = ref('16:15');

const orderMeta = computed(() => 'Vanilla Matcha Latte, Classic Matcha Latte');

const isPlacing = ref(false);
const showSuccessOverlay = ref(false);

/* -----------------------------
   LEAFLET MAP
----------------------------- */
const mapEl = ref(null);
let mapInstance = null;
let markerInstance = null;

// mini “db” de coordonnées (tu pourras remplacer par tes stores réels)
const coords = computed(() => {
  const name = (shopName.value || '').toLowerCase();

  // Lausanne centre approx
  if (name.includes('lausanne')) return { lat: 46.5191, lng: 6.6336 };

  // Renens approx
  if (name.includes('renens')) return { lat: 46.5390, lng: 6.5880 };

  // fallback
  return { lat: 46.5191, lng: 6.6336 };
});

const renderMap = () => {
  if (!mapEl.value) return;

  const { lat, lng } = coords.value;

  // 1) create map once
  if (!mapInstance) {
    mapInstance = L.map(mapEl.value, {
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);
  }

  // 2) marker
  if (markerInstance) markerInstance.remove();
  markerInstance = L.marker([lat, lng]).addTo(mapInstance);

  // 3) refresh size (important dans des containers flex/scroll)
  setTimeout(() => {
    mapInstance?.invalidateSize();
    mapInstance?.setView([lat, lng], 13);
  }, 50);
};

onMounted(() => {
  renderMap();
});

watch(coords, () => {
  renderMap();
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markerInstance = null;
  }
});

/* -----------------------------
   ACTIONS
----------------------------- */
const placeOrder = () => {
  if (isPlacing.value) return;
  isPlacing.value = true;

  // plus tard => appel API create order
  setTimeout(() => {
    isPlacing.value = false;
    showSuccessOverlay.value = true;
  }, 700);
};

const goBack = () => {
  router.back();
};

const goToCart = () => {
  showSuccessOverlay.value = false;

  router.push({
    path: '/cart',
    query: {
      activeOrder: '1',
      total: total.value,
      shop: shopName.value,
      time: pickupTime.value,
    },
  });
};
</script>

<style scoped>
/* map must have a real height, sinon rien ne s’affiche */
.order-map {
  height: 140px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

/* overlay success */
.order-success-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}

.order-success-card {
  width: 100%;
  max-width: 320px;
  border-radius: 20px;
  padding: 18px 16px 16px;
  background: #5f8f3e;
  color: #fff;
  text-align: center;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
}

.order-success-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.order-success-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
}

.order-success-text {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.35;
  opacity: 0.95;
}

.order-success-btn {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 700;
  background: #fff;
  color: #2f2a24;
  cursor: pointer;
}
</style>