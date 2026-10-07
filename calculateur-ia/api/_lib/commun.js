/*
 * Outils communs aux fonctions de formulaire (Vercel).
 * Les fichiers de api/_lib ne sont pas exposés comme routes.
 */
'use strict';
require('../../assets/js/moteur.js');
require('../../assets/js/synthese.js');

const MW3B = globalThis.MW3B;

/* ---------- Requête ---------- */
function repondre(res, code, corps) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(corps));
}

async function lireCorps(req) {
  // Vercel analyse déjà le JSON dans req.body ; sinon on lit le flux (tests en local).
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  let brut = '';
  for await (const morceau of req) {
    brut += morceau;
    if (brut.length > 30000) throw new Error('trop long');
  }
  return JSON.parse(brut || '{}');
}

function ip(req) {
  return String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '').split(',')[0].trim();
}

// Seules les pages du calculateur peuvent appeler ces fonctions.
function origineValide(req) {
  const o = req.headers.origin;
  if (!o) return false;
  try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
}

// Contrôles communs. Renvoie le corps de la requête, ou null après avoir répondu.
async function controler(req, res, delaiMin) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); repondre(res, 405, { ok: false, erreur: 'Méthode non autorisée.' }); return null; }
  if (!origineValide(req)) { repondre(res, 403, { ok: false, erreur: 'Requête refusée.' }); return null; }
  let corps;
  try { corps = await lireCorps(req); } catch (e) { corps = null; }
  if (!corps || typeof corps !== 'object') { repondre(res, 400, { ok: false, erreur: 'Requête invalide.' }); return null; }
  // Champ piège : invisible pour un humain, rempli par les robots. On fait comme si tout s'était bien passé.
  if (corps.site_web) { repondre(res, 200, { ok: true }); return null; }
  if (!(Number(corps.delai) >= delaiMin)) { repondre(res, 400, { ok: false, erreur: 'Envoi trop rapide. Patientez une seconde puis réessayez.' }); return null; }
  return corps;
}

/* ---------- Limite d'envois ---------- */
// Compteur en mémoire, propre à chaque instance : il freine les abus sans les bloquer totalement.
const compteurs = new Map();
function limiter(cle, max, fenetreMs) {
  const maintenant = Date.now();
  const liste = (compteurs.get(cle) || []).filter((t) => maintenant - t < fenetreMs);
  if (liste.length >= max) { compteurs.set(cle, liste); return false; }
  liste.push(maintenant);
  compteurs.set(cle, liste);
  if (compteurs.size > 5000) for (const [k, v] of compteurs) if (!v.some((t) => maintenant - t < 3600e3)) compteurs.delete(k);
  return true;
}

/* ---------- Champs ---------- */
function texteCourt(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
function texteLong(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, max);
}
function emailValide(v) {
  const e = texteCourt(v, 254).toLowerCase();
  return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/.test(e) ? e : '';
}

function calculer(corps) {
  const mode = corps.mode === 'expert' ? 'expert' : 'simple';
  return MW3B.synthese(mode, corps.donnees);
}

module.exports = { repondre, controler, ip, limiter, texteCourt, texteLong, emailValide, calculer };
