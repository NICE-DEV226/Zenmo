# Analyse du Projet ZENMO

> Analyse réalisée le 18 mars 2026  
> État du dépôt : Phase de planification / MVP non implémenté

---

## 1. Résumé Exécutif

ZENMO est une application sociale mobile-first conçue pour le marché africain, articulée autour du concept de « vibes » émotionnelles. Elle combine messagerie privée 1:1, stories éphémères par ville et un fil de posts émotionnels.

**Points forts :**
- Architecture backend clairement définie (NestJS + MongoDB + Redis + Socket.io)
- Documentation technique solide (ARCHITECTURE.md, API_STANDARDS.md, DEV_GUIDE.md)
- Stack moderne et pertinente pour la contrainte africaine (faible latence, CDN Cloudinary)
- Types TypeScript partagés frontend/backend (`shared/`)

**Points critiques :**
- Les répertoires `zenmo-backend/` et `zenmo-mobile/` sont **entièrement vides** — aucune ligne de code métier n'est écrite
- Plusieurs **incohérences** entre les fichiers de documentation et les types partagés
- Aucune infrastructure de test
- Aucune pipeline CI/CD

---

## 2. Structure Actuelle du Dépôt

```
Zenmo/
├── README.md                  ✅ Présent et complet
├── docker-compose.yml         ✅ Infrastructure locale définie
├── .env.docker.example        ✅ Variables d'environnement documentées
├── .gitignore                 ✅ Présent
├── docs/
│   ├── ARCHITECTURE.md        ✅ 98% complet
│   ├── API_STANDARDS.md       ✅ Conventions API définies
│   └── DEV_GUIDE.md           ✅ Guide de démarrage
├── shared/
│   ├── types/index.ts         ✅ Types TypeScript (mais incohérences, voir §4)
│   ├── types.ts               ⚠️  Fichier barrel vide (re-export non configuré)
│   ├── constants/index.ts     ✅ Couleurs vibes + liste villes
│   └── constants.ts           ⚠️  Fichier barrel vide (re-export non configuré)
├── zenmo-backend/             ❌ Répertoire vide — aucune implémentation
└── zenmo-mobile/              ❌ Répertoire vide — aucune implémentation
```

---

## 3. Analyse de la Stack Technique

### 3.1 Backend (Prévu : NestJS)

| Composant | Choix | Évaluation |
|-----------|-------|------------|
| Framework | NestJS + TypeScript | ✅ Excellent pour API modulaire + injection de dépendances |
| Base de données | MongoDB Atlas | ✅ Adapté au schéma flexible des vibes/stories |
| Cache | Redis 7 | ✅ Nécessaire pour Socket.io horizontal scaling |
| Auth | JWT (1h) + Refresh (7j) + Argon2 | ✅ Meilleure pratique actuelle |
| Real-time | Socket.io | ✅ Pertinent pour chat temps réel |
| Media | Cloudinary CDN | ✅ Nœuds CDN en Afrique, plan gratuit généreux |
| Push | OneSignal | ✅ SDK multiplateforme, gratuit jusqu'à 10k notifs/mois |
| SMS/OTP | Termii | ⚠️ Peu documenté dans les sources, à valider |

### 3.2 Frontend (Prévu : React Native Expo)

| Composant | Choix | Évaluation |
|-----------|-------|------------|
| Framework | React Native (Expo) | ✅ Codebase unique iOS/Android |
| Navigation | React Navigation v6 | ✅ Standard du marché |
| State | Zustand | ✅ Léger, adapté au MVP |
| HTTP | React Query + Axios | ✅ Cache + refetch automatique |
| Animations | Reanimated 3 + Lottie | ✅ Performances natives |

### 3.3 Infrastructure

| Composant | Statut | Notes |
|-----------|--------|-------|
| docker-compose.yml | ✅ Configuré | MongoDB 7 + Redis 7 + Mongo Express + Backend |
| Variables d'env | ✅ Template fourni | `.env.docker.example` complet |
| CI/CD | ❌ Absent | GitHub Actions non configuré |
| Logging | ❌ Absent | Winston/Pino mentionné comme TODO |
| Monitoring | ❌ Absent | Sentry / Datadog mentionnés comme TODO |

---

## 4. Incohérences Identifiées

Ces incohérences doivent être corrigées avant toute implémentation pour éviter des divergences entre frontend et backend.

### 4.1 Stockage média — README vs ARCHITECTURE

- **README.md** (ligne 59) : « **Storage** : AWS S3 »
- **ARCHITECTURE.md** et **docker-compose.yml** : Cloudinary CDN

