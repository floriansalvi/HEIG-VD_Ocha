<template>
  <div class="account-page">
    <!-- HEADER: back navigation + page title -->
    <header class="account-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="account-title">My account</h1>
      <!-- Spacer keeps the title centered -->
      <span class="account-header-spacer"></span>
    </header>

    <!-- ================= PROFILE ================= -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">My profile</p>

        <!-- Logout clears auth state (Pinia) and redirects to login -->
        <button type="button" class="account-link-btn" @click="onLogout">
          Log out
        </button>
      </div>

      <!-- Profile loading / error states -->
      <p v-if="profileLoading" class="hint">Loading profile…</p>
      <p v-else-if="profileError" class="error">{{ profileError }}</p>

      <!-- Profile data -->
      <div v-else-if="profile" class="account-profile">
        <div class="account-profile-row">
          <span class="account-profile-label">Name</span>
          <span class="account-profile-value">{{ profile.display_name }}</span>
        </div>

        <div class="account-profile-row">
          <span class="account-profile-label">Email</span>
          <span class="account-profile-value">{{ profile.email }}</span>
        </div>

        <!-- Phone is optional -->
        <div v-if="profile.phone" class="account-profile-row">
          <span class="account-profile-label">Phone</span>
          <span class="account-profile-value">{{ profile.phone }}</span>
        </div>

        <div class="account-profile-row">
          <span class="account-profile-label">Member since</span>
          <span class="account-profile-value">{{ profileCreatedAt }}</span>
        </div>
      </div>

      <!-- Fallback when no profile is available -->
      <p v-else class="hint">No profile data.</p>
    </section>

    <!-- ================= BARCODE ================= -->
    <section class="account-card account-card--barcode">
      <p class="account-section-label">Scan your card !</p>

      <div class="account-barcode-wrapper">
        <div class="account-barcode-inner">
          <!-- Static barcode image (UI only) -->
          <img
            class="account-barcode-img"
            :src="barcodeUrl"
            alt="Barcode"
            draggable="false"
          />
        </div>
        <!-- Fake barcode number for UI -->
        <p class="account-barcode-number">9007438329951</p>
      </div>
    </section>

    <!-- ================= FIDELITY (UI MOCK) ================= -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Your fidelity journey</p>
        <!-- Informational button (no logic for now) -->
        <button type="button" class="account-link-btn">Infos</button>
      </div>

      <div class="account-fidelity-card">
        <div class="account-fidelity-bg"></div>

        <div class="account-fidelity-content">
          <p class="account-fidelity-main">{{ cupsLeft }} cups left</p>
          <p class="account-fidelity-sub">
            Buy {{ cupsLeft }} more to get 1 free !
          </p>

          <!-- Progress dots (mocked values) -->
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

    <!-- ================= ORDER HISTORY ================= -->
    <section class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Order history</p>

        <!-- Full history page -->
        <button
          type="button"
          class="account-link-btn"
          @click="$router.push({ name: 'account-orders' })"
        >
          See all orders
        </button>
      </div>

      <!-- Orders loading / error -->
      <p v-if="ordersLoading" class="hint">Loading orders…</p>
      <p v-else-if="ordersError" class="error">{{ ordersError }}</p>

      <!-- Orders list -->
      <ul v-else class="account-orders-list">
        <li
          v-for="order in ordersUi"
          :key="order.id"
          class="account-order-item"
        >
          <div class="account-order-main">
            <p class="account-order-date">{{ order.date }}</p>
            <p class="account-order-summary">{{ order.summary }}</p>
          </div>

          <div class="account-order-right">
            <!-- Status with visual variant -->
            <span
              class="account-order-status"
              :class="{
                'account-order-status--preparation':
                  order.status === 'in preparation' || order.status === 'ready',
                'account-order-status--finished':
                  order.status === 'finished'
              }"
            >
              {{ order.statusLabel }}
            </span>
            <span class="account-order-arrow">›</span>
          </div>
        </li>

        <!-- Empty state -->
        <li
          v-if="ordersUi.length === 0"
          class="hint"
          style="list-style:none; padding: 8px 0;"
        >
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

/* ================= Helpers ================= */

// Format date using Swiss French locale
function fmtDateFR(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-CH");
}

// Normalize order status from FR (DB) to EN (UI)
function normalizeStatus(frStatus) {
  const s = String(frStatus || "").toLowerCase().trim();
  if (s === "en préparation") return { status: "in preparation", label: "in preparation" };
  if (s === "prête") return { status: "ready", label: "ready" };
  if (s === "récupérée") return { status: "finished", label: "finished" };
  return { status: s || "in preparation", label: s || "in preparation" };
}

// Build a short textual summary from order items
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

/* ================= Profile ================= */
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

// Computed display date
const profileCreatedAt = computed(() => {
  const v = profile.value?.created_at;
  return v ? fmtDateFR(v) : "—";
});

/* ================= Orders ================= */
const ordersLoading = ref(false);
const ordersError = ref("");
const ordersUi = ref([]);

async function loadOrders() {
  ordersLoading.value = true;
  ordersError.value = "";
  ordersUi.value = [];

  try {
    const { data } = await api.get("/users/orders", {
      params: { page: 1, limit: 10 },
    });

    const orders = Array.isArray(data?.orders) ? data.orders : [];

    const enriched = await Promise.allSettled(
      orders.map(async (o) => {
        const id = o?._id || o?.id;
        let items = [];

        // Load items per order (used for summary)
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
          date: fmtDateFR(o?.createdAt || o?.created_at || o?.pickup),
          summary: buildSummaryFromItems(items),
          status: st.status,
          statusLabel: st.label,
        };
      })
    );

    ordersUi.value = enriched
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
  } catch (e) {
    ordersError.value =
      e?.response?.data?.message || e?.message || "Failed to load orders";
  } finally {
    ordersLoading.value = false;
  }
}

/* ================= Logout ================= */
function onLogout() {
  auth.logout();
  router.push({ name: "login" }).catch(() => router.push("/login"));
}

/* ================= Fidelity (mock UI) ================= */
const cupsLeft = ref(2);
const totalStamps = 5;
const usedStamps = 3;

/* ================= Navigation ================= */
const goBack = () => router.back();

/* ================= Lifecycle ================= */
onMounted(async () => {
  await loadProfile();
  await loadOrders();
});
</script>

<style scoped>
/* Minimal local styles to avoid overriding global design */
.hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #8b8375;
}
.error {
  margin: 8px 0 0;
  font-size: 12px;
  color: #b00020;
}

/* Profile layout */
.account-profile {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}
.account-profile-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.account-profile-label {
  color: #8b8375;
  font-size: 12px;
}
.account-profile-value {
  font-weight: 600;
  font-size: 12px;
}

/* Barcode image sizing */
.account-barcode-img {
  width: 100%;
  height: 56px;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}
</style>