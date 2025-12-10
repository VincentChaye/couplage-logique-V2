/* ==== Cytoscape init ==== */
const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: [],
  style: [
    /* 1. Styles de base */
    {
      selector: 'node', style: {
        'background-color': '#cbd5e1',
        'label': 'data(label)',
        'color': '#374151',
        'font-weight': 'bold',
        'text-valign': 'center', 'text-halign': 'center',
        'width': 38, 'height': 38,
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

    /* 2. Styles des couleurs (Classes) */
    {
      selector: '.edge-green', style: {
        'line-color': '#22c55e',
        'target-arrow-color': '#22c55e',
        'width': 3
      }
    },
    {
      selector: '.edge-red', style: {
        'line-color': '#ef4444',
        'target-arrow-color': '#ef4444',
        'width': 3
      }
    },
    {
      selector: '.edge-grey', style: {
        'line-color': '#9ca3af',
        'target-arrow-color': '#9ca3af',
        'width': 3
      }
    },

    /* 3. Styles de sélection (SÉPARÉS pour ne pas déformer les nœuds) */
    {
      selector: 'edge:selected', style: {
        'line-color': '#3b82f6',      /* Bleu vif */
        'target-arrow-color': '#3b82f6',
        'width': 5,                   /* Plus épais */
        'z-index': 999
      }
    },
    {
      selector: 'node:selected', style: {
        'border-color': '#3b82f6',    /* Bordure bleue */
        'border-width': 4             /* Bordure épaisse */
      }
    },
    
    /* Style pour le nœud source lors de la création d'arête */
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

/* ==== Nouveaux sélecteurs pour l'éditeur ==== */
const nodePartInput = document.getElementById('nodePart');
const nodeLabelInput = document.getElementById('nodeLabel');
const btnAddNode = document.getElementById('btnAddNode');
const btnDeleteNode = document.getElementById('btnDeleteNode');
const btnExportJSON = document.getElementById('btnExportJSON');
const btnImportJSON = document.getElementById('btnImportJSON');
const fileInput = document.getElementById('fileInput');
const btnLoadLevel = document.getElementById('btnLoadLevel');
const btnLoadTemplate = document.getElementById('btnLoadTemplate');

/* ==== Zone 3 : titre & consignes ==== */
const TITLE_EL = document.querySelector('#zone-3 h1');
const CONSIGNE_EL = document.querySelector('#zone-3 p');
const TITLE_INIT = TITLE_EL ? TITLE_EL.textContent : '';
const CONSIGNE_INIT = CONSIGNE_EL ? CONSIGNE_EL.innerHTML : '';
function setZone3Title(text) { if (TITLE_EL) TITLE_EL.textContent = text; }
function setConsignes(html) { if (CONSIGNE_EL) CONSIGNE_EL.innerHTML = html; }

/* ==== Consignes dynamiques ==== */
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
  const colWidth = 140, rowHeight = 70, x0 = 80, y0 = 80;
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
  const centerX = window.innerWidth < 1000 ? 300 : 400;
  const centerY = 350;
  const radius = 280;

  const p1 = { x: centerX, y: centerY - radius }; 
  const p2 = { x: centerX + radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) }; 
  const p3 = { x: centerX + radius * Math.cos(5 * Math.PI / 6), y: centerY + radius * Math.sin(5 * Math.PI / 6) }; 

  const sides = [
    { part: 1, start: p1, end: p2 },
    { part: 2, start: p2, end: p3 },
    { part: 3, start: p3, end: p1 }
  ];

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

  // 1. Création d'arête (Clic sur 2 nœuds)
  cy.on('tap', 'node', (evt) => {
    const node = evt.target;
    if (!firstNode) {
      firstNode = node; node.addClass('selected-node'); return;
    }
    if (firstNode.id() !== node.id()) {
      const pa = firstNode.data('part'), pb = node.data('part');
      if (!edgeExists(firstNode.id(), node.id())) {
        cy.add({
          group: 'edges',
          data: { id: `u_${firstNode.id()}_${node.id()}`, source: firstNode.id(), target: node.id() }
        });
        refreshStats();
      }
    }
    firstNode.removeClass('selected-node'); firstNode = null;
  });

  // 2. Gestion des arêtes (Sélection au clic simple, Suppression au double clic)
  let lastEdgeTap = { id: null, time: 0 };
  cy.on('tap', 'edge', (evt) => {
    const edge = evt.target, now = Date.now();
    if (lastEdgeTap.id === edge.id() && (now - lastEdgeTap.time) < 350) {
      edge.remove(); 
      refreshStats(); 
      lastEdgeTap = { id: null, time: 0 };
    } else {
      lastEdgeTap = { id: edge.id(), time: now };
    }
  });

  cy.on('taphold', 'edge', (evt) => { evt.target.remove(); refreshStats(); });
}

/* ==== Bandeau "Bravo !" ==== */
let CURRENT_CONTEXT = { mode: 'levels', levelId: 'niveau1' };

function ensureWinBanner() {
  let banner = document.getElementById('win-banner');
  if (!banner) {
    const container = document.querySelector('#zone-3 > div') || document.getElementById('zone-3');
    banner = document.createElement('div');
    banner.id = 'win-banner';
    banner.className = 'win-banner hidden';
    banner.innerHTML = `
      <div class="wb-content">
        <span class="wb-emoji">🎉</span>
        <span class="wb-text">Bravo !</span>
      </div>
      <div class="wb-actions">
        <button id="wbReplay" class="primary">Rejouer</button>
        <button id="wbClose" class="ghost">Fermer</button>
      </div>
    `;
    container.appendChild(banner);
    banner.querySelector('#wbClose').addEventListener('click', hideWinBanner);
    banner.querySelector('#wbReplay').addEventListener('click', () => {
      (banner._replay || defaultReplay)();
      hideWinBanner();
    });
  }
  return banner;
}
function showWinBanner(text, replayFn) {
  const b = ensureWinBanner();
  b.querySelector('.wb-text').innerHTML = text || "Bravo ! Niveau réussi 🎉";
  b._replay = replayFn || defaultReplay;
  b.classList.remove('hidden');
}
function hideWinBanner() {
  const b = document.getElementById('win-banner');
  if (b) b.classList.add('hidden');
}
function defaultReplay() {
  if (CURRENT_CONTEXT.mode === 'levels' && CURRENT_CONTEXT.levelId) {
    drawLevel(CURRENT_CONTEXT.levelId);
  } else {
    initEditor();
  }
}
window.announceWin = function (message) { showWinBanner(message || "Bravo ! Niveau réussi 🎉"); };

/* === Outils : Arêtes Potentielles & Suppression "Aléatoire" === */
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
  let edgeIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      byPart[parts[i]].forEach(a => byPart[parts[j]].forEach(b => {
        const key = a < b ? `${a}__${b}` : `${b}__${a}`;
        if (!existing.has(key)) {
          batch.push({
            group: 'edges',
            data: { id: `pot_${key}_${edgeIndex++}`, source: a, target: b },
            classes: 'edge-grey' 
          });
        }
      }));
    }
  }
  if (batch.length > 0) { cy.add(batch); refreshStats(); }
}

