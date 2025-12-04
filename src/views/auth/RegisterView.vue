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
          <div>
            <div class="auth-field-label">
              <span>first name</span>
            </div>
            <div class="auth-input-line">
              <input
                v-model="firstName"
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
                v-model="lastName"
                type="text"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div v-if="mode === 'email'">
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

          <div v-else>
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
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import logo from '@/assets/logo-ocha.png';

const mode = ref('email');
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const error = ref('');

const onSubmit = () => {
  error.value = '';

  if (!firstName.value || !lastName.value || !password.value) {
    error.value = 'Complète tous les champs obligatoires.';
    return;
  }

  if (mode.value === 'email' && !email.value) {
    error.value = 'Email requis.';
    return;
  }

  if (mode.value === 'phone' && !phone.value) {
    error.value = 'Numéro de téléphone requis.';
    return;
  }

  console.log('REGISTER', {
    mode: mode.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    phone: phone.value,
  });
};
</script>