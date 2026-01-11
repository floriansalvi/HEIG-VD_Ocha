<template>
  <div class="auth-screen">
    <!-- Brand header with background and logo -->
    <div class="auth-bg">
      <div class="auth-logo">
        <img :src="logo" alt="Ocha logo" />
      </div>
    </div>

    <!-- Authentication panel -->
    <div class="auth-panel">
      <div class="auth-panel-content">
        <h1 class="auth-title">Log in</h1>

        <!-- Login form -->
        <!-- Default submit is prevented to handle authentication manually -->
        <form class="auth-form" @submit.prevent="onSubmit">
          <!-- Email field -->
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

          <!-- Password field -->
          <div>
            <div class="auth-field-label">
              <span>password</span>
              <!-- UI only (no feature implemented yet) -->
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

          <!-- Error message coming from auth store -->
          <p v-if="error" class="auth-error">{{ error }}</p>

          <!-- Submit button -->
          <!-- Disabled while login request is pending -->
          <button class="auth-primary-btn" type="submit" :disabled="loading">
            <span v-if="!loading">log in</span>
            <span v-else>loading…</span>
          </button>
        </form>

        <!-- Navigation to register page -->
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

/* Local form state */
const email = ref("");
const password = ref("");

/* Reactive state from auth store */
const error = computed(() => auth.error);
const loading = computed(() => auth.loading);

/* Handle login submission */
const onSubmit = async () => {
  try {
    // Call login action from auth store
    await auth.login({
      email: email.value,
      password: password.value,
    });

    // Redirect user after successful login
    const redirect = route.query.redirect;
    router.replace(typeof redirect === "string" ? redirect : "/");
  } catch {
    // Error is already handled and stored in auth store
  }
};
</script>