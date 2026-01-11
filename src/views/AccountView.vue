<!-- src/views/AccountView.vue -->
<template>
  <div class="account-page">
    <!-- HEADER -->
    <header class="account-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="account-title">My account</h1>
      <span class="account-header-spacer"></span>
    </header>

    <!-- MY PROFILE -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">My profile</p>

        <!-- Logout: clears auth token + user state (Pinia) -->
        <button type="button" class="account-link-btn" @click="onLogout">
          Log out
        </button>
      </div>

      <p v-if="profileLoading" class="hint">Loading profile…</p>
      <p v-else-if="profileError" class="error">{{ profileError }}</p>

      <div v-else-if="profile" class="account-profile">
        <div class="account-profile-row">
          <span class="account-profile-label">Name</span>
          <span class="account-profile-value">{{ profile.display_name }}</span>
        </div>

        <div class="account-profile-row">
          <span class="account-profile-label">Email</span>
          <span class="account-profile-value">{{ profile.email }}</span>
        </div>

        <div v-if="profile.phone" class="account-profile-row">
          <span class="account-profile-label">Phone</span>
          <span class="account-profile-value">{{ profile.phone }}</span>
        </div>

        <div class="account-profile-row">
          <span class="account-profile-label">Member since</span>
          <span class="account-profile-value">{{ profileCreatedAt }}</span>
        </div>
      </div>

      <p v-else class="hint">No profile data.</p>
    </section>

    <!-- SCAN CARD -->
    <section class="account-card account-card--barcode">
      <p class="account-section-label">Scan your card !</p>

      <div class="account-barcode-wrapper">
        <div class="account-barcode-inner">
          <!-- ✅ real image instead of fake stripes -->
          <img class="account-barcode-img" :src="barcodeUrl" alt="Barcode" draggable="false" />
        </div>
        <p class="account-barcode-number">9007438329951</p>
      </div>
    </section>

    <!-- FIDELITY JOURNEY (mock UI only) -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Your fidelity journey</p>
        <button type="button" class="account-link-btn">Infos</button>
      </div>

      <div class="account-fidelity-card">
        <div class="account-fidelity-bg"></div>
        <div class="account-fidelity-content">
          <p class="account-fidelity-main">{{ cupsLeft }} cups left</p>
          <p class="account-fidelity-sub">Buy {{ cupsLeft }} more to get 1 free !</p>

          <div class="account-fidelity-dots">
            <span
              v-for="n in totalStamps"
              :key="n"
              class="account-dot"
              :class="{ 'account-dot--filled': n <= usedStamps }"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ORDER HISTORY (DB) -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Order history</p>

        <button
          type="button"
          class="account-link-btn"
          @click="$router.push({ name: 'account-orders' })"
        >
          See all orders
        </button>
      </div>

      <p v-if="ordersLoading" class="hint">Loading orders…</p>
      <p v-else-if="ordersError" class="error">{{ ordersError }}</p>

      <ul v-else class="account-orders-list">
        <li v-for="order in ordersUi" :key="order.id" class="account-order-item">
          <div class="account-order-main">
            <p class="account-order-date">{{ order.date }}</p>
            <p class="account-order-summary">{{ order.summary }}</p>
          </div>

          <div class="account-order-right">
            <span
              class="account-order-status"
              :class="{
                'account-order-status--preparation':
                  order.status === 'in preparation' || order.status === 'ready',
                'account-order-status--finished': order.status === 'finished'
              }"
            >
              {{ order.statusLabel }}
            </span>
            <span class="account-order-arrow">›</span>
          </div>
        </li>

        <li v-if="ordersUi.length === 0" class="hint" style="list-style:none; padding: 8px 0;">
          No orders yet.
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useAuthStore } from "@/stores/auth";

import barcodeUrl from "@/assets/codebar.jpeg";

const router = useRouter();
const auth = useAuthStore();

/* ---------------- Helpers ---------------- */
function fmtDateFR(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-CH");
}

