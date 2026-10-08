/*!
 * Calculateur d'empreinte de l'IA, Mind W3B : moteur de calcul (pages et api/)
 * Méthode v1, octobre 2026
 */
(function(root){
"use strict";

// Adresse publique du site. Pour la changer partout : ./changer-adresse.sh à la racine du dépôt.
var SITE='https://mindw3b-calculateur.vercel.app/';

/* ---------- Référentiels ---------- */
var MODELS=[
  {id:'f-front',g:'Modèles fermés (taille estimée)',n:'Classe frontière (ex. Claude Opus, GPT-5, Gemini Pro)',p:[60,150,400]},
  {id:'f-mid',g:'Modèles fermés (taille estimée)',n:'Classe intermédiaire (ex. Claude Sonnet, GPT-5 mini, Gemini Flash)',p:[20,50,120]},
  {id:'f-small',g:'Modèles fermés (taille estimée)',n:'Classe légère (ex. Claude Haiku, GPT-5 nano, Gemini Flash-Lite)',p:[3,10,25]},
  {id:'llama405',g:'Modèles ouverts (taille publiée)',n:'Llama 3.1 405B (dense)',p:[405,405,405]},
  {id:'mlarge2',g:'Modèles ouverts (taille publiée)',n:'Mistral Large 2 (123B, dense)',p:[123,123,123]},
  {id:'llama70',g:'Modèles ouverts (taille publiée)',n:'Llama 3.3 70B (dense)',p:[70,70,70]},
  {id:'deepseek',g:'Modèles ouverts (taille publiée)',n:'DeepSeek V3 / R1 (671B, 37B actifs)',p:[37,37,37]},
  {id:'mistral-small',g:'Modèles ouverts (taille publiée)',n:'Mistral Small 3 (24B, dense)',p:[24,24,24]},
  {id:'qwen235',g:'Modèles ouverts (taille publiée)',n:'Qwen3 235B-A22B (22B actifs)',p:[22,22,22]},
  {id:'llama8',g:'Modèles ouverts (taille publiée)',n:'Llama 3.1 8B (dense)',p:[8,8,8]},
  {id:'gptoss120',g:'Modèles ouverts (taille publiée)',n:'gpt-oss-120b (5,1B actifs)',p:[5.1,5.1,5.1]},
  {id:'gptoss20',g:'Modèles ouverts (taille publiée)',n:'gpt-oss-20b (3,6B actifs)',p:[3.6,3.6,3.6]},
  {id:'custom',g:'Autre',n:'Personnalisé (paramètres actifs à saisir)',p:null}
];
var OPS=[
  {id:'google',n:'Google Cloud',pue:1.09,wue:1.0},
  {id:'aws',n:'AWS',pue:1.15,wue:0.15},
  {id:'azure',n:'Microsoft Azure',pue:1.18,wue:0.30},
  {id:'colo',n:'Datacenter moyen (colocation)',pue:1.56,wue:0.5},
  {id:'onprem',n:'Salle serveur interne',pue:1.8,wue:0.3}
];
var GRIDS=[
  {id:'us',n:'États-Unis (moyenne)',v:0.38},
  {id:'fr',n:'France',v:0.05},
  {id:'se',n:'Suède',v:0.04},
  {id:'fi',n:'Finlande',v:0.08},
  {id:'be',n:'Belgique',v:0.15},
  {id:'nl',n:'Pays-Bas',v:0.30},
  {id:'ie',n:'Irlande',v:0.30},
  {id:'de',n:'Allemagne',v:0.38},
  {id:'custom',n:'Valeur personnalisée',v:null}
];
var SC=[ // basse, centrale, haute
  {uD:0.15,uP:0.45,emb:1500,train:0.05},
  {uD:0.10,uP:0.35,emb:2500,train:0.15},
  {uD:0.06,uP:0.25,emb:4000,train:0.40}
];
var HYP_DEF=[
  {k:'peak',l:'Puissance de calcul GPU (TFLOPS)',v:989,s:1},
  {k:'gpuW',l:'Puissance électrique GPU (W)',v:700,s:10},
  {k:'host',l:'Facteur serveur hors GPU (CPU, RAM, réseau)',v:1.43,s:0.01},
  {k:'idle',l:'Facteur machines en veille',v:1.17,s:0.01},
  {k:'life',l:"Durée de vie d'un serveur (ans)",v:4,s:0.5},
  {k:'ewif',l:"Eau pour produire 1 kWh (L)",v:3.0,s:0.1},
  {k:'embP',l:"Taille du modèle d'embedding (Md de paramètres)",v:0.6,s:0.1},
  {k:'car',l:'Voiture thermique (kg CO₂e/km)',v:0.2,s:0.01}
];
var HYP={}; HYP_DEF.forEach(function(h){HYP[h.k]=h.v;});

function num(v,def){ var x=parseFloat(v); return isNaN(x)||x<0?(def||0):x; }

/* ---------- Calcul détaillé (mode expert) ---------- */
function modelParams(uc,i){
  var m=MODELS.find(function(x){return x.id===uc.model;})||MODELS[1];
  return m.p? m.p[i] : Math.max(0.1,num(uc.custom,1));
}
function gpuSec(P,inT,outT,i,H){
  var f=2*P*1e9, peak=H.peak*1e12;
  return f*outT/(peak*SC[i].uD) + f*inT/(peak*SC[i].uP);
}
// state : {ucs:[…], hyp:{…}} ; lv : {inR, outR, route}. Renvoie les scénarios bas, central et haut, par mois.
function compute(state,lv){
  var H=state.hyp, out=[0,1,2].map(function(){return {e:0,c:0,w:0,req:0,parts:{gpu:0,srv:0,dc:0,fab:0,train:0},uc:[]};});
  state.ucs.forEach(function(uc){
    var op=OPS.find(function(o){return o.id===uc.op;})||OPS[1];
    var g=GRIDS.find(function(o){return o.id===uc.grid;})||GRIDS[0];
    var grid=g.v==null?num(uc.gridCustom,0):g.v;
    var req=num(uc.users)*num(uc.rpd)*num(uc.days);
    var inT=num(uc.inTok)*(1-lv.inR), outT=(num(uc.outTok)+num(uc.reasTok))*(1-lv.outR);
    [0,1,2].forEach(function(i){
      var P=modelParams(uc,i), Ps=MODELS[2].p[i];
      var r=(P>Ps)?lv.route:0;
      var gs=req*((1-r)*gpuSec(P,inT,outT,i,H)+r*gpuSec(Ps,inT,outT,i,H));
      gs+=num(uc.embTok)*2*H.embP*1e9/(H.peak*1e12*SC[i].uP);
      var eGpu=gs*H.gpuW/3.6e6, eHost=eGpu*(H.host-1), eIdle=(eGpu+eHost)*(H.idle-1);
      var it=eGpu+eHost+eIdle, eDc=it*(op.pue-1), e=it+eDc;
      var fab=gs*H.idle*SC[i].emb/(8*H.life*365*86400);
      var cUse=e*grid, cBase=cUse+fab, tr=SC[i].train;
      var c=cBase*(1+tr), en=e*(1+tr), w=e*(op.wue+H.ewif)*(1+tr);
      var o=out[i];
      o.e+=en; o.c+=c; o.w+=w; o.req+=req;
      o.parts.gpu+=eGpu*grid; o.parts.srv+=(eHost+eIdle)*grid; o.parts.dc+=eDc*grid; o.parts.fab+=fab; o.parts.train+=cBase*tr;
      o.uc.push(c);
    });
  });
  return out;
}

/* ---------- Calcul simplifié (version dirigeants) ---------- */
var FAB=1.02, EAU_KWH=3.5, EUROPE_MAX=0.15;
// Une requête, scénario central. P en milliards de paramètres actifs.
function requete(P,inT,outT,pue,reseau){
  var sec=gpuSec(P,inT,outT,1,HYP);
  var wh=sec*HYP.gpuW/3600*HYP.host*HYP.idle*pue*(1+SC[1].train);
  return {wh:wh, kg:wh/1000*reseau*FAB, l:wh/1000*EAU_KWH};
}
var OUTILS=[
  {id:'chatgpt',n:'ChatGPT',pue:1.18,reseau:0.38,op:'azure',grid:'us'},
  {id:'claude',n:'Claude',pue:1.12,reseau:0.38,op:'aws',grid:'us'},
  {id:'gemini',n:'Gemini',pue:1.09,reseau:0.38,op:'google',grid:'us'},
  {id:'copilot',n:'Microsoft Copilot',pue:1.18,reseau:0.38,op:'azure',grid:'us'},
  {id:'mistral',n:'Mistral Le Chat',pue:1.2,reseau:0.05,op:'azure',grid:'se'},
  {id:'interne',n:'Outil interne ou autre',pue:1.5,reseau:0.2,op:'colo',grid:'fr'}
];
var FREQ={occasionnelle:2, reguliere:10, intensive:40};
var REFLEXION={souvent:3, parfois:1.6, jamais:1};
var EXTRAS={
  chatbot:{n:'Chatbot pour vos clients',rpd:600,days:30,P:10,inT:4000,outT:300,pue:1.12,reseau:0.38,model:'f-small',outTok:300,reasTok:0,op:'aws',grid:'us'},
  code:{n:'Développeurs qui codent avec l\'IA',rpd:60,days:21,P:150,inT:8000,outT:2100,pue:1.12,reseau:0.38,model:'f-front',outTok:600,reasTok:1500,op:'aws',grid:'us'},
  auto:{n:'Automatisations et agents IA',rpd:1000,days:30,P:50,inT:3000,outT:500,pue:1.15,reseau:0.38,model:'f-mid',outTok:500,reasTok:0,op:'aws',grid:'us'}
};
var PRECISION=['Indicative','Approximative','Correcte','Bonne','Fine'];

function multReflexion(v){ return REFLEXION[v]||1.4; }
function multDocs(v){ return v==='oui'?2.5:v==='non'?1:1.3; }
function reseauEurope(r,eu){ return eu&&r>EUROPE_MAX?EUROPE_MAX:r; }
function extraUsers(id,users){ return id==='code'?Math.max(1,Math.round(users*0.1)):1; }

// Liste des usages (par an) déduite des réponses de la version simple.
function usagesSimples(a){
  var users=num(a.users), eu=a.europe==='oui', list=[];
  var tools=OUTILS.filter(function(t){return a.outils.indexOf(t.id)>=0;});
  var P=a.abonnement==='gratuit'?10:50, rpd=FREQ[a.frequence]||FREQ.reguliere;
  var inT=1200*multDocs(a.documents), outT=350*multReflexion(a.reflexion);
  tools.forEach(function(t){
    list.push({id:t.id,req:users/tools.length*rpd*21*12,P:P,inT:inT,outT:outT,pue:t.pue,reseau:reseauEurope(t.reseau,eu)});
  });
  (a.extras||[]).forEach(function(id){
    var x=EXTRAS[id]; if(!x) return;
    list.push({id:id,req:extraUsers(id,users)*x.rpd*x.days*12,P:x.P,inT:x.inT,outT:x.outT,pue:x.pue,reseau:reseauEurope(x.reseau,eu)});
  });
  return list;
}
function totaliser(list,opt){
  var t={kg:0,kwh:0,l:0,req:0};
  list.forEach(function(u){
    var inT=u.inT*(1-opt.inR), outT=u.outT*(1-opt.outR);
    var r=u.P>10?opt.route:0;
    var a=requete(u.P,inT,outT,u.pue,u.reseau), b=requete(10,inT,outT,u.pue,u.reseau);
    t.kg+=u.req*((1-r)*a.kg+r*b.kg);
    t.kwh+=u.req*((1-r)*a.wh+r*b.wh)/1000;
    t.l+=u.req*((1-r)*a.l+r*b.l);
    t.req+=u.req;
  });
  return t;
}
function nbRepondues(a){
  var n=0;
  ['abonnement','reflexion','documents','europe'].forEach(function(k){ if(a[k]&&a[k]!=='nsp') n++; });
  if(num(a.budget)>0) n++;
  return n;
}
// Résultat annuel de la version simple.
function estimationSimple(a){
  var list=usagesSimples(a), c=totaliser(list,{inR:0,outR:0,route:0});
  var o=totaliser(list,{inR:0.4,outR:0.2,route:0.5});
  var n=nbRepondues(a), k=Math.max(1.35,3*Math.pow(0.82,n));
  var gain=c.kg>0?Math.round((1-o.kg/c.kg)*20)*5:0;
  var pts=Math.min(5,1+n);
  // Les usages complémentaires comptent comme une réponse affichée, sans resserrer la fourchette.
  var repondues=n+(a.extras&&a.extras.length?1:0);
  return {kg:c.kg,kwh:c.kwh,l:c.l,req:c.req,lo:c.kg/k,hi:c.kg*k,repondues:repondues,points:pts,precision:PRECISION[pts-1],gain:gain};
}
// Équivalent voiture : en allers-retours Paris–Marseille (1 550 km) au-delà d'un trajet, en kilomètres en dessous.
function voiture(kg){
  var km=kg/HYP.car, ar=km/1550;
  if(ar>=1) return {ar:ar};
  return {km:km>=100?Math.round(km/10)*10:Math.max(1,Math.round(km))};
}
// Position (0 à 100) d'une valeur sur la barre de fourchette, échelle log centrée sur c.
function posFourchette(v,c){ return Math.log(v/(c/3.2))/Math.log(3.2*3.2)*100; }

// Traduction des réponses simples en état du mode expert (même structure que son DEFAULT).
function versExpert(a){
  var users=num(a.users), eu=a.europe==='oui', ucs=[];
  var tools=OUTILS.filter(function(t){return a.outils.indexOf(t.id)>=0;});
  var rpd=FREQ[a.frequence]||FREQ.reguliere, mr=multReflexion(a.reflexion);
  function grid(g){ var v=(GRIDS.find(function(x){return x.id===g;})||GRIDS[0]).v; return eu&&v>EUROPE_MAX?{grid:'custom',gridCustom:EUROPE_MAX}:{grid:g,gridCustom:0.1}; }
  function uc(o){ return Object.assign({name:'',model:'f-mid',custom:20,users:0,rpd:0,days:21,inTok:0,outTok:0,reasTok:0,embTok:0,op:'aws',grid:'us',gridCustom:0.1},o); }
  tools.forEach(function(t){
    ucs.push(uc(Object.assign({name:t.n,model:a.abonnement==='gratuit'?'f-small':'f-mid',users:Math.round(users/tools.length*100)/100,rpd:rpd,days:21,
      inTok:Math.round(1200*multDocs(a.documents)),outTok:350,reasTok:Math.round(350*(mr-1)),op:t.op},grid(t.grid))));
  });
  (a.extras||[]).forEach(function(id){
    var x=EXTRAS[id]; if(!x) return;
    ucs.push(uc(Object.assign({name:x.n,model:x.model,users:extraUsers(id,users),rpd:x.rpd,days:x.days,inTok:x.inT,outTok:x.outTok,reasTok:x.reasTok,op:x.op},grid(x.grid))));
  });
  return {ucs:ucs,lv:{inR:0,outR:0,route:0},period:12,hyp:Object.assign({},HYP)};
}

root.MW3B={SITE:SITE,MODELS:MODELS,OPS:OPS,GRIDS:GRIDS,HYP_DEF:HYP_DEF,num:num,compute:compute,
  OUTILS:OUTILS,EXTRAS:EXTRAS,estimationSimple:estimationSimple,voiture:voiture,posFourchette:posFourchette,versExpert:versExpert};
})(typeof window!=='undefined'?window:globalThis);
