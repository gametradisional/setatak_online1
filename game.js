/**
 * Istatak Digital – Level 1 & 2
 * - Pilih pemain → atur karakter → pilih level
 * - Jalur sesuai sketsa (persegi berdempetan, level 2 finish melengkung)
 * - Menang cukup maju ke FINISH (tanpa balik)
 * - Level 1: x ± y ± z (hasil ≥ 0)
 * - Level 2: + − × ÷ (hasil bulat, ≥ 0)
 * - Giliran beruntun: benar = lanjut, salah/timeout = pindah
 * - Timer 10 detik + indikator
 */

// Pilihan emoji yang tersedia untuk pemain
const availableEmojis = [ 
  // existing
  '🚀', '⭐️', '⚡️', '❤️', '🎉', '🌟', 
  '👾', '👽', '🤖', '👑', '🔥', '💧', '☀️', 
  '🌸', '🦖',

  // new ones
  '🍎', '🍕', '🍩', '🍔', '🍓', // makanan
  '🐱', '🐶', '🐼', '🐸', '🐧', // hewan
  '🚗', '🚌', '🚲', '✈️', '🚤', // transportasi
  '⚽️', '🏀', '🏆', '🎮', '🎲'  // hobi/game
];


// Basis data pemain, tanpa ikon dan nama awal
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
  path: [],            // array berurutan: [1,2,...,N,'FINISH']
  cellMap: {},         // nomor -> {row, col} untuk posisi grid
  gridCols: 3,
  gridRows: 3,
  currentQuestion: null,
  currentAnswer: null
};

/* ---------------------------
   DEFINISI LAYOUT PER LEVEL
   ---------------------------

  Koordinat menggunakan grid (row, col) 1-based.
  Jalur berjalan sesuai urutan angka → FINISH.
  (Tata letak mengikuti sketsa; bisa disesuaikan mudah.)
*/

