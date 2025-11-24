<template>
  <div class="auth-wrapper">
    <div class="auth-phone">
      <div class="auth-logo">
        <!-- on utilise maintenant :src="logo" -->
        <img :src="logo" alt="Ocha logo" />
      </div>

      <div class="auth-panel">
        <div class="auth-panel-content">
          <h1 class="auth-title">Log in</h1>

          <div class="auth-tabs">
            <button
              type="button"
              class="auth-tab"
              :class="{ 'auth-tab--active': mode === 'phone' }"
              @click="mode = 'phone'"
            >
              phone
            </button>
            <button
              type="button"
              class="auth-tab"
              :class="{ 'auth-tab--active': mode === 'email' }"
              @click="mode = 'email'"
            >
              email
            </button>
          </div>

          <form class="auth-form" @submit.prevent="onSubmit">
            <template v-if="mode === 'email'">
              <div>
                <div class="auth-field-label">
                  <span>email</span>
                </div>
                <div class="auth-input-line">
                  <input
                    v-model="email"
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
                  <a href="#" class="auth-forgot">Forgot ?</a>
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
            </template>

            <template v-else>
              <div>
                <div class="auth-field-label">
                  <span>phone number</span>
                </div>
                <div class="auth-input-line">
                  <input
                    v-model="phone"
                    type="tel"
                    inputmode="tel"
                    placeholder="+41..."
                    required
                  />
                </div>
              </div>

              <div>
                <div class="auth-field-label">
                  <span>password</span>
                  <a href="#" class="auth-forgot">Forgot ?</a>
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
            </template>

            <p v-if="error" class="auth-error">{{ error }}</p>

            <button class="auth-primary-btn" type="submit">
              log in
            </button>
          </form>

          <p class="auth-bottom">
            new here?
            <RouterLink to="/register">Sign up</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import logo from '@/assets/logo-ocha.png'; // ⬅️ IMPORT DU LOGO

const mode = ref('email');
const email = ref('');
const phone = ref('');
const password = ref('');
const error = ref('');

const onSubmit = () => {
  error.value = '';

  if (mode.value === 'email') {
    if (!email.value || !password.value) {
      error.value = 'Email et mot de passe requis.';
      return;
    }
  } else {
    if (!phone.value || !password.value) {
      error.value = 'Téléphone et mot de passe requis.';
      return;
    }
  }

  console.log('LOGIN', { mode: mode.value, email: email.value, phone: phone.value });
};
</script>