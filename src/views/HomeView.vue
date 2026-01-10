<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <!-- HERO -->
    <section class="home-hero">
      <div class="home-hero-bg"></div>
      <div class="home-hero-gradient"></div>
      <!-- ✅ dark overlay between bg and logo -->
      <div class="home-hero-dark"></div>

      <!-- ✅ centered logo (doesn't move with CTA) -->
      <img class="home-hero-logo-img" :src="logoUrl" alt="Ocha" draggable="false" />

      <!-- CTA pinned at bottom -->
      <div class="home-hero-content">
        <button class="home-hero-cta" type="button" @click="goToUsualOrder">
          <span>Purchase my usual order</span>
          <span class="home-hero-cta-icon">➜</span>
        </button>
      </div>
    </section>

    <!-- TODAY'S SELECTION -->
    <section class="section home-section">
      <div class="section-header">
        <h2>Today's selection</h2>
        <button class="link-btn" type="button" @click="goToAllDrinks">See more</button>
      </div>

      <p v-if="selectionLoading" class="hint">Loading selection…</p>
      <p v-else-if="selectionError" class="error">{{ selectionError }}</p>

      <div v-else class="cards-row">
        <article
          class="fav-card"
          v-for="drink in todaysSelection"
          :key="drink._id"
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
              {{ formatCHF(drink.basePriceCHF ?? drink.base_price_chf ?? drink.price_chf) }} CHF
            </p>
          </div>

          <button class="fav-card-add" type="button" @click.stop="goToProduct(drink)">
            <span>Add</span>
            <span>🥤</span>
          </button>
        </article>
      </div>
    </section>

    <!-- PROMO CARDS (unchanged) -->
    <section class="section home-section">
      <h2 class="home-section-title">Promotions</h2>

      <div class="promo-large">
        <div class="promo-large-img"></div>
        <div class="promo-large-content">
          <p class="promo-large-title">Buy 1 get 1 free</p>
          <p class="promo-large-sub">On classic matcha latte</p>
          <button class="promo-large-btn" type="button">Get promo</button>
        </div>
      </div>

      <div class="promo-large promo-large--cookie">
        <div class="promo-large-img"></div>
        <div class="promo-large-content">
          <p class="promo-large-title">Matcha cookie</p>
          <p class="promo-large-sub">Perfect with your drink</p>
        </div>
      </div>
    </section>

    <!-- 2 CUPS LEFT (unchanged mock) -->
    <section class="section home-section">
      <div class="stamps-card">
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

      <div class="map-card">
        <div ref="mapEl" class="home-map"></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import api from "@/services/api";

import logoUrl from "@/assets/logo-ocha.png";

const router = useRouter();

/* ---------- helpers ---------- */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

function pickImageUrl(p) {
  // essaye plusieurs conventions possibles
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

/* ---------- Today's selection (from DB) ---------- */
const todaysSelection = ref([]);
const selectionLoading = ref(false);
const selectionError = ref("");

async function loadTodaysSelection() {
  selectionLoading.value = true;
  selectionError.value = "";
  todaysSelection.value = [];

  try {
    // On récupère une liste de produits depuis l'API
    const { data } = await api.get("/products", { params: { page: 1, limit: 100 } });

    const products = Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data)
      ? data
      : [];

    const picked = shuffle(products).slice(0, 3).map((p) => ({
      ...p,
      _image: pickImageUrl(p),
    }));

    todaysSelection.value = picked;
  } catch (e) {
    selectionError.value = e?.response?.data?.message || "Failed to load today's selection";
  } finally {
    selectionLoading.value = false;
  }
}

function onImgError(drink) {
  drink._image = "";
}

/* ---------- navigation ---------- */
function goToAllDrinks() {
  // adapte si ton route name est différent
  router.push({ name: "drinks" }).catch(() => router.push("/drinks"));
}

function goToProduct(drink) {
  const id = drink?._id || drink?.id;
  if (!id) return;
  // adapte si ton route name est différent
  router.push({ name: "product-detail", params: { id: String(id) } }).catch(() => {
    router.push(`/products/${id}`);
  });
}

function goToUsualOrder() {
  // à adapter plus tard (ex: page account/usual order)
  router.push({ name: "account" }).catch(() => router.push("/account"));
}

/* ---------- MAP (unchanged) ---------- */
const shops = [
  { id: "lausanne", name: "Ocha Matcha", city: "Lausanne", lat: 46.5197, lng: 6.6323 },
  { id: "renens", name: "Ocha Matcha", city: "Renens", lat: 46.5393, lng: 6.588 },
];

const mapEl = ref(null);
let mapInstance = null;

onMounted(async () => {
  await loadTodaysSelection();

  if (!mapEl.value) return;

  mapInstance = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([46.5197, 6.6323], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(mapInstance);

  shops.forEach((s) => {
    L.marker([s.lat, s.lng]).addTo(mapInstance).bindPopup(`<b>${s.name}</b><br/>${s.city}`);
  });

  setTimeout(() => {
    mapInstance && mapInstance.invalidateSize();
  }, 50);
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
/* ✅ Logo centré + overlay sombre */
.home-hero {
  position: relative;
  overflow: hidden;
}
.home-hero-bg,
.home-hero-gradient,
.home-hero-dark {
  position: absolute;
  inset: 0;
}
.home-hero-bg {
  z-index: 1;
}
.home-hero-gradient {
  z-index: 2;
}
.home-hero-dark {
  z-index: 3;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

/* logo fixé (ne bouge pas avec le CTA) */
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

/* CTA en bas */
.home-hero-content {
  position: relative;
  z-index: 4;
  height: 160%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  /* augmenter le padding bas pour descendre le CTA */
  }

/* images cards */
.fav-card-img {
  overflow: hidden;
}
.fav-card-img-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Map: height obligatoire */
.home-map {
  height: 180px;
  width: 100%;
  border-radius: 16px;
}

/* messages */
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