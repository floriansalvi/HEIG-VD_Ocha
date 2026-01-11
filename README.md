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

Créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# API Backend
VITE_API_URL=http://localhost:3000/api/v1

# Optionnel - pour la production
# VITE_API_URL=https://votre-api-deployee.com/api/v1
```

### Notes sur les variables

- `VITE_API_URL` : URL de base pour les appels API (défaut: `http://localhost:3000/api/v1`)
- Les variables préfixées par `VITE_` sont exposées dans le navigateur
- Ne jamais commiter le fichier `.env.local`

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
npm run lint       # Vérifier le code (si configuré)
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

3. **Variables d'environnement**
   - Ajouter `VITE_API_URL` avec l'URL de votre API déployée

4. **Deploy**
   - Chaque push sur `main` déclenche un build automatique

---

## 🔗 Liens utiles

### 🌐 Frontend (Production)

- **URL Render** : https://ocha-matcha.onrender.com
- *À mettre à jour avec le lien réel de votre déploiement Render*

### 🔌 Backend API (Production)

- **URL API** : https://api.ocha-matcha.com/api/v1
- *À mettre à jour avec le lien réel de votre API déployée*
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

---

## 🔑 Authentification

- **Token stocké** : `localStorage.auth_token`
- **Intercepteur API** : Ajoute automatiquement `Authorization: Bearer <token>`
- **Fallback** : Support legacy `access_token`

---

## 📱 PWA (Progressive Web App)

L'application est configurée comme PWA :
- ✅ Installable sur mobile/desktop
- ✅ Fonctionne hors-ligne avec le Service Worker
- ✅ Manifest et icônes incluses

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


---

**Dernière mise à jour** : Janvier 2026
