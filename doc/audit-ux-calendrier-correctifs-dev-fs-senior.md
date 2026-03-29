# Audit UX Calendrier CRM - Correctifs pour agent Dev FS Senior

## Meta
- Date: 2026-03-29
- Perimetre: vue calendrier uniquement (desktop + tablette/mobile agenda), incluant actions Ajouter / Modifier / Supprimer depuis cette vue
- Objectif: fiabiliser la lecture operationnelle et reduire la charge cognitive en service

## 1) Synthese executive
La vue calendrier est globalement solide et a deja integre plusieurs ameliorations importantes:
- agenda mobile en remplacement de la grille 42 cellules,
- cibles tactiles du bouton ajout agrandies,
- actions CRUD accessibles depuis calendrier et agenda.

Les correctifs restants concernent surtout:
1. la preservation du contexte calendrier (mois courant) lors des actions,
2. la lisibilite des jours fortement charges,
3. la clarte des etats vides en desktop,
4. des ajustements d accessibilite et de productivite.

## 2) Constat detaille par severite

### C1 - Majeur: Perte de contexte du mois lors des allers-retours
- Observation:
  - Le mois affiche est local au composant via state interne.
  - Apres navigation creation/edition puis retour, le calendrier repart au mois courant.
- Impact UX:
  - Perte de repere pour les utilisateurs qui travaillent sur un mois futur.
  - Friction repetitive en periode de charge (re-navigation manuelle).
- Fichiers concernes:
  - app/components/reservation-calendar.tsx
  - app/routes/home.tsx
- Correctif recommande:
  - Persister le mois dans l URL (ex: view=calendar&month=2026-04).
  - Lire ce parametre a l initialisation, et le mettre a jour au clic precedent/suivant.
  - Conserver ce contexte apres create/edit/delete (retour a la meme vue et meme mois).
- Critere d acceptation:
  - Un utilisateur qui cree/modifie/supprime depuis avril revient sur avril, pas sur le mois courant.

### C2 - Majeur: Densite visuelle non controlee sur jour charge (desktop)
- Observation:
  - Chaque reservation affiche ses actions Modifier/Supprimer directement dans la cellule.
  - En cas de nombreux evenements, la cellule devient tres haute et casse la lecture globale de la semaine.
- Impact UX:
  - Degradation de la scanabilite du planning.
  - Risque d erreurs de clic et perte de vue d ensemble.
- Fichier concerne:
  - app/components/reservation-calendar.tsx
- Correctif recommande:
  - Limiter l affichage a N reservations visibles (ex: 2 ou 3) par cellule.
  - Ajouter un indicateur "+X" ouvrant un panneau detail (drawer/modal) de la journee.
  - Conserver les actions Modifier/Supprimer dans le detail jour pour des cibles plus propres.
- Critere d acceptation:
  - Les cellules restent compactes et lisibles quel que soit le volume.

### C3 - Moyen: Etat vide desktop implicite (sans message global)
- Observation:
  - Si le mois n a aucune reservation, la grille apparait vide sans message contextuel global.
- Impact UX:
  - Ambiguite entre "pas de donnees" et "probleme de chargement/filtre".
- Fichiers concernes:
  - app/components/reservation-calendar.tsx
- Correctif recommande:
  - Ajouter un bandeau d etat au-dessus de la grille: "Aucune reservation sur ce mois" + CTA "Nouvelle reservation".
  - Conserver la grille visible si besoin de projection, mais expliciter l etat.
- Critere d acceptation:
  - L utilisateur comprend immediatement que le mois est vide et sait quoi faire.

### C4 - Moyen: Agenda mobile n expose pas directement l ajout sur jour vide
- Observation:
  - L agenda mobile liste uniquement les jours avec reservations.
  - Les jours vides n offrent pas un bouton direct Ajouter pour une date cible.
- Impact UX:
  - Etape supplementaire pour creer sur une date sans reservation.
- Fichiers concernes:
  - app/components/reservation-calendar.tsx
  - app/routes/reservations.new.tsx
