<template>
  <div class="home">
    <!-- HERO -->
    <section class="home-hero">
      <div class="home-hero-bg" aria-hidden="true"></div>
      <div class="home-hero-gradient" aria-hidden="true"></div>

      <!-- Dark layer to keep the logo readable on any background -->
      <div class="home-hero-overlay" aria-hidden="true"></div>

      <img
        class="home-hero-logo-img"
        :src="logoUrl"
        alt="Ocha"
        draggable="false"
      />

      <div class="home-hero-content">
        <button class="home-hero-cta" type="button" @click="goToUsualOrder">
          <span>Go to my account</span>
          <span class="home-hero-cta-icon">➜</span>
        </button>
      </div>
    </section>

    <!-- TODAY'S SELECTION -->
    <section class="section home-section">
      <div class="section-header">
        <h2>Today's selection</h2>

        <!-- Small CTA aligned with the design system -->
        <button class="home-see-more" type="button" @click="goToAllDrinks">
          See more
        </button>
      </div>

      <p v-if="selectionLoading" class="hint">Loading selection…</p>
      <p v-else-if="selectionError" class="error">{{ selectionError }}</p>

      <div v-else class="cards-row">
        <article
          v-for="drink in todaysSelection"
          :key="drink._id"
          class="fav-card"
          role="button"
          tabindex="0"
          @click="goToProduct(drink)"
          @keydown.enter="goToProduct(drink)"
        >
          <div class="fav-card-img">
            <img
              v-if="drink._image"
              :src="drink._image"
              :alt="drink.name"
              class="fav-card-img-el"
              loading="lazy"
              @error="onImgError(drink)"
            />
          </div>

          <div class="fav-card-body">
            <p class="fav-card-name">{{ drink.name }}</p>
            <p class="fav-card-size">
              {{ formatCHF(drink.basePriceCHF ?? drink.base_price_chf ?? drink.price_chf ?? drink.base_price) }} CHF
            </p>

            <!-- Spacer so every card pushes the Add button to the bottom -->
            <div class="fav-card-spacer" aria-hidden="true"></div>

            <button
              class="fav-card-add"
              type="button"
              @click.stop="goToProduct(drink)"
            >
              <span>Add</span>
              <span>🥤</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- PROMOTIONS -->
    <section class="section home-section">
      <h2 class="home-section-title">Promotions</h2>

      <!-- Promo 1: onetwo.jpeg -->
      <div class="promo-large promo-large--img">
        <div class="promo-large-img">
          <img
            class="promo-large-img-el"
            :src="onetwoUrl"
            alt="Buy 1 get 1"
            loading="lazy"
          />
        </div>

        <div class="promo-large-content">
          <p class="promo-large-title">Buy 1 get 1 free</p>
          <p class="promo-large-sub">On classic matcha latte</p>
          <button class="promo-large-btn" type="button">Get promo</button>
        </div>
      </div>

      <!-- Promo 2: accueil2.jpeg -->
      <div class="promo-large promo-large--img promo-large--cookie">
        <div class="promo-large-img">
          <img
            class="promo-large-img-el"
            :src="accueil2Url"
            alt="Cinnamon roll"
            loading="lazy"
          />
        </div>

        <div class="promo-large-content">
          <p class="promo-large-title">Cinnamon roll</p>
          <p class="promo-large-sub">Perfect with your drink</p>
        </div>
      </div>
    </section>

    <!-- 2 CUPS LEFT -->
    <section class="section home-section">
      <div class="stamps-card stamps-card--img">
        <!-- Background image (src/assets/matchacup.jpeg) -->
        <div
          class="stamps-bg"
          :style="{ backgroundImage: `url(${matchaCupUrl})` }"
          aria-hidden="true"
        ></div>

        <!-- Dark overlay for readability -->
        <div class="stamps-bg-dark" aria-hidden="true"></div>

        <p class="stamps-title">2 cups left</p>
        <p class="stamps-sub">Buy 2 more to get 1 free!</p>

        <div class="stamps-dots">
          <span
            v-for="n in 5"
            :key="n"
            class="stamp-dot"
            :class="{ 'stamp-dot--filled': n <= 3 }"
          />
        </div>
      </div>
    </section>

    <!-- MAP -->
    <section class="section home-section">
      <h2 class="home-section-title">Where to find us</h2>

      <p v-if="storesLoading" class="hint">Loading stores…</p>
      <p v-else-if="storesError" class="error">{{ storesError }}</p>

      <div v-else class="map-card home-map-card">
        <OchaMapStore
          :center="mapCenter"
          :markers="mapMarkers"
          :fit-to-markers="true"
          :zoom="13"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

import logoUrl from "@/assets/logo-ocha.png";
import onetwoUrl from "@/assets/onetwo.jpeg";
import accueil2Url from "@/assets/accueil2.jpeg";
import matchaCupUrl from "@/assets/matchacup.jpeg";

import OchaMapStore from "@/components/ui/OchaMap.vue";

const router = useRouter();