**→ Décision à prendre :** Clarifier le fournisseur de stockage média. Cloudinary semble être le choix retenu dans l'architecture détaillée.

### 4.2 Champ `phone` exposé dans `User`

- **`shared/types/index.ts`** expose `phone: string` dans l'interface `User`
- **ARCHITECTURE.md** §5.4 stipule : *« Phone numbers : Jamais stockés en clair (SHA-256 hash) »* et *« never exposed »*

**→ Le champ `phone` ne doit pas figurer dans l'interface `User` retournée par l'API.**

### 4.3 Nom du champ utilisateur — `pseudo` vs `username`

- **`shared/types/index.ts`** : `pseudo: string`
- **ARCHITECTURE.md** schéma UsersModule : `username: string`

**→ Harmoniser le nom du champ** (préférence pour `username` conformément au schéma MongoDB).

### 4.4 Paramètres de confidentialité incohérents

- **`shared/types/index.ts`** `UserSettings.privacy` :
  ```typescript
  privacy: { showOnline: boolean; showCity: boolean; }
  ```
- **ARCHITECTURE.md** schéma MongoDB :
  ```typescript
  privacySettings: { discoverableByPhone: boolean; allowMessageRequests: boolean; }
  ```

**→ Les deux structures coexistent mais ne couvrent pas les mêmes paramètres.** Une structure unifiée est nécessaire.

### 4.5 Type de contenu Stories — `'text'` vs `'video'`

- **`shared/types/index.ts`** `StoryContent.type` : `'image' | 'text'`
- **ARCHITECTURE.md** §3.4 schéma Stories : `type: 'image' | 'video'`

**→ Incohérence sur le type de contenu supporté.** La documentation métier mentionne vidéo, pas texte.

### 4.6 `chatId` vs `conversationId` dans `Message`

- **`shared/types/index.ts`** : `chatId: string`
- **ARCHITECTURE.md** événements WebSocket : `conversationId`

**→ Harmoniser le nom du champ** pour éviter des bugs de mapping.

### 4.7 Authentification OTP vs Password

- **`shared/types/index.ts`** définit `OTPRequest` et `OTPVerify`
- **ARCHITECTURE.md** §3.1 : Auth par `phone + username + password` sans flux OTP pour le MVP

**→ Clarifier si le flux OTP (Termii) est dans le périmètre MVP Phase 1 ou Phase 2.** Les types sont présents mais l'endpoint `/auth/register` décrit ne l'utilise pas.

### 4.8 `UserStats.followersCount` sans système de followers

- **`shared/types/index.ts`** : `followersCount: number` dans `UserStats`
- Aucune mention d'un système de followers dans les features MVP ou dans ARCHITECTURE.md

**→ Supprimer ce champ ou documenter explicitement le système de followers.**

### 4.9 Fichiers barrels `shared/types.ts` et `shared/constants.ts` vides

- `shared/types.ts` et `shared/constants.ts` existent mais ne re-exportent rien.

**→ Ces fichiers doivent soit re-exporter leurs modules respectifs, soit être supprimés.**

### 4.10 Mot de passe Mongo Express incohérent

- **DEV_GUIDE.md** (ligne 23) : `admin/password123`
- **docker-compose.yml** (ligne 31) : `ME_CONFIG_BASICAUTH_PASSWORD: admin`

**→ Corriger DEV_GUIDE.md** pour refléter le mot de passe `admin/admin`.

---

## 5. Analyse des Risques

| Risque | Niveau | Description |
|--------|--------|-------------|
| Répertoires vides | 🔴 Critique | Aucun code métier écrit — le projet est en planning pur |
| Absence de tests | 🔴 Critique | Zéro infrastructure de test (Jest, Supertest, etc.) |
| Incohérences types partagés | 🟠 Élevé | Risque de bugs frontend/backend au moment de l'intégration |
| Pas de CI/CD | 🟠 Élevé | Aucun filet de sécurité pour les contributions |
| SMS OTP non spécifié | 🟠 Élevé | Termii est mentionné mais non documenté ni évalué |
| Connectivité africaine | 🟡 Moyen | Pas de stratégie offline-first documentée pour React Native |
| Scaling WebSocket | 🟡 Moyen | socket.io-redis adapter mentionné comme TODO dans ARCHITECTURE.md |
| Secrets en clair | 🟡 Moyen | `.env.docker.example` contient des valeurs placeholder — vérifier qu'elles ne sont pas commitées |
| RGPD / données personnelles | 🟡 Moyen | SHA-256 pour téléphones est bien, mais pas de politique de rétention documentée |

---

## 6. Feuille de Route Recommandée

