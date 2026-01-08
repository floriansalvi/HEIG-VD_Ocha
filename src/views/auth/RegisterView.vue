<template>
  <div class="auth-screen">
    <div class="auth-bg">
      <div class="auth-logo">
        <img :src="logo" alt="Ocha logo" />
      </div>
    </div>

    <div class="auth-panel">
      <div class="auth-panel-content">
        <h1 class="auth-title">Sign up</h1>

        <form class="auth-form" @submit.prevent="onSubmit">
          <div>
            <div class="auth-field-label"><span>display name</span></div>
            <div class="auth-input-line">
              <input v-model.trim="displayName" type="text" placeholder="OvoBreak" required />
            </div>
          </div>

          <div>
            <div class="auth-field-label"><span>email</span></div>
            <div class="auth-input-line">
              <input v-model.trim="email" type="email" autocomplete="email" placeholder="you@matcha.ch" required />
            </div>
          </div>

          <div>
            <div class="auth-field-label"><span>password</span></div>
            <div class="auth-input-line">
              <input v-model="password" type="password" autocomplete="new-password" placeholder="PainComplet?02" required />
            </div>
          </div>

          <p v-if="error" class="auth-error">{{ error }}</p>

          <button class="auth-primary-btn" type="submit" :disabled="loading">
            <span v-if="!loading">sign up</span>
            <span v-else>loading…</span>
          </button>
        </form>

        <p class="auth-bottom">
          already have an account? <RouterLink to="/login">Log in</RouterLink>
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

const displayName = ref("");
const email = ref("");
const password = ref("");

const loading = computed(() => auth.loading);
const error = computed(() => auth.error);

const onSubmit = async () => {
  try {
    await auth.register({
      email: email.value,
      password: password.value,
      display_name: displayName.value, // 👈 IMPORTANT: display_name exactement comme le backend
    });

    const redirect = route.query.redirect;
    router.replace(typeof redirect === "string" ? redirect : "/");
  } catch {
    // auth.error déjà rempli
  }
};
</script>