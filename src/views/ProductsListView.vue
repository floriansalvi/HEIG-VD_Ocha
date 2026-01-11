<!-- src/views/ProductsListView.vue -->
<template>
  <div class="products-page">
    <section class="products-panel">
      <h1 class="products-panel-title">Our matchas</h1>

      <!-- Small UI states (kept minimal to avoid overriding main.css) -->
      <p v-if="loading" class="hint">Loading…</p>
      <p v-else-if="error" class="error">{{ error }}</p>

      <div v-else class="products-grid">
        <article v-for="product in products" :key="product.id" class="product-card">
          <div class="product-card-header">
            <span class="product-price-tag">From {{ formatCHF(product.basePriceCHF) }}</span>
            <!-- UI only (no feature yet) -->
            <button class="product-fav-btn" type="button" aria-label="Favorite">☆</button>
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

      <p v-if="!loading && !error && products.length === 0" class="hint hint--center">
        No products found.
      </p>

      <!-- Load more button (only shown if there are more products on the server) -->
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

/* ---------------- state ---------------- */

const products = ref([]);
const loading = ref(false);
const error = ref("");

// Pagination: we start small, then load next pages
const page = ref(1);
const pageSize = 6;

const totalProducts = ref(0);

/* ---------------- helpers ---------------- */

// Cloudinary config (used when the backend returns a publicId instead of a full URL)
const CLOUDINARY_CLOUD_NAME = "dabosy2w2";

/** Format CHF values with 2 decimals. */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "— CHF";
  return `${num.toFixed(2)} CHF`;
}

/** Normalize various image formats into a usable URL. */
function buildImageUrl(imageValue) {
  if (!imageValue) return "";

  const v = String(imageValue);

  // Already a full URL
  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  // Cloudinary publicId (strip extension if present)
  const publicId = v.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
}

/** If an image fails, we simply hide it (the placeholder background remains). */
function onImgError(product) {
  product.imageUrl = "";
}

/** Button visible only if we haven't loaded everything yet. */
const showSeeMore = computed(() => {
  return totalProducts.value > products.value.length;
});

/* ---------------- API ---------------- */

/**
 * Fetch one page from the API and append it to the current list.
 * This avoids re-downloading the full list every time.
 */
async function fetchProductsPage(nextPage) {
  const { data } = await api.get("/products", {
    params: {
      active: "true",
      page: nextPage,
      limit: pageSize,
    },
  });

  const list = Array.isArray(data?.products) ? data.products : [];

  // Support a few possible backend keys for totals
  totalProducts.value = Number(
    data?.totalProducts ?? data?.total_products ?? data?.total ?? 0
  );

  return list.map((p) => ({
    id: p?._id,
    slug: p?.slug,
    name: p?.name,
    // Support both camelCase and snake_case coming from the backend
    basePriceCHF: p?.basePriceCHF ?? p?.base_price_chf ?? p?.price_chf ?? 0,
    imageUrl: buildImageUrl(p?.image ?? p?.image_url ?? p?.imageUrl),
    description: p?.description,
    category: p?.category,
    size: p?.size,
    extra_chf: p?.extra_chf,
  }));
}

async function loadInitialProducts() {
  loading.value = true;
  error.value = "";
  products.value = [];
  page.value = 1;

  try {
    const firstPage = await fetchProductsPage(1);
    products.value = firstPage;
  } catch (e) {
    error.value = e?.response?.data?.message || "Impossible de charger les produits (API).";
  } finally {
    loading.value = false;
  }
}

/* ---------------- actions ---------------- */

async function seeMore() {
  if (loading.value) return;

  loading.value = true;
  error.value = "";

  try {
    const next = page.value + 1;
    const nextPageItems = await fetchProductsPage(next);

    // Append new items (basic dedupe by id in case the API overlaps)
    const existing = new Set(products.value.map((p) => p.id));
    for (const p of nextPageItems) {
      if (p?.id && !existing.has(p.id)) products.value.push(p);
    }

    page.value = next;
  } catch (e) {
    error.value = e?.response?.data?.message || "Impossible de charger plus de produits.";
  } finally {
    loading.value = false;
  }
}

function goToProduct(product) {
  if (!product?.id) return;
  router.push(`/products/${product.id}`);
}

onMounted(loadInitialProducts);
</script>

<style scoped>
/* Keep CSS minimal, DA stays in main.css */
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

.hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: #8b8375;
}

.hint--center {
  margin-top: 12px;
  text-align: center;
}

.error {
  margin: 0 0 12px;
  font-size: 12px;
  color: #b00020;
}
</style>