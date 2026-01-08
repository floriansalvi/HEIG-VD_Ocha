import { defineStore } from "pinia";
import api from "@/services/api";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    loading: false,
    error: "",
    myOrders: [], // orders from API
  }),

  getters: {
    activeOrder: (s) =>
      s.myOrders.find(
        (o) => !["picked_up", "cancelled"].includes(o.status)
      ) || null,
  },

  actions: {
    async fetchMyOrders() {
      this.loading = true;
      this.error = "";
      try {
        // ✅ ton backend a: GET /users/me/orders (protect)
        const { data } = await api.get("/users/me/orders");
        this.myOrders = Array.isArray(data?.orders) ? data.orders : [];
        return this.myOrders;
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || "Failed to load orders";
        this.myOrders = [];
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderItems(orderId) {
      const { data } = await api.get(`/orders/${orderId}/items`);
      return Array.isArray(data?.items) ? data.items : [];
    },

    async createOrder({ storeId, pickupTime, items }) {
      this.loading = true;
      this.error = "";
      try {
        const totalAmountCHF = items.reduce(
          (sum, it) => sum + Number(it.unitPrice || 0) * Number(it.quantity || 1),
          0
        );

        const payload = {
          storeId,
          pickupTime,
          totalAmountCHF: Number(totalAmountCHF.toFixed(2)),
          items: items.map((it) => ({
            productId: it.productId,
            name: it.name,
            size: it.size,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            imageUrl: it.imageUrl || "",
          })),
        };

        const { data } = await api.post("/orders", payload); // ✅ POST /orders
        // refresh list to show ongoing order in cart
        await this.fetchMyOrders();
        return data;
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || "Failed to create order";
        throw e;
      } finally {
        this.loading = false;
      }
    },
  },
});