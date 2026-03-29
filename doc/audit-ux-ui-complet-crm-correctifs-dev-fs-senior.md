# Audit complet UX/UI du CRM - Correctifs pour agent Dev FS Senior

## Meta
- Date: 2026-03-29
- Version: 1.0
- Portee: CRM reservations (vues liste + calendrier, creation, modification, suppression, etats systeme, accessibilite, responsive)

## 1) Resume executif
Le CRM est globalement bien avance: parcours CRUD clairs, charte visuelle coherente, et nombreux correctifs deja integres (coherence date/heure en liste, conservation du contexte calendrier, agenda mobile, taille de cibles tactiles, validation plus reactive).

Les principaux ecarts restants sont:
1. une regression UX critique dans le calendrier (etat partage entre quick add et modal detail),
2. une validation metier non conforme sur le nombre de personnes (decimaux acceptes),
3. des lacunes d accessibilite sur la modal detail jour du calendrier,
4. quelques points de robustesse et coherence des retours utilisateur.

## 2) Forces observees (a conserver)
- Architecture des vues claire et orientee operation:
  - bascule Vue liste / Vue calendrier simple et lisible.
- Flux CRUD maitrises:
  - Ajouter, Modifier, Supprimer accessibles depuis les vues pertinentes.
- Contexte calendrier preserve sur les retours depuis creation/edition.
- Design system visuel coherent avec la charte (couleurs, typographies, boutons, etats).
- Responsive efficace:
  - table en desktop,
  - cartes en mobile,
  - agenda mobile dedie pour le calendrier.
- Etats UX presentes:
  - loading, erreur, vide, succes (toast), confirmation destructive.

## 3) Constat detaille (priorise)

### C1 - Critique: collision d etat dans la vue calendrier
- Observation:
  - Le meme state selectedDetailDate pilote:
    - le date picker d ajout rapide,
    - l ouverture de la modal detail jour.
  - Resultat: choisir une date pour "Ajouter a cette date" ouvre involontairement la modal detail.
- Impact:
  - Parcours ajoute mobile confus et contre-intuitif.
  - Friction operationnelle immediate.
- Correctif:
  - Separer les etats:
    - quickAddDate: string | null (date picker),
    - detailDate: string | null (modal detail).
  - Ouvrir la modal uniquement via "+X" (overflow jour) ou action explicite "Voir le detail".
- Priorite: P0

### C2 - Critique: validation metier non stricte sur nombre de personnes
- Observation:
  - Validation actuelle utilise Number.parseInt sur une chaine.
  - Exemples invalides passes comme valides: "1.5", "1e2" (parseInt -> 1).
- Impact:
  - Non conformite a la regle metier "entier strictement positif".
  - Risque de donnees incoherentes.
- Correctif:
  - Verifier d abord un format entier strict (regex ^[0-9]+$).
  - Puis parse et bornage min/max.
- Priorite: P0

### C3 - Majeur: modal detail jour sans mecanique accessibilite complete
- Observation:
  - La modal detail jour du calendrier (ouverte via "+X") n a pas:
    - focus trap,
    - gestion Escape,
    - restauration du focus.
  - Contrairement a la modal de suppression qui gere ces points.
- Impact:
  - Navigation clavier fragile.
  - Experience degradee pour utilisateurs assistes.
- Correctif:
  - Extraire un composant modal reutilisable avec:
    - focus initial,
    - trap Tab/Shift+Tab,
    - fermeture Escape,
    - restore focus,
    - aria-labelledby et role="dialog" strictement appliques.
- Priorite: P1

### C4 - Majeur: erreurs serveur de validation non mappees champ par champ
- Observation:
  - Les API POST/PUT renvoient fieldErrors, mais l UI n affiche qu un serverError global.
- Impact:
  - Moins de precision en cas de divergence future entre validation front/back.
  - Temps de correction utilisateur augmente.
- Correctif:
  - Etendre ReservationForm pour accepter externalFieldErrors.
  - Mapper fieldErrors API dans les messages inline.
- Priorite: P1

### C5 - Moyen: ergonomie calendrier desktop en jour fortement charge
- Observation:
  - Limitation a 2 reservations visibles + bouton +X est bonne.
  - Mais aucun indicateur de priorite temporelle (pic service) ni distinction visuelle rapide.
- Impact:
  - Lecture plus lente en heure de pointe.
- Correctif:
  - Ajouter une densite visuelle legere:
    - badge tranche horaire (dejeuner/soir),
    - ou accent visuel selon heure.
- Priorite: P2

### C6 - Moyen: feedback toast non specialise pour erreurs critiques
- Observation:
  - Toast utilise role status avec aria-live polite pour tous les types.
- Impact:
  - Les erreurs critiques peuvent etre annoncees trop tardivement par lecteurs d ecran.