/* ==== Logique principale ==== */
function initEditor() {
  CURRENT_CONTEXT = { mode: 'editor', levelId: null };
  hideWinBanner();
  setZone3Title("Éditeur de graphe");
  setConsignes("Créez votre propre graphe en ajoutant des nœuds et en reliant les sommets.");
  refreshStats();
  enableInteractiveEdges();
}

let nodeCounter = 0;
function addNode() {
  const part = parseInt(nodePartInput.value, 10) || 1;
  const label = nodeLabelInput.value.trim() || `N${++nodeCounter}`;
  const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  cy.add({ group: 'nodes', data: { id, label, part, order: cy.nodes().filter(n => n.data('part') === part).length + 1 } });
  applyColumnsByPart(); refreshStats(); nodeLabelInput.value = ''; nodeLabelInput.focus();
}

function deleteSelectedNodes() {
  const selected = cy.$(':selected');
  if (selected.length === 0) { alert('Sélectionnez un nœud.'); return; }
  if (confirm(`Supprimer ${selected.length} nœud(s) ?`)) { selected.remove(); refreshStats(); }
}

function exportGraphToJSON() {
  const nodes = cy.nodes().map(n => ({ id: n.id(), label: n.data('label'), part: n.data('part'), order: n.data('order'), position: n.position() }));
  const edges = cy.edges().map(e => ({ id: e.id(), source: e.source().id(), target: e.target().id(), classes: e.classes().join(' ') }));
  const blob = new Blob([JSON.stringify({ version: '1.0', metadata: { created: new Date().toISOString() }, nodes, edges }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `graphe_${Date.now()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function importGraphFromJSON(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (!data.nodes) throw new Error('Format JSON invalide');
    cy.elements().remove();
    data.nodes.forEach(n => cy.add({ group: 'nodes', data: { id: n.id, label: n.label, part: n.part, order: n.order }, position: n.position || { x: 0, y: 0 } }));
    if (data.edges) data.edges.forEach(e => cy.add({ group: 'edges', data: { id: e.id, source: e.source, target: e.target }, classes: e.classes || '' }));
    cy.fit(undefined, 40); refreshStats(); enableInteractiveEdges();
    alert('Import réussi !');
  } catch (e) { alert('Erreur : ' + e.message); }
}

/* ==== Templates ==== */
const GRAPH_TEMPLATES = {
  bipartite_3_3: { name: 'Bipartite K₂,₃', nodes: [{id:'a1',label:'A1',part:1},{id:'a2',label:'A2',part:1},{id:'b1',label:'B1',part:2},{id:'b2',label:'B2',part:2},{id:'b3',label:'B3',part:2}], edges:[] },
  tripartite_2_2_2: { name: 'Tripartite 2-2-2', nodes: [{id:'a1',label:'A1',part:1},{id:'a2',label:'A2',part:1},{id:'b1',label:'B1',part:2},{id:'b2',label:'B2',part:2},{id:'c1',label:'C1',part:3},{id:'c2',label:'C2',part:3}], edges:[] },
  star_5: { name: 'Étoile 5', nodes: [{id:'c',label:'Centre',part:1},{id:'s1',label:'1',part:2},{id:'s2',label:'2',part:2},{id:'s3',label:'3',part:2},{id:'s4',label:'4',part:2},{id:'s5',label:'5',part:2}], edges: [{source:'c',target:'s1'},{source:'c',target:'s2'},{source:'c',target:'s3'},{source:'c',target:'s4'},{source:'c',target:'s5'}] },
  cycle_6: { name: 'Cycle 6', nodes: [{id:'n1',label:'1',part:1},{id:'n2',label:'2',part:1},{id:'n3',label:'3',part:1},{id:'n4',label:'4',part:1},{id:'n5',label:'5',part:1},{id:'n6',label:'6',part:1}], edges: [{source:'n1',target:'n2'},{source:'n2',target:'n3'},{source:'n3',target:'n4'},{source:'n4',target:'n5'},{source:'n5',target:'n6'},{source:'n6',target:'n1'}] },
  complete_4: { name: 'Complet K₄', nodes: [{id:'a',label:'A',part:1},{id:'b',label:'B',part:1},{id:'c',label:'C',part:1},{id:'d',label:'D',part:1}], edges: [{source:'a',target:'b'},{source:'a',target:'c'},{source:'a',target:'d'},{source:'b',target:'c'},{source:'b',target:'d'},{source:'c',target:'d'}] }
};

function loadTemplate(id) {
  const t = GRAPH_TEMPLATES[id];
  if (!t) return;
  cy.elements().remove();
  t.nodes.forEach((n, i) => cy.add({ group: 'nodes', data: { ...n, order: i } }));
  t.edges.forEach((e, i) => cy.add({ group: 'edges', data: { id: `e${i}`, source: e.source, target: e.target } }));
  applyColumnsByPart(); refreshStats(); enableInteractiveEdges();
  setZone3Title(t.name); setConsignes(`Template ${t.name} chargé.`);
}

/* ==== Niveaux ==== */
const LEVELS = [
  { id: 'niveau1', name: 'Niveau 1 – Les neveux' },
  { id: 'niveau2', name: 'Niveau 2 – Chiens et Niches' },
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
  CURRENT_CONTEXT = { mode: 'levels', levelId };
  hideWinBanner();
  setConsignesForLevel(levelId);
  const fnName = 'init' + levelId.charAt(0).toUpperCase() + levelId.slice(1);
  if (typeof window[fnName] === 'function') window[fnName]();
  else if (levelId === 'niveau1') initNiveau1(); 
}

/* ==== Initialisation NIVEAU 1 (Local) ==== */
function initNiveau1() {
  setConsignesForLevel('niveau1');
  cy.elements().remove();
  cy.add([
    { data: { id: 'riri', label: 'Riri', part: 1, order: 1 } },
    { data: { id: 'fifi', label: 'Fifi', part: 1, order: 2 } },
    { data: { id: 'loulou', label: 'Loulou', part: 1, order: 3 } },
    { data: { id: 'chat', label: 'Chat', part: 2, order: 1 } },
    { data: { id: 'hamster', label: 'Hamster', part: 2, order: 2 } },
    { data: { id: 'peroquet', label: 'Perroquet', part: 2, order: 3 } },
  ]);
  applyColumnsByPart(); refreshStats(); enableInteractiveEdges();
  // Soluce
  const sol = [["riri", "hamster"], ["fifi", "peroquet"], ["loulou", "chat"]];
  const check = () => {
    const es = cy.edges().map(e => [e.source().id(), e.target().id()]);
    const ok = sol.every(s => es.some(e => (e[0]===s[0]&&e[1]===s[1]) || (e[0]===s[1]&&e[1]===s[0])));
    if (ok && es.length === sol.length) announceWin();
  };
  cy.on('add remove', 'edge', check);
}

/* ==== UI Listeners ==== */
modeSel.addEventListener('change', () => {
  const m = modeSel.value;
  editorControls.classList.toggle('hidden', m !== 'editor');
  levelControls.classList.toggle('hidden', m !== 'levels');
  templateControls.classList.toggle('hidden', m !== 'templates');
  if (btnDeleteNode) btnDeleteNode.style.display = (m === 'levels') ? 'none' : '';

  if (m === 'levels') { ensureLevelOptions(); if (levelSel.value) setConsignesForLevel(levelSel.value); }
  else if (m === 'editor') initEditor();
  else if (m === 'templates') { setZone3Title('Templates'); setConsignes('Choisissez un template.'); }
  
  setPotentialButtonState();
});

if (btnAddNode) btnAddNode.addEventListener('click', addNode);
if (nodeLabelInput) nodeLabelInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addNode(); });
if (btnDeleteNode) btnDeleteNode.addEventListener('click', deleteSelectedNodes);
if (btnExportJSON) btnExportJSON.addEventListener('click', () => { if (cy.nodes().length) exportGraphToJSON(); });
if (btnImportJSON) btnImportJSON.addEventListener('click', () => fileInput.click());
if (fileInput) fileInput.addEventListener('change', (e) => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader(); r.onload = (ev) => importGraphFromJSON(ev.target.result); r.readAsText(f); fileInput.value = '';
});
if (btnLoadLevel) btnLoadLevel.addEventListener('click', () => drawLevel(levelSel.value || 'niveau1'));
if (btnLoadTemplate) btnLoadTemplate.addEventListener('click', () => loadTemplate(templateSel.value));

if (btnPotential) btnPotential.addEventListener('click', () => {
  if (modeSel.value !== 'levels') return;
  const g = cy.edges('.edge-grey');
  if (g.length) { g.remove(); refreshStats(); } else addAllPotentialEdges();
});

document.getElementById('btnClear').addEventListener('click', () => { cy.elements().remove(); refreshStats(); });
document.getElementById('btnLayout').addEventListener('click', () => {
  if (CURRENT_CONTEXT.levelId === 'niveau6' && typeof applyTriangleLayout === 'function') applyTriangleLayout();
  else applyColumnsByPart();
});
document.getElementById('btnFit').addEventListener('click', () => cy.fit(undefined, 20));
document.getElementById('openHelp').addEventListener('click', () => help.showModal());
document.getElementById('closeHelp').addEventListener('click', () => help.close());

/* ============================================================
   GESTION DES COULEURS D'ARÊTES (FINALE & CORRIGÉE)
   ============================================================ */
(function initEdgeColorSystem() {
  const btn = document.getElementById('btnEdgeColor');
  if (!btn) return;

  const COLORS = ['grey', 'green', 'red'];
  const LABELS = { grey: 'Gris', green: 'Vert', red: 'Rouge' };
  let currentIndex = 0; // 0=grey

  function updateVisuals() {
    const color = COLORS[currentIndex];
    // Met à jour le bouton
    btn.className = `color-cycle color-${color}`;
    btn.textContent = `Pose : ${LABELS[color]}`;
    btn.style.width = "100%";

    // Met à jour les arêtes sélectionnées ET LES DÉSÉLECTIONNE (pour voir la couleur)
    const selected = cy.edges(':selected');
    if (selected.length > 0) {
      cy.batch(() => {
        selected.removeClass('edge-grey edge-green edge-red');
        selected.addClass(`edge-${color}`);
      });
      // UX : On désélectionne pour que l'utilisateur voie la nouvelle couleur immédiatement
      selected.unselect();
    }
  }

  // 1. Clic : Cycle la couleur et applique à la sélection
  btn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % COLORS.length;
    updateVisuals();
  });

  // 2. Ajout arête : Applique la couleur active
  cy.on('add', 'edge', (evt) => {
    const edge = evt.target;
    // Petit délai technique
    setTimeout(() => {
      // Si pas de couleur définie, on met la couleur active
      if (!edge.hasClass('edge-green') && !edge.hasClass('edge-red') && !edge.hasClass('edge-grey')) {
        edge.addClass(`edge-${COLORS[currentIndex]}`);
      }
    }, 0);
  });
  
  // Init
  updateVisuals();
})();

// Démarrage
initEditor();