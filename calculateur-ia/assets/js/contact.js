/*!
 * Calculateur d'empreinte environnementale de l'IA en entreprise
 * Formulaires « Faire auditer nos usages » et « Recevoir la synthèse », partagés par les deux pages
 * Mind W3B
 * https://www.mindw3b.co/
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
      '<h2 id="dlg-audit-t">Faire auditer nos usages</h2>'+
      '<p class="dlg-sub">Laissez vos coordonnées, Mind W3B vous recontacte. La synthèse de votre calcul est jointe automatiquement à votre demande.</p>'+
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
      '<h2>Merci, votre demande est partie</h2>'+
      '<p class="dlg-sub">Elle est arrivée chez Mind W3B avec la synthèse de votre calcul. Nous vous répondons par email.</p>'+
      '<button type="button" class="dlg-btn" data-fermer>Fermer</button>'+
    '</div>'+
  '</dialog>',

  synthese:'<dialog class="dlg" id="dlg-synthese" aria-labelledby="dlg-synthese-t">'+FERMER+
    '<form class="dlg-form">'+
      '<h2 id="dlg-synthese-t">Recevoir la synthèse</h2>'+
      '<p class="dlg-sub">Votre résultat et vos réponses, dans un email à garder ou à transférer.</p>'+
      champ('s-email','Votre email','email','autocomplete="email" maxlength="254" required autofocus')+
      PIEGE+
      '<label class="dlg-check"><input type="checkbox" name="actualites"><span>Je souhaite aussi recevoir les actualités de Mind W3B (facultatif, désinscription à tout moment).</span></label>'+
      '<p class="dlg-mention">Votre adresse sert à vous envoyer cette synthèse. Mind W3B est prévenu de l\'envoi et peut vous écrire au sujet de votre calcul. Plus de détails dans la '+POLITIQUE+'.</p>'+
      '<p class="dlg-err" role="alert"></p>'+
      '<button type="submit" class="dlg-btn">Recevoir la synthèse</button>'+
    '</form>'+
    '<div class="dlg-done" hidden tabindex="-1">'+
      '<p class="dlg-ok-ic" aria-hidden="true">✓</p>'+
      '<h2>C\'est envoyé</h2>'+
      '<p class="dlg-sub">Votre synthèse part à <b class="dlg-dest"></b>. Si vous ne la voyez pas d\'ici quelques minutes, regardez dans vos indésirables.</p>'+
    '</div>'+
    '<div class="dlg-copie" hidden>'+
      '<button type="button" class="dlg-btn ghost" data-copier>Copier le texte de la synthèse</button>'+
      '<p class="dlg-note" aria-live="polite"></p>'+
      '<textarea class="dlg-texte" readonly hidden aria-label="Texte de la synthèse"></textarea>'+
    '</div>'+
  '</dialog>'
};

var dlg={}, ouvertA=0, texte='';
function construire(type){
  if(dlg[type]) return dlg[type];
  var tmp=document.createElement('div'); tmp.innerHTML=HTML[type];
  var d=tmp.firstChild; document.body.appendChild(d); dlg[type]=d;
  d.addEventListener('click',function(e){
    if(e.target===d||e.target.closest('[data-fermer]')) d.close();
    if(e.target.closest('[data-copier]')) copier(d);
  });
  d.querySelector('form').addEventListener('submit',function(e){ e.preventDefault(); envoyer(type,d,this); });
  return d;
}

function etat(){ return M.etatCourant?M.etatCourant():null; }

function ouvrir(type){
  var d=construire(type), s=etat(), sy=s&&M.synthese(s.mode,s.donnees);
  texte=sy?sy.texte:'';
  d.querySelector('form').hidden=false;
  d.querySelector('.dlg-done').hidden=true;
  var cp=d.querySelector('.dlg-copie'); if(cp){ cp.hidden=true; cp.querySelector('.dlg-texte').hidden=true; cp.querySelector('.dlg-note').textContent=''; }
  var err=d.querySelector('.dlg-err');
  err.textContent=sy?'':'Complétez d\'abord le calcul : il n\'y a encore rien à envoyer.';
  d.querySelector('.dlg-btn[type=submit]').disabled=!sy;
  ouvertA=Date.now();
  d.showModal();
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
    var cp=d.querySelector('.dlg-copie'); if(cp) cp.hidden=false;
  }
  fetch('/api/'+type,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corps)})
    .then(function(r){ return r.json().catch(function(){ return {ok:false}; }); })
    .then(function(rep){
      if(!rep||!rep.ok) return echec(rep&&rep.erreur);
      fin();
      f.hidden=true;
      var ok=d.querySelector('.dlg-done'); ok.hidden=false;
      var dest=d.querySelector('.dlg-dest'); if(dest) dest.textContent=corps.email;
      var cp=d.querySelector('.dlg-copie'); if(cp) cp.hidden=false;
      ok.focus();
      if(type==='audit') f.message.value='';
    }, function(){ echec('L\'envoi n\'a pas abouti. Vérifiez votre connexion.'); });
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
// Lien « Faire auditer nos usages » de l'email de synthèse : /#audit
if(location.hash==='#audit'){
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
  ouvrir('audit');
}
})();
