/*!
 * Calculateur d'empreinte environnementale de l'IA en entreprise
 * Mind W3B, méthode v1 (octobre 2026)
 * https://www.mindw3b.co/
 */
(function(){
"use strict";
var KEY='mw3b-empreinte-ia-v1';
function $(id){return document.getElementById(id);}

/* ---------- Référentiels et calcul : assets/js/moteur.js ---------- */
var M=window.MW3B, MODELS=M.MODELS, OPS=M.OPS, GRIDS=M.GRIDS, HYP_DEF=M.HYP_DEF, num=M.num;

function newUc(o){
  return Object.assign({name:'Nouvel usage',model:'f-mid',custom:20,users:50,rpd:5,days:21,inTok:1500,outTok:400,reasTok:0,embTok:0,op:'aws',grid:'us',gridCustom:0.1},o||{});
}
var DEFAULT={
  ucs:[
    newUc({name:'Assistant interne de rédaction',model:'f-mid',users:200,rpd:8,days:21,inTok:1500,outTok:400,op:'aws',grid:'us'}),
    newUc({name:'Support client avec base documentaire',model:'f-small',users:1,rpd:600,days:30,inTok:4000,outTok:300,embTok:2000000,op:'google',grid:'us'}),
    newUc({name:'Assistant de code',model:'f-front',users:30,rpd:60,days:21,inTok:8000,outTok:600,reasTok:1500,op:'google',grid:'us'})
  ],
  lv:{inR:0,outR:0,route:0}, period:1, hyp:{}
};
HYP_DEF.forEach(function(h){DEFAULT.hyp[h.k]=h.v;});

var state;
try{ state=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ state=null; }
if(!state||!Array.isArray(state.ucs)) state=JSON.parse(JSON.stringify(DEFAULT));
HYP_DEF.forEach(function(h){ if(typeof state.hyp[h.k]!=='number') state.hyp[h.k]=h.v; });
function save(){ try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){} }

/* ---------- Formatage ---------- */
function nf(n,d){return n.toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:0});}
function sig(n){ if(n===0) return '0'; var a=Math.abs(n); var d=a>=100?0:a>=10?1:a>=1?2:3; return nf(n,d); }
function fE(kwh){ return kwh>=1000? [sig(kwh/1000),'MWh'] : kwh>=1? [sig(kwh),'kWh'] : [sig(kwh*1000),'Wh']; }
function fC(kg){ return kg>=1000? [sig(kg/1000),'t CO₂e'] : kg>=1? [sig(kg),'kg CO₂e'] : [sig(kg*1000),'g CO₂e']; }
function fW(l){ return l>=1000? [sig(l/1000),'m³'] : [sig(l),'L']; }
function j(a){return a[0]+' '+a[1];}

function compute(lv){ return M.compute(state,lv); }

