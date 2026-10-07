/*
 * Gabarits des emails : synthèse pour le visiteur, notification et demande d'audit pour Mind W3B.
 * HTML en tableaux et styles en ligne, pour un rendu correct dans les messageries (Gmail, Outlook, Apple Mail).
 */
'use strict';
const { CONFIG, esc } = require('./commun.js');

const C = { nuit: '#130f2c', violet: '#5b3fd6', rose: '#ff2fb5', lilas: '#9a7bff', bleu: '#4a6bff', fond: '#f6f5fc', ligne: '#e4e0f3', mut: '#5d5886', douxNuit: '#c3bde6', doux: '#f3f1ff' };
const POLICE = "'Manrope',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const TITRE = "'Sora','Manrope',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function gabarit({ apercu, contenu, pied }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Mind W3B</title>
</head>
<body style="margin:0;padding:0;background:${C.fond};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.fond};">${esc(apercu)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.fond};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${C.ligne};border-radius:18px;overflow:hidden;">
<tr><td style="background:${C.nuit};padding:22px 28px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="padding-right:12px;"><img src="${CONFIG.site}/assets/img/logo-mindw3b.png" width="38" height="37" alt="" style="display:block;border:0;"></td>
    <td style="font:700 19px/1 ${TITRE};color:#ffffff;">Mind W3B</td>
  </tr></table>
</td></tr>
<tr><td style="font-size:0;line-height:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td height="5" style="background:${C.rose};">&nbsp;</td><td height="5" style="background:${C.lilas};">&nbsp;</td><td height="5" style="background:${C.bleu};">&nbsp;</td>
  </tr></table>
</td></tr>
<tr><td style="padding:30px 28px 8px;font:15px/1.6 ${POLICE};color:${C.nuit};">
${contenu}
</td></tr>
<tr><td style="padding:20px 28px 26px;border-top:1px solid ${C.ligne};font:12.5px/1.6 ${POLICE};color:${C.mut};">
${pied}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function titre(surtitre, t) {
  return `<p style="margin:0 0 6px;font:700 12px/1.4 ${TITRE};letter-spacing:.08em;text-transform:uppercase;color:#d1148c;">${esc(surtitre)}</p>
<h1 style="margin:0 0 20px;font:700 26px/1.2 ${TITRE};color:${C.nuit};letter-spacing:-.02em;">${esc(t)}</h1>`;
}

function lignes(liste) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
${liste.map(([l, v]) => `<tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid ${C.ligne};font:14px/1.45 ${POLICE};color:${C.mut};vertical-align:top;width:42%;">${esc(l)}</td><td style="padding:9px 0;border-bottom:1px solid ${C.ligne};font:600 14px/1.45 ${POLICE};color:${C.nuit};vertical-align:top;">${v}</td></tr>`).join('\n')}
</table>`;
}
const echap = (liste) => liste.map(([l, v]) => [l, esc(v)]);

function sousTitre(t) {
  return `<h2 style="margin:6px 0 8px;font:600 16px/1.35 ${TITRE};color:${C.nuit};">${esc(t)}</h2>`;
}

// Bloc commun : résultat principal, indicateurs, gain et réponses.
function blocSynthese(sy) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${C.nuit};border-radius:14px;">
<tr><td style="padding:22px 22px 20px;">
  <p style="margin:0;font:15px/1.4 ${POLICE};color:${C.douxNuit};">${esc(sy.principal.label)}</p>
  <p style="margin:6px 0 8px;font:700 40px/1.1 ${TITRE};color:#ffffff;letter-spacing:-.02em;">${esc(sy.principal.valeur)}</p>
  <p style="margin:0;font:14px/1.45 ${POLICE};color:${C.douxNuit};">${esc(sy.principal.detail)}</p>
</td></tr>
</table>
${lignes(echap(sy.indicateurs))}
${sy.gain ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr><td style="background:${C.doux};border-left:4px solid ${C.violet};border-radius:10px;padding:14px 16px;font:14.5px/1.55 ${POLICE};color:${C.nuit};">${esc(sy.gain)}</td></tr></table>` : ''}
${sousTitre(sy.reponsesTitre)}
${lignes(echap(sy.reponses))}
<p style="margin:0 0 20px;font:12.5px/1.55 ${POLICE};color:${C.mut};">${esc(sy.note)}</p>`;
}

function bouton(lien, t) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 14px;"><tr><td style="border-radius:12px;background:${C.violet};background-image:linear-gradient(90deg,#d1148c,${C.violet});">
<a href="${esc(lien)}" style="display:inline-block;padding:14px 24px;font:700 15px/1 ${TITRE};color:#ffffff;text-decoration:none;border-radius:12px;">${esc(t)}</a>
</td></tr></table>`;
}

const lienPolitique = () => `<a href="${CONFIG.site}/confidentialite" style="color:${C.violet};">politique de confidentialité</a>`;
const lienMail = (e) => `<a href="mailto:${esc(e)}" style="color:${C.violet};">${esc(e)}</a>`;

