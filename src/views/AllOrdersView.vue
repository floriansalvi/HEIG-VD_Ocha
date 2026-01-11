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

    <!-- LIST CARD (same DA as Account) -->
    <section v-else class="account-card">
      <div class="account-card-header">
        <p class="account-section-title">Order history</p>
      </div>

      <ul class="account-orders-list">
        <li
          v-for="o in ordersUI"
          :key="o._id"
          class="account-order-item"
          role="button"
          tabindex="0"
          @click="openDetails(o)"
          @keydown.enter="openDetails(o)"
        >
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

            <!-- Arrow opens details (stop so it doesn't double-trigger in some browsers) -->
            <button
              type="button"
              class="account-order-arrow-btn"
              @click.stop="openDetails(o)"
              aria-label="Open order details"
              style="border:none;background:transparent;padding:0;margin:0;"
            >
              <span class="account-order-arrow">›</span>
            </button>
          </div>
        </li>
      </ul>

      <p v-if="ordersUI.length === 0" class="hint" style="margin: 0;">
        No orders yet.
      </p>
    </section>

    <!-- DETAILS OVERLAY (uses existing overlay CSS from main.css) -->
    <div v-if="showOverlay" class="overlay-backdrop" @click.self="closeDetails">
      <div class="overlay-card">
        <div class="overlay-header">
          <h3 class="overlay-title">Order details</h3>
          <button class="overlay-close" type="button" @click="closeDetails">×</button>
        </div>

        <p v-if="detailsError" class="error" style="margin: 0 0 10px;">{{ detailsError }}</p>

        <!-- Basic info -->
        <div v-if="selectedOrder" style="display:grid; gap: 8px; margin-bottom: 12px;">
          <div style="display:flex; justify-content:space-between; gap: 12px;">
            <span style="color: var(--ocha-muted); font-size: 12px;">Status</span>
            <span style="font-weight: 700; font-size: 12px;">{{ statusLabel(selectedOrder.status) }}</span>
          </div>

          <div style="display:flex; justify-content:space-between; gap: 12px;">
            <span style="color: var(--ocha-muted); font-size: 12px;">Store</span>
            <span style="font-weight: 700; font-size: 12px; text-align:right;">
              {{ selectedOrder?.store_id?.name || "Ocha" }}
              <span v-if="selectedOrder?.store_id?.address?.city"> — {{ selectedOrder.store_id.address.city }}</span>
            </span>
          </div>

          <div v-if="selectedOrder.pickup" style="display:flex; justify-content:space-between; gap: 12px;">
            <span style="color: var(--ocha-muted); font-size: 12px;">Pick up</span>
            <span style="font-weight: 700; font-size: 12px;">{{ fmtPickup(selectedOrder.pickup) }}</span>
          </div>

          <div style="display:flex; justify-content:space-between; gap: 12px;">
            <span style="color: var(--ocha-muted); font-size: 12px;">Total</span>
            <span style="font-weight: 900; font-size: 12px;">
              {{ formatCHF(selectedOrder.total_price_chf) }} CHF
            </span>
          </div>
        </div>

        <!-- Items -->
        <p style="margin: 0 0 8px; font-weight: 700; font-size: 13px;">Items</p>

        <p v-if="detailsLoading" class="hint" style="margin: 0;">Loading items…</p>

        <ul v-else style="list-style:none; margin:0; padding:0; display:grid; gap: 8px;">
          <li
            v-for="it in selectedItems"
            :key="it._key"
            style="background:#fbfaf8;border:1px solid #efe7db;border-radius:14px;padding:10px 12px;display:flex;justify-content:space-between;gap:12px;"
          >
            <div style="min-width:0;">
              <p style="margin:0;font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ it.name }}
                <span v-if="it.size" style="color:var(--ocha-muted);font-weight:700;"> ({{ it.size }})</span>
                <span style="font-weight:900;"> ×{{ it.quantity }}</span>
              </p>
            </div>

            <p v-if="it.unitPrice != null" style="margin:0;font-weight:900;font-size:12px;white-space:nowrap;">
              {{ formatCHF(it.unitPrice) }} CHF
            </p>
          </li>

          <li v-if="!selectedItems.length" class="hint" style="list-style:none; margin:0;">
            No items.
          </li>
        </ul>

        <!-- Delete only if finished -->
        <button
          v-if="selectedOrder && isFinished(selectedOrder)"
          type="button"
          class="order-place-btn"
          style="margin-top: 14px; background:#b00020;"
          @click="deleteSelected"
        >
          Delete this finished order
        </button>
      </div>
    </div>
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

const orders = ref([]); // raw backend orders

// Overlay state
const showOverlay = ref(false);
const selectedOrder = ref(null);
const selectedItems = ref([]);
const detailsLoading = ref(false);
const detailsError = ref("");

function goBack() {
  router.back();
}

/** Date format: DD.MM.YYYY (matches your UI) */
function formatDateFR(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
}

/** Pickup time format: HH:MM */
function fmtPickup(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Price format */
function formatCHF(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(2);
}

/** Backend enum: ["en préparation", "prête", "récupérée"] -> label EN */
function statusLabel(s) {
  if (s === "prête") return "ready";
  if (s === "récupérée") return "finished";
  return "in preparation";
}

function isFinished(o) {
  return (o?.status || "") === "récupérée";
}

async function loadOrders() {
  error.value = "";
  orders.value = [];

  if (!auth.isAuthenticated) return;

  loading.value = true;
  try {
    const { data } = await api.get("/users/orders", { params: { page: 1, limit: 100 } });
    orders.value = Array.isArray(data?.orders) ? data.orders : [];
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to load orders";
  } finally {
    loading.value = false;
  }
}

/** UI mapping: keep the same look as Account list */
const ordersUI = computed(() => {
  const list = Array.isArray(orders.value) ? orders.value : [];
  return list.map((o) => {
    const shop = o?.store_id?.name ? o.store_id.name : "Ocha";
    const total = Number(o?.total_price_chf);
    const totalLabel = Number.isFinite(total) ? `${total.toFixed(2)} CHF` : "—";
    return {
      _id: o?._id,
      raw: o,
      status: o?.status || "en préparation",
      statusLabel: statusLabel(o?.status),
      dateLabel: formatDateFR(o?.createdAt || o?.created_at || o?.pickup || o?.updatedAt),
      summary: `${shop} • ${totalLabel}`,
    };
  });
});

/** Load items for an order (GET /orders/:id/items) */
async function loadOrderItems(orderId) {
  detailsLoading.value = true;
  detailsError.value = "";
  selectedItems.value = [];

  try {
    const { data } = await api.get(`/orders/${orderId}/items`);
    const raw = Array.isArray(data?.items) ? data.items : [];

    selectedItems.value = raw.map((it, idx) => ({
      _key: it?._id || String(idx),
      name: it?.product_name || it?.product_id?.name || "Product",
      size: it?.size || "",
      quantity: Number(it?.quantity) || 1,
      // Your backend stores final_price_chf on OrderItem (used in your CartView too)
      unitPrice: Number.isFinite(Number(it?.final_price_chf)) ? Number(it.final_price_chf) : null,
    }));
  } catch (e) {
    detailsError.value = e?.response?.data?.message || "Failed to load items";
  } finally {
    detailsLoading.value = false;
  }
}

async function openDetails(oUI) {
  const o = oUI?.raw;
  if (!o?._id) return;

  selectedOrder.value = o;
  showOverlay.value = true;

  await loadOrderItems(String(o._id));
}

function closeDetails() {
  showOverlay.value = false;
  selectedOrder.value = null;
  selectedItems.value = [];
  detailsError.value = "";
}

/** Delete order only if finished (DELETE /orders/:id) */
async function deleteSelected() {
  const o = selectedOrder.value;
  if (!o?._id) return;
  if (!isFinished(o)) return;

  const ok = window.confirm("Delete this finished order?");
  if (!ok) return;

  try {
    await api.delete(`/orders/${o._id}`);
    // Remove locally
    orders.value = orders.value.filter((x) => x?._id !== o._id);
    closeDetails();
  } catch (e) {
    detailsError.value = e?.response?.data?.message || "Failed to delete order";
  }
}

onMounted(loadOrders);

// If this view is under <keep-alive> (tab navigation), refresh when returning
onActivated(() => {
  loadOrders();
});
</script>