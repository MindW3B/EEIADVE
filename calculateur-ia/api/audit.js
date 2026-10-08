/*
 * POST /api/audit : enregistre une demande d'audit, avec la synthèse du calcul, dans la base du projet.
 * Corps : { mode, donnees, nom, entreprise, email, tel, message, consentement, delai, site_web }
 */
'use strict';
const L = require('./_lib/commun.js');
const base = require('./_lib/stockage.js');

module.exports = async function (req, res) {
  const corps = await L.controler(req, res, 3000);
  if (!corps) return;

  const d = {
    nom: L.texteCourt(corps.nom, 100),
    entreprise: L.texteCourt(corps.entreprise, 120),
    email: L.emailValide(corps.email),
    tel: L.texteCourt(corps.tel, 30),
    message: L.texteLong(corps.message, 2000),
  };
  if (!d.nom || !d.entreprise) return L.repondre(res, 400, { ok: false, erreur: 'Indiquez votre nom et votre entreprise.' });
  if (!d.email) return L.repondre(res, 400, { ok: false, erreur: 'Cette adresse email ne semble pas valide.' });
  if (d.tel && !/^[\d\s+().-]{6,30}$/.test(d.tel)) return L.repondre(res, 400, { ok: false, erreur: 'Ce numéro de téléphone ne semble pas valide.' });
  if (corps.consentement !== true) return L.repondre(res, 400, { ok: false, erreur: 'Cochez la case de consentement pour envoyer votre demande.' });
  if (!await L.limiter('a-ip:' + L.ip(req), 5, 10 * 60e3)) {
    return L.repondre(res, 429, { ok: false, erreur: 'Trop d\'envois en peu de temps. Réessayez un peu plus tard.' });
  }
  const sy = L.calculer(corps);
  if (!sy) return L.repondre(res, 400, { ok: false, erreur: 'Le calcul est vide : complétez vos réponses avant d\'envoyer votre demande.' });

  try {
    await base.ajouter(Object.assign({ type: 'audit', consentement: true, mode: sy.mode, resultat: sy.principal.valeur, synthese: sy.texte }, d));
  } catch (e) {
    console.error('Demande d\'audit :', e.message);
    return L.repondre(res, 502, { ok: false, erreur: 'L\'envoi n\'a pas abouti. Réessayez dans un instant.' });
  }
  L.repondre(res, 200, { ok: true });
};
