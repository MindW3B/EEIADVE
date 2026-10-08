/*
 * Enregistrement des formulaires dans la base Upstash Redis reliée au projet Vercel (API REST, sans dépendance).
 * Chaque entrée est un JSON rangé dans un hash, indexé par date dans un ensemble trié.
 */
'use strict';
const crypto = require('crypto');

// Noms des variables selon l'intégration : Vercel (KV_…) ou Upstash directement (UPSTASH_…).
const URL_BASE = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
const JETON = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const ENTREES = 'mw3b:entrees', INDEX = 'mw3b:index';

const configure = () => !!(URL_BASE && JETON);

async function commande(args) {
  if (!configure()) throw new Error('Base non configurée : variables KV_REST_API_URL et KV_REST_API_TOKEN absentes');
  const r = await fetch(URL_BASE, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + JETON, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const rep = await r.json().catch(() => ({}));
  if (!r.ok || rep.error) throw new Error('Upstash ' + r.status + ' ' + (rep.error || ''));
  return rep.result;
}

async function ajouter(entree) {
  const id = Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex');
  const e = Object.assign({ id, date: new Date().toISOString() }, entree);
  await commande(['HSET', ENTREES, id, JSON.stringify(e)]);
  await commande(['ZADD', INDEX, String(Date.now()), id]);
  return e;
}

// Les plus récentes d'abord.
async function lister(max) {
  const ids = await commande(['ZRANGE', INDEX, '0', String(max - 1), 'REV']);
  if (!ids || !ids.length) return [];
  const brut = await commande(['HMGET', ENTREES].concat(ids));
  return brut.filter(Boolean).map((j) => { try { return JSON.parse(j); } catch (e) { return null; } }).filter(Boolean);
}

async function supprimer(id) {
  await commande(['HDEL', ENTREES, id]);
  await commande(['ZREM', INDEX, id]);
}

/* ---------- Compteurs de limite ---------- */
// Clé dérivée de l'identifiant (adresse IP) par HMAC : l'adresse elle-même n'est jamais écrite dans la base.
function cleCompteur(nom) {
  return 'mw3b:limite:' + crypto.createHmac('sha256', JETON).update(nom).digest('hex').slice(0, 32);
}

// Ajoute 1 au compteur, qui s'efface seul à la fin de la fenêtre. Renvoie la nouvelle valeur.
async function incrementer(nom, fenetreMs) {
  const cle = cleCompteur(nom);
  await commande(['SET', cle, '0', 'PX', String(fenetreMs), 'NX']);
  const n = await commande(['INCR', cle]);
  // Clé expirée entre les deux commandes : on remet la durée pour ne jamais garder un compteur sans fin.
  if (n === 1) await commande(['PEXPIRE', cle, String(fenetreMs)]);
  return n;
}

async function lireCompteur(nom) {
  return Number(await commande(['GET', cleCompteur(nom)])) || 0;
}

module.exports = { configure, ajouter, lister, supprimer, incrementer, lireCompteur };
