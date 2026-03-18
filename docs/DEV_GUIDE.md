# Guide de Développement ZENMO

## 1. Prérequis
- **Node.js** : v18+
- **Docker Desktop** : Pour lancer l'infra locale.
- **Expo CLI** : Pour le mobile (`npm install -g expo-cli`).
- **Git** : Gestion de version.

## 2. Installation Rapide

### 1. Cloner le repo
```bash
git clone <repo_url>
cd zenmo-project
```

### 2. Lancer l'infrastructure (DB + Redis)
```bash
docker-compose up -d
```
Vérifier que tout tourne :
- MongoDB : `localhost:27017`
- Mongo Express (Admin UI) : `http://localhost:8081` (admin/password123)
- Redis : `localhost:6379`

### 3. Backend Setup
```bash
cd zenmo-backend
npm install
cp .env.example .env # Configurer les variables
npm run start:dev
```

### 4. Mobile Setup
```bash
cd zenmo-mobile
npm install
npx expo start
```

## 3. Workflow Git
- **Main** : Code de production stable.
- **Develop** : Branche d'intégration.
- **Feature Branches** : `feat/nom-feature` (ex: `feat/auth-flow`).
- **Fix Branches** : `fix/nom-bug`.

**Règle d'or** : Pas de commit direct sur Main. Toujours passer par une Pull Request (PR).

## 4. Structure du Projet
- `/docs` : Documentation technique.
- `/shared` : Code partagé (types, constantes).
- `/zenmo-backend` : API NestJS.
- `/zenmo-mobile` : App React Native.
