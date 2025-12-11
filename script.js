/* ==== Cytoscape init ==== */
const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: [],
  style: [
    /* 1. Styles de base */
    {
      selector: 'node', style: {
        'background-color': '#cbd5e1',
        'background-image': function(ele) { return getNodeImage(ele.id()); },
        'background-fit': 'contain',
        'background-clip': 'none',
        'label': 'data(label)',
        'color': '#374151',
        'font-weight': 'bold',
        'font-size': '11px',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 6,
        'width': 50, 'height': 50,
        'border-width': 2,
        'border-color': '#94a3b8',
        'border-opacity': 1
      }
    },
    {
      selector: 'edge', style: {
        'width': 3,
        'line-color': '#94a3b8',
        'curve-style': 'bezier',
        'target-arrow-shape': 'none'
      }
    },

    /* 2. Styles des couleurs */
    {
      selector: '.edge-green', style: { 'line-color': '#22c55e', 'target-arrow-color': '#22c55e' }
    },
    {
      selector: '.edge-red', style: { 'line-color': '#ef4444', 'target-arrow-color': '#ef4444' }
    },
    {
      selector: '.edge-grey', style: { 'line-color': '#9ca3af', 'target-arrow-color': '#9ca3af' }
    },

    /* 3. Styles de sélection */
    {
      selector: 'edge:selected', style: {
        'line-color': '#3b82f6',
        'target-arrow-color': '#3b82f6',
        'width': 5,
        'z-index': 999
      }
    },
    {
      selector: 'node:selected', style: {
        'border-color': '#3b82f6',
        'border-width': 4
      }
    },
    {
      selector: '.selected-node', style: {
        'border-color': '#60a5fa',
        'border-width': 4
      }
    }
  ],
  layout: { name: 'preset' },
  wheelSensitivity: 0.1,
});

/* ==== GESTION INTELLIGENTE DES IMAGES ==== */
function getNodeImage(id) {
  if (id.startsWith('proj_') || id.startsWith('int_')) return null;

  const imageMap = {
    'chien_noir': 'chien2',
    'chien_marron': 'chien1',
    'chien_blanc': 'chien0',
    'niche_jaune': 'niche0',
    'niche_sans_gamelle': 'niche1',
    'niche_blanche': 'niche2',
    'idefix': 'Idefix',
    'ours_blanc': 'ours-blanc',
    'chameau': 'dromadaire',
    'casque_andre': 'casqueAndre',
    'casque_bernard': 'casqueBernard',
    'casque_claude': 'casqueClaude',
    'moto_andre': 'motoAndre',
    'moto_bernard': 'motoBernard',
    'moto_claude': 'motoClaude'
  };

  const filename = imageMap[id] || id;
  return `public/images/${filename}.png`;
}

/* ==== Sélecteurs UI ==== */
const modeSel = document.getElementById('mode');
const editorControls = document.getElementById('editor-controls');
const levelControls = document.getElementById('level-controls');
const templateControls = document.getElementById('template-controls');
const levelSel = document.getElementById('level');
const templateSel = document.getElementById('template');
const btnRandom = document.getElementById('btnRandom');
const btnPotential = document.getElementById('btnPotential');
const help = document.getElementById('help');

const nodePartInput = document.getElementById('nodePart');
const nodeLabelInput = document.getElementById('nodeLabel');
const btnAddNode = document.getElementById('btnAddNode');
const btnDeleteNode = document.getElementById('btnDeleteNode');
const btnExportJSON = document.getElementById('btnExportJSON');
const btnImportJSON = document.getElementById('btnImportJSON');
const fileInput = document.getElementById('fileInput');
const btnLoadLevel = document.getElementById('btnLoadLevel');
const btnLoadTemplate = document.getElementById('btnLoadTemplate');

/* ==== Gestion Titres/Consignes ==== */
const TITLE_EL = document.querySelector('#zone-3 h1');
const CONSIGNE_EL = document.querySelector('#zone-3 p');
const TITLE_INIT = TITLE_EL ? TITLE_EL.textContent : '';
const CONSIGNE_INIT = CONSIGNE_EL ? CONSIGNE_EL.innerHTML : '';
function setZone3Title(text) { if (TITLE_EL) TITLE_EL.textContent = text; }
function setConsignes(html) { if (CONSIGNE_EL) CONSIGNE_EL.innerHTML = html; }

