# Guide Rapide - Nouvelles Fonctionnalités

## 🎯 Éditeur de Graphe Personnalisé

### Démarrage rapide
L'application s'ouvre désormais en **mode Éditeur** par défaut, vous permettant de créer immédiatement votre propre graphe.

### Créer un graphe en 3 étapes

#### 1️⃣ Ajouter des nœuds
```
Partie : 1          Label : Alice
[+ Ajouter nœud]

Partie : 1          Label : Bob
[+ Ajouter nœud]

Partie : 2          Label : Chat
[+ Ajouter nœud]

Partie : 2          Label : Chien
[+ Ajouter nœud]
```

**Astuce** : Appuyez sur **Entrée** pour ajouter rapidement le nœud suivant.

#### 2️⃣ Créer des arêtes
- Cliquez sur **Alice** → elle se colore en bleu
- Cliquez sur **Chat** → une arête apparaît !
- Répétez pour créer d'autres connexions

#### 3️⃣ Organiser visuellement
- **Déplacer** : Cliquez-glissez les nœuds
- **Relancer layout** : Réorganise automatiquement en colonnes
- **Adapter vue** : Recentre le graphe

---

## 💾 Import / Export JSON

### Sauvegarder votre travail

1. Créez votre graphe dans l'éditeur
2. Cliquez sur **📥 Exporter JSON**
3. Un fichier `graphe_[timestamp].json` est téléchargé
4. Conservez ce fichier pour le réutiliser plus tard !

### Charger un graphe existant

1. Cliquez sur **📤 Importer JSON**
2. Sélectionnez votre fichier `.json`
3. Le graphe se charge instantanément avec :
   - Tous les nœuds
   - Toutes les arêtes
   - Les positions exactes

### Fichiers exemples fournis

- `exemple_graphe.json` : Graphe bipartite simple (Personnes → Matières)
- `exemple_tripartite.json` : Graphe à 3 parties

Pour les tester :
1. Cliquez sur **📤 Importer JSON**
2. Sélectionnez un des fichiers exemples
3. Explorez et modifiez !

---

## 📐 Mode Templates

### Démarrer avec un graphe classique

1. Changez le mode vers **"Templates"**
2. Choisissez parmi :
   - **Bipartite K₂,₃** : 2 parties (2 et 3 nœuds)
   - **Tripartite 2-2-2** : 3 parties équilibrées
   - **Étoile à 5 branches** : Un centre + 5 branches
   - **Cycle de 6 nœuds** : Circuit fermé
   - **Complet K₄** : Tous connectés
3. Cliquez sur **"Charger template"**

### Personnaliser un template

Après chargement :
- Ajoutez des nœuds supplémentaires
- Supprimez des arêtes
- Créez de nouvelles connexions
- Exportez votre version personnalisée !

---

## 🎓 Mode Niveaux (Énigmes)

Les 6 niveaux éducatifs sont toujours disponibles :

1. **Niveau 1** : Neveux et animaux
2. **Niveau 2** : Chiens et niches
3. **Niveau 3** : Interrupteurs et projecteurs
4. **Niveau 4** : Achats des Gaulois
5. **Niveau 5** : Course avec animaux
6. **Niveau 6** : Motos, casques et pilotes

### Comment jouer
1. Sélectionnez **"Niveaux"** dans le mode
2. Choisissez un niveau
3. Cliquez sur **"Charger"**
4. Résolvez l'énigme en créant les bonnes connexions
5. Une notification apparaît quand vous réussissez ! 🎉

---

## 🛠️ Astuces et raccourcis

### Gestion des nœuds
- **Supprimer** : Sélectionnez le(s) nœud(s) → "Supprimer nœud"
- **Sélection multiple** : Maintenez **Shift** + clic
- **Parties** : Organisez vos nœuds en groupes logiques (1, 2, 3...)

### Gestion des arêtes
- **Créer** : Clic nœud 1 → Clic nœud 2
- **Supprimer** : Double-clic sur l'arête
- **Arêtes aléatoires** : Génère automatiquement des connexions
- **Arêtes potentielles** (Niveaux) : Voir toutes les possibilités en gris

### Organisation visuelle
- **Drag & drop** : Déplacez librement les nœuds
- **Relancer layout** : Réorganise en colonnes par partie
- **Adapter vue** : Centre et ajuste le zoom automatiquement

### Workflow recommandé
1. Créer des nœuds par partie
2. "Relancer layout" pour organiser
3. Créer les arêtes manuellement
4. Ajuster positions si besoin
5. Exporter en JSON pour sauvegarder

---

## 🎨 Personnalisation avancée

### Structure JSON personnalisée

Vous pouvez créer vos propres fichiers JSON :

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Mon graphe",
    "created": "2025-11-05T12:00:00Z",
    "nodes_count": 4,
    "edges_count": 3
  },
  "nodes": [
    {
      "id": "unique_id_1",
      "label": "Nœud A",
      "part": 1,
      "order": 1,
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "unique_id_2",
      "label": "Nœud B",
      "part": 2,
      "order": 1,
      "position": { "x": 250, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "unique_id_1",
      "target": "unique_id_2",
      "classes": ""
    }
  ]
}
```

### Propriétés importantes
- **id** : Identifiant unique du nœud
- **label** : Texte affiché
- **part** : Numéro de partie (1, 2, 3...)
- **order** : Ordre dans la partie (pour le layout)
- **position** : Coordonnées (x, y) exactes

---

## 📊 Cas d'usage

### Enseignement
- Créer des exercices personnalisés
- Visualiser des relations entre concepts
- Exporter et partager avec les étudiants

### Recherche
- Modéliser des graphes k-partites
- Tester des configurations
- Sauvegarder et archiver les résultats

### Ludique
- Résoudre les énigmes des niveaux
- Créer ses propres énigmes
- Partager des graphes via JSON

---

## ❓ FAQ

**Q : Puis-je sauvegarder plusieurs graphes ?**  
R : Oui ! Exportez chaque graphe en JSON avec un nom différent.

**Q : Les positions des nœuds sont-elles sauvegardées ?**  
R : Oui, l'export JSON préserve les positions exactes.

**Q : Puis-je modifier un niveau ?**  
R : Non, mais vous pouvez charger un niveau, l'exporter en JSON, puis le modifier dans l'éditeur.

**Q : Combien de parties puis-je créer ?**  
R : Jusqu'à 10 parties dans l'éditeur.

**Q : Les arêtes entre nœuds de même partie sont-elles possibles ?**  
R : Oui en mode Éditeur et Templates, non en mode Niveaux.

---

## 🚀 Prochaines étapes

Maintenant que vous maîtrisez les bases :

1. **Créez votre premier graphe** dans l'éditeur
2. **Exportez-le** pour le sauvegarder
3. **Testez les templates** pour découvrir des structures classiques
4. **Résolvez les niveaux** pour vous entraîner
5. **Partagez vos créations** en JSON avec d'autres !

Bon graphisme ! 🎨📊
