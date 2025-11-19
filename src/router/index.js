import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

// AUTH
const LoginView = () => import('../views/auth/LoginView.vue');
const RegisterView = () => import('../views/auth/RegisterView.vue');

// OTHER PAGES
const ProductsListView = () => import('../views/ProductsListView.vue');
const OrdersView = () => import('../views/OrdersView.vue');
const AccountView = () => import('../views/AccountView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/products', name: 'products-list', component: ProductsListView },
    { path: '/orders', name: 'orders', component: OrdersView },
    { path: '/account', name: 'account', component: AccountView },

    // AUTH
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
  ],
});

export default router;