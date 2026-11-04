// Socle commun redessiné et modèles des quatorze nouvelles familles de défenses.
QlRaw = function towerRaw(card, level = 1) {
  const family = card.fam, rarity = q1[card.r], accent = FAM[family].c;
  const base = new Zt(), turret = new Zt(), barrel = new Zt(), spin = new Zt();
  const paint = { c: rarity.p, m: rarity.m, r: rarity.r }, paint2 = { c: rarity.p2, m: rarity.m, r: rarity.r + 0.05 }, trim = { c: rarity.t, m: rarity.tm, r: rarity.tr };
  const stone = { c: '#46453F', m: 0.05, r: 0.94 }, plate = { c: '#3A3E44', m: 0.78, r: 0.42 };

  // Dalle hexagonale chanfreinée, marches et boulons.
  base.add(x.cyl(0.47, 0.515, 0.08, 6), { ...stone, pos: [0, 0.04, 0], rot: [0, J / 6, 0] });
  base.add(x.cyl(0.435, 0.47, 0.03, 6), { c: '#5A5850', r: 0.9, pos: [0, 0.095, 0], rot: [0, J / 6, 0] });
  base.add(x.cyl(0.33, 0.37, 0.05, 16), { ...plate, pos: [0, 0.135, 0] });
  base.add(x.cyl(0.295, 0.335, 0.11, 16), { ...paint, pos: [0, 0.205, 0] }); // fût
  base.add(x.tor(0.31, 0.016, 5, 28), { ...trim, pos: [0, 0.255, 0], rot: [J / 2, 0, 0] });
  base.add(x.tor(0.335, 0.01, 4, 28), { ...plate, pos: [0, 0.158, 0], rot: [J / 2, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * J * 2;
    base.add(x.cyl(0.018, 0.018, 0.018, 6), { ...plate, pos: [Math.cos(a) * 0.4, 0.114, Math.sin(a) * 0.4] }); // boulons
    base.add(x.box(0.11, 0.016, 0.028), { c: i % 2 ? '#C8A43A' : '#26282B', m: 0.2, r: 0.7, pos: [Math.cos(a + 0.5) * 0.45, 0.083, Math.sin(a + 0.5) * 0.45], rot: [0, -a - 0.5 + J / 2, 0] }); // bande d'avertissement
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * J * 2 + 0.5;
    base.add(x.box(0.07, 0.024, 0.012), { c: accent, e: 1.3, pos: [Math.cos(a) * 0.338, 0.195, Math.sin(a) * 0.338], rot: [0, -a + J / 2, 0] }); // voyants de famille
    base.add(x.box(0.05, 0.075, 0.03), { ...plate, pos: [Math.cos(a + 1) * 0.326, 0.2, Math.sin(a + 1) * 0.326], rot: [0, -a - 1 + J / 2, 0] }); // trappe
  }
  if (level >= 2) for (let i = 0; i < 4; i++) {
    const a = (i / 4) * J * 2 + J / 4;
    base.add(x.box(0.17, 0.125, 0.03), { ...paint2, pos: [Math.cos(a) * 0.35, 0.185, Math.sin(a) * 0.35], rot: [0, -a + J / 2, 0] }); // blindage niveau 2
  }
  if (level >= 3) {
    base.add(x.tor(0.37, 0.013, 5, 32), { c: accent, e: 1.5, pos: [0, 0.13, 0], rot: [J / 2, 0, 0] });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * J * 2;
      base.add(x.box(0.04, 0.09, 0.04), { ...trim, pos: [Math.cos(a) * 0.42, 0.15, Math.sin(a) * 0.42], rot: [0, -a, 0] }); // pylônes niveau 3
    }
  }
  if (card.r === 'legendaire' || card.r === 'mythique') base.add(x.tor(0.475, 0.012, 5, 6), { ...trim, pos: [0, 0.1, 0], rot: [J / 2, 0, J / 6] });
  if (card.r === 'mythique') for (let i = 0; i < 6; i++) {
    const a = (i / 6) * J * 2;
    base.add(x.oct(0.022), { c: rarity.t, e: 2.2, pos: [Math.cos(a) * 0.47, 0.15, Math.sin(a) * 0.47] }); // cristaux
  }
  const context = { P: rarity, paint, paint2, trim, acc: accent, lvl: level, ri: RI(card.r) };
  const details = Z1[family](base, turret, barrel, spin, context) || {};
  return { base: base.build(), turret: turret.build(), barrel: barrel.build(), spin: spin.build(), turretY: 0.25, ...details };
};

const glow = (c, e = 1.6) => ({ c, e: e * 0.42, m: 0, r: 0.4 });

Object.assign(Z1, {
  baliste(base, turret, barrel, spin, k) {
    turret.add(x.cyl(0.13, 0.17, 0.06, 12), { ...steel, pos: [0, 0.03, 0] });
    turret.add(x.box(0.26, 0.08, 0.14), { ...k.paint, pos: [0.02, 0.1, 0] });
    for (const side of [-1, 1]) {
      turret.add(x.box(0.05, 0.04, 0.34), { ...k.paint2, pos: [0.13, 0.13, side * 0.17], rot: [0, side * 0.5, 0] }); // bras de l'arc
      turret.add(x.cyl(0.004, 0.004, 0.36, 3), { c: '#D9D2BB', m: 0.2, r: 0.5, pos: [-0.01, 0.13, side * 0.14], rot: [J / 2, side * 1.25, 0] }); // corde
      turret.add(x.cyl(0.03, 0.03, 0.03, 8), { ...k.trim, pos: [0.02, 0.17, side * 0.08] }); // treuil
    }
    barrel.add(x.box(0.5, 0.022, 0.03), { ...gunmetal, pos: [0.25, 0, 0] }); // glissière
    barrel.add(x.cyl(0.011, 0.011, 0.46, 6), { ...steel, c: '#C9CBD0', pos: [0.29, 0.024, 0], rot: sideX }); // carreau
    barrel.add(x.cone(0.024, 0.07, 6), { ...steel, pos: [0.54, 0.024, 0], rot: [0, 0, -J / 2] });
    return { barrelPos: [0, 0.14, 0], muzzle: [0.56, 0.17, 0], recoil: 0.05 };
  },
  mitraille(base, turret, barrel, spin, k) {
    turret.add(x.cyl(0.16, 0.2, 0.07, 12), { ...steel, pos: [0, 0.035, 0] });
    turret.add(x.box(0.24, 0.13, 0.26), { ...k.paint, pos: [-0.02, 0.13, 0] });
    turret.add(x.box(0.09, 0.14, 0.3), { ...k.paint2, pos: [0.1, 0.13, 0], rot: [0, 0, -0.18] }); // masque
    for (const side of [-1, 1]) turret.add(x.box(0.1, 0.05, 0.05), { ...canvas, pos: [-0.14, 0.12, side * 0.13] }); // caisses de plombs
    barrel.add(x.cyl(0.055, 0.1, 0.32, 12), { ...steel, pos: [0.2, 0, 0], rot: sideX }); // gueule évasée
    barrel.add(x.tor(0.1, 0.012, 5, 14), { ...k.trim, pos: [0.36, 0, 0], rot: [0, J / 2, 0] });
    barrel.add(x.tor(0.07, 0.009, 4, 12), { ...gunmetal, pos: [0.14, 0, 0], rot: [0, J / 2, 0] });
    return { barrelPos: [0.05, 0.14, 0], muzzle: [0.44, 0.14, 0], recoil: 0.05 };
  },
  vitriol(base, turret, barrel, spin, k) {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * J * 2 + 0.3;
      base.add(x.cyl(0.055, 0.055, 0.2, 10), { ...k.paint2, pos: [Math.cos(a) * 0.37, 0.2, Math.sin(a) * 0.37] }); // cuves
      base.add(x.cyl(0.04, 0.04, 0.16, 10), { c: k.acc, e: 1.1, m: 0, r: 0.2, pos: [Math.cos(a) * 0.37, 0.2, Math.sin(a) * 0.37] });
      base.add(x.sph(0.055, 10, 6, 0, J * 2, 0, J / 2), { ...steel, pos: [Math.cos(a) * 0.37, 0.3, Math.sin(a) * 0.37] });
    }
    turret.add(x.cyl(0.2, 0.22, 0.05, 14), { ...steel, pos: [0, 0.025, 0] });
    turret.add(x.box(0.26, 0.14, 0.3), { ...k.paint, pos: [-0.05, 0.12, 0] });
    for (const side of [-1, 1]) turret.add(x.box(0.26, 0.2, 0.03), { ...k.paint2, pos: [0.02, 0.18, side * 0.15] });
    barrel.add(x.cyl(0.05, 0.075, 0.46, 12), { ...steel, c: '#59625A', pos: [0.2, 0, 0], rot: sideX });
    barrel.add(x.cyl(0.078, 0.07, 0.05, 12), { c: k.acc, e: 0.9, pos: [0.42, 0, 0], rot: sideX });
    return { barrelPos: [0.03, 0.2, 0], barrelTilt: 0.72, muzzle: [0.42, 0.52, 0], recoil: 0.07 };
  },
  arcvolt(base, turret, barrel, spin, k) {
    turret.add(x.cyl(0.12, 0.17, 0.05, 12), { ...steel, pos: [0, 0.025, 0] });
    turret.add(x.cyl(0.05, 0.075, 0.27, 10), { ...k.paint, pos: [0, 0.18, 0] });
    for (let i = 0; i < 5; i++) turret.add(x.cyl(0.1 - i * 0.012, 0.1 - i * 0.012, 0.016, 12), { c: '#9C6A3A', m: 0.95, r: 0.32, pos: [0, 0.09 + i * 0.05, 0] }); // spires
    for (const side of [-1, 1]) {
      turret.add(x.cyl(0.012, 0.012, 0.16, 5), { ...steel, pos: [0.08 * side, 0.34, 0], rot: [0, 0, -side * 0.55] }); // cornes
      turret.add(x.sph(0.024), { ...glow(k.acc, 2.8), pos: [0.13 * side, 0.41, 0] });
    }
    spin.add(x.oct(0.05), glow(k.acc, 3));
    spin.add(x.tor(0.07, 0.006, 4, 16), { ...glow(k.acc, 2.2), rot: [J / 2, 0, 0] });
    return { spinPos: [0, 0.45, 0], spinAxis: 'y', muzzle: [0, 0.45, 0] };
  },
  prisme(base, turret, barrel, spin, k) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * J * 2 + J / 4;
      base.add(x.box(0.22, 0.012, 0.14), { c: '#1A3550', m: 0.9, r: 0.12, pos: [Math.cos(a) * 0.36, 0.26, Math.sin(a) * 0.36], rot: [0, -a, Math.cos(a) * 0.28] }); // panneaux
    }
    turret.add(x.cyl(0.11, 0.15, 0.06, 12), { ...steel, pos: [0, 0.03, 0] });
    for (const side of [-1, 1]) turret.add(x.box(0.05, 0.28, 0.035), { ...k.paint, pos: [0, 0.2, side * 0.12] }); // fourche
    barrel.add(x.cyl(0.075, 0.05, 0.2, 8), { ...k.paint2, pos: [0.06, 0, 0], rot: sideX });
    barrel.add(x.oct(0.075), { c: k.acc, e: 2.2, m: 0.2, r: 0.1, pos: [0.21, 0, 0], scl: [1.3, 1, 1] });
    barrel.add(x.tor(0.08, 0.009, 4, 14), { ...k.trim, pos: [0.15, 0, 0], rot: [0, J / 2, 0] });
    return { barrelPos: [0, 0.27, 0], barrelTilt: 0.12, muzzle: [0.28, 0.3, 0], recoil: 0 };
  },
  gauss(base, turret, barrel, spin, k) {
    turret.add(x.cyl(0.17, 0.2, 0.05, 14), { ...steel, pos: [0, 0.025, 0] });
    turret.add(x.box(0.3, 0.12, 0.2), { ...k.paint, pos: [-0.04, 0.11, 0] });
    turret.add(x.box(0.12, 0.08, 0.24), { ...k.paint2, pos: [-0.16, 0.12, 0] }); // condensateurs
    for (const side of [-1, 1]) turret.add(x.cyl(0.03, 0.03, 0.14, 8), { ...glow(k.acc, 1.3), pos: [-0.16, 0.17, side * 0.08], rot: sideX });
    for (const side of [-1, 1]) barrel.add(x.box(0.72, 0.02, 0.022), { ...steel, pos: [0.36, 0, side * 0.03] }); // rails
    for (let i = 0; i < 6; i++) {
      barrel.add(x.tor(0.05, 0.01, 4, 12), { c: '#A9713F', m: 0.95, r: 0.32, pos: [0.06 + i * 0.12, 0, 0], rot: [0, J / 2, 0] }); // bobines
      barrel.add(x.tor(0.042, 0.004, 3, 10), { ...glow(k.acc, 1.2), pos: [0.09 + i * 0.12, 0, 0], rot: [0, J / 2, 0] });
    }
    return { barrelPos: [0.08, 0.13, 0], muzzle: [0.84, 0.13, 0], recoil: 0.06 };
  },
  guepes(base, turret, barrel, spin, k) {
    turret.add(x.cyl(0.13, 0.17, 0.05, 12), { ...steel, pos: [0, 0.025, 0] });
    turret.add(x.sph(0.18, 12, 8), { ...k.paint, pos: [-0.02, 0.19, 0], scl: [1, 0.9, 1] }); // ruche
    for (let i = 0; i < 4; i++) turret.add(x.tor(0.17 - i * 0.022, 0.012, 4, 16), { ...k.paint2, pos: [-0.02, 0.12 + i * 0.05, 0], rot: [J / 2, 0, 0] });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * J * 2;
      barrel.add(x.cyl(0.02, 0.02, 0.06, 7), { ...gunmetal, pos: [0, Math.sin(a) * 0.08, Math.cos(a) * 0.08], rot: sideX });
      barrel.add(x.sph(0.014), { ...glow(k.acc, 1.5), pos: [0.03, Math.sin(a) * 0.08, Math.cos(a) * 0.08] });
    }
    return { barrelPos: [0.13, 0.19, 0], muzzle: [0.2, 0.19, 0], recoil: 0.01 };
  },
  seisme(base, turret, barrel, spin, k) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * J * 2;
      base.add(x.box(0.05, 0.5, 0.05), { ...k.paint2, pos: [Math.cos(a) * 0.26, 0.46, Math.sin(a) * 0.26], rot: [Math.sin(a) * 0.14, 0, -Math.cos(a) * 0.14] }); // portique
    }
    base.add(x.cyl(0.14, 0.22, 0.06, 4), { ...k.paint, pos: [0, 0.7, 0], rot: [0, J / 4, 0] });
    base.add(x.cyl(0.04, 0.04, 0.42, 10), { ...steel, c: '#8D939A', pos: [0, 0.46, 0] }); // piston
    base.add(x.cyl(0.14, 0.17, 0.09, 14), { ...k.trim, pos: [0, 0.3, 0] }); // masse
    base.add(x.tor(0.15, 0.012, 4, 16), { ...glow(k.acc, 1.5), pos: [0, 0.3, 0], rot: [J / 2, 0, 0] });
    return { muzzle: [0, 0.3, 0] };
  },
  balise(base, turret, barrel, spin, k) {
    base.add(x.cyl(0.018, 0.04, 0.62, 8), { ...steel, pos: [0, 0.56, 0] }); // mât
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * J * 2;
      base.add(x.cyl(0.006, 0.006, 0.56, 4), { ...gunmetal, pos: [Math.cos(a) * 0.13, 0.5, Math.sin(a) * 0.13], rot: [Math.sin(a) * 0.26, 0, -Math.cos(a) * 0.26] }); // haubans
    }
    base.add(x.box(0.16, 0.1, 0.16), { ...k.paint, pos: [0, 0.3, 0] }); // coffret
    spin.add(x.cyl(0.04, 0.06, 0.05, 10), { ...k.paint2 });
    spin.add(x.box(0.14, 0.05, 0.05), { ...k.trim, pos: [0.05, 0.03, 0] });
    spin.add(x.cyl(0.03, 0.02, 0.05, 8), { ...glow(k.acc, 2.4), pos: [0.14, 0.03, 0], rot: sideX });
    return { spinPos: [0, 0.65, 0], spinAxis: 'y', muzzle: [0.2, 0.65, 0] };
  },
  faille(base, turret, barrel, spin, k) {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * J * 2 + 0.5;
      base.add(x.box(0.07, 0.42, 0.07), { ...k.paint2, pos: [Math.cos(a) * 0.3, 0.42, Math.sin(a) * 0.3], rot: [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3] }); // griffes
      base.add(x.box(0.04, 0.12, 0.04), { ...glow(k.acc, 1.7), pos: [Math.cos(a) * 0.2, 0.62, Math.sin(a) * 0.2], rot: [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3] });
    }
    spin.add(x.sph(0.075, 12, 10), { c: '#050409', m: 1, r: 0.05 });
    spin.add(x.tor(0.13, 0.012, 5, 22), { ...glow(k.acc, 3), rot: [1.1, 0, 0.3] });
    spin.add(x.tor(0.17, 0.008, 4, 22), { ...glow(k.acc, 2.2), rot: [-0.9, 0, 0.7] });
    return { spinPos: [0, 0.52, 0], spinAxis: 'y', muzzle: [0, 0.52, 0] };
  },
  magnetique(base, turret, barrel, spin, k) {
    turret.add(x.cyl(0.16, 0.2, 0.06, 12), { ...steel, pos: [0, 0.03, 0] });
    turret.add(x.box(0.28, 0.12, 0.22), { ...k.paint, pos: [-0.03, 0.12, 0] });
    for (let i = 0; i < 3; i++) turret.add(x.cyl(0.05, 0.05, 0.02, 12), { c: '#8A8F96', m: 0.8, r: 0.4, pos: [-0.1 + i * 0.09, 0.19, 0] }); // mines en attente
    barrel.add(x.box(0.28, 0.05, 0.1), { ...k.paint2, pos: [0.14, 0, 0] }); // goulotte
    for (const side of [-1, 1]) barrel.add(x.sbox(0.26, 0.05, 0.012), { ...k.trim, pos: [0.14, 0.02, side * 0.056] });
    barrel.add(x.cyl(0.04, 0.04, 0.016, 10), { ...glow(k.acc, 1.8), pos: [0.25, 0.03, 0] });
    return { barrelPos: [0.08, 0.13, 0], barrelTilt: -0.32, muzzle: [0.36, 0.05, 0], recoil: 0.01 };
  },
  solaire(base, turret, barrel, spin, k) {
    base.add(x.cyl(0.03, 0.05, 0.28, 10), { ...steel, pos: [0, 0.36, 0] });
    base.add(x.box(0.16, 0.1, 0.16), { ...k.paint, pos: [0.22, 0.17, 0.22] }); // onduleur
    base.add(x.box(0.02, 0.04, 0.05), { ...glow(k.acc, 2), pos: [0.305, 0.19, 0.22] });
    for (const side of [-1, 1]) for (const row of [-1, 0, 1]) {
      turret.add(x.box(0.21, 0.012, 0.13), { c: '#16314F', m: 0.92, r: 0.1, pos: [row * 0.225, 0.26 + side * 0.04, side * 0.13], rot: [side * 0.3, 0, 0] }); // cellules
      turret.add(x.sbox(0.21, 0.014, 0.006), { ...k.trim, pos: [row * 0.225, 0.262 + side * 0.04, side * 0.13], rot: [side * 0.3, 0, 0] });
    }
    turret.add(x.box(0.7, 0.02, 0.03), { ...steel, pos: [0, 0.255, 0] });
    return { muzzle: [0, 0.3, 0] };
  },
  commandement(base, turret, barrel, spin, k) {
    base.add(x.box(0.42, 0.2, 0.36), { ...k.paint, pos: [-0.02, 0.36, 0] }); // bunker
    base.add(x.box(0.48, 0.03, 0.42), { ...k.paint2, pos: [-0.02, 0.475, 0] });
    base.add(x.box(0.012, 0.05, 0.22), { ...glass, pos: [0.195, 0.39, 0] }); // visière
    for (const z of [-0.07, 0.07]) base.add(x.box(0.006, 0.03, 0.05), { ...glow(k.acc, 1.6), pos: [0.203, 0.39, z] });
    for (let i = 0; i < 2; i++) base.add(x.cyl(0.003, 0.006, 0.44 - i * 0.12, 4), { ...steel, pos: [-0.15 + i * 0.09, 0.7 - i * 0.06, -0.12] }); // antennes
    base.add(x.box(0.1, 0.07, 0.008), { c: k.acc, e: 0.5, pos: [-0.15, 0.82, -0.12] }); // fanion
    spin.add(x.cyl(0.09, 0.05, 0.03, 12), { ...k.trim, rot: [0, 0, 0.5] }); // parabole
    spin.add(x.cyl(0.004, 0.004, 0.07, 4), { ...steel, pos: [0.03, 0.03, 0], rot: [0, 0, 0.5] });
    return { spinPos: [0.07, 0.53, 0.08], spinAxis: 'y', muzzle: [0, 0.55, 0] };
  },
  comete(base, turret, barrel, spin, k) {
    turret.add(x.cyl(0.17, 0.2, 0.06, 14), { ...steel, pos: [0, 0.03, 0] });
    turret.add(x.sph(0.15, 12, 8), { ...k.paint, pos: [-0.03, 0.15, 0], scl: [1.2, 0.8, 1] });
    for (const side of [-1, 1]) turret.add(x.cyl(0.045, 0.045, 0.16, 10), { ...k.paint2, pos: [-0.09, 0.16, side * 0.14], rot: sideX });
    for (const side of [-1, 1]) barrel.add(x.box(0.4, 0.05, 0.02), { ...steel, pos: [0.2, 0, side * 0.05] }); // mâchoires
    barrel.add(x.box(0.1, 0.018, 0.1), { ...k.paint2, pos: [0.03, 0.03, 0] });
    barrel.add(x.sph(0.042), { ...glow(k.acc, 3.4), pos: [0.24, 0, 0] });
    barrel.add(x.tor(0.058, 0.007, 4, 14), { ...glow(k.acc, 2), pos: [0.34, 0, 0], rot: [0, J / 2, 0] });
    return { barrelPos: [0.08, 0.16, 0], muzzle: [0.46, 0.16, 0], recoil: 0.05 };
  },
});
