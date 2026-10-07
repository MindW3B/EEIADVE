/*!
 * Calculateur d'empreinte environnementale de l'IA en entreprise
 * Synthèse en PDF aux couleurs de Mind W3B, dessinée dans le navigateur (canvas) puis assemblée en PDF, sans bibliothèque
 * Mind W3B
 * https://www.mindw3b.co/
 */
(function(){
"use strict";
var M=window.MW3B;
var W=794, H=1123, MX=56, ECH=2.5;           // page A4 en px CSS, marge, résolution du rendu
var HAUT_PIED=64, BAS=H-HAUT_PIED-8;         // zone réservée au pied de page
var C={nuit:'#130f2c',violet:'#5b3fd6',rose:'#ff2fb5',magenta:'#d1148c',lilas:'#9a7bff',bleu:'#4a6bff',mut:'#5d5886',doux:'#f3f1ff',ligne:'#e4e0f3',nuitDoux:'#c3bde6'};
var SORA='"Sora","Manrope",system-ui,-apple-system,"Segoe UI",Arial,sans-serif';
var MAN='"Manrope",system-ui,-apple-system,"Segoe UI",Arial,sans-serif';
var CONTACT='nolan.nabeth@mindw3b.co', SITE='https://calculateur.mindw3b.co/';

function police(ctx,poids,taille,famille){ ctx.font=poids+' '+taille+'px '+famille; }
function lignes(ctx,texte,largeur){
  var mots=String(texte).split(/ +/), out=[], cur='';
  mots.forEach(function(m){
    var essai=cur?cur+' '+m:m;
    if(cur&&ctx.measureText(essai).width>largeur){ out.push(cur); cur=m; } else cur=essai;
  });
  if(cur) out.push(cur);
  return out;
}
function rond(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function degrade(ctx,x,w,couleurs){
  var g=ctx.createLinearGradient(x,0,x+w,0);
  couleurs.forEach(function(c,i){ g.addColorStop(i/(couleurs.length-1),c); });
  return g;
}
function espacement(ctx,v){ if('letterSpacing' in ctx) ctx.letterSpacing=v; }

/* ---------- Mise en page ---------- */
function Mise(logo,date){
  this.logo=logo; this.date=date; this.pages=[]; this.nouvellePage();
}
Mise.prototype.nouvellePage=function(){
  var cv=document.createElement('canvas'); cv.width=W*ECH; cv.height=H*ECH;
  var ctx=cv.getContext('2d'); ctx.scale(ECH,ECH);
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  ctx.textBaseline='alphabetic';
  this.page={cv:cv,ctx:ctx,liens:[]}; this.pages.push(this.page); this.ctx=ctx;
  this.entete(this.pages.length===1);
};
Mise.prototype.place=function(h){ if(this.y+h>BAS){ this.nouvellePage(); return true; } return false; };
Mise.prototype.lien=function(x,y,w,h,url){ this.page.liens.push({x:x,y:y,w:w,h:h,url:url}); };

Mise.prototype.entete=function(premiere){
  var ctx=this.ctx, h=premiere?118:64;
  ctx.fillStyle=C.nuit; ctx.fillRect(0,0,W,h);
  ctx.fillStyle=degrade(ctx,0,W,[C.rose,C.lilas,C.bleu]); ctx.fillRect(0,h,W,5);
  var t=premiere?40:14;
  if(this.logo) ctx.drawImage(this.logo,MX,t,premiere?38:34,premiere?37:33);
  police(ctx,700,premiere?21:18,SORA); ctx.fillStyle='#fff'; ctx.fillText('Mind W3B',MX+(premiere?50:44),t+(premiere?26:23));
  ctx.textAlign='right'; police(ctx,500,12.5,MAN); ctx.fillStyle=C.nuitDoux;
  ctx.fillText('Calculateur d’empreinte de l’IA',W-MX,t+(premiere?16:21));
  if(premiere){ ctx.fillText(this.date||'',W-MX,t+34); }
  ctx.textAlign='left';
  this.y=h+5+(premiere?40:34);
};

Mise.prototype.titre=function(sy){
  var ctx=this.ctx;
  police(ctx,700,12,SORA); espacement(ctx,'1.5px'); ctx.fillStyle=C.magenta;
  ctx.fillText('SYNTHÈSE DU CALCUL',MX,this.y); espacement(ctx,'0px');
  this.y+=36;
  police(ctx,700,30,SORA); ctx.fillStyle=C.nuit;
  ctx.fillText('L’empreinte de l’IA de votre entreprise',MX,this.y);
  this.y+=26;
  police(ctx,500,14.5,MAN); ctx.fillStyle=C.mut;
  ctx.fillText((sy.mode==='expert'?'Mode expert':'Version simple')+' · résultats '+sy.periode,MX,this.y);
  this.y+=26;
};

Mise.prototype.heros=function(p){
  var ctx=this.ctx, w=W-2*MX;
  police(ctx,500,14.5,MAN); var det=lignes(ctx,p.detail,w-56);
  var h=134+det.length*21;
  this.place(h); ctx=this.ctx;
  var y=this.y;
  ctx.save(); rond(ctx,MX,y,w,h,18); ctx.clip();
  ctx.fillStyle=C.nuit; ctx.fillRect(MX,y,w,h);
  ctx.fillStyle=degrade(ctx,MX,w,[C.rose,C.lilas,C.bleu]); ctx.fillRect(MX,y,w,5);
  ctx.restore();
  police(ctx,500,15,MAN); ctx.fillStyle=C.nuitDoux; ctx.fillText(p.label,MX+28,y+38);
  police(ctx,700,52,SORA); ctx.fillStyle='#fff'; espacement(ctx,'-1.5px'); ctx.fillText(p.valeur,MX+26,y+98); espacement(ctx,'0px');
  police(ctx,500,14.5,MAN); ctx.fillStyle=C.nuitDoux;
  det.forEach(function(l,i){ ctx.fillText(l,MX+28,y+124+i*21); });
  this.y+=h+26;
};

Mise.prototype.section=function(t,suite){
  this.place(40+(suite||0));
  var ctx=this.ctx;
  police(ctx,700,17,SORA); ctx.fillStyle=C.nuit; ctx.fillText(t,MX,this.y);
  ctx.fillStyle=degrade(ctx,MX,48,[C.rose,C.violet]); ctx.fillRect(MX,this.y+10,48,3);
  this.y+=30;
};

// Indicateurs en tuiles, deux par ligne.
Mise.prototype.tuiles=function(liste){
  var ctx=this.ctx, gap=12, nb=3, w=(W-2*MX-gap*(nb-1))/nb, self=this;
  for(var i=0;i<liste.length;i+=nb){
    var paire=liste.slice(i,i+nb).map(function(t){ police(ctx,600,15.5,SORA); return {lab:t[0],val:lignes(ctx,t[1],w-32)}; });
    var h=Math.max.apply(null,paire.map(function(t){ return 46+t.val.length*21; }))+6;
    self.place(h); ctx=self.ctx;
    paire.forEach(function(t,j){
      var x=MX+j*(w+gap), y=self.y;
      ctx.fillStyle=C.doux; rond(ctx,x,y,w,h,14); ctx.fill();
      police(ctx,600,12,MAN); ctx.fillStyle=C.mut; ctx.fillText(t.lab,x+16,y+26);
      police(ctx,600,15.5,SORA); ctx.fillStyle=C.nuit;
      t.val.forEach(function(l,k){ ctx.fillText(l,x+16,y+50+k*21); });
    });
    self.y+=h+gap;
  }
  this.y+=10;
};

Mise.prototype.encart=function(texte){
  var ctx=this.ctx, w=W-2*MX;
  police(ctx,500,15,MAN); var l=lignes(ctx,texte,w-72);
  var h=32+l.length*23;
  this.place(h); ctx=this.ctx;
  var y=this.y;
  ctx.fillStyle=C.doux; rond(ctx,MX,y,w,h,14); ctx.fill();
  ctx.fillStyle=C.violet; rond(ctx,MX,y,5,h,2.5); ctx.fill();
  ctx.fillStyle=C.violet; ctx.beginPath(); ctx.arc(MX+30,y+h/2,8,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(MX+26,y+h/2); ctx.lineTo(MX+29,y+h/2+3); ctx.lineTo(MX+34,y+h/2-3); ctx.stroke();
  police(ctx,500,15,MAN); ctx.fillStyle=C.nuit;
  l.forEach(function(s,i){ ctx.fillText(s,MX+52,y+26+i*23); });
  this.y+=h+28;
};

// Tableau libellé / valeur.
Mise.prototype.tableau=function(liste){
  var ctx=this.ctx, w=W-2*MX, wl=Math.round(w*0.36), self=this;
  liste.forEach(function(r,i){
    police(ctx,500,14,MAN); var la=lignes(ctx,r[0],wl-16);
    police(ctx,600,14,MAN); var va=lignes(ctx,r[1],w-wl);
    var h=Math.max(la.length,va.length)*20+14;
    self.place(h); ctx=self.ctx;
    var y=self.y;
    police(ctx,500,14,MAN); ctx.fillStyle=C.mut; la.forEach(function(s,k){ ctx.fillText(s,MX,y+21+k*20); });
    police(ctx,600,14,MAN); ctx.fillStyle=C.nuit; va.forEach(function(s,k){ ctx.fillText(s,MX+wl,y+21+k*20); });
    ctx.fillStyle=C.ligne; ctx.fillRect(MX,y+h,w,1);
    self.y+=h;
  });
  this.y+=20;
};

Mise.prototype.appel=function(){
  var ctx=this.ctx, w=W-2*MX, h=124;
  this.place(h); ctx=this.ctx;
  var y=this.y;
  ctx.save(); rond(ctx,MX,y,w,h,18); ctx.clip();
  ctx.fillStyle=degrade(ctx,MX,w,[C.magenta,C.violet]); ctx.fillRect(MX,y,w,h);
  ctx.restore();
  police(ctx,700,20,SORA); ctx.fillStyle='#fff'; ctx.fillText('Et maintenant ?',MX+28,y+36);
  police(ctx,500,14.5,MAN); ctx.fillStyle='#f6f2ff';
  lignes(ctx,'Mind W3B audite les usages d’IA des entreprises pour réduire leur empreinte et leur facture. Parlons de vos usages réels.',w-56)
    .forEach(function(s,i){ ctx.fillText(s,MX+28,y+60+i*20); });
  police(ctx,700,14.5,MAN); ctx.fillStyle='#fff';
  var t1=CONTACT, t2='calculateur.mindw3b.co', x2=MX+28+ctx.measureText(t1).width+28;
  ctx.fillText(t1,MX+28,y+104); ctx.fillText(t2,x2,y+104);
  ctx.globalAlpha=.6; ctx.fillText('·',x2-17,y+104); ctx.globalAlpha=1;
  this.lien(MX+28,y+88,ctx.measureText(t1).width+4,22,'mailto:'+CONTACT);
  this.lien(x2,y+88,ctx.measureText(t2).width,22,SITE);
  this.y+=h+20;
};

Mise.prototype.pieds=function(note){
  var n=this.pages.length;
  this.pages.forEach(function(p,i){
    var ctx=p.ctx, y=H-HAUT_PIED;
    ctx.fillStyle=C.ligne; ctx.fillRect(MX,y,W-2*MX,1);
    police(ctx,500,10.5,MAN); ctx.fillStyle=C.mut;
    lignes(ctx,note,W-2*MX-90).slice(0,3).forEach(function(s,k){ ctx.fillText(s,MX,y+20+k*15); });
    ctx.textAlign='right'; police(ctx,600,10.5,MAN);
    ctx.fillText((i+1)+' / '+n,W-MX,y+20); ctx.textAlign='left';
  });
};

/* ---------- PDF ---------- */
function versOctets(cv){
  return new Promise(function(ok,ko){
    cv.toBlob(function(b){ if(!b) return ko(new Error('rendu impossible')); b.arrayBuffer().then(function(a){ ok(new Uint8Array(a)); },ko); },'image/jpeg',0.92);
  });
}
function hex16(s){ // chaîne PDF en UTF-16BE, pour les accents du titre
  var h='FEFF'; for(var i=0;i<s.length;i++){ h+=('000'+s.charCodeAt(i).toString(16)).slice(-4).toUpperCase(); } return '<'+h+'>';
}
function assembler(pages,titre){
  var enc=new TextEncoder(), parts=[], taille=0, offs=[];
  function add(x){ var b=typeof x==='string'?enc.encode(x):x; parts.push(b); taille+=b.length; }
  var PW=595.28, PH=841.89, k=PW/W;
  // Numérotation : 1 catalogue, 2 pages, 3 infos, puis par page : page, contenu, image, liens.
  var n=4, plan=pages.map(function(p){ var o={page:n++,contenu:n++,image:n++,liens:p.liens.map(function(){ return n++; })}; return o; });
  function obj(num,corps){ offs[num]=taille; add(num+' 0 obj\n'+corps+'\nendobj\n'); }
  add('%PDF-1.4\n%âãÏÓ\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,'<< /Type /Pages /Count '+pages.length+' /Kids ['+plan.map(function(o){ return o.page+' 0 R'; }).join(' ')+'] >>');
  obj(3,'<< /Title '+hex16(titre)+' /Author (Mind W3B) /Creator (calculateur.mindw3b.co) >>');
  pages.forEach(function(p,i){
    var o=plan[i];
    obj(o.page,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /XObject << /Im0 '+o.image+' 0 R >> >> /Contents '+o.contenu+' 0 R'+
      (o.liens.length?' /Annots ['+o.liens.map(function(l){ return l+' 0 R'; }).join(' ')+']':'')+' >>');
    var flux='q '+PW+' 0 0 '+PH+' 0 0 cm /Im0 Do Q';
    obj(o.contenu,'<< /Length '+flux.length+' >>\nstream\n'+flux+'\nendstream');
    offs[o.image]=taille;
    add(o.image+' 0 obj\n<< /Type /XObject /Subtype /Image /Width '+p.l+' /Height '+p.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+p.jpeg.length+' >>\nstream\n');
    add(p.jpeg); add('\nendstream\nendobj\n');
    p.liens.forEach(function(l,j){
      var r=[l.x*k,PH-(l.y+l.h)*k,(l.x+l.w)*k,PH-l.y*k].map(function(v){ return v.toFixed(2); }).join(' ');
      obj(o.liens[j],'<< /Type /Annot /Subtype /Link /Rect ['+r+'] /Border [0 0 0] /A << /S /URI /URI ('+l.url.replace(/[\\()]/g,'\\$&')+') >> >>');
    });
  });
  var xref=taille, total=n;
  var x='xref\n0 '+total+'\n0000000000 65535 f \n';
  for(var i=1;i<total;i++) x+=('000000000'+offs[i]).slice(-10)+' 00000 n \n';
  add(x+'trailer\n<< /Size '+total+' /Root 1 0 R /Info 3 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
  return new Blob(parts,{type:'application/pdf'});
}

function image(src){
  return new Promise(function(ok){ var i=new Image(); i.onload=function(){ ok(i); }; i.onerror=function(){ ok(null); }; i.src=src; });
}
function polices(){
  if(!document.fonts||!document.fonts.load) return Promise.resolve();
  var l=['700 30px Sora','600 16px Sora','500 14px Manrope','600 14px Manrope','700 14px Manrope'].map(function(f){ return document.fonts.load(f).catch(function(){}); });
  return Promise.race([Promise.all(l),new Promise(function(r){ setTimeout(r,2500); })]);
}

// sy : résultat de MW3B.synthese(). Renvoie une promesse de Blob PDF.
function rapport(sy){
  return Promise.all([image('/assets/img/logo-mindw3b.png'),polices()]).then(function(r){
    var d=new Mise(r[0],new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}));
    d.titre(sy);
    d.heros(sy.principal);
    d.section('En chiffres',90); d.tuiles(sy.indicateurs);
    if(sy.gain) d.encart(sy.gain);
    d.section(sy.reponsesTitre,40); d.tableau(sy.reponses);
    d.appel();
    d.pieds(sy.note+' Méthode détaillée sur calculateur.mindw3b.co/expert.');
    return Promise.all(d.pages.map(function(p){ return versOctets(p.cv).then(function(j){ return {jpeg:j,l:p.cv.width,h:p.cv.height,liens:p.liens}; }); }));
  }).then(function(pages){ return assembler(pages,'Synthèse : empreinte de l’IA de votre entreprise'); });
}

M.rapportPDF=rapport;
})();
