/* ==== Cytoscape init ==== */
const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: [],
  style: [
    {
      selector: 'node', style: {
        'background-color': '#cbd5e1',
        'label': 'data(label)',
        'color': '#374151',
        'font-weight': '700',
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
        'curve-style': 'bezier'
      }
    },
    {
      selector: ':selected', style: {
        'background-color': '#60a5fa',
        'line-color': '#60a5fa'
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
  wheelSensitivity: 0.2,
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

/* ==== Zone 3 : titre & consignes (par défaut pour le mode personnalisé) ==== */
const TITLE_EL = document.querySelector('#zone-3 h1');
const CONSIGNE_EL = document.querySelector('#zone-3 p');
const TITLE_INIT = TITLE_EL ? TITLE_EL.textContent : '';
const CONSIGNE_INIT = CONSIGNE_EL ? CONSIGNE_EL.innerHTML : '';
function setZone3Title(text) { if (TITLE_EL) TITLE_EL.textContent = text; }
function setConsignes(html) { if (CONSIGNE_EL) CONSIGNE_EL.innerHTML = html; }

/* ==== Consignes dynamiques  ==== */

function setConsignesForLevel(levelId) {
  // 1) Registre dynamique (niveaux externes)
  const reg = Array.isArray(window.LEVELS_REGISTRY) ? window.LEVELS_REGISTRY : [];
  const item = reg.find(x => x && x.id === levelId);

  if (item) {
    // Si le niveau fournit un titre/nom et des consignes, on les affiche
    if (item.name) setZone3Title(item.name);
    if (item.consignes) { setConsignes(item.consignes); return; }
  }

  // 3) Par défaut (mode personnalisé ou niveau inconnu)
  setZone3Title(TITLE_INIT);
  setConsignes(CONSIGNE_INIT);
}

/* ==== Helpers k-partites (génériques) ==== */
function buildKPartNodes(k, n) {
  const nodes = [];
  for (let p = 1; p <= k; p++) {
    for (let i = 1; i <= n; i++) {
      nodes.push({ data: { id: `p${p}n${i}`, label: `${p}.${i}`, part: p } });
    }
  }
  return nodes;
}
function computePresetPositions(k, n) {
  const positions = {};
  const colWidth = 140, rowHeight = 70, x0 = 80, y0 = 80;
  for (let p = 1; p <= k; p++) {
    for (let i = 1; i <= n; i++) {
      positions[`p${p}n${i}`] = { x: x0 + (p - 1) * colWidth, y: y0 + (i - 1) * rowHeight };
    }
  }
  return positions;
}
function applyPresetPositions(positions) {
  cy.nodes().forEach(node => {
    const pos = positions[node.id()];
    if (pos) node.position(pos);
  });
  cy.fit(undefined, 40);
}
function refreshStats() {
  const el = document.getElementById('stats');
  if (!el) return;
  el.textContent = `${cy.nodes().length} sommets, ${cy.edges().length} arêtes`;
}

/* Layout colonnes par partie (utilisé pour tous les niveaux) */
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

/* ==== Création/Suppression d'arêtes par interaction ==== */
let firstNode = null;
function edgeExists(a, b) {
  return cy.edges(
    `[source = "${a}"][target = "${b}"], [source = "${b}"][target = "${a}"]`
  ).length > 0;
}
function enableInteractiveEdges() {
  cy.off('tap', 'node'); cy.off('tap', 'edge'); cy.off('taphold', 'edge');

  // Création par deux clics
  cy.on('tap', 'node', (evt) => {
    const node = evt.target;
    if (!firstNode) {
      firstNode = node; node.addClass('selected-node'); return;
    }
    if (firstNode.id() !== node.id()) {
      const pa = firstNode.data('part'), pb = node.data('part');
      if (pa !== pb && !edgeExists(firstNode.id(), node.id())) {
        cy.add({
          group: 'edges',
          data: { id: `u_${firstNode.id()}_${node.id()}`, source: firstNode.id(), target: node.id() }
        });
        refreshStats();
      }
    }
    firstNode.removeClass('selected-node'); firstNode = null;
  });

  // Suppression par double-tap
  let lastEdgeTap = { id: null, time: 0 };
  cy.on('tap', 'edge', (evt) => {
    const edge = evt.target, now = Date.now();
    if (lastEdgeTap.id === edge.id() && (now - lastEdgeTap.time) < 350) {
      edge.remove(); refreshStats(); lastEdgeTap = { id: null, time: 0 };
    } else {
      lastEdgeTap = { id: edge.id(), time: now };
    }
  });

  // Long press mobile
  cy.on('taphold', 'edge', (evt) => { evt.target.remove(); refreshStats(); });
}

/* ==== Bandeau "Bravo !" non bloquant ==== */
let CURRENT_CONTEXT = { mode: 'levels', levelId: 'niveau1', k: null, n: null };

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
    const k = CURRENT_CONTEXT.k ?? parseInt(document.getElementById('k').value, 10);
    const n = CURRENT_CONTEXT.n ?? parseInt(document.getElementById('n').value, 10);
    drawK(k, n);
  }
}
// API globale pour les fichiers de niveaux
window.announceWin = function (message) {
  showWinBanner(message || "Bravo ! Niveau réussi 🎉");
};

/* === Bouton "Arêtes aléatoires" : helpers === */
function setRandomButtonState() {
  if (!btnRandom) return;
  const mode = modeSel.value;
  const isLevels = mode === 'levels';
  btnRandom.disabled = isLevels;
  btnRandom.title = isLevels
    ? 'Désactivé en mode Niveaux'
    : 'Ajouter des arêtes aléatoires (inter-parties seulement)';
}

/* === Bouton "Arêtes potentielles" : affiche toutes les arêtes possibles en gris === */
function setPotentialButtonState() {
  if (!btnPotential) return;
  const isLevels = modeSel.value === 'levels';
  btnPotential.disabled = !isLevels;
  btnPotential.title = !isLevels
    ? 'Disponible uniquement en mode Niveaux'
    : 'Afficher toutes les arêtes possibles en gris';
}

function addAllPotentialEdges() {
  // Récupère toutes les arêtes existantes
  const existing = new Set();
  cy.edges().forEach(e => {
    const a = e.source().id(), b = e.target().id();
    const key = a < b ? `${a}__${b}` : `${b}__${a}`;
    existing.add(key);
  });

  // Groupe les nœuds par partie
  const byPart = {};
  cy.nodes().forEach(n => {
    const p = n.data('part');
    if (p == null) return;
    (byPart[p] ||= []).push(n.id());
  });

  // Génère toutes les arêtes possibles entre différentes parties
  const parts = Object.keys(byPart).map(Number).sort((a, b) => a - b);
  const batch = [];
  let edgeIndex = 0;

  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const A = byPart[parts[i]], B = byPart[parts[j]];
      A.forEach(a => B.forEach(b => {
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

  if (batch.length > 0) {
    cy.add(batch);
    refreshStats();
  }
}
function addRandomEdges() {
  const existing = new Set();
  cy.edges().forEach(e => {
    const a = e.source().id(), b = e.target().id();
    const key = a < b ? `${a}__${b}` : `${b}__${a}`;
    existing.add(key);
  });
  const byPart = {};
  cy.nodes().forEach(n => {
    const p = n.data('part'); if (p == null) return;
    (byPart[p] ||= []).push(n.id());
  });
  const candidates = [];
  const parts = Object.keys(byPart).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const A = byPart[parts[i]], B = byPart[parts[j]];
      A.forEach(a => B.forEach(b => {
        const key = a < b ? `${a}__${b}` : `${b}__${a}`;
        if (!existing.has(key)) candidates.push(key);
      }));
    }
  }
  if (candidates.length === 0) return;
  const target = Math.max(1, Math.round(candidates.length * 0.5));
  const chosen = new Set();
  while (chosen.size < target) {
    chosen.add(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  const batch = []; let i = 0;
  chosen.forEach(key => {
    const [s, t] = key.split('__');
    batch.push({ group: 'edges', data: { id: `ra_${key}_${i++}`, source: s, target: t } });
  });
  cy.add(batch); refreshStats();
}

/* ==== Dessin principal (mode éditeur) ==== */
function initEditor() {
  CURRENT_CONTEXT = { mode: 'editor', levelId: null, k: null, n: null };
  hideWinBanner();
  setZone3Title("Éditeur de graphe");
  setConsignes("Créez votre propre graphe en ajoutant des nœuds et en reliant les sommets. Utilisez le panneau de droite pour ajouter des nœuds par partie, puis cliquez sur deux nœuds pour créer une arête.");
  refreshStats();
  enableInteractiveEdges();
}

/* ==== Gestion des nœuds ==== */
let nodeCounter = 0;

function addNode() {
  const part = parseInt(nodePartInput.value, 10) || 1;
  const label = nodeLabelInput.value.trim() || `N${++nodeCounter}`;
  const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  cy.add({
    group: 'nodes',
    data: { id, label, part, order: cy.nodes().filter(n => n.data('part') === part).length + 1 }
  });
  
  applyColumnsByPart();
  refreshStats();
  nodeLabelInput.value = '';
  nodeLabelInput.focus();
}

function deleteSelectedNodes() {
  const selected = cy.$(':selected');
  if (selected.length === 0) {
    alert('Veuillez sélectionner un ou plusieurs nœuds à supprimer (cliquez dessus)');
    return;
  }
  if (confirm(`Supprimer ${selected.length} nœud(s) sélectionné(s) ?`)) {
    selected.remove();
    refreshStats();
  }
}

/* ==== Import/Export JSON ==== */
function exportGraphToJSON() {
  const nodes = cy.nodes().map(node => ({
    id: node.id(),
    label: node.data('label'),
    part: node.data('part'),
    order: node.data('order'),
    position: node.position()
  }));
  
  const edges = cy.edges().map(edge => ({
    id: edge.id(),
    source: edge.source().id(),
    target: edge.target().id(),
    classes: edge.classes().join(' ')
  }));
  
  const graphData = {
    version: '1.0',
    metadata: {
      name: 'Graphe personnalisé',
      created: new Date().toISOString(),
      nodes_count: nodes.length,
      edges_count: edges.length
    },
    nodes,
    edges
  };
  
  const jsonStr = JSON.stringify(graphData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `graphe_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importGraphFromJSON(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Format JSON invalide : propriété "nodes" manquante');
    }
    
    cy.elements().remove();
    
    // Ajouter les nœuds
    data.nodes.forEach(node => {
      cy.add({
        group: 'nodes',
        data: {
          id: node.id,
          label: node.label,
          part: node.part || 1,
          order: node.order || 0
        },
        position: node.position || { x: 100, y: 100 }
      });
    });
    
    // Ajouter les arêtes
    if (data.edges && Array.isArray(data.edges)) {
      data.edges.forEach(edge => {
        cy.add({
          group: 'edges',
          data: {
            id: edge.id || `e_${edge.source}_${edge.target}`,
            source: edge.source,
            target: edge.target
          },
          classes: edge.classes || ''
        });
      });
    }
    
    cy.fit(undefined, 40);
    refreshStats();
    enableInteractiveEdges();
    
    alert(`Graphe importé avec succès !\n${data.nodes.length} nœuds, ${data.edges?.length || 0} arêtes`);
  } catch (error) {
    alert(`Erreur lors de l'import : ${error.message}`);
    console.error('Erreur import JSON:', error);
  }
}

/* ==== Templates de graphes ==== */
const GRAPH_TEMPLATES = {
  bipartite_3_3: {
    name: 'Bipartite K₂,₃',
    nodes: [
      { id: 'a1', label: 'A1', part: 1, order: 1 },
      { id: 'a2', label: 'A2', part: 1, order: 2 },
      { id: 'b1', label: 'B1', part: 2, order: 1 },
      { id: 'b2', label: 'B2', part: 2, order: 2 },
      { id: 'b3', label: 'B3', part: 2, order: 3 }
    ],
    edges: []
  },
  tripartite_2_2_2: {
    name: 'Tripartite 2-2-2',
    nodes: [
      { id: 'a1', label: 'A1', part: 1, order: 1 },
      { id: 'a2', label: 'A2', part: 1, order: 2 },
      { id: 'b1', label: 'B1', part: 2, order: 1 },
      { id: 'b2', label: 'B2', part: 2, order: 2 },
      { id: 'c1', label: 'C1', part: 3, order: 1 },
      { id: 'c2', label: 'C2', part: 3, order: 2 }
    ],
    edges: []
  },
  star_5: {
    name: 'Étoile 5 branches',
    nodes: [
      { id: 'center', label: 'Centre', part: 1, order: 1 },
      { id: 's1', label: '1', part: 2, order: 1 },
      { id: 's2', label: '2', part: 2, order: 2 },
      { id: 's3', label: '3', part: 2, order: 3 },
      { id: 's4', label: '4', part: 2, order: 4 },
      { id: 's5', label: '5', part: 2, order: 5 }
    ],
    edges: [
      { source: 'center', target: 's1' },
      { source: 'center', target: 's2' },
      { source: 'center', target: 's3' },
      { source: 'center', target: 's4' },
      { source: 'center', target: 's5' }
    ]
  },
  cycle_6: {
    name: 'Cycle 6 nœuds',
    nodes: [
      { id: 'n1', label: '1', part: 1, order: 1 },
      { id: 'n2', label: '2', part: 1, order: 2 },
      { id: 'n3', label: '3', part: 1, order: 3 },
      { id: 'n4', label: '4', part: 1, order: 4 },
      { id: 'n5', label: '5', part: 1, order: 5 },
      { id: 'n6', label: '6', part: 1, order: 6 }
    ],
    edges: [
      { source: 'n1', target: 'n2' },
      { source: 'n2', target: 'n3' },
      { source: 'n3', target: 'n4' },
      { source: 'n4', target: 'n5' },
      { source: 'n5', target: 'n6' },
      { source: 'n6', target: 'n1' }
    ]
  },
  complete_4: {
    name: 'Complet K₄',
    nodes: [
      { id: 'a', label: 'A', part: 1, order: 1 },
      { id: 'b', label: 'B', part: 1, order: 2 },
      { id: 'c', label: 'C', part: 1, order: 3 },
      { id: 'd', label: 'D', part: 1, order: 4 }
    ],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
      { source: 'a', target: 'd' },
      { source: 'b', target: 'c' },
      { source: 'b', target: 'd' },
      { source: 'c', target: 'd' }
    ]
  }
};

function loadTemplate(templateId) {
  const template = GRAPH_TEMPLATES[templateId];
  if (!template) {
    alert('Template non trouvé');
    return;
  }
  
  cy.elements().remove();
  
  // Ajouter les nœuds
  template.nodes.forEach(node => {
    cy.add({
      group: 'nodes',
      data: {
        id: node.id,
        label: node.label,
        part: node.part,
        order: node.order
      }
    });
  });
  
  // Ajouter les arêtes
  template.edges.forEach((edge, idx) => {
    cy.add({
      group: 'edges',
      data: {
        id: `e${idx}`,
        source: edge.source,
        target: edge.target
      }
    });
  });
  
  applyColumnsByPart();
  refreshStats();
  enableInteractiveEdges();
  
  setZone3Title(template.name);
  setConsignes(`Template chargé : ${template.name}. Vous pouvez maintenant modifier ce graphe en ajoutant ou supprimant des nœuds et arêtes.`);
}

/* ==== NIVEAU 1 (local) ==== */
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
  applyColumnsByPart();
  refreshStats();
  enableInteractiveEdges();

  // vérification auto (niveau 1) -> bandeau non bloquant
  const sol1 = [
    ["riri", "hamster"],
    ["fifi", "peroquet"],
    ["loulou", "chat"]
  ];
  const check1 = () => {
    const edges = cy.edges().map(e => [e.source().id(), e.target().id()]);
    const ok = sol1.every(sol =>
      edges.some(e =>
        (e[0] === sol[0] && e[1] === sol[1]) ||
        (e[0] === sol[1] && e[1] === sol[0])
      )
    );
    if (ok && edges.length === sol1.length) announceWin("Bravo ! Tu as réussi le niveau 1 🎉");
  };
  cy.off('add', 'edge', check1); cy.on('add', 'edge', check1);
  cy.off('remove', 'edge', check1); cy.on('remove', 'edge', check1);
}

/* ==== Niveaux (références) ==== */
const LEVELS = [
  { id: 'niveau1', name: 'Niveau 1 – Les neveux et leurs animaux' },
  { id: 'niveau2', name: 'Niveau 2 – Chiens et Niches' },
  { id: 'niveau3', name: 'Niveau 3 – Interrupteurs & Projecteurs' },
  { id: 'niveau4', name: 'Niveau 4 – Un Village d\'Irréductibles Gaulois' },
  { id: 'niveau5', name: 'Niveau 5 – Course avec des animaux' },
  { id: 'niveau6', name: 'Niveau 6 – Motos, Casques & Pilotes' }
];

/* Fusion robuste de LEVELS + LEVELS_REGISTRY */
function ensureLevelOptions() {
  if (!levelSel) return;
  const prev = levelSel.value;

  const base = Array.isArray(LEVELS) ? LEVELS : [];
  const reg = Array.isArray(window.LEVELS_REGISTRY) ? window.LEVELS_REGISTRY : [];

  const map = new Map();
  base.forEach(l => { if (l?.id) map.set(l.id, { id: l.id, name: l.name || l.id }); });
  reg.forEach(l => { if (l?.id) map.set(l.id, { id: l.id, name: l.name || l.id }); });

  levelSel.innerHTML = '';
  [...map.values()].forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.name;
    levelSel.appendChild(opt);
  });

  if (prev && map.has(prev)) levelSel.value = prev;
  else if (map.has('niveau1')) levelSel.value = 'niveau1';
}

