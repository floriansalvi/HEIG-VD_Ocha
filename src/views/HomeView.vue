<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <!-- HERO (UNCHANGED) -->
    <section class="home-hero">
      <div class="home-hero-bg"></div>
      <div class="home-hero-gradient"></div>
      <!-- ✅ darker overlay behind logo -->
      <div class="home-hero-overlay"></div>

      <img class="home-hero-logo-img" :src="logoUrl" alt="Ocha" draggable="false" />

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
        <!-- ✅ same DA as app (pill) -->
        <button class="home-see-more" type="button" @click="goToAllDrinks">See more</button>
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
              {{ formatCHF(drink.basePriceCHF ?? drink.base_price_chf ?? drink.price_chf ?? drink.base_price) }} CHF
            </p>
          </div>

          <button class="fav-card-add" type="button" @click.stop="goToProduct(drink)">
            <span>Add</span>
            <span>🥤</span>
          </button>
        </article>
      </div>
    </section>

    <!-- PROMOTIONS (IMAGES) -->
    <section class="section home-section">
      <h2 class="home-section-title">Promotions</h2>

      <div class="promo-large promo-large--img">
        <div class="promo-large-img">
          <img class="promo-large-img-el" :src="onetwoUrl" alt="Buy 1 get 1" loading="lazy" />
        </div>
        <div class="promo-large-content">
          <p class="promo-large-title">Buy 1 get 1 free</p>
          <p class="promo-large-sub">On classic matcha latte</p>
          <button class="promo-large-btn" type="button">Get promo</button>
        </div>
      </div>

      <div class="promo-large promo-large--cookie promo-large--img">
        <div class="promo-large-img">
          <img class="promo-large-img-el" :src="accueil2Url" alt="Matcha cookie" loading="lazy" />
        </div>
        <div class="promo-large-content">
          <p class="promo-large-title">Matcha cookie</p>
          <p class="promo-large-sub">Perfect with your drink</p>
        </div>
      </div>
    </section>

    <!-- 2 CUPS LEFT (image background + dark overlay) -->
    <section class="section home-section">
      <div class="stamps-card stamps-card--img">
        <div class="stamps-bg" :style="{ backgroundImage: `url(${matchaCupUrl})` }" aria-hidden="true"></div>
        <div class="stamps-bg-dark" aria-hidden="true"></div>

        <p class="stamps-title">2 cups left</p>
        <p class="stamps-sub">Buy 2 more to get 1 free!</p>

        <div class="stamps-dots">
          <span v-for="n in 5" :key="n" class="stamp-dot" :class="{ 'stamp-dot--filled': n <= 3 }" />
        </div>
      </div>
    </section>

    <!-- MAP -->
    <section class="section home-section">
      <h2 class="home-section-title">Where to find us</h2>

      <p v-if="storesLoading" class="hint">Loading stores…</p>
      <p v-else-if="storesError" class="error">{{ storesError }}</p>

      <div v-else class="map-card home-map-card">
        <OchaMapStore :center="mapCenter" :markers="mapMarkers" :fit-to-markers="true" :zoom="13" />
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

/* ---------- helpers ---------- */
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

/* ---------- Today's selection ---------- */
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

    todaysSelection.value = shuffle(products).slice(0, 3).map((p) => ({
      ...p,
      _image: pickImageUrl(p),
    }));
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

/* ---------- stores map ---------- */
const stores = ref([]);
const storesLoading = ref(false);
const storesError = ref("");

function getLatLngFromStore(store) {
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
      return { id: s._id, type: "store", ...ll, name: s.name, opening_hours: s.opening_hours };
    })
    .filter(Boolean);
});

async function loadStoresForMap() {
  storesLoading.value = true;
  storesError.value = "";
  stores.value = [];

  try {
    const { data } = await api.get("/stores", { params: { active: "true", page: 1, limit: 500 } });
    stores.value = Array.isArray(data?.stores) ? data.stores : [];

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
/* ✅ spacing (clean, no duplicates) */
.home-hero { margin-bottom: 22px; }
.home-section { margin-bottom: 26px; }

/* title + see more */
.section-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 12px;
}

/* See more = same DA (pill) */
.home-see-more{
  border: 1px solid #ddd3c7;
  background: #ffffff;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  color: #6c6254;
  cursor: pointer;
}
.home-see-more:active { transform: scale(0.98); }


.fav-card {
  display: flex;
  flex-direction: column;
}

.fav-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.fav-card-add {
  margin-top: auto;
}
/* cards images */
.fav-card-img { overflow: hidden; }
.fav-card-img-el { width:100%; height:100%; object-fit:cover; display:block; }

/* promotions images */
.promo-large--img .promo-large-img { overflow: hidden; }
.promo-large-img-el { width:100%; height:110px; object-fit:cover; display:block; }

/* ✅ 2 cups image background + dark overlay for readability */
.stamps-card--img{ position:relative; overflow:hidden; }
.stamps-bg{
  position:absolute;
  inset:0;
  background-position:center;
  background-size:cover;
  background-repeat:no-repeat;
  opacity: 1;
}
.stamps-bg-dark{
  position:absolute;
  inset:0;
  background: rgba(0,0,0,0.35); /* ✅ dark between bg and text */
}
.stamps-card--img > *{ position:relative; z-index:1; }

/* ✅ hero dark overlay (behind logo) */
.home-hero { position: relative; overflow: hidden; }
.home-hero-bg,
.home-hero-gradient{
  position:absolute;
  inset:0;
}
.home-hero-overlay{
  position:absolute;
  inset:0;
  background: rgba(0,0,0,0.35); /* ✅ requested dark */
  z-index: 3;
  pointer-events:none;
}
.home-hero-logo-img{
  position:absolute;
  left:50%;
  top:38%;
  transform:translate(-50%,-50%);
  z-index: 4;
  width: min(230px, 65%);
  height:auto;
  display:block;
}
.home-hero-content{
  position:relative;
  z-index: 4;
  height:160%;
  display:flex;
  align-items:flex-end;
  justify-content:center;
}

/* ✅ map spacing + rounded */
.home-map-card{
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
}

/* messages */
.hint { margin: 0 0 10px; font-size: 12px; color: #8b8375; }
.error { margin: 0 0 10px; font-size: 12px; color: #b00020; }
</style>