/* ---------- Rendu des usages ---------- */
function opts(list,sel,label){
  var html='', grp=null;
  list.forEach(function(x){
    if(x.g&&x.g!==grp){ if(grp) html+='</optgroup>'; html+='<optgroup label="'+x.g+'">'; grp=x.g; }
    html+='<option value="'+x.id+'"'+(x.id===sel?' selected':'')+'>'+x.n+(label&&x.v!=null?' ('+nf(x.v,2)+' kg/kWh)':'')+'</option>';
  });
  if(grp) html+='</optgroup>';
  return html;
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function fld(i,k,lab,v,step,cls){
  return '<div class="f'+(cls?' '+cls:'')+'"><label for="u'+i+k+'">'+lab+'</label><input type="number" id="u'+i+k+'" data-i="'+i+'" data-k="'+k+'" min="0" step="'+step+'" value="'+v+'"></div>';
}
function renderUcs(){
  var html='';
  state.ucs.forEach(function(uc,i){
    html+='<article class="uc" aria-label="Usage '+(i+1)+'">'+
      '<div class="uc-head"><input class="name" type="text" aria-label="Nom de l\'usage" data-i="'+i+'" data-k="name" value="'+esc(uc.name)+'">'+
      '<span class="uc-share num" id="share'+i+'"></span>'+
      (state.ucs.length>1?'<button class="del" type="button" data-del="'+i+'">Retirer</button>':'')+'</div>'+
      '<div class="fields">'+
      '<div class="f wide"><label for="u'+i+'model">Modèle</label><select id="u'+i+'model" data-i="'+i+'" data-k="model">'+opts(MODELS,uc.model)+'</select></div>'+
      fld(i,'custom','Paramètres actifs (milliards)',uc.custom,1,uc.model==='custom'?'':'hidden')+
      '<div class="f"><label for="u'+i+'op">Hébergement</label><select id="u'+i+'op" data-i="'+i+'" data-k="op">'+opts(OPS,uc.op)+'</select></div>'+
      '<div class="f"><label for="u'+i+'grid">Région du datacenter</label><select id="u'+i+'grid" data-i="'+i+'" data-k="grid">'+opts(GRIDS,uc.grid,true)+'</select></div>'+
      fld(i,'gridCustom','Intensité carbone (kg CO₂e/kWh)',uc.gridCustom,0.01,uc.grid==='custom'?'':'hidden')+
      fld(i,'users','Utilisateurs',uc.users,1)+
      fld(i,'rpd','Requêtes par utilisateur et par jour',uc.rpd,1)+
      fld(i,'days','Jours d\'utilisation par mois',uc.days,1)+
      fld(i,'inTok','Tokens d\'entrée par requête',uc.inTok,100)+
      fld(i,'outTok','Tokens de sortie par requête',uc.outTok,50)+
      fld(i,'reasTok','Tokens de raisonnement par requête',uc.reasTok,100)+
      fld(i,'embTok','Tokens indexés pour le RAG par mois',uc.embTok,100000)+
      '</div></article>';
  });
  $('ucList').innerHTML=html;
}
$('ucList').addEventListener('input',function(e){
  var t=e.target, i=t.dataset.i, k=t.dataset.k; if(i==null||!k) return;
  state.ucs[i][k]=t.value;
  if(k==='model'){ $('u'+i+'custom').parentNode.classList.toggle('hidden',t.value!=='custom'); }
  if(k==='grid'){ $('u'+i+'gridCustom').parentNode.classList.toggle('hidden',t.value!=='custom'); }
  update();
});
$('ucList').addEventListener('click',function(e){
  var d=e.target.dataset.del; if(d==null) return;
  state.ucs.splice(+d,1); renderUcs(); update();
});
$('addUc').addEventListener('click',function(){
  state.ucs.push(newUc()); renderUcs(); update();
  var n=document.querySelectorAll('.uc .name'); n[n.length-1].focus(); n[n.length-1].select();
});

/* ---------- Hypothèses ---------- */
$('hypFields').innerHTML=HYP_DEF.map(function(h){
  return '<div class="f"><label for="h_'+h.k+'">'+h.l+'</label><input type="number" id="h_'+h.k+'" data-h="'+h.k+'" min="0" step="'+h.s+'" value="'+state.hyp[h.k]+'"></div>';
}).join('');
$('hypFields').addEventListener('input',function(e){
  var k=e.target.dataset.h; if(!k) return;
  var d=HYP_DEF.find(function(h){return h.k===k;});
  var v=parseFloat(e.target.value); state.hyp[k]=(isNaN(v)||v<=0)?d.v:v;
  if(k==='host'||k==='idle') state.hyp[k]=Math.max(1,state.hyp[k]);
  update();
});

/* ---------- Leviers et période ---------- */
var LV=[['lvIn','oIn','inR'],['lvOut','oOut','outR'],['lvRoute','oRoute','route']];
LV.forEach(function(l){
  $(l[0]).value=Math.round(state.lv[l[2]]*100);
  $(l[0]).addEventListener('input',function(){ state.lv[l[2]]=this.value/100; update(); });
});
document.querySelectorAll('.period button').forEach(function(b){
  b.addEventListener('click',function(){ state.period=+b.dataset.p; update(); });
});

/* ---------- Mise à jour ---------- */
var PARTS=[['gpu','Calcul GPU','var(--mag)'],['srv','Serveur hors GPU et veille','var(--vio)'],['dc','Refroidissement et bâtiment','var(--blue)'],['fab','Fabrication du matériel','var(--warn)'],['train','Entraînement amorti','var(--dim)']];
function setRange(id,lo,mid,hi,f){
  var r=$('r'+id), max=hi||1;
  r.querySelector('.seg').style.left=(lo/max*100)+'%';
  r.querySelector('.seg').style.right='0%';
  r.querySelector('.dot').style.left=(mid/max*100)+'%';
  $('l'+id).textContent='Basse '+j(f(lo));
  $('h'+id).textContent='Haute '+j(f(hi));
}
var last=null;
function update(){
  var p=state.period, res=compute(state.lv), base=compute({inR:0,outR:0,route:0});
  var lo=res[0], c=res[1], hi=res[2];
  document.querySelectorAll('.period button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.p===p));});
  LV.forEach(function(l){$(l[1]).textContent=Math.round(state.lv[l[2]]*100)+' %';});

  var a=fC(c.c*p); $('kCo2').innerHTML=a[0]+'<small>'+a[1]+'</small>'; setRange('Co2',lo.c*p,c.c*p,hi.c*p,fC);
  a=fE(c.e*p); $('kE').innerHTML=a[0]+'<small>'+a[1]+'</small>'; setRange('E',lo.e*p,c.e*p,hi.e*p,fE);
  a=fW(c.w*p); $('kW').innerHTML=a[0]+'<small>'+a[1]+'</small>'; setRange('W',lo.w*p,c.w*p,hi.w*p,fW);

  var req=c.req*p;
  if(c.req>0){
    $('perReq').innerHTML='<b class="num">'+nf(req,0)+'</b> requêtes sur la période. Par requête en moyenne : <b class="num">'+sig(c.e/c.req*1000)+' Wh</b>, <b class="num">'+sig(c.c/c.req*1000)+' g CO₂e</b>, <b class="num">'+sig(c.w/c.req*1000)+' mL</b> d\'eau.';
    $('equiv').innerHTML='Soit l\'équivalent de <b class="num">'+nf(Math.round(c.c*p/state.hyp.car),0)+' km</b> en voiture thermique et <b class="num">'+nf(Math.round(c.w*p/1.5),0)+'</b> bouteilles d\'eau de 1,5 L.';
  } else { $('perReq').textContent='Ajoutez des utilisateurs et des requêtes pour lancer le calcul.'; $('equiv').textContent=''; }

  var tot=c.c||1, st='', lg='';
  PARTS.forEach(function(q){
    var v=c.parts[q[0]], pc=v/tot*100;
    st+='<i style="width:'+pc+'%;background:'+q[2]+'" title="'+q[1]+'"></i>';
    lg+='<li style="--c:'+q[2]+'">'+q[1]+'<span class="num">'+nf(pc,0)+' %</span></li>';
  });
  $('stack').innerHTML=st; $('legend').innerHTML=lg;

  state.ucs.forEach(function(uc,i){ var s=$('share'+i); if(s) s.textContent=c.c>0? nf(c.uc[i]/c.c*100,0)+' % du total':''; });

  var anyLv=state.lv.inR||state.lv.outR||state.lv.route;
  if(anyLv && base[1].c>0){
    var g=1-c.c/base[1].c;
    $('gain').innerHTML='Avec ces leviers : <b class="num">−'+nf(g*100,0)+' %</b> d\'émissions, soit <b class="num">'+j(fC((base[1].c-c.c)*12))+'</b> évités par an (estimation centrale).';
  } else $('gain').textContent='Aucun levier activé.';

  last={lo:lo,c:c,hi:hi,p:p,base:base[1],anyLv:anyLv};
  save();
}

/* ---------- Synthèse ---------- */
$('copyBtn').addEventListener('click',function(){
  if(!last) return;
  var L=last, p=L.p, per=p===12?'par an':'par mois';
  var t='Empreinte environnementale de l\'IA ('+per+'), méthode Mind W3B v1\n\n';
  t+='Émissions : '+j(fC(L.c.c*p))+' (fourchette '+j(fC(L.lo.c*p))+' à '+j(fC(L.hi.c*p))+')\n';
  t+='Électricité : '+j(fE(L.c.e*p))+' (fourchette '+j(fE(L.lo.e*p))+' à '+j(fE(L.hi.e*p))+')\n';
  t+='Eau : '+j(fW(L.c.w*p))+' (fourchette '+j(fW(L.lo.w*p))+' à '+j(fW(L.hi.w*p))+')\n\nUsages :\n';
  state.ucs.forEach(function(uc,i){
    var m=MODELS.find(function(x){return x.id===uc.model;});
    t+='- '+uc.name+' ('+(m?m.n:'')+') : '+j(fC(L.c.uc[i]*p))+'\n';
  });
  if(L.anyLv) t+='\nLeviers simulés : −'+nf((1-L.c.c/L.base.c)*100,0)+' % d\'émissions.\n';
  t+='\nLes tailles des modèles fermés sont estimées : les résultats sont des ordres de grandeur.';
  function ok(){ $('copyNote').textContent='Synthèse copiée.'; setTimeout(function(){$('copyNote').textContent='';},2500); }
  function fallback(){
    var ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); ok(); }catch(e){ $('copyNote').textContent='Copie impossible ici. Sélectionnez le texte à la main.'; }
    document.body.removeChild(ta);
  }
  try{ navigator.clipboard.writeText(t).then(ok,fallback); }catch(e){ fallback(); }
});
$('resetBtn').addEventListener('click',function(){
  state=JSON.parse(JSON.stringify(DEFAULT));
  LV.forEach(function(l){$(l[0]).value=0;});
  HYP_DEF.forEach(function(h){$('h_'+h.k).value=h.v;});
  renderUcs(); update();
});

/* ---------- Thème ---------- */
var root=document.documentElement;
try{ var th=localStorage.getItem(KEY+'-theme'); if(th) root.setAttribute('data-theme',th); }catch(e){}
$('themeBtn').addEventListener('click',function(){
  var cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  var nx=cur==='dark'?'light':'dark'; root.setAttribute('data-theme',nx);
  try{ localStorage.setItem(KEY+'-theme',nx); }catch(e){}
});

/* ---------- Méthode : tout déplier / replier ---------- */
var mDet=document.querySelectorAll('.method details');
function syncToggle(){
  var all=Array.prototype.every.call(mDet,function(d){return d.open;});
  $('mToggle').textContent=all?'Tout replier':'Tout déplier';
  $('mToggle').setAttribute('aria-pressed',all?'true':'false');
}
$('mToggle').addEventListener('click',function(){
  var open=$('mToggle').getAttribute('aria-pressed')!=='true';
  Array.prototype.forEach.call(mDet,function(d){d.open=open;});
  syncToggle();
});
Array.prototype.forEach.call(mDet,function(d){d.addEventListener('toggle',syncToggle);});

renderUcs(); update();
})();
