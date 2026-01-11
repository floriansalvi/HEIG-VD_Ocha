import { defineStore } from "pinia";

/**
 * Load cart items from localStorage.
 * Fallback to an empty array if parsing fails.
 */
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("cart_items") || "[]");
  } catch {
    return [];
  }
}

/**
 * Persist cart items in localStorage.
 * This allows the cart to survive page reloads.
 */
function saveCart(items) {
  localStorage.setItem("cart_items", JSON.stringify(items));
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    // [{ productId, name, size, unitPrice, quantity, imageUrl }]
    items: loadCart(),
  }),

  getters: {
    /**
     * Total number of items in the cart (sum of quantities).
     */
    totalQuantity: (state) =>
      state.items.reduce((sum, it) => sum + it.quantity, 0),

    /**
     * Total cart amount (unit price * quantity).
     */
    totalAmount: (state) =>
      state.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
  },

  actions: {
    /**
     * Add an item to the cart.
     * If the same product + size already exists, we increase its quantity.
     */
    addItem(payload) {
      const { productId, size, unitPrice } = payload;
      const qtyToAdd = Number(payload.quantity || 1);

      if (!productId) return;

      // Uniqueness key: same product + same size
      const existing = this.items.find(
        (it) => it.productId === productId && it.size === size
      );

      if (existing) {
        // Increase quantity and keep the latest unit price
        existing.quantity += qtyToAdd;
        existing.unitPrice = Number(unitPrice);
      } else {
        // Create a new cart line
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

    /**
     * Remove a specific item from the cart
     * based on productId + size.
     */
    removeItem(productId, size) {
      this.items = this.items.filter(
        (it) => !(it.productId === productId && it.size === size)
      );
      saveCart(this.items);
    },

    /**
     * Update quantity for a given cart item.
     * If quantity goes to 0 or below, the item is removed.
     */
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

    /**
     * Clear the entire cart.
     */
    clear() {
      this.items = [];
      saveCart(this.items);
    },
  },
});