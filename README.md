# Éditeur de Graphes k-partites

Application web interactive pour créer, éditer et explorer des graphes k-partites avec Cytoscape.js.

## 🎨 Fonctionnalités principales

### 3 Modes d'utilisation

#### 1. **Éditeur de graphe** (Mode par défaut)
- Créez vos propres graphes de A à Z
- Ajoutez des nœuds en spécifiant la partie et le label
- Créez des arêtes en cliquant sur deux nœuds
- Supprimez des nœuds et arêtes facilement
- Positionnement visuel avec drag & drop

#### 2. **Mode Niveaux**
- 6 niveaux prédéfinis avec énigmes éducatives
- Vérification automatique des solutions
- Bandeau de réussite non-bloquant
- Arêtes potentielles affichables en gris

#### 3. **Mode Templates**
- Graphes classiques prédéfinis :
  - Bipartite K₂,₃ (2 parties, 3 nœuds)
  - Tripartite (3 parties, 2 nœuds chacune)
  - Étoile à 5 branches
  - Cycle de 6 nœuds
  - Graphe complet K₄

## 💾 Import / Export JSON

### Format JSON
```json
{
  "version": "1.0",
  "metadata": {
    "name": "Graphe personnalisé",
    "created": "2025-11-05T...",
    "nodes_count": 5,
    "edges_count": 4
  },
  "nodes": [
    {
      "id": "node1",
      "label": "A",
      "part": 1,
      "order": 1,
      "position": { "x": 100, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "node1",
      "target": "node2",
      "classes": ""
    }
  ]
}
```

### Exporter un graphe
1. Créez votre graphe dans l'éditeur
2. Cliquez sur **"📥 Exporter JSON"**
3. Le fichier `.json` est téléchargé automatiquement

### Importer un graphe
1. Cliquez sur **"📤 Importer JSON"**
2. Sélectionnez un fichier `.json` valide
3. Le graphe se charge instantanément

## ✏️ Utilisation

### Créer des nœuds
1. Spécifiez le numéro de **Partie** (1-10)
2. Entrez un **Label** (nom du nœud)
3. Cliquez sur **"+ Ajouter nœud"** ou appuyez sur Entrée

### Créer des arêtes
1. Cliquez sur un premier nœud (il sera surligné en bleu)
2. Cliquez sur un second nœud
3. Une arête est créée entre les deux

### Supprimer des éléments
- **Arête** : Double-cliquez sur l'arête
- **Nœud** : Sélectionnez-le puis cliquez sur "Supprimer nœud"

### Outils rapides
- **Arêtes aléatoires** : Génère des connexions aléatoires entre différentes parties
- **Arêtes potentielles** (Niveaux) : Affiche toutes les arêtes possibles en gris
- **Relancer layout** : Réorganise le graphe en colonnes par partie
- **Adapter vue** : Recentre et ajuste le zoom
- **Réinitialiser** : Supprime tous les éléments

## 🛠️ Technologies

- **Cytoscape.js** : Librairie de visualisation de graphes
- **HTML5 / CSS3** : Interface moderne et responsive
- **JavaScript** (Vanilla) : Logique applicative

## 📦 Structure des fichiers

```
/workspace/
├── index.html          # Page principale
├── style.css           # Styles CSS
├── script.js           # Logique principale + éditeur
├── niveau1.js          # Niveau 1 (Neveux et animaux)
├── niveau2.js          # Niveau 2 (Chiens et niches)
├── niveau3.js          # Niveau 3 (Interrupteurs)
├── niveau4.js          # Niveau 4 (Gaulois)
├── niveau5.js          # Niveau 5 (Course animaux)
├── niveau6.js          # Niveau 6 (Motos et casques)
└── README.md           # Documentation
```

## 🚀 Démarrage

1. Ouvrez `index.html` dans un navigateur moderne
2. L'éditeur se lance automatiquement
3. Commencez à créer votre graphe !

## 📝 Exemples d'utilisation

### Créer un graphe bipartite simple
1. Ajoutez 3 nœuds dans la partie 1 (A, B, C)
2. Ajoutez 3 nœuds dans la partie 2 (1, 2, 3)
3. Reliez les nœuds en cliquant
4. Exportez en JSON pour réutiliser

### Charger un template et le modifier
1. Passez en mode "Templates"
2. Sélectionnez "Étoile à 5 branches"
3. Cliquez sur "Charger template"
4. Ajoutez/supprimez des nœuds selon vos besoins
5. Exportez le résultat

## 🎓 Utilisation pédagogique

Les niveaux sont conçus pour enseigner :
- La logique déductive
- Les graphes bipartites et multipartites
- La résolution de problèmes par élimination
- La représentation visuelle de relations

## 📄 Licence

Projet éducatif open source.
