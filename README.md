# OCHA Matcha - Frontend

Application mobile pour la commande de boissons matcha. Développée avec **Vue 3**, **Vite**, **Pinia** et **Vue Router**.

## 📋 Table des matières

- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Développement](#développement)
- [Build et Déploiement](#build-et-déploiement)
- [Liens utiles](#liens-utiles)
- [Technologie](#technologie)

---

## 🚀 Installation

### Prérequis

- **Node.js** : v20.19.0 ou ≥22.12.0
- **npm** ou **yarn**

### Étapes

1. **Cloner le repository**
   ```bash
   git clone <URL_DU_REPO>
   cd HEIG-VD_Ocha
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Vérifier que tout fonctionne**
   ```bash
   npm run dev
   ```
   L'application sera accessible à `http://localhost:5173`

---

## 🔐 Variables d'environnement

### En développement local

Créer un fichier `.env.local` à la racine du projet :

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### En production (Render)

Ne pas utiliser `.env.local` sur Render. À la place, configurer directement dans l'UI Render (Environment Variables) :

```
VITE_API_URL=https://heig-vd-ocha-api.onrender.com/api/v1
```

### Notes

- `VITE_API_URL` : URL de base pour les appels API
- Les variables préfixées par `VITE_` sont exposées dans le navigateur
- Ne jamais commiter le fichier `.env.local` (ajouter à `.gitignore` si ce n'est pas déjà fait)

---

## 🛠️ Développement

### Lancer le serveur de développement

```bash
npm run dev
```

- **URL** : http://localhost:5173
- **Hot Module Replacement** : Activé automatiquement
- **Vue DevTools** : Intégré

### Structure du projet

```
src/
├── assets/              # Images, CSS globaux
├── components/          # Composants réutilisables
│   ├── overlays/       # Modals/overlays
│   └── ui/             # Composants UI
├── data/               # Données statiques
├── router/             # Configuration Vue Router
├── services/           # Services API (axios)
├── sockets/            # WebSocket (si nécessaire)
├── stores/             # Pinia stores (auth, cart, orders)
├── views/              # Pages/vues principales
│   └── auth/           # Pages d'authentification
└── App.vue             # Composant racine
```

### Scripts disponibles

```bash
npm run dev        # Lancer le serveur de développement
npm run build      # Build pour la production
npm run preview    # Aperçu du build de production
```

---

## 🏗️ Build et Déploiement

### Build pour la production

```bash
npm run build
```

Le résultat se trouve dans le dossier `dist/` :
- `dist/index.html` : Fichier principal
- `dist/assets/` : JS, CSS bundles minifiés
- Prêt pour déploiement statique

### Tester le build en local (mode production)

```bash
npm run build
npm run preview
```

Le serveur preview tourne généralement sur : **http://localhost:4173**

Ceci permet de tester la PWA et les performances en mode production.

### Configuration Vite

- **Framework** : Vue 3
- **Alias** : `@/*` → `./src/*`
- **PWA** : Activé (Service Worker automatique)
- **Cible** : ES2020+

### Déploiement sur Render

1. **Connecter le repository GitHub**
   - Aller sur [Render Dashboard](https://dashboard.render.com)
   - Créer un nouveau **Static Site**
   - Sélectionner le repository GitHub

2. **Configuration Render**
   ```
   Build Command:  npm install && npm run build
   Publish Directory:  dist
   ```

3. **Variables d'environnement (Render)**
   ```
   VITE_API_URL = https://heig-vd-ocha-api.onrender.com/api/v1
   ```
   (À configurer dans l'onglet "Environment" du service Render)

4. **Deploy**
   - Chaque push sur `main` déclenche un build automatique

---

## 🔗 Liens utiles

### 🌐 Frontend (Production)

- **URL Render** : https://heig-vd-ocha.onrender.com

### 🔌 Backend API (Production)

- **URL API** : https://heig-vd-ocha-api.onrender.com/api/v1
- **VITE_API_URL (prod)** : https://heig-vd-ocha-api.onrender.com/api/v1
- **Documentation API** : Voir le repository backend

### 📚 Autres ressources

- **Vue 3** : https://vuejs.org
- **Vite** : https://vitejs.dev
- **Vue Router** : https://router.vuejs.org
- **Pinia** : https://pinia.vuejs.org
- **Axios** : https://axios-http.com
- **Leaflet** : https://leafletjs.com

---

## 💾 Gestion d'état (Pinia)

### Stores disponibles

- **`auth`** : Authentification utilisateur (login, token)
- **`cart`** : Panier local (produits, quantités)
- **`orders`** : Commandes depuis l'API

### Exemple d'utilisation

```javascript
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
cart.addItem({ productId: '1', name: 'Matcha', quantity: 1 });
console.log(cart.items);
```

L’architecture suit une séparation claire entre vues, composants UI,
stores Pinia et services API (axios).

---

## 🔑 Authentification

- **Token stocké** : `localStorage.auth_token`
- **Intercepteur API** : Ajoute automatiquement `Authorization: Bearer <token>`
- **Fallback** : Support legacy `access_token`

Toutes les routes protégées sont gérées côté frontend via Vue Router (navigation guards)
et côté backend via un token JWT.

---

## 📱 PWA (Progressive Web App)

Le projet utilise `vite-plugin-pwa`.

- Le fichier `manifest.webmanifest` est **généré automatiquement** lors du build (il n'est pas forcément présent en dur dans `src/`).
- L'application est installable (mode `standalone`) et le Service Worker est enregistré en `autoUpdate`.

**Bonne pratique** : Définir `id: '/'` dans le manifest (sinon Chrome calcule l'ID automatiquement).

Fonctionnalités :
- ✅ Installable sur mobile/desktop
- ✅ Fonctionne hors-ligne avec le Service Worker
- ✅ Manifest généré au build

La configuration PWA se trouve dans `vite.config.js` via `vite-plugin-pwa`.

---

## 🐛 Dépannage

### Port 5173 déjà utilisé
```bash
npm run dev -- --port 3001
```

### Cache navigateur problématique
```bash
# Vider le cache et redémarrer
rm -rf node_modules/.vite
npm run dev
```

### Problèmes d'CORS avec l'API
- Vérifier que `VITE_API_URL` pointe vers le bon endpoint
- S'assurer que le backend autorise CORS pour votre domaine

---

## 📄 License

Projet académique — HEIG-VD
Usage pédagogique uniquement.

---

**Dernière mise à jour** : Janvier 2026
