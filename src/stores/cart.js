import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // { product, size, quantity }
  }),
  getters: {
    totalPrice(state) {
      return state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
    },
    totalQuantity(state) {
      return state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  },
  actions: {
    addItem(product, size = 'medium') {
      const existing = this.items.find(
        (i) => i.product._id === product._id && i.size === size
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({ product, size, quantity: 1 });
      }
    },
    removeItem(productId, size) {
      this.items = this.items.filter(
        (i) => !(i.product._id === productId && i.size === size)
      );
    },
    clear() {
      this.items = [];
    },
  },
});