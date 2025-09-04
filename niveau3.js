/* ==== Niveau 3 – Interrupteurs & Projecteurs ==== */
/* Dépend de helpers dans script.js :
   cy, setConsignes(html), setZone3Title(text),
   applyColumnsByPart(), refreshStats(), enableInteractiveEdges()
*/
(function () {
  const ID   = 'niveau3';
  const NAME = 'Niveau 3 – Interrupteurs & Projecteurs';

  const CONSIGNES = [
    "Trouve la lampe que chaque interrupteur allume :",
    "- Aucun interrupteur n’allume un projecteur de la même couleur que lui.",
    "- L’interrupteur vert n’allume ni le projecteur jaune, ni le violet.",
    "- L’interrupteur jaune allume le projecteur bleu.",
    "- L’interrupteur bleu n’allume pas le projecteur violet.",
    "- L’interrupteur violet n’allume pas le projecteur vert.",
    "",
  ].join("<br>");

  // Solution attendue (peu importe le sens source/target)
  const SOL_EDGES = [
    ["proj_rouge",   "int_vert"],
    ["proj_bleu",    "int_jaune"],
    ["proj_vert",    "int_bleu"],
    ["proj_jaune",   "int_violet"],
    ["proj_violet",  "int_rouge"],
  ];

  // Couleurs (hex)
  const COLORS = {
    rouge:  "#ef4444",
    bleu:   "#3b82f6",
    vert:   "#22c55e",
    jaune:  "#f59e0b",
    violet: "#8b5cf6",
  };

  function colorNode(id, hex){
    const el = cy.getElementById(id);
    if (el && el.length){ el.style('background-color', hex); el.style('border-color', hex); }
  }

  function checkSolution(){
    const edges = cy.edges().map(e => [e.source().id(), e.target().id()]);
    const ok = SOL_EDGES.every(sol =>
      edges.some(e =>
        (e[0] === sol[0] && e[1] === sol[1]) ||
        (e[0] === sol[1] && e[1] === sol[0])
      )
    );
    if (ok && edges.length === SOL_EDGES.length){
      announceWin("Bravo ! Tu as réussi le niveau X 🎉");
    }
  }

  // Exposé en global
  window.initNiveau3 = function(){
    if (typeof setZone3Title === 'function') setZone3Title('niveau3');
    setConsignes(CONSIGNES);

    cy.elements().remove();

    // Partie 1 : Projecteurs (ordre : rouge, bleu, vert, jaune, violet)
    cy.add([
      { data:{ id:"proj_rouge",  label:"Proj. rouge",  part:1, order:1 } },
      { data:{ id:"proj_bleu",   label:"Proj. bleu",   part:1, order:2 } },
      { data:{ id:"proj_vert",   label:"Proj. vert",   part:1, order:3 } },
      { data:{ id:"proj_jaune",  label:"Proj. jaune",  part:1, order:4 } },
      { data:{ id:"proj_violet", label:"Proj. violet", part:1, order:5 } },

      // Partie 2 : Interrupteurs (ordre : rouge, bleu, vert, jaune, violet)
      { data:{ id:"int_rouge",  label:"Inter. rouge",  part:2, order:1 } },
      { data:{ id:"int_bleu",   label:"Inter. bleu",   part:2, order:2 } },
      { data:{ id:"int_vert",   label:"Inter. vert",   part:2, order:3 } },
      { data:{ id:"int_jaune",  label:"Inter. jaune",  part:2, order:4 } },
      { data:{ id:"int_violet", label:"Inter. violet", part:2, order:5 } },
    ]);

    // Coloration des nœuds selon leur nom
    colorNode("proj_rouge", COLORS.rouge);
    colorNode("proj_bleu", COLORS.bleu);
    colorNode("proj_vert", COLORS.vert);
    colorNode("proj_jaune", COLORS.jaune);
    colorNode("proj_violet", COLORS.violet);

    colorNode("int_rouge", COLORS.rouge);
    colorNode("int_bleu", COLORS.bleu);
    colorNode("int_vert", COLORS.vert);
    colorNode("int_jaune", COLORS.jaune);
    colorNode("int_violet", COLORS.violet);

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
  window.LEVELS_REGISTRY.push({ id: ID, name: NAME, init: window.initNiveau3, consignes: CONSIGNES });
})();
