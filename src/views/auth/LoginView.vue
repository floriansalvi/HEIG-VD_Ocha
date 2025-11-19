<template>
  <div class="auth-page">
    <div class="auth-logo">
      <img src="@/assets/logoApp.png" alt="Ocha Logo" />
    </div>

    <h2 class="auth-title">Log in</h2>

    <div class="auth-tabs">
      <button :class="{ active: mode === 'phone' }" @click="mode = 'phone'">phone</button>
      <button :class="{ active: mode === 'email' }" @click="mode = 'email'">email</button>
    </div>

    <form class="auth-form" @submit.prevent="submitLogin">

      <label v-if="mode === 'email'">
        <span>Email</span>
        <input type="email" placeholder="you@matcha.ch" v-model="email" />
      </label>

      <label v-if="mode === 'phone'">
        <span>Phone</span>
        <input type="tel" placeholder="079 123 45 67" v-model="phone" />
      </label>

      <label>
        <span>Password</span>
        <input type="password" v-model="password" />
      </label>

      <button class="auth-button" type="submit">log in</button>
    </form>

    <p class="auth-footer">
      new here? <router-link to="/register">Sign up</router-link>
    </p>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const mode = ref('email'); // 'email' ou 'phone'
const email = ref('');
const phone = ref('');
const password = ref('');
const error = ref('');

// TODO: brancher ici ton store Pinia + API
const onSubmit = () => {
  error.value = '';

  if (mode.value === 'email') {
    if (!email.value || !password.value) {
      error.value = 'Veuillez entrer email et mot de passe.';
      return;
    }
    console.log('Login with email', email.value, password.value);
  } else {
    if (!phone.value || !password.value) {
      error.value = 'Veuillez entrer téléphone et mot de passe.';
      return;
    }
    console.log('Login with phone', phone.value, password.value);
  }
};
</script>