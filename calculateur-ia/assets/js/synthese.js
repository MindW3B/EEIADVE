/*!
 * Calculateur d'empreinte environnementale de l'IA en entreprise
 * Synthèse des résultats, partagée par les deux pages et par les fonctions d'envoi d'email (api/)
 * Mind W3B, méthode v1 (octobre 2026)
 * https://www.mindw3b.co/
 */
(function(root){
"use strict";
var M=root.MW3B;

/* ---------- Formatage ---------- */
function nf(n,d){return n.toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:0});}
// Arrondis identiques à ceux de chaque page : plus de décimales en mode expert.
var sig, fC, fE, fW;
function formats(expert){
  sig=function(n){ if(n===0) return '0'; var a=Math.abs(n); return nf(n,a>=100?0:a>=10?1:a>=1?(expert?2:1):(expert?3:2)); };
  fC=function(kg){ return kg>=1000? sig(kg/1000)+' t CO₂e' : kg>=1? sig(kg)+' kg CO₂e' : sig(kg*1000)+' g CO₂e'; };
  fE=function(kwh){ return kwh>=1000? sig(kwh/1000)+' MWh' : kwh>=1? sig(kwh)+' kWh' : sig(kwh*1000)+' Wh'; };
  fW=function(l){ return l>=1000? sig(l/1000)+' m³' : (expert?sig(l):nf(Math.round(l),0))+' L'; };
}
function lib(list,id){ var x=list.find(function(o){return o.id===id;}); return x?x.n:''; }

