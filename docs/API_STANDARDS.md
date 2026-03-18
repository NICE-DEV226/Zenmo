# Standards API ZENMO

## 1. Conventions de Nommage
- **URL** : kebab-case, pluriel.
  - `GET /users`
  - `POST /vibes`
  - `GET /chat-conversations/:id`
- **Query Params** : camelCase.
  - `?page=1&limit=20&sortBy=createdAt`

## 2. Format de Réponse
Toutes les réponses API doivent suivre ce format standard (JSend inspiré).

### Succès
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "User"
  },
  "meta": { // Optionnel (pagination)
    "page": 1,
    "total": 100
  }
}
```

### Erreur
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "L'utilisateur demandé n'existe pas.",
    "details": [] // Optionnel (validation errors)
  }
}
```

## 3. Codes HTTP
- `200 OK` : Succès synchrone.
- `201 Created` : Création réussie.
- `400 Bad Request` : Erreur de validation (client).
- `401 Unauthorized` : Token manquant ou invalide.
- `403 Forbidden` : Token valide mais droits insuffisants.
- `404 Not Found` : Ressource introuvable.
- `429 Too Many Requests` : Rate limit dépassé.
- `500 Internal Server Error` : Bug serveur (ne pas exposer la stacktrace).

## 4. Pagination
Utiliser la pagination par curseur pour les feeds (plus performant) ou par page pour les listes simples.

- **Request** : `GET /vibes?limit=10&cursor=base64string`
- **Response Meta** :
```json
"meta": {
  "nextCursor": "base64string",
  "hasMore": true
}
```

## 5. Versioning
Préfixer les URLs par la version.
- `/api/v1/users`
