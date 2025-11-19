<template>
  <main class="home">
    <!-- Header -->
    <header class="home-header">
      <div>
        <p class="subtitle">Bienvenue</p>
        <h1 class="title">Ton matcha est prêt 🍵</h1>
      </div>
      <button class="icon-btn" @click="goToAccount">
        <span>👤</span>
      </button>
    </header>

    <!-- Section favoris -->
    <section class="section">
      <div class="section-header">
        <h2>Nos favoris</h2>
        <RouterLink to="/products" class="link-btn">Voir tout</RouterLink>
      </div>

      <div class="cards-row">
        <article
          v-for="product in favoriteProducts"
          :key="product.id"
          class="drink-card"
        >
          <img
            class="drink-image"
            :src="product.imageUrl"
            :alt="product.name"
          />
          <h3 class="drink-name">{{ product.name }}</h3>
          <p class="drink-price">{{ product.price.toFixed(2) }} CHF</p>
        </article>
      </div>
    </section>

    <!-- Section promotions -->
    <section class="section">
      <h2>Promotions</h2>
      <div
        v-for="promo in promotions"
        :key="promo.id"
        class="promo-card"
      >
        <div>
          <h3 class="promo-title">{{ promo.title }}</h3>
          <p class="promo-text">{{ promo.description }}</p>
        </div>
        <span class="promo-badge">{{ promo.badge }}</span>
      </div>
    </section>

    <!-- CTA choisir boisson -->
    <section class="section">
      <h2>Envie d’un matcha ?</h2>
      <RouterLink to="/products" class="primary-btn">
        Voir toutes les boissons
      </RouterLink>
    </section>

    <!-- Section succursales -->
    <section class="section">
      <h2>Succursales proches</h2>
      <div class="map-placeholder">
        <p>Carte des shops à venir</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Mock pour l'instant
const favoriteProducts = [
  {
    id: '1',
    name: 'Matcha Vanilla Latte',
    price: 6.5,
    imageUrl: 'https://via.placeholder.com/160x160?text=Matcha+Latte',
  },
  {
    id: '2',
    name: 'Iced Matcha Classic',
    price: 5.9,
    imageUrl: 'https://via.placeholder.com/160x160?text=Iced+Matcha',
  },
  {
    id: '3',
    name: 'Coconut Matcha',
    price: 6.9,
    imageUrl: 'https://via.placeholder.com/160x160?text=Coconut+Matcha',
  },
];

const promotions = [
  {
    id: 'p1',
    title: 'Matcha + Cupcake',
    description: 'Un combo matcha latte et cupcake à prix doux.',
    badge: '-20%',
  },
  {
    id: 'p2',
    title: 'Happy Hour',
    description: 'Entre 16h et 18h, -10% sur toutes les boissons.',
    badge: 'Aujourd’hui',
  },
];

const goToAccount = () => {
  router.push({ name: 'account' });
};
</script>

<style scoped>
.home {
  padding-bottom: 16px;
}

/* Header */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.title {
  margin: 4px 0 0;
  font-size: 24px;
  font-weight: 700;
  color: #2f2a24;
}

.icon-btn {
  border: none;
  background: #fff;
  border-radius: 999px;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

/* Sections */
.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2f2a24;
}

/* Boutons */
.link-btn {
  font-size: 14px;
  text-decoration: none;
  color: #5f8f3e;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 999px;
  background: #5f8f3e;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
}

/* Cartes boissons */
.cards-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.drink-card {
  min-width: 140px;
  background: #fff;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.drink-image {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 8px;
  object-fit: cover;
}

.drink-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2f2a24;
}

.drink-price {
  margin: 4px 0 0;
  font-size: 13px;
  color: #666;
}

/* Promotions */
.promo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16px;
  padding: 12px 14px;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.promo-title {
  margin: 0 0 4px;
  font-size: 15px;
}

.promo-text {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.promo-badge {
  background: #5f8f3e;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
}

/* Carte placeholder */
.map-placeholder {
  border-radius: 16px;
  background: #e3e0d8;
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: #555;
}
</style>