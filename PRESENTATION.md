# 🎨 Éditeur de Graphes k-partites - Version 2.0

## ✨ Présentation

Application web interactive complètement révisée pour créer, personnaliser et explorer des graphes k-partites avec une facilitation maximale de la création et un système complet d'import/export JSON.

---

## 🚀 Nouvelles fonctionnalités principales

### 1. 🎨 **Éditeur de Graphe Personnalisé**

**Le cœur de la nouvelle version !**

- **Création intuitive de nœuds** : Interface simple avec 2 champs (Partie + Label)
- **Ajout rapide** : Bouton ou touche Entrée pour ajouter instantanément
- **Gestion des parties** : Jusqu'à 10 parties différentes
- **Labels personnalisés** : Nommez vos nœuds comme vous voulez
- **Suppression facile** : Sélectionnez et supprimez les nœuds inutiles
- **Positionnement visuel** : Drag & drop pour organiser votre graphe

**Exemple d'utilisation :**
```
Partie: 1, Label: Alice   → Ajouter
Partie: 1, Label: Bob     → Ajouter
Partie: 2, Label: Math    → Ajouter
Partie: 2, Label: Physique → Ajouter

Puis cliquer entre les nœuds pour créer les arêtes !
```

### 2. 💾 **Import / Export JSON Complet**

**Sauvegardez et partagez vos créations !**

#### Export
- **Un clic** : Bouton "📥 Exporter JSON"
- **Tout est sauvegardé** :
  - Tous les nœuds avec leurs propriétés
  - Toutes les arêtes
  - Positions exactes des nœuds
  - Métadonnées (nom, date, statistiques)
- **Format standard** : JSON lisible et modifiable
- **Nom automatique** : `graphe_[timestamp].json`

#### Import
- **Un clic** : Bouton "📤 Importer JSON"
- **Chargement instantané** : Le graphe apparaît immédiatement
- **Positions préservées** : L'agencement exact est restauré
- **Validation** : Messages d'erreur clairs si le fichier est invalide

#### Format JSON
```json
{
  "version": "1.0",
  "metadata": {
    "name": "Mon graphe",
    "created": "2025-11-05T...",
    "nodes_count": 6,
    "edges_count": 4
  },
  "nodes": [...],
  "edges": [...]
}
```

### 3. 📐 **Bibliothèque de Templates**

**Démarrez rapidement avec des graphes classiques !**

5 templates prédéfinis :
- **Bipartite K₂,₃** : Graphe bipartite avec 2 et 3 nœuds
- **Tripartite 2-2-2** : Trois parties équilibrées
- **Étoile à 5 branches** : Structure en étoile
- **Cycle de 6 nœuds** : Circuit fermé
- **Complet K₄** : Tous les nœuds connectés

Chaque template peut être :
- Chargé instantanément
- Personnalisé après chargement
- Exporté en JSON

---

## 🎯 Les 3 Modes

### Mode 1️⃣ : **Éditeur de Graphe** (Nouveau !)
**Pour créer vos propres graphes**
- Ajoutez des nœuds un par un
- Créez les arêtes en cliquant
- Organisez visuellement
- Exportez en JSON

### Mode 2️⃣ : **Niveaux**
**Les 6 énigmes éducatives**
- Niveau 1 : Neveux et animaux
- Niveau 2 : Chiens et niches
- Niveau 3 : Interrupteurs et projecteurs
- Niveau 4 : Achats des Gaulois
- Niveau 5 : Course avec animaux
- Niveau 6 : Motos, casques et pilotes

### Mode 3️⃣ : **Templates** (Nouveau !)
**Pour démarrer rapidement**
- Choisissez un graphe classique
- Personnalisez-le selon vos besoins
- Exportez votre version

---

## 📦 Fichiers du projet

### Fichiers principaux
- **index.html** : Interface utilisateur complète
- **style.css** : Design moderne et responsive
- **script.js** : Logique principale (éditeur, import/export, templates)

### Niveaux éducatifs
- **niveau1.js** à **niveau6.js** : 6 énigmes prédéfinies

### Documentation
- **README.md** : Documentation technique complète
- **GUIDE_RAPIDE.md** : Guide pratique d'utilisation
- **CHANGELOG.md** : Historique des versions
- **PRESENTATION.md** : Ce fichier

### Exemples
- **exemple_graphe.json** : Graphe bipartite simple
- **exemple_tripartite.json** : Graphe à 3 parties

---

## 🎓 Cas d'usage

### Pour l'enseignement
1. **Créer des exercices personnalisés**
   - Concevez vos propres énigmes
   - Exportez et distribuez aux élèves
   - Récupérez leurs solutions en JSON

2. **Visualiser des concepts**
   - Relations entre entités
   - Structures de données
   - Problèmes de correspondance

### Pour l'apprentissage
1. **Résoudre les niveaux** : 6 énigmes progressives
2. **Expérimenter** : Créer des graphes librement
3. **Partager** : Échanger des graphes en JSON

### Pour la recherche
1. **Modéliser** : Créer rapidement des graphes complexes
2. **Sauvegarder** : Archiver vos expérimentations
3. **Reproduire** : Partager vos graphes en JSON

---

## 🛠️ Technologies utilisées

