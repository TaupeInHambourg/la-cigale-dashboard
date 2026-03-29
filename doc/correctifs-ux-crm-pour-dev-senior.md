# Correctifs UX CRM - Dossier d implementation (pour agent Developpeur Senior)

## 1) Objectif
Ce document formalise les correctifs UX prioritaires a implementer sur le CRM reservations, avec focus sur:
- fonctionnement par vues (liste/calendrier),
- ajout de reservation,
- modification de reservation,
- suppression de reservation.

Le but est de supprimer les ambiguities d usage en service et de rendre les parcours plus rapides et plus fiables.

## 2) Priorisation
- P0: a corriger immediatement (impact operationnel direct).
- P1: a corriger juste apres P0 (qualite d usage, robustesse).
- P2: ameliorations de confort (non bloquant MVP).

## 3) Correctifs P0

### P0-1 Affichage telephone exploitable en backoffice
- Probleme UX:
  - Le numero est masque dans les vues, ce qui bloque le rappel client en situation reelle.
- Impact:
  - Elevation du temps de traitement des demandes et perte d efficacite operationnelle.
- Comportement cible:
  - Afficher le numero complet en vue interne CRM.
  - Option alternative si contrainte securite: toggle "Afficher/Masquer" par ligne.
- Fichiers impactes:
  - app/lib/reservations.ts
  - app/components/reservation-list.tsx
- Piste implementation:
  1. Supprimer l appel systematique a toSafeReservation pour le telephone en vue liste/cartes.
  2. Si mode securise requis, ajouter prop maskPhoneInUi=false par defaut.
- Critere d acceptation:
  - En liste desktop et cartes, le numero complet est visible (ou reveal explicite disponible).

### P0-2 Coherence date/heure en vue liste
- Probleme UX:
  - La table desktop affiche seulement l heure alors que le tri est date+heure.
  - Le titre "Reservations du jour" est trompeur sans filtre jour reel.
- Impact:
  - Risque d erreur de lecture et de mauvaise priorisation des actions.
- Comportement cible:
  - Afficher une colonne Date (ou colonne Date/Heure fusionnee) en desktop.
  - Harmoniser avec le rendu cartes mobile deja date+heure.
  - Renommer les labels selon le scope reel de donnees.
- Fichiers impactes:
  - app/components/reservation-list.tsx
- Piste implementation:
  1. Ajouter colonne Date dans le thead et tbody.
  2. Mettre le h2 sur "Reservations" si pas de filtre jour applique.
- Critere d acceptation:
  - Un utilisateur identifie sans ambiguite la date et l heure de chaque reservation sur toutes les vues.

### P0-3 Vue calendrier utilisable sur tablette/mobile
- Probleme UX:
  - Le calendrier est degrade en 1 colonne avec une longue pile de cellules.
  - Chaque cellule vide affiche "Aucune reservation", bruit visuel important.
- Impact:
  - Forte charge cognitive, navigation lente en service.
- Comportement cible:
  - Desktop: grille calendrier conservee.
  - Tablette/mobile: vue agenda (liste par jour) au lieu de 42 cellules verticales.
  - Supprimer la repetition du message vide par cellule.
- Fichiers impactes:
  - app/components/reservation-calendar.tsx
  - app/app.css
- Piste implementation:
  1. Introduire un rendu conditionnel responsive (agenda compact pour <= 980px).
  2. Remplacer les cellules vides par un indicateur discret ou rien.
- Critere d acceptation:
  - Sur tablette/mobile, la consultation des reservations mensuelles est faisable avec scroll raisonnable.

## 4) Correctifs P1

### P1-1 Taille de la cible "+" dans le calendrier
- Probleme UX:
  - Bouton + a 28x28, trop petit pour interaction tactile fiable.
- Comportement cible:
  - Cible tactile minimum 44x44.
- Fichiers impactes:
  - app/app.css
  - app/components/reservation-calendar.tsx
- Piste implementation:
  1. Passer .ghost-action-btn a min-width/min-height 44px.
  2. Ajouter etat hover/focus plus contrastes.
