/*
 * POST /api/synthese : enregistre l'email laissé pour télécharger la synthèse (et l'accord pour les actualités),
 * avec la synthèse du calcul.
 * Corps : { mode, donnees, email, actualites, delai, site_web }
 */
'use strict';
const L = require('./_lib/commun.js');
const base = require('./_lib/stockage.js');

module.exports = async function (req, res) {
  const corps = await L.controler(req, res, 1500);
  if (!corps) return;

  const email = L.emailValide(corps.email);
  if (!email) return L.repondre(res, 400, { ok: false, erreur: 'Cette adresse email ne semble pas valide.' });
  if (!L.limiter('s-ip:' + L.ip(req), 8, 10 * 60e3)) {
    return L.repondre(res, 429, { ok: false, erreur: 'Trop de demandes en peu de temps. Réessayez un peu plus tard.' });
  }
  const sy = L.calculer(corps);
  if (!sy) return L.repondre(res, 400, { ok: false, erreur: 'Le calcul est vide : complétez vos réponses avant de télécharger la synthèse.' });

  try {
    await base.ajouter({ type: 'synthese', email, actualites: corps.actualites === true, mode: sy.mode, resultat: sy.principal.valeur, synthese: sy.texte });
  } catch (e) {
    console.error('Synthèse :', e.message);
    return L.repondre(res, 502, { ok: false, erreur: 'L\'enregistrement n\'a pas abouti.' });
  }
  L.repondre(res, 200, { ok: true });
};
