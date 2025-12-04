import { createRouter, createWebHistory } from 'vue-router';

// Vues
import HomeView from '@/views/HomeView.vue';

const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProductsListView = () => import('@/views/ProductsListView.vue');
const OrdersView = () => import('@/views/OrdersView.vue');
const AccountView = () => import('@/views/AccountView.vue');
const ProductDetailView = () => import('../views/ProductDetailView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },

    { path: '/products', name: 'products-list', component: ProductsListView },
    { path: '/orders', name: 'orders', component: OrdersView },
    { path: '/account', name: 'account', component: AccountView },
    {path: '/products/:id', name: 'product-detail', component: ProductDetailView},
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

  ],
});


export default router;