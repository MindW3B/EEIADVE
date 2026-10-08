/*!
 * Calculateur d'empreinte de l'IA, Mind W3B : fenêtres d'audit et de synthèse PDF
 */
(function(){
"use strict";
var M=window.MW3B, CONTACT='nolan.nabeth@mindw3b.co';
var POLITIQUE='<a href="/confidentialite" target="_blank" rel="noopener">politique de confidentialité</a>';
var PIEGE='<div class="dlg-hp" aria-hidden="true"><label>Site web <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label></div>';
var FERMER='<button type="button" class="dlg-x" data-fermer aria-label="Fermer"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>';

function champ(nom,lab,type,attrs,facultatif){
  return '<div class="dlg-f"><label for="c-'+nom+'">'+lab+(facultatif?' <span>(facultatif)</span>':'')+'</label>'+
    (type==='textarea'?'<textarea id="c-'+nom+'" name="'+nom+'" rows="3" '+attrs+'></textarea>':'<input type="'+type+'" id="c-'+nom+'" name="'+nom+'" '+attrs+'>')+'</div>';
}

var HTML={
  audit:'<dialog class="dlg" id="dlg-audit" aria-labelledby="dlg-audit-t">'+FERMER+
    '<form class="dlg-form">'+
      '<h2 id="dlg-audit-t">Faire auditer vos usages</h2>'+
      '<p class="dlg-sub">Laissez vos coordonnées, Mind W3B vous recontacte. La synthèse de votre calcul est transmise automatiquement avec votre demande.</p>'+
      '<div class="dlg-grid">'+
        champ('nom','Nom','text','autocomplete="name" maxlength="100" required autofocus')+
        champ('entreprise','Entreprise','text','autocomplete="organization" maxlength="120" required')+
        champ('email','Email professionnel','email','autocomplete="email" maxlength="254" required')+
        champ('tel','Téléphone','tel','autocomplete="tel" maxlength="30" pattern="[0-9 +().\\-]{6,30}"',true)+
      '</div>'+
      champ('message','Message','textarea','maxlength="2000" placeholder="Votre contexte, vos questions…"',true)+
      PIEGE+
      '<label class="dlg-check"><input type="checkbox" name="consentement" required><span>J\'accepte que Mind W3B utilise ces informations pour répondre à ma demande. Plus de détails dans la '+POLITIQUE+'.</span></label>'+
      '<p class="dlg-err" role="alert"></p>'+
      '<button type="submit" class="dlg-btn">Envoyer ma demande</button>'+
    '</form>'+
    '<div class="dlg-done" hidden tabindex="-1">'+
      '<p class="dlg-ok-ic" aria-hidden="true">✓</p>'+
      '<h2>Merci, votre demande est bien enregistrée</h2>'+
      '<p class="dlg-sub">Mind W3B l\'a reçue avec la synthèse de votre calcul et vous recontacte par email.</p>'+
      '<button type="button" class="dlg-btn" data-fermer>Fermer</button>'+
    '</div>'+
  '</dialog>',

  synthese:'<dialog class="dlg" id="dlg-synthese" aria-labelledby="dlg-synthese-t">'+FERMER+
    '<form class="dlg-form">'+
      '<p class="dlg-pdf" aria-hidden="true"><span>PDF</span></p>'+
      '<h2 id="dlg-synthese-t">Recevez votre synthèse en PDF</h2>'+
      '<p class="dlg-sub">Un récapitulatif de votre résultat et de vos réponses, aux couleurs de Mind W3B, à garder ou à partager en interne.</p>'+
      champ('s-email','Votre email professionnel','email','autocomplete="email" maxlength="254" placeholder="vous@entreprise.fr" required autofocus')+
      PIEGE+
      '<label class="dlg-check"><input type="checkbox" name="actualites"><span>Je souhaite aussi recevoir les actualités de Mind W3B (facultatif, désinscription à tout moment).</span></label>'+
      '<p class="dlg-mention">Votre email est enregistré avec la synthèse de votre calcul, et Mind W3B pourra vous écrire à son sujet. Plus de détails dans la '+POLITIQUE+'.</p>'+
      '<p class="dlg-err" role="alert"></p>'+
      '<button type="submit" class="dlg-btn">Télécharger votre synthèse</button>'+
    '</form>'+
    '<div class="dlg-done" hidden tabindex="-1">'+
      '<p class="dlg-ok-ic" aria-hidden="true">✓</p>'+
      '<h2>Votre synthèse est prête</h2>'+
      '<p class="dlg-sub">Le PDF se télécharge. S\'il ne s\'est pas ouvert, utilisez le bouton ci-dessous.</p>'+
      '<div class="dlg-actions">'+
        '<button type="button" class="dlg-btn" data-telecharger>Télécharger le PDF</button>'+
        '<button type="button" class="dlg-btn ghost" data-copier>Copier le texte</button>'+
      '</div>'+
      '<p class="dlg-note" aria-live="polite"></p>'+
      '<textarea class="dlg-texte" readonly hidden aria-label="Texte de la synthèse"></textarea>'+
    '</div>'+
  '</dialog>'
};

var dlg={}, ouvertA=0, texte='', syCourant=null, DEBLOQUE='mw3b-synthese-ok';
function debloque(){ try{ return localStorage.getItem(DEBLOQUE)==='1'; }catch(e){ return false; } }
function construire(type){
  if(dlg[type]) return dlg[type];
  var tmp=document.createElement('div'); tmp.innerHTML=HTML[type];
  var d=tmp.firstChild; document.body.appendChild(d); dlg[type]=d;
  d.addEventListener('click',function(e){
    if(e.target===d||e.target.closest('[data-fermer]')) d.close();
    if(e.target.closest('[data-copier]')) copier(d);
    if(e.target.closest('[data-telecharger]')) telecharger(d);
  });
  d.querySelector('form').addEventListener('submit',function(e){ e.preventDefault(); envoyer(type,d,this); });
  return d;
}

function etat(){ return M.etatCourant?M.etatCourant():null; }

function ouvrir(type){
  var d=construire(type), s=etat(), sy=s&&M.synthese(s.mode,s.donnees);
  texte=sy?sy.texte:''; syCourant=sy||null;
  // Le visiteur qui a déjà laissé son email dans ce navigateur télécharge directement.
  var dejaFait=type==='synthese'&&sy&&debloque();
  d.querySelector('form').hidden=dejaFait;
  d.querySelector('.dlg-done').hidden=!dejaFait;
  var ta=d.querySelector('.dlg-texte'); if(ta){ ta.hidden=true; d.querySelector('.dlg-note').textContent=''; }
  var err=d.querySelector('.dlg-err');
  err.textContent=sy?'':'Complétez d\'abord le calcul : il n\'y a encore rien à envoyer.';
  d.querySelectorAll('[type=submit],[data-copier],[data-telecharger]').forEach(function(b){ b.disabled=!sy; });
  ouvertA=Date.now();
  d.showModal();
  if(dejaFait) telecharger(d);
}

function envoyer(type,d,f){
  var s=etat(), btn=f.querySelector('[type=submit]'), err=d.querySelector('.dlg-err');
  if(!s||!texte) return;
  var corps={mode:s.mode,donnees:s.donnees,site_web:f.site_web.value,delai:Date.now()-ouvertA};
  if(type==='audit'){
    corps.nom=f.nom.value; corps.entreprise=f.entreprise.value; corps.email=f.email.value;
    corps.tel=f.tel.value; corps.message=f.message.value; corps.consentement=f.consentement.checked;
  } else {
    corps.email=f['s-email'].value; corps.actualites=f.actualites.checked;
  }
  var lib=btn.textContent;
  btn.disabled=true; btn.textContent='Envoi en cours…'; err.textContent='';
  function fin(){ btn.disabled=false; btn.textContent=lib; }
  function echec(msg){
    fin();
    err.innerHTML='';
    err.appendChild(document.createTextNode((msg||'L\'envoi n\'a pas abouti.')+' Vous pouvez aussi écrire à '));
    var a=document.createElement('a'); a.href='mailto:'+CONTACT; a.textContent=CONTACT; err.appendChild(a); err.appendChild(document.createTextNode('.'));
  }
  function reussi(){
    fin();
    f.hidden=true;
    var ok=d.querySelector('.dlg-done'); ok.hidden=false;
    ok.focus();
    if(type==='audit') f.message.value='';
    else { try{ localStorage.setItem(DEBLOQUE,'1'); }catch(e){} telecharger(d); }
  }
  fetch('/api/'+type,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corps)})
    .then(function(r){ return r.json().catch(function(){ return {ok:false}; }).then(function(j){ j.status=r.status; return j; }); })
    .then(function(rep){
      if(rep.ok) return reussi();
      // Panne côté serveur : on ne prive pas le visiteur de sa synthèse.
      if(type==='synthese'&&rep.status>=500) return reussi();
      echec(rep.erreur);
    }, function(){ if(type==='synthese') reussi(); else echec('L\'envoi n\'a pas abouti. Vérifiez votre connexion.'); });
}

