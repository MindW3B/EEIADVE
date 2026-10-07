/*
 * POST /api/synthese : envoie la synthèse du calcul au visiteur, et une notification à Mind W3B.
 * Corps : { mode, donnees, email, actualites, delai, site_web }
 */
'use strict';
const L = require('./_lib/commun.js');
const { emailVisiteur, emailNotification } = require('./_lib/emails.js');

module.exports = async function (req, res) {
  const corps = await L.controler(req, res, 1500);
  if (!corps) return;

  const email = L.emailValide(corps.email);
  if (!email) return L.repondre(res, 400, { ok: false, erreur: 'Cette adresse email ne semble pas valide.' });
  if (!L.limiter('s-ip:' + L.ip(req), 5, 10 * 60e3) || !L.limiter('s-email:' + email, 3, 60 * 60e3)) {
    return L.repondre(res, 429, { ok: false, erreur: 'Trop d\'envois en peu de temps. Réessayez un peu plus tard.' });
  }
  const sy = L.calculer(corps);
  if (!sy) return L.repondre(res, 400, { ok: false, erreur: 'Le calcul est vide : complétez vos réponses avant d\'envoyer la synthèse.' });

  const actualites = corps.actualites === true;
  const date = L.dateParis();
  try {
    await L.envoyer(Object.assign({ to: [email], reply_to: L.CONFIG.pour }, emailVisiteur(sy, { actualites })));
  } catch (e) {
    console.error('Synthèse visiteur :', e.message);
    return L.repondre(res, 502, { ok: false, erreur: 'L\'envoi n\'a pas abouti. Réessayez dans un instant.' });
  }
  try {
    await L.envoyer(Object.assign({ to: [L.CONFIG.pour], reply_to: email, attachments: [L.pieceJointe(sy)] }, emailNotification(sy, { email, actualites, date })));
  } catch (e) {
    // Le visiteur a bien reçu sa synthèse : on ne lui renvoie pas d'erreur.
    console.error('Notification synthèse :', e.message);
  }
  L.repondre(res, 200, { ok: true });
};
