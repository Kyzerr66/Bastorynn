'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const net = require('node:net');
const guards = require('../server-guards.cjs');

// Serveur réel : la lecture du corps doit se terminer même si le client disparaît.
function bodyServer(options, onResult) {
  return new Promise(resolve => {
    const server = http.createServer(async (req, res) => {
      let outcome;
      try { outcome = { value: await guards.readJsonBody(req, options) }; }
      catch (error) { outcome = { error }; }
      onResult(outcome);
      if (!res.destroyed) res.end('fin');
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function rawRequest(port, text) {
  return new Promise(resolve => {
    const socket = net.connect(port, '127.0.0.1', () => { socket.write(text); resolve(socket); });
    socket.on('error', () => {});
  });
}

function bodyOutcome(options, send) {
  return new Promise(async (resolve, reject) => {
    const guard = setTimeout(() => reject(Error('La lecture du corps ne se termine jamais')), 3000);
    const server = await bodyServer(options, outcome => {
      clearTimeout(guard);
      server.closeAllConnections();
      server.close();
      resolve(outcome);
    });
    await send(server.address().port);
  });
}

const head = length => `POST /api/x HTTP/1.1\r\nHost: t\r\nContent-Type: application/json\r\nContent-Length: ${length}\r\n\r\n`;

test('lit un corps JSON valide', async () => {
  const outcome = await bodyOutcome({}, async port => { await rawRequest(port, head(8) + '{"a": 1}'); });
  assert.deepEqual(outcome.value, { a: 1 });
});

test('un client qui coupe en plein envoi termine la lecture', async () => {
  const outcome = await bodyOutcome({}, async port => {
    const socket = await rawRequest(port, head(1000) + '{"a"');
    setTimeout(() => socket.destroy(), 50);
  });
  assert.equal(outcome.error.status, 400);
});

test('un client muet est coupé par le délai', async () => {
  const outcome = await bodyOutcome({ timeoutMs: 100 }, async port => { await rawRequest(port, head(1000)); });
  assert.equal(outcome.error.status, 408);
});

test('un corps trop gros est refusé', async () => {
  const outcome = await bodyOutcome({ maxBytes: 10 }, async port => { await rawRequest(port, head(50) + 'x'.repeat(50)); });
  assert.equal(outcome.error.status, 413);
});

for (const text of ['[1]', 'null', '{oups']) {
  test(`refuse le JSON ${text}`, async () => {
    const outcome = await bodyOutcome({}, async port => { await rawRequest(port, head(text.length) + text); });
    assert.equal(outcome.error.status, 400);
  });
}

const fakeReq = (headers, remoteAddress = '10.0.0.1') => ({ headers, socket: { remoteAddress } });

test('sans proxy déclaré, un en-tête IP forgé est ignoré', () => {
  assert.equal(guards.clientAddress(fakeReq({ 'cf-connecting-ip': '1.2.3.4' }), {}), '10.0.0.1');
});

test('sur Render, l\'IP vient de CF-Connecting-IP', () => {
  assert.equal(guards.clientAddress(fakeReq({ 'cf-connecting-ip': '1.2.3.4' }), { RENDER: 'true' }), '1.2.3.4');
});

test('TRUSTED_IP_HEADER choisit l\'en-tête', () => {
  assert.equal(guards.clientAddress(fakeReq({ 'x-real-ip': '2001:db8::1' }), { TRUSTED_IP_HEADER: 'X-Real-IP' }), '2001:db8::1');
});

test('un en-tête qui n\'est pas une IP retombe sur le socket', () => {
  const req = fakeReq({ 'cf-connecting-ip': 'x'.repeat(5000) });
  assert.equal(guards.clientAddress(req, { RENDER: 'true' }), '10.0.0.1');
});

test('la limite bloque au-delà du maximum puis se réinitialise', () => {
  let time = 0;
  const limiter = guards.createRateLimiter({ now: () => time });
  assert.equal(limiter.allow('k', 2, 100), true);
  assert.equal(limiter.allow('k', 2, 100), true);
  assert.equal(limiter.allow('k', 2, 100), false);
  time = 101;
  assert.equal(limiter.allow('k', 2, 100), true);
});

test('la table de limites reste bornée et purge ce qui a expiré', () => {
  let time = 0;
  const limiter = guards.createRateLimiter({ maxEntries: 100, now: () => time });
  for (let i = 0; i < 5000; i++) limiter.allow('k' + i, 1, 50);
  assert.ok(limiter.size <= 100);
  time = 51;
  limiter.purge();
  assert.equal(limiter.size, 0);
});

const starters = { defenses: ['gatling_0'], troops: ['fantassin'] };

test('les cartes de départ sont toujours autorisées, même sans sauvegarde', () => {
  assert.deepEqual(guards.findUnownedCards({ defenses: ['gatling_0'], troops: ['fantassin'] }, undefined, starters), []);
});

test('une carte possédée passe, une carte absente ou à zéro est signalée', () => {
  const progress = { col: { a: { n: 1 }, b: { n: 0 } }, troops: { t: 2, u: 0 } };
  assert.deepEqual(guards.findUnownedCards({ defenses: ['a', 'b', 'c'], troops: ['t', 'u', 'v'] }, progress, starters), ['b', 'c', 'u', 'v']);
});

test('sans sauvegarde, une carte hors départ est signalée', () => {
  assert.deepEqual(guards.findUnownedCards({ defenses: ['mythique'], troops: ['fantassin'] }, null, starters), ['mythique']);
});

test('un identifiant hérité du prototype n\'est pas une possession', () => {
  assert.deepEqual(guards.findUnownedCards({ defenses: ['constructor'], troops: [] }, { col: {} }, starters), ['constructor']);
});

test('en PvP, un joueur ne reçoit que l\'énergie de son équipe', () => {
  const state = { pvp: true, boards: [
    { team: 0, wallets: { 0: 10 }, energy: 10, hp: 100 },
    { team: 0, wallets: { 1: 20 }, energy: 20, hp: 90 },
    { team: 1, wallets: { 2: 30 }, energy: 30, hp: 80 },
  ] };
  const view = guards.personalState(state, 0);
  assert.equal(view.boards[0].energy, 10);
  assert.equal(view.boards[1].energy, 20, 'un allié reste visible');
  assert.equal(view.boards[2].energy, undefined);
  assert.equal(view.boards[2].wallets, undefined);
  assert.equal(view.boards[2].hp, 80);
  assert.equal(state.boards[2].energy, 30, 'l\'état partagé n\'est pas modifié');
});

test('en coopération, l\'état est transmis tel quel', () => {
  const state = { pvp: false, boards: [{ team: 0, wallets: { 0: 1, 1: 2 } }] };
  assert.equal(guards.personalState(state, 1), state);
});

const room = (values, players = [{ stream: {}, last: 0 }]) => ({ players, started: false, ended: false, last: 0, ...values });

test('un salon sans joueur se ferme', () => {
  assert.equal(guards.shouldCloseRoom(room({}, [null]), 0), true);
});

test('un salon d\'attente se ferme après 30 min sans action, même onglet ouvert', () => {
  assert.equal(guards.shouldCloseRoom(room({}), 1800000), false);
  assert.equal(guards.shouldCloseRoom(room({}), 1800001), true);
});

test('une partie en cours avec un joueur connecté reste ouverte', () => {
  assert.equal(guards.shouldCloseRoom(room({ started: true }), 99999999), false);
});

test('une partie sans aucun joueur connecté se ferme après 10 min', () => {
  const players = [{ stream: null, last: 0 }];
  assert.equal(guards.shouldCloseRoom(room({ started: true }, players), 600000), false);
  assert.equal(guards.shouldCloseRoom(room({ started: true }, players), 600001), true);
});

test('une partie terminée se ferme 10 min après la dernière action', () => {
  assert.equal(guards.shouldCloseRoom(room({ started: true, ended: true }), 600000), false);
  assert.equal(guards.shouldCloseRoom(room({ started: true, ended: true }), 600001), true);
});

test('HSTS seulement en HTTPS, CSP et anti-iframe partout', () => {
  const run = headers => {
    const set = {};
    guards.applySecurityHeaders({ headers, socket: {} }, { setHeader: (k, v) => { set[k] = v; } });
    return set;
  };
  const plain = run({});
  assert.equal(plain['Strict-Transport-Security'], undefined);
  assert.match(plain['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.match(plain['Content-Security-Policy'], /worker-src 'self' blob:/);
  assert.equal(plain['X-Frame-Options'], 'DENY');
  assert.ok(run({ 'x-forwarded-proto': 'https' })['Strict-Transport-Security']);
});