/* ------------------------------
   Formatting / small utilities
   ------------------------------ */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

function pickImageUrl(p) {
  return (
    p?.imageUrl ||
    p?.image_url ||
    p?.image ||
    p?.picture ||
    (Array.isArray(p?.pictures) ? p.pictures[0] : "") ||
    (Array.isArray(p?.images) ? p.images[0] : "") ||
    ""
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------
   Today's selection (API)
   ------------------------------ */
const todaysSelection = ref([]);
const selectionLoading = ref(false);
const selectionError = ref("");

async function loadTodaysSelection() {
  selectionLoading.value = true;
  selectionError.value = "";
  todaysSelection.value = [];

  try {
    const { data } = await api.get("/products", { params: { page: 1, limit: 200 } });

    const products = Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data)
      ? data
      : [];

    // Random 3 products for the home preview
    todaysSelection.value = shuffle(products)
      .slice(0, 3)
      .map((p) => ({ ...p, _image: pickImageUrl(p) }));
  } catch (e) {
    selectionError.value =
      e?.response?.data?.message || "Failed to load today's selection";
  } finally {
    selectionLoading.value = false;
  }
}

function onImgError(drink) {
  // If an image fails, just hide it (keeps the layout clean)
  drink._image = "";
}

/* ------------------------------
   Navigation
   ------------------------------ */
function goToAllDrinks() {
  router.push({ name: "products" }).catch(() => router.push("/products"));
}

function goToProduct(drink) {
  const id = drink?._id || drink?.id;
  if (!id) return;

  router
    .push({ name: "product-detail", params: { id: String(id) } })
    .catch(() => router.push(`/products/${id}`));
}

function goToUsualOrder() {
  router.push({ name: "account" }).catch(() => router.push("/account"));
}

/* ------------------------------
   Stores map (API)
   ------------------------------ */
const stores = ref([]);
const storesLoading = ref(false);
const storesError = ref("");

function getLatLngFromStore(store) {
  // Backend uses GeoJSON coordinates: [lng, lat]
  const coords = store?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

const mapCenter = ref({ lat: 46.5197, lng: 6.6323 });

const mapMarkers = computed(() => {
  return (stores.value || [])
    .map((s) => {
      const ll = getLatLngFromStore(s);
      if (!ll) return null;

      return {
        id: s._id,
        type: "store",
        ...ll,
        name: s.name,
        opening_hours: s.opening_hours,
      };
    })
    .filter(Boolean);
});

async function loadStoresForMap() {
  storesLoading.value = true;
  storesError.value = "";
  stores.value = [];

  try {
    const { data } = await api.get("/stores", {
      params: { active: "true", page: 1, limit: 500 },
    });

    stores.value = Array.isArray(data?.stores) ? data.stores : [];

    // Center the map on the first valid store if possible
    const first = stores.value.find((s) => !!getLatLngFromStore(s));
    const ll = first ? getLatLngFromStore(first) : null;
    if (ll) mapCenter.value = ll;
  } catch (e) {
    storesError.value = e?.response?.data?.message || "Failed to load stores";
  } finally {
    storesLoading.value = false;
  }
}

onMounted(async () => {
  await loadTodaysSelection();
  await loadStoresForMap();
});
</script>

<style scoped>
/* Global section spacing (keeps the page airy on mobile) */
.home-hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 22px;
}

.home-section {
  margin-bottom: 26px;
}

/* Hero layers */
.home-hero-bg,
.home-hero-gradient {
  position: absolute;
  inset: 0;
}

.home-hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 3;
  pointer-events: none;
}

/* Logo stays on top */
.home-hero-logo-img {
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -50%);
  z-index: 4;
  width: min(230px, 65%);
  height: auto;
  display: block;
}

.home-hero-content {
  position: relative;
  z-index: 4;
  height: 160%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Header row (title + CTA) */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.home-see-more {
  border: 1px solid #ddd3c7;
  background: #ffffff;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  color: #6c6254;
  cursor: pointer;
}
.home-see-more:active {
  transform: scale(0.98);
}

/* Cards image */
.fav-card-img {
  overflow: hidden;
}
.fav-card-img-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Ensure all Add buttons align to the bottom */
.fav-card {
  display: flex;
  flex-direction: column;
}
.fav-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.fav-card-spacer {
  flex: 1;
}
.fav-card-add {
  margin-top: 10px;
}

/* Promotions images */
.promo-large--img .promo-large-img {
  overflow: hidden;
}
.promo-large-img-el {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

/* 2 cups background */
.stamps-card--img {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
}

.stamps-bg {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 0;
}

.stamps-bg-dark {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

/* Put the text above the overlays */
.stamps-card--img > * {
  position: relative;
  z-index: 2;
}

.stamps-title {
  font-weight: 900;
  color: #fff;
}

.stamps-sub {
  color: #f1f1f1;
}

/* Map card */
.home-map-card {
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
}

/* Messages */
.hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: #8b8375;
}
.error {
  margin: 0 0 10px;
  font-size: 12px;
  color: #b00020;
}
</style>