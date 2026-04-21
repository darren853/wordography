#!/usr/bin/env node
const fs = require('fs');
const countries = require('./countries.json');
const countriesJS = JSON.stringify(countries);

// Read CSS and HTML templates
const CSS = fs.readFileSync(__dirname + '/style.css', 'utf8') || `
:root{--bg-base:#0D1117;--bg-surface:#161B22;--bg-elevated:#21262D;--bg-border:#30363D;--text-primary:#F0F6FC;--text-secondary:#8B949E;--text-tertiary:#6E7681;--feedback-correct:#2EA043;--feedback-present:#D29922;--feedback-absent:#484F58;--accent-arrow:#E3B341;--accent-error:#F85149;--accent-success:#56D364;--tile-bg-empty:#21262D;--tile-border-empty:#30363D;--tile-text:#F0F6FC;--modal-overlay:rgba(13,17,23,0.88);--shadow:0 4px 24px rgba(0,0,0,0.5);--font-ui:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--font-mono:'JetBrains Mono','SF Mono','Fira Code',Consolas,monospace}
[data-theme="light"]{--bg-base:#F5F5F0;--bg-surface:#FFFFFF;--bg-elevated:#EFEFEA;--bg-border:#D0D0C8;--text-primary:#1A1A1A;--text-secondary:#6E6E6A;--text-tertiary:#9E9E9A;--feedback-absent:#C4C4BC;--accent-arrow:#D29922;--tile-bg-empty:#EFEFEA;--tile-border-empty:#D0D0C8;--tile-text:#1A1A1A;--modal-overlay:rgba(245,245,240,0.88);--shadow:0 4px 24px rgba(0,0,0,0.15)}
[data-colorblind="on"]{--feedback-correct:#58A6FF;--feedback-present:#F78166}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden}
body{font-family:var(--font-ui);background:var(--bg-base);color:var(--text-primary);display:flex;flex-direction:column;align-items:center;min-height:100dvh;overflow:hidden;position:relative}
header{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--bg-border);background:var(--bg-surface);flex-shrink:0;gap:8px}
.logo{font-size:18px;font-weight:800;letter-spacing:3px;text-transform:uppercase;display:flex;align-items:center;gap:6px;user-select:none}
.logo-emoji{font-size:20px}
.header-center{display:flex;align-items:center;gap:8px}
.day-badge{background:var(--bg-elevated);border:1px solid var(--bg-border);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:var(--text-secondary);letter-spacing:0.5px}
.header-right{display:flex;align-items:center;gap:6px}
.streak-badge{font-size:14px;font-weight:600;color:var(--accent-arrow);display:flex;align-items:center;gap:3px}
.streak-badge.hidden{display:none}
.icon-btn{width:34px;height:34px;border-radius:8px;border:none;background:transparent;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:17px;transition:background .15s,color .15s}
.icon-btn:hover{background:var(--bg-elevated);color:var(--text-primary)}
main{flex:1;width:100%;max-width:520px;display:flex;flex-direction:column;padding:0 12px;overflow:hidden}
.geo-feedback-strip{display:flex;align-items:center;justify-content:center;gap:24px;padding:12px 0;min-height:72px}
.direction-display,.distance-display{display:flex;flex-direction:column;align-items:center;gap:2px}
.direction-arrow{font-size:36px;line-height:1;color:var(--accent-arrow);text-shadow:0 0 20px rgba(227,179,65,.4);transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.direction-arrow.bounce{animation:arrowBounce .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes arrowBounce{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
.direction-label{font-size:10px;font-weight:600;color:var(--text-tertiary);letter-spacing:1px;text-transform:uppercase}
.distance-number{font-size:26px;font-weight:800;color:var(--text-primary);font-family:var(--font-mono);line-height:1}
.distance-km{font-size:11px;font-weight:500;color:var(--text-tertiary)}
.distance-label{font-size:10px;font-weight:600;color:var(--accent-arrow);letter-spacing:.5px;text-align:center;max-width:80px}
.geo-placeholder{flex-direction:column;align-items:center;gap:4px}
.geo-placeholder-text{font-size:20px;color:var(--text-tertiary);opacity:.5}
.geo-placeholder-sub{font-size:10px;color:var(--text-tertiary);letter-spacing:1px;text-transform:uppercase}
.grid-container{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 0;overflow-y:auto;scrollbar-width:none}
.grid-container::-webkit-scrollbar{display:none}
.guess-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;width:100%;justify-content:center}
.flag-emoji{font-size:18px;flex-shrink:0}
.tiles-row{display:flex;gap:4px;justify-content:center}
.tile{width:40px;height:48px;border:2px solid var(--tile-border-empty);border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:20px;font-weight:700;text-transform:uppercase;background:var(--tile-bg-empty);color:var(--tile-text);user-select:none;position:relative;transition:border-color .15s}
.tile.filled{border-color:var(--text-tertiary);animation:tilePop .1s ease}
@keyframes tilePop{0%{transform:scale(.85)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
.tile.flipping{animation:tileFlip .5s ease forwards}
@keyframes tileFlip{0%{transform:rotateX(0)}50%{transform:rotateX(-90deg)}100%{transform:rotateX(0)}}
.tile[data-state="correct"]{background:var(--feedback-correct);border-color:var(--feedback-correct);color:#fff}
.tile[data-state="present"]{background:var(--feedback-present);border-color:var(--feedback-present);color:#fff}
.tile[data-state="absent"]{background:var(--feedback-absent);border-color:var(--feedback-absent);color:#fff}
.tile[data-state="empty"]{background:var(--tile-bg-empty);border-color:var(--tile-border-empty)}
.tile.correct-pulse{animation:correctPulse .3s ease}
@keyframes correctPulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
.tile.wave{animation:tileWave .3s ease}
@keyframes tileWave{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
.row-geo{display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:68px;flex-shrink:0}
.row-arrow-dist{font-size:11px;font-weight:700;color:var(--accent-arrow);font-family:var(--font-mono)}
.row-dist-label{font-size:9px;color:var(--text-tertiary)}
.input-zone{padding:8px 0;flex-shrink:0}
.search-container{position:relative;width:100%}
.search-input-wrapper{display:flex;gap:8px;align-items:center}
.country-search{flex:1;height:46px;padding:0 14px;font-size:15px;font-family:var(--font-ui);background:var(--bg-elevated);border:2px solid var(--bg-border);border-radius:10px;color:var(--text-primary);outline:none;transition:border-color .2s}
.country-search:focus{border-color:var(--accent-arrow)}
.country-search::placeholder{color:var(--text-tertiary)}
.country-search.shake{animation:shake .3s ease}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
.guess-btn{height:46px;padding:0 18px;font-size:13px;font-weight:700;font-family:var(--font-ui);background:var(--feedback-correct);color:#fff;border:none;border-radius:10px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;transition:opacity .15s,transform .1s;white-space:nowrap}
.guess-btn:hover:not(:disabled){opacity:.9}
.guess-btn:active:not(:disabled){transform:scale(.97)}
.guess-btn:disabled{background:var(--bg-border);color:var(--text-tertiary);cursor:not-allowed}
.country-dropdown{position:absolute;top:calc(100%+4px);left:0;right:0;background:var(--bg-elevated);border:1px solid var(--bg-border);border-radius:10px;max-height:220px;overflow-y:auto;z-index:100;display:none;box-shadow:var(--shadow)}
.country-dropdown.visible{display:block}
.country-dropdown-item{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;font-size:14px;font-weight:500;transition:background .1s;border-bottom:1px solid var(--bg-border)}
.country-dropdown-item:last-child{border-bottom:none}
.country-dropdown-item:hover,.country-dropdown-item.selected{background:var(--bg-surface)}
.dropdown-flag{font-size:17px}
.dropdown-name{color:var(--text-primary)}
.dropdown-cont{margin-left:auto;font-size:10px;color:var(--text-tertiary)}
.keyboard-zone{padding:6px 0 10px;flex-shrink:0}
.keyboard{display:flex;flex-direction:column;gap:5px;align-items:center}
.keyboard-row{display:flex;gap:3px}
.key{height:44px;min-width:24px;padding:0 3px;border-radius:5px;border:none;font-family:var(--font-mono);font-size:12px;font-weight:700;cursor:pointer;background:var(--bg-elevated);color:var(--text-secondary);display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s,transform .08s;text-transform:uppercase}
.key:hover{background:var(--bg-border);color:var(--text-primary)}
.key:active{transform:scale(.94)}
.key.used-correct{background:var(--feedback-correct);color:#fff}
.key.used-present{background:var(--feedback-present);color:#fff}
.key.used-absent{background:var(--feedback-absent);color:var(--text-tertiary)}
.key.backspace-key{min-width:46px;font-size:15px}
.modal-overlay{position:fixed;inset:0;background:var(--modal-overlay);z-index:1000;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.modal-overlay.visible{display:flex}
.modal{background:var(--bg-surface);border:1px solid var(--bg-border);border-radius:16px;padding:28px 24px;max-width:390px;width:100%;text-align:center;box-shadow:var(--shadow);animation:modalSlideUp .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes modalSlideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-title{font-size:26px;font-weight:800;margin-bottom:8px}
.modal-subtitle{font-size:15px;color:var(--text-secondary);margin-bottom:16px;line-height:1.5}
.modal-answer{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px}
.modal-flag{font-size:34px}
.modal-country-name{font-size:22px;font-weight:700;letter-spacing:2px}
.modal-geo{font-size:16px;font-weight:600;color:var(--accent-arrow);margin-bottom:16px}
.modal-fact{font-size:13px;color:var(--text-secondary);line-height:1.6;padding:12px;background:var(--bg-elevated);border-radius:10px;margin-bottom:20px;font-style:italic}
.modal-buttons{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.modal-btn{padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;font-family:var(--font-ui);cursor:pointer;border:none;text-transform:uppercase;letter-spacing:.5px;transition:opacity .15s,transform .1s}
.modal-btn:active{transform:scale(.97)}
.modal-btn.primary{background:var(--feedback-correct);color:#fff}
.modal-btn.secondary{background:var(--bg-elevated);color:var(--text-primary);border:1px solid var(--bg-border)}
.modal-btn:hover{opacity:.9}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px}
.stat-item{display:flex;flex-direction:column;align-items:center;gap:2px}
.stat-value{font-size:28px;font-weight:800;color:var(--text-primary)}
.stat-label{font-size:10px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.5px;text-align:center}
.distribution-title{font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;text-align:left}
.dist-row{display:flex;align-items:center;gap:5px;margin-bottom:3px}
.dist-num{font-size:11px;font-weight:700;color:var(--text-tertiary);width:12px;text-align:right;flex-shrink:0}
.dist-bar{height:18px;background:var(--feedback-correct);border-radius:3px;min-width:18px;display:flex;align-items:center;justify-content:flex-end;padding-right:5px;font-size:10px;font-weight:700;color:#fff;transition:width .5s ease}
.dist-bar.highlight{background:var(--accent-arrow)}
.dist-bar.empty{background:var(--bg-elevated);color:var(--text-tertiary)}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--bg-border)}
.settings-row:last-child{border-bottom:none}
.settings-label{font-size:15px;font-weight:600;color:var(--text-primary)}
.settings-desc{font-size:11px;color:var(--text-tertiary);margin-top:2px}
.toggle{position:relative;width:44px;height:26px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.toggle-slider{position:absolute;inset:0;background:var(--bg-border);border-radius:13px;cursor:pointer;transition:background .2s}
.toggle-slider::before{content:'';position:absolute;width:20px;height:20px;border-radius:50%;background:white;top:3px;left:3px;transition:transform .2s}
.toggle input:checked+.toggle-slider{background:var(--feedback-correct)}
.toggle input:checked+.toggle-slider::before{transform:translateX(18px)}
.toast-container{position:fixed;top:68px;left:50%;transform:translateX(-50%);z-index:2000;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
.toast{background:var(--bg-elevated);border:1px solid var(--bg-border);border-radius:10px;padding:10px 20px;font-size:14px;font-weight:600;color:var(--text-primary);box-shadow:var(--shadow);animation:toastIn .3s ease,toastOut .3s ease 2.7s forwards;pointer-events:auto;white-space:nowrap}
.toast.error{border-left:4px solid var(--accent-error)}
.toast.success{border-left:4px solid var(--accent-success)}
@keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastOut{from{opacity:1}to{opacity:0}}
.confetti-piece{position:fixed;top:-10px;width:10px;height:10px;z-index:3000;pointer-events:none;animation:confettiFall linear forwards}
@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg)}}
.share-textarea{position:fixed;left:-9999px;top:-9999px;opacity:0}
@media(min-width:420px){.tile{width:48px;height:56px;font-size:23px}}
@media(min-width:500px){.tile{width:54px;height:62px;font-size:25px}.logo{font-size:20px}}
@media(max-height:680px){.geo-feedback-strip{min-height:56px;padding:6px 0}.tile{height:42px;font-size:19px;width:38px}.tiles-row{gap:3px}.guess-row{margin-bottom:3px}.key{height:40px}}
@media(max-height:580px){header{padding:7px 16px}.tile{height:38px;font-size:17px;width:34px}.direction-arrow{font-size:28px}.distance-number{font-size:22px}}
`;