function drawLevel(levelId) {
  CURRENT_CONTEXT = { mode: 'levels', levelId, k: null, n: null };
  hideWinBanner();

  setConsignesForLevel(levelId);
  if (levelId === 'niveau1') { initNiveau1(); return; }
  if (levelId === 'niveau2' && typeof window.initNiveau2 === 'function') { window.initNiveau2(); return; }
  if (levelId === 'niveau3' && typeof window.initNiveau3 === 'function') { window.initNiveau3(); return; }
  if (levelId === 'niveau4' && typeof window.initNiveau4 === 'function') { window.initNiveau4(); return; }
  if (levelId === 'niveau5' && typeof window.initNiveau5 === 'function') { window.initNiveau5(); return; }
  if (levelId === 'niveau6' && typeof window.initNiveau6 === 'function') { window.initNiveau6(); return; }
}

/* ==== UI ==== */
modeSel.addEventListener('change', () => {
  const mode = modeSel.value;
  
  // Afficher/masquer les contrôles selon le mode
  if (editorControls) editorControls.classList.toggle('hidden', mode !== 'editor');
  if (levelControls) levelControls.classList.toggle('hidden', mode !== 'levels');
  if (templateControls) templateControls.classList.toggle('hidden', mode !== 'templates');
  
  if (mode === 'levels') {
    ensureLevelOptions();
    if (levelSel && levelSel.value) setConsignesForLevel(levelSel.value);
  } else if (mode === 'editor') {
    initEditor();
  } else if (mode === 'templates') {
    setZone3Title('Templates de graphes');
    setConsignes('Choisissez un template prédéfini pour commencer rapidement. Vous pourrez ensuite le personnaliser.');
  }
  
  setRandomButtonState();
  setPotentialButtonState();
});

