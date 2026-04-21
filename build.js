const fs = require('fs');
const path = require('path');

// Read country data
const countries = JSON.parse(fs.readFileSync(path.join(__dirname, 'countries.json'), 'utf8'));

// Fix truncated last entry
const last = countries[countries.length - 1];
if (!last.funFact.endsWith('."') && !last.funFact.endsWith('.')) {
  last.funFact += '."';
}

const countriesJS = JSON.stringify(countries, null, 2);

const JS = `
// ===== COUNTRY DATA =====
const COUNTRIES = ${countriesJS};

// ===== ALIAS MAP =====
const ALIAS_MAP = {
  'UK': 'GBR', 'USA': 'USA', 'UAE': 'ARE', 'DRC': 'COD',
  'CAR': 'CAF', 'GRE': 'GRE', 'HK': 'CHN', 'MAC': 'CHN'
};

// ===== UTILS =====
function normalizeCountryName(name) {
  return name.toUpperCase().replace(/[\\s\\-']/g, '').replace(/[^A-Z]/g, '');
}

function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash) + str.charCodeAt(i);
  return Math.abs(hash);
}

function getTodayString() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function getDayNumber(dateStr) {
  const epoch = new Date('2026-04-11');
  const d = new Date(dateStr);
  return Math.floor((d - epoch) / 86400000) + 1;
}

function getDailyCountry() {
  const dateStr = getTodayString();
  const input = 'wordography-' + dateStr;
  const seed = simpleHash(input);
  const valid = COUNTRIES.filter(c => c.normalizedName.length >= 4 && c.normalizedName.length <= 9);
  return valid[seed % valid.length];
}

// ===== GEO FUNCTIONS =====
function toRad(d) { return d * (Math.PI / 180); }

function calculateDistance(c1, c2) {
  const R = 6371;
  const dLat = toRad(c2.lat - c1.lat);
  const dLon = toRad(c2.lon - c1.lon);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLon/2)**2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function getDirection(c1, c2) {
  const dLon = toRad(c2.lon - c1.lon);
  const y = Math.sin(dLon) * Math.cos(toRad(c2.lat));
  const x = Math.cos(toRad(c1.lat)) * Math.sin(toRad(c2.lat)) - Math.sin(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.cos(dLon);
  let bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const dirs = [
    {label:'N',emoji:'↑',min:337.5,max:360},{label:'NE',emoji:'↗',min:22.5,max:67.5},
    {label:'E',emoji:'→',min:67.5,max:112.5},{label:'SE',emoji:'↘',min:112.5,max:157.5},
    {label:'S',emoji:'↓',min:157.5,max:202.5},{label:'SW',emoji:'↙',min:202.5,max:247.5},
    {label:'W',emoji:'←',min:247.5,max:292.5},{label:'NW',emoji:'↖',min:292.5,max:337.5}
  ];
  if (bearing >= 337.5 || bearing < 22.5) return dirs[0];
  return dirs.find(d => bearing >= d.min && bearing < d.max);
}

function getDistanceLabel(km) {
  if (km === 0) return {label:'YOU GOT IT',emoji:'🎯',color:'#56D364'};
  if (km < 500) return {label:'Very Close!',emoji:'🔥',color:'#2EA043'};
  if (km < 2000) return {label:'Getting Warm',emoji:'👍',color:'#D29922'};
  if (km < 5000) return {label:'Mid-Range',emoji:'🤷',color:'#8B949E'};
  if (km < 10000) return {label:'Far',emoji:'❄️',color:'#6E7681'};
  return {label:'Very Far',emoji:'🌍',color:'#484F58'};
}

// ===== LETTER EVALUATION (Wordle rules) =====
function evaluateLetters(guess, target) {
  const result = guess.split('').map(() => ({letter:'',state:'absent'}));
  const targetLetters = target.split('');
  const used = new Set();

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = {letter: guess[i], state: 'correct'};
      used.add(i);
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i].state === 'correct') continue;
    let found = -1;
    for (let j = 0; j < targetLetters.length; j++) {
      if (!used.has(j) && targetLetters[j] === guess[i]) { found = j; break; }
    }
    if (found !== -1) {
      result[i] = {letter: guess[i], state: 'present'};
      used.add(found);
    } else {
      result[i] = {letter: guess[i], state: 'absent'};
    }
  }
  return result;
}

// ===== GAME STATE =====
let gameState = {
  targetCountry: null, targetDate: null, guesses: [], status: 'playing',
  guessCount: 0, maxGuesses: 6, letterStates: {}, mode: 'daily'
};
let selectedCountry = null;
let dropdownSelected = -1;
let filteredCountries = [];

// ===== DOM REFS =====
const $ = id => document.getElementById(id);
const grid = $('grid-container');
const searchInput = $('country-search');
const dropdown = $('country-dropdown');
const guessBtn = $('guess-btn');
const dirDisplay = $('dir-display');
const distDisplay = $('dist-display');
const geoPlaceholder = $('geo-placeholder');
const dirArrow = $('direction-arrow');
const dirLabel = $('direction-label');
const distNumber = $('distance-number');
const distLabel = $('distance-label');
const dayBadge = $('day-badge');
const streakBadge = $('streak-badge');
const streakCount = $('streak-count');
const modalOverlay = $('modal-overlay');
const modalContent = $('modal-content');
const toastContainer = $('toast-container');

// ===== INITIALIZE =====
function init() {
  const saved = loadState();
  const today = getTodayString();
  
  if (saved && saved.targetDate === today) {
    gameState = saved;
  } else {
    gameState.targetCountry = getDailyCountry();
    gameState.targetDate = today;
    gameState.guesses = [];
    gameState.status = 'playing';
    gameState.guessCount = 0;
    gameState.letterStates = {};
  }

  renderGrid();
  renderKeyboard();
  updateStreakBadge();
  
  const dayNum = getDayNumber(gameState.targetDate);
  dayBadge.textContent = 'Day #' + dayNum;

  searchInput.addEventListener('input', onSearchInput);
  searchInput.addEventListener('keydown', onSearchKeydown);
  guessBtn.addEventListener('click', submitGuess);
  $('stats-btn').addEventListener('click', showStats);
  $('help-btn').addEventListener('click', showHelp);
  $('settings-btn').addEventListener('click', showSettings);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

  if (gameState.status !== 'playing') {
    setTimeout(() => gameState.status === 'won' ? showWinModal() : showLossModal(), 500);
  }
}

// ===== RENDER GRID =====
function renderGrid() {
  const len = gameState.targetCountry.normalizedName.length;
  grid.innerHTML = '';
  
  for (let row = 0; row < 6; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'guess-row';
    rowEl.id = 'row-' + row;

    if (row < gameState.guesses.length) {
      const g = gameState.guesses[row];
      const flagEl = document.createElement('span');
      flagEl.className = 'flag-emoji';
      flagEl.textContent = g.country.flag;
      rowEl.appendChild(flagEl);

      const tilesEl = document.createElement('div');
      tilesEl.className = 'tiles-row';
      g.letters.forEach((tile, i) => {
        const t = document.createElement('div');
        t.className = 'tile';
        t.dataset.state = tile.state;
        t.textContent = tile.letter;
        t.style.animationDelay = (i * 150) + 'ms';
        tilesEl.appendChild(t);
      });
      rowEl.appendChild(tilesEl);

      const geoEl = document.createElement('div');
      geoEl.className = 'row-geo';
      geoEl.innerHTML = '<span class="row-arrow-dist">' + g.direction.emoji + ' ' + g.distance.toLocaleString() + ' km</span>';
      const lbl = getDistanceLabel(g.distance);
      geoEl.innerHTML += '<span class="row-dist-label">' + lbl.label + '</span>';
      rowEl.appendChild(geoEl);
    } else if (row === gameState.guessCount && gameState.status === 'playing') {
      const tilesEl = document.createElement('div');
      tilesEl.className = 'tiles-row current-row';
      for (let i = 0; i < len; i++) {
        const t = document.createElement('div');
        t.className = 'tile';
        t.id = 'tile-' + i;
        t.dataset.state = 'empty';
        tilesEl.appendChild(t);
      }
      rowEl.appendChild(tilesEl);
    } else {
      const tilesEl = document.createElement('div');
      tilesEl.className = 'tiles-row';
      for (let i = 0; i < len; i++) {
        const t = document.createElement('div');
        t.className = 'tile';
        t.dataset.state = 'empty';
        tilesEl.appendChild(t);
      }
      rowEl.appendChild(tilesEl);
    }
    grid.appendChild(rowEl);
  }
}

// ===== RENDER KEYBOARD =====
function renderKeyboard() {
  const kb = $('keyboard');
  kb.innerHTML = '';
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard-row';
    row.split('').forEach(key => {
      const k = document.createElement('button');
      k.className = 'key';
      k.id = 'key-' + key;
      k.textContent = key;
      const s = gameState.letterStates[key];
      if (s) k.classList.add('used-' + s);
      k.addEventListener('click', () => {
        searchInput.value += key;
        onSearchInput();
      });
      rowEl.appendChild(k);
    });
    kb.appendChild(rowEl);
  });
  const lastRow = document.createElement('div');
  lastRow.className = 'keyboard-row';
  const bs = document.createElement('button');
  bs.className = 'key backspace-key';
  bs.textContent = '⌫';
  bs.addEventListener('click', () => {
    searchInput.value = searchInput.value.slice(0, -1);
    onSearchInput();
  });
  lastRow.appendChild(bs);
  kb.appendChild(lastRow);
}

// ===== SEARCH / AUTOCOMPLETE =====
function onSearchInput() {
  const q = searchInput.value.trim();
  if (q.length < 1) { hideDropdown(); return; }
  const nq = normalizeCountryName(q);
  filteredCountries = COUNTRIES
    .filter(c => {
      if (c.normalizedName.length < 4 || c.normalizedName.length > 9) return false;
      if (c.normalizedName === nq) return 3;
      if (c.normalizedName.startsWith(nq)) return 2;
      if (c.normalizedName.includes(nq)) return 1;
      return 0;
    })
    .sort((a,b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name))
    .slice(0, 8);
  dropdownSelected = -1;
  renderDropdown();
  showDropdown();
}

function onSearchKeydown(e) {
  if (!dropdown.classList.contains('visible')) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    dropdownSelected = Math.min(dropdownSelected + 1, filteredCountries.length - 1);
    renderDropdown();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    dropdownSelected = Math.max(dropdownSelected - 1, 0);
    renderDropdown();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (dropdownSelected >= 0 && filteredCountries[dropdownSelected]) {
      selectCountry(filteredCountries[dropdownSelected]);
    }
  } else if (e.key === 'Escape') {
    hideDropdown();
  }
}

function renderDropdown() {
  dropdown.innerHTML = filteredCountries.map((c, i) =>
    '<div class="country-dropdown-item' + (i === dropdownSelected ? ' selected' : '') + '" data-index="' + i + '">' +
    '<span class="dropdown-flag">' + c.flag + '</span>' +
    '<span class="dropdown-name">' + c.name + '</span>' +
    '<span class="dropdown-cont">' + c.continent + '</span></div>'
  ).join('');
  dropdown.querySelectorAll('.country-dropdown-item').forEach(item => {
    item.addEventListener('click', () => selectCountry(filteredCountries[parseInt(item.dataset.index)]));
  });
}

function showDropdown() { dropdown.classList.add('visible'); }
function hideDropdown() { dropdown.classList.remove('visible'); }

function selectCountry(country) {
  selectedCountry = country;
  searchInput.value = country.flag + ' ' + country.name;
  guessBtn.disabled = false;
  hideDropdown();
  const len = gameState.targetCountry.normalizedName.length;
  const name = country.normalizedName;
  for (let i = 0; i < len; i++) {
    const t = document.getElementById('tile-' + i);
    if (t) {
      t.textContent = name[i] || '';
      t.dataset.state = name[i] ? 'filled' : 'empty';
      t.classList.add('filled');
    }
  }
}

// ===== SUBMIT GUESS =====
function submitGuess() {
  if (!selectedCountry || gameState.status !== 'playing') return;
  const country = selectedCountry;

  // Check already guessed
  if (gameState.guesses.some(g => g.country.id === country.id)) {
    showToast('Already guessed ' + country.name, 'error');
    searchInput.classList.add('shake');
    setTimeout(() => searchInput.classList.remove('shake'), 300);
    return;
  }

  const target = gameState.targetCountry;
  const letters = evaluateLetters(country.normalizedName, target.normalizedName);
  const distance = calculateDistance(country, target);
  const direction = getDirection(country, target);

  gameState.guesses.push({ country, letters, distance, direction });
  gameState.guessCount++;
  updateLetterStates(letters);
  saveState();

  // Animate tiles
  const row = document.getElementById('row-' + (gameState.guessCount - 1));
  const tiles = row.querySelectorAll('.tile');
  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('flipping');
      setTimeout(() => {
        tile.dataset.state = letters[i].state;
        tile.classList.remove('flipping');
        if (letters[i].state === 'correct') {
          setTimeout(() => tile.classList.add('correct-pulse'), 100);
        }
      }, 250);
    }, i * 150);
  });

  // Update geo strip
  geoPlaceholder.style.display = 'none';
  dirDisplay.style.display = 'flex';
  distDisplay.style.display = 'flex';
  setTimeout(() => {
    dirArrow.textContent = direction.emoji;
    dirArrow.classList.add('bounce');
    dirLabel.textContent = direction.label;
    distNumber.textContent = distance.toLocaleString();
    distLabel.textContent = getDistanceLabel(distance).label;
    distLabel.style.color = getDistanceLabel(distance).color;
  }, tiles.length * 150 + 300);

  // Clear input
  selectedCountry = null;
  searchInput.value = '';
  guessBtn.disabled = true;

  // Check win/loss
  const won = letters.every(l => l.state === 'correct');
  if (won) {
    gameState.status = 'won';
    saveState();
    updateStreak(true);
    setTimeout(() => showWinModal(), tiles.length * 150 + 1200);
  } else if (gameState.guessCount >= gameState.maxGuesses) {
    gameState.status = 'lost';
    saveState();
    updateStreak(false);
    setTimeout(() => showLossModal(), tiles.length * 150 + 1200);
  }

  renderKeyboard();
}

// ===== LETTER STATES =====
function updateLetterStates(feedback) {
  feedback.forEach(tile => {
    const cur = gameState.letterStates[tile.letter];
    if (cur === 'correct') return;
    if (cur === 'present' && tile.state === 'absent') return;
    gameState.letterStates[tile.letter] = tile.state;
  });
}

// ===== STATS =====
function getStats() {
  try {
    return JSON.parse(localStorage.getItem('wordography_stats') || '{"played":0,"won":0,"streak":0,"maxStreak":0,"dist":[0,0,0,0,0,0]}');
  } catch { return {played:0,won:0,streak:0,maxStreak:0,dist:[0,0,0,0,0,0]}; }
}

function saveStats(s) { localStorage.setItem('wordography_stats', JSON.stringify(s)); }

function updateStreak(won) {
  const stats = getStats();
  stats.played++;
  if (won) {
    stats.won++;
    stats.streak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    stats.dist[gameState.guessCount - 1]++;
  } else {
    stats.streak = 0;
  }
  saveStats(stats);
  updateStreakBadge();
}

function updateStreakBadge() {
  const stats = getStats();
  if (stats.streak > 0) {
    streakBadge.classList.remove('hidden');
    streakCount.textContent = stats.streak;
  } else {
    streakBadge.classList.add('hidden');
  }
}

function showStats() {
  const stats = getStats();
  const winPct = stats.played > 0 ? Math.round(stats.won / stats.played * 100) : 0;
  const max = Math.max(...stats.dist, 1);
  let html = '<div class="modal-title">📊 Statistics</div>';
  html += '<div class="stats-grid">';
  html += '<div class="stat-item"><div class="stat-value">' + stats.played + '</div><div class="stat-label">Played</div></div>';
  html += '<div class="stat-item"><div class="stat-value">' + winPct + '%</div><div class="stat-label">Win %</div></div>';
  html += '<div class="stat-item"><div class="stat-value">' + stats.streak + '</div><div class="stat-label">Streak</div></div>';
  html += '<div class="stat-item"><div class="stat-value">' + stats.maxStreak + '</div><div class="stat-label">Max</div></div>';
  html += '</div>';
  html += '<div class="distribution-title">Guess Distribution</div>';
  for (let i = 0; i < 6; i++) {
    const n = stats.dist[i];
    const wide = Math.max(20, Math.round(n / max * 100));
    const isHighlight = gameState.status === 'won' && gameState.guessCount === i + 1;
    html += '<div class="dist-row">';
    html += '<div class="dist-num">' + (i+1) + '</div>';
    html += '<div class="dist-bar' + (isHighlight ? ' highlight' : '') + '" style="width:' + wide + '%">' + n + '</div>';
    html += '</div>';
  }
  html += '<div class="modal-buttons" style="margin-top:20px"><button class="modal-btn secondary" onclick="closeModal()">Close</button></div>';
  showModal(html);
}

// ===== HELP =====
function showHelp() {
  const html = '<div class="modal-title">❓ How to Play</div>' +
    '<div class="modal-subtitle">Guess the secret country in 6 tries.<br>Each guess reveals:</div>' +
    '<div style="text-align:left;font-size:14px;color:var(--text-secondary);line-height:1.8">' +
    '<div style="margin-bottom:12px"><span style="color:var(--feedback-correct);font-weight:700">🟩 Green</span> = correct position</div>' +
    '<div style="margin-bottom:12px"><span style="color:var(--feedback-present);font-weight:700">🟨 Yellow</span> = wrong position</div>' +
    '<div style="margin-bottom:12px"><span style="color:var(--feedback-absent);font-weight:700">⬛ Grey</span> = not in name</div>' +
    '<div style="margin-bottom:12px">📍 <strong>Direction + Distance</strong> = how far and which direction from your guess to the target</div>' +
    '<div style="color:var(--accent-arrow)">↑ → ↓ ← ↗ ↘ ↙ ↖</div>' +
    '</div>' +
    '<div class="modal-buttons" style="margin-top:20px"><button class="modal-btn secondary" onclick="closeModal()">Got it!</button></div>';
  showModal(html);
}

// ===== SETTINGS =====
function showSettings() {
  const isLight = document.body.dataset.theme === 'light';
  const isCB = document.body.dataset.colorblind === 'on';
  let html = '<div class="modal-title">⚙️ Settings</div>';
  html += '<div class="settings-row"><div><div class="settings-label">Light Mode</div><div class="settings-desc">Switch to light theme</div></div>';
  html += '<label class="toggle"><input type="checkbox" id="toggle-light"' + (isLight ? ' checked' : '') + ' onchange="toggleTheme()"><span class="toggle-slider"></span></label></div>';
  html += '<div class="settings-row"><div><div class="settings-label">Color-Blind Mode</div><div class="settings-desc">Blue instead of green, orange instead of yellow</div></div>';
  html += '<label class="toggle"><input type="checkbox" id="toggle-cb"' + (isCB ? ' checked' : '') + ' onchange="toggleColorBlind()"><span class="toggle-slider"></span></label></div>';
  html += '<div class="settings-row"><div><div class="settings-label">Practice Mode</div><div class="settings-desc">Play a random country (not tracked)</div></div>';
  html += '<button class="modal-btn secondary" onclick="playPractice()" style="padding:8px 16px">Play</button></div>';
  html += '<div class="modal-buttons" style="margin-top:20px"><button class="modal-btn secondary" onclick="closeModal()">Close</button></div>';
  showModal(html);
}

function toggleTheme() {
  document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('wordography_theme', document.body.dataset.theme);
}

function toggleColorBlind() {
  document.body.dataset.colorblind = document.body.dataset.colorblind === 'on' ? 'off' : 'on';
  localStorage.setItem('wordography_cb', document.body.dataset.colorblind);
}

function playPractice() {
  closeModal();
  const valid = COUNTRIES.filter(c => c.normalizedName.length >= 4 && c.normalizedName.length <= 9);
  const c = valid[Math.floor(Math.random() * valid.length)];
  gameState = { targetCountry: c, targetDate: 'practice', guesses: [], status: 'playing', guessCount: 0, maxGuesses: 6, letterStates: {}, mode: 'practice' };
  dirDisplay.style.display = 'none';
  distDisplay.style.display = 'none';
  geoPlaceholder.style.display = 'flex';
  renderGrid();
  renderKeyboard();
  dayBadge.textContent = '🎲 Practice';
  saveState();
}

// ===== WIN/LOSS MODALS =====
function showWinModal() {
  spawnConfetti();
  const g = gameState.guesses[gameState.guessCount - 1];
  const target = gameState.targetCountry;
  const html = '<div class="modal-title">🎉 Brilliant!</div>' +
    '<div class="modal-subtitle">You got ' + target.name + ' in ' + gameState.guessCount + '/6 guesses</div>' +
    '<div class="modal-answer"><span class="modal-flag">' + target.flag + '</span><span class="modal-country-name">' + target.name + '</span></div>' +
    '<div class="modal-geo">' + g.direction.emoji + ' ' + g.distance.toLocaleString() + ' km — ' + getDistanceLabel(g.distance).label + '</div>' +
    '<div class="modal-fact">"' + target.funFact + '"</div>' +
    '<div class="modal-buttons">' +
    '<button class="modal-btn primary" onclick="shareResults()">📤 Share</button>' +
    '<button class="modal-btn secondary" onclick="closeModal()">Close</button></div>';
  showModal(html);
}

function showLossModal() {
  const target = gameState.targetCountry;
  const html = '<div class="modal-title">😢 So Close!</div>' +
    '<div class="modal-subtitle">The answer was</div>' +
    '<div class="modal-answer"><span class="modal-flag">' + target.flag + '</span><span class="modal-country-name">' + target.name + '</span></div>' +
    '<div class="modal-geo">🎯 0 km — YOU GOT IT!</div>' +
    '<div class="modal-fact">"' + target.funFact + '"</div>' +
    '<div class="modal-buttons">' +
    '<button class="modal-btn primary" onclick="shareResults()">📤 Share</button>' +
    '<button class="modal-btn secondary" onclick="closeModal()">Close</button></div>';
  showModal(html);
}

function showModal(html) {
  modalContent.innerHTML = html;
  modalOverlay.classList.add('visible');
}

function closeModal() { modalOverlay.classList.remove('visible'); }

// ===== SHARE =====
function shareResults() {
  const dayNum = getDayNumber(gameState.targetDate);
  const gc = gameState.guessCount;
  const won = gameState.status === 'won';
  let text = 'WORDOGRAPHY #' + dayNum + ' ' + gc + '/6\\n\\n';
  gameState.guesses.forEach(g => {
    g.letters.forEach(l => {
      if (l.state === 'correct') text += '🟩';
      else if (l.state === 'present') text += '🟨';
      else text += '⬛';
    });
    text += '\\n';
  });
  const last = gameState.guesses[gameState.guesses.length - 1];
  text += '\\n' + last.direction.emoji + ' ' + last.distance.toLocaleString() + ' km';
  
  $('share-textarea').value = text;
  $('share-textarea').select();
  document.execCommand('copy');
  showToast('Copied to clipboard!', 'success');
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  toastContainer.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== CONFETTI =====
function spawnConfetti() {
  const colors = ['#2EA043','#E3B341','#D29922','#56D364','#F0F6FC'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
    c.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

// ===== PERSISTENCE =====
function saveState() {
  const toSave = { targetCountryId: gameState.targetCountry?.id, targetDate: gameState.targetDate, guesses: gameState.guesses.map(g => ({ countryId: g.country.id, letters: g.letters, distance: g.distance, direction: g.direction })), status: gameState.status, guessCount: gameState.guessCount, letterStates: gameState.letterStates, mode: gameState.mode };
  localStorage.setItem('wordography_state', JSON.stringify(toSave));
}

function loadState() {
  try {
    const raw = localStorage.getItem('wordography_state');
    if (!raw) return null;
    const s = JSON.parse(raw);
    s.targetCountry = COUNTRIES.find(c => c.id === s.targetCountryId) || getDailyCountry();
    s.guesses = s.guesses.map(g => ({ country: COUNTRIES.find(c => c.id === g.countryId), letters: g.letters, distance: g.distance, direction: g.direction }));
    return s;
  } catch { return null; }
}

// Load theme preference
if (localStorage.getItem('wordography_theme') === 'light') document.body.dataset.theme = 'light';
if (localStorage.getItem('wordography_cb') === 'on') document.body.dataset.colorblind = 'on';

// Boot
init();
`;

module.exports = { JS, COUNTRIES: countries };
