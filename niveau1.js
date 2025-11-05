/* ==== Niveau 1 – Riri/Fifi/Loulou ↔ Chat/Hamster/Perroquet ==== */
/* Dépend de helpers globaux fournis par script.js :
   - cy
   - setZone3Title(text), setConsignes(html)
   - applyColumnsByPart(), refreshStats(), enableInteractiveEdges()
   - announceWin(message)   // bandeau "Bravo !" non bloquant
*/

(function () {
  const ID   = 'niveau1';
  const NAME = 'Niveau 1 – Les neveux et leurs animaux';

  // Consignes propres au niveau 1 (affichées en Zone 3)
  const CONSIGNES = [
    "Pour relier deux sommets ils faut cliqué sur le premier puis sur le deuxieme.",
    "Relie Riri, Fifi et Loulou à leur animal préféré à l’aide des informations suivantes :",
    "- L’animal préféré de Loulou miaule",
    "- L’animal préféré de Riri n’a pas de plumes."
  ].join("<br>");

  // Solution attendue (non orientée)
  const solutionEdges = [
    ["riri", "hamster"],
    ["fifi", "peroquet"],
    ["loulou", "chat"]
  ];

  function checkSolution() {
    const edges = cy.edges().not('.potential').map(e => [e.source().id(), e.target().id()]);
    const ok = solutionEdges.every(sol =>
      edges.some(e =>
        (e[0] === sol[0] && e[1] === sol[1]) ||
        (e[0] === sol[1] && e[1] === sol[0])
      )
    );
    if (ok && edges.length === solutionEdges.length) {
      announceWin("Bravo ! Tu as réussi le niveau 1 🎉");
    }
  }

  // Fonction principale du niveau (appelée par script.js)
  window.initNiveau1 = function () {
    // Titre & consignes gérés ici (et plus dans script.js)
    setZone3Title('niveau1');
    setConsignes(CONSIGNES);

    // Reset + nœuds (deux parties, ordre haut→bas via data.order)
    cy.elements().remove();
    cy.add([
      { data: { id: "riri",    label: "Riri",      part: 1, order: 1 }, classes: 'level-node' },
      { data: { id: "fifi",    label: "Fifi",      part: 1, order: 2 }, classes: 'level-node' },
      { data: { id: "loulou",  label: "Loulou",    part: 1, order: 3 }, classes: 'level-node' },

      { data: { id: "chat",     label: "Chat",      part: 2, order: 1 }, classes: 'level-node' },
      { data: { id: "hamster",  label: "Hamster",   part: 2, order: 2 }, classes: 'level-node' },
      { data: { id: "peroquet", label: "Perroquet", part: 2, order: 3 }, classes: 'level-node' },
    ]);

    applyColumnsByPart();
    refreshStats();
    enableInteractiveEdges();

    // (ré)attache la vérification sur add/remove edge
    cy.off('add', 'edge', checkSolution);
    cy.off('remove', 'edge', checkSolution);
    cy.on('add', 'edge', checkSolution);
    cy.on('remove', 'edge', checkSolution);
  };

  // Enregistrement dans le registre global (pour le <select> des niveaux)
  window.LEVELS_REGISTRY = window.LEVELS_REGISTRY || [];
  window.LEVELS_REGISTRY.push({ id: ID, name: NAME, init: window.initNiveau1, consignes: CONSIGNES });
})();
