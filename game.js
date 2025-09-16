
const usedQuestions = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() };
const MAX_UNIQUE_TRIES = 50; 
const availableEmojis = [ 
  '🚀', '⭐️', '⚡️', '❤️', '🎉', '🌟', 
  '👾', '👽', '🤖', '👑', '🔥', '💧', '☀️', 
  '🌸', '🦖', '🍎', '🍕', '🍩', '🍔', '🍓', 
  '🐱', '🐶', '🐼', '🐸', '🐧', 
  '🚗', '🚌', '🚲', '✈️', '🚤', 
  '⚽️', '🏀', '🏆', '🎮', '🎲'  
];

const playerBaseData = [
  { color: 'bg-blue-500', bgGradient: 'from-blue-400 to-blue-600' },
  { color: 'bg-pink-500', bgGradient: 'from-pink-400 to-pink-600' },
  { color: 'bg-green-500', bgGradient: 'from-green-400 to-green-600' },
  { color: 'bg-purple-500', bgGradient: 'from-purple-400 to-purple-600' }
];

const gameState = {
  totalPlayers: 2,
  currentPlayer: 0,
  players: [],
  level: 1,
  path: [],            
  cellMap: {},         
  gridCols: 3,
  gridRows: 3,
  currentQuestion: null,
  currentAnswer: null
};

const levelLayouts = {
  1: {
    gridCols: 3,
    gridRows: 6,
    path: ['START',1,2,3,4,5,'FINISH'],
    cells: {
      'START':{r:6,c:2}, 1:{r:5,c:2}, 2:{r:4,c:2},
      3:{r:3,c:1}, 4:{r:3,c:2}, 5:{r:3,c:3},
      'FINISH': {r:2,c:2}
    },
    finishArc: false
  },
  2: {
    gridCols: 3,
    gridRows: 7,
    path: ['START',1,2,3,4,5,6,7,8,'FINISH'],
    cells: {
      'START':{r:6,c:2}, 
      1:{r:5,c:2},
      2:{r:4,c:1}, 3:{r:4,c:2}, 4:{r:4,c:3},
      5:{r:3,c:2}, 
      6:{r:2,c:1}, 7:{r:2,c:2}, 8:{r:2,c:3},
      'FINISH': {r:1,c:1, span:3}
    },
    finishArc: true
  },
  3: {
    gridCols: 4,
    gridRows: 7,
    path: ['START',1,2,3,4,5,6,7,8,9,10,11,'FINISH'],
    cells: {
      'START':{r:7,c:2}, 
      1:{r:6,c:1}, 2:{r:6,c:2}, 3:{r:6,c:3},
      4:{r:5,c:2},
      5:{r:4,c:1, rowSpan:2}, 6:{r:4,c:2}, 7:{r:4,c:3, rowSpan:2},
      8:{r:3,c:2}, 
      9:{r:2,c:3}, 10:{r:2,c:2}, 11:{r:2,c:1},
      'FINISH': {r:1,c:1, span:3}
    },
    finishArc: true
  },
  4: {
    gridCols: 5,
    gridRows: 7,
    path: ['START',1,2,3,4,5,6,7,8,9,10,11,12,13,'FINISH'],
    cells: {
      'START':{r:7,c:3}, 
      1:{r:6,c:2}, 2:{r:6,c:3}, 3:{r:6,c:4}, 
      4:{r:5,c:3}, 
      5:{r:4,c:2}, 6:{r:4,c:3}, 7:{r:4,c:4}, 
      8:{r:3,c:3}, 
      9:{r:2,c:1}, 10:{r:2,c:2}, 11:{r:2,c:3}, 12:{r:2,c:4}, 13:{r:2,c:5},
      'FINISH': {r:1,c:1, span:5}
    },
    finishArc: true
  },
  5: {
    gridCols: 5,
    gridRows: 8,
    path: ['START',1,2,3,4,5,6,7,8,9,10,11,12,13,14,'FINISH'],
    cells: {
      'START':{r:8,c:3},
      1:{r:7,c:3}, 
      2:{r:6,c:3},
      3:{r:5,c:2}, 4:{r:5,c:3}, 5:{r:5,c:4}, 
      6:{r:4,c:3}, 
      7:{r:3,c:5}, 8:{r:3,c:4}, 9:{r:3,c:3}, 10:{r:3,c:2}, 11:{r:3,c:1},
      12:{r:2,c:1}, 13:{r:2,c:5}, 14:{r:2,c:3},
      'FINISH': {r:1,c:1, span:5}
    },
    finishArc: false
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const btn = document.getElementById("play-music");
  let isPlaying = false;

  btn.addEventListener("click", () => {
    if (isPlaying) {
      music.pause();
      btn.textContent = "🎵 Putar Musik";
    } else {
      music.play();
      btn.textContent = "⏸ Hentikan Musik";
    }
    isPlaying = !isPlaying;
  });
});

