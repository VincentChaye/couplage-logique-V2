# Changelog - Éditeur de Graphes k-partites

## Version 2.0.0 - 2025-11-05

### 🎉 Nouvelles fonctionnalités majeures

#### Éditeur de Graphe Personnalisé
- **Mode Éditeur** : Nouveau mode par défaut pour créer des graphes de A à Z
- **Ajout de nœuds dynamique** : Interface intuitive avec champ "Partie" et "Label"
- **Suppression de nœuds** : Sélection et suppression facile des nœuds
- **Raccourci clavier** : Appui sur Entrée pour ajouter rapidement un nœud
- **Compteur automatique** : Les nœuds sans label reçoivent un nom auto (N1, N2, etc.)

#### Import / Export JSON
- **Export JSON** : Sauvegarde complète du graphe (nœuds, arêtes, positions)
- **Import JSON** : Chargement de graphes depuis fichiers JSON
- **Format structuré** : Métadonnées (nom, date, compteurs)
- **Préservation des positions** : Les coordonnées exactes sont sauvegardées
- **Gestion des erreurs** : Messages d'erreur clairs en cas de problème
- **Validation** : Vérification de la structure JSON lors de l'import

#### Mode Templates
- **5 templates prédéfinis** :
  - Bipartite K₂,₃ (2 parties avec 2 et 3 nœuds)
  - Tripartite 2-2-2 (3 parties équilibrées)
  - Étoile à 5 branches (1 centre + 5 périphérie)
  - Cycle de 6 nœuds (circuit fermé)
  - Graphe complet K₄ (4 nœuds tous connectés)
- **Personnalisation** : Les templates peuvent être modifiés après chargement
- **Export possible** : Sauvegarder vos versions personnalisées

### 🔄 Améliorations de l'interface

#### Navigation
- **3 modes distincts** : Éditeur, Niveaux, Templates
- **Affichage contextuel** : Les contrôles changent selon le mode actif
- **Mode par défaut** : L'éditeur s'affiche au démarrage

#### Panneau de contrôle
- **Réorganisation complète** : Interface plus claire et logique
- **Sections thématiques** : Création, Actions, Import/Export, Opérations
- **Boutons colorés** :
  - Bleu (primary) : Actions principales
  - Vert (secondary) : Import/Export
  - Rouge (danger) : Suppression
  - Blanc (ghost) : Actions secondaires

#### Consignes dynamiques
- **Textes adaptatifs** : Les consignes changent selon le mode/niveau
- **Guide intégré** : Instructions claires pour chaque mode
- **Zone extensible** : S'adapte au contenu

### 📚 Documentation

#### Nouveaux fichiers
- **README.md** : Documentation complète du projet
- **GUIDE_RAPIDE.md** : Guide pratique d'utilisation
- **CHANGELOG.md** : Historique des versions
- **exemple_graphe.json** : Exemple de graphe bipartite
- **exemple_tripartite.json** : Exemple de graphe à 3 parties

#### Aide contextuelle
- **Modale mise à jour** : Guide complet des fonctionnalités
- **Sections organisées** : Modes, Création, Import/Export, Outils
- **Emojis visuels** : Repérage rapide des sections

### 🐛 Corrections de bugs

- **Layout cohérent** : Même algorithme pour tous les modes
- **Bouton "Arêtes aléatoires"** : Activé dans l'éditeur et templates, désactivé dans les niveaux
- **Gestion des contextes** : Le contexte actuel est correctement maintenu
- **Réinitialisation propre** : Les compteurs sont correctement remis à zéro

### 🔧 Améliorations techniques

#### Architecture
- **Code modulaire** : Fonctions bien séparées (éditeur, import/export, templates)
- **Registre de templates** : Structure extensible pour ajouter facilement de nouveaux templates
- **Gestion d'état** : Contexte global pour le mode actuel

#### Performance
- **Ajout optimisé** : Les nœuds sont ajoutés avec des IDs uniques horodatés
- **Layout intelligent** : `applyColumnsByPart()` fonctionne pour tous les cas
- **Chargement rapide** : Les templates sont pré-compilés

#### Compatibilité
- **Rétrocompatible** : Les 6 niveaux existants fonctionnent toujours
- **Format JSON standard** : Compatible avec d'autres outils potentiels
- **Navigateurs modernes** : Testé sur Chrome, Firefox, Edge

### 📦 Fichiers modifiés

#### HTML
- `index.html` : 
  - Nouvelle structure de panneau de contrôle
  - 3 zones de contrôle conditionnelles (editor, levels, templates)
  - Nouveaux champs input (partie, label)
  - Boutons Import/Export
  - Input file masqué
  - Modale d'aide mise à jour

#### CSS
- `style.css` :
  - Styles pour boutons colorés (secondary, danger)
  - Styles pour l'éditeur (editor-panel)
  - Styles pour les inputs (text, number)
  - États de focus améliorés

#### JavaScript
- `script.js` :
  - Nouveaux sélecteurs pour l'éditeur
  - Fonction `initEditor()` pour mode éditeur
  - Fonction `addNode()` pour créer des nœuds
  - Fonction `deleteSelectedNodes()` pour suppression
  - Fonction `exportGraphToJSON()` pour export
  - Fonction `importGraphFromJSON()` pour import
  - Objet `GRAPH_TEMPLATES` avec 5 templates
  - Fonction `loadTemplate()` pour charger un template
  - Event listeners pour tous les nouveaux boutons
  - Gestion des modes améliorée
  - Layout unifié `applyColumnsByPart()`

### 🎯 Migration depuis v1.x

#### Pas de rupture de compatibilité
- Les niveaux existants fonctionnent exactement comme avant
- Le comportement par défaut a changé (éditeur au lieu de niveau 1)
- Pour retrouver l'ancien comportement : passer en mode "Niveaux"

#### Nouvelles possibilités
- Créer et sauvegarder vos propres graphes
- Exporter les niveaux en JSON pour les personnaliser
- Commencer avec des templates pour gagner du temps

---

## Version 1.x (Précédente)

### Fonctionnalités initiales
- 6 niveaux éducatifs prédéfinis
- Mode personnalisé avec paramètres k et n
- Création d'arêtes par interaction (2 clics)
- Suppression d'arêtes par double-clic
- Arêtes potentielles en mode Niveaux
- Arêtes aléatoires en mode personnalisé
- Layout automatique en colonnes
- Bandeau de réussite non-bloquant
- Modale d'aide
- Interface responsive
- Support tactile (mobile)

---

## Roadmap (Idées futures)

### Court terme
- [ ] Couleurs personnalisées pour les nœuds
- [ ] Formes différentes selon les parties
- [ ] Étiquettes sur les arêtes
- [ ] Undo / Redo

### Moyen terme
- [ ] Bibliothèque de graphes partagés
- [ ] Export PNG/SVG du graphe
- [ ] Mode dessin libre (sans contrainte de parties)
- [ ] Algorithmes de graphes (plus court chemin, etc.)

### Long terme
- [ ] Mode collaboratif en temps réel
- [ ] Base de données de graphes
- [ ] API pour intégration externe
- [ ] Version mobile native

---

**Note** : Cette version 2.0 représente une refonte majeure axée sur la personnalisation et la facilitation de la création de graphes. L'accent a été mis sur l'expérience utilisateur et la flexibilité.
