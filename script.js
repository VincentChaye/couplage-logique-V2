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
      selector: 'node.level-node', style: {
        'text-valign': 'center',
        'text-halign': 'right',
        'text-margin-x': -10
      }
    },
    {
      selector: 'edge', style: {
        'width': 3,
        'line-color': '#16a34a',
        'curve-style': 'bezier'
      }
    },
    {
      selector: 'edge.potential', style: {
        'width': 1,
        'line-color': '#d1d5db',
        'line-style': 'dashed',
        'opacity': 0.4
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
const modeSel        = document.getElementById('mode');
const customControls = document.getElementById('custom-controls');
const levelControls  = document.getElementById('level-controls');
const kSel           = document.getElementById('k');
const nSel           = document.getElementById('n');
const levelSel       = document.getElementById('level');
const btnRandom      = document.getElementById('btnRandom');
const help           = document.getElementById('help');

/* ==== Zone 3 : titre & consignes (par défaut pour le mode personnalisé) ==== */
const TITLE_EL      = document.querySelector('#zone-3 h1');
const CONSIGNE_EL   = document.querySelector('#zone-3 p');
const TITLE_INIT    = TITLE_EL ? TITLE_EL.textContent : '';
const CONSIGNE_INIT = CONSIGNE_EL ? CONSIGNE_EL.innerHTML : '';
function setZone3Title(text){ if(TITLE_EL) TITLE_EL.textContent = text; }
function setConsignes(html){ if(CONSIGNE_EL) CONSIGNE_EL.innerHTML = html; }

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
function buildKPartNodes(k, n){
  const nodes=[];
  for(let p=1;p<=k;p++){
    for(let i=1;i<=n;i++){
      nodes.push({ data:{ id:`p${p}n${i}`, label:`${p}.${i}`, part:p }});
    }
  }
  return nodes;
}

/* Calcul positions géométriques (triangle, carré, pentagone, hexagone) */
function computeGeometricPositions(k, n){
  const positions = {};
  const radius = 200;
  const centerX = 350, centerY = 300;
  
  // Placer k groupes en cercle (forme régulière)
  for(let p=1; p<=k; p++){
    const angle = (2 * Math.PI * (p-1)) / k - Math.PI/2; // -90° pour commencer en haut
    const groupX = centerX + radius * Math.cos(angle);
    const groupY = centerY + radius * Math.sin(angle);
    
    // Dans chaque groupe, disposer les n sommets en ligne
    const offset = 50;
    for(let i=1; i<=n; i++){
      const localOffset = (i - (n+1)/2) * offset;
      // Calculer la perpendiculaire pour disposer les nœuds
      const perpAngle = angle + Math.PI/2;
      positions[`p${p}n${i}`] = {
        x: groupX + localOffset * Math.cos(perpAngle),
        y: groupY + localOffset * Math.sin(perpAngle)
      };
    }
  }
  return positions;
}

function computePresetPositions(k, n){
  const positions = {};
  const colWidth = 140, rowHeight = 70, x0 = 80, y0 = 80;
  for(let p=1;p<=k;p++){
    for(let i=1;i<=n;i++){
      positions[`p${p}n${i}`] = { x: x0 + (p-1)*colWidth, y: y0 + (i-1)*rowHeight };
    }
  }
  return positions;
}
function applyPresetPositions(positions){
  cy.nodes().forEach(node=>{
    const pos = positions[node.id()];
    if(pos) node.position(pos);
  });
  cy.fit(undefined, 40);
}
function refreshStats(){
  const el = document.getElementById('stats');
  if(!el) return;
  el.textContent = `${cy.nodes().length} sommets, ${cy.edges().length} arêtes`;
}

/* Layout colonnes par partie (utilisé pour tous les niveaux) */
function applyColumnsByPart(){
  const colWidth = 140, rowHeight = 70, x0 = 80, y0 = 80;
  const groups = {};
  cy.nodes().forEach(n=>{
    const p = n.data('part') || 1;
    (groups[p] ||= []).push(n);
  });
  const parts = Object.keys(groups).map(Number).sort((a,b)=>a-b);
  parts.forEach((p, colIndex)=>{
    groups[p].sort((a,b)=>{
      const oa = a.data('order') ?? a.id();
      const ob = b.data('order') ?? b.id();
      return (oa > ob) - (oa < ob);
    });
    groups[p].forEach((node, rowIndex)=>{
      node.position({ x: x0 + colIndex*colWidth, y: y0 + rowIndex*rowHeight });
    });
  });
  cy.fit(undefined, 40);
}

/* ==== Création/Suppression d'arêtes par interaction ==== */
let firstNode = null;
function edgeExists(a,b){
  return cy.edges(
    `[source = "${a}"][target = "${b}"], [source = "${b}"][target = "${a}"]`
  ).length > 0;
}
function enableInteractiveEdges(){
  cy.off('tap','node'); cy.off('tap','edge'); cy.off('taphold','edge');

  // Création par deux clics
  cy.on('tap','node',(evt)=>{
    const node = evt.target;
    if(!firstNode){
      firstNode = node; node.addClass('selected-node'); return;
    }
    if(firstNode.id() !== node.id()){
      const pa = firstNode.data('part'), pb = node.data('part');
      if(pa !== pb && !edgeExists(firstNode.id(), node.id())){
        cy.add({ group:'edges',
          data:{ id:`u_${firstNode.id()}_${node.id()}`, source:firstNode.id(), target:node.id(), edgeType:'user' }
        });
        refreshStats();
      }
    }
    firstNode.removeClass('selected-node'); firstNode = null;
  });

  // Suppression par double-tap (seulement arêtes non-potentielles)
  let lastEdgeTap = { id:null, time:0 };
  cy.on('tap','edge',(evt)=>{
    const edge = evt.target, now = Date.now();
    if(edge.hasClass('potential')) return; // Ignorer les arêtes potentielles
    if(lastEdgeTap.id === edge.id() && (now - lastEdgeTap.time) < 350){
      edge.remove(); refreshStats(); lastEdgeTap = { id:null, time:0 };
    }else{
      lastEdgeTap = { id:edge.id(), time:now };
    }
  });

  // Long press mobile
  cy.on('taphold','edge',(evt)=>{ 
    if(!evt.target.hasClass('potential')) {
      evt.target.remove(); refreshStats(); 
    }
  });
}

/* ==== Bandeau "Bravo !" non bloquant ==== */
let CURRENT_CONTEXT = { mode:'levels', levelId:'niveau1', k:null, n:null };

function ensureWinBanner(){
  let banner = document.getElementById('win-banner');
  if(!banner){
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
    banner.querySelector('#wbReplay').addEventListener('click', ()=>{
      (banner._replay || defaultReplay)();
      hideWinBanner();
    });
  }
  return banner;
}
function showWinBanner(text, replayFn){
  const b = ensureWinBanner();
  b.querySelector('.wb-text').innerHTML = text || "Bravo ! Niveau réussi 🎉";
  b._replay = replayFn || defaultReplay;
  b.classList.remove('hidden');
}
function hideWinBanner(){
  const b = document.getElementById('win-banner');
  if(b) b.classList.add('hidden');
}
function defaultReplay(){
  if(CURRENT_CONTEXT.mode === 'levels' && CURRENT_CONTEXT.levelId){
    drawLevel(CURRENT_CONTEXT.levelId);
  }else{
    const k = CURRENT_CONTEXT.k ?? parseInt(document.getElementById('k').value,10);
    const n = CURRENT_CONTEXT.n ?? parseInt(document.getElementById('n').value,10);
    drawK(k, n);
  }
}
// API globale pour les fichiers de niveaux
window.announceWin = function(message){
  showWinBanner(message || "Bravo ! Niveau réussi 🎉");
};

/* === Gestion visibilité des outils selon le mode === */
function updateToolsVisibility(){
  const isCustom = modeSel.value === 'custom';
  const tools1 = document.getElementById('custom-tools');
  const tools2 = document.getElementById('custom-tools-2');
  if(tools1) tools1.style.display = isCustom ? 'flex' : 'none';
  if(tools2) tools2.style.display = isCustom ? 'flex' : 'none';
}

/* ==== Gestion des arêtes potentielles ==== */
let potentialEdgesVisible = false;

function togglePotentialEdges() {
  if (potentialEdgesVisible) {
    // Masquer et supprimer les arêtes potentielles
    cy.edges('.potential').remove();
    potentialEdgesVisible = false;
  } else {
    // Afficher toutes les arêtes potentielles
    const potential = [];
    const byPart = {};
    cy.nodes().forEach(n => {
      const p = n.data('part');
      if (p != null) (byPart[p] ||= []).push(n.id());
    });
    
    const parts = Object.keys(byPart).map(Number).sort((a,b)=>a-b);
    let edgeId = 0;
    for(let i=0; i<parts.length; i++){
      for(let j=i+1; j<parts.length; j++){
        const A = byPart[parts[i]], B = byPart[parts[j]];
        A.forEach(a => B.forEach(b => {
          if(!edgeExists(a, b)){
            potential.push({
              group: 'edges',
              data: { id: `pot_${edgeId++}`, source: a, target: b, edgeType: 'potential' },
              classes: 'potential'
            });
          }
        }));
      }
    }
    cy.add(potential);
    potentialEdgesVisible = true;
  }
  updatePotentialButtonText();
}

function updatePotentialButtonText() {
  const btn = document.getElementById('btnPotential');
  if (btn) {
    btn.textContent = potentialEdgesVisible ? 'Masquer arêtes potentielles' : 'Afficher arêtes potentielles';
  }
}

/* ==== Export/Import JSON ==== */
function exportGraph() {
  const nodes = cy.nodes().map(n => ({
    id: n.id(),
    label: n.data('label'),
    part: n.data('part'),
    x: n.position('x'),
    y: n.position('y')
  }));
  const edges = cy.edges().not('.potential').map(e => ({
    source: e.source().id(),
    target: e.target().id()
  }));
  
  const data = { nodes, edges };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'graphe.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importGraph() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        cy.elements().remove();
        
        // Ajouter les nœuds
        data.nodes.forEach(n => {
          cy.add({
            group: 'nodes',
            data: { id: n.id, label: n.label, part: n.part },
            position: { x: n.x, y: n.y }
          });
        });
        
        // Ajouter les arêtes
        data.edges.forEach((e, i) => {
          cy.add({
            group: 'edges',
            data: { id: `e_${i}`, source: e.source, target: e.target }
          });
        });
        
        refreshStats();
        cy.fit(undefined, 40);
      } catch (err) {
        alert('Erreur lors de l\'import du fichier : ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function renameNode() {
  const selected = cy.nodes(':selected');
  if (selected.length === 0) {
    alert('Veuillez sélectionner un sommet à renommer');
    return;
  }
  const node = selected[0];
  const newLabel = prompt('Nouveau nom du sommet :', node.data('label'));
  if (newLabel && newLabel.trim()) {
    node.data('label', newLabel.trim());
  }
}

/* ==== Dessin principal (mode personnalisé) ==== */
function drawK(k, n) {
  CURRENT_CONTEXT = { mode:'custom', levelId:null, k, n };
  hideWinBanner();
  potentialEdgesVisible = false;
  updatePotentialButtonText();

  setZone3Title(TITLE_INIT);
  setConsignes(CONSIGNE_INIT);
  cy.elements().remove();
  cy.add(buildKPartNodes(k, n));
  applyPresetPositions(computeGeometricPositions(k, n));
  refreshStats();
  enableInteractiveEdges();
}

/* ==== NIVEAU 1 (local) ==== */
function initNiveau1() {
  setConsignesForLevel('niveau1');
  cy.elements().remove();
  cy.add([
    { data: { id: 'riri',    label: 'Riri',     part: 1, order: 1 }, classes: 'level-node' },
    { data: { id: 'fifi',    label: 'Fifi',     part: 1, order: 2 }, classes: 'level-node' },
    { data: { id: 'loulou',  label: 'Loulou',   part: 1, order: 3 }, classes: 'level-node' },
    { data: { id: 'chat',     label: 'Chat',      part: 2, order: 1 }, classes: 'level-node' },
    { data: { id: 'hamster',  label: 'Hamster',   part: 2, order: 2 }, classes: 'level-node' },
    { data: { id: 'peroquet', label: 'Perroquet', part: 2, order: 3 }, classes: 'level-node' },
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
    const edges = cy.edges().not('.potential').map(e => [e.source().id(), e.target().id()]);
    const ok = sol1.every(sol =>
      edges.some(e =>
        (e[0] === sol[0] && e[1] === sol[1]) ||
        (e[0] === sol[1] && e[1] === sol[0])
      )
    );
    if (ok && edges.length === sol1.length) announceWin("Bravo ! Tu as réussi le niveau 1 🎉");
  };
  cy.off('add', 'edge', check1);  cy.on('add', 'edge', check1);
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
function ensureLevelOptions(){
  if(!levelSel) return;
  const prev = levelSel.value;

  const base = Array.isArray(LEVELS) ? LEVELS : [];
  const reg  = Array.isArray(window.LEVELS_REGISTRY) ? window.LEVELS_REGISTRY : [];

  const map = new Map();
  base.forEach(l => { if(l?.id) map.set(l.id, { id:l.id, name:l.name || l.id }); });
  reg.forEach(l  => { if(l?.id) map.set(l.id, { id:l.id, name:l.name || l.id }); });

  levelSel.innerHTML = '';
  [...map.values()].forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.name;
    levelSel.appendChild(opt);
  });

  if(prev && map.has(prev)) levelSel.value = prev;
  else if (map.has('niveau1')) levelSel.value = 'niveau1';
}

function drawLevel(levelId) {
  CURRENT_CONTEXT = { mode:'levels', levelId, k:null, n:null };
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
  const isLevels = modeSel.value === 'levels';
  if (customControls) customControls.classList.toggle('hidden', isLevels);
  if (levelControls) levelControls.classList.toggle('hidden', !isLevels);
  if (isLevels) {
    ensureLevelOptions();
    if (levelSel && levelSel.value) setConsignesForLevel(levelSel.value);
  } else {
    setZone3Title(TITLE_INIT);
    setConsignes(CONSIGNE_INIT);
  }
  updateToolsVisibility();
});

document.getElementById('btnBuild').addEventListener('click', () => {
  if (modeSel.value === 'levels') {
    const id = (levelSel && levelSel.value) ? levelSel.value : 'niveau1';
    drawLevel(id);
  } else {
    drawK(parseInt(kSel.value, 10), parseInt(nSel.value, 10));
  }
});

// Bouton "Arêtes potentielles"
document.getElementById('btnPotential').addEventListener('click', () => {
  if (cy.nodes().length === 0) {
    if (modeSel.value !== 'levels') {
      const k = parseInt(kSel.value, 10);
      const n = parseInt(nSel.value, 10);
      drawK(k, n);
    }
  }
  togglePotentialEdges();
});

// Nouveaux boutons Export/Import/Rename
document.getElementById('btnExport').addEventListener('click', exportGraph);
document.getElementById('btnImport').addEventListener('click', importGraph);
document.getElementById('btnRename').addEventListener('click', renameNode);

document.getElementById('btnClear').addEventListener('click', () => {
  cy.elements().remove(); refreshStats();
});

document.getElementById('btnLayout').addEventListener('click', () => {
  if (modeSel.value === 'levels') {
    applyColumnsByPart(); // même layout pour les niveaux
  } else {
    applyPresetPositions(computeGeometricPositions(parseInt(kSel.value, 10), parseInt(nSel.value, 10)));
  }
});

document.getElementById('btnFit').addEventListener('click', () => {
  cy.fit(undefined, 20);
});

// Modale
document.getElementById('openHelp').addEventListener('click', () => help.showModal());
document.getElementById('closeHelp').addEventListener('click', () => help.close());

/* ==== Démarrage ==== */
drawLevel('niveau1');
updateToolsVisibility();
