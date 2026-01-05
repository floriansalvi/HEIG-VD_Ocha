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
            <div class="auth-field-label">
              <span>first name</span>
            </div>
            <div class="auth-input-line">
              <input
                v-model.trim="firstName"
                type="text"
                placeholder="First name"
                required
              />
            </div>
          </div>

          <div>
            <div class="auth-field-label">
              <span>last name</span>
            </div>
            <div class="auth-input-line">
              <input
                v-model.trim="lastName"
                type="text"
                placeholder="Last name"
                required
              />
            </div>
          </div>

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

          <p v-if="error" class="auth-error">{{ error }}</p>

          <button class="auth-primary-btn" type="submit">
            sign up
          </button>
        </form>

        <p class="auth-bottom">
          already have an account?
          <RouterLink to="/login">Log in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import logo from "@/assets/logo-ocha.png";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const error = ref("");

const onSubmit = async () => {
  error.value = "";

  if (!firstName.value || !lastName.value || !email.value || !password.value) {
    error.value = "Please fill all fields.";
    return;
  }

  try {
    // 👉 plus tard : await auth.register({ firstName, lastName, email, password })
    auth.setToken("fake-token");

    const redirect = route.query.redirect;
    router.replace(typeof redirect === "string" ? redirect : "/");
  } catch {
    error.value = "Registration failed.";
  }
};
</script>