- Critere d acceptation:
  - Le bouton + est facilement actionnable sur tablette tactile.

### P1-2 Validation formulaire plus reactive pendant correction
- Probleme UX:
  - Validation principalement au blur, feedback parfois tardif pendant la correction.
- Comportement cible:
  - Validation au blur initial, puis revalidation onChange si le champ est deja en erreur.
- Fichiers impactes:
  - app/components/reservation-form.tsx
- Piste implementation:
  1. Introduire un etat touched par champ.
  2. Declencher validateField sur onChange si touched[field] === true.
- Critere d acceptation:
  - Les erreurs disparaissent des que la valeur devient valide, sans necessiter un second blur.

### P1-3 Pattern accessibilite du switch de vues
- Probleme UX/A11y:
  - Le switch utilise role tab/tablist sans implementation complete du pattern tabs.
- Comportement cible (choisir une option):
  - Option A: tabs ARIA completes (tabpanel, aria-controls, gestion fleches).
  - Option B: simple toggle buttons sans role tab.
- Fichiers impactes:
  - app/routes/home.tsx
- Piste implementation:
  1. Preferer option B pour simplicite MVP.
  2. Garder aria-pressed=true/false sur boutons de bascule.
- Critere d acceptation:
  - Navigation clavier claire, comportement conforme a la semantique choisie.

## 5) Correctifs P2

### P2-1 Modal suppression: eviter fermeture involontaire overlay
- Probleme UX:
  - Clic hors modal peut fermer la confirmation destructive.
- Comportement cible:
  - Fermer uniquement via bouton Annuler, bouton Fermer, ou Echap.
- Fichiers impactes:
  - app/components/confirm-delete-modal.tsx
- Piste implementation:
  1. Retirer la fermeture onClick sur overlay.
- Critere d acceptation:
  - Aucun risque de fermeture involontaire pendant une suppression sensible.

### P2-2 Standardisation des titres/labels selon contexte
- Probleme UX:
  - Incoherence potentielle entre libelles de sections selon etat.
- Comportement cible:
  - Titres constants et explicites: "Reservations", "Calendrier des reservations", "Nouvelle reservation", "Modifier la reservation".
- Fichiers impactes:
  - app/components/reservation-list.tsx
  - app/routes/reservations.new.tsx
  - app/routes/reservations.$id.edit.tsx

## 6) Plan de livraison conseille
- Sprint 1 (P0):
  1. Telephone exploitable.
  2. Date visible en liste.
  3. Calendrier mobile -> agenda.
- Sprint 2 (P1):
  1. Cibles tactiles +.
  2. Validation reactive.
  3. Switch de vues A11y.
- Sprint 3 (P2):
  1. Modal suppression stricte.
  2. Harmonisation labels.

## 7) Checklist QA associee
- [ ] En vue liste, date et heure sont toujours lisibles.
- [ ] Le numero de telephone est exploitable pour rappel.
- [ ] En mobile/tablette, la vue calendrier est lisible sans scroll excessif.
- [ ] Le bouton + est actionnable sans erreur tactile recurrente.
- [ ] Les erreurs formulaire se corrigent en temps reel apres premiere interaction.
- [ ] La bascule de vues est utilisable clavier et semantiquement correcte.
- [ ] La modal suppression ne se ferme pas involontairement.

## 8) Risques et arbitrages
- Risque securite/RGPD sur affichage telephone:
  - Arbitrage requis PO + Archi sur niveau de masquage acceptable en backoffice.
- Risque de scope creep sur calendrier mobile:
  - Limiter MVP a un agenda simple (liste des reservations par jour) sans drag/drop ni interactions avancees.

## 9) Definition of Done technique
- Tous les correctifs P0 sont en production interne.
- Aucun regression TypeScript (typecheck vert).
- Parcours Ajouter / Modifier / Supprimer verifies manuellement sur desktop + tablette.
- Relecture UX finale validee sur les deux vues (liste et calendrier).
