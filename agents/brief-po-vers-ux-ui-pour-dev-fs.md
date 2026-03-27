# Brief PO -> UX/UI -> Dev Fullstack

## 1) Contexte produit
- Projet: SaaS de gestion des reservations pour la brasserie chic La Cigale.
- Objectif business MVP: fiabiliser et accelerer la gestion des reservations en service.
- Contrainte d'usage: interface rapide, lisible, utilisable par des profils non techniques (accueil/manager) en periode de forte charge.

## 2) Perimetre MVP valide
Le MVP doit permettre:
- Creer une reservation.
- Modifier une reservation.
- Supprimer une reservation.
- Consulter la liste des reservations.

### Donnees d'une reservation
Champs obligatoires:
- Nom
- Date
- Heure
- Nombre de personnes
- Numero de telephone

Champ facultatif:
- Commentaires

## 3) Regles metier a traduire en UX
- Les champs obligatoires doivent etre controles avant soumission.
- Nombre de personnes: entier strictement positif.
- Numero de telephone: format valide.
- Suppression: confirmation explicite obligatoire.
- Les messages doivent etre explicites (succes, erreur, validation).

## 4) Contraintes de marque (obligatoires)
### Palette
- Fond principal: #FAF6F0
- Couleur principale: #B8963E
- Couleur secondaire: #4A5C4E
- Texte principal: #2C1F14
- Accents decoratifs: #7A2D3A

### Typographies (Google Fonts)
- Titres: Playfair Display
- Corps: Lato (ou Source Sans Pro)
- Accents/citations: Cormorant Garamond italique

## 5) Mission confiee a l'agent UX/UI
Produire une recommandation UX/UI complete et actionnable pour implementation front/back.

Livrables attendus:
1. Parcours utilisateurs cibles (Accueil, Manager).
2. Arborescence des ecrans MVP.
3. Wireframes textuels low-fidelity de chaque ecran cle.
4. Specification des composants UI reutilisables.
5. Regles d'etats (normal, focus, hover, loading, succes, erreur, desactive).
6. Regles de validation des formulaires et messages associes.
7. Regles d'accessibilite minimum (contraste, taille texte, focus visible, erreurs comprehensibles).
8. Handoff exploitable pour l'agent dev fullstack.

## 6) Ecrans MVP a concevoir
1. Liste des reservations
- Tri par date/heure (ordre chronologique)
- Actions visibles: modifier, supprimer
- Etat vide (aucune reservation)
- Retour utilisateur apres action (toast/banniere)

2. Creation de reservation
- Formulaire avec champs obligatoires clairement identifies
- Commentaires en champ facultatif
- Validation inline et au submit
- Bouton principal de confirmation

3. Modification de reservation
- Formulaire pre-rempli
- Meme logique de validation que creation
- Confirmation de sauvegarde

4. Suppression de reservation
- Modal de confirmation
- Action destructive clairement differenciee
- Option d'annulation

## 7) Design system minimum a definir
L'agent UX/UI doit fournir:
- Tokens de couleur (noms semantiques + hex)
- Echelle typographique (H1, H2, body, caption)
- Echelle d'espacements (ex: 4/8/12/16/24/32)
- Styles de boutons (primaire, secondaire, destructif)
- Styles de champs de formulaire (normal, focus, erreur, desactive)
- Styles de messages systeme (info, succes, warning, erreur)
- Regles de cards/liste/tabulaire

## 8) Recommandations attendues de UX/UI vers Dev Fullstack
Format de passation recommande (obligatoire):

1. Specs ecran par ecran
- Objectif de l'ecran
- Composants utilises
- Regles de validation
- Etats UX (loading, erreur, succes)
- Comportement responsive minimum (desktop + tablette)

2. Specs composants
- Nom du composant
- Variantes
- Props fonctionnelles attendues
- Etats visuels
- Contraintes d'implementation

3. Mapping champs UI -> data model
- nom -> name
- heure -> hour
- numero de telephone -> phone_number
- nombre de personnes -> number_person
- commentaires -> comments
- date -> a valider avec l'architecte/dev si champ deja present dans la base Airtable

4. Regles de messages et erreurs
- Formulation courte, explicite, actionnable
- Aucune erreur technique brute cote utilisateur

5. Checklist de recette UX pour QA
- Creer/modifier/supprimer en scenario nominal
- Verification erreurs de validation
- Verification lisibilite/contrastes
- Verification parcours clavier

## 9) Points d'attention cross-agent (important)
- L'agent dev fullstack indique une structure Airtable existante avec les champs: id, name, hour, phone_number, number_person, comments.
- Le besoin produit inclut aussi date (obligatoire). Ce point doit etre explicitement remonte a l'Architecte Technique + PO avant implementation definitive.
- Aucun contournement du schema base ne doit etre fait sans validation.

## 10) Definition of Done UX/UI (pour transmission au dev)
Le livrable UX/UI est considere pret quand:
1. Tous les ecrans MVP sont decrits de facon implementable.
2. Les composants sont reutilisables et documentes.
3. Les validations et messages d'erreur sont complets.
4. Les regles responsive minimales sont explicites.
5. Le handoff contient une section "A valider avec Archi/PO" sur le champ date.

## 11) Priorisation de conception
P0:
- Flux creation/modification/suppression
- Liste reservations
- Design tokens et composants de formulaire

P1:
- Recherche/filtre date
- Variantes d'etat plus fines (skeleton, retry)

P2:
- Preparations futures (statuts reservation, plan de salle)

---
Document source: brief produit redige par le Product Owner pour guider l'agent UX/UI et standardiser la transmission vers l'agent dev fullstack.
