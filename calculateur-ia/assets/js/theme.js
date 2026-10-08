/*!
 * Calculateur d'empreinte de l'IA, Mind W3B : thème clair ou sombre
 */
(function(){
"use strict";
var KEY='mw3b-empreinte-ia-v1-theme', root=document.documentElement;
var mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function saved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
function apply(t){
  root.setAttribute('data-theme',t);
  var b=document.querySelectorAll('[data-theme-toggle]');
  for(var i=0;i<b.length;i++){
    b[i].setAttribute('aria-label',t==='dark'?'Passer en thème clair':'Passer en thème sombre');
    b[i].setAttribute('title',t==='dark'?'Thème clair':'Thème sombre');
  }
}
apply(saved()||(mq&&mq.matches?'dark':'light'));
if(mq&&mq.addEventListener) mq.addEventListener('change',function(e){ if(!saved()) apply(e.matches?'dark':'light'); });
document.addEventListener('DOMContentLoaded',function(){
  apply(root.getAttribute('data-theme'));
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-theme-toggle]'); if(!b) return;
    var nx=root.getAttribute('data-theme')==='dark'?'light':'dark';
    apply(nx);
    try{ localStorage.setItem(KEY,nx); }catch(err){}
  });
});
})();
