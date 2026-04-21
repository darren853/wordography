#!/usr/bin/env python3
"""Generate the complete Wordography HTML file."""
import json

# Read countries
with open('/Users/bob/workspace/wordography/countries.json', 'r') as f:
    countries = json.load(f)

# Build COUNTRIES JS array
countries_lines = []
for c in countries:
    countries_lines.append(
        f'{{"id":"{c["id"]}","name":"{c["name"]}","normalizedName":"{c["normalizedName"]}","lat":{c["lat"]},"lon":{c["lon"]},"continent":"{c["continent"]}","flag":"{c["flag"]}","funFact":"{c["funFact"]}"}}'
    )
countries_js = '[' + ','.join(countries_lines) + ']'

# Game JS (compact, all in one line)
js = f'''
var COUNTRIES={countries_js};
var G={{t:null,d:null,g:[],s:'playing',n:0,m:6,l:{{}},p:null,i:-1,f:[]};
var $=function(id){{return document.getElementById(id)}};
var grid=$('grid-container'),searchInput=$('country-search'),dropdown=$('country-dropdown'),guessBtn=$('guess-btn'),dirDisplay=$('dir-display'),distDisplay=$('dist-display'),geoPlaceholder=$('geo-placeholder'),dirArrow=$('direction-arrow'),dirLabel=$('direction-label'),distNumber=$('distance-number'),distLabel=$('distance-label'),dayBadge=$('day-badge'),streakBadge=$('streak-badge'),streakCount=$('streak-count'),modalOverlay=$('modal-overlay'),modalContent=$('modal-content'),toastContainer=$('toast-container');
function nm(n){{return n.toUpperCase().replace(/[\\s\\-']/g,'').replace(/[^A-Z]/g,'')}}
function sh(s){{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)+s.charCodeAt(i);return Math.abs(h)}}
function td(){{var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}}
function dn(d){{var e=new Date('2026-04-11');return Math.floor((new Date(d)-e)/86400000)+1}}
function dc(){{var t=td(),s=sh('wordography-'+t);var v=COUNTRIES.filter(function(c){{return c.normalizedName.length>=4&&c.normalizedName.length<=9}});return v[s%v.length]}}
function tr(d){{return d*(Math.PI/180)}}
function cd(c1,c2){{var R=6371;var dLat=tr(c2.lat-c1.lat);var dLon=tr(c2.lon-c1.lon);var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(tr(c1.lat))*Math.cos(tr(c2.lat))*Math.sin(dLon/2)*Math.sin(dLon/2);return Math.round(2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))}}
function dr(c1,c2){{var dLon=tr(c2.lon-c1.lon);var y=Math.sin(dLon)*Math.cos(tr(c2.lat));var x=Math.cos(tr(c1.lat))*Math.sin(tr(c2.lat))-Math.sin(tr(c1.lat))*Math.cos(tr(c2.lat))*Math.cos(dLon);var b=(Math.atan2(y,x)*180/Math.PI+360)%360;var ds=[{{l:'N',e:'↑',mi:337.5,ma:360}},{{l:'NE',e:'↗',mi:22.5,ma:67.5}},{{l:'E',e:'→',mi:67.5,ma:112.5}},{{l:'SE',e:'↘',mi:112.5,ma:157.5}},{{l:'S',e:'↓',mi:157.5,ma:202.5}},{{l:'SW',e:'↙',mi:202.5,ma:247.5}},{{l:'W',e:'←',mi:247.5,ma:292.5}},{{l:'NW',e:'↖',mi:292.5,ma:337.5}}];if(b>=337.5||b<22.5)return ds[0];for(var i=0;i<ds.length;i++){{if(b>=ds[i].mi&&b<ds[i].ma)return ds[i]}}}}
function dl(km){{if(km===0)return{{l:'YOU GOT IT',e:'🎯',c:'#56D364'}};if(km<500)return{{l:'Very Close!',e:'🔥',c:'#2EA043'}};if(km<2000)return{{l:'Getting Warm',e:'👍',c:'#D29922'}};if(km<5000)return{{l:'Mid-Range',e:'🤷',c:'#8B949E'}};if(km<10000)return{{l:'Far',e:'❄️',c:'#6E7681'}};return{{l:'Very Far',e:'🌍',c:'#484F58'}}}}
function el(g,t){{var r=g.split('').map(function(){{return{{l:'',s:'absent'}}}});var tl=t.split('');var u=new Set();for(var i=0;i<g.length;i++){{if(g[i]===t[i]){{r[i]={{l:g[i],s:'correct'}};u.add(i)}}}}for(var i=0;i<g.length;i++){{if(r[i].s==='correct')continue;var f=-1;for(var j=0;j<tl.length;j++){{if(!u.has(j)&&tl[j]===g[i]){{f=j;break}}}}if(f!==-1){{r[i]={{l:g[i],s:'present'}};u.add(f)}}else{r[i]={{l:g[i],s:'absent'}}}}return r}}
function init(){{var s=ls();var today=td();if(s&&s.d===today){{G=s}}else{{G.t=dc();G.d=today;G.g=[];G.s='playing';G.n=0;G.l={{}}}}rg();rk();us();dayBadge.textContent='Day #'+dn(G.d);searchInput.addEventListener('input',osi);searchInput.addEventListener('keydown',osk);guessBtn.addEventListener('click',sg);$('stats-btn').addEventListener('click',showStats);$('help-btn').addEventListener('click',showHelp);$('settings-btn').addEventListener('click',showSettings);modalOverlay.addEventListener('click',function(e){{if(e.target===modalOverlay)cm()}});if(G.s!=='playing')setTimeout(function(){{G.s==='won'?showWinModal():showLossModal()}},500)}}
function rg(){{var len=G.t.normalizedName.length;grid.innerHTML='';for(var row=0;row<6;row++){{var rowEl=document.createElement('div');rowEl.className='guess-row';rowEl.id='row-'+row;if(row<G.g.length){{var g=G.g[row];var flagEl=document.createElement('span');flagEl.className='flag-emoji';flagEl.textContent=g.c.flag;rowEl.appendChild(flagEl);var tilesEl=document.createElement('div');tilesEl.className='tiles-row';g.l.forEach(function(tile,i){{var t=document.createElement('div');t.className='tile';t.dataset.state=tile.s;t.textContent=tile.l;t.style.animationDelay=(i*150)+'ms';tilesEl.appendChild(t)}});rowEl.appendChild(tilesEl);var geoEl=document.createElement('div');geoEl.className='row-geo';geoEl.innerHTML='<span class="row-arrow-dist">'+g.dir.e+' '+g.dist.toLocaleString()+' km</span><span class="row-dist-label">'+dl(g.dist).l+'</span>';rowEl.appendChild(geoEl)}}else if(row===G.n&&G.s==='playing'){{var tilesEl=document.createElement('div');tilesEl.className='tiles-row current-row';for(var i=0;i<len;i++){{var t=document.createElement('div');t.className='tile';t.id='tile-'+i;t.dataset.state='empty';tilesEl.appendChild(t)}}rowEl.appendChild(tilesEl)}}else{{var tilesEl=document.createElement('div');tilesEl.className='tiles-row';for(var i=0;i<len;i++){{var t=document.createElement('div');t.className='tile';t.dataset.state='empty';tilesEl.appendChild(t)}}rowEl.appendChild(tilesEl)}}grid.appendChild(rowEl)}}}}
function rk(){{var kb=$('keyboard');kb.innerHTML='';var rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];rows.forEach(function(row){{var rowEl=document.createElement('div');rowEl.className='keyboard-row';row.split('').forEach(function(key){{var k=document.createElement('button');k.className='key';k.id='key-'+key;k.textContent=key;var st=G.l[key];if(st)k.classList.add('used-'+st);k.addEventListener('click',function(){{searchInput.value+=key;osi()}});rowEl.appendChild(k)}});kb.appendChild(rowEl)}});var lastRow=document.createElement('div');lastRow.className='keyboard-row';var bs=document.createElement('button');bs.className='key backspace-key';bs.textContent='⌫';bs.addEventListener('click',function(){{searchInput.value=searchInput.value.slice(0,-1);osi()}});lastRow.appendChild(bs);kb.appendChild(lastRow)}}
function osi(){{var q=searchInput.value.trim();if(q.length<1){hd();return}var nq=nm(q);G.f=COUNTRIES.filter(function(c){{if(c.normalizedName.length<4||c.normalizedName.length>9)return false;var n=c.normalizedName;if(n===nq)return 3;if(n.startsWith(nq))return 2;if(n.includes(nq))return 1;return 0}}).sort(function(a,b){{if(b._s!==a._s)return b._s-a._s;return a.name.localeCompare(b.name)}}).slice(0,8);G.f.forEach(function(c,i){{c._s=i}});G.i=-1;rd();sd()}}
function osk(e){{if(!dropdown.classList.contains('visible'))return;if(e.key==='ArrowDown'){{e.preventDefault();G.i=Math.min(G.i+1,G.f.length-1);rd()}}else if(e.key==='ArrowUp'){{e.preventDefault();G.i=Math.max(G.i-1,0);rd()}}else if(e.key==='Enter'){{e.preventDefault();if(G.i>=0&&G.f[G.i])sc(G.f[G.i])}}else if(e.key==='Escape')hd()}}
function rd(){{dropdown.innerHTML=G.f.map(function(c,i){{return'<div class="country-dropdown-item'+(i===G.i?' selected':'')+'" data-index="'+i+'"><span class="dropdown-flag">'+c.flag+'</span><span class="dropdown-name">'+c.name+'</span><span class="dropdown-cont">'+c.continent+'</span></div>'}}).join('');dropdown.querySelectorAll('.country-dropdown-item').forEach(function(item){{item.addEventListener('click',function(){{sc(G.f[parseInt(item.dataset.index)])}})}})}}
function sd(){dropdown.classList.add('visible')}}function hd(){dropdown.classList.remove('visible')}
function sc(country){{G.p=country;searchInput.value=country.flag+' '+country.name;guessBtn.disabled=false;hd();var len=G.t.normalizedName.length;var name=country.normalizedName;for(var i=0;i<len;i++){{var t=document.getElementById('tile-'+i);if(t){t.textContent=name[i]||'';t.dataset.state=name[i]?'filled':'empty';t.classList.add('filled')}}}}
function sg(){{if(!G.p||G.s!=='playing')return;var country=G.p;if(G.g.some(function(g){{return g.c.id===country.id}})){{showToast('Already guessed '+country.name,'error');searchInput.classList.add('shake');setTimeout(function(){searchInput.classList.remove('shake')},300);return}}var target=G.t;var letters=el(country.normalizedName,target.normalizedName);var distance=cd(country,target);var direction=dr(country,target);G.g.push({{c:country,l:letters,dist:distance,dir:direction}});G.n++;uls(letters);ss();var row=document.getElementById('row-'+(G.n-1));var tiles=row.querySelectorAll('.tile');tiles.forEach(function(tile,i){{setTimeout(function(){{tile.classList.add('flipping');setTimeout(function(){{tile.dataset.state=letters[i].s;tile.classList.remove('flipping');if(letters[i].s==='correct')setTimeout(function(){tile.classList.add('correct-pulse')},100)}},250)}},i*150)}});geoPlaceholder.style.display='none';dirDisplay.style.display='flex';distDisplay.style.display='flex';setTimeout(function(){{dirArrow.textContent=direction.e;dirArrow.classList.add('bounce');dirLabel.textContent=direction.l;distNumber.textContent=distance.toLocaleString();distLabel.textContent=dl(distance).l;distLabel.style.color=dl(distance).c}},tiles.length*150+300);G.p=null;searchInput.value='';guessBtn.disabled=true;var won=letters.every(function(l){{return l.s==='correct'}});if(won){{G.s='won';ss();ust(true);setTimeout(function(){showWinModal()},tiles.length*150+1200)}}else if(G.n>=G.m){{G.s='lost';ss();ust(false);setTimeout(function(){showLossModal()},tiles.length*150+1200)}}rk()}}
function uls(feedback){{feedback.forEach(function(tile){{var cur=G.l[tile.l];if(cur==='correct')return;if(cur==='present'&&tile.s==='absent')return;G.l[tile.l]=tile.s}})}}
function gs(){{try{{return JSON.parse(localStorage.getItem('wordography_stats')||'{"p":0,"w":0,"st":0,"mst":0,"d":[0,0,0,0,0,0]}')}catch{{return{{p:0,w:0,st:0,mst:0,d:[0,0,0,0,0,0]}}}}}}
function ss(s){localStorage.setItem('wordography_stats',JSON.stringify(s))}
function ust(won){{var stats=gs();stats.p++;if(won){{stats.w++;stats.st++;stats.mst=Math.max(stats.mst,stats.st);stats.d[G.n-1]++}}else{{stats.st=0}}ss(stats);us()}}
function us(){{var stats=gs();if(stats.st>0){streakBadge.classList.remove('hidden');streakCount.textContent=stats.st}else{streakBadge.classList.add('hidden')}}
function showStats(){{var stats=gs();var winPct=stats.p>0?Math.round(stats.w/stats.p*100):0;var max=Math.max.apply(null,stats.d.concat([1]));var html='<div class="modal-title">📊 Statistics</div>';html+='<div class="stats-grid">';html+='<div class="stat-item"><div class="stat-value">'+stats.p+'</div><div class="stat-label">Played</div></div>';html+='<div class="stat-item"><div class="stat-value">'+winPct+'%</div><div class="stat-label">Win %</div></div>';html+='<div class="stat-item"><div class="stat-value">'+stats.st+'</div><div class="stat-label">Streak</div></div>';html+='<div class="stat-item"><div class="stat-value">'+stats.mst+'</div><div class="stat-label">Max</div></div>';html+='</div>';html+='<div class="distribution-title">Guess Distribution</div>';for(var i=0;i<6;i++){{var n=stats.d[i];var wide=Math.max(20,Math.round(n/max*100));var isHighlight=G.s==='won'&&G.n===i+1;html+='<div class="dist-row"><div class="dist-num">'+(i+1)+'</div><div class="dist-bar'+(isHighlight?' highlight':'')+'" style="width:'+wide+'%">'+n+'</div></div>'}}html+='<div class="modal-buttons" style="margin-top:20px"><button class="modal-btn secondary" onclick="cm()">Close</button></div>';showModal(html)}}
function showHelp(){{var html='<div class="modal-title">❓ How to Play</div><div class="modal-subtitle">Guess the secret country in 6 tries.<br>Each guess reveals:</div><div style="text-align:left;font-size:14px;color:var(--text-secondary);line-height:1.8;margin-bottom:12px"><span style="color:var(--feedback-correct);font-weight:700">🟩 Green</span> = correct position<br><span style="color:var(--feedback-present);font-weight:700">🟨 Yellow</span> = wrong position<br><span style="color:var(--feedback-absent);font-weight:700">⬛ Grey</span> = not in name<br><br><span style="color:var(--accent-arrow)">📍 Direction + Distance = how far and which direction from your guess to the target</span></div><div class="modal-buttons" style="margin-top:16px"><button class="modal-btn secondary" onclick="cm()">Got it!</button></div>';showModal(html)}}
function showSettings(){{var isLight=document.body.dataset.theme==='light';var isCB=document.body.dataset.colorblind==='on';var html='<div class="modal-title">⚙️ Settings</div>';html+='<div class="settings-row"><div><div class="settings-label">Light Mode</div><div class="settings-desc">Switch to light theme</div></div><label class="toggle"><input type="checkbox" id="toggle-light"'+(isLight?' checked':'')+' onchange="tt()"><span class="toggle-slider"></span></label></div>';html+='<div class="settings-row"><div><div class="settings-label">Color-Blind Mode</div><div class="settings-desc">Blue instead of green, orange instead of yellow</div></div><label class="toggle"><input type="checkbox" id="toggle-cb"'+(isCB?' checked':'')+' onchange="tcb()"><span class="toggle-slider"></span></label></div>';html+='<div class="settings-row"><div><div class="settings-label">Practice Mode</div><div class="settings-desc">Play a random country</div></div><button class="modal-btn secondary" onclick="pp()" style="padding:8px 16px">Play</button></div>';html+='<div class="modal-buttons" style="margin-top:20px"><button class="modal-btn secondary" onclick="cm()">Close</button></div>';showModal(html)}}
function tt(){document.body.dataset.theme=document.body.dataset.theme==='light'?'dark':'light';localStorage.setItem('wordography_theme',document.body.dataset.theme)}
function tcb(){document.body.dataset.colorblind=document.body.dataset.colorblind==='on'?'off':'on';localStorage.setItem('wordography_cb',document.body.dataset.colorblind)}
function pp(){cm();var valid=COUNTRIES.filter(function(c){return c.normalizedName.length>=4&&c.normalizedName.length<=9});var c=valid[Math.floor(Math.random()*valid.length)];G={{t:c,d:'practice',g:[],s:'playing',n:0,m:6,l:{{}},p:null,i:-1,f:[]};dirDisplay.style.display='none';distDisplay.style.display='none';geoPlaceholder.style.display='flex';rg();rk();dayBadge.textContent='🎲 Practice';ss()}
function showWinModal(){{spawnConfetti();var g=G.g[G.n-1];var target=G.t;var html='<div class="modal-title">🎉 Brilliant!</div><div class="modal-subtitle">You got '+target.name+' in '+G.n+'/6 guesses</div><div class="modal-answer"><span class="modal-flag">'+target.flag+'</span><span class="modal-country-name">'+target.name+'</span></div><div class="modal-geo">'+g.dir.e+' '+g.dist.toLocaleString()+' km — '+dl(g.dist).l+'</div><div class="modal-fact">"'+target.funFact+'"</div><div class="modal-buttons"><button class="modal-btn primary" onclick="shr()">📤 Share</button><button class="modal-btn secondary" onclick="cm()">Close</button></div>';showModal(html)}}
function showLossModal(){{var target=G.t;var html='<div class="modal-title">😢 So Close!</div><div class="modal-subtitle">The answer was</div><div class="modal-answer"><span class="modal-flag">'+target.flag+'</span><span class="modal-country-name">'+target.name+'</span></div><div class="modal-geo">🎯 0 km — YOU GOT IT!</div><div class="modal-fact">"'+target.funFact+'"</div><div class="modal-buttons"><button class="modal-btn primary" onclick="shr()">📤 Share</button><button class="modal-btn secondary" onclick="cm()">Close</button></div>';showModal(html)}}
function showModal(html){modalContent.innerHTML=html;modalOverlay.classList.add('visible')}
function cm(){modalOverlay.classList.remove('visible')}
function shr(){var dayNum=dn(G.d);var gc=G.n;var text='WORDOGRAPHY #'+dayNum+' '+gc+'/6\\n\\n';G.g.forEach(function(g){g.l.forEach(function(l){if(l.s==='correct')text+='🟩';else if(l.s==='present')text+='🟨';else text+='⬛'});text+='\\n'});var last=G.g[G.g.length-1];text+='\\n'+last.dir.e+' '+last.dist.toLocaleString()+' km';$('share-textarea').value=text;$('share-textarea').select();document.execCommand('copy');showToast('Copied to clipboard!','success')}
function showToast(msg,type){var t=document.createElement('div');t.className='toast'+(type?' '+type:'');t.textContent=msg;toastContainer.appendChild(t);setTimeout(function(){t.remove()},3000)}
function spawnConfetti(){var colors=['#2EA043','#E3B341','#D29922','#56D364','#F0F6FC'];for(var i=0;i<60;i++){var c=document.createElement('div');c.className='confetti-piece';c.style.left=Math.random()*100+'vw';c.style.background=colors[Math.floor(Math.random()*colors.length)];c.style.animationDuration=(1.5+Math.random()*1.5)+'s';c.style.animationDelay=Math.random()*0.5+'s';document.body.appendChild(c);setTimeout(function(){c.remove()},4000)}}
function ss(){var toSave={{tId:G.t&&G.t.id,d:G.d,g:G.g.map(function(x){{return{{cId:x.c.id,l:x.l,dist:x.dist,dir:x.dir}}}}),s:G.s,n:G.n,l:G.l}};localStorage.setItem('wordography_state',JSON.stringify(toSave))}
function ls(){try{var raw=localStorage.getItem('wordography_state');if(!raw)return null;var s=JSON.parse(raw);s.t=COUNTRIES.find(function(c){{return c.id===s.tId}})||dc();s.g=s.g.map(function(x){{return{{c:COUNTRIES.find(function(c){{return c.id===x.cId}}),l:x.l,dist:x.dist,dir:x.dir}}}});return s}catch{{return null}}}
if(localStorage.getItem('wordography_theme')==='light')document.body.dataset.theme='light';
if(localStorage.getItem('wordography_cb')==='on')document.body.dataset.colorblind='on';
init();
'''

# Write HTML
html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WORDOGRAPHY — Daily Geography Puzzle</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
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
.direction-arrow{font-size:36px;line-height:1;color:var(--accent-arrow);text-shadow:0 0 20px rgba(227,179,65,.4)}
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
.tile{width:40px;height:48px;border:2px solid var(--tile-border-empty);border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:20px;font-weight:700;text-transform:uppercase;background:var(--tile-bg-empty);color:var(--tile-text);user-select:none;position:relative}
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
.key{height:44px;min-width:24px;padding:0 3px;border-radius:5px;border:none;font-family:var(--font-mono);font-size:12px;font-weight:700;cursor:pointer;background:var(--bg-elevated);color:var(--text-secondary);display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s,transform