function normalizeStatus(frStatus) {
  const s = String(frStatus || "").toLowerCase().trim();
  if (s === "en préparation") return { status: "in preparation", label: "in preparation" };
  if (s === "prête") return { status: "ready", label: "ready" };
  if (s === "récupérée") return { status: "finished", label: "finished" };
  return { status: s || "in preparation", label: s || "in preparation" };
}

function buildSummaryFromItems(items) {
  if (!Array.isArray(items) || items.length === 0) return "—";
  const map = new Map();
  for (const it of items) {
    const name = it?.product_name || it?.product_id?.name || "Product";
    const qty = Number(it?.quantity) || 1;
    map.set(name, (map.get(name) || 0) + qty);
  }
  return Array.from(map.entries())
    .map(([name, qty]) => `${qty}× ${name}`)
    .join(", ");
}

/* ---------------- Profile (DB) ---------------- */
const profile = ref(null);
const profileLoading = ref(false);
const profileError = ref("");

async function loadProfile() {
  profileLoading.value = true;
  profileError.value = "";
  try {
    const { data } = await api.get("/users");
    profile.value = data?.user || null;
  } catch (e) {
    profileError.value = e?.response?.data?.message || "Failed to load profile";
  } finally {
    profileLoading.value = false;
  }
}

const profileCreatedAt = computed(() => {
  const v = profile.value?.created_at;
  return v ? fmtDateFR(v) : "—";
});

/* ---------------- Orders (DB) ---------------- */
const ordersLoading = ref(false);
const ordersError = ref("");
const ordersUi = ref([]);

async function loadOrders() {
  ordersLoading.value = true;
  ordersError.value = "";
  ordersUi.value = [];

  try {
    const { data } = await api.get("/users/orders", { params: { page: 1, limit: 10 } });
    const orders = Array.isArray(data?.orders) ? data.orders : [];

    const enriched = await Promise.allSettled(
      orders.map(async (o) => {
        const id = o?._id || o?.id;
        let items = [];

        if (id) {
          try {
            const { data } = await api.get(`/orders/${id}/items`);
            items = Array.isArray(data?.items) ? data.items : [];
          } catch {
            items = [];
          }
        }

        const st = normalizeStatus(o?.status);

        return {
          id: id || crypto.randomUUID(),
          date: fmtDateFR(o?.createdAt || o?.created_at || o?.pickup || o?.created),
          summary: buildSummaryFromItems(items),
          status: st.status,
          statusLabel: st.label,
        };
      })
    );

    ordersUi.value = enriched.filter((r) => r.status === "fulfilled").map((r) => r.value);
  } catch (e) {
    ordersError.value = e?.response?.data?.message || e?.message || "Failed to load orders";
  } finally {
    ordersLoading.value = false;
  }
}

/* ---------------- Logout ---------------- */
function onLogout() {
  auth.logout();
  router.push({ name: "login" }).catch(() => router.push("/login"));
}

/* ---------------- Mock (UI only) ---------------- */
const cupsLeft = ref(2);
const totalStamps = 5;
const usedStamps = 3;

/* ---------------- Nav ---------------- */
const goBack = () => router.back();

onMounted(async () => {
  await loadProfile();
  await loadOrders();
});
</script>

<style scoped>
/* Keep styles minimal to avoid overriding main.css */
.hint { margin: 8px 0 0; font-size: 12px; color: #8b8375; }
.error { margin: 8px 0 0; font-size: 12px; color: #b00020; }

.account-profile { margin-top: 10px; display: grid; gap: 8px; }
.account-profile-row { display: flex; justify-content: space-between; gap: 12px; }
.account-profile-label { color: #8b8375; font-size: 12px; }
.account-profile-value { font-weight: 600; font-size: 12px; }

/* ✅ barcode image sizing (same as your old stripes height) */
.account-barcode-img{
  width: 100%;
  height: 56px;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}
</style>