<template>
  <div class="product-page">
    <!-- Header: back + title -->
    <header class="product-header">
      <button class="icon-btn product-back" type="button" @click="goBack">←</button>
      <h1 class="product-header-title">Product informations</h1>
      <span class="product-header-spacer"></span>
    </header>

    <!-- Loading / error states -->
    <p v-if="loading" class="hint">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- Product content -->
    <template v-else-if="product">
      <!-- Hero image (fallback to placeholder if missing or broken) -->
      <div class="product-hero">
        <img
          v-if="heroImgOk && product.image"
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

      <!-- Quantity + dynamic total price -->
      <section class="product-qty-block">
        <div class="product-qty-controls">
          <button
            type="button"
            class="qty-btn"
            @click="decreaseQty"
            :disabled="quantity === 1"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span class="qty-value">{{ quantity }}</span>

          <button type="button" class="qty-btn" @click="increaseQty" aria-label="Increase quantity">
            +
          </button>
        </div>

        <div class="product-price-pill">
          {{ formatCHF(totalPrice) }} CHF
        </div>
      </section>

      <!-- Options + CTA -->
      <section class="product-options-card">
        <h2 class="product-name">{{ product.name }}</h2>
        <p class="product-subtitle">Choose your options</p>

        <!-- Size selection -->
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

        <!-- Add to cart -->
        <button class="product-add-btn" type="button" @click="addToCart">
          add to cart ({{ quantity }})
        </button>
      </section>
    </template>

    <p v-else class="hint">Product not found.</p>
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

/* ---------------- state ---------------- */

const product = ref(null);
const loading = ref(false);
const error = ref("");

const quantity = ref(1);
const size = ref("M"); // Default size selection

// If the hero image fails to load, we switch to a safe placeholder
const heroImgOk = ref(true);

/* ---------------- helpers ---------------- */

/** Format CHF values with 2 decimals (UI shows "CHF" separately). */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

/**
 * Resolve an image field into a URL:
 * - If backend already returns an absolute URL: use it
 * - Otherwise fallback to `${VITE_API_URL}/uploads/<filename>`
 */
function imgUrl(image) {
  if (!image) return "";

  const v = String(image);
  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  // Note: this assumes your backend serves /uploads publicly
  return `${import.meta.env.VITE_API_URL}/uploads/${v}`;
}

function onHeroImgError() {
  heroImgOk.value = false;
}

/**
 * Available sizes:
 * - Prefer backend size array if provided
 * - Otherwise fallback to a standard S/M/L
 */
const availableSizes = computed(() => {
  const sizes = product.value?.size;
  if (Array.isArray(sizes) && sizes.length) return sizes;
  return ["S", "M", "L"];
});

/**
 * Unit price:
 * - base price from backend (support multiple key formats)
 * - + extra depending on selected size (extra_chf may be an object)
 */
const unitPrice = computed(() => {
  const p = product.value;
  if (!p) return 0;

  const base =
    Number(p.basePriceCHF ?? p.base_price_chf ?? p.price_chf ?? 0) || 0;

  const extra =
    p?.extra_chf && typeof p.extra_chf === "object"
      ? Number(p.extra_chf?.[size.value] ?? 0)
      : 0;

  return base + extra;
});

const totalPrice = computed(() => unitPrice.value * quantity.value);

/* ---------------- actions ---------------- */

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

/* ---------------- API ---------------- */

/**
 * Fetch product details by route param id.
 * Keeps UI resilient to missing/bad fields.
 */
async function loadProduct() {
  loading.value = true;
  error.value = "";
  heroImgOk.value = true;

  try {
    const id = String(route.params.id || "");
    if (!id) {
      error.value = "Product not found.";
      product.value = null;
      return;
    }

    const { data } = await api.get(`/products/${id}`);
    product.value = data?.product || null;

    if (!product.value) {
      error.value = "Product not found.";
      return;
    }

    // Ensure the default selected size is valid
    if (!availableSizes.value.includes(size.value)) {
      size.value = availableSizes.value[0] || "M";
    }
  } catch (e) {
    error.value = e?.response?.data?.message || "Impossible de charger le produit (API).";
    product.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(loadProduct);
</script>

<style scoped>
/* Keep styles minimal to avoid overriding main.css */
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