### Phase 0 — Corrections immédiates (< 1 semaine)

- [ ] Corriger les incohérences de types dans `shared/types/index.ts` (§4.2–§4.9)
- [ ] Corriger `DEV_GUIDE.md` — mot de passe Mongo Express (§4.10)
- [ ] Clarifier `README.md` — remplacer AWS S3 par Cloudinary (§4.1)
- [ ] Implémenter les barrels `shared/types.ts` et `shared/constants.ts`
- [ ] Décider du flux d'authentification MVP (OTP ou password-based)

### Phase 1 — Bootstrap Backend (2–3 semaines)

- [ ] Initialiser le projet NestJS (`nest new zenmo-backend`)
- [ ] Configurer MongoDB + Mongoose (connexion, schémas)
- [ ] Implémenter `AuthModule` (register, login, JWT)
- [ ] Implémenter `UsersModule` (CRUD, search)
- [ ] Configurer Redis + Socket.io adapter
- [ ] Ajouter Swagger/OpenAPI (`@nestjs/swagger`)
- [ ] Configurer Jest + tests unitaires pour AuthModule

### Phase 2 — Features Core Backend (3–4 semaines)

- [ ] `ConversationsModule` + `ChatModule` (WebSocket)
- [ ] `StoriesModule` (TTL index, upload Cloudinary)
- [ ] `VibesModule` (feed paginé, likes)
- [ ] `UploadModule` (signatures Cloudinary)
- [ ] `NotificationsModule` (OneSignal)
- [ ] Tests d'intégration (Supertest)

### Phase 3 — Bootstrap Mobile (2–3 semaines, en parallèle des phases 1/2)

- [ ] Initialiser Expo (`npx create-expo-app zenmo-mobile`)
- [ ] Configurer React Navigation + écrans principaux
- [ ] Implémenter le flux d'authentification
- [ ] Intégrer React Query + Axios (client API)
- [ ] Écran Chat + Socket.io client
- [ ] Écran Stories + upload Cloudinary direct
- [ ] Écran Vibes Feed

### Phase 4 — Qualité & Production (2 semaines)

- [ ] Pipeline CI/CD GitHub Actions (lint + test + build)
- [ ] Logging structuré (Winston ou Pino)
- [ ] Error tracking (Sentry)
- [ ] Monitoring performance (Datadog ou Prometheus)
- [ ] Tests E2E mobile (Detox ou Maestro)
- [ ] Documentation API Swagger publiée

---

## 7. Recommandations Architecturales

### 7.1 Versionner l'API dès le départ
Préfixer toutes les routes avec `/api/v1/` comme spécifié dans `API_STANDARDS.md`. Évite les breaking changes lors de mises à jour.

### 7.2 Offline-first pour le mobile africain
Implémenter une stratégie de cache local avec **MMKV** ou **WatermelonDB** pour permettre la lecture du feed sans connexion. Critique pour les marchés à connectivité variable.

### 7.3 Étendre la liste des villes
`shared/constants/index.ts` ne couvre que 10 villes du Burkina Faso. Pour un lancement multi-pays (Côte d'Ivoire, Sénégal, Mali...), la liste doit être étendue ou rendue dynamique (endpoint `/cities`).

### 7.4 Compression d'images côté mobile
En complément de Sharp côté backend, utiliser `expo-image-manipulator` pour pré-compresser les médias avant upload. Réduit la consommation data pour les utilisateurs africains.

### 7.5 Circuit breaker pour services externes
Ajouter un pattern circuit breaker (bibliothèque `opossum`) pour Cloudinary, OneSignal et Termii. Évite les timeouts en cascade si un service tiers est indisponible.

### 7.6 Politique de mots de passe
Documenter et implémenter les règles de validation du mot de passe (longueur minimale, complexité) dans les DTOs NestJS avec `class-validator`.

---

## 8. Évaluation de la Maturité du Projet

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Vision produit | 9/10 | Concept clair, marché cible défini, KPI documentés |
| Documentation technique | 8/10 | Architecture solide, quelques incohérences à corriger |
| Types partagés | 5/10 | Présents mais incohérents avec l'architecture |
| Code backend | 0/10 | Non implémenté |
| Code frontend | 0/10 | Non implémenté |
| Infrastructure | 6/10 | Docker Compose prêt, CI/CD absent |
| Tests | 0/10 | Aucune infrastructure de test |
| Sécurité | 6/10 | Bonne stratégie documentée, non implémentée |
| **Global** | **4/10** | **Projet solide sur le papier, implémentation à construire** |

---

*Document généré lors de l'analyse initiale du dépôt ZENMO.*
