import { defineStore } from 'pinia';
import { mockProducts } from '../data/mockProducts';
// plus tard: import api from '../services/api';

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [],
    isLoading: false,
  }),
  actions: {
    async fetchProducts() {
      this.isLoading = true;
      try {
        // plus tard :
        // const res = await api.get('/products', { params: { page: 1, limit: 20 } });
        // this.items = res.data.items;

        // pour l'instant:
        this.items = mockProducts;
      } finally {
        this.isLoading = false;
      }
    },
  },
});