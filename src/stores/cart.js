import { defineStore } from "pinia";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("cart_items") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem("cart_items", JSON.stringify(items));
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: loadCart(), // [{ productId, name, size, unitPrice, quantity, imageUrl }]
  }),

  getters: {
    totalQuantity: (state) =>
      state.items.reduce((sum, it) => sum + it.quantity, 0),

    totalAmount: (state) =>
      state.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
  },

  actions: {
    addItem(payload) {
      const { productId, size, unitPrice } = payload;

      const qtyToAdd = Number(payload.quantity || 1);
      if (!productId) return;

      // clé d’unicité: même produit + même taille (tu peux ajouter d’autres options si besoin)
      const existing = this.items.find(
        (it) => it.productId === productId && it.size === size
      );

      if (existing) {
        existing.quantity += qtyToAdd;
        // si le prix change, on garde le dernier
        existing.unitPrice = Number(unitPrice);
      } else {
        this.items.push({
          productId,
          name: payload.name || "Product",
          size: size || "M",
          unitPrice: Number(unitPrice) || 0,
          quantity: qtyToAdd,
          imageUrl: payload.imageUrl || "",
        });
      }

      saveCart(this.items);
    },

    removeItem(productId, size) {
      this.items = this.items.filter(
        (it) => !(it.productId === productId && it.size === size)
      );
      saveCart(this.items);
    },

    setQuantity(productId, size, quantity) {
      const q = Number(quantity);
      const item = this.items.find(
        (it) => it.productId === productId && it.size === size
      );
      if (!item) return;

      if (q <= 0) {
        this.removeItem(productId, size);
        return;
      }

      item.quantity = q;
      saveCart(this.items);
    },

    clear() {
      this.items = [];
      saveCart(this.items);
    },
  },
});