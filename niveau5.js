/* ==== Niveau 5 – Course avec des animaux ==== */
/* Dépend de helpers dans script.js :
   - cy
   - setZone3Title(text), setConsignes(html)
   - applyColumnsByPart(), refreshStats(), enableInteractiveEdges()
*/

(function () {
  const ID   = 'niveau5';
  const NAME = 'Niveau 5 – Course avec des animaux';

  const CONSIGNES = [
    "Saurez-vous retrouver avec quel animal chaque participant a couru cette épreuve à partir des informations suivantes.",
    "- L’aborigène n’a pas couru avec le kangourou avec lequel il est venu.",
    "- La chinoise et le touareg sont contents de n’avoir pas tiré l’ours blanc.",
    "- L’inuit, le touareg, et la chinoise sont déçus de ne pas être avec le panda.",
    "- La personne qui court avec le lama apprécie l’inuit, le péruvien et la chinoise, mais se méfie de son adversaire qui court avec le kangourou.",
    "",
  ].join("<br>");

  // Solution attendue (ordre indifférent source/target)
  const SOL_EDGES = [
    ["aborigene", "lama"],
    ["chinoise",  "chameau"],
    ["inuit",     "ours_blanc"],
    ["peruvien",  "panda"],
    ["touareg",   "kangourou"],
  ];

  function checkSolution(){
    const edges = cy.edges().not('.potential').map(e => [e.source().id(), e.target().id()]);
    const ok = SOL_EDGES.every(sol =>
      edges.some(e =>
        (e[0] === sol[0] && e[1] === sol[1]) ||
        (e[0] === sol[1] && e[1] === sol[0])
      )
    );
    if (ok && edges.length === SOL_EDGES.length){
      announceWin("Bravo ! Tu as réussi le niveau 5 🎉");
    }
  }

  // Exposé en global
  window.initNiveau5 = function(){
    if (typeof setZone3Title === 'function') setZone3Title('niveau5');
    setConsignes(CONSIGNES);

    cy.elements().remove();

    // Partie 1 (ordre : Aborigène, Chinoise, Inuit, Péruvien, Touareg)
    cy.add([
      { data:{ id:"aborigene", label:"Aborigène", part:1, order:1 }, classes: 'level-node' },
      { data:{ id:"chinoise",  label:"Chinoise",  part:1, order:2 }, classes: 'level-node' },
      { data:{ id:"inuit",     label:"Inuit",     part:1, order:3 }, classes: 'level-node' },
      { data:{ id:"peruvien",  label:"Péruvien",  part:1, order:4 }, classes: 'level-node' },
      { data:{ id:"touareg",   label:"Touareg",   part:1, order:5 }, classes: 'level-node' },

      // Partie 2 (ordre : Kangourou, Panda, Ours Blanc, Lama, Chameau)
      { data:{ id:"kangourou",  label:"Kangourou",  part:2, order:1 }, classes: 'level-node' },
      { data:{ id:"panda",      label:"Panda",      part:2, order:2 }, classes: 'level-node' },
      { data:{ id:"ours_blanc", label:"Ours Blanc", part:2, order:3 }, classes: 'level-node' },
      { data:{ id:"lama",       label:"Lama",       part:2, order:4 }, classes: 'level-node' },
      { data:{ id:"chameau",    label:"Chameau",    part:2, order:5 }, classes: 'level-node' },
    ]);

    // Layout & interactions
    applyColumnsByPart();
    refreshStats();
    enableInteractiveEdges();

    // Vérif auto : ajout/suppression d’arête
    cy.off('add', 'edge', checkSolution);
    cy.off('remove', 'edge', checkSolution);
    cy.on('add', 'edge', checkSolution);
    cy.on('remove', 'edge', checkSolution);
  };

  // (Optionnel) registre global si tu l'utilises
  window.LEVELS_REGISTRY = window.LEVELS_REGISTRY || [];
  window.LEVELS_REGISTRY.push({ id: ID, name: NAME, init: window.initNiveau5, consignes: CONSIGNES });
})();