// Game JS
const JS = `
const COUNTRIES=${countriesJS};
const ALIAS_MAP={'UK':'GBR','USA':'USA','UAE':'ARE','DRC':'COD','CAR':'CAF'};
function normalizeCountryName(n){return n.toUpperCase().replace(/[\\s\\-']/g,'').replace(/[^A-Z]/g,'')}
function simpleHash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)+s.charCodeAt(i);return Math.abs(h)}
function getTodayString(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function getDayNumber(d){const e=new Date('2026-04-11');return Math.floor((new Date(d)-e)/86400000)+1}
function getDailyCountry(){const t=getTodayString();const s=simpleHash('wordography-'+t);const v=COUNTRIES.filter(c=>c.normalizedName.length>=4&&c.normalizedName.length<=9);return v[s%v.length]}
function toRad(d){return d*(Math.PI/180)}
function calculateDistance(c1,c2){const R=6371;const dLat=toRad(c2.lat-c1.lat);const dLon=toRad(c2.lon-c1.lon);const a=Math.sin(dLat/2)**2+Math.cos(toRad(c1.lat))*Math.cos(toRad(c2.lat))*Math.sin(dLon/2)**2;return Math.round(2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))}
function getDirection(c1,c2){const dLon=toRad(c2.lon-c1.lon);const y=Math.sin(dLon)*Math.cos(toRad(c2.lat));const x=Math.cos(toRad(c1.lat))*Math.sin(toRad(c2.lat))-Math.sin(toRad(c1.lat))*Math.cos(toRad(c2.lat))*Math.cos(dLon);let b=(Math.atan2(y,x)*180/Math.PI+360)%360;const dirs=[{label:'N',emoji:'↑',min:337.5,max:360},{label:'NE',emoji:'↗',min:22.5,max:67.5},{label:'E',emoji:'→',min:67.5,max:112.5},{label:'SE',emoji:'↘',min:112.5,max:157.5},{label:'S',emoji:'↓',min:157.5,max:202.5},{label:'SW',emoji:'↙',min:202.5,max:247.5},{label:'W',emoji:'←',min:247.5,max:292.5},{label:'NW',emoji:'↖',min:292.5,max:337.5}];if(b>=337.5||b<22.5)return dirs[0];return dirs.find(d=>b>=d.min&&b<d.max)}
function getDistanceLabel(km){if(km===0)return{label:'YOU GOT IT',emoji:'🎯',color:'#56D364'};if(km<500)return{label:'Very Close!',emoji:'🔥',color:'#2EA043'};if(km<2000)return{label:'Getting Warm',emoji:'👍',color:'#D29922'};if(km<5000)return{label:'Mid-Range',emoji:'🤷',color:'#8B949E'};if(km<10000)return{label:'Far',emoji:'❄️',color:'#6E7681'};return{label:'Very Far',emoji:'🌍',color:'#484F58'}}
function evaluateLetters(guess,target){const result=guess.split('').map(()=>({letter:'',state:'absent'}));const targetLetters=target.split('');const used=new Set();for(let i=0;i<guess.length;i++){if(guess[i]===target[i]){result[i]={letter:guess[i],state:'correct'};used.add(i)}}for(let i=0;i<guess.length;i++){if(result[i].state==='correct')continue;let found=-1;for(let j=0;j<targetLetters.length;j++){if(!used.has(j)&&targetLetters[j]===guess[i]){found=j;break}}if(found!==-1){result[i]={letter:guess[i],state:'present'};used.add(found)}else{result[i]={letter:guess[i],state:'absent'}}}return result}
let gameState={targetCountry:null,targetDate:null,guesses:[],status:'playing',guessCount:0,maxGuesses:6,letterStates:{},mode:'daily'};
let selectedCountry=null,dropdownSelected=-1,filteredCountries=[];
const $=id=>document.getElementById(id);
const grid=$('grid-container'),searchInput=$('country-search'),dropdown=$('country-dropdown'),guessBtn=$('guess-btn'),dirDisplay=$('dir-display'),distDisplay=$('dist-display'),geoPlaceholder=$('geo-placeholder'),dirArrow=$('direction-arrow'),dirLabel=$('direction-label'),distNumber=$('distance-number'),distLabel=$('distance-label'),dayBadge=$('day-badge'),streakBadge=$('streak-badge'),streakCount=$('streak-count'),modalOverlay=$('modal-overlay'),modalContent=$('modal-content'),toastContainer=$('toast-container');
function init(){const saved=loadState();const today=getTodayString();if(saved&&saved.targetDate===today){gameState=saved}else{gameState.targetCountry=getDailyCountry();gameState.targetDate=today;gameState.guesses=[];gameState.status='playing';gameState.guessCount=0;gameState.letterStates={}}renderGrid();renderKeyboard();updateStreakBadge();dayBadge.textContent='Day #'+getDayNumber(gameState.targetDate);searchInput.addEventListener('input',onSearchInput);searchInput.addEventListener('keydown',onSearchKeydown);guessBtn.addEventListener('click',submitGuess);$('stats-btn').addEventListener('click',showStats);$('help-btn').addEventListener('click',showHelp);$('settings-btn').addEventListener('click',showSettings);modalOverlay.addEventListener('click',e=>{if(e.target===modalOverlay)closeModal()});if(gameState.status!=='playing')setTimeout(()=>gameState.status==='won'?showWinModal():showLossModal(),500)}
function renderGrid(){const len=gameState.targetCountry.normalizedName.length;grid.innerHTML='';for(let row=0;row<6;row++){const rowEl=document.createElement('div');rowEl.className='guess-row';rowEl.id='row-'+row;if(row<gameState.guesses.length){const g=gameState.guesses[row];const flagEl=document.createElement('span');flagEl.className='flag-emoji';flagEl.textContent=g.country.flag;rowEl.appendChild(flagEl);const tilesEl=document.createElement('div');tilesEl.className='tiles-row';g.letters.forEach((tile,i)=>{const t=document.createElement('div');t.className='tile';t.dataset.state=tile.state;t.textContent=tile.letter;t.style.animationDelay=(i*150)+'ms';tilesEl.appendChild(t)});rowEl.appendChild(tilesEl);const geoEl=document.createElement('div');geoEl.className='row-geo';geoEl.innerHTML='<span class="row-arrow-dist">'+g.direction.emoji+' '+g.distance.toLocaleString()+' km</span><span class="row-dist-label">'+getDistanceLabel(g.distance).label+'</span>';rowEl.appendChild(geoEl)}else if(row===gameState.guessCount&&gameState.status==='playing'){const tilesEl=document.createElement('div');tilesEl.className='tiles-row current-row';for(let i=0;i<len;i++){const t=document.createElement('div');t.className='tile';t.id='tile-'+i;t.dataset.state='empty';tilesEl.appendChild(t)}rowEl.appendChild(tilesEl)}else{const tilesEl=document.createElement('div');tilesEl.className='tiles-row';for(let i=0;i<len;i++){const t=document.createElement('div');t.className='tile';t.dataset.state='empty';tilesEl.appendChild(t)}rowEl.appendChild(tilesEl)}grid.appendChild(rowEl)}}
function renderKeyboard(){const kb=$('keyboard');kb.innerHTML='';const rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];rows.forEach(row=>{const rowEl=document.createElement('div');rowEl.className='keyboard-row';row.split('').forEach(key=>{const k=document.createElement('button');k.className='key';k.id='key-'+key;k.textContent=key;const s=gameState.letterStates[key];if(s)k.classList.add('used-'+s);k.addEventListener('click',()=>{searchInput.value+=key;onSearchInput()});rowEl.appendChild(k)});kb.appendChild(rowEl)});const lastRow=document.createElement('div');lastRow.className='keyboard-row';const bs=document.createElement('button');bs.className='key backspace-key';bs.textContent='⌫';bs.addEventListener('click',()=>{searchInput.value=searchInput.value.slice(0,-1);onSearchInput()});lastRow.appendChild(bs);kb.appendChild(lastRow)}
function onSearchInput(){const q=searchInput.value.trim();if(q.length<1){hideDropdown();return}const nq=normalizeCountryName(q);filteredCountries=COUNTRIES.filter(c=>{if(c.normalizedName.length<4||c.normalizedName.length>9)return false;const n=c.normalizedName;if(n===nq)return 3;if(n.startsWith(nq))return 2;if(n.includes(nq))return 1;return 0}).sort((a,b)=>{if(b.score!==a.score)return b.score-a.score;return a.name.localeCompare(b.name)}).slice(0,8);filteredCountries.forEach((c,i)=>c._score=i);dropdownSelected=-1;renderDropdown();showDropdown()}
function onSearchKeydown(e){if(!dropdown.classList.contains('visible'))return;if(e.key==='ArrowDown'){e.preventDefault();dropdownSelected=Math.min(dropdownSelected+1,filteredCountries.length-1);renderDropdown()}else if(e.key==='ArrowUp'){e.preventDefault();dropdownSelected=Math.max(dropdownSelected-1,0);renderDropdown()}else if(e.key==='Enter'){e.preventDefault();if(dropdownSelected>=0&&filteredCountries[dropdownSelected])selectCountry(filteredCountries[dropdownSelected])}else if(e.key==='Escape')hideDropdown()}
function renderDropdown(){dropdown.innerHTML=filteredCountries.map((c,i)=>'<div class="country-dropdown-item'+(i===dropdownSelected?' selected':'')+'" data-index="'+i+'"><span class="dropdown-flag">'+c.flag+'</span><span class="dropdown-name">'+c.name+'</span><span class="dropdown-cont">'+c.continent+'</span></div>').join('');dropdown.querySelectorAll('.country-dropdown-item').forEach(item=>{item.addEventListener('click',()=>selectCountry(filteredCountries[parseInt(item.dataset.index)]))})}
function showDropdown(){dropdown.classList.add('visible')}function hideDropdown(){dropdown.classList.remove('visible')}
function selectCountry(country){selectedCountry=country;searchInput.value=country.flag+' '+country.name;guessBtn.disabled=false;hideDropdown();const len=gameState.targetCountry.normalizedName.length;const name=country.normalizedName;for(let i=0;i<len;i++){const t=document.getElementById('tile-'+i);if(t){t.textContent=name[i]||'';t.dataset.state=name[i]?'filled':'empty';t.classList.add('filled')}}}
function submitGuess(){if(!selectedCountry||gameState.status!=='playing')return;const country=selectedCountry;if(gameState.guesses.some(g=>g.country.id===country.id)){showToast('Already guessed '+country.name,'error');searchInput.classList.add('shake');setTimeout(()=>searchInput.classList.remove('shake'),300);return}const target=gameState.targetCountry;const letters=evaluateLetters(country.normalizedName,target.normalizedName);const distance=calculateDistance(country,target);const direction=getDirection(country,target);gameState.guesses.push({country,letters,distance,direction});gameState.guessCount++;updateLetterStates(letters);saveState();const row=document.getElementById('row-'+(gameState.guessCount-1));const tiles=row.querySelectorAll('.tile');tiles.forEach((tile,i)=>{setTimeout(()=>{tile.classList.add('flipping');setTimeout(()=>{tile.dataset.state=letters[i].state;tile.classList.remove('flipping');if(letters[i].state==='correct')setTimeout(()=>tile.classList.add('correct-pulse'),100)},250)},i*150)});geoPlaceholder.style.display='none';dirDisplay.style.display='flex';distDisplay.style.display='flex';setTimeout(()=>{dirArrow.textContent=direction.emoji;dirArrow.classList.add('bounce');dirLabel.textContent=direction.label;distNumber.textContent=distance.toLocaleString();distLabel.textContent=getDistanceLabel(distance).label;distLabel.style.color=getDistanceLabel(distance).color},tiles.length*150+300);selectedCountry=null;searchInput.value='';guessBtn.disabled=true;const won=letters.every(l=>l.state==='correct');if(won){gameState.status='won';saveState();updateStreak(true);setTimeout(()=>showWinModal(),tiles.length*150+1200)}else if(gameState.guessCount>=gameState.maxGuesses){gameState.status='lost';saveState();updateStreak(false);setTimeout(()=>showLossModal(),tiles.length*150+1200)}renderKeyboard()}
function updateLetterStates(feedback){feedback.forEach(tile=>{const cur=gameState.letterStates[tile.letter];if(cur==='correct')return;if(cur==='present'&&tile.state==='absent')return;gameState.letterStates[tile.letter]=tile.state})}
function getStats(){try{return JSON.parse(localStorage.getItem('wordography_stats')||'{"played":0,"won":0,"streak":0,"maxStreak":0,"dist":[0,0,0,0,0,0]}')}catch{return{played:0,won:0,streak:0,maxStreak:0,dist:[0,0,0,0,0,0]}}}
function saveStats(s){localStorage.setItem('wordography_stats',JSON.stringify(s))}
function updateStreak(won){const stats=getStats();stats.played++;if(won){stats.won++;stats.streak++;stats.maxStreak=Math.max(stats.maxStreak,stats.streak);stats.dist[gameState.guessCount-1]++}else{stats.streak=0}saveStats(stats);updateStreakBadge()}
function updateStreakBadge(){const stats=getStats();if(stats.streak>0){streakBadge.classList.remove('hidden');streakCount.textContent=stats.streak}else{streakBadge.classList.add('hidden')}}
function showStats(){const stats=getStats();const winPct=stats.played>0?Math.round(stats.won/stats.played*100):0;const max=Math.max(...stats.dist,1);let html='<div class="modal-title">📊 Statistics</div>';html+='<div class="stats-grid">';html+='<div class="stat-item"><div class="stat-value">'+stats.played+'</div><div class="stat-label">Played</div></div>';html+='<div class="stat-item"><div class="stat-value">'+winPct+'%</div><div class="stat-label">Win %</div></div>';html+='<div class="stat-item"><div class="stat-value">'+stats.streak+'</div><div class="stat-label">Streak</div></div>';html+='<div class="stat-item"><div class="stat-value">'+stats.maxStreak+'</div><div class="stat-label">Max</div></div>';html+='</div>';html+='<div class="distribution-title">Guess Distribution</div>';for(let i=0;i<6;i++){const n=stats.dist[i];const wide=Math.max(20,Math.round(n/max*100));const isHighlight=gameState.status==='won'&&gameState.guessCount===i+1;html+='<div class="dist-row"><div class="dist-num">'+(i+1)+'</div><div class="dist-bar'+(isHighlight?' highlight':'')+'" style="width:'+wide+'%">'+n+'</div></div>'}html+='<div class="modal-buttons" style="margin-top:20px"><button class="modal-btn secondary" onclick="closeModal()">Close</button></div>';showModal(html)}
function showHelp(){const html='<div class="modal-title">❓ How to Play</div><div class="modal-subtitle">Guess the secret country in 6 tries.<br>Each guess reveals:</div><div style="text-align:left;font-size:14px;color:var(--text-secondary);line-height:1.8"><div style="margin-bottom:12px"><span style="color:var(--feedback-correct);font-weight:700">🟩 Green</span> = correct position</div><div style="margin-bottom:12px"><span style="color:var(--feedback-present);font-weight:700">🟨 Yellow</span> = wrong position</div><div style="margin-bottom:12