- **Cytoscape.js 3.26.0** : Moteur de visualisation de graphes
- **HTML5 / CSS3** : Interface moderne
- **JavaScript (Vanilla)** : Pas de framework lourd
- **JSON** : Format d'échange standard

---

## 🌟 Points forts

### ✅ Facilité de création
- Interface intuitive avec champs simples
- Raccourcis clavier (Entrée pour ajouter)
- Layout automatique intelligent
- Drag & drop pour ajuster

### ✅ Import/Export puissant
- Format JSON standard et lisible
- Métadonnées complètes
- Positions préservées
- Validation avec messages d'erreur

### ✅ Templates pratiques
- 5 graphes classiques prêts à l'emploi
- Personnalisables après chargement
- Point de départ idéal pour débutants

### ✅ Flexibilité maximale
- 3 modes distincts pour différents besoins
- Jusqu'à 10 parties possibles
- Création libre ou guidée
- Export/import illimités

### ✅ Documentation complète
- README technique détaillé
- Guide rapide pratique
- Changelog exhaustif
- Exemples fournis

---

## 🎯 Workflow typique

### Création d'un graphe personnalisé

1. **Démarrer** → Mode "Éditeur de graphe" (par défaut)

2. **Ajouter des nœuds**
   ```
   Partie 1: Alice, Bob, Charlie
   Partie 2: Math, Physique, Chimie
   ```

3. **Organiser** → Clic sur "Relancer layout"

4. **Créer des arêtes** → Clic sur 2 nœuds successivement

5. **Ajuster** → Déplacer les nœuds si besoin

6. **Sauvegarder** → Clic sur "📥 Exporter JSON"

7. **Partager** → Envoyer le fichier JSON

### Réutilisation d'un graphe existant

1. **Charger** → Clic sur "📤 Importer JSON"

2. **Sélectionner** → Choisir le fichier `.json`

3. **Modifier** → Ajouter/supprimer des éléments

4. **Exporter** → Sauvegarder la nouvelle version

---

## 📊 Statistiques

### Lignes de code
- **HTML** : ~150 lignes (interface complète)
- **CSS** : ~180 lignes (design + responsive)
- **JavaScript** : ~950 lignes (logique + niveaux)
- **Total** : ~1280 lignes

### Fonctionnalités
- **3 modes** distincts
- **6 niveaux** éducatifs
- **5 templates** prédéfinis
- **10 boutons** d'action
- **2 formats** d'export (JSON en cours, PNG/SVG possible)

---

## 🎉 Résumé des améliorations

### Avant (v1.x)
- Mode personnalisé basique (k × n)
- 6 niveaux prédéfinis
- Pas de sauvegarde
- Pas de templates
- Interface simple

### Maintenant (v2.0)
- ✅ **Éditeur complet** avec création nœud par nœud
- ✅ **Import/Export JSON** pour sauvegarder et partager
- ✅ **5 templates** pour démarrer rapidement
- ✅ **3 modes** bien distincts
- ✅ **Documentation complète** (4 fichiers)
- ✅ **2 exemples JSON** fournis
- ✅ **Interface réorganisée** et intuitive

---

## 🚀 Comment démarrer

### Méthode 1 : Navigateur local
1. Ouvrez `index.html` dans votre navigateur
2. L'éditeur s'affiche automatiquement
3. Commencez à créer votre graphe !

### Méthode 2 : Serveur local
```bash
cd /workspace
python3 -m http.server 8080
# Ouvrir http://localhost:8080
```

### Méthode 3 : Tester les exemples
1. Cliquez sur "📤 Importer JSON"
2. Sélectionnez `exemple_graphe.json` ou `exemple_tripartite.json`
3. Explorez et modifiez !

---

## 💡 Astuces pro

### Pour créer rapidement
1. Utilisez les **templates** comme base
2. Appuyez sur **Entrée** pour ajouter des nœuds successifs
3. "**Relancer layout**" après chaque série de nœuds
4. "**Arêtes aléatoires**" pour tester rapidement

### Pour organiser
1. **Drag & drop** pour ajuster manuellement
2. "**Adapter vue**" pour recentrer
3. Utilisez des **numéros de partie** logiques (1, 2, 3...)
4. Nommez clairement vos nœuds

### Pour sauvegarder
1. **Exportez régulièrement** pendant la création
2. Ajoutez la **date** dans le nom du fichier
3. Gardez une **copie de sauvegarde**
4. Testez l'import après chaque export

---

## 🎓 Conclusion

Cette version 2.0 transforme l'application en un **véritable éditeur de graphes** tout en conservant les **6 niveaux éducatifs** originaux. La facilitation de la création et le système d'import/export JSON permettent maintenant de :

- ✅ Créer des graphes personnalisés facilement
- ✅ Sauvegarder et réutiliser ses créations
- ✅ Partager des graphes avec d'autres
- ✅ Démarrer rapidement avec des templates
- ✅ Résoudre des énigmes prédéfinies

**L'objectif est atteint : personnalisation maximale + facilitation complète !**

---

📧 **Feedback** : N'hésitez pas à partager vos créations en JSON et vos idées d'amélioration !

🌟 **Amusez-vous bien avec les graphes !**
