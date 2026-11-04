'use strict';
// Vérifie le catalogue dans le moteur du serveur (simulation.js), chargé comme le fait server.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadGame() {
  const context = vm.createContext({ console: { log() {}, warn() {}, error() {} }, Math, performance, Float32Array, Float64Array, Uint8Array, Int32Array, localStorage: { getItem: () => null, setItem: () => {} }, addEventListener: () => {}, R3: { THREE: {} }, Battle: { open: () => {} }, G: {}, RM: true });
  new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'simulation.js'), 'utf8')).runInContext(context, { timeout: 5000 });
  return context.OwnedGame;
}
const G = loadGame();

const NEW_FAMILIES = ['baliste', 'mitraille', 'vitriol', 'arcvolt', 'prisme', 'gauss', 'guepes', 'seisme', 'balise', 'faille', 'magnetique', 'solaire', 'commandement', 'comete'];
const RARITIES = ['commune', 'rare', 'epique', 'legendaire', 'mythique'];

test('les anciens identifiants existent toujours', () => {
  for (const id of ['gatling_0', 'gatling_4', 'plasma_4', 'sentry_0', 'siege_0']) assert.ok(G.CARD[id], id);
  for (const id of ['fantassin', 'b_titan', 'special_infantry_0', 'special_egide_commandant', 'renfort_fusilier', 'renfort_abyssal']) assert.ok(G.UNIT[id], id);
});

test('le catalogue compte 230 défenses et 227 troupes', () => {
  assert.equal(Object.keys(G.CARD).length, 230);
  assert.equal(Object.keys(G.UNIT).length, 227);
  assert.equal(G.TroopData.reinforcements.length, 55);
});

test('chaque nouvelle famille a une carte par rareté', () => {
  for (const f of NEW_FAMILIES) {
    assert.deepEqual([0, 1, 2, 3, 4].map((i) => G.CARD[`${f}_${i}`].r), RARITIES, f);
  }
});

test('chaque défense a des statistiques valides à tous les niveaux, en PvE et en PvP', () => {
  for (const id of Object.keys(G.CARD)) {
    for (const pvp of [false, true]) {
      for (const lvl of [1, 2, 3]) {
        const s = G.Engine.stats({ pvp, card: id, lvl, clvl: 1, setb: 1 });
        for (const key of ['dmg', 'rate', 'range', 'splash', 'pierce']) assert.ok(Number.isFinite(s[key]), `${id} ${key} pvp=${pvp}`);
        assert.ok(G.Engine.cost(id, pvp) > 0, id);
      }
    }
  }
});

test('chaque troupe a un coût et des statistiques valides', () => {
  for (const id of G.TroopData.all) {
    const s = G.TroopData.stats(id);
    for (const key of ['hp', 'damage', 'rate', 'range', 'speed', 'cost']) assert.ok(Number.isFinite(s[key]) && s[key] > 0, `${id} ${key}=${s[key]}`);
    assert.ok(RARITIES.includes(G.TroopData.rarity(id)), id);
  }
});

test('six nouveaux spécialistes par rareté', () => {
  const list = G.TroopData.reinforcements.filter((id) => id.startsWith('renfort_x_'));
  assert.equal(list.length, 30);
  for (const r of RARITIES) assert.equal(list.filter((id) => G.TroopData.rarity(id) === r).length, 6, r);
});

test('les nouvelles troupes coûtent autant que les troupes comparables', () => {
  const costs = G.TroopData.reinforcements.map((id) => G.TroopData.stats(id).cost);
  assert.ok(Math.min(...costs) >= 25, String(Math.min(...costs)));
  assert.ok(Math.max(...costs) <= 240, String(Math.max(...costs)));
});

test('les nouveaux modèles n’apparaissent pas dans les vagues ennemies', () => {
  const free = Object.entries(G.UNIT).filter(([id, u]) => id.startsWith('x_') && !u._collectibleOnly);
  assert.deepEqual(free, []);
});
