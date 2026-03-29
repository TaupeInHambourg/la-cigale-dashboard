# Restitution UX/UI -> Dev Fullstack

## Meta
- Version: 1.0
- Date: 2026-03-27
- Auteur: Agent UX/UI Designer senior
- Source brief PO: agents/brief-po-vers-ux-ui-pour-dev-fs.md

## 1) Resume executif
- Vision UX retenue: interface operationnelle, lisible, rapide a manipuler en heure de service.
- Principe directeur: simplicite d usage, feedback immediat, zero ambiguite sur les actions.
- Hypotheses cles: utilisateurs non techniques (accueil, manager), priorite a la fiabilite de saisie.
- Arbitrages effectues: 1 colonne formulaire, actions critiques explicites, validations inline + submit.

## 2) Parcours utilisateurs

### Parcours Accueil
- Objectif: creer ou ajuster une reservation en moins de 30 secondes.
- Etapes:
  1. Ouvrir la liste des reservations (tri chronologique).
  2. Verifier rapidement les infos essentielles (heure, nom, nb pers., telephone).
  3. Cliquer sur Nouvelle reservation.
  4. Remplir le formulaire.
  5. Valider et revenir a la liste avec confirmation visible.
- Frictions:
  - Oubli de champs obligatoires.
  - Erreurs de format telephone.
  - Risque de suppression involontaire.
- Optimisations proposees:
  - Validation inline immediate + recap au submit.
  - Message d aide pour telephone.
  - Modal de suppression avec recap explicite de la reservation.

### Parcours Manager
- Objectif: superviser et corriger rapidement les reservations du service.
- Etapes:
  1. Ouvrir la liste des reservations du jour.
  2. Controler l ordre date/heure.
  3. Modifier une reservation pre-remplie.
  4. Supprimer une reservation annulee via confirmation.
- Frictions:
  - Doute sur la prise en compte de la modification.
  - Erreurs reseau en contexte de rush.
- Optimisations proposees:
  - Etats loading clairs sur les CTA.
  - Toast de succes non bloquant.
  - Message erreur actionnable avec reessai.

## 3) Arborescence MVP
- Liste des reservations
- Creation reservation
- Modification reservation
- Confirmation suppression (modal)

Navigation:
- Liste -> Creation
- Liste -> Modification
- Liste -> Modal suppression
- Creation -> Liste
- Modification -> Liste

## 4) Wireframes textuels low-fidelity

### 4.1 Liste des reservations
- Header: "La Cigale" + date + bouton "Nouvelle reservation"
- Zone principale: table/liste triee par date puis heure
- Colonnes desktop: Heure | Nom | Nb pers. | Telephone | Commentaire | Actions
- Actions par ligne: Modifier, Supprimer
- Etat vide: message + CTA "Nouvelle reservation"
- Feedback: toast succes/erreur

### 4.2 Creation reservation
- Titre: "Nouvelle reservation"
- Formulaire 1 colonne:
  - Nom* (input texte)
  - Date* (date picker)
  - Heure* (time picker)
  - Nombre de personnes* (input numerique)
  - Numero de telephone* (input tel)
  - Commentaires (textarea, optionnel)
- Actions: Annuler / Creer la reservation
- Validation: inline + submit

### 4.3 Modification reservation
- Titre: "Modifier la reservation"
- Meme structure que creation
- Champs pre-remplis
- Actions: Annuler / Enregistrer les modifications

### 4.4 Modal suppression reservation
- Titre: "Supprimer cette reservation ?"
- Texte: action definitive + recap (Nom, Date, Heure, Nb pers.)
- Actions: Annuler / Supprimer (destructif)
- Fermeture: croix, Echap, clic exterieur (hors loading)

## 5) Design system minimum

### 5.1 Tokens couleurs
- color.bg.base = #FAF6F0
- color.bg.surface = #FFFDF9
- color.brand.primary = #B8963E
- color.brand.secondary = #4A5C4E
- color.text.primary = #2C1F14
- color.text.inverse = #FFFFFF
- color.accent.decorative = #7A2D3A
- color.feedback.success = #2E7D32
- color.feedback.error = #B3261E
- color.feedback.warning = #A05A00
- color.feedback.info = #2F5E8C
- color.border.default = #D8CFC2
- color.focus.ring = #7A2D3A

