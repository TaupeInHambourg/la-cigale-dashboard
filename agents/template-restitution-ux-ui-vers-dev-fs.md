# Template de restitution UX/UI -> Dev Fullstack

## Meta
- Version:
- Date:
- Auteur (agent UX/UI):
- Source brief PO:

## 1) Resume executif
- Vision UX retenue:
- Principe directeur:
- Hypotheses cle:
- Arbitrages effectues:

## 2) Parcours utilisateurs
### Parcours Accueil
- Objectif:
- Etapes:
- Frictions:
- Optimisations proposees:

### Parcours Manager
- Objectif:
- Etapes:
- Frictions:
- Optimisations proposees:

## 3) Arborescence MVP
- [ ] Liste des reservations
- [ ] Creation reservation
- [ ] Modification reservation
- [ ] Confirmation suppression

## 4) Design system minimum
### 4.1 Tokens couleurs
- color.bg.base = #FAF6F0
- color.brand.primary = #B8963E
- color.brand.secondary = #4A5C4E
- color.text.primary = #2C1F14
- color.accent.decorative = #7A2D3A
- color.feedback.success =
- color.feedback.error =
- color.feedback.warning =

### 4.2 Typographie
- title.fontFamily = Playfair Display
- body.fontFamily = Lato (ou Source Sans Pro)
- accent.fontFamily = Cormorant Garamond italic
- Echelle (H1/H2/body/caption):

### 4.3 Espacements
- scale = 4 / 8 / 12 / 16 / 24 / 32

### 4.4 Composants de base + etats
- Bouton primaire: normal / hover / focus / disabled / loading
- Bouton secondaire: normal / hover / focus / disabled / loading
- Bouton destructif: normal / hover / focus / disabled
- Champ texte: normal / focus / erreur / desactive
- Champ telephone: normal / focus / erreur / desactive
- Select nombre de personnes: normal / focus / erreur / desactive
- Zone commentaire: normal / focus / erreur / desactive
- Toast/Banniere: succes / erreur / info

## 5) Specifications ecran par ecran

### 5.1 Liste des reservations
- Objectif ecran:
- Layout:
- Composants:
- Tri/ordre d'affichage:
- Actions disponibles:
- Etat vide:
- Etat loading:
- Etat erreur:
- Messages systeme:
- Responsive desktop/tablette:

### 5.2 Creation reservation
- Objectif ecran:
- Layout:
- Champs affiches:
- Regles de validation:
- Bloc erreurs:
- CTA principal:
- Etat loading:
- Etat succes:
- Etat erreur:
- Responsive desktop/tablette:

### 5.3 Modification reservation
- Objectif ecran:
- Pre-remplissage:
- Regles de validation:
- Gestion conflit/erreur:
- CTA sauvegarde:
- Etats UX:
- Responsive desktop/tablette:

### 5.4 Modal suppression reservation
- Objectif:
- Contenu modal:
- CTA primaire (destructif):
- CTA secondaire (annuler):
- Regles de fermeture:
- Etats UX:

## 6) Regles de validation et messages normatifs
### 6.1 Validation champs
- nom: obligatoire, min ?, max ?
- date: obligatoire, format ?, contraintes ?
- heure: obligatoire, format ?, contraintes ?
- nombre de personnes: obligatoire, entier > 0
- numero de telephone: obligatoire, format valide
- commentaires: facultatif, max ?

### 6.2 Messages UX (obligatoires)
- Creation succes:
- Modification succes:
- Suppression succes:
- Erreur validation formulaire:
- Erreur reseau/API:

## 7) Mapping UI -> Data model backend
- nom -> name
- heure -> hour
- numero de telephone -> phone_number
- nombre de personnes -> number_person
- commentaires -> comments
- date -> A valider avec Archi/PO (champ obligatoire cote produit)

## 8) Contraintes implementation pour dev fullstack
- Prioriser composants reutilisables.
- Centraliser les regles de validation.
- Uniformiser les messages erreurs/succes.
- Preserver les etats de formulaire (loading, disable, erreurs inline).
- Respecter strictement la charte couleurs/typo.

## 9) Accessibilite minimum
- Contraste texte/fond conforme.
- Focus clavier visible sur tous les controles interactifs.
- Labels explicites pour chaque champ.
- Messages d'erreur comprehensibles et relies aux champs.
- Taille de texte lisible en contexte operationnel.

## 10) Checklist de recette UX pour QA
- [ ] Creation reservation scenario nominal
- [ ] Modification reservation scenario nominal
- [ ] Suppression reservation scenario nominal
- [ ] Validation erreurs champs obligatoires
- [ ] Validation format numero de telephone
- [ ] Validation nombre de personnes > 0
- [ ] Verification etats loading/succes/erreur
- [ ] Verification contrastes et lisibilite
- [ ] Verification navigation clavier
- [ ] Verification responsive desktop/tablette

## 11) A valider avec Archi/PO (obligatoire)
- [ ] Presence/nommage du champ date dans Airtable
- [ ] Regles exactes format telephone (FR/international)
- [ ] Contraintes horaires (plages service)
- [ ] Limites capacite par creneau (si applicable)

## 12) Definition of Done de la passation
- [ ] Tous les ecrans MVP sont specifiques et implementables
- [ ] Tous les composants requis sont documentes
- [ ] Les validations et messages sont complets
- [ ] Les etats UX sont couverts
- [ ] Les points ouverts Archi/PO sont explicitement listes
