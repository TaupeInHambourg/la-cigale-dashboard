# La Cigale Dashboard
> Projet fictif

CRM SaaS de gestion des reservations pour le restaurant La Cigale.

## Stack technique

- React Router 7 (full-stack)
- React 19
- TypeScript
- Tailwind CSS 4
- Airtable (source de donnees reservations)

## Prerequis

- Node.js 20.x
- npm 10+
- Un acces Airtable avec:
	- un Personal Access Token valide
	- acces a la base cible

## Installation locale

1. Cloner le depot

```bash
git clone <url-du-repo>
cd la-cigale-dashboard
```

2. Installer les dependances

```bash
npm install
```

3. Creer le fichier .env a la racine du projet

```env
AIRTABLE_API_KEY=pat_xxxxxxxxxxxxxxxxx
AIRTABLE_BASE_ID=appxxxxxxxxxxxxxx

# Option 1 (recommandee): identifiant de table Airtable
AIRTABLE_TABLE_ID=tblxxxxxxxxxxxxxx

# Option 2 (fallback): nom de table Airtable
# AIRTABLE_TABLE_NAME=reservation
```

Notes:

- AIRTABLE_TABLE_ID est prioritaire si les deux variables table sont definies.
- Si AIRTABLE_TABLE_ID est absent, AIRTABLE_TABLE_NAME est utilise.
- Si AIRTABLE_TABLE_NAME est absent, la valeur par defaut est reservation.

## Lancer le projet

Mode developpement:

```bash
npm run dev
```

Application disponible sur:

```text
http://localhost:5173
```

## Verification rapide apres demarrage

1. Ouvrir l application dans le navigateur.
2. Verifier que la liste des reservations se charge.
3. Tester un CRUD complet:
	 - Creer une reservation
	 - Modifier une reservation
	 - Supprimer une reservation
4. Verifier les deux vues:
	 - Vue liste
	 - Vue calendrier

## Scripts utiles

```bash
# Developpement
npm run dev

# Verification TypeScript
npm run typecheck

# Build production
npm run build

# Execution du build
npm run start
```

## Build et execution production

```bash
npm run build
npm run start
```

## Docker

Build image:

```bash
docker build -t la-cigale-dashboard .
```

Execution conteneur:

```bash
docker run --env-file .env -p 3000:3000 la-cigale-dashboard
```

## Depannage

### Erreur Airtable 401/403

- Verifier AIRTABLE_API_KEY.
- Verifier les permissions du token sur la base.

### Erreur Airtable 404

- Verifier AIRTABLE_BASE_ID.
- Verifier AIRTABLE_TABLE_ID ou AIRTABLE_TABLE_NAME.

### Les reservations ne s affichent pas

- Verifier les variables du .env.
- Verifier que la table Airtable contient les champs attendus:
	- name
	- date
	- hour
	- phone_number
	- number_person
	- comments

### Verification statique

```bash
npm run typecheck
```

## Bonnes pratiques securite

- Ne jamais committer un .env avec des secrets reels.
- Regenerer immediatement un token Airtable expose par erreur.
- Limiter les permissions du token Airtable au strict necessaire.
