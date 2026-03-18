# Architecture du Système ZENMO

## 1. Vue d'ensemble
ZENMO est une application sociale mobile-first conçue pour le marché africain. Elle repose sur une architecture modulaire robuste, capable de gérer une forte con currency et des connexions instables.

### Diagramme C4 (Niveau Conteneur)

```mermaid
graph TD
    User[Utilisateur Mobile] -->|HTTPS / WSS| LB[Load Balancer / Nginx]
    LB -->|API REST| API[Backend NestJS]
    LB -->|WebSocket| API
    
    subgraph "Data Layer"
        API -->|Mongoose| DB[(MongoDB Atlas)]
        API -->|Cache & PubSub| Redis[(Redis)]
        API -->|Media Storage| Cloudinary[Cloudinary CDN]
    end
    
    subgraph "External Services"
        API -->|Push Notifications| OneSignal[OneSignal]
    end
    
    subgraph "Admin"
        Admin[Admin Dashboard] -->|HTTPS| API
    end
```

## 2. Choix Technologiques

### Backend : NestJS + TypeScript
- **Pourquoi ?** Structure stricte, injection de dépendances, modulaire, support TypeScript natif.
- **Modules Implémentés (11 total) :**
  - `AuthModule` : JWT Authentication (Access + Refresh tokens)
  - `UsersModule` : CRUD, Search, Totem ID, Contact Sync, Device Registration
  - `ConversationsModule` : 1:1 Chat avec "Taper la porte" logic
  - `ChatModule` : WebSocket (Socket.io) pour temps réel
  - `StoriesModule` : Content éphémère 24h avec TTL index MongoDB
  - `VibesModule` : Posts émotionnels (mood/question/confession)
  - `UploadModule` : Cloudinary presigned URLs + compression
  - `NotificationsModule` : OneSignal push notifications
  - `HealthModule` : Health checks (server + database)

### Base de Données : MongoDB Atlas
- **Pourquoi ?** Flexibilité du schéma NoSQL, performance en lecture, TTL indexes pour auto-expiration.
- **Collections :**
  - `users` - Utilisateurs avec privacy settings
  - `reversecontactbooks` - Index inverse pour "friend joined" notifications
  - `userdevices` - OneSignal Player IDs pour push notifications
  - `conversations` - Conversations 1:1 (PENDING/ACTIVE status)
  - `messages` - Messages (text/image/audio) avec delivery/read tracking
  - `stories` - Stories 24h avec auto-expiration
  - `vibes` - Posts émotionnels avec likes

### Caching & Temps Réel : Redis
- **Utilisation :**
  - Stockage des sessions utilisateurs
  - Cache des feeds pour performance
  - Adapter pour Socket.io (horizontal scaling)
  - Pub/Sub pour notifications entre instances

### Media Storage : Cloudinary
- **Pourquoi ?** CDN global avec nodes en Afrique, transformations automatiques, plan gratuit généreux.
- **Features :**
  - Upload direct depuis mobile (presigned signatures)
  - Auto-optimization (quality, format WebP/AVIF)
  - Transformations à la volée (resize, crop, blur)
  - Compression automatique

### Push Notifications : OneSignal
- **Types :**
  - Nouveau message
  - Ami rejoint Zenmo (ReverseContactBook)
  - Like sur Vibe
  - Story vue

### Frontend : React Native (Expo)
- **Pourquoi ?** Codebase unique iOS/Android, itération rapide, accès aux APIs natives.

---

## 3. Architecture Backend (Modules NestJS)

### 3.1 AuthModule
**Responsabilités** :
- Register avec phone + username + password
- Login avec Argon2 password verification
- JWT token generation (Access: 1h, Refresh: 7 jours)
- JWT Strategy pour validation

