<!-- src/views/ProductsListView.vue -->
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
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="product-card-img"
              loading="lazy"
              @error="onImgError(product)"
            />
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

      <!-- ✅ VOIR PLUS -->
      <button
        v-if="!loading && !error && showSeeMore"
        type="button"
        class="see-more-btn"
        @click="seeMore"
      >
        See more
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const router = useRouter();

const products = ref([]);
const loading = ref(false);
const error = ref("");

const page = ref(1);
const limit = ref(6); // ✅ 6 au départ
const totalProducts = ref(0);

const CLOUDINARY_CLOUD_NAME = "dabosy2w2";

function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "— CHF";
  return `${num.toFixed(2)} CHF`;
}

function buildImageUrl(imageValue) {
  if (!imageValue) return "";
  if (imageValue.startsWith("http://") || imageValue.startsWith("https://")) {
    return imageValue;
  }
  const publicId = String(imageValue).replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
}

function onImgError(product) {
  product.imageUrl = "";
}

const showSeeMore = computed(() => {
  // bouton visible si on a encore des produits à afficher
  return totalProducts.value > products.value.length;
});

async function loadProducts() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.get("/products", {
      params: {
        active: "true",
        page: page.value,
        limit: limit.value,
      },
    });

    const list = Array.isArray(data?.products) ? data.products : [];
    totalProducts.value = Number(data?.totalProducts || 0);

    products.value = list.map((p) => ({
      id: p._id,
      slug: p.slug,
      name: p.name,
      basePriceCHF: p.basePriceCHF,
      image: p.image,
      imageUrl: buildImageUrl(p.image),
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

function seeMore() {
  limit.value +=10;
  loadProducts();
}

function goToProduct(product) {
  router.push(`/products/${product.id}`);
}

onMounted(loadProducts);
</script>

<style scoped>
.product-card-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  border-radius: 10px;
}

.see-more-btn {
  width: 100%;
  margin-top: 14px;
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  background: #000;
  color: #fff;
  cursor: pointer;
}
</style>