function setConsignesForLevel(levelId) {
  const reg = Array.isArray(window.LEVELS_REGISTRY) ? window.LEVELS_REGISTRY : [];
  const item = reg.find(x => x && x.id === levelId);
  if (item) {
    if (item.name) setZone3Title(item.name);
    if (item.consignes) { setConsignes(item.consignes); return; }
  }
  setZone3Title(TITLE_INIT);
  setConsignes(CONSIGNE_INIT);
}

/* ==== Helpers Layouts ==== */
function applyColumnsByPart() {
  const colWidth = 140, rowHeight = 90, x0 = 80, y0 = 80;
  const groups = {};
  cy.nodes().forEach(n => {
    const p = n.data('part') || 1;
    (groups[p] ||= []).push(n);
  });
  const parts = Object.keys(groups).map(Number).sort((a, b) => a - b);
  parts.forEach((p, colIndex) => {
    groups[p].sort((a, b) => {
      const oa = a.data('order') ?? a.id();
      const ob = b.data('order') ?? b.id();
      return (oa > ob) - (oa < ob);
    });
    groups[p].forEach((node, rowIndex) => {
      node.position({ x: x0 + colIndex * colWidth, y: y0 + rowIndex * rowHeight });
    });
  });
  cy.fit(undefined, 40);
}

function applyTriangleLayout() {
  const centerX = 400, centerY = 350, radius = 280;
  const p1 = { x: centerX, y: centerY - radius }; 
  const p2 = { x: centerX + radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) }; 
  const p3 = { x: centerX + radius * Math.cos(5 * Math.PI / 6), y: centerY + radius * Math.sin(5 * Math.PI / 6) }; 
  const sides = [{ part: 1, start: p1, end: p2 }, { part: 2, start: p2, end: p3 }, { part: 3, start: p3, end: p1 }];
  layoutPolygon(sides);
}

function applySquareLayout() {
  const centerX = 400, centerY = 350, radius = 220;
  const p1 = { x: centerX - radius, y: centerY - radius }; 
  const p2 = { x: centerX + radius, y: centerY - radius };
  const p3 = { x: centerX + radius, y: centerY + radius };
  const p4 = { x: centerX - radius, y: centerY + radius };
  const sides = [
    { part: 1, start: p1, end: p2 },
    { part: 2, start: p2, end: p3 },
    { part: 3, start: p3, end: p4 },
    { part: 4, start: p4, end: p1 }
  ];
  layoutPolygon(sides);
}

function layoutPolygon(sides) {
  const groups = {};
  cy.nodes().forEach(n => {
    const p = n.data('part') || 1;
    (groups[p] ||= []).push(n);
  });
  sides.forEach(side => {
    const nodes = groups[side.part];
    if (!nodes) return;
    nodes.sort((a, b) => (a.data('order') || 0) - (b.data('order') || 0));
    const count = nodes.length;
    nodes.forEach((node, i) => {
      const t = (i + 1) / (count + 1);
      const x = side.start.x + (side.end.x - side.start.x) * t;
      const y = side.start.y + (side.end.y - side.start.y) * t;
      node.position({ x, y });
    });
  });
  cy.fit(undefined, 50);
}

function refreshStats() {
  const el = document.getElementById('stats');
  if (!el) return;
  el.textContent = `${cy.nodes().length} sommets, ${cy.edges().length} arêtes`;
}

/* ==== Interactions (Création / Sélection) ==== */
let firstNode = null;
function edgeExists(a, b) {
  return cy.edges(`[source = "${a}"][target = "${b}"], [source = "${b}"][target = "${a}"]`).length > 0;
}

function enableInteractiveEdges() {
  cy.off('tap', 'node'); cy.off('tap', 'edge'); cy.off('taphold', 'edge');

  cy.on('tap', 'node', (evt) => {
    const node = evt.target;
    if (!firstNode) {
      firstNode = node; node.addClass('selected-node'); return;
    }
    
    // CORRECTION : Empêcher les arêtes intra-parties (même colonne)
    const pa = firstNode.data('part');
    const pb = node.data('part');

    if (firstNode.id() !== node.id()) {
      // On autorise seulement si les parties sont différentes
      if (pa !== pb) {
        if (!edgeExists(firstNode.id(), node.id())) {
          cy.add({ group: 'edges', data: { source: firstNode.id(), target: node.id() } });
          refreshStats();
        }
      } else {
        console.log("Action interdite : Arête intra-partie");
      }
    }
    firstNode.removeClass('selected-node'); firstNode = null;
  });

  let lastEdgeTap = { id: null, time: 0 };
  cy.on('tap', 'edge', (evt) => {
    const edge = evt.target, now = Date.now();
    // Double tap -> Suppression
    if (lastEdgeTap.id === edge.id() && (now - lastEdgeTap.time) < 350) {
      edge.remove(); refreshStats(); lastEdgeTap = { id: null, time: 0 };
    } else {
      lastEdgeTap = { id: edge.id(), time: now };
    }
  });
}