### 5.2 Typographie
- title.fontFamily = Playfair Display
- body.fontFamily = Lato (fallback possible Source Sans Pro)
- accent.fontFamily = Cormorant Garamond italic
- Echelle:
  - H1: 32/40
  - H2: 24/32
  - Body: 16/24
  - Caption: 14/20

### 5.3 Espacements
- scale = 4 / 8 / 12 / 16 / 24 / 32 / 40

### 5.4 Composants + etats
- Bouton primaire: normal / hover / focus / disabled / loading
- Bouton secondaire: normal / hover / focus / disabled / loading
- Bouton destructif: normal / hover / focus / disabled / loading
- Champ texte/tel/date/heure/numerique: normal / focus / erreur / desactive
- Zone commentaire: normal / focus / erreur / desactive
- Toast/Banniere: succes / erreur / info / warning

## 6) Specifications ecran par ecran

### 6.1 Liste des reservations
- Objectif ecran: consulter et agir rapidement sur les reservations.
- Layout: header + zone liste + zone feedback.
- Composants utilises: ReservationList, Button, AppToast, ConfirmDeleteModal.
- Tri/ordre: date ASC puis heure ASC.
- Actions: modifier, supprimer, creer.
- Etat vide: texte explicite + CTA.
- Etat loading: skeleton lignes (ou spinner discret).
- Etat erreur: banniere avec action "Reessayer".
- Messages systeme: toast succes/erreur apres action.
- Responsive desktop/tablette:
  - Desktop: table complete.
  - Tablette: cartes reservation + actions visibles.

### 6.2 Creation reservation
- Objectif ecran: saisie rapide et fiable d une reservation.
- Layout: formulaire centre, 1 colonne, largeur max 640.
- Champs affiches: nom, date, heure, nombre_personnes, telephone, commentaires.
- Regles validation: inline au blur + verification globale au submit.
- Bloc erreurs: message sous champ + resume en tete si submit invalide.
- CTA principal: "Creer la reservation".
- Etat loading: bouton primaire avec spinner, formulaire verrouille.
- Etat succes: redirection liste + toast succes.
- Etat erreur: banniere erreur API conservant la saisie.
- Responsive desktop/tablette: 1 colonne, espacement 16/24.

### 6.3 Modification reservation
- Objectif ecran: corriger une reservation existante rapidement.
- Pre-remplissage: champs charges avec donnees existantes.
- Regles validation: identiques a creation.
- Gestion conflit/erreur: message API actionnable, pas de perte de saisie.
- CTA sauvegarde: "Enregistrer les modifications".
- Etats UX: normal, erreur inline, loading, succes, erreur API.
- Responsive desktop/tablette: meme comportement que creation.

### 6.4 Modal suppression reservation
- Objectif: confirmer explicitement une action destructive.
- Contenu modal: question claire + recap reservation.
- CTA primaire destructif: "Supprimer".
- CTA secondaire: "Annuler".
- Regles fermeture: croix, Echap, clic exterieur (desactive si loading).
- Etats UX: normal, loading, erreur, succes (fermeture + toast).

## 7) Regles de validation et messages normatifs

### 7.1 Validation champs
- nom: obligatoire, min 2, max 80.
- date: obligatoire, format date valide.
- heure: obligatoire, format HH:mm valide.
- nombre de personnes: obligatoire, entier > 0 (min 1, max 20 MVP).
- numero de telephone: obligatoire, format valide FR/international (a confirmer).
- commentaires: facultatif, max 300.

### 7.2 Messages UX
- Creation succes: "Reservation creee avec succes."
- Modification succes: "Reservation modifiee avec succes."
- Suppression succes: "Reservation supprimee avec succes."
- Erreur validation formulaire: "Corrigez les champs en erreur puis reessayez."
- Erreur reseau/API: "Une erreur est survenue. Reessayez dans quelques instants."
- Champ obligatoire: "Ce champ est obligatoire."
- Telephone invalide: "Veuillez saisir un numero de telephone valide."
- Nombre invalide: "Le nombre de personnes doit etre un entier superieur a 0."