- Correctif:
  - Pour type error:
    - role="alert",
    - aria-live="assertive".
  - Conserver polite pour succes/info.
- Priorite: P2

### C7 - Faible: derive de style dans ErrorBoundary
- Observation:
  - Ecran erreur fallback en anglais et styling tailwind brut, non aligne avec la voix produit.
- Impact:
  - Incoherence UX mineure.
- Correctif:
  - Localiser FR et reutiliser le shell visuel CRM.
- Priorite: P3

## 4) Correctifs deja implementes (ne pas regresser)
- Liste:
  - colonne Date ajoutee,
  - telephone visible,
  - titre "Reservations" harmonise.
- Calendrier:
  - persistance contexte month/view dans URL,
  - agenda mobile,
  - quick add date,
  - cibles tactiles + agrandies,
  - gestion overflow +X,
  - banniere mois vide.
- Formulaire:
  - revalidation en onChange apres touch + erreur.
- Suppression:
  - modal confirmation avec focus trap et verrouillage loading.

## 5) Plan de correction recommande

### Sprint P0 (bloquant)
1. C1 - Dissocier quickAddDate et detailDate dans ReservationCalendar.
2. C2 - Validation stricte entier pour number_person (front + verification API).

### Sprint P1
1. C3 - Harmoniser modal detail jour sur le standard accessibilite de ConfirmDeleteModal.
2. C4 - Exposer fieldErrors API dans ReservationForm.

### Sprint P2/P3
1. C5 - Optimiser scanabilite jour charge.
2. C6 - Ajuster semantics toast selon severite.
3. C7 - Uniformiser ErrorBoundary.

## 6) Decoupage tickets (pret implementation)

### UXCRM-01 - Fix state collision quick add vs detail modal
- Composant: app/components/reservation-calendar.tsx
- Taches:
  - creer quickAddDate et detailDate,
  - remplacer usages de selectedDetailDate selon intention,
  - maintenir comportement +X intact.
- AC:
  - Choisir une date dans quick add n ouvre pas la modal detail.
  - Cliquer +X ouvre la modal detail du jour.

### UXCRM-02 - Enforcer integer validation for number_person
- Fichiers:
  - app/lib/reservations.ts
  - tests unitaires (si presents, sinon ajouter)
- Taches:
  - regex entier strict avant parse,
  - conserver bornage min/max,
  - message erreur explicite.
- AC:
  - "1.5", "1e2", "abc" refuses.
  - "1", "2", "20" acceptes.

### UXCRM-03 - Accessible Day Detail Modal
- Composants:
  - app/components/reservation-calendar.tsx
  - option: extraire composant modal reutilisable
- Taches:
  - focus trap, Escape, restore focus,
  - focus initial sur premier element interactif.
- AC:
  - Navigation clavier complete dans la modal detail.

### UXCRM-04 - Map API fieldErrors to form inline errors
- Fichiers:
  - app/routes/reservations.new.tsx
  - app/routes/reservations.$id.edit.tsx
  - app/components/reservation-form.tsx
- Taches:
  - parser fieldErrors API,
  - injecter erreurs champs dans ReservationForm.
- AC:
  - Une erreur serveur champ est visible sous le champ concerne.

### UXCRM-05 - Toast accessibility tuning by severity
- Fichier:
  - app/components/app-toast.tsx
- Taches:
  - role/aria-live conditionnel selon type.
- AC:
  - Erreur annoncee en assertive, succes en polite.

### UXCRM-06 - ErrorBoundary UX alignment
- Fichier:
  - app/root.tsx
- Taches:
  - FR + style cohérent CRM + CTA retour accueil.
- AC:
  - Ecran erreur coherent avec le produit.

## 7) Checklist QA UX/UI complete
- [ ] Vue liste: lecture rapide date/heure/nom/tel, actions edit/delete claires.
- [ ] Vue calendrier desktop: navigation mois, ajout rapide, +X detail, edit/delete fiables.
- [ ] Vue agenda mobile: ajout date cible sans ouverture modale non voulue.
- [ ] Creation: validations inline + submit conformes.
- [ ] Modification: pre-remplissage correct, sauvegarde robuste.
- [ ] Suppression: confirmation explicite, loading verrouille, retour succes.
- [ ] Erreurs API: messages compréhensibles, pas de fuite technique.
- [ ] A11y: focus visible, navigation clavier, modal conforme, annonces ARIA pertinentes.
- [ ] Responsive: desktop/tablette/mobile sans rupture de lisibilite.

## 8) Definition of Done
- Tous les tickets P0 et P1 implementes.
- Typecheck OK et verification manuelle des parcours CRUD sur liste + calendrier.
- Validation QA UX sur desktop et tablette/mobile terminee sans blocant majeur.