/* ==== Système de Victoire & POPUP ==== */
let CURRENT_CONTEXT = { mode: 'levels', levelId: 'niveau1', layout: 'columns' };

const PEDAGO_TEXTS = {
  'niveau1': "<strong>Le Couplage Bipartite :</strong> Tu as relié deux groupes distincts (neveux et animaux). En maths, trouver le partenaire unique pour chacun, ça s'appelle un <strong>Couplage Parfait</strong> !",
  'niveau2': "<strong>Logique & Élimination :</strong> Comme Sherlock Holmes, tu as procédé par élimination. En coloriant en <strong>Rouge</strong> ce qui est impossible, la solution <strong>Verte</strong> apparaît d'elle-même !",
  'niveau3': "<strong>Les Contraintes :</strong> Ici, les règles interdisaient certaines couleurs (ex: Vert n'aime pas Jaune). Les graphes servent souvent à résoudre ce type de problèmes, comme pour créer des emplois du temps sans conflits.",
  'niveau4': "<strong>La Modélisation :</strong> Tu as transformé des phrases compliquées en un dessin simple. C'est le super-pouvoir des graphes : <strong>rendre visible l'invisible</strong> pour mieux réfléchir.",
  'niveau5': "<strong>Satisfaction de Contraintes :</strong> C'est comme un Sudoku ! Chaque trait rouge posé réduit les possibilités. Le graphe permet de visualiser toutes ces hypothèses d'un seul coup d'œil.",
  'niveau6': "<strong>Le Cycle Tripartite :</strong> Bravo ! Tu as géré 3 groupes (Amis, Motos, Casques). La 'boucle' que tu as fermée (A → B → C → A) montre la cohérence parfaite des échanges."
};

const winDialog = document.getElementById('win-dialog');
const btnCloseWin = document.getElementById('closeWin');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnReplayModal = document.getElementById('btnReplayModal');

if(btnCloseWin) btnCloseWin.addEventListener('click', () => winDialog.close());
if(btnCloseModal) btnCloseModal.addEventListener('click', () => winDialog.close());
if(btnReplayModal) btnReplayModal.addEventListener('click', () => {
  winDialog.close();
  defaultReplay();
});

// Nouvelle fonction qui ouvre la pop-up
window.announceWin = function(msg) {
  const oldBanner = document.getElementById('win-banner');
  if (oldBanner) oldBanner.classList.add('hidden');

  const lvlId = CURRENT_CONTEXT.levelId;
  const pedagoText = PEDAGO_TEXTS[lvlId] || "Bravo ! Tu as maîtrisé ce graphe.";

  const msgEl = document.getElementById('win-message');
  const pedagoEl = document.getElementById('pedago-text');
  
  if(msgEl) msgEl.textContent = msg || "Niveau réussi !";
  if(pedagoEl) pedagoEl.innerHTML = pedagoText;

  if (winDialog && !winDialog.open) {
    winDialog.showModal();
  }
};

function defaultReplay() {
  if (CURRENT_CONTEXT.mode === 'levels' && CURRENT_CONTEXT.levelId) {
    drawLevel(CURRENT_CONTEXT.levelId);
  } else {
    initEditor();
  }
}

