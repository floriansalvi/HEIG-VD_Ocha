<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <!-- HERO -->
    <section class="home-hero">
      <div class="home-hero-bg"></div>
      <div class="home-hero-gradient"></div>

      <div class="home-hero-content">
        <div class="home-hero-logo">ocha.</div>

        <button class="home-hero-cta" type="button">
          <span>Purchase my usual order</span>
          <span class="home-hero-cta-icon">➜</span>
        </button>
      </div>
    </section>

    <!-- FAVORITES -->
    <section class="section home-section">
      <div class="section-header">
        <h2>Your favorites</h2>
        <button class="link-btn" type="button">See all</button>
      </div>

      <div class="cards-row">
        <article class="fav-card" v-for="drink in favorites" :key="drink.id">
          <div class="fav-card-img"></div>
          <div class="fav-card-body">
            <p class="fav-card-name">{{ drink.name }}</p>
            <p class="fav-card-size">Medium • Iced</p>
          </div>
          <button class="fav-card-add" type="button">
            <span>Add</span>
            <span>🥤</span>
          </button>
        </article>
      </div>
    </section>

    <!-- PROMO CARDS -->
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

    <!-- 2 CUPS LEFT -->
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
      <p></p>
      <h2 class="home-section-title">Where to find us</h2>

      <div class="map-card">
        <!-- IMPORTANT: le div doit avoir une height (sinon carte invisible) -->
        <div ref="mapEl" class="home-map"></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import L from "leaflet";

const favorites = [
  { id: 1, name: "Classic Matcha Latte" },
  { id: 2, name: "Iced Matcha Classic" },
  { id: 3, name: "Coconut Matcha" },
];

// Exemple de shops (tu peux les remplacer par ton futur backend)
const shops = [
  { id: "lausanne", name: "Ocha Matcha", city: "Lausanne", lat: 46.5197, lng: 6.6323 },
  { id: "renens", name: "Ocha Matcha", city: "Renens", lat: 46.5393, lng: 6.5880 },
];

const mapEl = ref(null);
let mapInstance = null;

onMounted(() => {
  if (!mapEl.value) return;

  // Centre sur Lausanne
  mapInstance = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([46.5197, 6.6323], 12);

  // Tiles OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(mapInstance);

  // Markers shops
  shops.forEach((s) => {
    L.marker([s.lat, s.lng])
      .addTo(mapInstance)
      .bindPopup(`<b>${s.name}</b><br/>${s.city}`);
  });

  // Petit fix quand la carte est dans un container stylé
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
/* Le point clé : donner une height au container de map */
.home-map {
  height: 180px; /* ajuste si tu veux */
  width: 100%;
  border-radius: 16px;
}
</style>