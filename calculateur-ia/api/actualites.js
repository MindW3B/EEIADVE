/*
 * POST /api/actualites : enregistre une inscription aux actualités de Mind W3B, avec la synthèse du calcul.
 * Corps : { mode, donnees, email, delai, site_web }
 */
'use strict';
const L = require('./_lib/commun.js');
const base = require('./_lib/stockage.js');

module.exports = async function (req, res) {
  const corps = await L.controler(req, res, 1500);
  if (!corps) return;

  const email = L.emailValide(corps.email);
  if (!email) return L.repondre(res, 400, { ok: false, erreur: 'Cette adresse email ne semble pas valide.' });
  if (!L.limiter('n-ip:' + L.ip(req), 5, 10 * 60e3)) {
    return L.repondre(res, 429, { ok: false, erreur: 'Trop d\'envois en peu de temps. Réessayez un peu plus tard.' });
  }
  const sy = L.calculer(corps);

  try {
    await base.ajouter({ type: 'actualites', email, consentement: true, mode: sy ? sy.mode : '', resultat: sy ? sy.principal.valeur : '', synthese: sy ? sy.texte : '' });
  } catch (e) {
    console.error('Inscription actualités :', e.message);
    return L.repondre(res, 502, { ok: false, erreur: 'L\'inscription n\'a pas abouti. Réessayez dans un instant.' });
  }
  L.repondre(res, 200, { ok: true });
};