function buildBoardForLevel(level) {
  const layout = levelLayouts[level];
  gameState.level = level;
  gameState.gridCols = layout.gridCols;
  gameState.gridRows = layout.gridRows;
  gameState.path = layout.path.slice();
  gameState.cellMap = layout.cells;

  const grid = document.getElementById('boardGrid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${layout.gridCols}, 72px)`;
  grid.style.gridTemplateRows = `repeat(${layout.gridRows}, 72px)`;

  for (const key of layout.path) {
    const cell = layout.cells[key];
    const div = document.createElement('div');

    if (key === 'FINISH') {
  if (layout.finishArc) {
    div.className = `finish-arc level-${level}-box shadow-lg`;
  } else {
    div.className = `istatak-box level-${level}-box rounded-2xl flex items-center justify-center shadow-lg`;
  }
  div.textContent = 'FINISH';
  div.style.gridColumn = `${cell.c}${cell.span ? ` / span ${cell.span}` : ''}`;
  div.style.gridRow = `${cell.r}${cell.rowSpan ? ` / span ${cell.rowSpan}` : ''}`;
  div.id = 'box-FINISH';  

} else if (key === 'START') {
  div.className = `istatak-box start-box level-${level}-box rounded-2xl flex items-center justify-center shadow-lg`;
  div.style.width = "72px";   
  div.style.height = "72px";
  div.style.gridColumn = `${cell.c}`;
  div.style.gridRow = `${cell.r}`;
  div.id = 'box-START';

  const label = document.createElement('span');
  label.className = 'start-label';
  label.textContent = 'START';
  div.appendChild(label);

} else {
  div.className = `istatak-box level-${level}-box rounded-2xl flex items-center justify-center relative shadow-lg`;
  div.style.width = "72px";   
  div.style.height = "72px";  
  div.style.gridColumn = `${cell.c}`;
  div.style.gridRow = `${cell.r}`;
  div.id = `box-${key}`;

  const label = document.createElement('span');
  label.className = 'text-3xl font-bold text-gray-700';
  label.textContent = key;
  div.appendChild(label);
}
    
    grid.appendChild(div);
  }
}

function selectPlayers(num) {
  gameState.totalPlayers = num;
  gameState.players = [];
  for (let i = 0; i < num; i++) {
    gameState.players.push({
      id: i,
      pathIndex: 0,
      character: { ...playerBaseData[i], name: `Pemain ${i+1}`, icon: availableEmojis[i] } 
    });
  }
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('characterSetupScreen').classList.remove('hidden');
  document.getElementById('gameBody').className = 'min-h-screen player-setup transition-all duration-500';
  renderCharacterSetupScreen();
}

function renderCharacterSetupScreen() {
  const container = document.getElementById('playerSetupContainer');
  container.innerHTML = '';
  gameState.players.forEach((player, index) => {
    const playerCard = document.createElement('div');
    playerCard.className = 'p-4 rounded-xl glass-effect';
    playerCard.innerHTML = `
      <div class="flex items-center gap-4 mb-4">
        <span class="text-4xl player-icon-status">${player.character.icon}</span>
        <input type="text" value="${player.character.name}" data-player-id="${index}" class="player-name-input flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white">
      </div>
      <div class="flex flex-wrap gap-2 icon-choice-container" data-player-id="${index}">
        ${availableEmojis.map(emoji => `
          <span class="emoji-choice text-3xl p-2 rounded-lg cursor-pointer transition-all hover:bg-white/30 ${player.character.icon === emoji ? 'selected' : ''}" data-icon="${emoji}" onclick="selectEmoji(${index}, this)">${emoji}</span>
        `).join('')}
      </div>
    `;
    container.appendChild(playerCard);
  });
}

function selectEmoji(playerId, el) {
  const container = document.querySelector(`.icon-choice-container[data-player-id="${playerId}"]`);
  container.querySelectorAll('.emoji-choice').forEach(iconEl => iconEl.classList.remove('selected'));
  el.classList.add('selected');

  gameState.players[playerId].character.icon = el.dataset.icon;

  const iconSpan = document.querySelector(`#playerSetupContainer [data-player-id="${playerId}"]`)
    .closest('.flex')
    .querySelector('.player-icon-status');
  if (iconSpan) {
    iconSpan.textContent = el.dataset.icon;
  }
}


function saveCharacterSetup() {
  const nameInputs = document.querySelectorAll('.player-name-input');
  nameInputs.forEach(input => {
    const playerId = input.dataset.playerId;
    gameState.players[playerId].character.name = input.value || `Pemain ${Number(playerId) + 1}`;
  });

  document.getElementById('characterSetupScreen').classList.add('hidden');
  document.getElementById('levelScreen').classList.remove('hidden');
}

function selectLevel(level) {
  gameState.pendingLevel = level;

  const modal = document.getElementById('rulesModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

let availableQuestions = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: []
};

function startLevelAfterRules() {
  const level = gameState.pendingLevel;

  gameState.level = level;

  if (!usedQuestions[level]) usedQuestions[level] = new Set();
  usedQuestions[level].clear();

  const modal = document.getElementById('rulesModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');

  buildBoardForLevel(level);
  document.getElementById('levelScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  document.getElementById('gameBody').className = 'min-h-screen game-board transition-all duration-500';
  gameState.currentPlayer = 0;
  updateGameDisplay();

  const levelText = document.getElementById('currentLevelText');
  if (levelText) {
    levelText.textContent = `🎮 Level ${level}`;
  }
}

function backToLevelSelect() {
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('levelScreen').classList.remove('hidden');
  document.getElementById('gameBody').className = 'min-h-screen player-setup transition-all duration-500';
  clearTimers();
}

function updateGameDisplay() {
  updatePlayerCharacters();
  updatePlayersStatus();
  updateCurrentPlayerInfo();
  updateTargetHighlight();
}

function currentTargetNumber(player) {
  return gameState.path[player.pathIndex + 1] || 'FINISH';
}

function updatePlayerCharacters() {
  document.querySelectorAll('.player-character').forEach(el => el.remove());
  gameState.players.forEach(p => {
    const target = gameState.path[p.pathIndex] || null; 
    if (!target) return;
    const box = document.getElementById(`box-${target}`);
    if (box) {
      const char = document.createElement('div');
      char.className = 'player-character';
      char.textContent = p.character.icon;

      const inSame = gameState.players.filter(q => gameState.path[q.pathIndex] === target);
      const idx = inSame.findIndex(q => q.id === p.id);
      const pos = [
        {top:'30%',left:'30%'},{top:'30%',left:'70%'},
        {top:'70%',left:'30%'},{top:'70%',left:'70%'}
      ][idx] || {top:'50%',left:'50%'};
      char.style.top = pos.top; char.style.left = pos.left; char.style.transform = 'translate(-50%, -50%)';

      box.appendChild(char);
    }
  });
}

function updatePlayersStatus() {
  const cont = document.getElementById('playersStatus');
  cont.innerHTML = '';
  gameState.players.forEach((p, i) => {
    const here = gameState.path[p.pathIndex] || 'START';
    const isTurn = i === gameState.currentPlayer;
    const div = document.createElement('div');
    div.className = `p-3 rounded-xl transition-all ${isTurn ? 'bg-gradient-to-r '+p.character.bgGradient+' text-white transform scale-105 shadow-lg' : 'bg-white/50'}`;
    div.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-2xl player-icon-status">${p.character.icon}</span>
          <div>
            <div class="font-bold ${isTurn?'text-white':'text-gray-800'}">${p.character.name}</div>
            <div class="text-sm ${isTurn?'text-white/80':'text-gray-600'}">${here==='START'?'START':('Kotak '+here)}</div>
          </div>
        </div>
        ${isTurn?'<div class="text-xl">👈</div>':''}
      </div>`;
    cont.appendChild(div);
  });
}

function updateCurrentPlayerInfo() {
  const cp = gameState.players[gameState.currentPlayer];
  document.getElementById('currentPlayerIcon').textContent = cp.character.icon;
  document.getElementById('currentPlayerName').textContent = cp.character.name;
  const info = document.getElementById('currentPlayerInfo');
  info.className = `flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r ${cp.character.bgGradient}`;

  const hopBtn = document.getElementById('hopButton');
  hopBtn.className = `w-full bg-gradient-to-r ${cp.character.bgGradient} text-white font-bold px-6 py-4 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-lg`;
}

function updateTargetHighlight() {
  document.querySelectorAll('.current-box').forEach(b => b.classList.remove('current-box'));
  const cp = gameState.players[gameState.currentPlayer];
  const nextNum = currentTargetNumber(cp);
  const box = document.getElementById(`box-${nextNum}`);
  if (box) box.classList.add('current-box');
}

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

const extraQuestions1 = [
{ question: "Ani punya 5 apel, beli 3 lagi. Berapa total apel?", answer: "8" },
{ question: "Budi punya 12 kelereng, bagi 4 ke temannya. Sisa berapa?", answer: "8" },
{ question: "Sekarang pukul 9 pagi. 3 jam lagi pukul berapa?", answer: "12" },
{ question: "Panjang pensil 15 cm, penggaris 30 cm. Mana yang lebih panjang?", answer: "penggaris" },
{ question: "Satu jam = berapa menit?", answer: "60" },
{ question: "Berat semangka 3 kg, berat apel 1 kg. Mana yang lebih berat?", answer: "semangka" },
{ question: "Jam menunjukkan pukul 7. Dua jam lagi pukul berapa?", answer: "9" },
{ question: "Hari ini Senin, 3 hari lagi hari apa?", answer: "Kamis" },
{ question: "Satu minggu ada berapa hari?", answer: "7" },
{ question: "Jika sekarang jam 10 malam, 2 jam lagi jam berapa?", answer: "12" },
{ question: "Satu tahun ada berapa bulan?", answer: "12" },
{ question: "Hari ini Jumat, 5 hari kemudian hari apa?", answer: "Rabu" },
{ question: "Mana yang lebih besar, 8 atau 12?", answer: "12" },
{ question: "Mana yang lebih kecil, 7 atau 9?", answer: "7" },
{ question: "Doni punya 4 permen, diberi 6 permen lagi. Total permen Doni?", answer: "10" },
{ question: "Lina punya 10 kue, dimakan 3. Sisa kue Lina?", answer: "7" },
{ question: "Sekarang pukul 2 siang. 4 jam lagi pukul berapa?", answer: "6" },
{ question: "Panjang buku 20 cm, panjang bolpoin 10 cm. Mana lebih panjang?", answer: "buku" },
{ question: "Satu hari ada berapa jam?", answer: "24" },
{ question: "Berat 2 kg lebih besar dari 1 kg? (ya/tidak)", answer: "ya" },
{ question: "Jam menunjukkan pukul 11. Dua jam sebelumnya jam berapa?", answer: "9" },
{ question: "Hari ini Rabu, 2 hari lagi hari apa?", answer: "Jumat" },
{ question: "Jika Ani punya 8 kelereng dan hilang 2, berapa sisanya?", answer: "6" },
{ question: "Mana yang lebih besar, 15 atau 20?", answer: "20" },
{ question: "Mana yang lebih kecil, 18 atau 25?", answer: "18" },
{ question: "Sekarang jam 6 pagi. 6 jam lagi jam berapa?", answer: "12" },
{ question: "Satu lusin telur ada berapa butir?", answer: "12" },
{ question: "Hari ini Minggu, besok hari apa?", answer: "Senin" },
{ question: "5 + 7 = ?", answer: "12" },
{ question: "10 – 6 = ?", answer: "4" },
{ question: "3 × 2 = ?", answer: "6" },
{ question: "8 ÷ 2 = ?", answer: "4" },
{ question: "Mana yang lebih berat, sapi atau ayam?", answer: "sapi" },
{ question: "Jika sekarang jam 1 siang, 5 jam lagi jam berapa?", answer: "6" }
];

const questionsWithImages = [
{
  question: "Tebak bangun datar ini",
  image: "picture/persegi.png", 
  answer: "persegi"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/segitiga.png", 
  answer: "segitiga"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/lingkaran.png", 
  answer: "lingkaran"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/trapesium.png", 
  answer: "trapesium"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/jgenjang.png", 
  answer: "jajar genjang"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/persegip.png", 
  answer: "persegi panjang"
}
];

const extraQuestions2 = [
    { question: "12 + 15 = ?", answer: "27" },
    { question: "25 – 9 = ?", answer: "16" },
    { question: "7 × 3 = ?", answer: "21" },
    { question: "18 ÷ 3 = ?", answer: "6" },
    { question: "9 × 4 = ?", answer: "36" },
    { question: "28 – 12 = ?", answer: "16" },
    { question: "33 + 25 = ?", answer: "58" },
    { question: "45 ÷ 5 = ?", answer: "9" },
    { question: "19 + 21 = ?", answer: "40" },
    { question: "50 – 28 = ?", answer: "22" },
    { question: "123 ... 213", answer: "<" },
    { question: "345 ... 354", answer: "<" },
    { question: "276 ... 267", answer: ">" },
    { question: "498 ... 489", answer: ">" },
    { question: "512 ... 521", answer: "<" },
    { question: "630 ... 603", answer: ">" },
    { question: "714 ... 741", answer: "<" },
    { question: "865 ... 856", answer: ">" },
    { question: "999 ... 990", answer: ">" },
    { question: "150 ... 105", answer: ">" },
    { question: "Jika ada 10 kursi dan 8 anak duduk, berapa kursi kosong?", answer: "2" },
    { question: "15 + 14 = ?", answer: "29" },
    { question: "35 – 17 = ?", answer: "18" },
    { question: "6 × 5 = ?", answer: "30" },
    { question: "40 ÷ 8 = ?", answer: "5" },
    { question: "300 ... 290", answer: ">" },
    { question: "210 ... 201", answer: ">" },
    { question: "412 ... 421", answer: "<" },
    { question: "509 ... 599", answer: "<" },
    { question: "701 ... 710", answer: "<" },
    { question: "25 + 18 = ?", answer: "43" },
    { question: "90 – 45 = ?", answer: "45" },
    { question: "11 × 3 = ?", answer: "33" },
    { question: "63 ÷ 9 = ?", answer: "7" },
    { question: "Jika ada 12 kelereng, diambil 5, sisa?", answer: "7" },
    { question: "800 ... 899", answer: "<" },
    { question: "321 ... 231", answer: ">" },
    { question: "654 ... 645", answer: ">" },
    { question: "333 ... 303", answer: ">" },
    { question: "275 ... 752", answer: "<" },
    { question: "20 + 30 = ?", answer: "50" },
    { question: "45 – 28 = ?", answer: "17" },
    { question: "9 × 8 = ?", answer: "72" },
    { question: "72 ÷ 8 = ?", answer: "9" },
    { question: "Jika ibu punya 5 apel, ayah memberi 4 apel lagi, total?", answer: "9" },
    { question: "200 ... 199", answer: ">" },
    { question: "888 ... 889", answer: "<" },
    { question: "456 ... 654", answer: "<" },
    { question: "999 ... 100", answer: ">" },
    { question: "123 ... 321", answer: "<" }
];

const extraQuestions3 = [
    { question: "Seperempat dari 20 adalah?", answer: "5" },
    { question: "Luas persegi dengan sisi 7 cm?", answer: "49" },
    { question: "Keliling persegi panjang 12 cm × 8 cm?", answer: "40" },
    { question: "Luas segitiga alas 10 cm, tinggi 6 cm?", answer: "30" },
    { question: "Keliling lingkaran r=7 cm (π=22/7)?", answer: "44" },
    { question: "345 ... 298", answer: ">" },
    { question: "85 + 67 = ?", answer: "152" },
    { question: "95 – 48 = ?", answer: "47" },
    { question: "125 + 178 = ?", answer: "303" },
    { question: "280 – 165 = ?", answer: "115" },
    { question: "24 × 5 = ?", answer: "120" },
    { question: "36 ÷ 6 = ?", answer: "6" },
    { question: "Luas persegi sisi 15 cm?", answer: "225" },
    { question: "Keliling segitiga sisi 10,12,14?", answer: "36" },
    { question: "Luas jajargenjang alas 20, tinggi 8?", answer: "160" },
    { question: "Luas lingkaran r=14 cm (π=22/7)?", answer: "616" },
    { question: "245 + 356 = ?", answer: "601" },
    { question: "512 – 278 = ?", answer: "234" },
    { question: "42 × 9 = ?", answer: "378" },
    { question: "144 ÷ 12 = ?", answer: "12" },
    { question: "876 ... 999", answer: "<" },
    { question: "Seperempat dari 40 adalah?", answer: "10" },
    { question: "Setengah dari 50 adalah?", answer: "25" },
    { question: "Sepertiga dari 30 adalah?", answer: "10" },
    { question: "Luas persegi panjang 6 × 5?", answer: "30" },
    { question: "Keliling persegi sisi 9 cm?", answer: "36" },
    { question: "Keliling persegi panjang 7 × 5?", answer: "24" },
    { question: "Jika Ani punya 24 permen, dibagi 4 anak, masing-masing?", answer: "6" },
    { question: "50 + 75 = ?", answer: "125" },
    { question: "200 – 175 = ?", answer: "25" },
    { question: "15 × 12 = ?", answer: "180" },
    { question: "81 ÷ 9 = ?", answer: "9" },
    { question: "Luas segitiga alas 12 tinggi 10?", answer: "60" },
    { question: "Keliling segiempat sisi 11 cm?", answer: "44" },
    { question: "Bandingkan 450 ... 540", answer: "<" },
    { question: "Keliling lingkaran r=14 (π=22/7)?", answer: "88" },
    { question: "Jika ada 60 bola, diambil 1/2, sisa?", answer: "30" },
    { question: "3/4 dari 40 adalah?", answer: "30" },
    { question: "100 ÷ 4 = ?", answer: "25" },
    { question: "15 + 45 + 25 = ?", answer: "85" },
    { question: "75 – 25 + 10 = ?", answer: "60" },
    { question: "Keliling persegi panjang 20 × 10?", answer: "60" },
    { question: "Luas persegi sisi 20?", answer: "400" },
    { question: "Keliling segitiga sisi 13,14,15?", answer: "42" },
    { question: "Luas jajargenjang alas 15 tinggi 7?", answer: "105" },
    { question: "200 + 150 – 75 = ?", answer: "275" },
    { question: "225 – 125 = ?", answer: "100" },
    { question: "60 × 5 = ?", answer: "300" },
    { question: "144 ÷ 6 = ?", answer: "24" },
    { question: "Bandingkan 700 ... 650", answer: ">" }
];

const extraQuestions4 = [
  { question: "Budi punya Rp10000. Ia membeli mainan Rp7500. Sisa uangnya?", answer: "2500" },
    { question: "128 + 256 – 178 = ?", answer: "206" },
    { question: "325 – (118 + 92) = ?", answer: "115" },
    { question: "42 × 18 = ?", answer: "756" },
    { question: "144 ÷ 12 + 25 = ?", answer: "37" },
    { question: "(250 + 175) × 2 = ?", answer: "850" },
    { question: "(540 – 325) ÷ 5 = ?", answer: "43" },
    { question: "75 × 24 = ?", answer: "1800" },
    { question: "96 ÷ 8 + 15 = ?", answer: "27" },
    { question: "64 × 32 = ?", answer: "2048" },
    { question: "1024 ÷ 16 = ?", answer: "64" },
    { question: "450 + 325 – 178 = ?", answer: "597" },
    { question: "640 – (215 + 125) = ?", answer: "300" },
    { question: "84 × 19 = ?", answer: "1596" },
    { question: "(720 ÷ 12) + 35 = ?", answer: "95" },
    { question: "(180 + 225) × 3 = ?", answer: "1215" },
    { question: "(980 – 765) ÷ 5 = ?", answer: "43" },
    { question: "125 × 48 = ?", answer: "6000" },
    { question: "144 ÷ 9 + 55 = ?", answer: "71" },
    { question: "128 × 64 = ?", answer: "8192" },
    { question: "4096 ÷ 32 = ?", answer: "128" },
    { question: "Jika harga 3 pensil Rp4500, harga 1 pensil?", answer: "1500" },
    { question: "Sebuah kotak berisi 48 kue dibagi ke 12 anak, masing-masing?", answer: "4" },
    { question: "Jika 1 jam = 60 menit, 2,5 jam = ... menit?", answer: "150" },
    { question: "750 – 325 + 200 = ?", answer: "625" },
    { question: "Jika 5 × X = 100, maka X?", answer: "20" },
    { question: "24 × 15 = ?", answer: "360" },
    { question: "360 ÷ 12 = ?", answer: "30" },
    { question: "Jika panjang 20, lebar 10, keliling?", answer: "60" },
    { question: "(500 – 250) ÷ 5 = ?", answer: "50" },
    { question: "2000 ÷ 25 = ?", answer: "80" },
    { question: "36 × 25 = ?", answer: "900" },
    { question: "1800 ÷ 90 = ?", answer: "20" },
    { question: "Jika 12 jam = setengah hari, maka 1 hari = ... jam?", answer: "24" },
    { question: "4500 – 2750 = ?", answer: "1750" },
    { question: "Jika 3 buku Rp24000, harga 1 buku?", answer: "8000" },
    { question: "Jika 2 lusin telur = ... butir?", answer: "24" },
    { question: "Keliling persegi sisi 25?", answer: "100" },
    { question: "Jika 7 × ? = 210, maka ?", answer: "30" },
    { question: "400 + 325 + 275 = ?", answer: "1000" },
    { question: "(900 ÷ 30) + 25 = ?", answer: "55" },
    { question: "Jika 1 menit = 60 detik, 5 menit = ... detik?", answer: "300" },
    { question: "Jika 1 minggu = 7 hari, 4 minggu = ... hari?", answer: "28" },
    { question: "Jika 1 tahun = 12 bulan, 3 tahun = ... bulan?", answer: "36" },
    { question: "Jika 2,5 jam = ... menit?", answer: "150" },
    { question: "9000 ÷ 100 = ?", answer: "90" },
    { question: "Jika X + 250 = 1000, maka X?", answer: "750" },
    { question: "Jika 5 × 12 = ?", answer: "60" },
    { question: "Jika (25 × 4) + 50 = ?", answer: "150" }
];

const extraQuestions5 = [
    { question: "Seperempat dari 100 adalah?", answer: "25" },
    { question: "Urutan huruf: Z, Y, X, W, ... Huruf berikutnya?", answer: "V" },
    { question: "Lanjutkan pola: 1, 4, 9, 16, ...", answer: "25" },
    { question: "Volume kubus sisi 10 cm?", answer: "1000" },
    { question: "Volume balok 12×8×5?", answer: "480" },
    { question: "Volume tabung r=7 t=10 (π=22/7)?", answer: "1540" },
    { question: "Volume prisma alas 20 luas × tinggi 12?", answer: "240" },
    { question: "Volume limas alas 36 tinggi 15?", answer: "180" },
    { question: "2345 + 6789 = ?", answer: "9134" },
    { question: "9876 – 4321 = ?", answer: "5555" },
    { question: "125 × 125 = ?", answer: "15625" },
    { question: "2025 ÷ 45 = ?", answer: "45" },
    { question: "7567 ... 7558", answer: ">" },
    { question: "Luas permukaan kubus sisi 12?", answer: "864" },
    { question: "Luas permukaan balok 10×6×8?", answer: "376" },
    { question: "Luas permukaan tabung r=14 t=20 (π=22/7)?", answer: "2992" },
    { question: "(325 × 48) – 1575 = ?", answer: "13875" },
    { question: "(9800 ÷ 25) + 360 = ?", answer: "752" },
    { question: "215 × 36 = ?", answer: "7740" },
    { question: "144 ÷ 12 + 205 = ?", answer: "217" },
    { question: "10245 ... 9998", answer: ">" },
    { question: "Akar kuadrat dari 225?", answer: "15" },
    { question: "15³ = ?", answer: "3375" },
    { question: "Jika 1/5 dari 200 = ?", answer: "40" },
    { question: "Jika 3/4 dari 120 = ?", answer: "90" },
    { question: "Jika 10% dari 500 = ?", answer: "50" },
    { question: "Urutan bilangan: 2, 4, 8, 16, ...", answer: "32" },
    { question: "Urutan bilangan ganjil: 1, 3, 5, 7, ...", answer: "9" },
    { question: "Jika X² = 64, maka X?", answer: "8" },
    { question: "Akar kuadrat 400?", answer: "20" },
    { question: "Jika 2⁵ = ?", answer: "32" },
    { question: "Jika 3³ = ?", answer: "27" },
    { question: "Jika 4³ = ?", answer: "64" },
    { question: "Jika 5² = ?", answer: "25" },
    { question: "Jika 12² = ?", answer: "144" },
    { question: "Jika 20² = ?", answer: "400" },
    { question: "Jika 30² = ?", answer: "900" },
    { question: "Jika 11² = ?", answer: "121" },
    { question: "Jika 15² = ?", answer: "225" },
    { question: "Jika 25² = ?", answer: "625" },
    { question: "Jika 1000 ÷ 25 = ?", answer: "40" },
    { question: "Jika 5000 ÷ 125 = ?", answer: "40" },
    { question: "Jika 10! ÷ 9! = ?", answer: "10" },
    { question: "Jika 8! ÷ 7! = ?", answer: "8" },
    { question: "Jika pola 2, 6, 12, 20, ...", answer: "30" },
    { question: "Jika pola 5, 10, 20, 40, ...", answer: "80" },
    { question: "Jika pola 1, 2, 4, 8, 16, ...", answer: "32" },
    { question: "Jika pola 10, 20, 30, 40, ...", answer: "50" },
    { question: "Jika pola 100, 90, 80, 70, ...", answer: "60" }
];

function generateLevel1Question() {
  const r = Math.random();
  if (r < 0.3) {
    const q = questionsWithImages[Math.floor(Math.random() * questionsWithImages.length)];
    return { question: q.question, answer: q.answer, image: q.image, isDummy: true };
  }

  if (r < 0.6) {
    const q = extraQuestions1[Math.floor(Math.random() * extraQuestions1.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }

  while (true) {
    const x = randInt(5, 15), y = randInt(5, 20), z = randInt(1, 9);
    const ops = [Math.random() < 0.5 ? '+' : '-', Math.random() < 0.5 ? '+' : '-'];
    const expr = `${x} ${ops[0]} ${y} ${ops[1]} ${z}`;
    const val = eval(expr);
    if (val >= 0) return { question: expr, answer: String(val), isDummy: false };
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDivisors(n) {
  let divisors = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) divisors.push(i);
  }
  return divisors;
}

function evalNoPrecedence(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return a / b;
  }
}

function evalWithPrecedence(expr) {
  const jsExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
  let result;
  try {
    result = Function(`"use strict"; return (${jsExpr});`)();
  } catch {
    result = null;
  }
  return result;
}

function generateLevel2Question() {
  if (Math.random() < 0.6 && extraQuestions2 && extraQuestions2.length > 0) {
    const q = extraQuestions2[Math.floor(Math.random() * extraQuestions2.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const x = randInt(5, 15), y = randInt(10, 15), z = randInt(1, 6);
    const ops = ['+', '-', '×', '÷'];
    const op1 = ops[randInt(0, ops.length - 1)];
    const op2 = ops[randInt(0, ops.length - 1)];
    const expr = `${x} ${op1} ${y} ${op2} ${z}`;
    const result = evalWithPrecedence(expr);
    if (result !== null && isFinite(result) && Number.isInteger(result) && result >= 0) {
      return { question: `${expr} = ?`, answer: String(result), isDummy: false };
    }
  }
}

function generateLevel3Question() {
  if (Math.random() < 0.6 && extraQuestions3 && extraQuestions3.length > 0) {
    const q = extraQuestions3[Math.floor(Math.random() * extraQuestions3.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const a = randInt(5, 15), b = randInt(10, 20), c = randInt(1, 6), d = randInt(1, 6);
    const ops = ['+', '-', '×', '÷'];
    const op1 = ops[randInt(0, ops.length - 1)];
    const op2 = ops[randInt(0, ops.length - 1)];
    const op3 = ops[randInt(0, ops.length - 1)];
    const expr = `${a} ${op1} ${b} ${op2} ${c} ${op3} ${d}`;
    const result = evalWithPrecedence(expr);
    if (result !== null && isFinite(result) && Number.isInteger(result) && result >= 0) {
      return { question: `${expr} = ?`, answer: String(result), isDummy: false };
    }
  }
}

function generateLevel4Question() {
  if (Math.random() < 0.6 && extraQuestions4 && extraQuestions4.length > 0) {
    const q = extraQuestions4[Math.floor(Math.random() * extraQuestions4.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const a = randInt(5, 15), b = randInt(10, 20), c = randInt(1, 6), d = randInt(1, 6), e = randInt(1, 6);
    const ops = ['+', '-', '×', '÷'];
    const op1 = ops[randInt(0, ops.length - 1)];
    const op2 = ops[randInt(0, ops.length - 1)];
    const op3 = ops[randInt(0, ops.length - 1)];
    const op4 = ops[randInt(0, ops.length - 1)];
    const expr = `${a} ${op1} ${b} ${op2} ${c} ${op3} ${d} ${op4} ${e}`;
    const result = evalWithPrecedence(expr);
    if (result !== null && isFinite(result) && Number.isInteger(result) && result >= 0) {
      return { question: `${expr} = ?`, answer: String(result), isDummy: false };
    }
  }
}

function generateLevel5Question() {
  if (Math.random() < 0.6 && extraQuestions5 && extraQuestions5.length > 0) {
    const q = extraQuestions5[Math.floor(Math.random() * extraQuestions5.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const a = randInt(5, 15), b = randInt(10, 20), c = randInt(1, 6), d = randInt(1, 6), e = randInt(1, 6), f = randInt(1, 6);
    const ops = ['+', '-', '×', '÷'];
    const op1 = ops[randInt(0, ops.length - 1)];
    const op2 = ops[randInt(0, ops.length - 1)];
    const op3 = ops[randInt(0, ops.length - 1)];
    const op4 = ops[randInt(0, ops.length - 1)];
    const op5 = ops[randInt(0, ops.length - 1)];
    const expr = `${a} ${op1} ${b} ${op2} ${c} ${op3} ${d} ${op4} ${e} ${op5} ${f}`;
    const result = evalWithPrecedence(expr);
    if (result !== null && isFinite(result) && Number.isInteger(result) && result >= 0) {
      return { question: `${expr} = ?`, answer: String(result), isDummy: false };
    }
  }
}

function generateMathQuestion() {
  const level = gameState.level; 

  if (!level) {
    return { question: "Level tidak ditemukan", answer: null };
  }
  if (!usedQuestions[level]) usedQuestions[level] = new Set();

  let q, key;
  for (let i = 0; i < MAX_UNIQUE_TRIES; i++) {
    if (level === 1) {
      q = generateLevel1Question();
    } else if (level === 2) {
      q = generateLevel2Question();
    } else if (level === 3) {
      q = generateLevel3Question();
    } else if (level === 4) {
      q = generateLevel4Question();
    } else if (level === 5) {
      q = generateLevel5Question();
    } else {
      return { question: "Level tidak ditemukan", answer: null };
    }

    key = (q.image ? `IMG:${q.image}|` : "") + `Q:${q.question}`;

    if (!usedQuestions[level].has(key)) {
      usedQuestions[level].add(key); 
      return q;                      
    }
  }

  return { question: "⚠️ Soal habis untuk level ini.", answer: null, isDummy: true };
}

let answerTimer = null;
let countdownInterval = null;

function showMathQuestion() {
  const q = generateMathQuestion();
  gameState.currentQuestion = q.question;
  gameState.currentAnswer  = q.answer;
  gameState.currentIsDummy = !!q.isDummy;

  document.getElementById('mathQuestion').textContent = q.question;

  const imgEl = document.getElementById('questionImage'); 
  if (q.image) {
      imgEl.src = q.image;
      imgEl.classList.remove('hidden');
  } else {
      imgEl.classList.add('hidden');
  }

  document.getElementById('mathAnswer').value = '';
  document.getElementById('answerFeedback').classList.add('hidden');
  document.getElementById('timerDisplay').textContent = 'Sisa waktu: 10 detik';

  document.getElementById('mathModal').classList.remove('hidden');
  document.getElementById('mathModal').classList.add('flex');
  setTimeout(()=>document.getElementById('mathAnswer').focus(),100);

  clearTimers();

  let timeLeft = 30;
  document.getElementById('timerDisplay').textContent = `Waktu: ${timeLeft} detik`;

  countdownInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('timerDisplay').textContent = `Waktu: ${timeLeft} detik`;
  }, 1000);

  answerTimer = setTimeout(() => {
      clearInterval(countdownInterval);
      document.getElementById('answerFeedback').textContent = '⏳ Waktu habis!';
      document.getElementById('answerFeedback').className = 'feedback wrong';
      document.getElementById('answerFeedback').classList.remove('hidden');
      setTimeout(() => {
          closeMathModal();
          nextPlayer();
      }, 1500);
  }, 30000);
}

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0; 
    sound.play().catch(()=>{}); 
  }
}

function normalizeAnswerStr(s) {
    return String(s)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); 
}

function isTextCorrect(input, correct) {
    if (Array.isArray(correct)) {
        return correct.some(ans => normalizeAnswerStr(input) === normalizeAnswerStr(ans));
    }
    return normalizeAnswerStr(input) === normalizeAnswerStr(correct);
}

function checkAnswer() {
    clearTimers();
    const input   = document.getElementById('mathAnswer').value.trim();
    const fb      = document.getElementById('answerFeedback');
    const correct = gameState.currentAnswer;
    const isDummy = gameState.currentIsDummy || false;

    if (isDummy) {
        if (!isNaN(correct)) {
            if (input == correct) {
                fb.textContent = '✅ Benar!';
                fb.className   = 'mt-6 text-center font-bold text-lg text-green-600';
                fb.classList.remove('hidden');
                playSound("sound-correct");

                setTimeout(() => {
                    closeMathModal();       
                    setTimeout(() => moveCurrentPlayer(), 1000);
                }, 1000);
            } else {
                fb.textContent = `❌ Salah! Jawaban: ${correct}`;
                fb.className   = 'mt-6 text-center font-bold text-lg text-red-600';
                fb.classList.remove('hidden');
                playSound("sound-wrong");

                setTimeout(() => {
                    closeMathModal();
                    nextPlayer();
                }, 1500);
            }
        }
        else {
            if (isTextCorrect(input, correct)) {
                fb.textContent = '✅ Benar!';
                fb.className   = 'mt-6 text-center font-bold text-lg text-green-600';
                fb.classList.remove('hidden');
                playSound("sound-correct");

                setTimeout(() => {
                    closeMathModal();
                    setTimeout(() => moveCurrentPlayer(), 1000);
                }, 1000);
            } else {
                fb.textContent = `❌ Salah! Jawaban: ${correct}`;
                fb.className   = 'mt-6 text-center font-bold text-lg text-red-600';
                fb.classList.remove('hidden');
                playSound("sound-wrong");

                setTimeout(() => {
                    closeMathModal();
                    nextPlayer();
                }, 1500);
            }
        }
    }
    else {
        if (input === "") {
            fb.textContent = '❌ Jawaban tidak boleh kosong!';
            fb.className   = 'mt-6 text-center font-bold text-lg text-red-600';
            fb.classList.remove('hidden');
            playSound("sound-wrong");

            setTimeout(() => {
                closeMathModal();
                nextPlayer();
            }, 1500);
            return;
        }

        if (input == correct) {
            fb.textContent = '✅ Benar!';
            fb.className   = 'mt-6 text-center font-bold text-lg text-green-600';
            fb.classList.remove('hidden');
            playSound("sound-correct");

            setTimeout(() => {
                closeMathModal();
                setTimeout(() => moveCurrentPlayer(), 1000);
            }, 1000);
        } else {
            fb.textContent = `❌ Salah! Jawaban: ${correct}`;
            fb.className   = 'mt-6 text-center font-bold text-lg text-red-600';
            fb.classList.remove('hidden');
            playSound("sound-wrong");

            setTimeout(() => {
                closeMathModal();
                nextPlayer();
            }, 1500);
        }
    }
}

function showTimeoutThenNext(){
  const fb = document.getElementById('answerFeedback');
  fb.textContent = '⏳ Waktu habis!';
  fb.className = 'mt-6 text-center font-bold text-lg text-red-600';
  fb.classList.remove('hidden');
  setTimeout(()=>{
    closeMathModal();
    nextPlayer();
  },1200);
}

function clearTimers(){
  clearTimeout(answerTimer);
  clearInterval(countdownInterval);
}

function moveCurrentPlayer() {
  const p = gameState.players[gameState.currentPlayer];

  p.pathIndex++;

  updateGameDisplay();

  setTimeout(() => {
    document.querySelectorAll('.player-character').forEach(el => {
      if (el.textContent === p.character.icon) {
        el.classList.add('hop-animation');
        el.addEventListener('animationend', () => {
          el.classList.remove('hop-animation'); 
        }, { once: true });
      }
    });
  }, 100);

  const onNow = gameState.path[p.pathIndex];
  if (onNow === 'FINISH') {
    setTimeout(() => showWinner(p), 800);
  }
}

function nextPlayer() {
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.totalPlayers;
  updateGameDisplay();
}

function closeMathModal() {
  document.getElementById('mathModal').classList.add('hidden');
  document.getElementById('mathModal').classList.remove('flex');
  clearTimers();
}

function showWinner(winner) {
  const winnerIcon = document.getElementById('winnerIcon');
  winnerIcon.textContent = winner.character.icon;
  winnerIcon.className = 'text-6xl mb-2';

  document.getElementById('winnerText').textContent = `${winner.character.name} Menang!`;
  document.getElementById('winModal').classList.remove('hidden');
  document.getElementById('winModal').classList.add('flex');

  const duration = 3 * 1000; 
  const animationEnd = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();

  const winSound = new Audio("sounds/yey.mp3");
  winSound.play();
}

function closeWinModal() {
  document.getElementById('winModal').classList.add('hidden');
  document.getElementById('winModal').classList.remove('flex');
}

function backToSetup() {
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('levelScreen').classList.add('hidden');
  document.getElementById('characterSetupScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  document.getElementById('gameBody').className = 'min-h-screen transition-all duration-500';
  gameState.currentPlayer = 0;
  gameState.players = [];
  clearTimers();
  closeWinModal();
}

function initializeGame() {
  const ans = document.getElementById('mathAnswer');
  if (ans) ans.addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
  document.getElementById('setupScreen').classList.remove('hidden');
  console.log('Istatak Digital – siap!');
}

document.addEventListener('DOMContentLoaded', initializeGame);
