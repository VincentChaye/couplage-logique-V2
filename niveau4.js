/* ==== Niveau 4 – Achats (Gaulois & Objets) ==== */
/* Dépend de helpers dans script.js :
   - cy
   - setZone3Title(text), setConsignes(html)
   - applyColumnsByPart(), refreshStats(), enableInteractiveEdges()
*/

(function () {
  const ID   = 'niveau4';
  const NAME = 'Niveau 4 – Achats';

  const CONSIGNES = [
    "Trouve ce que chacun a acheté en utilisant les indications suivantes :",
    "- Obélix a en horreur les armes, la lecture et les vases.",
    "- Ce n’est pas un homme qui a acheté le menhir.",
    "- Le parchemin a été choisi par un guerrier.",
    "- Abraracourcix n’a pas résisté à la vue du glaive de Vercingétorix.",
    "",
  ].join("<br>");

  // Solution attendue (peu importe le sens source/target)
  const SOL_EDGES = [
    ["asterix",       "parchemin"],
    ["obelix",        "sanglier"],
    ["idefix",        "menhir"],
    ["panoramix",     "vase"],
    ["abraracourcix", "glaive"],
  ];

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
  window.initNiveau4 = function(){
    if (typeof setZone3Title === 'function') setZone3Title('niveau4');
    setConsignes(CONSIGNES);

    cy.elements().remove();

    // Partie 1 (ordre exact) : Asterix, Obelix, Idefix, Panoramix, Abraracourcix
    // Partie 2 (ordre exact) : Glaive, Menhir, Parchemin, Sanglier, Vase
    cy.add([
      { data:{ id:"asterix",       label:"Asterix",       part:1, order:1 } },
      { data:{ id:"obelix",        label:"Obelix",        part:1, order:2 } },
      { data:{ id:"idefix",        label:"Idefix",        part:1, order:3 } },
      { data:{ id:"panoramix",     label:"Panoramix",     part:1, order:4 } },
      { data:{ id:"abraracourcix", label:"Abraracourcix", part:1, order:5 } },

      { data:{ id:"glaive",     label:"Glaive",     part:2, order:1 } },
      { data:{ id:"menhir",     label:"Menhir",     part:2, order:2 } },
      { data:{ id:"parchemin",  label:"Parchemin",  part:2, order:3 } },
      { data:{ id:"sanglier",   label:"Sanglier",   part:2, order:4 } },
      { data:{ id:"vase",       label:"Vase",       part:2, order:5 } },
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

  // (Optionnel) registre global si tu l'utilises déjà
  window.LEVELS_REGISTRY = window.LEVELS_REGISTRY || [];
  window.LEVELS_REGISTRY.push({ id: ID, name: NAME, init: window.initNiveau4, consignes: CONSIGNES });
})();
