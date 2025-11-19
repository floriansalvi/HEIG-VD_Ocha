<template>
  <main class="account">
    <h1>Mon compte</h1>
    <p>Page de compte à venir (profil, logout, etc.).</p>

    <router-link to="/login">Se connecter</router-link>
    <span> · </span>
    <router-link to="/register">Créer un compte</router-link>
  </main>
</template>

<script setup>
// On ajoutera plus tard la logique avec le store auth (Pinia)
</script>

<style scoped>
.account {
  padding-top: 24px;
}
</style>