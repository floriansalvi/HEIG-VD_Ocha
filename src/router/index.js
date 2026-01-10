// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";

import HomeView from "@/views/HomeView.vue";
import ProductsListView from "@/views/ProductsListView.vue";
import ProductDetailView from "@/views/ProductDetailView.vue";
import CartView from "@/views/CartView.vue";
import OrderSummaryView from "@/views/OrderSummaryView.vue";
import AccountView from "@/views/AccountView.vue";
import AllOrdersView from "@/views/AllOrdersView.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    // PUBLIC
    { path: "/login", name: "login", component: LoginView, meta: { guestOnly: true } },
    { path: "/register", name: "register", component: RegisterView, meta: { guestOnly: true } },

    // PROTECTED
    { path: "/", name: "home", component: HomeView, meta: { requiresAuth: true } },
    { path: "/products", name: "products", component: ProductsListView, meta: { requiresAuth: true } },
    { path: "/products/:id", name: "product-detail", component: ProductDetailView, meta: { requiresAuth: true } },
    { path: "/cart", name: "cart", component: CartView, meta: { requiresAuth: true } },
    { path: "/order-summary", name: "order-summary", component: OrderSummaryView, meta: { requiresAuth: true } },
    { path: "/account", name: "account", component: AccountView, meta: { requiresAuth: true } },
{
  path: "/account/orders",
  name: "account-orders",
  component: AllOrdersView,
  meta: { requiresAuth: true },
},
    // fallback
    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  // Pas loggé → interdit d'aller sur routes protégées
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // Loggé → interdit d'aller sur login/register
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "home" };
  }

  return true;
});

export default router;