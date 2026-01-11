<!-- src/views/auth/RegisterView.vue -->
<template>
  <div class="auth-screen">
    <!-- Brand header (background + centered logo) -->
    <div class="auth-bg">
      <div class="auth-logo">
        <img :src="logo" alt="Ocha logo" />
      </div>
    </div>

    <!-- Main auth panel -->
    <div class="auth-panel">
      <div class="auth-panel-content">
        <h1 class="auth-title">Sign up</h1>

        <!-- Prevent default submit: we handle API call manually -->
        <form class="auth-form" @submit.prevent="onSubmit">
          <!-- Display name -->
          <div>
            <div class="auth-field-label">
              <span>display name</span>
            </div>
            <div class="auth-input-line">
              <input
                v-model.trim="displayName"
                type="text"
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <div class="auth-field-label">
              <span>email</span>
            </div>
            <div class="auth-input-line">
              <input
                v-model.trim="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="auth-field-label">
              <span>password</span>
            </div>
            <div class="auth-input-line">
              <input
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <!-- Error message coming from the auth store -->
          <p v-if="error" class="auth-error">{{ error }}</p>

          <!-- Disable button while request is pending -->
          <button class="auth-primary-btn" type="submit" :disabled="loading">
            <span v-if="!loading">sign up</span>
            <span v-else>loading…</span>
          </button>
        </form>

        <!-- Link to login -->
        <p class="auth-bottom">
          already have an account?
          <RouterLink to="/login">Log in</RouterLink>
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

/* Local form state */
const displayName = ref("");
const email = ref("");
const password = ref("");

/* Reactive state from auth store */
const loading = computed(() => auth.loading);
const error = computed(() => auth.error);

const onSubmit = async () => {
  try {
    // Register user (backend expects display_name as the field name)
    await auth.register({
      email: email.value,
      password: password.value,
      display_name: displayName.value, // IMPORTANT: must match backend field
    });

    // Redirect back to where the user came from (or home)
    const redirect = route.query.redirect;
    router.replace(typeof redirect === "string" ? redirect : "/");
  } catch {
    // auth.error is already set by the store
  }
};
</script>