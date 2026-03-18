# 🔥 ZENMO - Social App Afro-Premium

Une application sociale africaine nouvelle génération basée sur les "vibes", combinant chat privé, stories publiques par ville, et communautés locales.

## 🏗️ Architecture du Projet

```
zenmo-project/
├── zenmo-mobile/          # Frontend React Native (Expo + TypeScript)
├── zenmo-backend/         # Backend NestJS + WebSocket + MongoDB
├── shared/               # Types partagés, utilitaires communs
├── docs/                 # Documentation technique
└── docker-compose.yml    # Orchestration locale
```

## 🎨 Identité Visuelle

### Palette de Couleurs Premium
- **Bleu Nuit** : `#0D0C1D` (fond principal)
- **Violet Royal** : `#7B61FF` (accent principal)
- **Turquoise Énergie** : `#33D1C4` (accent secondaire)
- **Or doux** : `#E4C66D` (éléments premium)
- **Blanc crème** : `#FAF9F6` (texte principal)

### Style Afro-Premium
- Glassmorphism avec motifs africains subtils
- Animations fluides et micro-interactions
- Typographies : Poppins Bold + Inter Regular

## 📱 Frontend (zenmo-mobile)

### Stack Technique
- **Framework** : React Native (Expo) + TypeScript
- **Navigation** : React Navigation v6
- **State Management** : Zustand
- **Styling** : StyleSheet + Design System
- **Animations** : Reanimated 3 + Lottie
- **API** : React Query + Axios

### Écrans Principaux
1. **Splash Screen** - Logo + animations
2. **Onboarding** - 4 étapes "Feel. Share. Flow."
3. **Auth** - Téléphone → OTP → Profil
4. **Home** - Dashboard avec vibes + stories
5. **Chat** - Messages privés glassmorphism
6. **Vibes Feed** - Cœur de l'app
7. **Profil** - Avatar + badges + stats
8. **Stories** - Mode plein écran par ville
9. **Paramètres** - Configuration

## 🔧 Backend (zenmo-backend)

### Stack Technique
- **Framework** : NestJS + TypeScript
- **WebSocket** : Socket.io (temps réel)
- **Database** : MongoDB + Mongoose
- **Cache** : Redis
- **Auth** : JWT + SMS OTP (Termii)
- **Storage** : AWS S3
- **Push** : OneSignal

### Modules Principaux
- **Auth** : SMS OTP + JWT
- **Users** : Profils + vibes
- **Chat** : Messages temps réel
- **Stories** : Contenu éphémère
- **Feed** : Vibes publiques
- **Admin** : Modération

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI
- MongoDB (local ou Atlas)
- Redis (optionnel pour dev)

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd zenmo-project

# Backend
cd zenmo-backend
npm install
npm run start:dev

# Frontend
cd ../zenmo-mobile
npm install
npx expo start
```

## 🔄 Workflow de Développement

### Branches
- `main` : Production
- `develop` : Développement
- `feature/*` : Nouvelles fonctionnalités
- `hotfix/*` : Corrections urgentes

### Commits
Format : `type(scope): description`
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Tests

## 📊 Fonctionnalités MVP

### ✅ Phase 1 (MVP Core)
- [ ] Auth SMS + OTP
- [ ] Profils utilisateur
- [ ] Chat privé 1:1
- [ ] Stories par ville
- [ ] Vibes feed basique
- [ ] Notifications push

### 🔄 Phase 2 (Social)
- [ ] Communautés locales
- [ ] Réactions aux vibes
- [ ] Partage de profils
- [ ] Mode découverte
- [ ] Recherche utilisateurs

### 🚀 Phase 3 (Premium)
- [ ] Audio anonyme
- [ ] Boost payant
- [ ] Thèmes premium
- [ ] Analytics avancées
- [ ] API publique

## 🎯 Objectifs & KPI

### Objectifs Initiaux
- MVP fonctionnel en 12-16 semaines
- UX premium, performant en Afrique
- Viralité localisée (villes/universités)

### KPI (90 jours post-lancement)
- 10k installs
- 20% DAU/MAU
- Temps session > 6 min
- Rétention J1 ≥ 35%

## 🔒 Sécurité

- HTTPS partout
- JWT short-lived + refresh tokens
- Rate limiting
- Validation des inputs
- Chiffrement des données sensibles
- Modération automatique + humaine

## 📈 Scalabilité

- Architecture microservices (NestJS modules)
- Cache Redis pour performances
- CDN pour assets statiques
- WebSocket avec Redis adapter
- Monitoring et alertes

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Propriétaire - Tous droits réservés

---

**ZENMO** - *Feel. Share. Flow.* 🌍✨