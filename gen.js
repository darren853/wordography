const fs = require('fs');
const countries = require('./countries.json');

// Build country array string
const cArr = countries.map(c => `{"id":"${c.id}","n":"${c.name}","nn":"${c.normalizedName}","lt":${c.lat},"ln":${c.lon},"c":"${c.continent}","f":"${c.flag}","ff":"${c.funFact}"}`).join(',');
const cJS = '[' + cArr + ']';

// Minified JS
const JS = `
var C=${cJS};var G={t:null,d:null,g:[],s:'playing',n:0,m:6,l:{}},p:null,i:-1,f:[]};var $=function(id){return document.getElementById(id)};var grid=$('grid'),si=$('si'),drop=$('drop'),gb=$('gb'),dd=$('dd'),ds=$('ds'),gp=$('gp'),da=$('da'),dl=$('dl'),dn=$('dn'),dls=$('dls'),db=$('db'),sb=$('sb'),sc=$('sc'),mo=$('mo'),mc=$('mc'),tc=$('tc'),sta=$('sta');function nm(n){return n.toUpperCase().replace(/[\\s\\-']/g,'').replace(/[^A-Z]/g,'')}function sh(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)+s.charCodeAt(i);return Math.abs(h)}function td(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}function dn2(d){var e=new Date('2026-04-11');return Math.floor((new Date(d)-e)/86400000)+1}function dc(){var t=td(),s=sh('wordography-'+t);var v=C.filter(function(c){return c.nn.length>=4&&c.nn.length<=9});return v[s%v.length]}function tr(d){return d*(Math.PI/180)}function cd(c1,c2){var R=6371;var dLat=tr(c2.lat-c1.lat);var dLon=tr(c2.lon-c1.lon);var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(tr(c1.lat))*Math.cos(tr(c2.lat))*Math.sin(dLon/2)*Math.sin(dLon/2);return Math.round(2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))}function dr(c1,c2){var dLon=tr(c2.lon-c1.lon);var y=Math.sin(dLon)*Math.cos(tr(c2.lat));var x=Math.cos(tr(c1.lat))*Math.sin(tr(c2.lat))-Math.sin(tr(c1.lat))*Math.cos(tr(c2.lat))*Math.cos(dLon);var b=(Math.atan2(y,x)*180/Math.PI+360)%360;var ds=[{l:'N',e:'↑',mi:337.5,ma:360},{l:'NE',e:'↗',mi:22.5,ma:67.5},{l:'E',e:'→',mi:67.5,ma:112.5},{l:'SE',e:'↘',mi:112.5,ma:157.5},{l:'S',e:'↓',mi:157.5,ma:202.5},{l:'SW',e:'↙',mi:202.5,ma:247.5},{l:'W',e:'←',mi:247.5,ma:292.5},{l:'NW',e:'↖',mi:292.5,ma:337.5}];if(b>=337.5||b<22.5)return ds[0];for(var i=0;i<ds.length;i++)if(b>=ds[i].mi&&b<ds[i].ma)return ds[i]}function dl2(km){if(km===0)return{l:'YOU GOT IT',e:'🎯',c:'#56D364'};if(km<500)return{l:'Very Close!',e:'🔥',c:'#2EA043'};if(km<2000)return{l:'Getting Warm',e:'👍',c:'#D29922'};if(km<5000)return{l:'Mid-Range',e:'🤷',c:'#8B949E'};if(km<10000)return{l:'Far',e:'❄️',c:'#6E7681'};return{l:'Very Far',e:'🌍',c:'#484F58'}}
function el(g,t){var r=g.split('').map(function(){return{l:'',s:'absent'}});var tl=t.split('');var u=new Set();for(var i=0;i<g.length;i++)if(g[i]===t[i]){r[i]={l:g[i],s:'correct'};u.add(i)}for(var i=0;i<g.length;i++){if(r[i].s==='correct')continue;var f=-1;for(var j=0;j<tl.length;j++)if(!u.has(j)&&tl[j]===g[i]){f=j;break}if(f!==-1){r[i]={l:g[i],s:'present'};u.add(f)}else r[i]={l:g[i],s:'absent'}}return r}
function rg(){var len=G.t.nn.length;grid.innerHTML='';for(var row=0;row<6;row++){var rowEl=document.createElement('div');rowEl.className='guess-row';rowEl.id='row-'+row;if(row<G.g.length){var g2=G.g[row];var flagEl=document.createElement('span');flagEl.className='flag';flagEl.textContent=g2.c.f;rowEl.appendChild(flagEl);var tilesEl=document.createElement('div');tilesEl.className='tiles';g2.l.forEach(function(tile,i){var t=document.createElement('div');t.className='tile';t.dataset.s=tile.s;t.textContent=tile.l;t.style.animationDelay=(i*150)+'ms';tilesEl.appendChild(t)});rowEl.appendChild(tilesEl);var geoEl=document.createElement('div');geoEl.className='row-geo';geoEl.innerHTML='<span class="row-ad">'+g2.dir.e+' '+g2.dist.toLocaleString()+' km</span><span class="row-dl">'+dl2(g2.dist).l+'</span>';rowEl.appendChild(geoEl)}else if(row===G.n&&G.s==='playing'){var tilesEl=document.createElement('div');tilesEl.className='tiles';for(var i=0;i<len;i++){var t=document.createElement('div');t.className='tile';t.id='tile-'+i;t.dataset.s='e';tilesEl.appendChild(t)}rowEl.appendChild(tilesEl)}else{var tilesEl=document.createElement('div');tilesEl.className='tiles';for(var i=0;i<len;i++){var t=document.createElement('div');t.className='tile';t.dataset.s='e';tilesEl.appendChild(t)}rowEl.appendChild(tilesEl)}grid.appendChild(rowEl)}}
function rk(){var kb=$('kb');kb.innerHTML='';var rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];rows.forEach(function(row){var rowEl=document.createElement('div');rowEl.className='kb-row';row.split('').forEach(function(key){var k=document.createElement('button');k.className='key';k.id='key-'+key;k.textContent=key;var st=G.l[key];if(st==='correct')k.classList.add('gc');else if(st==='present')k.classList.add('gy');else if(st==='absent')k.classList.add('gx');k.addEventListener('click',function(){si.value+=key;osi()});rowEl.appendChild(k)});kb.appendChild(rowEl)});var lastRow=document.createElement('div');lastRow.className='kb-row';var bs=document.createElement('button');bs.className='key bs';bs.textContent='⌫';bs.addEventListener('click',function(){si.value=si.value.slice(0,-1);osi()});lastRow.appendChild(bs);kb.appendChild(lastRow)}
function osi(){var q=si.value.trim();if(q.length<1){hd();return}var nq=nm(q);G.f=C.filter(function(c){if(c.nn.length<4||c.nn.length>9)return false;var n2=c.nn;if(n2===nq)return 3;if(n2.startsWith(nq))return 2;if(n2.includes(nq))return 1;return 0}).sort(function(a,b){if(b._s!==a._s)return b._s-a._s;return a.n.localeCompare(b.n)}).slice(0,8);G.f.forEach(function(c,i){c._s=i});G.i=-1;rd();sd2()}
function osk(e){if(!drop.classList.contains('show'))return;if(e.key==='ArrowDown'){e.preventDefault();G.i=Math.min(G.i+1,G.f.length-1);rd()}else if(e.key==='ArrowUp'){e.preventDefault();G.i=Math.max(G.i-1,0);rd()}else if(e.key==='Enter'){e.preventDefault();if(G.i>=0&&G.f[G.i])sc2(G.f[G.i])}else if(e.key==='Escape')hd()}
function rd(){drop.innerHTML=G.f.map(function(c,i){return'<div class="drop-item'+(i===G.i?' sel':'')+'" data-index="'+i+'"><span class="dflag">'+c.f+'</span><span class="dname">'+c.n+'</span><span class="dcont">'+c.c+'</span></div>'}).join('');drop.querySelectorAll('.drop-item').forEach(function(item){item.addEventListener('click',function(){sc2(G.f[parseInt(item.dataset.index])})})}
function sd2(){drop.classList.add('show')}function hd(){drop.classList.remove('show')}
function sc2(country){G.p=country;si.value=country.f+' '+country.n;gb.disabled=false;hd();var len=G.t.nn.length;var name=country.nn;for(var i=0;i<len;i++){var t=document.getElementById('tile-'+i);if(t){t.textContent=name[i]||'';t.dataset.s=name[i]?'f':'e';t.classList.add('fl')}}}
function sg(){if(!G.p||G.s!=='playing')return;var country=G.p;if(G.g.some(function(g2){return g2.c.id===country.id})){showToast('Already guessed '+country.n,'e');si.classList.add('sk');setTimeout(function(){si.classList.remove('sk')},300);return}var target=G.t;var letters=el(country.nn,target.nn);var distance=cd(country,target);var direction=dr(country,target);G.g.push({c:country,l:letters,dist:distance,dir:direction});G.n++;uls(letters);ss2();var row=document.getElementById('row-'+(G.n-1));var tiles=row.querySelectorAll('.tile');tiles.forEach(function(tile,i){setTimeout(function(){tile.classList.add('flip');setTimeout(function(){tile.dataset.s=letters[i].s==='correct'?'c':letters[i].s==='present'?'y':'x';tile.classList.remove('flip');if(letters[i].s==='correct')setTimeout(function(){tile.classList.add('cp')},100)},250)},i*150)});gp.style.display='none';dd.classList.add('show');ds.classList.add('show');setTimeout(function(){da.textContent=direction.e;da.classList.add('bn');dl.textContent=direction.l;dn.textContent=distance.toLocaleString();dls.textContent=dl2(distance).l;dls.style.color=dl2(distance).c},tiles.length*150+300);G.p=null;si.value='';gb.disabled=true;var won=letters.every(function(l){return l.s==='correct'});if(won){G.s='won';ss2();ust(true);setTimeout(function(){showWinModal()},tiles.length*150+1200)}else if(G.n>=G.m){G.s='lost';ss2();ust(false);setTimeout(function(){showLossModal()},tiles.length*150+1200)}rk()}
function uls(feedback){feedback.forEach(function(tile){var cur=G.l[tile.l];if(cur==='correct')return;if(cur==='present'&&tile.s==='absent')return;G.l[tile.l]=tile.s})}
function gs2(){try{return JSON.parse(localStorage.getItem('w_stats')||'{"p":0,"w":0,"st":0,"mst":0,"d":[0,0,0,0,0,0]}')}catch{return{p:0,w:0,st:0,mst:0,d:[0,0,0,0,0,0]}}}
function ss2(s){localStorage.setItem('w_stats',JSON.stringify(s))}
function ust(won){var stats=gs2();stats.p++;if(won){stats.w++;stats.st++;stats.mst=Math.max(stats.mst,stats.st);stats.d[G.n-1]++}else{stats.st=0}ss2(stats);us()}
function us(){var stats=gs2();if(stats.st>0){sb.classList.remove('dn');sc.textContent=stats.st}else{sb.classList.add('dn')}}
function showStats(){var stats=gs2();var winPct=stats.p>0?Math.round(stats.w/stats.p*100):0;var max=Math.max.apply(null,stats.d.concat([1]));var html='<div class="mt">📊 Statistics</div>';html+='<div class="sg">';html+='<div class="si"><div class="sv">'+stats.p+'</div><div class="sl">Played</div></div>';html+='<div class="si"><div class="sv">'+winPct+'%</div><div class="sl">Win %</div></div>';html+='<div class="si"><div class="sv">'+stats.st+'</div><div class="sl">Streak</div></div>';html+='<div class="si"><div class="sv">'+stats.mst+'</div><div class="sl">Max</div></div>';html+='</div>';html+='<div class="dt">Guess Distribution</div>';for(var i=0;i<6;i++){var n=stats.d[i];var wide=Math.max(20,Math.round(n/max*100));var isHighlight=G.s==='won'&&G.n===i+1;html+='<div class="dr"><div class="dn">'+(i+1)+'</div><div class="db'+(isHighlight?' hi':'')+'" style="width:'+wide+'%">'+n+'</div></div>'}html+='<div class="mb" style="margin-top:20px"><button class="mbtn s" onclick="cm()">Close</button></div>';showModal(html)}
function showHelp(){var html='<div class="mt">❓ How to Play</div><div class="ms">Guess the secret country in 6 tries.<br>Each guess reveals:</div><div style="text-align:left;font-size:14px;color:var(--ts);line-height:1.8;margin-bottom:12px"><span style="color:var(--gc);font-weight:700">🟩 Green</span> = correct position<br><span style="color:var(--gy);font-weight:700">🟨 Yellow</span> = wrong position<br><span style="color:var(--gr);font-weight:700">⬛ Grey</span> = not in name<br><br><span style="color:var(--ga)">📍 Direction + Distance = how far and which direction</span></div><div class="mb" style="margin-top:16px"><button class="mbtn s" onclick="cm()">Got it!</button></div>';showModal(html)}
function showSettings(){var isLight=document.body.dataset.theme==='light';var isCB=document.body.dataset.cb==='on';var html='<div class="mt">⚙️ Settings</div>';html+='<div class="srow"><div><div class="slb">Light Mode</div><div class="sld">Switch to light theme</div></div><label class="tgl"><input type="checkbox" id="tl"'+(isLight?' checked':'')+' onchange="tt()"><span class="tgl-slider"></span></label></div>';html+='<div class="srow"><div><div class="slb">Color-Blind Mode</div><div class="sld">Blue instead of green, orange instead of yellow</div></div><label class="tgl"><input type="checkbox" id="tc"'+(isCB?' checked':'')+' onchange="tcb()"><span class="tgl-slider"></span></label></div>';html+='<div class="srow"><div><div class="slb">Practice Mode</div><div class="sld">Play a random country</div></div><button class="mbtn s" onclick="pp()" style="padding:8px 16px">Play</button></div>';html+='<div class="mb" style="margin-top:20px"><button class="mbtn s" onclick="cm()">Close</button></div>';showModal(html)}
function tt(){document.body.dataset.theme=document.body.dataset.theme==='light'?'dark':'light';localStorage.setItem('w_theme',document.body.dataset.theme)}
function tcb(){document.body.dataset.cb=document.body.dataset.cb==='on'?'off':'on';localStorage.setItem('w_cb',document.body.dataset.cb)}
function pp(){cm();var valid=C.filter(function(c){return c.nn.length>=4&&c.nn.length<=9});var c=valid[Math.floor(Math.random()*valid.length)];G={t:c,d:'practice',g:[],s:'playing',n:0,m:6,l:{},p:null,i:-1,f:[]};dd.classList.remove('show');ds.classList.remove('show');gp.style.display='flex';rg();rk();db.textContent='🎲 Practice';ss()}
function showWinModal(){spawnConfetti();var g2=G.g[G.n-1];var target=G.t;var html='<div class="mt">🎉 Brilliant!</div><div class="ms">You got '+target.n+' in '+G.n+'/6 guesses</div><div class="ma"><span class="mf">'+target.f+'</span><span class="mn">'+target.n+'</span></div><div class="mg">'+g2.dir.e+' '+g2.dist.toLocaleString()+' km — '+dl2(g2.dist).l+'</div><div class="mfct">"'+target.ff+'"</div><div class="mb"><button class="mbtn p" onclick="shr()">📤 Share</button><button class="mbtn s" onclick="cm()">Close</button></div>';showModal(html)}
function showLossModal(){var target=G.t;var html='<div class="mt">😢 So Close!</div><div class="ms">The answer was</div><div class="ma"><span class="mf">'+target.f+'</span><span class="mn">'+target.n+'</span></div><div class="mg">🎯 0 km — YOU GOT IT!</div><div class="mfct">"'+target.ff+'"</div><div class="mb"><button class="mbtn p" onclick="shr()">📤 Share</button><button class="mbtn s" onclick="cm()">Close</button></div>';showModal(html)}
function showModal(html){mc.innerHTML=html;mo.classList.add('show')}
function cm(){mo.classList.remove('show')}
function shr(){var dayNum=dn2(G.d);var text='WORDOGRAPHY #'+dayNum+' '+G.n+'/6\\n\\n';G.g.forEach(function(g2){g2.l.forEach(function(l){if(l.s==='correct')text+='🟩';else if(l.s==='present')text+='🟨';else text+='⬛'});text+='\\n'});var last=G.g[G.g.length-1];text+='\\n'+last.dir.e+' '+last.dist.toLocaleString()+' km';sta.value=text;sta.select();document.execCommand('copy');showToast('Copied to clipboard!','s')}
function showToast(msg,type){var t=document.createElement('div');t.className='toast'+(type?' '+type:'');t.textContent=msg;tc.appendChild(t);setTimeout(function(){t.remove()},3000)}
function spawnConfetti(){var colors=['#2EA043','#E3B341','#D29922','#56D364','#F0F6FC'];for(var i=0;i<60;i++){var c=document.createElement('div');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=colors[Math.floor(Math.random()*colors.length)];c.style.animationDuration=(1.5+Math.random()*1.5)+'s';c.style.animationDelay=Math.random()*0.5+'s';document.body.appendChild(c);setTimeout(function(){c.remove()},4000)}}
function ss(){var toSave={tId:G.t&&G.t.id,d:G.d,g:G.g.map(function(x){return{cId:x.c.id,l:x.l,dist:x.dist,dir:x.dir}}),s:G.s,n:G.n,l:G.l};localStorage.setItem('w_state',JSON.stringify(toSave))}
function ls(){try{var raw=localStorage.getItem('w_state');if(!raw)return null;var s=JSON.parse(raw);s.t=C.find(function(c){return c.id===s.tId})||dc();s.g=s.g.map(function(x){return{c:C.find(function(c){return c.id===x.cId}),l:x.l,dist:x.dist,dir:x.dir}});return s}catch{return null}}
function init(){var saved=ls();var today=td();if(saved&&saved.d===today){G=saved}else{G.t=dc();G.d=today;G.g=[];G.s='playing';G.n=0;G.l={}}}rg();rk();us();db.textContent='Day #'+dn2(G.d);si.addEventListener('input',osi);si.addEventListener('keydown',osk);gb.addEventListener('click',sg);$('stbtn').addEventListener('click',showStats);$('hpbtn').addEventListener('click',showHelp);$('setbtn').addEventListener('click',showSettings);mo.addEventListener('click',function(e){if(e.target===mo)cm()});if(G.s!=='playing')setTimeout(function(){G.s==='won'?showWinModal():showLossModal()},500)}
if(localStorage.getItem('w_theme')==='light')document.body.dataset.theme='light';
if(localStorage.getItem('w_cb')==='on')document.body.dataset.cb='on';
init()`;