const levelLayouts = {
  // LEVEL 1
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

  // LEVEL 2
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

  // LEVEL 3
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

  // LEVEL 4
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

  // LEVEL 5
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

/* ---------- UTIL GRID ---------- */

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

  // render semua sel yang ada di cellMap
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
  div.style.width = "72px";   // ukuran tetap
  div.style.height = "72px";
  div.style.gridColumn = `${cell.c}`;
  div.style.gridRow = `${cell.r}`;
  div.id = 'box-START';

  // teks kecil untuk START
  const label = document.createElement('span');
  label.className = 'start-label';
  label.textContent = 'START';
  div.appendChild(label);

} else {
  div.className = `istatak-box level-${level}-box rounded-2xl flex items-center justify-center relative shadow-lg`;
  div.style.width = "72px";   // kecilin kotak
  div.style.height = "72px";  // kecilin kotak
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

/* ---------- SETUP FLOW ---------- */

function selectPlayers(num) {
  gameState.totalPlayers = num;
  gameState.players = [];
  for (let i = 0; i < num; i++) {
    // Inisialisasi pemain dengan data dasar dari playerBaseData
    gameState.players.push({
      id: i,
      pathIndex: 0,
      character: { ...playerBaseData[i], name: `Pemain ${i+1}`, icon: availableEmojis[i] } // Atur nama & ikon default
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

  // update icon di state
  gameState.players[playerId].character.icon = el.dataset.icon;

  // 🔹 update juga icon preview di kiri input nama
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
  // simpan level yang dipilih sementara
  gameState.pendingLevel = level;

  // tampilkan modal aturan
  const modal = document.getElementById('rulesModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function startLevelAfterRules() {
  const level = gameState.pendingLevel;

  // tutup modal aturan
  const modal = document.getElementById('rulesModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');

  // jalankan proses lama selectLevel
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

/* ---------- DISPLAY ---------- */

function updateGameDisplay() {
  updatePlayerCharacters();
  updatePlayersStatus();
  updateCurrentPlayerInfo();
  updateTargetHighlight();
}

function currentTargetNumber(player) {
  // target kotak berikutnya di path (1..N) atau 'FINISH'
  return gameState.path[player.pathIndex + 1] || 'FINISH';
}

function updatePlayerCharacters() {
  document.querySelectorAll('.player-character').forEach(el => el.remove());
  gameState.players.forEach(p => {
    const target = gameState.path[p.pathIndex] || null; // posisi saat ini (0 = belum di kotak mana pun)
    if (!target) return;
    const box = document.getElementById(`box-${target}`);
    if (box) {
      const char = document.createElement('div');
      char.className = 'player-character';
      char.textContent = p.character.icon;

      // tata posisi jika numpuk
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

/* ---------- SOAL ---------- */

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

// === SOAL TAMBAHAN (dummy, nanti kamu isi sendiri) ===
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
{ question: "Mana yang lebih kecil, 7 atau 9?", answer: "7" }
];

const questionsWithImages = [
{
  question: "Tebak bangun datar ini",
  image: "picture/persegi.png", // path gambar
  answer: "persegi"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/segitiga.png", // path gambar
  answer: "segitiga"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/lingkaran.png", // path gambar
  answer: "lingkaran"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/trapesium.png", // path gambar
  answer: "trapesium"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/jgenjang.png", // path gambar
  answer: "jajar genjang"
},
{
  question: "Tebak bangun datar ini",
  image: "picture/persegip.png", // path gambar
  answer: "persegi panjang"
}
];

const extraQuestions2 = [
  // Warna & benda sehari-hari
  { question: "Apel berwarna merah. Apakah benar? (ya/tidak)", answer: "ya" },
  { question: "Pisang berwarna biru. Apakah benar? (ya/tidak)", answer: "tidak" },
  { question: "Langit siang hari biasanya berwarna biru. Apakah benar? (ya/tidak)", answer: "ya" },
  { question: "Air laut rasanya manis. Apakah benar? (ya/tidak)", answer: "tidak" },
  { question: "Semangka punya biji. Apakah benar? (ya/tidak)", answer: "ya" },

  // Hitungan kecil
  { question: "12 x 3 = ?", answer: "36" },
  { question: "11 x 2 = ?", answer: "22" },
  { question: "12 x 5 = ?", answer: "60" },
  { question: "100 - 6 = ?", answer: "94" },
  { question: "80 + 13 = ?", answer: "93" },

  // Logika jumlah
  { question: "Ada 4 kucing. 1 pergi. Sisa kucing berapa?", answer: "3" },
  { question: "Ada 6 ayam dan 2 bebek. Jumlah semua hewan?", answer: "8" },
  { question: "Ani punya 5 permen. Ia makan 2. Sisa permen Ani?", answer: "3" },
  { question: "Ali punya 3 buku, Budi punya 2 buku. Jumlah buku mereka?", answer: "5" },
  { question: "Jika ada 10 kursi dan 8 anak duduk, berapa kursi kosong?", answer: "2" },

  // Urutan & pola sederhana
  { question: "Urutan angka: 1, 2, 3, ... angka berikutnya?", answer: "4" },
  { question: "Urutan angka: 2, 4, 6, ... angka berikutnya?", answer: "8" },
  { question: "Urutan angka: 5, 6, 7, ... angka berikutnya?", answer: "8" },
  { question: "Urutan huruf: A, B, C, ... huruf berikutnya?", answer: "D" },
  { question: "Urutan huruf: X, Y, Z, ... huruf berikutnya?", answer: "A" },

  // Logika benar/salah sederhana
  { question: "Matahari terbit dari timur. Apakah benar? (ya/tidak)", answer: "ya" },
  { question: "Air panas lebih dingin dari es. Apakah benar? (ya/tidak)", answer: "tidak" },
  { question: "Seekor ikan bisa berenang. Apakah benar? (ya/tidak)", answer: "ya" },
  { question: "Seekor burung bisa terbang. Apakah benar? (ya/tidak)", answer: "ya" },
  { question: "Sepeda punya 3 roda. Apakah benar? (ya/tidak)", answer: "tidak" },

  // Perbandingan mudah
  { question: "Manakah yang lebih besar: 12 atau 8?", answer: "12" },
  { question: "Manakah yang lebih kecil: 3 atau 9?", answer: "3" },
  { question: "Apakah 6 lebih besar dari 5? (ya/tidak)", answer: "ya" },
  { question: "Apakah 2 lebih kecil dari 1? (ya/tidak)", answer: "tidak" },
  { question: "Manakah yang lebih banyak: 7 kue atau 5 kue?", answer: "7" }
];

const extraQuestions3 = [
{ question: "Lanjutkan pola: 2, 4, 6, 8, ...", answer: "10" },
{ question: "Lanjutkan pola: 1, 2, 3, 4, ...", answer: "5" },
{ question: "Lanjutkan pola: 1, 3, 5, 7, ...", answer: "9" },
{ question: "Lanjutkan pola: 2, 3, 5, 7, ...", answer: "11" },
{ question: "Lanjutkan pola: 3, 6, 9, 12, ...", answer: "15" },
{ question: "Urutan huruf: A, B, C, D, ... Huruf berikutnya?", answer: "E" },
{ question: "Apakah angka 38 itu ganjil atau genap?", answer: "genap" },
{ question: "Manakah yang lebih besar, 67 atau 76?", answer: "76" },
{ question: "Siti punya Rp10000. Ia membeli es krim Rp4000 dan roti Rp3000. Sisa uangnya?", answer: "3000" },
{ question: "Harga 1 pensil Rp2000. Jika Rudi membeli 3 pensil, total harganya?", answer: "6000" },
{ question: "Uang Rp10000 dibagi rata untuk 5 anak. Masing-masing dapat?", answer: "2000" },
{ question: "Ani punya Rp2000 lalu membeli permen Rp1500. Sisa uang Ani?", answer: "500" },
{ question: "Budi punya Rp5000 lalu membeli buku Rp3000. Sisa uang Budi?", answer: "2000" },
{ question: "2 hari = berapa jam?", answer: "48" },
{ question: "Manakah lebih besar: 1/2 atau 1/4?", answer: "1/2" },
{ question: "Separuh dari 10 adalah?", answer: "5" },
{ question: "Seperempat dari 20 adalah?", answer: "5" },
{ question: "Seekor ayam punya 2 kaki. Berapa kaki dari 4 ayam?", answer: "8" },
{ question: "Di kebun ada 6 ayam dan 4 bebek. Berapa jumlah semua hewan?", answer: "10" },
{ question: "Siti punya 10 kue. Ia makan 3 kue dan memberi 2 ke temannya. Sisa berapa kue?", answer: "5" },
{ question: "Lanjutkan pola: 4, 8, 12, 16, ...", answer: "20" },
{ question: "Lanjutkan pola: 5, 10, 15, 20, ...", answer: "25" },
{ question: "Urutan huruf: K, L, M, N, ... Huruf berikutnya?", answer: "O" },
{ question: "Apakah angka 47 itu ganjil atau genap?", answer: "ganjil" },
{ question: "Manakah yang lebih kecil, 34 atau 29?", answer: "29" },
{ question: "Harga 1 buku Rp5000. Jika Siti membeli 2 buku, total harganya?", answer: "10000" },
{ question: "Uang Rp12000 dibagi rata untuk 4 anak. Masing-masing dapat?", answer: "3000" },
{ question: "Seekor kambing punya 4 kaki. Berapa kaki dari 3 kambing?", answer: "12" },
{ question: "Separuh dari 16 adalah?", answer: "8" },
{ question: "3 hari = berapa jam?", answer: "72" }
];

const extraQuestions4 = [
  // Pola bilangan & huruf
  { question: "Lanjutkan pola: 2, 4, 6, 8, ...", answer: "10" },
  { question: "Lanjutkan pola: 5, 10, 15, 20, ...", answer: "25" },
  { question: "Lanjutkan pola: 1, 3, 5, 7, ...", answer: "9" },
  { question: "Lanjutkan pola: 10, 20, 30, 40, ...", answer: "50" },
  { question: "Lanjutkan pola: 9, 7, 5, 3, ...", answer: "1" },
  { question: "Urutan huruf: A, B, C, D, ... Huruf berikutnya?", answer: "E" },
  { question: "Urutan huruf: M, N, O, P, ... Huruf berikutnya?", answer: "Q" },
  { question: "Urutan huruf: Z, Y, X, W, ... Huruf berikutnya?", answer: "V" },
  { question: "Urutan huruf: C, E, G, I, ... Huruf berikutnya?", answer: "K" },
  { question: "Urutan huruf: F, H, J, L, ... Huruf berikutnya?", answer: "N" },

  // Perbandingan & logika sederhana
  { question: "Apakah 25 lebih besar dari 30? (ya/tidak)", answer: "tidak" },
  { question: "Apakah 48 lebih kecil dari 50? (ya/tidak)", answer: "ya" },
  { question: "Mana yang ganjil: 14 atau 17?", answer: "17" },
  { question: "Mana yang genap: 21 atau 28?", answer: "28" },
  { question: "Apakah 100 adalah bilangan genap? (ya/tidak)", answer: "ya" },
  { question: "Apakah 77 adalah bilangan ganjil? (ya/tidak)", answer: "ya" },
  { question: "Manakah yang lebih besar, 36 atau 63?", answer: "63" },
  { question: "Manakah yang lebih kecil, 82 atau 28?", answer: "28" },
  { question: "Apakah benar 10 lebih besar dari 15? (ya/tidak)", answer: "tidak" },
  { question: "Apakah benar 7 lebih kecil dari 20? (ya/tidak)", answer: "ya" },

  // Hitungan sederhana
  { question: "Ali punya 3 apel. Budi memberi 2 apel lagi. Sekarang apel Ali berapa?", answer: "5" },
  { question: "Rina punya 10 permen. Ia makan 4. Sisa berapa?", answer: "6" },
  { question: "Hasil dari 14 + 8 adalah?", answer: "22" },
  { question: "Hasil dari 25 - 9 adalah?", answer: "16" },
  { question: "Hasil dari 6 × 3 adalah?", answer: "18" },
  { question: "Hasil dari 20 ÷ 5 adalah?", answer: "4" },
  { question: "Harga 1 roti Rp3000. Jika Rina membeli 2 roti, total harganya?", answer: "6000" },
  { question: "Budi punya Rp10000. Ia membeli mainan Rp7500. Sisa uangnya?", answer: "2500" },
  { question: "Harga 1 pensil Rp2000. Jika Siti membeli 4 pensil, total harganya?", answer: "8000" },
  { question: "Siti punya Rp5000 lalu membeli permen Rp3500. Sisa uangnya?", answer: "1500" },

  // Logika cerita
  { question: "Seekor ayam punya 2 kaki. Berapa kaki dari 3 ayam?", answer: "6" },
  { question: "Seekor kucing tidur siang. Apakah benar semua kucing tidur siang? (ya/tidak)", answer: "tidak" },
  { question: "Ada 3 kursi dan 4 anak. Apakah kursinya cukup? (ya/tidak)", answer: "tidak" },
  { question: "Ada 5 bola merah dan 2 bola biru. Mana yang lebih banyak?", answer: "bola merah" },
  { question: "Jika 1 minggu ada 7 hari, maka 3 minggu ada berapa hari?", answer: "21" },
  { question: "Jika hari ini Selasa, besok hari apa?", answer: "Rabu" },
  { question: "Jika hari ini Jumat, 2 hari lagi hari apa?", answer: "Minggu" },
  { question: "Jika semua buah berwarna merah, apakah apel termasuk merah? (ya/tidak)", answer: "ya" },
  { question: "Jika semua kucing bisa berenang, apakah benar kucingmu bisa berenang? (ya/tidak)", answer: "ya" },
  { question: "Jika ada 6 kambing dan 2 pergi, sisa kambing berapa?", answer: "4" },

  // Pecahan & waktu
  { question: "Setengah dari 12 adalah?", answer: "6" },
  { question: "Seperempat dari 16 adalah?", answer: "4" },
  { question: "Separuh dari 18 adalah?", answer: "9" },
  { question: "Seperempat dari 24 adalah?", answer: "6" },
  { question: "1 jam = berapa menit?", answer: "60" },
  { question: "2 jam = berapa menit?", answer: "120" },
  { question: "30 menit = berapa detik?", answer: "1800" },
  { question: "Setengah hari = berapa jam?", answer: "12" },
  { question: "1 hari = berapa jam?", answer: "24" },
  { question: "3 hari = berapa jam?", answer: "72" },

  // Campuran logika lagi
  { question: "Jika kamu punya 5 kelereng dan kehilangan 2, berapa sisa kelereng?", answer: "3" },
  { question: "Mana lebih berat: 1 kg kapas atau 1 kg besi?", answer: "sama" },
  { question: "Apakah matahari terbit dari timur? (ya/tidak)", answer: "ya" },
  { question: "Apakah air laut berwarna hijau? (ya/tidak)", answer: "tidak" },
  { question: "Jika ada 10 siswa dan 4 pergi, sisa siswa berapa?", answer: "6" },
  { question: "Jika semua manusia bisa berjalan, apakah kamu bisa berjalan? (ya/tidak)", answer: "ya" }
];

const extraQuestions5 = [
  { question: "Lanjutkan pola: 5, 10, 15, 20, ...", answer: "25" },
  { question: "Lanjutkan pola: 2, 4, 8, 16, ...", answer: "32" },
  { question: "Lanjutkan pola: 1, 4, 9, 16, ...", answer: "25" },
  { question: "Lanjutkan pola: 2, 5, 10, 17, ...", answer: "26" },
  { question: "Lanjutkan pola: 11, 13, 17, 19, ...", answer: "23" },

  { question: "Urutan huruf: C, E, G, I, ... Huruf berikutnya?", answer: "K" },
  { question: "Urutan huruf: Z, Y, X, W, ... Huruf berikutnya?", answer: "V" },

  { question: "Apakah angka 121 itu ganjil atau genap?", answer: "ganjil" },
  { question: "Manakah yang lebih kecil, 245 atau 254?", answer: "245" },
  { question: "Hasil dari 15 + 27 adalah?", answer: "42" },
  { question: "Hasil dari 36 - 19 adalah?", answer: "17" },
  { question: "Hasil dari 12 × 4 adalah?", answer: "48" },
  { question: "Hasil dari 84 ÷ 7 adalah?", answer: "12" },

  { question: "Harga 1 buku Rp4500. Jika Budi membeli 3 buku, total harganya?", answer: "13500" },
  { question: "Rina punya Rp20000. Ia membeli mainan Rp12500. Sisa uangnya?", answer: "7500" },
  { question: "Ani punya Rp10000 lalu membeli 2 roti (Rp3500/roti). Sisa uang Ani?", answer: "3000" },

  { question: "3 hari = berapa jam?", answer: "72" },
  { question: "2 minggu = berapa hari?", answer: "14" },
  { question: "1 jam 30 menit = berapa menit?", answer: "90" },

  { question: "Manakah lebih besar: 2/3 atau 3/5?", answer: "2/3" },
  { question: "Berapa 3/4 dari 20?", answer: "15" },
  { question: "Separuh dari 36 adalah?", answer: "18" },
  { question: "Seperempat dari 100 adalah?", answer: "25" },

  { question: "Seekor sapi punya 4 kaki. Berapa kaki dari 5 sapi?", answer: "20" },
  { question: "Di kandang ada 8 kambing dan 12 ayam. Berapa jumlah semua hewan?", answer: "20" },
  { question: "Siti punya 25 kue. Ia makan 7 kue dan memberi 5 ke temannya. Sisa berapa kue?", answer: "13" }
];

function generateLevel1Question() {
  const r = Math.random();

  // 30% soal gambar
  if (r < 0.3) {
    const q = questionsWithImages[Math.floor(Math.random() * questionsWithImages.length)];
    return { question: q.question, answer: q.answer, image: q.image, isDummy: true };
  }

  // 30% soal tambahan (kalau mau persis 30%, ubah ke: else if (r < 0.6))
  if (r < 0.6) {
    const q = extraQuestions1[Math.floor(Math.random() * extraQuestions1.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }

  // default aritmatika level 1
  while (true) {
    const x = randInt(1, 9), y = randInt(1, 9), z = randInt(1, 9);
    const ops = [Math.random() < 0.5 ? '+' : '-', Math.random() < 0.5 ? '+' : '-'];
    const expr = `${x} ${ops[0]} ${y} ${ops[1]} ${z}`;
    const val = eval(expr);
    if (val >= 0) return { question: expr, answer: String(val), isDummy: false };
  }
}


// === Utility umum ===
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

// === Template generator umum ===
// ==========================
// Helper untuk evaluasi ekspresi dengan prioritas operator
// ==========================
// ==========================
// Helper evaluasi dengan prioritas operator
// ==========================
// ==========================
// Helper evaluasi dengan prioritas operator
// ==========================
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

// ==========================
// Level 2
// ==========================
function generateLevel2Question() {
  if (Math.random() < 0.6 && extraQuestions2 && extraQuestions2.length > 0) {
    const q = extraQuestions2[Math.floor(Math.random() * extraQuestions2.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const x = randInt(1, 6), y = randInt(1, 6), z = randInt(1, 6);
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

// ==========================
// Level 3
// ==========================
function generateLevel3Question() {
  if (Math.random() < 0.6 && extraQuestions3 && extraQuestions3.length > 0) {
    const q = extraQuestions3[Math.floor(Math.random() * extraQuestions3.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const a = randInt(1, 6), b = randInt(1, 6), c = randInt(1, 6), d = randInt(1, 6);
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

// ==========================
// Level 4
// ==========================
function generateLevel4Question() {
  if (Math.random() < 0.6 && extraQuestions4 && extraQuestions4.length > 0) {
    const q = extraQuestions4[Math.floor(Math.random() * extraQuestions4.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const a = randInt(1, 6), b = randInt(1, 6), c = randInt(1, 6), d = randInt(1, 6), e = randInt(1, 6);
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

// ==========================
// Level 5
// ==========================
function generateLevel5Question() {
  if (Math.random() < 0.6 && extraQuestions5 && extraQuestions5.length > 0) {
    const q = extraQuestions5[Math.floor(Math.random() * extraQuestions5.length)];
    return { question: q.question, answer: q.answer, isDummy: true };
  }
  while (true) {
    const a = randInt(1, 6), b = randInt(1, 6), c = randInt(1, 6), d = randInt(1, 6), e = randInt(1, 6), f = randInt(1, 6);
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

// --- router untuk soal per level ---
function generateMathQuestion() {
  if (gameState.level === 1) {
    return generateLevel1Question();
  } else if (gameState.level === 2) {
    return generateLevel2Question();
  } else if (gameState.level === 3) {
    return generateLevel3Question();
  } else if (gameState.level === 4) {
    return generateLevel4Question();
  } else if (gameState.level === 5) {
    return generateLevel5Question();
  } else {
    return { question: "Level tidak ditemukan", answer: null };
  }
}


/* ---------- GAMEPLAY ---------- */

let answerTimer = null;
let countdownInterval = null;

function showMathQuestion() {
  const q = generateMathQuestion();
  gameState.currentQuestion = q.question;
  gameState.currentAnswer  = q.answer;
  gameState.currentIsDummy = !!q.isDummy;

  // tampilkan teks soal
  document.getElementById('mathQuestion').textContent = q.question;

  // === tampilkan gambar kalau ada ===
  const imgEl = document.getElementById('questionImage'); // pastikan ada di HTML
  if (q.image) {
      imgEl.src = q.image;
      imgEl.classList.remove('hidden');
  } else {
      imgEl.classList.add('hidden');
  }
  // ================================

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
    sound.currentTime = 0; // mulai ulang setiap kali dipanggil
    sound.play().catch(()=>{}); // biar gak error di browser tertentu
  }
}

// Normalisasi jawaban teks: trim, lowercase, hilangkan aksen/diakritik, rapikan spasi

  // === Helper untuk normalisasi jawaban teks ===
// === Helper untuk normalisasi jawaban teks ===
function normalizeAnswerStr(s) {
    return String(s)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // hapus aksen
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); // rapikan spasi ganda
}

function isTextCorrect(input, correct) {
    if (Array.isArray(correct)) {
        return correct.some(ans => normalizeAnswerStr(input) === normalizeAnswerStr(ans));
    }
    return normalizeAnswerStr(input) === normalizeAnswerStr(correct);
}

function checkAnswer() {
    clearTimers();
    const input = document.getElementById('mathAnswer').value.trim();
    const fb = document.getElementById('answerFeedback');
    const correct = gameState.currentAnswer;
    const isDummy = gameState.currentIsDummy || false;

    if (isDummy) {
        // === ANGKA ===
        if (!isNaN(correct)) {
            const val = Number(input);
            if (isNaN(val)) {
                fb.textContent = 'Masukkan angka yang valid!';
                fb.className = 'mt-6 text-center font-bold text-lg text-red-600';
                fb.classList.remove('hidden');
                return;
            }

            if (val === Number(correct)) {
                // ✅ BENAR
                fb.textContent = '✅ Benar!';
                fb.className = 'mt-6 text-center font-bold text-lg text-green-600';
                fb.classList.remove('hidden');
                playSound("sound-correct");

                setTimeout(() => {
                    closeMathModal();       
                    setTimeout(() => {
                        moveCurrentPlayer(); 
                    }, 1000);
                }, 1000);
            } else {
                // ❌ SALAH
                fb.textContent = `❌ Salah! Jawaban: ${correct}`;
                fb.className = 'mt-6 text-center font-bold text-lg text-red-600';
                fb.classList.remove('hidden');
                playSound("sound-wrong");

                setTimeout(() => {
                    closeMathModal();
                    nextPlayer();
                }, 1500);
            }
        }
        // === TEKS ===
        else {
            if (isTextCorrect(input, correct)) {
                // ✅ BENAR
                fb.textContent = '✅ Benar!';
                fb.className = 'mt-6 text-center font-bold text-lg text-green-600';
                fb.classList.remove('hidden');
                playSound("sound-correct");

                setTimeout(() => {
                    closeMathModal();
                    setTimeout(() => {
                        moveCurrentPlayer();
                    }, 1000);
                }, 1000);
            } else {
                // ❌ SALAH
                fb.textContent = `❌ Salah! Jawaban: ${correct}`;
                fb.className = 'mt-6 text-center font-bold text-lg text-red-600';
                fb.classList.remove('hidden');
                playSound("sound-wrong");

                setTimeout(() => {
                    closeMathModal();
                    nextPlayer();
                }, 1500);
            }
        }
    }
    // === SOAL RANDOM OPERASI ===
    else {
        if (input === "") {
            fb.textContent = '❌ Jawaban tidak boleh kosong!';
            fb.className = 'mt-6 text-center font-bold text-lg text-red-600';
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
            fb.className = 'mt-6 text-center font-bold text-lg text-green-600';
            fb.classList.remove('hidden');
            playSound("sound-correct");

            setTimeout(() => {
                closeMathModal();
                setTimeout(() => {
                    moveCurrentPlayer();
                }, 1000);
            }, 1000);
        } else {
            fb.textContent = `❌ Salah! Jawaban: ${correct}`;
            fb.className = 'mt-6 text-center font-bold text-lg text-red-600';
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

  // lompat ke target berikutnya
  p.pathIndex++;

  // update tampilan token
  updateGameDisplay();

  // kasih animasi hop
  setTimeout(() => {
    document.querySelectorAll('.player-character').forEach(el => {
      if (el.textContent === p.character.icon) {
        el.classList.add('hop-animation');
        el.addEventListener('animationend', () => {
          el.classList.remove('hop-animation'); // reset biar bisa dipakai lagi
        }, { once: true });
      }
    });
  }, 100);

  // cek finish
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
  // Tambahkan ikon pemenang
  const winnerIcon = document.getElementById('winnerIcon');
  winnerIcon.textContent = winner.character.icon;
  winnerIcon.className = 'text-6xl mb-2';

  // Tambahkan teks pemenang
  document.getElementById('winnerText').textContent = `${winner.character.name} Menang!`;
  document.getElementById('winModal').classList.remove('hidden');
  document.getElementById('winModal').classList.add('flex');

  // === Efek Confetti ===
  const duration = 3 * 1000; // 3 detik
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

  // === Efek Suara "yeyy" ===
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

/* ---------- INIT ---------- */

function initializeGame() {
  const ans = document.getElementById('mathAnswer');
  if (ans) ans.addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
  document.getElementById('setupScreen').classList.remove('hidden');
  console.log('Istatak Digital – siap!');
}

document.addEventListener('DOMContentLoaded', initializeGame);
