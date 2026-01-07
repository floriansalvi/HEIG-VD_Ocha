<!-- src/views/ProductDetailView.vue -->
<template>
  <div class="product-page">
    <!-- HEADER -->
    <header class="product-header">
      <button class="icon-btn product-back" type="button" @click="goBack">←</button>
      <h1 class="product-header-title">Product informations</h1>
      <span class="product-header-spacer"></span>
    </header>

    <!-- LOADING / ERROR -->
    <p v-if="loading" style="margin: 0 0 10px; font-size: 12px; color: #8b8375;">
      Loading…
    </p>
    <p v-else-if="error" style="margin: 0 0 10px; font-size: 12px; color: #b00020;">
      {{ error }}
    </p>

    <template v-else-if="product">
      <!-- IMAGE / HERO -->
      <div class="product-hero">
        <img
          v-if="product.image"
          :src="imgUrl(product.image)"
          :alt="product.name"
          class="product-hero-img"
          loading="lazy"
          @error="onHeroImgError"
        />
        <div v-else class="product-hero-img-placeholder">
          {{ product.name }}
        </div>
      </div>

      <!-- QUANTITÉ + PRIX -->
      <section class="product-qty-block">
        <div class="product-qty-controls">
          <button
            type="button"
            class="qty-btn"
            @click="decreaseQty"
            :disabled="quantity === 1"
          >
            −
          </button>
          <span class="qty-value">{{ quantity }}</span>
          <button type="button" class="qty-btn" @click="increaseQty">+</button>
        </div>

        <div class="product-price-pill">
          {{ formatCHF(totalPrice) }} CHF
        </div>
      </section>

      <!-- OPTIONS + BOUTON ADD TO CART -->
      <section class="product-options-card">
        <h2 class="product-name">{{ product.name }}</h2>
        <p class="product-subtitle">Choose your options</p>

        <div class="product-option-group">
          <p class="product-option-label">Size</p>

          <div class="product-option-row">
            <button
              v-for="s in availableSizes"
              :key="s"
              type="button"
              class="product-option-pill"
              :class="{ 'product-option-pill--active': size === s }"
              @click="size = s"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <button class="product-add-btn" type="button" @click="addToCart">
          add to cart ({{ quantity }})
        </button>
      </section>
    </template>

    <p v-else style="margin: 0; font-size: 12px; color: #8b8375;">
      Product not found.
    </p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/services/api";
import { useCartStore } from "@/stores/cart";

const router = useRouter();
const route = useRoute();
const cart = useCartStore();

const product = ref(null);
const loading = ref(false);
const error = ref("");

const quantity = ref(1);
const size = ref("M"); // S/M/L par défaut

// si l'image du hero casse, on la masque => placeholder
const heroImgOk = ref(true);

function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

/**
 * Si `product.image` est une URL Cloudinary => on la renvoie telle quelle.
 * Sinon => fallback vers /uploads/
 */
function imgUrl(image) {
  if (!image) return "";
  if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
    return image;
  }
  return `${import.meta.env.VITE_API_URL}/uploads/${image}`;
}

function onHeroImgError() {
  heroImgOk.value = false;
}

const availableSizes = computed(() => {
  const sizes = product.value?.size;
  if (Array.isArray(sizes) && sizes.length) return sizes;
  return ["S", "M", "L"];
});

const unitPrice = computed(() => {
  const p = product.value;
  if (!p) return 0;

  const base = Number(p.basePriceCHF) || 0;
  const extra = p.extra_chf?.[size.value] ?? 0;

  return base + Number(extra || 0);
});

const totalPrice = computed(() => unitPrice.value * quantity.value);

function increaseQty() {
  quantity.value += 1;
}

function decreaseQty() {
  if (quantity.value > 1) quantity.value -= 1;
}

function addToCart() {
  if (!product.value) return;

  cart.addItem({
    productId: product.value._id,
    name: product.value.name,
    size: size.value,
    unitPrice: unitPrice.value,
    quantity: quantity.value,
    imageUrl: imgUrl(product.value.image),
  });

  router.push("/cart");
}

function goBack() {
  router.back();
}

async function loadProduct() {
  loading.value = true;
  error.value = "";
  heroImgOk.value = true;

  try {
    const id = route.params.id;
    const { data } = await api.get(`/products/${id}`);
    product.value = data?.product || null;

    if (!product.value) {
      error.value = "Product not found.";
      return;
    }

    // si la taille par défaut n’est pas dispo, prends la 1ère
    if (!availableSizes.value.includes(size.value)) {
      size.value = availableSizes.value[0];
    }
  } catch (e) {
    console.error(e);
    error.value = "Impossible de charger le produit (API).";
  } finally {
    loading.value = false;
  }
}

onMounted(loadProduct);
</script>