/* ==== Event listeners pour l'éditeur ==== */
if (btnAddNode) {
  btnAddNode.addEventListener('click', addNode);
}

if (nodeLabelInput) {
  nodeLabelInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNode();
    }
  });
}

if (btnDeleteNode) {
  btnDeleteNode.addEventListener('click', deleteSelectedNodes);
}

if (btnExportJSON) {
  btnExportJSON.addEventListener('click', () => {
    if (cy.nodes().length === 0) {
      alert('Le graphe est vide. Ajoutez des nœuds avant d\'exporter.');
      return;
    }
    exportGraphToJSON();
  });
}

if (btnImportJSON) {
  btnImportJSON.addEventListener('click', () => {
    fileInput.click();
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importGraphFromJSON(event.target.result);
      } catch (error) {
        alert(`Erreur lors de la lecture du fichier : ${error.message}`);
      }
    };
    reader.readAsText(file);
    fileInput.value = ''; // Reset pour permettre de réimporter le même fichier
  });
}

if (btnLoadLevel) {
  btnLoadLevel.addEventListener('click', () => {
    const id = (levelSel && levelSel.value) ? levelSel.value : 'niveau1';
    drawLevel(id);
  });
}

if (btnLoadTemplate) {
  btnLoadTemplate.addEventListener('click', () => {
    const templateId = templateSel.value;
    if (!templateId) {
      alert('Veuillez choisir un template');
      return;
    }
    loadTemplate(templateId);
  });
}

