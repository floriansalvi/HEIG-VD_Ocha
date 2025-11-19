<template>
  <div class="auth-page">
    <div class="auth-page__bg">
      <div class="auth-page__overlay"></div>
<h1>sucemon</h1>
      <!-- Logo -->
      <div class="auth-logo">
        <img src="@/assets/logoOcha.png" alt="Ocha logo" />
      </div>

      <!-- Contenu -->
      <div class="auth-page__content">
        <section class="auth-card">
          <h1 class="auth-title">Sign up</h1>

          <!-- Tabs phone / email -->
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
              <div class="auth-field-label">first name</div>
              <div class="auth-input-wrapper">
                <input
                  v-model="firstName"
                  type="text"
                  required
                  placeholder="First name"
                />
              </div>
            </div>

            <div>
              <div class="auth-field-label">last name</div>
              <div class="auth-input-wrapper">
                <input
                  v-model="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                />
              </div>
            </div>

            <div v-if="mode === 'email'">
              <div class="auth-field-label">email</div>
              <div class="auth-input-wrapper">
                <input
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="you@matcha.ch"
                />
              </div>
            </div>

            <div v-else>
              <div class="auth-field-label">phone number</div>
              <div class="auth-input-wrapper">
                <input
                  v-model="phone"
                  type="tel"
                  inputmode="tel"
                  required
                  placeholder="+41..."
                />
              </div>
            </div>

            <div>
              <div class="auth-field-label">password</div>
              <div class="auth-input-wrapper">
                <input
                  v-model="password"
                  type="password"
                  required
                  autocomplete="new-password"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <p v-if="error" class="auth-error">{{ error }}</p>

            <button type="submit" class="auth-primary-btn">
              sign up
            </button>
          </form>

          <p class="auth-bottom">
            already have an account?
            <RouterLink to="/login">Log in</RouterLink>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mode = ref('email');

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const error = ref('');

// TODO: à connecter avec ton backend / store Pinia
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

  const payload = {
    firstName: firstName.value,
    lastName: lastName.value,
    password: password.value,
    ...(mode.value === 'email'
      ? { email: email.value }
      : { phone: phone.value }),
  };

  console.log('Register payload', payload);
};
</script>