/* ==== VÉRIFICATEUR GLOBAL (CORRIGÉ & ROBUSTE) ==== */
window.checkGlobalSolution = function(solutionEdges) {
  const getKey = (id1, id2) => (id1 < id2 ? `${id1}__${id2}` : `${id2}__${id1}`);
  
  const solKeys = new Set();
  solutionEdges.forEach(([a, b]) => solKeys.add(getKey(a, b)));
  const solCount = solKeys.size;

  const allEdges = cy.edges();
  let countGreen = 0;     
  let countGreenGrey = 0; 
  let validGreen = true;
  let validGreenGrey = true;
  let redError = false; 

  allEdges.forEach(edge => {
    const s = edge.source().id();
    const t = edge.target().id();
    const key = getKey(s, t);
    const isSol = solKeys.has(key);

    const isGreen = edge.hasClass('edge-green');
    const isRed = edge.hasClass('edge-red');
    const isGrey = edge.hasClass('edge-grey') || (!isGreen && !isRed);

    // ERREUR FATALE : Si une solution est marquée en ROUGE, c'est perdu.
    if (isSol && isRed) {
      redError = true;
    }

    // 1. Condition Propre (Vert Strict)
    if (isGreen) {
      countGreen++;
      if (!isSol) validGreen = false;
    }

    // 2. Condition Brouillon (Vert + Gris acceptés)
    if (isGreen || isGrey) {
      countGreenGrey++;
      if (!isSol) validGreenGrey = false;
    }
  });

  if (redError) return false;

  const winCondition1 = validGreenGrey && (countGreenGrey === solCount);
  const winCondition2 = validGreen && (countGreen === solCount);

  if (winCondition1 || winCondition2) {
    announceWin("Bravo ! Niveau réussi 🎉");
    return true;
  }
  return false;
};

/* ==== Outils Potentiels ==== */
if(btnRandom) btnRandom.style.display = 'none';

function setPotentialButtonState() {
  if (!btnPotential) return;
  const isLevels = modeSel.value === 'levels';
  btnPotential.disabled = !isLevels;
  btnPotential.title = !isLevels ? 'Disponible uniquement en mode Niveaux' : 'Afficher arêtes possibles';
}

function addAllPotentialEdges() {
  const existing = new Set();
  cy.edges().forEach(e => {
    const a = e.source().id(), b = e.target().id();
    existing.add(a < b ? `${a}__${b}` : `${b}__${a}`);
  });
  const byPart = {};
  cy.nodes().forEach(n => {
    const p = n.data('part');
    if (p != null) (byPart[p] ||= []).push(n.id());
  });
  const parts = Object.keys(byPart).map(Number).sort((a, b) => a - b);
  const batch = [];
  let idx = 0;
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      byPart[parts[i]].forEach(a => byPart[parts[j]].forEach(b => {
        const key = a < b ? `${a}__${b}` : `${b}__${a}`;
        if (!existing.has(key)) {
          batch.push({ group: 'edges', data: { id: `pot_${key}_${idx++}`, source: a, target: b }, classes: 'edge-grey' });
        }
      }));
    }
  }
  if (batch.length > 0) { cy.add(batch); refreshStats(); }
}

/* ==== Logique App ==== */
function initEditor() {
  CURRENT_CONTEXT = { mode: 'editor', levelId: null, layout: 'columns' };
  setZone3Title("Éditeur de graphe");
  setConsignes("Créez votre propre graphe en ajoutant des nœuds et en reliant les sommets.");
  refreshStats();
  enableInteractiveEdges();
}

let nodeCounter = 0;
function addNode() {
  const part = parseInt(nodePartInput.value, 10) || 1;
  const label = nodeLabelInput.value.trim() || `N${++nodeCounter}`;
  const id = `node_${Date.now()}`;
  cy.add({ group: 'nodes', data: { id, label, part, order: 99 } });
  
  if (CURRENT_CONTEXT.layout === 'triangle') applyTriangleLayout();
  else if (CURRENT_CONTEXT.layout === 'square') applySquareLayout();
  else applyColumnsByPart();
  
  refreshStats(); nodeLabelInput.value = ''; nodeLabelInput.focus();
}

function deleteSelectedNodes() {
  const selected = cy.$(':selected');
  if (selected.length === 0) { alert('Sélectionnez un élément.'); return; }
  if (confirm('Supprimer la sélection ?')) { selected.remove(); refreshStats(); }
}

