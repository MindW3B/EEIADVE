/*!
 * Calculateur d'empreinte de l'IA : consultation des formulaires reçus (page /admin)
 * Mind W3B
 */
(function(){
"use strict";
var KEY='mw3b-admin', mdp='', entrees=[], filtre='tout';
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
// Ancien format : inscriptions aux actualités seules, avant le téléchargement contre email.
function news(e){ return e.type==='actualites'||e.actualites===true; }
function garde(e){ return filtre==='tout'||(filtre==='actualites'?news(e):e.type===filtre); }
function date(iso){ return new Date(iso).toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'}); }

function api(methode,qs){
  return fetch('/api/admin'+(qs||''),{method:methode,headers:{Authorization:'Bearer '+mdp}})
    .then(function(r){ return r.json().catch(function(){ return {ok:false,erreur:'Réponse illisible du serveur.'}; }).then(function(j){ j.status=r.status; return j; }); });
}

function charger(){
  $('err').textContent='';
  return api('GET').then(function(r){
    if(!r.ok){
      if(r.status===401||r.status===429){ deconnecter(); $('loginErr').textContent=r.erreur; }
      else $('err').textContent=r.erreur||'Erreur.';
      return;
    }
    entrees=r.entrees; afficher();
  },function(){ $('err').textContent='Connexion impossible.'; });
}

function afficher(){
  var n={audit:0,synthese:0,news:0};
  entrees.forEach(function(e){ if(e.type in n) n[e.type]++; if(news(e)) n.news++; });
  $('nTout').textContent=entrees.length; $('nAudit').textContent=n.audit; $('nSyn').textContent=n.synthese; $('nNews').textContent=n.news;
  document.querySelectorAll('[data-f]').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.f===filtre)); });
  var vis=entrees.filter(garde);
  $('vide').hidden=vis.length>0;
  $('liste').innerHTML=vis.map(function(e){
    var audit=e.type==='audit';
    return '<details class="card item">'+
      '<summary>'+
        '<span class="tag '+(audit?'t-audit':'t-news')+'">'+(audit?'Audit':e.type==='synthese'?'Synthèse':'Actualités')+'</span>'+
        (!audit&&news(e)?'<span class="tag t-opt">Actualités ✓</span>':'')+
        '<span class="who"><b>'+esc(audit?e.entreprise:e.email)+'</b>'+(audit?' · '+esc(e.nom):'')+'</span>'+
        '<span class="when">'+esc(date(e.date))+'</span>'+
      '</summary>'+
      '<dl>'+
        (audit?'<div><dt>Nom</dt><dd>'+esc(e.nom)+'</dd></div><div><dt>Entreprise</dt><dd>'+esc(e.entreprise)+'</dd></div>':'')+
        '<div><dt>Email</dt><dd><a href="mailto:'+esc(e.email)+'">'+esc(e.email)+'</a></dd></div>'+
        (audit?'<div><dt>Téléphone</dt><dd>'+(e.tel?'<a href="tel:'+esc(e.tel.replace(/[^\d+]/g,''))+'">'+esc(e.tel)+'</a>':'—')+'</dd></div>':'')+
        (audit?'<div><dt>Message</dt><dd class="msg">'+(e.message?esc(e.message):'—')+'</dd></div>':'')+
        '<div><dt>Résultat</dt><dd>'+esc(e.resultat||'—')+' ('+(e.mode==='expert'?'mode expert':'version simple')+')</dd></div>'+
        '<div><dt>Consentement</dt><dd>'+(audit?'Recontact accepté le '+esc(date(e.date)):e.type==='synthese'?'Email laissé pour télécharger la synthèse le '+esc(date(e.date))+'<br>Actualités : '+(e.actualites?'<b>oui</b>':'non'):'Actualités acceptées le '+esc(date(e.date)))+'</dd></div>'+
      '</dl>'+
      (e.synthese?'<details class="syn"><summary>Synthèse du calcul</summary><pre>'+esc(e.synthese)+'</pre></details>':'')+
      '<div class="item-act"><button type="button" class="a-btn ghost danger" data-del="'+esc(e.id)+'">Supprimer</button></div>'+
    '</details>';
  }).join('');
}

function csv(){
  var cols=[['date','Date'],['type','Type'],['actualites','Actualités'],['nom','Nom'],['entreprise','Entreprise'],['email','Email'],['tel','Téléphone'],['message','Message'],['resultat','Résultat'],['mode','Mode'],['synthese','Synthèse']];
  function cell(v){
    v=String(v==null?'':v);
    if(/^[=+\-@\t\r]/.test(v)) v="'"+v; // pas de formule exécutée à l'ouverture dans Excel
    return /[";\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
  var lignes=[cols.map(function(c){return c[1];}).join(';')].concat(entrees.map(function(e){
    return cols.map(function(c){ return cell(c[0]==='date'?date(e.date):c[0]==='type'?(e.type==='audit'?'Audit':e.type==='synthese'?'Synthèse':'Actualités'):c[0]==='actualites'?(news(e)?'oui':'non'):e[c[0]]); }).join(';');
  }));
  // BOM pour qu'Excel lise correctement les accents ; « ; » comme séparateur pour Excel en français.
  var url=URL.createObjectURL(new Blob(['﻿'+lignes.join('\r\n')],{type:'text/csv;charset=utf-8'}));
  var a=document.createElement('a'); a.href=url; a.download='formulaires-calculateur-'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(url); },1000);
}

function connecter(){
  $('login').hidden=true; $('panel').hidden=false; $('logout').hidden=false;
  return charger();
}
function deconnecter(){
  mdp=''; entrees=[]; try{ sessionStorage.removeItem(KEY); }catch(e){}
  $('login').hidden=false; $('panel').hidden=true; $('logout').hidden=true; $('liste').innerHTML='';
  $('pwd').value=''; $('pwd').focus();
}

$('login').addEventListener('submit',function(e){
  e.preventDefault(); mdp=$('pwd').value; $('loginErr').textContent='';
  try{ sessionStorage.setItem(KEY,mdp); }catch(err){}
  connecter();
});
$('logout').addEventListener('click',deconnecter);
$('refresh').addEventListener('click',charger);
$('csv').addEventListener('click',csv);
document.querySelectorAll('[data-f]').forEach(function(b){ b.addEventListener('click',function(){ filtre=b.dataset.f; afficher(); }); });
$('liste').addEventListener('click',function(e){
  var b=e.target.closest('[data-del]'); if(!b) return;
  if(!confirm('Supprimer définitivement cette entrée ?')) return;
  b.disabled=true;
  api('DELETE','?id='+encodeURIComponent(b.dataset.del)).then(function(r){
    if(!r.ok){ b.disabled=false; $('err').textContent=r.erreur||'Suppression impossible.'; return; }
    entrees=entrees.filter(function(x){ return x.id!==b.dataset.del; }); afficher();
  });
});

try{ mdp=sessionStorage.getItem(KEY)||''; }catch(e){}
if(mdp) connecter();
})();