## 8) Accessibilite minimum
- Contraste texte/fond >= 4.5:1 pour contenu principal.
- Taille de texte corps >= 16 px.
- Focus clavier visible sur tous les elements interactifs.
- Labels explicites relies a chaque champ.
- Erreurs comprehensibles associees aux champs + resume global.
- Modal avec focus trap et restitution du focus a la fermeture.
- Cibles tactiles recommandee >= 44x44.

## 9) Passation au dev fullstack

### 9.1 Specifications ecran par ecran
- Liste reservations:
  - Objectif: vue operationnelle + actions rapides.
  - Composants: ReservationList, AppToast, ConfirmDeleteModal.
  - Validations: n/a formulaire, gestion erreurs API.
  - Etats UX: loading, empty, error, success.
  - Responsive: table desktop, cartes tablette.

- Creation reservation:
  - Objectif: creation rapide et fiable.
  - Composants: ReservationForm (mode create), Button, Alert.
  - Validations: obligatoires, format, bornes.
  - Etats UX: normal, erreurs inline, loading, success, API error.
  - Responsive: formulaire 1 colonne desktop/tablette.

- Modification reservation:
  - Objectif: edition sans ambiguite.
  - Composants: ReservationForm (mode edit), Button, Alert.
  - Validations: identiques a creation.
  - Etats UX: normal, loading, success, API error.
  - Responsive: identique creation.

- Modal suppression:
  - Objectif: prevention des suppressions involontaires.
  - Composants: ConfirmDeleteModal.
  - Validations: confirmation explicite obligatoire.
  - Etats UX: normal, loading, error, success.
  - Responsive: modal centree desktop, modal large tablette.

### 9.2 Specifications composants
- ReservationForm
  - Variantes: create | edit
  - Props fonctionnelles: initialValues, onSubmit, onCancel, isLoading, errors
  - Etats visuels: normal, focus, erreur, desactive, loading
  - Contraintes implementation: validations centralisees + messages normatifs mutualises

- ReservationList
  - Variantes: desktopTable | tabletCards
  - Props fonctionnelles: items, isLoading, error, onEdit, onDelete
  - Etats visuels: loading, empty, error, data
  - Contraintes implementation: tri date+heure avant rendu

- ConfirmDeleteModal
  - Variantes: default
  - Props fonctionnelles: isOpen, reservation, onConfirm, onCancel, isLoading, error
  - Etats visuels: normal, loading, error
  - Contraintes implementation: focus trap, fermeture Echap, blocage fermeture pendant loading

- AppToast
  - Variantes: success | error | info | warning
  - Props fonctionnelles: type, message, duration, onClose
  - Etats visuels: visible, dismissing
  - Contraintes implementation: messages courts, non techniques, actionnables

### 9.3 Mapping UI -> data model
- nom -> name
- heure -> hour
- numero de telephone -> phone_number
- nombre de personnes -> number_person
- commentaires -> comments
- date -> A valider avec Archi/PO selon schema Airtable

### 9.4 Messages d erreur/succes attendus (liste normative)
- Reservation creee avec succes.
- Reservation modifiee avec succes.
- Reservation supprimee avec succes.
- Ce champ est obligatoire.
- Veuillez saisir un numero de telephone valide.
- Le nombre de personnes doit etre un entier superieur a 0.
- Corrigez les champs en erreur puis reessayez.
- Une erreur est survenue. Reessayez dans quelques instants.

### 9.5 Checklist de recette UX pour QA
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

## 10) A valider avec Archi/PO (obligatoire)
- [ ] Presence/nommage du champ date dans Airtable (point bloquant)
- [ ] Regles exactes format telephone (FR strict vs international)
- [ ] Contraintes horaires (plages de service)
- [ ] Limites de capacite par creneau (si applicable)

## 11) Definition of Done de la passation
- [ ] Tous les ecrans MVP sont decrits de facon implementable
- [ ] Les composants sont reutilisables et documentes
- [ ] Les validations et messages sont complets
- [ ] Les etats UX sont couverts
- [ ] Les points ouverts Archi/PO sont explicitement listes