function exportGraphToJSON() {
  if (!cy.nodes().length) return;
  const nodes = cy.nodes().map(n => ({ id: n.id(), label: n.data('label'), part: n.data('part'), order: n.data('order'), position: n.position() }));
  const edges = cy.edges().map(e => ({ source: e.source().id(), target: e.target().id(), classes: e.classes().join(' ') }));
  const blob = new Blob([JSON.stringify({ version: '1.0', nodes, edges }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `graphe_${Date.now()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function importGraphFromJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    cy.elements().remove();
    data.nodes.forEach(n => cy.add({ group: 'nodes', data: { id: n.id, label: n.label, part: n.part, order: n.order }, position: n.position || {x:0,y:0} }));
    if(data.edges) data.edges.forEach(e => cy.add({ group: 'edges', data: { source: e.source, target: e.target }, classes: e.classes || '' }));
    
    CURRENT_CONTEXT.layout = 'columns';
    cy.fit(undefined, 40); refreshStats(); enableInteractiveEdges();
  } catch(e) { alert('Erreur JSON'); }
}

/* ==== TEMPLATES ==== */
function generateKPartite(parts) {
  const nodes = [];
  const edges = [];
  const chars = ['a', 'b', 'c', 'd'];
  parts.forEach((count, pIndex) => {
    for (let i = 1; i <= count; i++) {
      nodes.push({ id: `${chars[pIndex]}${i}`, label: `${chars[pIndex].toUpperCase()}${i}`, part: pIndex + 1 });
    }
  });
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].part !== nodes[j].part) {
        edges.push({ source: nodes[i].id, target: nodes[j].id });
      }
    }
  }
  return { nodes, edges };
}

const GRAPH_TEMPLATES = {
  k3_3: { name: 'Bipartite Complet K3,3', ...generateKPartite([3, 3]) },
  k3_3_3: { name: 'Tripartite Complet K3,3,3', ...generateKPartite([3, 3, 3]) },
  k3_3_3_3: { name: 'Quadripartite Complet K3,3,3,3', ...generateKPartite([3, 3, 3, 3]) }
};

function loadTemplate(id) {
  const t = GRAPH_TEMPLATES[id]; if(!t) return;
  cy.elements().remove();
  t.nodes.forEach((n,i)=>cy.add({group:'nodes',data:{...n,order:i}}));
  t.edges.forEach(e=>cy.add({group:'edges',data:{source:e.source,target:e.target}}));
  
  if (id === 'k3_3_3') {
    CURRENT_CONTEXT.layout = 'triangle';
    applyTriangleLayout();
  } else if (id === 'k3_3_3_3') {
    CURRENT_CONTEXT.layout = 'square';
    applySquareLayout();
  } else {
    CURRENT_CONTEXT.layout = 'columns';
    applyColumnsByPart();
  }
  
  refreshStats(); enableInteractiveEdges();
  setZone3Title(t.name); setConsignes(`Modèle ${t.name} chargé.`);
}

/* ==== Niveaux ==== */
const LEVELS = [
  { id: 'niveau1', name: 'Niveau 1 – Neveux' },
  { id: 'niveau2', name: 'Niveau 2 – Chiens' },
  { id: 'niveau3', name: 'Niveau 3 – Interrupteurs' },
  { id: 'niveau4', name: 'Niveau 4 – Gaulois' },
  { id: 'niveau5', name: 'Niveau 5 – Course' },
  { id: 'niveau6', name: 'Niveau 6 – Motos' }
];

function ensureLevelOptions() {
  if (!levelSel) return;
  const reg = (window.LEVELS_REGISTRY || []).concat(LEVELS);
  const map = new Map();
  reg.forEach(l => { if (l?.id) map.set(l.id, { id: l.id, name: l.name || l.id }); });
  levelSel.innerHTML = '';
  [...map.values()].forEach(l => {
    const opt = document.createElement('option'); opt.value = l.id; opt.textContent = l.name; levelSel.appendChild(opt);
  });
  if (!levelSel.value && map.has('niveau1')) levelSel.value = 'niveau1';
}

function drawLevel(levelId) {
  const isTriangle = (levelId === 'niveau6');
  CURRENT_CONTEXT = { mode: 'levels', levelId, layout: isTriangle ? 'triangle' : 'columns' };
  
  setConsignesForLevel(levelId);
  const fnName = 'init' + levelId.charAt(0).toUpperCase() + levelId.slice(1);
  if (typeof window[fnName] === 'function') window[fnName]();
  else if (levelId === 'niveau1') initNiveau1();
}

/* Fallback Local Niveau 1 */
function initNiveau1() {
  setConsignesForLevel('niveau1');
  cy.elements().remove();
  cy.add([
    { data: { id: 'riri', label: 'Riri', part: 1, order: 1 } },
    { data: { id: 'fifi', label: 'Fifi', part: 1, order: 2 } },
    { data: { id: 'loulou', label: 'Loulou', part: 1, order: 3 } },
    { data: { id: 'chat', label: 'Chat', part: 2, order: 1 } },
    { data: { id: 'hamster', label: 'Hamster', part: 2, order: 2 } },
    { data: { id: 'peroquet', label: 'Perroquet', part: 2, order: 3 } }
  ]);
  applyColumnsByPart(); refreshStats(); enableInteractiveEdges();
  
  const sol = [["riri", "hamster"], ["fifi", "peroquet"], ["loulou", "chat"]];
  // CORRECTION : Plus de setTimeout, vérification directe après l'application de la classe (synchronisé dans l'event add)
  cy.on('add remove', 'edge', () => window.checkGlobalSolution(sol));
}

/* Events */
modeSel.addEventListener('change', () => {
  const m = modeSel.value;
  editorControls.classList.toggle('hidden', m !== 'editor');
  levelControls.classList.toggle('hidden', m !== 'levels');
  templateControls.classList.toggle('hidden', m !== 'templates');
  if (btnDeleteNode) btnDeleteNode.style.display = (m === 'levels') ? 'none' : '';
  if (m === 'levels') { ensureLevelOptions(); if (levelSel.value) setConsignesForLevel(levelSel.value); }
  else if (m === 'editor') initEditor();
  else if (m === 'templates') { setZone3Title('Templates'); setConsignes('Choisir un modèle.'); }
  setPotentialButtonState();
});

if (btnAddNode) btnAddNode.addEventListener('click', addNode);
if (nodeLabelInput) nodeLabelInput.addEventListener('keypress', e => { if(e.key==='Enter') addNode(); });
if (btnDeleteNode) btnDeleteNode.addEventListener('click', deleteSelectedNodes);
if (btnExportJSON) btnExportJSON.addEventListener('click', exportGraphToJSON);
if (btnImportJSON) btnImportJSON.addEventListener('click', () => fileInput.click());
if (fileInput) fileInput.addEventListener('change', e => {
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = ev => importGraphFromJSON(ev.target.result); r.readAsText(f); fileInput.value = '';
});
if (btnLoadLevel) btnLoadLevel.addEventListener('click', () => drawLevel(levelSel.value || 'niveau1'));
if (btnLoadTemplate) btnLoadTemplate.addEventListener('click', () => loadTemplate(templateSel.value));
if (btnPotential) btnPotential.addEventListener('click', () => {
  if (modeSel.value !== 'levels') return;
  const g = cy.edges('.edge-grey');
  if (g.length) { g.remove(); refreshStats(); } else addAllPotentialEdges();
});

document.getElementById('btnClear').addEventListener('click', () => { 
  cy.elements().remove(); 
  refreshStats();
  CURRENT_CONTEXT.layout = 'columns';
});

document.getElementById('btnLayout').addEventListener('click', () => {
  if (CURRENT_CONTEXT.layout === 'triangle') applyTriangleLayout();
  else if (CURRENT_CONTEXT.layout === 'square') applySquareLayout();
  else applyColumnsByPart();
});

document.getElementById('btnFit').addEventListener('click', () => cy.fit(undefined, 20));
document.getElementById('openHelp').addEventListener('click', () => help.showModal());
document.getElementById('closeHelp').addEventListener('click', () => help.close());

/* Bouton Couleur */
(function initEdgeColorSystem() {
  const btn = document.getElementById('btnEdgeColor');
  if (!btn) return;
  const COLORS = ['grey', 'green', 'red'];
  const LABELS = { grey: 'Gris', green: 'Vert', red: 'Rouge' };
  let currentIndex = 0;

  function updateVisuals() {
    const color = COLORS[currentIndex];
    btn.className = `color-cycle color-${color}`;
    btn.textContent = `Pose : ${LABELS[color]}`;
    btn.style.width = "100%";
    const selected = cy.edges(':selected');
    if (selected.length > 0) {
      cy.batch(() => {
        selected.removeClass('edge-grey edge-green edge-red');
        selected.addClass(`edge-${color}`);
        selected.unselect();
      });
    }
  }
  btn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % COLORS.length;
    updateVisuals();
  });
  
  // CORRECTION CRITIQUE : Suppression du setTimeout pour éviter le décalage à la vérification
  cy.on('add', 'edge', (evt) => {
    const edge = evt.target;
    // Application IMMEDIATE de la couleur
    if (!edge.hasClass('edge-green') && !edge.hasClass('edge-red') && !edge.hasClass('edge-grey')) {
      edge.addClass(`edge-${COLORS[currentIndex]}`);
    }
  });
  
  updateVisuals();
})();

initEditor();