# K-Drama — plateforme de streaming

Projet généré à partir du cahier des charges : catalogue, fiches séries, épisodes,
recherche, comptes et lecteur vidéo.

> ⚠️ **Droits d'auteur** : cette base de code ne fournit ni contenu vidéo ni méthode pour
> contourner des droits. N'y ajoute que des vidéos, sous-titres et affiches pour lesquels
> tu détiens les droits ou une autorisation de diffusion.

## Stack

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : routes API intégrées à Next.js
- **Base de données** : PostgreSQL (requêtes SQL via `pg`, pas d'ORM)
- **Auth** : sessions par cookie signé (JWT) + mots de passe hashés (bcrypt)

## Structure

```
/app            pages et routes (accueil, catalogue, fiche drama, admin, API)
/components     DramaCard, VideoPlayer...
/lib            connexion DB (lib/db.ts) et authentification (lib/auth.ts)
/database       schema.sql + script de migration
```

## Installation

Cette étape nécessite un accès internet (pour installer les dépendances) — à faire sur ta
machine ou ton serveur, pas dans un environnement sans réseau.

1. **Node.js LTS et Git**
   Installe Node.js 20+ et Git si ce n'est pas déjà fait.

2. **Dépendances**
   ```bash
   npm install
   ```

3. **PostgreSQL**
   Crée une base (localement, ou chez un hébergeur : Supabase, Neon, Railway, RDS...).

4. **Variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   Renseigne `DATABASE_URL` et génère un `AUTH_SECRET` :
   ```bash
   openssl rand -base64 48
   ```

5. **Migrations**
   ```bash
   npm run db:migrate
   ```
   Cela crée les tables décrites dans `database/schema.sql` (users, dramas, genres,
   seasons, episodes, favorites, watch_history).

6. **Stockage vidéo / images**
   Configure un stockage objet (S3, R2, etc.) ou un CDN adapté au streaming légal, et
   renseigne `STORAGE_*` dans `.env`. Les URLs vidéo/sous-titres (`video_url`,
   `subtitle_url`) doivent pointer vers ce stockage.

7. **Lancer en développement**
   ```bash
   npm run dev
   ```
   Site disponible sur http://localhost:3000

8. **Créer un compte administrateur**
   Inscris-toi normalement via `/api/auth/register`, puis passe son rôle à `admin`
   directement en base :
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'toi@exemple.com';
   ```

9. **Ajouter un premier drama**
   Depuis `/admin`, ou directement via l'API `POST /api/dramas`.

10. **Déploiement**
    - Héberge le frontend/backend (Vercel, un VPS avec Node, etc.)
    - Active HTTPS (obligatoire — cookies de session sécurisés)
    - Mets en place des sauvegardes régulières de PostgreSQL
    - Ajoute un monitoring basique (uptime, logs d'erreurs)

## Ce qui reste à faire pour un MVP complet

- ~~Middleware de protection des routes `/admin` côté serveur~~ ✅ fait (`middleware.ts`)
- ~~Formulaire de connexion/inscription côté interface~~ ✅ fait (`/connexion`)
- ~~Bouton favoris relié à `/api/favorites`~~ ✅ fait (`FavoriteButton.tsx`, sur la fiche drama)
- ~~Page "Continuer à regarder" + favoris~~ ✅ fait (`/profil`)
- ~~Rangée recommandations sur l'accueil~~ ✅ fait
- ~~Reprise de lecture~~ ✅ fait (le lecteur démarre à `progress_seconds` enregistré)
- Streaming adaptatif (HLS) si la bibliothèque grandit — le lecteur HTML5 actuel lit un
  MP4 direct, suffisant pour démarrer.
- `sitemap.xml` / `robots.txt` et métadonnées Open Graph par page.
- Journalisation des actions admin (table à ajouter, ex. `admin_logs`).
- Notifications réelles (table + déclenchement à l'ajout d'un épisode).
- Statistiques admin (vues, dramas populaires, nouveaux comptes).

## Authentification

- `/connexion` — page de connexion **et** d'inscription (bascule entre les deux).
- Après connexion, un cookie `session` (JWT, httpOnly, secure) est posé par les routes
  `/api/auth/login` et `/api/auth/register`.
- `middleware.ts` protège tout `/admin/*` : redirige vers `/connexion` si non connecté,
  vers `/` si connecté mais pas admin. Il utilise `lib/session-edge.ts` (librairie `jose`)
  car le middleware tourne en runtime Edge, incompatible avec `jsonwebtoken`.
- `app/layout.tsx` lit le cookie côté serveur pour afficher "Connexion" ou
  "Déconnexion" + le lien Admin (visible seulement si `role = admin`).
- `/api/auth/logout` supprime le cookie.

## Sécurité déjà en place

- Mots de passe hashés (bcrypt, 12 rounds)
- Requêtes SQL paramétrées (pas de concaténation → protection injection SQL)
- Validation des entrées avec `zod` sur les routes API
- Rate limiting basique sur `/api/auth/login`
- Cookies de session `httpOnly` + `secure`
- Aucun secret dans le code : tout passe par `.env` (à ne jamais committer)