function enregistrer(blob,nom){
  var a=document.createElement('a'), url=URL.createObjectURL(blob);
  a.href=url; a.download=nom; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); },4000);
}
function telecharger(d){
  var note=d.querySelector('.dlg-note'), b=d.querySelector('[data-telecharger]');
  if(!syCourant) return;
  b.disabled=true; note.textContent='Préparation du PDF…';
  M.rapportPDF(syCourant).then(function(pdf){
    enregistrer(pdf,'synthese-empreinte-ia-mindw3b.pdf');
    b.disabled=false; note.textContent='PDF téléchargé.';
  },function(){
    // Rendu impossible (navigateur très ancien) : on se rabat sur le texte.
    enregistrer(new Blob([texte],{type:'text/plain;charset=utf-8'}),'synthese-empreinte-ia-mindw3b.txt');
    b.disabled=false; note.textContent='Synthèse téléchargée en texte.';
  });
}

function copier(d){
  var note=d.querySelector('.dlg-note'), ta=d.querySelector('.dlg-texte');
  function ok(){ note.textContent='Texte copié.'; setTimeout(function(){ note.textContent=''; },2500); }
  function manuel(){
    // Presse-papiers indisponible : on affiche le texte, déjà sélectionné.
    ta.value=texte; ta.hidden=false; ta.focus(); ta.select();
    try{ if(document.execCommand('copy')) return ok(); }catch(e){}
    note.textContent='Copie automatique impossible ici : le texte est sélectionné, copiez-le à la main.';
  }
  try{ navigator.clipboard.writeText(texte).then(ok,manuel); }catch(e){ manuel(); }
}

document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-contact]');
  if(b&&!b.disabled) ouvrir(b.dataset.contact);
});
// Lien direct vers le formulaire d'audit : /#audit
if(location.hash==='#audit'){
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
  ouvrir('audit');
}
})();
