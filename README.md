Voici le contenu complet du fichier **`README.md`** prêt à être téléchargé ou copié.


# 🌍 Atelier Graphes - Terra Numerica

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Terra Numerica](https://img.shields.io/badge/Terra-Numerica-orange)

Une application web interactive et pédagogique dédiée à la découverte des graphes et à la résolution d'énigmes logiques (problèmes de couplage, k-partites).

Développée aux couleurs de **Terra Numerica**, cette application permet de manipuler des graphes, de tester des hypothèses visuellement et de créer ses propres exercices.

---

## ✨ Fonctionnalités Principales

### 🎮 3 Modes d'Utilisation
1.  **Mode Éditeur** : Un espace libre pour créer des graphes de A à Z. Ajoutez des nœuds, créez des liens, organisez les parties.
2.  **Mode Niveaux** : 6 énigmes logiques progressives à résoudre (Neveux, Chiens, Interrupteurs, Gaulois, Course, Motos).
3.  **Mode Templates** : Des modèles de graphes complets avec des dispositions géométriques automatiques :
    * **K3,3** (Bipartite) → Disposition en Colonnes
    * **K3,3,3** (Tripartite) → Disposition en Triangle
    * **K3,3,3,3** (Quadripartite) → Disposition en Carré

### 🛠️ Outils Avancés
* **Gestion des Couleurs (Hypothèses)** : 
    * Un bouton intelligent **Gris / Vert / Rouge** pour marquer les arêtes.
    * Permet de distinguer les liens "sûrs" (Vert) des "impossibles" (Rouge).
    * Fonctionne à la création d'arête ou sur une sélection existante.
* **Vérification Souple** : Le système valide la victoire si la solution est correcte (arêtes vertes), même si des "brouillons" (arêtes rouges ou grises) sont encore présents sur le graphe.
* **Arêtes Potentielles** : Affiche en gris toutes les connexions possibles pour aider à la réflexion.
* **Réorganisation Intelligente** : Le bouton "Réorganiser" adapte la forme du graphe (Triangle, Carré, Colonnes) selon le contexte.

### 🎨 Interface & Design
* **Identité Terra Numerica** : Charte graphique officielle (Bleu institutionnel / Orange).
* **Imagerie** : Les nœuds affichent des illustrations (images PNG) pour rendre les énigmes plus concrètes.
* **Responsive** : S'adapte aux différentes tailles d'écran.

---

## 📂 Structure du Projet

Pour que l'application fonctionne correctement (notamment les images), votre dossier doit être organisé comme suit :


/racine-du-projet/
│
├── index.html              # Structure de la page (Header TN, Contrôles, Graphe)
├── style.css               # Design (Charte Terra Numerica)
├── script.js               # Moteur logique (Cytoscape, événements, vérification)
│
├── niveau1.js à niveau6.js # Fichiers de configuration des énigmes
│
└── public/                 # Dossier des ressources statiques
    ├── terra_numerica_logo.png
    │
    └── images/             # Images des nœuds
        ├── riri.png
        ├── chat.png
        ├── motoAndre.png
        └── ...


-----

## 🚀 Installation & Lancement

### Méthode simple

Ouvrez simplement le fichier `index.html` dans votre navigateur web (Chrome, Firefox, Edge).

### Méthode recommandée (Serveur local)

Pour éviter certains blocages de sécurité liés au chargement des images ou des fichiers JSON (CORS) sur certains navigateurs, il est préférable d'utiliser un petit serveur local.

Avec Python :


# Dans le dossier du projet
python3 -m http.server
# Puis ouvrez http://localhost:8000


Avec VS Code :
Utilisez l'extension "Live Server".

-----

## 📖 Guide d'Utilisation

### Création (Éditeur)

  * **Ajouter un nœud** : Remplissez "Partie" et "Label" puis appuyez sur **Entrée**.
  * **Lier deux nœuds** : Cliquez sur le premier (il devient bleu), puis sur le second.
  * **Supprimer** : Sélectionnez un élément et appuyez sur le bouton "Supprimer" (ou double-cliquez sur une arête).

### Résolution (Niveaux)

  * Lisez les indices dans le bandeau supérieur.
  * Utilisez le bouton **Couleur** pour tester vos hypothèses :
      * *Vert* : "Je suis sûr que c'est ça".
      * *Rouge* : "Impossible que ce soit ça".
  * Si vous êtes bloqué, cliquez sur "Voir arêtes possibles".

### Import / Export

  * Sauvegardez vos créations au format `.json` pour les partager ou les reprendre plus tard via les boutons **Exporter** et **Importer**.

-----

## 🛠️ Personnalisation

### Ajouter des images

Déposez vos fichiers `.png` dans `public/images/`.
Si le nom du fichier ne correspond pas à l'ID du nœud, ajoutez une entrée dans la fonction `getNodeImage()` du fichier `script.js`.

### Modifier un niveau

Les niveaux sont définis dans les fichiers `niveauX.js`. Vous pouvez modifier les consignes, les nœuds ou la solution attendue (`SOL_EDGES`) directement dans ces fichiers.

-----

## 📄 Crédits

**Développement & Conception** : Vincent Chaye  
**Cadre** : Projet Terra Numerica  
**Moteur Graphique** : [Cytoscape.js](https://js.cytoscape.org/)

-----

*Projet éducatif open-source. N'hésitez pas à contribuer \!*
