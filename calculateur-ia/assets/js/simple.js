/*!
 * Calculateur d'empreinte environnementale de l'IA en entreprise
 * Version simple (dirigeants)
 * Mind W3B, méthode v1 (octobre 2026)
 * https://www.mindw3b.co/
 */
(function(){
"use strict";
var KEY='mw3b-simple-v1', KEY_EXPERT='mw3b-empreinte-ia-v1', M=window.MW3B;
function $(id){return document.getElementById(id);}

/* ---------- État ---------- */
var DEFAULT={users:50,outils:['chatgpt'],frequence:'reguliere',budget:'',abonnement:'',reflexion:'',documents:'',europe:'',extras:[],ouvert:false};
var state;
try{ state=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ state=null; }
state=Object.assign({},DEFAULT,state&&typeof state==='object'?state:{});
if(!Array.isArray(state.outils)) state.outils=DEFAULT.outils.slice();
if(!Array.isArray(state.extras)) state.extras=[];
function save(){ try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){} }

/* ---------- Formatage ---------- */
function nf(n,d){return n.toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:0});}
function sig(n){ var a=Math.abs(n); return nf(n,a>=100?0:a>=10?1:a>=1?1:2); }
function co2(kg){ return kg>=1000? [sig(kg/1000),'t'] : [sig(kg),'kg']; }
function j(a){return a[0]+'\u00a0'+a[1];}

/* ---------- Questions ---------- */
function syncButtons(){
  var u=M.num(state.users);
  document.querySelectorAll('[data-users]').forEach(function(b){ b.setAttribute('aria-pressed',String(+b.dataset.users===u)); });
  document.querySelectorAll('[data-multi]').forEach(function(g){
    var sel=state[g.dataset.multi];
    g.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',String(sel.indexOf(b.dataset.v)>=0)); });
  });
  document.querySelectorAll('[data-single]').forEach(function(g){
    var sel=state[g.dataset.single];
    g.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed',String(sel===b.dataset.v)); });
  });
}

$('users').value=state.users;
$('users').addEventListener('input',function(){ state.users=this.value; update(); });
document.querySelectorAll('[data-users]').forEach(function(b){
  b.addEventListener('click',function(){ state.users=+b.dataset.users; $('users').value=state.users; update(); });
});
document.querySelectorAll('[data-multi]').forEach(function(g){
  g.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    var list=state[g.dataset.multi], i=list.indexOf(b.dataset.v);
    if(i>=0) list.splice(i,1); else list.push(b.dataset.v);
    update();
  });
});
document.querySelectorAll('[data-single]').forEach(function(g){
  g.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    var k=g.dataset.single;
    // Un second clic désélectionne, sauf pour une question obligatoire.
    state[k]=(state[k]===b.dataset.v&&!g.dataset.required)?'':b.dataset.v;
    update();
  });
});
$('budget').value=state.budget;
$('budget').addEventListener('input',function(){ state.budget=this.value; update(); });

/* ---------- Panneaux repliables ---------- */
function setOpen(btn,panel,open){ btn.setAttribute('aria-expanded',String(open)); panel.hidden=!open; }
setOpen($('moreBtn'),$('morePanel'),!!state.ouvert);
$('moreBtn').addEventListener('click',function(){
  state.ouvert=this.getAttribute('aria-expanded')!=='true';
  setOpen(this,$('morePanel'),state.ouvert); save();
});
$('detailBtn').addEventListener('click',function(){
  setOpen(this,$('detail'),this.getAttribute('aria-expanded')!=='true');
});

/* ---------- Mode expert ---------- */
$('toExpert').addEventListener('click',function(e){
  e.preventDefault();
  try{ localStorage.setItem(KEY_EXPERT,JSON.stringify(M.versExpert(state))); }catch(err){}
  window.location.href=this.getAttribute('href');
});

/* ---------- Thème (partagé avec le mode expert) ---------- */
var THEME_KEY=KEY_EXPERT+'-theme', html=document.documentElement;
function isDark(){ var t=html.getAttribute('data-theme'); return t? t==='dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
function syncTheme(){ $('themeBtn').setAttribute('aria-pressed',String(isDark())); }
try{ var th=localStorage.getItem(THEME_KEY); if(th) html.setAttribute('data-theme',th); }catch(e){}
syncTheme();
$('themeBtn').addEventListener('click',function(){
  var nx=isDark()?'light':'dark'; html.setAttribute('data-theme',nx); syncTheme();
  try{ localStorage.setItem(THEME_KEY,nx); }catch(e){}
});

/* ---------- Résultat ---------- */
function update(){
  syncButtons();
  var users=M.num(state.users), r=M.estimationSimple(state);
  $('moreCount').textContent=r.repondues+' / 5 répondues';

  var vide=!state.outils.length||users<=0;
  $('empty').hidden=!vide; $('result').hidden=vide;
  $('empty').textContent=state.outils.length?'Indiquez le nombre de personnes qui utilisent l\'IA pour voir votre résultat.':'Choisissez au moins un outil pour voir votre résultat.';
  if(!vide){
    var a=co2(r.kg); $('rNum').textContent=a[0]; $('rUnit').textContent=a[1];
    var lo=M.posFourchette(r.lo,r.kg), hi=M.posFourchette(r.hi,r.kg);
    $('rSeg').style.left=lo+'%'; $('rSeg').style.right=(100-hi)+'%';
    $('rBetween').textContent='Entre '+j(co2(r.lo))+' et '+j(co2(r.hi));
    $('rDots').querySelectorAll('i').forEach(function(d,i){ d.classList.toggle('on',i<r.points); });
    $('rPrec').textContent=r.precision;
    $('tUser').textContent=sig(r.kg/users);
    $('tTrip').textContent=sig(r.kg/0.2/1550);
    $('rGain').textContent=r.gain+'\u00a0%';
    $('dE').textContent=r.kwh>=1000? sig(r.kwh/1000)+' MWh par an' : sig(r.kwh)+' kWh par an';
    $('dW').textContent=r.l>=1000? sig(r.l/1000)+' m³ par an' : nf(Math.round(r.l),0)+' litres par an';
    $('dR').textContent=nf(Math.round(r.req),0);
  }
  save();
}
update();
})();