/* ---------- Nettoyage des données reçues ---------- */
// Les fonctions d'envoi recalculent tout à partir des réponses : rien de ce que renvoie le navigateur n'est recopié tel quel.
function borne(v,max,def){ var x=parseFloat(v); return isNaN(x)||x<0?(def||0):Math.min(x,max); }
function choix(v,ok){ return ok.indexOf(v)>=0?v:''; }
function ids(list){ return list.map(function(o){return o.id;}); }
// Noms d'usage : lettres, chiffres et ponctuation simple, sans point ni barre, pour qu'aucun lien ne passe dans un email.
function nom(s){ return String(s==null?'':s).replace(/[^\p{L}\p{N} '’()\-,&+]/gu,' ').replace(/\s+/g,' ').trim().slice(0,60)||'Usage sans nom'; }

var CHOIX={abonnement:['gratuit','individuel','entreprise','nsp'],reflexion:['souvent','parfois','jamais','nsp'],documents:['oui','non','nsp'],europe:['oui','non','nsp']};
function nettoyerSimple(a){
  a=a&&typeof a==='object'?a:{};
  var outils=ids(M.OUTILS), extras=Object.keys(M.EXTRAS);
  function liste(v,ok){ return Array.isArray(v)?ok.filter(function(id){return v.indexOf(id)>=0;}):[]; }
  return {users:borne(a.users,1e7),outils:liste(a.outils,outils),frequence:choix(a.frequence,['occasionnelle','reguliere','intensive'])||'reguliere',
    budget:borne(a.budget,1e9)||'',abonnement:choix(a.abonnement,CHOIX.abonnement),reflexion:choix(a.reflexion,CHOIX.reflexion),
    documents:choix(a.documents,CHOIX.documents),europe:choix(a.europe,CHOIX.europe),extras:liste(a.extras,extras)};
}
function nettoyerExpert(s){
  s=s&&typeof s==='object'?s:{};
  var mods=ids(M.MODELS), ops=ids(M.OPS), grids=ids(M.GRIDS);
  var ucs=(Array.isArray(s.ucs)?s.ucs:[]).slice(0,20).map(function(u){
    u=u&&typeof u==='object'?u:{};
    return {name:nom(u.name),model:choix(u.model,mods)||'f-mid',custom:Math.max(0.1,borne(u.custom,5000,20)),
      users:borne(u.users,1e7),rpd:borne(u.rpd,1e5),days:borne(u.days,31),inTok:borne(u.inTok,1e7),outTok:borne(u.outTok,1e7),
      reasTok:borne(u.reasTok,1e7),embTok:borne(u.embTok,1e12),op:choix(u.op,ops)||'aws',grid:choix(u.grid,grids)||'us',gridCustom:borne(u.gridCustom,2)};
  });
  var lv=s.lv&&typeof s.lv==='object'?s.lv:{}, h=s.hyp&&typeof s.hyp==='object'?s.hyp:{}, hyp={};
  M.HYP_DEF.forEach(function(d){
    var v=parseFloat(h[d.k]); v=isNaN(v)||v<=0?d.v:Math.min(v,d.v*100);
    if(d.k==='host'||d.k==='idle') v=Math.max(1,v);
    hyp[d.k]=v;
  });
  return {ucs:ucs,lv:{inR:borne(lv.inR,0.8),outR:borne(lv.outR,0.6),route:borne(lv.route,0.9)},period:+s.period===12?12:1,hyp:hyp};
}

/* ---------- Synthèse ---------- */
var LIB={
  frequence:{occasionnelle:'Occasionnelle (quelques questions par semaine)',reguliere:'Régulière (plusieurs fois par jour)',intensive:'Intensive (IA ouverte toute la journée)'},
  abonnement:{gratuit:'Gratuit',individuel:'Payant individuel',entreprise:'Offre entreprise',nsp:'Ne sait pas'},
  reflexion:{souvent:'Souvent',parfois:'Parfois',jamais:'Jamais',nsp:'Ne sait pas'},
  documents:{oui:'Oui',non:'Non',nsp:'Ne sait pas'},
  europe:{oui:'Oui',non:'Non',nsp:'Ne sait pas'}
};
var NOTE='Estimation indicative, méthode Mind W3B v1. La taille des modèles d\'IA n\'est pas publiée par leurs éditeurs : les résultats sont des ordres de grandeur, donnés avec une fourchette.';

function syntheseSimple(a){
  var r=M.estimationSimple(a), users=M.num(a.users);
  if(!a.outils.length||users<=0||!(r.kg>0)) return null;
  var rep=[['Utilisateurs de l\'IA',nf(users,0)],['Outils',a.outils.map(function(id){return lib(M.OUTILS,id);}).join(', ')],['Fréquence',LIB.frequence[a.frequence]]];
  if(M.num(a.budget)>0) rep.push(['Budget IA mensuel',nf(M.num(a.budget),0)+' €']);
  ['abonnement','reflexion','documents','europe'].forEach(function(k){
    if(a[k]) rep.push([{abonnement:'Abonnement',reflexion:'Modes réflexion ou recherche approfondie',documents:'IA connectée aux documents internes',europe:'Données hébergées en Europe'}[k],LIB[k][a[k]]]);
  });
  if(a.extras.length) rep.push(['Autres usages',a.extras.map(function(id){return M.EXTRAS[id].n;}).join(', ')]);
  return {
    mode:'simple', periode:'par an',
    principal:{label:'Émissions de CO₂ par an',valeur:fC(r.kg),detail:'Entre '+fC(r.lo)+' et '+fC(r.hi)+' · précision '+r.precision.toLowerCase()},
    indicateurs:[['Par utilisateur',sig(r.kg/users)+' kg CO₂e par an'],['Équivalent voiture',sig(r.kg/0.2/1550)+' allers-retours Paris–Marseille'],
      ['Électricité',fE(r.kwh)+' par an'],['Eau',fW(r.l)+' par an'],['Requêtes',nf(Math.round(r.req),0)+' par an']],
    gain:'En optimisant vos usages, cette empreinte peut baisser d\'environ '+r.gain+' %, et votre facture IA baisse en même temps.',
    reponsesTitre:'Vos réponses', reponses:rep, note:NOTE
  };
}

function syntheseExpert(s){
  var res=M.compute(s,s.lv), base=M.compute(s,{inR:0,outR:0,route:0}), lo=res[0], c=res[1], hi=res[2], p=s.period, per=p===12?'par an':'par mois';
  if(!(c.req>0)) return null;
  var usages=s.ucs.map(function(u,i){
    var m=lib(M.MODELS,u.model), g=M.GRIDS.find(function(x){return x.id===u.grid;});
    var region=g.v==null? 'intensité '+nf(u.gridCustom,2)+' kg CO₂e/kWh' : g.n;
    return [u.name, fC(c.uc[i]*p)+' '+per+' · '+(u.model==='custom'?'modèle de '+nf(u.custom,1)+' Md de paramètres actifs':m)+' · '+lib(M.OPS,u.op)+', '+region+' · '+nf(Math.round(M.num(u.users)*M.num(u.rpd)*M.num(u.days)*p),0)+' requêtes '+per];
  });
  var gain=null, lv=s.lv;
  if((lv.inR||lv.outR||lv.route)&&base[1].c>0){
    var g=1-c.c/base[1].c, l=[];
    if(lv.inR) l.push('tokens d\'entrée −'+nf(lv.inR*100,0)+' %');
    if(lv.outR) l.push('tokens de sortie −'+nf(lv.outR*100,0)+' %');
    if(lv.route) l.push(nf(lv.route*100,0)+' % des requêtes vers un modèle léger');
    gain='Leviers simulés ('+l.join(', ')+') : −'+nf(g*100,0)+' % d\'émissions, soit '+fC((base[1].c-c.c)*12)+' évités par an.';
  }
  var ind=[['Électricité',fE(c.e*p)+' '+per+' (de '+fE(lo.e*p)+' à '+fE(hi.e*p)+')'],['Eau',fW(c.w*p)+' '+per+' (de '+fW(lo.w*p)+' à '+fW(hi.w*p)+')'],
    ['Requêtes',nf(Math.round(c.req*p),0)+' '+per],['Par requête',sig(c.e/c.req*1000)+' Wh, '+sig(c.c/c.req*1000)+' g CO₂e, '+sig(c.w/c.req*1000)+' mL d\'eau']];
  var mod=M.HYP_DEF.filter(function(d){return s.hyp[d.k]!==d.v;}).map(function(d){return d.l+' : '+nf(s.hyp[d.k],2);});
  if(mod.length) ind.push(['Hypothèses modifiées',mod.join(' ; ')]);
  return {
    mode:'expert', periode:per,
    principal:{label:'Émissions de gaz à effet de serre '+per,valeur:fC(c.c*p),detail:'Fourchette de '+fC(lo.c*p)+' à '+fC(hi.c*p)},
    indicateurs:ind, gain:gain, reponsesTitre:'Vos usages', reponses:usages, note:NOTE
  };
}

function texte(sy){
  var t='Empreinte environnementale de l\'IA de votre entreprise ('+sy.periode+')\nCalculateur Mind W3B, '+(sy.mode==='simple'?'version simple':'mode expert')+'\n\n';
  t+=sy.principal.label+' : '+sy.principal.valeur+'\n'+sy.principal.detail+'\n\n';
  sy.indicateurs.forEach(function(x){ t+=x[0]+' : '+x[1]+'\n'; });
  if(sy.gain) t+='\n'+sy.gain+'\n';
  t+='\n'+sy.reponsesTitre+' :\n';
  sy.reponses.forEach(function(x){ t+='- '+x[0]+' : '+x[1]+'\n'; });
  return (t+'\n'+sy.note+'\nhttps://calculateur.mindw3b.co/\n').replace(/[  ]/g,' ');
}

// mode : 'simple' ou 'expert' ; donnees : réponses (simple) ou état complet (expert).
// Renvoie null quand il n'y a encore rien à synthétiser.
function synthese(mode,donnees){
  formats(mode==='expert');
  var sy=mode==='expert'? syntheseExpert(nettoyerExpert(donnees)) : syntheseSimple(nettoyerSimple(donnees));
  if(sy) sy.texte=texte(sy);
  return sy;
}

M.synthese=synthese;
})(typeof window!=='undefined'?window:globalThis);