// Bouton "Arêtes aléatoires" : actif en mode éditeur et templates
if (btnRandom) {
  btnRandom.addEventListener('click', () => {
    if (modeSel.value === 'levels') return;
    if (cy.nodes().length === 0) {
      alert('Ajoutez des nœuds d\'abord ou chargez un template');
      return;
    }
    addRandomEdges();
  });
}

// Bouton "Arêtes potentielles" : actif uniquement en mode Niveaux
if (btnPotential) {
  btnPotential.addEventListener('click', () => {
    if (modeSel.value !== 'levels') return;
    if (cy.nodes().length === 0) return;
    
    // Vérifie s'il y a des arêtes grises
    const greyEdges = cy.edges('.edge-grey');
    if (greyEdges.length > 0) {
      // Si des arêtes grises existent, les supprimer
      greyEdges.remove();
      refreshStats();
    } else {
      // Sinon, les ajouter
      addAllPotentialEdges();
    }
  });
}

document.getElementById('btnClear').addEventListener('click', () => {
  cy.elements().remove(); refreshStats();
});

document.getElementById('btnLayout').addEventListener('click', () => {
  applyColumnsByPart();
});

document.getElementById('btnFit').addEventListener('click', () => {
  cy.fit(undefined, 20);
});

// Modale
document.getElementById('openHelp').addEventListener('click', () => help.showModal());
document.getElementById('closeHelp').addEventListener('click', () => help.close());

