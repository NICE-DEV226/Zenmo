# 🔐 Configuration Sécurité Admin - ZENMO

## Variables d'Environnement à Ajouter dans .env

```bash
# ========================================
# ADMIN SECURITY CONFIGURATION
# ========================================

# Clé secrète admin (CHANGEZ CETTE VALEUR !)
# Générez une clé aléatoire forte : openssl rand -hex 32
ADMIN_SECRET_KEY=votre_cle_secrete_ultra_forte_ici_changez_moi

# IPs autorisées pour l'accès admin (séparées par des virgules)
# Ajoutez UNIQUEMENT vos IPs de confiance
# Exemples :
# - IP locale : 127.0.0.1
# - IP publique : 41.202.xxx.xxx
# - Plusieurs IPs : 127.0.0.1,41.202.xxx.xxx,::1
ADMIN_ALLOWED_IPS=127.0.0.1,::1

# Durée de validité du token admin (plus court que user normal)
ADMIN_JWT_EXPIRATION=30m
```

---

## 🛡️ Mesures de Sécurité Implémentées

### 1. **IP Whitelist** ✅
- Seules les IPs configurées dans `ADMIN_ALLOWED_IPS` peuvent accéder
- Toute tentative d'accès depuis une IP non autorisée est **bloquée** et **loggée**
- Fail-safe : Si aucune IP configurée, **tout est bloqué**

### 2. **Secret Key** ✅
- Clé secrète supplémentaire requise dans le header `X-Admin-Secret`
- Double authentification : JWT + Secret Key
- Protège contre les tokens volés

### 3. **Role SUPER_ADMIN** ✅
- Seul le role `SUPER_ADMIN` peut accéder au dashboard
- Vérification à chaque requête via `SuperAdminGuard`

### 4. **Audit Logging** ✅
- Toutes les tentatives de login admin sont loggées
- Logs incluent : IP, UserAgent, succès/échec, timestamp
- Permet de détecter les tentatives d'intrusion

### 5. **Token Court** ✅
- Token admin expire en 30 minutes (vs 1h pour users normaux)
- Réduit la fenêtre d'exploitation en cas de vol de token

---

## 🔑 Comment Créer Votre Compte SUPER_ADMIN

### Méthode 1 : Via MongoDB Directement (RECOMMANDÉ)

```javascript
// Connectez-vous à MongoDB Atlas ou local
use zenmo

// Trouvez votre user (remplacez par votre numéro)
db.users.findOne({ username: "votre_username" })

// Mettez à jour le role en SUPER_ADMIN
db.users.updateOne(
  { username: "votre_username" },
  { 
    $set: { 
      role: "SUPER_ADMIN",
      updatedAt: new Date()
    } 
  }
)

// Vérifiez
db.users.findOne({ username: "votre_username" }, { role: 1, username: 1 })
```

### Méthode 2 : Script Node.js

Créez `scripts/create-super-admin.js` :

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const username = 'votre_username'; // CHANGEZ ICI
  
  const result = await mongoose.connection.db.collection('users').updateOne(
    { username },
    { $set: { role: 'SUPER_ADMIN', updatedAt: new Date() } }
  );
  
  console.log(`✅ User ${username} promoted to SUPER_ADMIN`);
  console.log(result);
  
  await mongoose.connection.close();
  process.exit(0);
}

createSuperAdmin().catch(console.error);
```

Exécutez :
```bash
node scripts/create-super-admin.js
```

---

## 🚀 Comment Se Connecter au Dashboard Admin

### 1. Obtenir Votre IP Publique

```bash
# Windows PowerShell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Linux/Mac
curl https://api.ipify.org
```

### 2. Configurer .env

```bash
# Ajoutez votre IP
ADMIN_ALLOWED_IPS=127.0.0.1,VOTRE_IP_PUBLIQUE

# Générez une clé secrète forte
ADMIN_SECRET_KEY=$(openssl rand -hex 32)
```

### 3. Redémarrer le Backend

```bash
# Arrêter
Ctrl+C

# Relancer
npm run start
```

### 4. Login Admin

**Endpoint** : `POST http://localhost:3001/api/v1/admin/auth/login`

**Headers** :
```json
{
  "Content-Type": "application/json",
  "X-Admin-Secret": "votre_cle_secrete_de_env"
}
```

**Body** :
```json
{
  "phoneNumber": "+226XXXXXXXX",
  "password": "votre_password"
}
```

**Réponse** :
```json
{
  "user": {
    "id": "...",
    "username": "...",
    "totemId": "..."
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "message": "Admin authentication successful",
  "expiresIn": "30m"
}
```

### 5. Utiliser le Token

Pour toutes les requêtes admin :

**Headers** :
```json
{
  "Authorization": "Bearer VOTRE_ACCESS_TOKEN",
  "X-Admin-Secret": "votre_cle_secrete"
}
```

---

## 🔒 Checklist Sécurité

- [ ] ✅ Générer une clé secrète forte (`ADMIN_SECRET_KEY`)
- [ ] ✅ Configurer vos IPs autorisées (`ADMIN_ALLOWED_IPS`)
- [ ] ✅ Créer votre compte SUPER_ADMIN dans MongoDB
- [ ] ✅ Tester le login admin
- [ ] ✅ Vérifier les logs de sécurité
- [ ] ⚠️ **NE JAMAIS** commiter le `.env` sur Git
- [ ] ⚠️ **NE JAMAIS** partager `ADMIN_SECRET_KEY`
- [ ] ⚠️ Changer `ADMIN_SECRET_KEY` régulièrement (tous les 3 mois)

---

## 🚨 En Cas de Compromission

Si vous suspectez que vos credentials admin ont été compromis :

1. **Immédiatement** :
   ```bash
   # Générer nouvelle clé secrète
   ADMIN_SECRET_KEY=$(openssl rand -hex 32)
   ```

2. **Vérifier les logs** :
   ```bash
   # Chercher tentatives suspectes
   grep "SECURITY" logs/app.log
   ```

3. **Révoquer tous les tokens** :
   - Redémarrer le backend
   - Tous les tokens admin seront invalidés

4. **Changer le password** :
   ```javascript
   // Via MongoDB
   db.users.updateOne(
     { username: "votre_username" },
     { $set: { password: "nouveau_hash_argon2" } }
   )
   ```

---

## 📊 Monitoring Admin

Tous les événements admin sont loggés :

```bash
# Voir les logs admin
tail -f logs/security.log | grep admin

# Événements loggés :
# - LOGIN_SUCCESS (admin_login)
# - LOGIN_FAILED (admin_login)
# - UNAUTHORIZED_ACCESS (IP non autorisée)
# - ADMIN_ACTION (toute action admin)
```

---

**IMPORTANT** : Vous êtes le SEUL à avoir accès à ces informations. Gardez vos credentials en sécurité !