/* ---------- Synthèse envoyée au visiteur ---------- */
function emailVisiteur(sy, { actualites }) {
  const contenu = `${titre('Votre synthèse', 'L\'empreinte de l\'IA de votre entreprise')}
${blocSynthese(sy)}
${sousTitre('Et maintenant ?')}
<p style="margin:0 0 14px;">Mind W3B audite les usages d'IA des entreprises pour réduire leur empreinte et leur facture. Nous pouvons regarder vos usages réels avec vous.</p>
${bouton(CONFIG.site + '/#audit', 'Faire auditer nos usages')}
<p style="margin:0 0 18px;color:${C.mut};">Vous pouvez aussi répondre directement à cet email.</p>`;
  const pied = `<p style="margin:0 0 8px;">Vous recevez cet email parce que vous avez demandé votre synthèse sur le <a href="${CONFIG.site}/" style="color:${C.violet};">calculateur d'empreinte de l'IA</a> de Mind W3B.
${actualites ? 'Vous avez aussi accepté de recevoir nos actualités : pour vous désinscrire à tout moment, répondez simplement « désinscription ».' : 'Nous ne vous enverrons rien d\'autre sans votre accord.'}</p>
<p style="margin:0;">Mind W3B · <a href="https://www.mindw3b.co/" style="color:${C.violet};">mindw3b.co</a> · ${lienPolitique()}</p>`;
  return {
    subject: 'Votre synthèse : l\'empreinte de l\'IA de votre entreprise',
    html: gabarit({ apercu: sy.principal.label + ' : ' + sy.principal.valeur.replace(/ /g, ' '), contenu, pied }),
    text: sy.texte + '\n---\nFaire auditer vos usages : ' + CONFIG.site + '/#audit\nOu répondez simplement à cet email.\n\n'
      + (actualites ? 'Vous avez accepté de recevoir les actualités de Mind W3B. Pour vous désinscrire, répondez « désinscription ».\n' : '')
      + 'Politique de confidentialité : ' + CONFIG.site + '/confidentialite\n',
  };
}

/* ---------- Notification à Mind W3B ---------- */
function etiquette(oui, t) {
  return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font:700 13px/1.4 ${POLICE};${oui ? 'background:#d8f5ea;color:#0b6b4c;' : 'background:#eeedf3;color:#5d5886;'}">${esc(t)}</span>`;
}
const libMode = (sy) => (sy.mode === 'expert' ? 'Mode expert' : 'Version simple');

function emailNotification(sy, { email, actualites, date }) {
  const contenu = `${titre('Calculateur · synthèse envoyée', 'Un visiteur a reçu sa synthèse')}
${lignes([
    ['Email', lienMail(email)],
    ['Actualités Mind W3B', actualites ? etiquette(true, 'Oui, inscription acceptée') + `<br><span style="font-weight:400;color:${C.mut};font-size:13px;">Case cochée le ${esc(date)}</span>` : etiquette(false, 'Non')],
    ['Mode', esc(libMode(sy))],
    ['Date', esc(date)],
  ])}
<p style="margin:0 0 22px;color:${C.mut};">Répondez à cet email pour écrire directement au visiteur. La synthèse est aussi jointe en texte.</p>
${blocSynthese(sy)}`;
  return {
    subject: (actualites ? '[Actualités : oui] ' : '') + 'Synthèse envoyée à ' + email,
    html: gabarit({ apercu: email + (actualites ? ' · accepte les actualités' : ''), contenu, pied: `<p style="margin:0;">Notification automatique du calculateur d'empreinte de l'IA.</p>` }),
    text: 'Un visiteur a reçu sa synthèse.\n\nEmail : ' + email + '\nActualités Mind W3B : ' + (actualites ? 'OUI (case cochée le ' + date + ')' : 'non')
      + '\nMode : ' + libMode(sy) + '\nDate : ' + date + '\n\n---\n' + sy.texte,
  };
}

/* ---------- Demande d'audit ---------- */
function emailAudit(sy, d) {
  const message = d.message ? esc(d.message).replace(/\n/g, '<br>') : `<span style="font-weight:400;color:${C.mut};">Pas de message</span>`;
  const contenu = `${titre('Calculateur · demande d\'audit', d.entreprise)}
${lignes([
    ['Nom', esc(d.nom)],
    ['Entreprise', esc(d.entreprise)],
    ['Email', lienMail(d.email)],
    ['Téléphone', d.tel ? `<a href="tel:${esc(d.tel.replace(/[^\d+]/g, ''))}" style="color:${C.violet};">${esc(d.tel)}</a>` : `<span style="font-weight:400;color:${C.mut};">Non renseigné</span>`],
    ['Message', message],
    ['Consentement RGPD', etiquette(true, 'Accepté') + `<br><span style="font-weight:400;color:${C.mut};font-size:13px;">le ${esc(d.date)}</span>`],
    ['Mode', esc(libMode(sy))],
  ])}
<p style="margin:0 0 22px;color:${C.mut};">Répondez à cet email pour écrire directement à ${esc(d.nom)}. La synthèse du calcul est jointe en texte.</p>
${sousTitre('Synthèse du calcul')}
${blocSynthese(sy)}`;
  return {
    subject: 'Demande d\'audit : ' + d.entreprise + ' (' + d.nom + ')',
    html: gabarit({ apercu: d.nom + ', ' + d.entreprise + ' : ' + sy.principal.valeur.replace(/ /g, ' '), contenu, pied: `<p style="margin:0;">Demande envoyée depuis le calculateur d'empreinte de l'IA.</p>` }),
    text: 'Nouvelle demande d\'audit\n\nNom : ' + d.nom + '\nEntreprise : ' + d.entreprise + '\nEmail : ' + d.email + '\nTéléphone : ' + (d.tel || 'non renseigné')
      + '\nMessage :\n' + (d.message || 'Pas de message') + '\n\nConsentement RGPD : accepté le ' + d.date + '\nMode : ' + libMode(sy) + '\n\n---\n' + sy.texte,
  };
}

module.exports = { emailVisiteur, emailNotification, emailAudit };