**Endpoints** :
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile` (protected)

### 3.2 UsersModule
**Responsabilités** :
- CRUD utilisateurs
- Search par username (text index MongoDB)
- Totem ID resolution (QR codes/deep links)
- Contact Sync privacy-first (SHA-256 hashes)
- Device registration pour notifications

**Endpoints** :
- `GET /users`
- `GET /users/search?q=username`
- `GET /users/totem/:id`
- `POST /users/contacts/sync`
- `POST /users/devices/register`

**Schema** :
```typescript
{
  phoneNumber: string (unique, never exposed)
  phoneNumberHash: string (SHA-256, for privacy)
  username: string (unique, 3-20 chars)
  displayName: string
  password: string (Argon2 hash, select: false)
  totemId: string (UUID for deep links)
  avatarUrl: string (Cloudinary URL)
  bio: string
  vibe: string (mood éphémère)
  privacySettings: {
    discoverableByPhone: boolean
    allowMessageRequests: boolean
  }
}
```

### 3.3 ConversationsModule & ChatModule
**Responsabilités** :
- Conversations 1:1 avec status PENDING/ACTIVE
- "Taper la porte" : text-only jusqu'à acceptation
- Messages text/image/audio
- Delivery & read tracking
- Real-time via Socket.io

**Endpoints** :
- `POST /conversations` (initier conversation)
- `GET /conversations` (list user conversations)
- `PATCH /conversations/:id/accept` (accepter demande)
- `POST /conversations/:id/messages` (envoyer message)
- `GET /conversations/:id/messages` (historique)
- `PATCH /messages/:id/read` (mark as read)

**WebSocket Events** :
- `join_conversation`
- `send_message`
- `typing`
- `mark_read`
- `presence:update`
- Server → Client: `message_delivered`, `message_read`, `presence:online/offline`

### 3.4 StoriesModule
**Responsabilités** :
- Content éphémère 24h
- Auto-deletion via MongoDB TTL index
- City-based grouping
- View tracking

**Endpoints** :
- `POST /stories`
- `GET /stories?city=Ouagadougou`
- `GET /stories/cities` (liste villes actives)
- `PATCH /stories/:id/view` (increment views)

**Schema** :
```typescript
{
  userId: ObjectId
  city: string (pour grouper par ville)
  content: [{
    type: 'image' | 'video'
    url: string (Cloudinary)
    caption: string
    duration: number (secondes  d'affichage)
  }]
  vibe: string (mood)
  expiresAt: Date (24h, TTL index)
  views: number
}
```

### 3.5 VibesModule
**Responsabilités** :
- Posts émotionnels (mood, question, confession)
-Like/Unlike logic
- Feed paginé par ville
- Soft delete

**Endpoints** :
- `POST /vibes`
- `GET /vibes?city=Ouaga&type=mood&limit=20&skip=0`
- `PATCH /vibes/:id/like`
- `PATCH /vibes/:id/unlike`
- `DELETE /vibes/:id` (soft delete)

**Schema** :
```typescript
{
  userId: ObjectId
  type: 'mood' | 'question' | 'confession'
  text: string (max 500 chars)
  media: string[] (Cloudinary URLs)
  city: string
  likes: number
  likedBy: ObjectId[] (prevent double-like)
  comments: number
  isActive: boolean (soft delete)
}
```

### 3.6 UploadModule (Cloudinary)
**Responsabilités** :
- Génération signatures pour upload direct
- Compression images (Sharp)
- URL optimization avec transformations

**Endpoints** :
- `POST /upload/signature` (single file)
- `POST /upload/batch-signatures` (multiple files)
- `GET /upload/optimize?publicId=xxx&width=800` (URL transformée)

### 3.7 NotificationsModule (OneSignal)
**Methods** :
- `notifyNewMessage(playerId, sender, preview)`
- `notifyFriendJoined(playerId, newUser, avatar)`
- `notifyVibeLiked(playerId, liker, vibeText)`
- `notifyStoryViewed(playerId, viewer)`
- `notifyMessageRequestAccepted(playerId, sender)`

---

## 4. Flux de Données

### 4.1 Authentification (Password-based)
1. User entre phone + username + password → API hash password (Argon2)
2. API crée user → génère JWT tokens (Access + Refresh)
3. JWT stocké sécurisé sur mobile (AsyncStorage encrypted)
4. Login : phone lookup (hash SHA-256) + verify password → tokens

### 4.2 Chat (Temps Réel)
1. Mobile se connecte WebSocket avec JWT
2. Envoi message → API valide → Sauvegarde MongoDB
3. Si destinataire online → broadcast via Socket.io → mark delivered
4. Si offline → push notification OneSignal
5. Mark as read → update MongoDB + broadcast event

### 4.3 Stories (24h Ephemeral)
1. User upload image/video → request signature Cloudinary
2. Upload direct à Cloudinary → get URL
3. POST /stories avec URL → MongoDB avec expiresAt (24h)
4. MongoDB TTL index auto-delete après 24h
5. GET /stories?city=X → query non-expired stories

### 4.4 Contact Sync (Privacy-First)
1. Mobile hash phone numbers (SHA-256) localement
2. POST /users/contacts/sync avec hashes
3. Backend update ReverseContactBook (hash → importedBy[])
4. Return users where hash IN hashes AND discoverableByPhone=true
5. **Privacy** : Phone numbers jamais exposés

---

## 5. Sécurité

### 5.1 Authentication & Authorization
- **JWT** : Access (1h) + Refresh (7 jours)
- **Argon2** : Password hashing (meilleur que bcrypt)
- **JwtAuthGuard** : Protection tous endpoints (sauf register/login)
- **Ownership checks** : User peut seulement modifier/delete ses propres resources

### 5.2 Input Validation
- **DTOs** avec `class-validator` sur tous endpoints
- **Phone number** : Format international validation
- **Username** : Regex `^[a-zA-Z0-9_]{3,20}$`
- **Text content** : MaxLength (500 chars pour Vibes)

### 5.3 Rate Limiting
- **Throttler** : 100 requêtes/minute par IP
- **Global guard** activé sur toutes routes

### 5.4 Data Privacy
- **Phone numbers** : Jamais stockés en clair (SHA-256 hash)
- **Privacy settings** : `discoverableByPhone`, `allowMessageRequests`
- **"Taper la porte"** : Text-only messages jusqu'à acceptation

### 5.5 Headers Security
- **Helmet** : Protection XSS, clickjacking, etc.
- **CORS** : Configuré pour domaines autorisés uniquement

---

## 6. Performance & Scalabilité

### 6.1 Database Optimization
- **Indexes MongoDB** :
  - Text index sur `username` pour search
  - Compound indexes : `(conversationId, createdAt)`, `(city, expiresAt)`
  - TTL index sur `stories.expiresAt` pour auto-cleanup
- **Pagination** : Limit + skip sur tous endpoints de liste
- **Select minimal** : Ne retourne que fields nécessaires

### 6.2 Caching (Redis)
- **User sessions** : JWT refresh tokens
- **Feed cache** : Stories/Vibes par ville (TTL 5min)
- **Rate limiting** : Compteurs temps réel

### 6.3 WebSocket Scaling
- **Socket.io-redis adapter** : Permet horizontal scaling sur plusieurs instances backend
- **Sticky sessions** : Load balancer route même user vers même instance

### 6.4 Media Optimization
- **Cloudinary** : Auto-compression + CDN global
- **Sharp** : Compression backend pour thumbnails
- **Lazy loading** : Frontend charge images progressivement

---

## 7. Monitoring & DevOps

### 7.1 Health Checks
- `GET /health` : Server status + uptime
- `GET /health/db` : MongoDB connection state + collections

### 7.2 Logging
-  Console logs structurés (TODO: Winston/Pino)
- **Error tracking** : TODO: Sentry integration

### 7.3 Deployment
- **Docker** : docker-compose.yml avec Mongo + Redis + Backend
- **Production** : Heroku/Railway/AWS ECS
- **CI/CD** : TODO: GitHub Actions

---

## 8. Prochaines Étapes

### Backend
- [ ] Ajouter socket.io-redis adapter pour scaling
- [ ] Intégrer Sentry pour error tracking
- [ ] Tests E2E avec Jest/Supertest
- [ ] Swagger/OpenAPI documentation

### Frontend
- [ ] Connexion Socket.io client
- [ ] OneSignal SDK integration
- [ ] Cloudinary upload direct
- [ ] State management (Context/Redux)

### DevOps
- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Performance monitoring (Datadog)
- [ ] Backup automatiques MongoDB

---

**Architecture mise à jour le 20 Nov 2024**  
**Backend Status : 98% Complet** ✅