/* ==== Démarrage ==== */
initEditor();
setRandomButtonState();
setPotentialButtonState();


/* ============================================================
   AJOUT FONCTIONNEL — Sélecteur de couleur pour les arêtes (Niveaux)
   (À coller à la fin de script.js — aucune modif du code existant)
   ============================================================ */

/* 1) Styles Cytoscape pour les arêtes colorées (ajout non intrusif) */
try {
  cy.style()
    .selector('edge.edge-green').style({ 'line-color': '#22c55e', 'target-arrow-color': '#22c55e', 'width': 3 })
    .selector('edge.edge-red').style({ 'line-color': '#ef4444', 'target-arrow-color': '#ef4444', 'width': 3 })
    .selector('edge.edge-grey').style({ 'line-color': '#9ca3af', 'target-arrow-color': '#9ca3af', 'width': 3 })
    .update();
} catch (e) {
  // silencieux si déjà défini
}

/* 2) Bouton UI injecté dynamiquement (s’affiche en mode Niveaux) */
(function setupEdgeColorButton() {
  const btnRow = document.getElementById('btnRandom')?.parentElement;
  if (!btnRow) return;

  // Crée le bouton (sans modifier le HTML source)
  const btnEdgeColor = document.createElement('button');
  btnEdgeColor.id = 'btnEdgeColor';
  btnEdgeColor.className = 'ghost';
  btnEdgeColor.style.transition = 'background-color .2s, color .2s, border-color .2s';
  btnEdgeColor.style.marginLeft = '6px';
  btnEdgeColor.textContent = 'Pose : Gris'; // état initial

  // Insère juste après "Arêtes aléatoires"
  if (document.getElementById('btnRandom')?.nextSibling) {
    btnRow.insertBefore(btnEdgeColor, document.getElementById('btnRandom').nextSibling);
  } else {
    btnRow.appendChild(btnEdgeColor);
  }

  /* 3) État & helpers */
  let edgePlacementColor = 'grey'; // 'green' | 'red' | 'grey'
  const COLOR_SEQUENCE = ['green', 'red', 'grey'];

  const isLevelsContext = () => {
    // On se base sur CURRENT_CONTEXT (utilisé par ton code) si dispo,
    // sinon on tombe sur la valeur du <select id="mode">
    try {
      return (typeof CURRENT_CONTEXT === 'object' && CURRENT_CONTEXT?.mode === 'levels')
        || (document.getElementById('mode')?.value === 'levels');
    } catch { return (document.getElementById('mode')?.value === 'levels'); }
  };

  function applyBtnVisual() {
    // Reset style
    btnEdgeColor.style.removeProperty('background');
    btnEdgeColor.style.removeProperty('color');
    btnEdgeColor.style.removeProperty('border-color');

    if (!isLevelsContext()) {
      // Caché en mode personnalisé
      btnEdgeColor.style.display = 'none';
      return;
    }
    btnEdgeColor.style.display = '';

    if (edgePlacementColor === 'green') {
      btnEdgeColor.textContent = 'Pose : Vert';
      btnEdgeColor.style.background = '#22c55e';
      btnEdgeColor.style.color = '#0b3517';
      btnEdgeColor.style.borderColor = '#16a34a';
    } else if (edgePlacementColor === 'red') {
      btnEdgeColor.textContent = 'Pose : Rouge';
      btnEdgeColor.style.background = '#ef4444';
      btnEdgeColor.style.color = '#3b0a0a';
      btnEdgeColor.style.borderColor = '#dc2626';
    } else {
      btnEdgeColor.textContent = 'Pose : Gris';
      btnEdgeColor.style.background = '#9ca3af';
      btnEdgeColor.style.color = '#111827';
      btnEdgeColor.style.borderColor = '#6b7280';
    }
  }

  function cyclePlacementColor() {
    const i = COLOR_SEQUENCE.indexOf(edgePlacementColor);
    edgePlacementColor = COLOR_SEQUENCE[(i + 1) % COLOR_SEQUENCE.length];
    applyBtnVisual();
  }

  btnEdgeColor.addEventListener('click', cyclePlacementColor);

  // Réagit aux changements de mode (on ajoute un listener supplémentaire, sans toucher l’existant)
  document.getElementById('mode')?.addEventListener('change', applyBtnVisual);

  // Appel initial
  applyBtnVisual();

  /* 4) Coloration des nouvelles arêtes posées en mode Niveaux (sans toucher à enableInteractiveEdges) */
  cy.on('add', 'edge', (evt) => {
    if (!isLevelsContext()) return;

    const e = evt.target;
    // Si une classe couleur n'est pas encore définie, on applique la couleur courante
    if (!(e.hasClass('edge-green') || e.hasClass('edge-red') || e.hasClass('edge-grey'))) {
      const cls = edgePlacementColor === 'green' ? 'edge-green'
        : edgePlacementColor === 'red' ? 'edge-red'
          : 'edge-grey';
      e.addClass(cls);
      e.data('state', edgePlacementColor);
    }
  });

  /* 5) Expose (optionnel) une validation couleur si tu veux la brancher plus tard */
  window.colorValidationOK = function () {
    const edges = cy.edges();
    if (edges.length === 0) return false;
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (e.hasClass('edge-red') || e.hasClass('edge-grey')) return false;
    }
    return true; // toutes vertes
  };

  // Petite synchronisation à chaque (ré)affichage de niveau ou graphe
  // (au cas où CURRENT_CONTEXT change sans changer <select id="mode">)
  const syncInterval = setInterval(() => {
    // si la page se décharge, on arrête
    if (!document.body.contains(btnEdgeColor)) { clearInterval(syncInterval); return; }
    applyBtnVisual();
  }, 400);
})();



