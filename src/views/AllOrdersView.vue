<!-- src/views/AllOrdersView.vue -->
<template>
  <div class="account-page">
    <!-- HEADER -->
    <header class="account-header">
      <button class="icon-btn" type="button" @click="goBack">←</button>
      <h1 class="account-title">All orders</h1>
      <span class="account-header-spacer"></span>
    </header>

    <p v-if="loading" class="hint">Loading orders…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <section v-else class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Order history</p>
      </div>

      <ul class="account-orders-list">
        <li v-for="o in ordersUI" :key="o._id" class="account-order-item">
          <div class="account-order-main">
            <p class="account-order-date">{{ o.dateLabel }}</p>
            <p class="account-order-summary">{{ o.summary }}</p>
          </div>

          <div class="account-order-right">
            <span
              class="account-order-status"
              :class="{
                'account-order-status--preparation': o.status === 'en préparation' || o.status === 'prête',
                'account-order-status--finished': o.status === 'récupérée'
              }"
            >
              {{ o.statusLabel }}
            </span>
            <span class="account-order-arrow">›</span>
          </div>
        </li>
      </ul>

      <p v-if="ordersUI.length === 0" class="hint" style="margin: 0;">
        No orders yet.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const error = ref("");
const orders = ref([]); // raw backend

function goBack() {
  router.back();
}

function formatDateFR(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
}

function statusLabel(s) {
  // backend enum: ["en préparation", "prête", "récupérée"]
  if (s === "prête") return "ready";
  if (s === "récupérée") return "finished";
  return "in preparation";
}

async function loadOrders() {
  error.value = "";
  orders.value = [];

  if (!auth.isAuthenticated) return;

  loading.value = true;
  try {
    // Chez vous: /api/v1/users/orders (sans "me")
    const { data } = await api.get("/users/orders", { params: { page: 1, limit: 100 } });
    orders.value = Array.isArray(data?.orders) ? data.orders : [];
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to load orders";
  } finally {
    loading.value = false;
  }
}

/**
 * Résumé simple:
 * - si ton backend renvoie déjà un champ "summary" tu peux l'utiliser direct
 * - sinon on affiche au minimum le shop + total
 */
const ordersUI = computed(() => {
  const list = Array.isArray(orders.value) ? orders.value : [];
  return list.map((o) => {
    const shop = o?.store_id?.name ? o.store_id.name : "Ocha";
    const total = Number(o?.total_price_chf);
    const totalLabel = Number.isFinite(total) ? `${total.toFixed(2)} CHF` : "—";
    return {
      _id: o?._id,
      status: o?.status || "en préparation",
      statusLabel: statusLabel(o?.status),
      dateLabel: formatDateFR(o?.createdAt || o?.created_at || o?.updatedAt),
      summary: `${shop} • ${totalLabel}`,
    };
  });
});

onMounted(loadOrders);

// si la vue est dans un <keep-alive> (onglets), refresh léger au retour
onActivated(() => {
  loadOrders();
});
</script>

<!-- PAS DE CSS: tu gardes exactement ton main.css -->