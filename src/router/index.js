// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Vues principales
import HomeView from '@/views/HomeView.vue';

// Lazy-loaded views
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProductsListView = () => import('@/views/ProductsListView.vue');
const CartView = () => import('@/views/CartView.vue');
const OrderSummaryView = () => import('@/views/OrderSummaryView.vue');
const AccountView = () => import('@/views/AccountView.vue');
const ProductDetailView = () => import('@/views/ProductDetailView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Home
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    // Liste des boissons
    {
      path: '/products',
      name: 'products-list',
      component: ProductsListView,
    },

    // Détail d'une boisson
    {
      path: '/products/:id',
      name: 'product-detail',
      component: ProductDetailView,
      props: true, // pour récupérer :id comme prop si tu veux
    },

    // Panier
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
    },

    // Récap commande (avant "Place order")
    {
      path: '/order',
      name: 'order-summary',
      component: OrderSummaryView,
    },

    // Auth
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },

    // Compte utilisateur
    {
      path: '/account',
      name: 'account',
      component: AccountView,
    },
  ],

  // Optionnel mais confort : remonter en haut à chaque changement de page
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;