/* ============================================================
   AJOUT : cacher #btnRandom uniquement en mode Niveaux
   (Aucun changement du code existant, simple ajout non intrusif)
   ============================================================ */
(function hideRandomButtonInLevels(){
  const btn = document.getElementById('btnRandom');
  if (!btn) return;

  function isLevelsContext() {
    // Priorité au contexte courant s'il existe
    if (typeof CURRENT_CONTEXT === 'object' && CURRENT_CONTEXT && 'mode' in CURRENT_CONTEXT) {
      return CURRENT_CONTEXT.mode === 'levels';
    }
    // Fallback sur la valeur du <select id="mode">
    const modeSel = document.getElementById('mode');
    return modeSel && modeSel.value === 'levels';
    }

  function updateVisibility() {
    btn.style.display = isLevelsContext() ? 'none' : '';
  }

  // 1) Mise à jour immédiate
  updateVisibility();

  // 2) Réagit si l’utilisateur change le <select id="mode">
  document.getElementById('mode')?.addEventListener('change', updateVisibility);

  // 3) Se synchronise quand drawLevel / drawK sont appelées (sans modifier ces fonctions)
  if (typeof window.drawLevel === 'function') {
    const _drawLevel = window.drawLevel;
    window.drawLevel = function(...args) {
      const out = _drawLevel.apply(this, args);
      updateVisibility();
      return out;
    };
  }
  if (typeof window.drawK === 'function') {
    const _drawK = window.drawK;
    window.drawK = function(...args) {
      const out = _drawK.apply(this, args);
      updateVisibility();
      return out;
    };
  }

  // 4) Filet de sécurité : petite vérif périodique (cas init où le select reste sur "custom")
  const iv = setInterval(() => {
    if (!document.body.contains(btn)) { clearInterval(iv); return; }
    updateVisibility();
  }, 400);
})();