- Correctif recommande:
  - Ajouter un date picker rapide dans l en-tete agenda avec CTA "Ajouter a cette date".
  - Ou afficher les jours du mois en mode compact avec action Ajouter par jour.
- Critere d acceptation:
  - Depuis mobile, ajouter une reservation sur n importe quel jour en 1 a 2 interactions maximum.

### C5 - Faible: Accessibilite semantique de la grille a renforcer
- Observation:
  - role="grid" et role="gridcell" presentes, mais enrichissement possible des labels.
- Impact UX/A11y:
  - Lecture lecteur d ecran perfectible (nombre de reservations non annonce).
- Fichier concerne:
  - app/components/reservation-calendar.tsx
- Correctif recommande:
  - Enrichir aria-label des cellules (date + nombre de reservations).
  - Ajouter un resume en tete de jour dans l agenda (ex: "3 reservations").
- Critere d acceptation:
  - Un lecteur d ecran annonce le contexte jour et charge de reservations sans ambiguite.

## 3) Correctifs deja en place (a conserver)
- Agenda mobile dedie en dessous de 980px.
- Bouton ajout journalier avec cible tactile agrandie (44x44 min).
- Pre-remplissage de la date lors d un ajout depuis une cellule jour.
- Actions Modifier/Supprimer disponibles dans les vues calendrier et agenda.

## 4) Plan d implementation recommande

### Sprint A (priorite immediate)
1. C1 - Persistance month dans URL + retour contexte.
2. C2 - Densite cellule avec "+X" et detail jour.

### Sprint B
1. C3 - Etat vide explicite desktop.
2. C4 - Ajout rapide sur jour vide en mobile.

### Sprint C
1. C5 - Renfort accessibilite semantique.

## 5) Decoupage technique propose (tickets)

### Ticket CAL-01 - Persist month context
- Scope:
  - Ajouter param month=YYYY-MM dans URL quand view=calendar.
  - Synchroniser monthAnchor <-> search params.
  - Preserver le param lors des navigate vers creation/edition et retour.
- Fichiers:
  - app/routes/home.tsx
  - app/components/reservation-calendar.tsx
  - app/routes/reservations.new.tsx
  - app/routes/reservations.$id.edit.tsx

### Ticket CAL-02 - Compact day cells + overflow handling
- Scope:
  - Limiter affichage des events par cellule.
  - Ajouter CTA "+X" ouvrant un detail jour.
- Fichiers:
  - app/components/reservation-calendar.tsx
  - app/app.css

### Ticket CAL-03 - Desktop empty month banner
- Scope:
  - Detecter mois sans reservations.
  - Afficher message global + CTA.
- Fichiers:
  - app/components/reservation-calendar.tsx
  - app/app.css

### Ticket CAL-04 - Mobile quick add for empty dates
- Scope:
  - Ajouter date picker rapide + CTA creation pre-remplie.
- Fichiers:
  - app/components/reservation-calendar.tsx
  - app/routes/reservations.new.tsx

### Ticket CAL-05 - A11y labels hardening
- Scope:
  - aria-label cellule enrichi (date + count).
  - etiquettes explicites pour actions journaliere.
- Fichiers:
  - app/components/reservation-calendar.tsx

## 6) Checklist QA calendrier
- [ ] Changer de mois puis creer une reservation conserve le contexte mois au retour.
- [ ] Changer de mois puis modifier une reservation conserve le contexte mois au retour.
- [ ] Changer de mois puis supprimer une reservation conserve le contexte mois au retour.
- [ ] En desktop, un jour avec beaucoup de reservations reste lisible.
- [ ] Le detail "+X" permet de modifier/supprimer sans ambiguite.
- [ ] En desktop, mois vide affiche un message explicite + CTA.
- [ ] En mobile, ajout rapide sur date vide faisable sans parcours long.
- [ ] Lecteur d ecran annonce date + volume de reservations par cellule.

## 7) Definition of Done
- Correctifs C1 et C2 en place et valides fonctionnellement.
- Aucun blocage UX sur les operations CRUD depuis calendrier.
- Verification manuelle desktop + tablette/mobile terminee.
- Typecheck et comportement des vues conformes apres integration.
