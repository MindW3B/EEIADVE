/*
 * /api/admin : consultation des formulaires enregistrés, réservée à Mind W3B.
 * GET : liste des entrées. DELETE ?id=… : suppression d'une entrée.
 * En-tête obligatoire : Authorization: Bearer <ADMIN_PASSWORD>
 */
'use strict';
const crypto = require('crypto');
const L = require('./_lib/commun.js');
const base = require('./_lib/stockage.js');

function autorise(req) {
  const attendu = process.env.ADMIN_PASSWORD || '';
  const recu = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!attendu || !recu) return false;
  // Comparaison à temps constant, sur des empreintes de même longueur.
  const h = (s) => crypto.createHash('sha256').update(s).digest();
  return crypto.timingSafeEqual(h(attendu), h(recu));
}

module.exports = async function (req, res) {
  res.setHeader('X-Robots-Tag', 'noindex');
  const cle = 'adm:' + L.ip(req);
  if (!autorise(req)) {
    // Chaque essai raté compte : 10 essais par quart d'heure au plus.
    if (!L.limiter(cle, 10, 15 * 60e3)) return L.repondre(res, 429, { ok: false, erreur: 'Trop d\'essais. Réessayez dans un quart d\'heure.' });
    return L.repondre(res, 401, { ok: false, erreur: process.env.ADMIN_PASSWORD ? 'Mot de passe incorrect.' : 'La variable ADMIN_PASSWORD n\'est pas définie sur Vercel.' });
  }
  if (!base.configure()) return L.repondre(res, 500, { ok: false, erreur: 'La base de données n\'est pas reliée au projet (variables KV_REST_API_URL et KV_REST_API_TOKEN absentes).' });
  try {
    if (req.method === 'GET') return L.repondre(res, 200, { ok: true, entrees: await base.lister(1000) });
    if (req.method === 'DELETE') {
      const id = new URL(req.url, 'http://x').searchParams.get('id') || '';
      if (!/^[a-z0-9]+-[a-f0-9]{8}$/.test(id)) return L.repondre(res, 400, { ok: false, erreur: 'Identifiant invalide.' });
      await base.supprimer(id);
      return L.repondre(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, DELETE');
    L.repondre(res, 405, { ok: false, erreur: 'Méthode non autorisée.' });
  } catch (e) {
    console.error('Admin :', e.message);
    L.repondre(res, 502, { ok: false, erreur: 'La base de données ne répond pas.' });
  }
};
