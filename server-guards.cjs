'use strict';
// Protections HTTP sans dépendance au jeu : testées seules par test/server-guards.test.cjs.
const net = require('node:net');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const gzip = promisify(require('node:zlib').gzip);

const MAX_BODY_BYTES = 512000;
const BODY_TIMEOUT_MS = 30000;

function httpError(message, status) {
  const error = Error(message);
  error.status = status;
  return error;
}

// À appeler AVANT toute transaction : un corps qui n'arrive jamais ne doit pas
// garder la file des comptes et le verrou de la base.
function readJsonBody(req, { maxBytes = MAX_BODY_BYTES, timeoutMs = BODY_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const finish = (settle, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      settle(value);
    };
    const timer = setTimeout(() => {
      finish(reject, httpError('Requête trop lente.', 408));
      req.destroy();
    }, timeoutMs);
    timer.unref();
    req.on('data', chunk => {
      if (settled) return;
      size += chunk.length;
      if (size > maxBytes) {
        finish(reject, httpError('Requête trop volumineuse', 413));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw Error();
        finish(resolve, parsed);
      } catch {
        finish(reject, httpError('JSON invalide', 400));
      }
    });
    req.on('error', () => finish(reject, httpError('Requête interrompue', 400)));
    req.on('close', () => finish(reject, httpError('Requête interrompue', 400)));
  });
}

// Derrière un proxy, l'adresse du socket est celle du proxy. L'en-tête n'est lu
// que si l'hébergement le garantit : sinon n'importe quel client pourrait le forger.
function trustedIpHeader(env = process.env) {
  if (env.TRUSTED_IP_HEADER) return env.TRUSTED_IP_HEADER.trim().toLowerCase();
  return env.RENDER ? 'cf-connecting-ip' : '';
}

function clientAddress(req, env = process.env) {
  const header = trustedIpHeader(env);
  const value = header ? req.headers[header] : undefined;
  if (typeof value === 'string' && net.isIP(value.trim())) return value.trim();
  return req.socket.remoteAddress || 'inconnue';
}

// Mémoire bornée : les entrées expirées sont purgées, puis les plus anciennes.
function createRateLimiter({ maxEntries = 50000, now = Date.now } = {}) {
  const entries = new Map();
  function purge() {
    const time = now();
    for (const [key, entry] of entries) if (time > entry.until) entries.delete(key);
    while (entries.size >= maxEntries) entries.delete(entries.keys().next().value);
  }
  return {
    allow(key, max, period) {
      const time = now();
      let entry = entries.get(key);
      if (!entry || time > entry.until) {
        if (!entry && entries.size >= maxEntries) purge();
        entry = { n: 0, until: time + period };
        entries.set(key, entry);
      }
      return ++entry.n <= max;
    },
    purge,
    get size() { return entries.size; },
  };
}

// 'unsafe-inline' reste nécessaire : le jeu est livré en scripts et styles intégrés.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "connect-src 'self' data: blob:",
  "worker-src 'self' blob:", // Le moteur de rendu crée un worker à partir d'un blob.
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

function applySecurityHeaders(req, res) {
  res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  if (req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000');
  }
}

// Formats du client : progress.col[id].n > 0 et progress.troops[id] > 0.
function findUnownedCards(loadout, progress, starters) {
  const has = (table, id) => !!table && typeof table === 'object' && Object.hasOwn(table, id);
  const defenses = loadout.defenses.filter(id =>
    !starters.defenses.includes(id) && !(has(progress?.col, id) && progress.col[id]?.n > 0));
  const troops = loadout.troops.filter(id =>
    !starters.troops.includes(id) && !(has(progress?.troops, id) && progress.troops[id] > 0));
  return [...defenses, ...troops];
}

// En PvP, un joueur ne reçoit que l'énergie de son équipe. Le client conserve
// sa dernière valeur connue pour un champ absent : rien d'autre n'en dépend.
function personalState(state, seat) {
  if (!state?.pvp) return state;
  const team = state.boards?.[seat]?.team;
  return {
    ...state,
    boards: state.boards.map(board => {
      if (board.team === team) return board;
      const { wallets, energy, ...visible } = board;
      return visible;
    }),
  };
}

const IDLE_LOBBY_MS = 1800000;
const ENDED_ROOM_MS = 600000;
const DISCONNECTED_MS = 600000;

// room.last ne change que sur une action d'un joueur : un onglet ouvert ne suffit pas à garder une place.
function shouldCloseRoom(room, now) {
  const present = room.players.filter(Boolean);
  if (!present.length) return true;
  if (!present.some(p => p.stream) && now - Math.max(...present.map(p => p.last)) > DISCONNECTED_MS) return true;
  if (!room.started && now - room.last > IDLE_LOBBY_MS) return true;
  return !!room.ended && now - room.last > ENDED_ROOM_MS;
}

const ASSET_TYPES = {
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
};

// Fichiers versionnés de dist/assets : gardés en mémoire, compressés une seule fois, sans bloquer le jeu.
function createAssetStore(dir) {
  const cache = new Map();
  return (name) => {
    if (!/^[\w.-]+$/.test(name) || !ASSET_TYPES[path.extname(name)]) return null;
    if (!cache.has(name)) {
      cache.set(name, fs.promises.readFile(path.join(dir, name)).then(async (body) => ({
        body,
        type: ASSET_TYPES[path.extname(name)],
        gzip: path.extname(name) === '.woff2' ? null : await gzip(body),
      })).catch(() => { cache.delete(name); return null; }));
    }
    return cache.get(name);
  };
}

async function sendAsset(req, res, store, name) {
  const asset = await store(name);
  if (!asset) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end('{"error":"Ressource du jeu introuvable"}');
    return;
  }
  const useGzip = asset.gzip && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  res.writeHead(200, {
    'Content-Type': asset.type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    Vary: 'Accept-Encoding',
    ...(useGzip ? { 'Content-Encoding': 'gzip' } : {}),
  });
  res.end(useGzip ? asset.gzip : asset.body);
}

module.exports = {
  applySecurityHeaders,
  createAssetStore,
  sendAsset,
  personalState,
  shouldCloseRoom,
  clientAddress,
  CONTENT_SECURITY_POLICY,
  createRateLimiter,
  findUnownedCards,
  readJsonBody,
};
