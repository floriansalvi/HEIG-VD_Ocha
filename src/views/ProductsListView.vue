<template>
  <div class="products-page">
    <section class="products-panel">
      <h1 class="products-panel-title">Our matchas</h1>

      <p v-if="loading" style="margin: 0 0 12px; font-size: 12px; color: #8b8375;">
        Loading…
      </p>

      <p v-if="error" style="margin: 0 0 12px; font-size: 12px; color: #b00020;">
        {{ error }}
      </p>

      <!-- grille de boissons -->
      <div class="products-grid">
        <article
          v-for="product in products"
          :key="product.id"
          class="product-card"
        >
          <div class="product-card-header">
            <span class="product-price-tag">From {{ formatCHF(product.basePriceCHF) }}</span>
            <button class="product-fav-btn" type="button">☆</button>
          </div>

          <div class="product-image-placeholder">
            <!-- plus tard: <img :src="imgUrl(product.image)" /> -->
          </div>

          <div class="product-card-body">
            <p class="product-name">{{ product.name }}</p>
            <p class="product-type">Matcha Latte</p>
          </div>

          <button class="product-arrow-btn" type="button" @click="goToProduct(product)">
            &gt;
          </button>
        </article>
      </div>

      <p
        v-if="!loading && !error && products.length === 0"
        style="margin: 12px 0 0; font-size: 12px; color: #8b8375; text-align: center;"
      >
        No products found.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const router = useRouter();

const products = ref([]);
const loading = ref(false);
const error = ref("");

function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "— CHF";
  return `${num.toFixed(2)} CHF`;
}

// optionnel si tu sers tes images depuis le back
function imgUrl(filename) {
  if (!filename) return "";
  return `${import.meta.env.VITE_API_URL}/uploads/${filename}`;
}

async function loadProducts() {
  loading.value = true;
  error.value = "";

  try {
    // ton backend: GET /products?active=true
    const { data } = await api.get("/products", {
      params: { active: "true", page: 1, limit: 100 },
    });

    const list = Array.isArray(data?.products) ? data.products : [];

    products.value = list.map((p) => ({
      id: p._id,
      slug: p.slug,
      name: p.name,
      basePriceCHF: p.basePriceCHF,
      image: p.image,
      description: p.description,
      category: p.category,
      size: p.size,
      extra_chf: p.extra_chf,
    }));
  } catch (e) {
    console.error(e);
    error.value = "Impossible de charger les produits (API).";
  } finally {
    loading.value = false;
  }
}

function goToProduct(product) {
  // adapte selon ton router: id ou slug
  // ex: /products/:id
  router.push(`/products/${product.id}`);
}

onMounted(loadProducts);
</script>