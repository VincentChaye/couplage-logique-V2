/* ==== Niveau 2 – Chiens & Niches ==== */
/* Dépend de helpers définis dans script.js :
   - cy  (instance Cytoscape)
   - setConsignes(html)
   - refreshStats()
   - enableInteractiveEdges()
   - applyColumnsByPart()     // même layout que “Relancer le layout”
   - (optionnel) setZone3Title(text)
*/

(function () {
  const ID   = 'niveau2';
  const NAME = 'Niveau 2 – Chiens et Niches';

  const CONSIGNES = [
    "Pour relier deux sommets ils faut cliqué sur le premier puis sur le deuxieme",
    "Relie chaque chien à sa niche à l'aide des informations suivantes :",

    "- La niche du chien blanc à pois noir a les murs blanc",
    "- Il n'y a pas de gamelle devant la niche du chien noir",
  ].join("<br>");

  // Solution attendue (peu importe le sens source/target)
  const solutionEdges = [
    ["chien_noir",  "niche_sans_gamelle"],
    ["chien_marron", "niche_jaune"],
    ["chien_blanc",  "niche_blanche"]
  ];

  function checkSolution() {
    const edges = cy.edges().not('.potential').map(e => [e.source().id(), e.target().id()]);
    const correct = solutionEdges.every(sol =>
      edges.some(e =>
        (e[0] === sol[0] && e[1] === sol[1]) ||
        (e[0] === sol[1] && e[1] === sol[0])
      )
    );
    if (correct && edges.length === solutionEdges.length) {
      announceWin("Bravo ! Tu as réussi le niveau 2 🎉");
    }
  }

  // Fonction d’affichage du niveau
  window.initNiveau2 = function () {
    // Titre + consignes
    if (typeof setZone3Title === 'function') setZone3Title('niveau2');
    setConsignes(CONSIGNES);

    // Reset & ajout des nœuds (sans positions fixes)
    cy.elements().remove();

    // Partie 1 (chiens) — ordre haut→bas via data.order
    // Partie 2 (niches) — ordre haut→bas
    cy.add([
      { data:{ id:"chien_noir",   label:"Chien noir",   part:1, order:1 }, classes: 'level-node' },
      { data:{ id:"chien_marron", label:"Chien marron", part:1, order:2 }, classes: 'level-node' },
      { data:{ id:"chien_blanc",  label:"Chien blanc",  part:1, order:3 }, classes: 'level-node' },

      { data:{ id:"niche_sans_gamelle", label:"Niche sans gamelle", part:2, order:2 }, classes: 'level-node' },
      { data:{ id:"niche_jaune",        label:"Niche jaune",        part:2, order:1 }, classes: 'level-node' },
      { data:{ id:"niche_blanche",      label:"Niche blanche",      part:2, order:3 }, classes: 'level-node' },
    ]);

    // Layout colonnes par partie (même rendu que “Relancer le layout”)
    applyColumnsByPart();
    refreshStats();
    enableInteractiveEdges();

    // Auto-vérif : sur ajout/suppression d’arête
    cy.off('add', 'edge', checkSolution);
    cy.off('remove', 'edge', checkSolution);
    cy.on('add', 'edge', checkSolution);
    cy.on('remove', 'edge', checkSolution);
  };

  // (Optionnel) registre global si tu l’utilises déjà
  window.LEVELS_REGISTRY = window.LEVELS_REGISTRY || [];
  window.LEVELS_REGISTRY.push({
    id: ID, name: NAME, init: window.initNiveau2, consignes: CONSIGNES
  });
})();
