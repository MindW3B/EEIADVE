/*!
 * Calculateur d'empreinte de l'IA, Mind W3B : adresse de contact
 */
// L'adresse n'est jamais écrite en clair dans les pages : elle est assemblée ici, pour les robots qui collectent les emails.
(function(){
"use strict";
document.querySelectorAll('[data-mail-u]').forEach(function(a){
  var e=a.dataset.mailU+'@'+a.dataset.mailD;
  a.href='mailto:'+e; a.textContent=e;
});
})();