// HTML template
const HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>WORDOGRAPHY</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet"><style>
:root{--bg:#0D1117;--sf:#161B22;--el:#21262D;--bd:#30363D;--tp:#F0F6FC;--ts:#8B949E;--tt:#6E7681;--gc:#2EA043;--gy:#D29922;--gr:#484F58;--ga:#E3B341;--ge:#F85149;--gv:#56D364;--ov:rgba(13,17,23,0.9);--sh:0 4px 24px rgba(0,0,0,0.5);--ui:'Inter',sans-serif;--mn:'JetBrains Mono',monospace}
[data-theme=light]{--bg:#F5F5F0;--sf:#FFF;--el:#EFEFEA;--bd:#D0D0C8;--tp:#1A1A1A;--ts:#6E6E6A;--tt:#9E9E9A;--gr:#C4C4BC;--ga:#D29922;--ov:rgba(245,245,240,0.9);--sh:0 4px 24px rgba(0,0,0,0.15)}
[data-cb=on]{--gc:#58A6FF;--gy:#F78166}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--ui);background:var(--bg);color:var(--tp);display:flex;flex-direction:column;align-items:center;min-height:100dvh;overflow:hidden}
header{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--bd);background:var(--sf);flex-shrink:0}
.logo{font-size:18px;font-weight:800;letter-spacing:3px;display:flex;align-items:center;gap:6px}
.header-center{display:flex;align-items:center;gap:8px}
.day-badge{background:var(--el);border:1px solid var(--bd);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:var(--ts)}
.header-right{display:flex;align-items:center;gap:4px}
.streak-badge{font-size:14px;font-weight:600;color:var(--ga);display:flex;align-items:center;gap:3px}
.streak-badge.dn{display:none}
.icon-btn{width:34px;height:34px;border-radius:8px;border:none;background:transparent;color:var(--ts);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:17px}
.icon-btn:hover{background:var(--el);color:var(--tp)}
main{flex:1;width:100%;max-width:520px;display:flex;flex-direction:column;padding:0 12px;overflow:hidden}
.geo-strip{display:flex;align-items:center;justify-content:center;gap:24px;padding:12px 0;min-height:72px}
.dir-display,.dist-display{display:none;flex-direction:column;align-items:center;gap:2px}
.dir-display.show,.dist-display.show{display:flex}
.dir-arr{font-size:36px;color:var(--ga);text-shadow:0 0 20px rgba(227,179,65,.4)}
.dir-arr.bn{animation:ab .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes ab{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
.dir-lbl{font-size:10px;font-weight:600;color:var(--tt);letter-spacing:1px;text-transform:uppercase}
.dist-n{font-size:26px;font-weight:800;color:var(--tp);font-family:var(--mn);line-height:1}
.dist-km{font-size:11px;color:var(--tt)}
.dist-lbl{font-size:10px;font-weight:600;color:var(--ga);letter-spacing:.5px;text-align:center;max-width:80px}
.geo-plh{flex-direction:column;align-items:center;gap:4px}
.geo-plh-text{font-size:20px;color:var(--tt);opacity:.5}
.geo-plh-sub{font-size:10px;color:var(--tt);letter-spacing:1px;text-transform:uppercase}
.grid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 0;overflow-y:auto;scrollbar-width:none}
.grid::-webkit-scrollbar{display:none}
.guess-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;width:100%;justify-content:center}
.flag{font-size:18px;flex-shrink:0}
.tiles{display:flex;gap:4px}
.tile{width:40px;height:48px;border:2px solid var(--bd);border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:var(--mn);font-size:20px;font-weight:700;text-transform:uppercase;background:var(--el);color:var(--tp);user-select:none}
.tile.fl{animation:tp .1s ease}
@keyframes tp{0%{transform:scale(.85)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
.tile.flip{animation:tf .5s ease forwards}
@keyframes tf{0%{transform:rotateX(0)}50%{transform:rotateX(-90deg)}100%{transform:rotateX(0)}}
.tile[data-s=c]{background:var(--gc);border-color:var(--gc);color:#fff}
.tile[data-s=y]{background:var(--gy);border-color:var(--gy);color:#fff}
.tile[data-s=x]{background:var(--gr);border-color:var(--gr);color:#fff}
.tile.cp{animation:cp .3s ease}
@keyframes cp{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
.row-geo{display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:68px;flex-shrink:0}
.row-ad{font-size:11px;font-weight:700;color:var(--ga);font-family:var(--mn)}
.row-dl{font-size:9px;color:var(--tt)}
.input-z{padding:8px 0;flex-shrink:0}
.srch{position:relative;width:100%}
.srch-in{width:100%;height:46px;padding:0 14px;font-size:15px;font-family:var(--ui);background:var(--el);border:2px solid var(--bd);border-radius:10px;color:var(--tp);outline:none}
.srch-in:focus{border-color:var(--ga)}
.srch-in::placeholder{color:var(--tt)}
.srch-in.sk{animation:sh .3s ease}
@keyframes sh{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
.srch-row{display:flex;gap:8px;align-items:center}
.gbtn{height:46px;padding:0 18px;font-size:13px;font-weight:700;font-family:var(--ui);background:var(--gc);color:#fff;border:none;border-radius:10px;cursor:pointer;text-transform:uppercase;letter-spacing:1px}
.gbtn:hover:not(:disabled){opacity:.9}
.gbtn:disabled{background:var(--bd);color:var(--tt);cursor:not-allowed}
.drop{position:absolute;top:calc(100%+4px);left:0;right:0;background:var(--el);border:1px solid var(--bd);border-radius:10px;max-height:220px;overflow-y:auto;z-index:100;display:none}
.drop.show{display:block}
.drop-item{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;font-size:14px;font-weight:500;border-bottom:1px solid var(--bd)}
.drop-item:last-child{border-bottom:none}
.drop-item:hover,.drop-item.sel{background:var(--sf)}
.dflag{font-size:17px}
.dname{color:var(--tp)}
.dcont{margin-left:auto;font-size:10px;color:var(--tt)}
.kb-z{padding:6px 0 10px;flex-shrink:0}
.kb{display:flex;flex-direction:column;gap:5px;align-items:center}
.kb-row{display:flex;gap:3px}
.key{height:44px;min-width:24px;padding:0 3px;border-radius:5px;border:none;font-family:var(--mn);font-size:12px;font-weight:700;cursor:pointer;background:var(--el);color:var(--ts);display:flex;align-items:center;justify-content:center;text-transform:uppercase}
.key:hover{background:var(--bd);color:var(--tp)}
.key:active{transform:scale(.94)}
.key.gc{background:var(--gc);color:#fff}
.key.gy{background:var(--gy);color:#fff}
.key.gx{background:var(--gr);color:var(--tt)}
.key.bs{min-width:46px;font-size:15px}
.mo{position:fixed;inset:0;background:var(--ov);z-index:1000;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.mo.show{display:flex}
.mc{background:var(--sf);border:1px solid var(--bd);border-radius:16px;padding:28px 24px;max-width:390px;width:100%;text-align:center;box-shadow:var(--sh);animation:msu .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes msu{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.mt{font-size:26px;font-weight:800;margin-bottom:8px}
.ms{font-size:15px;color:var(--ts);margin-bottom:16px;line-height:1.5}
.ma{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px}
.mf{font-size:34px}
.mn{font-size:22px;font-weight:700;letter-spacing:2px}
.mg{font-size:16px;font-weight:600;color:var(--ga);margin-bottom:16px}
.mfct{font-size:13px;color:var(--ts);line-height:1.6;padding:12px;background:var(--el);border-radius:10px;margin-bottom:20px;font-style:italic}
.mb{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.mbtn{padding:11px 22px;border-radius:10px;font-size:13px;font-weight:700;font-family:var(--ui);cursor:pointer;border:none;text-transform:uppercase;letter-spacing:.5px}
.mbtn:active{transform:scale(.97)}
.mbtn.p{background:var(--gc);color:#fff}
.mbtn.s{background:var(--el);color:var(--tp);border:1px solid var(--bd)}
.mbtn:hover{opacity:.9}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px}
.si{display:flex;flex-direction:column;align-items:center;gap:2px}
.sv{font-size:28px;font-weight:800;color:var(--tp)}
.sl{font-size:10px;font-weight:600;color:var(--tt);text-transform:uppercase;letter-spacing:.5px;text-align:center}
.dt{font-size:12px;font-weight:600;color:var(--ts);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;text-align:left}
.dr{display:flex;align-items:center;gap:5px;margin-bottom:3px}
.dn{font-size:11px;font-weight:700;color:var(--tt);width:12px;text-align:right;flex-shrink:0}
.db{height:18px;background:var(--gc);border-radius:3px;min-width: