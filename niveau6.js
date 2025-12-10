/* ==== Niveau 6 – Motos & Casques (avec boucle) ==== */
/* Dépend de helpers dans script.js */
(function () {
  const ID   = 'niveau6';
  const NAME = 'Niveau 6 – Motos & Casques';

  const CONSIGNES = [
    "André, Bernard et Claude partent en balade en motos. Quel casque porte et quelle moto conduit chacun des amis ?",
    "- Chacun est sur la moto d’un de ses amis.",
    "- Chacun porte le casque d’un autre.",
    "- Celui qui porte le casque de Claude conduit la moto de Bernard.",
    "- <strong>Relie aussi les motos aux casques</strong>, et <strong>ferme la boucle</strong> : Personne → Moto → Casque → Personne (3 arêtes par ami).",
    "",
  ].join("<br>");

  // (1) Personne — Moto
  const SOL_PM = [
    ["andre",   "moto_bernard"],
    ["bernard", "moto_claude"],
    ["claude",  "moto_andre"],
  ];
  // (2) Moto — Casque
  const SOL_MC = [
    ["moto_bernard", "casque_claude"],
    ["moto_claude",  "casque_andre"],
    ["moto_andre",   "casque_bernard"],
  ];
  // (3) Casque — Personne (fermeture de la boucle)
  const SOL_CP = [
    ["casque_claude",  "andre"],
    ["casque_andre",   "bernard"],
    ["casque_bernard", "claude"],
  ];

  function hasUndirectedEdge(a, b, edges){
    return edges.some(e =>
      (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)
    );
  }

  function checkSolution(){
    const edges = cy.edges().map(e => [e.source().id(), e.target().id()]);
    const okPM = SOL_PM.every(([a,b]) => hasUndirectedEdge(a,b,edges));
    const okMC = SOL_MC.every(([a,b]) => hasUndirectedEdge(a,b,edges));
    const okCP = SOL_CP.every(([a,b]) => hasUndirectedEdge(a,b,edges));
    const needed = SOL_PM.length + SOL_MC.length + SOL_CP.length; // 9 arêtes
    if (okPM && okMC && okCP && edges.length === needed){
      announceWin("Bravo ! Tu as réussi le niveau 6 🎉");
    }
  }

  // Exposé en global
  window.initNiveau6 = function(){
    if (typeof setZone3Title === 'function') setZone3Title('niveau6');
    setConsignes(CONSIGNES);

    cy.elements().remove();

    // Partie 1 : Personnes (ordre)
    cy.add([
      { data:{ id:"andre",   label:"André",   part:1, order:1 } },
      { data:{ id:"bernard", label:"Bernard", part:1, order:2 } },
      { data:{ id:"claude",  label:"Claude",  part:1, order:3 } },

      // Partie 2 : Casques (ordre)
      { data:{ id:"casque_andre",   label:"Casque André",   part:2, order:1 } },
      { data:{ id:"casque_bernard", label:"Casque Bernard", part:2, order:2 } },
      { data:{ id:"casque_claude",  label:"Casque Claude",  part:2, order:3 } },

      // Partie 3 : Motos (ordre)
      { data:{ id:"moto_andre",   label:"Moto André",   part:3, order:1 } },
      { data:{ id:"moto_bernard", label:"Moto Bernard", part:3, order:2 } },
      { data:{ id:"moto_claude",  label:"Moto Claude",  part:3, order:3 } },
    ]);

    // Layout & interactions
    // MODIFICATION ICI : On utilise le layout triangulaire s'il existe
    if (typeof applyTriangleLayout === 'function') {
      applyTriangleLayout();
    } else {
      applyColumnsByPart();
    }

    refreshStats();
    enableInteractiveEdges();

    // Vérif auto : ajout/suppression d’arête
    cy.off('add', 'edge', checkSolution);
    cy.off('remove', 'edge', checkSolution);
    cy.on('add', 'edge', checkSolution);
    cy.on('remove', 'edge', checkSolution);
  };

  // Registre (si utilisé)
  window.LEVELS_REGISTRY = window.LEVELS_REGISTRY || [];
  window.LEVELS_REGISTRY.push({ id: ID, name: NAME, init: window.initNiveau6, consignes: CONSIGNES });
})();