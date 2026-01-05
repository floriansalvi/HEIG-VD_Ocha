<template>
  <div class="auth-screen">
    <div class="auth-bg">
      <div class="auth-logo">
        <img :src="logo" alt="Ocha logo" />
      </div>
    </div>

    <div class="auth-panel">
      <div class="auth-panel-content">
        <h1 class="auth-title">Log in</h1>

        <form class="auth-form" @submit.prevent="onSubmit">
          <div>
            <div class="auth-field-label">
              <span>email</span>
            </div>
            <div class="auth-input-line">
              <input
                v-model.trim="email"
                type="email"
                autocomplete="email"
                placeholder="you@matcha.ch"
                required
              />
            </div>
          </div>

          <div>
            <div class="auth-field-label">
              <span>password</span>
              <a href="#" class="auth-forgot" @click.prevent>Forgot ?</a>
            </div>
            <div class="auth-input-line">
              <input
                v-model="password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <p v-if="error" class="auth-error">{{ error }}</p>

          <button class="auth-primary-btn" type="submit" :disabled="loading">
            <span v-if="!loading">log in</span>
            <span v-else>loading…</span>
          </button>
        </form>

        <p class="auth-bottom">
          new here?
          <RouterLink to="/register">Sign up</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import logo from "@/assets/logo-ocha.png";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");

const loading = computed(() => auth.loading);

const onSubmit = async () => {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Email et mot de passe requis.";
    return;
  }

  try {
    // 👉 plus tard : await auth.login({ email, password })
    auth.setToken("fake-token"); // token backend plus tard

    const redirect = route.query.redirect;
    router.replace(typeof redirect === "string" ? redirect : "/");
  } catch {
    error.value = "Login failed.";
  }
};
</script>