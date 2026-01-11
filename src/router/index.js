import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Auth views (public)
import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";

// App views (protected)
import HomeView from "@/views/HomeView.vue";
import ProductsListView from "@/views/ProductsListView.vue";
import ProductDetailView from "@/views/ProductDetailView.vue";
import CartView from "@/views/CartView.vue";
import OrderSummaryView from "@/views/OrderSummaryView.vue";
import AccountView from "@/views/AccountView.vue";
import AllOrdersView from "@/views/AllOrdersView.vue";

/**
 * Router config:
 * - Public routes: login / register
 * - Protected routes: app pages (requires auth)
 * - Fallback: redirect unknown routes
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    /* ======================
       PUBLIC (guest only)
       ====================== */
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: { guestOnly: true },
    },

    /* ======================
       PROTECTED (auth required)
       ====================== */
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/products",
      name: "products",
      component: ProductsListView,
      meta: { requiresAuth: true },
    },
    {
      path: "/products/:id",
      name: "product-detail",
      component: ProductDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: "/cart",
      name: "cart",
      component: CartView,
      meta: { requiresAuth: true },
    },
    {
      path: "/order-summary",
      name: "order-summary",
      component: OrderSummaryView,
      meta: { requiresAuth: true },
    },
    {
      path: "/account",
      name: "account",
      component: AccountView,
      meta: { requiresAuth: true },
    },
    {
      path: "/account/orders",
      name: "account-orders",
      component: AllOrdersView,
      meta: { requiresAuth: true },
    },

    /* ======================
       FALLBACK
       ====================== */
    // Unknown route -> send to login (will bounce to home if already logged in)
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
});

/**
 * Global navigation guard:
 * - If a route requires auth and user is not authenticated -> redirect to login
 * - If a route is guest-only and user is authenticated -> redirect to home
 */
router.beforeEach((to) => {
  const auth = useAuthStore();

  // Not logged in -> block protected routes
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // Logged in -> block login/register
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "home" };
  }

  return true;
});

export default router;