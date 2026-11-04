// Refonte des modèles : ces fonctions remplacent celles du bundle d'origine, avec les mêmes paramètres.
// Toutes les unités construites à partir d'elles en profitent. Axe avant : +x. Unités : monde (1 ≈ 1 m en jeu).

// --- Géométries économes : le détail se dépense là où il se voit -------------------------------------------
{
  const cylinder = x.cyl, sphere = x.sph;
  x.box = (w, h, d) => {
    const small = Math.min(w, h, d), large = Math.max(w, h, d);
    if (small < 0.03 || large < 0.14) return new En(w, h, d); // arêtes vives : 12 triangles au lieu de 300
    return new Jl(w, h, d, large > 0.34 ? 2 : 1, small * 0.2);
  };
  x.cyl = (a, b, h, n = 16) => {
    const radius = Math.max(a, b);
    return cylinder(a, b, h, radius < 0.016 ? Math.min(n, 5) : radius < 0.045 ? Math.min(n, 8) : radius < 0.12 ? Math.min(n, 12) : n);
  };
  x.sph = (radius, w = 16, h = 12, ...rest) => (radius < 0.03 && !rest.length ? sphere(radius, 7, 5) : radius < 0.07 && !rest.length ? sphere(radius, 10, 8) : sphere(radius, w, h, ...rest));
  x.cap = (radius, length, n = 8) => new _r(radius, length, radius < 0.03 ? 2 : 3, radius < 0.03 ? Math.min(n, 6) : n);
}

const hull = (c, cm = 1) => ({ c, m: 0.34, r: 0.66, cm });
const steel = { c: '#454B52', m: 0.88, r: 0.36 };
const gunmetal = { c: '#23262B', m: 0.75, r: 0.42 };
const rubber = { c: '#141517', m: 0, r: 0.92 };
const canvas = { c: '#5F5A45', m: 0, r: 0.96 };
const glass = { c: '#17303C', m: 0.9, r: 0.07 };
const brass = { c: '#B08D4A', m: 0.95, r: 0.34 };
const lamp = (c = '#FFE8A0', e = 2.4) => ({ c, e, m: 0, r: 0.4 });
const sideY = (y = 0) => [J / 2, y, 0]; // cylindre couché le long de z
const sideX = [0, 0, J / 2]; // cylindre couché le long de x

// --- Soldat -----------------------------------------------------------------------------------------------
be = function soldier(colors, o = {}) {
  const torso = new Zt(), left = new Zt(), right = new Zt(), scale = o.s || 1;
  const cloth = o.suit || { c: colors[0], r: 0.92, cm: 1 };
  const gear = { c: colors[1], r: 0.88, cm: 0.6 };
  const skin = { c: o.skin || '#C49673', r: 0.62 };
  const boot = { c: '#211D19', r: 0.72, m: 0.1 };
  const metal = { c: '#17181A', m: 0.62, r: 0.44 };
  const strap = { c: '#2A2822', r: 0.92 };

  for (const leg of [left, right]) {
    leg.add(x.cap(0.029, 0.082, 7), { ...cloth, pos: [0.006, -0.056, 0], rot: [0, 0, 0.05] });
    leg.add(x.cap(0.023, 0.076, 6), { ...cloth, pos: [-0.004, -0.147, 0] });
    leg.add(x.box(0.026, 0.03, 0.04), { ...gear, pos: [0.024, -0.102, 0] }); // genouillère
    leg.add(x.box(0.022, 0.05, 0.034), { ...strap, pos: [0.002, -0.178, 0] }); // guêtre
    leg.add(x.box(0.074, 0.03, 0.046), { ...boot, pos: [0.014, -0.208, 0] });
    leg.add(x.box(0.04, 0.012, 0.05), { c: '#0F0F10', r: 0.95, pos: [0.018, -0.222, 0] }); // semelle
  }

  torso.add(x.box(0.082, 0.062, 0.112), { ...cloth, pos: [0, 0.214, 0] });
  torso.add(x.box(0.09, 0.016, 0.118), { ...strap, pos: [0, 0.244, 0] }); // ceinturon
  torso.add(x.box(0.078, 0.128, 0.122), { ...cloth, pos: [0, 0.304, 0] });
  if (!o.noVest) {
    const vest = o.vest || gear;
    torso.add(x.box(0.092, 0.098, 0.13), { ...vest, pos: [0.004, 0.306, 0] });
    for (const z of [-0.036, 0, 0.036]) {
      torso.add(x.box(0.02, 0.034, 0.028), { ...vest, c: colors[1], pos: [0.056, 0.274, z] }); // chargeurs
      torso.add(x.sbox(0.006, 0.006, 0.02), { ...strap, pos: [0.067, 0.292, z] });
    }
    for (const z of [-0.04, 0.04]) torso.add(x.sbox(0.094, 0.11, 0.009), { ...strap, pos: [0.004, 0.307, z] }); // sangles
    torso.add(x.box(0.024, 0.034, 0.022), { ...gear, pos: [0.016, 0.238, 0.064] }); // gourde
  }
  for (const side of [-1, 1]) {
    torso.add(x.sph(0.031), { ...(o.noVest ? cloth : gear), pos: [0.002, 0.358, side * 0.074], scl: [1, 0.78, 1] }); // épaulière
    torso.add(x.cap(0.022, 0.068, 6), { ...cloth, pos: [0.024, 0.314, side * 0.074], rot: [side * 0.22, 0, -0.9] });
    torso.add(x.cap(0.019, 0.058, 6), { ...cloth, pos: [0.076, 0.284, side * 0.046], rot: [side * 0.9, 0, -1.4] });
    torso.add(x.sph(0.018), { ...(o.glove ? { c: o.glove } : metal), r: 0.82, pos: [0.106, 0.279, side * 0.02] });
  }

  torso.add(x.cap(0.018, 0.018, 6), { ...skin, pos: [0, 0.372, 0] });
  torso.add(x.sph(0.037, 12, 10), { ...(o.face || skin), pos: [0.006, 0.406, 0], scl: [1, 1.08, 0.92] });
  if (o.helmet !== false) {
    const helm = o.helm || cloth;
    torso.add(x.sph(0.047, 14, 7, 0, J * 2, 0, J / 2), { ...helm, cm: 1, pos: [0.001, 0.412, 0], scl: [1.08, 0.94, 1] });
    torso.add(x.cyl(0.052, 0.054, 0.007, 14), { ...helm, pos: [0.001, 0.412, 0] });
    torso.add(x.box(0.024, 0.011, 0.056), { c: '#0E1416', m: 0.8, r: 0.16, pos: [0.04, 0.42, 0] }); // lunettes
    torso.add(x.sbox(0.012, 0.03, 0.006), { ...strap, pos: [0.012, 0.385, 0.034] });
    torso.add(x.sbox(0.012, 0.03, 0.006), { ...strap, pos: [0.012, 0.385, -0.034] });
  }
  if (o.beret) torso.add(x.cyl(0.04, 0.044, 0.024, 12), { c: o.beret, r: 0.95, pos: [0, 0.44, 0.005], rot: [0.25, 0, 0.15] });

  if (o.gun !== false) {
    torso.add(x.box(0.11, 0.028, 0.02), { ...metal, pos: [0.098, 0.286, 0] }); // boîtier
    torso.add(x.box(0.06, 0.02, 0.022), { c: '#2B2822', r: 0.8, pos: [0.172, 0.285, 0] }); // garde-main
    torso.add(x.cyl(0.0065, 0.0065, 0.074, 5), { ...metal, pos: [0.238, 0.29, 0], rot: sideX });
    torso.add(x.box(0.02, 0.048, 0.016), { ...metal, pos: [0.092, 0.255, 0], rot: [0, 0, 0.25] }); // chargeur
    torso.add(x.box(0.052, 0.028, 0.018), { ...metal, pos: [0.012, 0.288, 0] }); // crosse
    torso.add(x.box(0.032, 0.012, 0.01), { c: '#2A2E30', m: 0.6, r: 0.3, pos: [0.112, 0.306, 0] }); // viseur
  }
  if (o.pack) {
    torso.add(x.box(0.054, 0.1, 0.094), { c: o.pack, r: 0.92, cm: 0.6, pos: [-0.068, 0.31, 0] });
    torso.add(x.box(0.02, 0.04, 0.08), { c: o.pack, r: 0.92, cm: 0.6, pos: [-0.096, 0.292, 0] });
    torso.add(x.cyl(0.021, 0.021, 0.098, 7), { c: '#5A5240', r: 0.96, pos: [-0.07, 0.372, 0], rot: sideY() });
    torso.add(x.cyl(0.002, 0.002, 0.2, 3), { ...metal, pos: [-0.09, 0.42, 0.04], rot: [0.1, 0, 0.05] }); // antenne
  }
  if (o.extra) o.extra(torso, colors);
  for (const group of [torso, left, right]) for (const part of group.parts) part.scale(scale, scale, scale);
  return [
    { g: torso.build() },
    { g: left.build(), anim: 'legL', pos: [0, 0.205 * scale, 0.03 * scale] },
    { g: right.build(), anim: 'legR', pos: [0, 0.205 * scale, -0.03 * scale] },
  ];
};

// --- Roues et chenilles -----------------------------------------------------------------------------------
Zi = function wheels(group, xs, halfWidth, radius, y = radius) {
  for (const px of xs) for (const z of [-halfWidth, halfWidth]) {
    const out = Math.sign(z);
    group.add(x.cyl(radius, radius, 0.064, 14), { ...rubber, pos: [px, y, z], rot: sideY() });
    group.add(x.cyl(radius * 1.03, radius * 1.03, 0.022, 14), { ...rubber, c: '#1C1D20', pos: [px, y, z], rot: sideY() }); // bande de roulement
    group.add(x.cyl(radius * 0.56, radius * 0.62, 0.012, 10), { ...steel, c: '#5A5F66', pos: [px, y, z + out * 0.031], rot: sideY() }); // jante
    group.add(x.cyl(radius * 0.22, radius * 0.26, 0.016, 7), { ...gunmetal, pos: [px, y, z + out * 0.037], rot: sideY() }); // moyeu
    group.add(x.box(radius * 2.15, 0.014, 0.08), { ...gunmetal, c: '#1D1F22', pos: [px, y + radius + 0.012, z] }); // garde-boue
  }
};

J1 = function tracks(group, length, halfWidth, height = 0.12, width = 0.1) {
  for (const z of [-halfWidth, halfWidth]) {
    group.add(x.box(length - height * 0.5, height, width), { ...rubber, pos: [0, height / 2, z] });
    for (const end of [-1, 1]) group.add(x.cyl(height * 0.5, height * 0.5, width, 12), { ...rubber, pos: [end * (length / 2 - height * 0.26), height / 2, z], rot: sideY() });
    const links = Math.round(length / 0.07);
    for (let i = 0; i < links; i++) {
      const px = -length / 2 + (i + 0.5) * (length / links);
      group.add(x.sbox((length / links) * 0.5, 0.012, width + 0.008), { c: '#2C2D2E', m: 0.65, r: 0.58, pos: [px, height + 0.003, z] });
      group.add(x.sbox((length / links) * 0.5, 0.012, width + 0.008), { c: '#2C2D2E', m: 0.65, r: 0.58, pos: [px, 0.003, z] });
    }
    const wheels = Math.max(4, Math.round(length / 0.13));
    for (let i = 0; i < wheels; i++) {
      const px = -length / 2 + 0.06 + i * ((length - 0.12) / (wheels - 1));
      group.add(x.cyl(height * 0.38, height * 0.38, width + 0.012, 12), { c: '#3B3D3F', m: 0.72, r: 0.45, pos: [px, height * 0.42, z], rot: sideY() });
      group.add(x.cyl(height * 0.15, height * 0.15, width + 0.02, 6), { c: '#585B5E', m: 0.82, r: 0.34, pos: [px, height * 0.42, z], rot: sideY() });
    }
    for (const end of [-1, 1]) {
      group.add(x.cyl(height * 0.42, height * 0.42, width + 0.016, 10), { c: '#3B3D3F', m: 0.8, r: 0.4, pos: [end * (length / 2 - 0.02), height * 0.6, z], rot: sideY() });
      for (let t = 0; t < 4; t++) group.add(x.sbox(height * 0.13, height * 0.72, width + 0.022), { c: '#2A2B2D', m: 0.75, r: 0.5, pos: [end * (length / 2 - 0.02), height * 0.6, z], rot: [0, 0, (t * J) / 4] }); // barbotin
    }
  }
};

// --- Char : même paramétrage, caisse inclinée, jupes, équipement et tourelle à faces ------------------------
rn = function tank(colors, o) {
  const body = new Zt(), head = new Zt(), L = o.L || 0.72, W = o.W || 0.42, T = o.th || 0.13, tw = o.tw || 0.11;
  const paint = hull(colors[0]), trim = hull(colors[1], 0.7), s = o.ts || 1;
  J1(body, L, W / 2 - 0.05, T, tw);
  body.add(x.box(L * 0.88, 0.12, W - 0.1), { ...paint, pos: [0, T + 0.03, 0] });
  body.add(x.box(L * 0.26, 0.05, W - 0.12), { ...paint, pos: [L * 0.39, T + 0.05, 0], rot: [0, 0, -0.42] }); // glacis
  body.add(x.box(L * 0.1, 0.05, W - 0.13), { ...paint, pos: [L * 0.46, T - 0.005, 0], rot: [0, 0, 0.75] });
  body.add(x.box(L * 0.16, 0.05, W - 0.14), { ...paint, pos: [-L * 0.45, T + 0.04, 0], rot: [0, 0, 0.5] });
  body.add(x.box(L * 0.88, 0.028, W - 0.05), { ...paint, pos: [0, T + 0.1, 0] }); // plage
  for (const side of [-1, 1]) {
    const panels = 5;
    for (let i = 0; i < panels; i++) body.add(x.box((L * 0.84) / panels - 0.006, 0.066, 0.018), { ...trim, pos: [-L * 0.42 + (i + 0.5) * ((L * 0.84) / panels), T + 0.022, side * (W / 2 + 0.002)] }); // jupes
    body.add(x.box(L * 0.86, 0.016, tw + 0.026), { ...paint, pos: [0, T + 0.072, side * (W / 2 - 0.05)] }); // garde-boue
    body.add(x.box(0.1, 0.034, 0.05), { ...canvas, pos: [-L * 0.27, T + 0.128, side * (W / 2 - 0.05)] }); // caisse d'équipement
    body.add(x.cyl(0.018, 0.018, 0.1, 7), { ...canvas, c: '#6E6A56', pos: [L * 0.18, T + 0.128, side * (W / 2 - 0.05)], rot: sideX });
    body.add(x.cyl(0.018, 0.021, 0.05, 7), { ...gunmetal, pos: [-L * 0.47, T + 0.08, side * 0.1], rot: sideX }); // échappement
    body.add(x.sph(0.012), { ...lamp(), pos: [L * 0.45, T + 0.075, side * 0.12] });
    body.add(x.box(0.022, 0.02, 0.03), { ...gunmetal, pos: [L * 0.45, T + 0.08, side * 0.12] }); // protège-phare
  }
  for (let i = 0; i < 5; i++) body.add(x.sbox(0.012, 0.006, W * 0.42), { c: '#191919', r: 0.92, pos: [-L * 0.38 + i * 0.03, T + 0.117, 0] }); // grilles moteur
  body.add(x.cyl(0.008, 0.008, 0.16, 5), { ...steel, pos: [L * 0.1, T + 0.124, W * 0.28], rot: sideX }); // pelle

  head.add(x.box(0.3 * s, 0.09 * s, 0.27 * s), { ...paint, pos: [0, 0.046 * s, 0] });
  for (const side of [-1, 1]) head.add(x.box(0.24 * s, 0.07 * s, 0.05 * s), { ...paint, pos: [0.01 * s, 0.046 * s, side * 0.15 * s], rot: [side * 0.35, side * 0.12, 0] }); // joues inclinées
  head.add(x.box(0.1 * s, 0.07 * s, 0.2 * s), { ...paint, pos: [0.13 * s, 0.045 * s, 0], rot: [0, 0, -0.35] });
  head.add(x.box(0.12 * s, 0.07 * s, 0.22 * s), { ...paint, pos: [-0.19 * s, 0.05 * s, 0] }); // bustle
  head.add(x.box(0.06 * s, 0.05 * s, 0.26 * s), { ...canvas, pos: [-0.26 * s, 0.06 * s, 0] }); // panier arrière
  head.add(x.box(0.07 * s, 0.078 * s, 0.11 * s), { ...trim, pos: [0.185 * s, 0.05 * s, 0] }); // masque
  const length = o.bl || 0.46, start = (0.2 + length / 2) * s;
  const barrel = (z) => {
    head.add(x.cyl(0.017 * s, 0.024 * s, length * s, 12), { ...steel, pos: [start, 0.055 * s, z], rot: sideX });
    head.add(x.cyl(0.03 * s, 0.03 * s, 0.075 * s, 10), { ...steel, c: '#3A3F45', pos: [start + length * s * 0.12, 0.055 * s, z], rot: sideX }); // évacuateur
    head.add(x.cyl(0.026 * s, 0.024 * s, 0.038 * s, 8), { ...gunmetal, pos: [start + length * s * 0.5, 0.055 * s, z], rot: sideX }); // frein de bouche
    head.add(x.sbox(0.012 * s, 0.012 * s, 0.052 * s), { ...gunmetal, pos: [start + length * s * 0.5, 0.055 * s, z] });
  };
  barrel(0);
  if (o.twin) barrel(0.07 * s);
  head.add(x.cyl(0.04 * s, 0.046 * s, 0.038 * s, 12), { ...trim, pos: [-0.05 * s, 0.112 * s, 0.06 * s] }); // tourelleau
  head.add(x.cyl(0.03 * s, 0.03 * s, 0.01 * s, 10), { ...trim, pos: [-0.05 * s, 0.135 * s, 0.06 * s] });
  head.add(x.cyl(0.005, 0.005, 0.11 * s, 5), { ...gunmetal, pos: [-0.01 * s, 0.158 * s, 0.06 * s], rot: sideX }); // mitrailleuse
  head.add(x.box(0.06 * s, 0.03 * s, 0.05 * s), { ...trim, pos: [0.02 * s, 0.108 * s, -0.07 * s] }); // viseur
  head.add(x.cyl(0.0025, 0.0015, 0.34 * s, 3), { ...gunmetal, pos: [-0.2 * s, 0.24 * s, -0.09 * s], rot: [0, 0, 0.15] }); // antenne
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) head.add(x.cyl(0.01 * s, 0.01 * s, 0.036 * s, 5), { ...gunmetal, pos: [0.07 * s, 0.078 * s, side * ((i - 1) * 0.026 * s + 0.11 * s)], rot: [side * 0.5, 0, -0.6] }); // fumigènes
  if (o.extra) o.extra(body, head, colors);
  return [{ g: body.build() }, { g: head.build(), anim: 'turret', pos: [o.tx || -0.03, T + 0.115, 0] }];
};

// --- Camion et véhicule léger ------------------------------------------------------------------------------
zn = function truck(colors, o = {}) {
  const body = new Zt(), paint = hull(colors[0]), trim = hull(colors[1], 0.6), L = o.L || 0.62, axles = o.wx || [-L * 0.32, L * 0.3];
  Zi(body, axles, 0.15, 0.075);
  body.add(x.box(L, 0.05, 0.12), { ...gunmetal, pos: [0, 0.095, 0] }); // longeron
  body.add(x.box(L * 0.98, 0.04, 0.3), { ...trim, pos: [0, 0.14, 0] });
  body.add(x.box(L * 0.26, 0.14, 0.27), { ...paint, pos: [L * 0.29, 0.232, 0] }); // cabine
  body.add(x.box(L * 0.16, 0.085, 0.26), { ...paint, pos: [L * 0.44, 0.198, 0] }); // capot
  body.add(x.box(0.012, 0.068, 0.22), { ...glass, pos: [L * 0.42 - 0.012, 0.272, 0], rot: [0, 0, 0.3] }); // pare-brise
  body.add(x.box(L * 0.25, 0.012, 0.28), { ...trim, pos: [L * 0.29, 0.305, 0] }); // toit
  body.add(x.box(0.012, 0.05, 0.2), { ...gunmetal, pos: [L * 0.525, 0.195, 0] }); // calandre
  for (let i = 0; i < 4; i++) body.add(x.sbox(0.004, 0.044, 0.008), { ...steel, pos: [L * 0.533, 0.195, -0.06 + i * 0.04] });
  body.add(x.box(0.03, 0.036, 0.28), { ...gunmetal, pos: [L * 0.52, 0.12, 0] }); // pare-chocs
  for (const side of [-1, 1]) {
    body.add(x.box(0.07, 0.05, 0.008), { ...glass, pos: [L * 0.3, 0.262, side * 0.137] }); // vitre
    body.add(x.sph(0.012), { ...lamp(), pos: [L * 0.525, 0.158, side * 0.1] });
    body.add(x.sbox(0.012, 0.03, 0.022), { ...gunmetal, pos: [L * 0.38, 0.272, side * 0.152] }); // rétroviseur
    body.add(x.box(0.05, 0.03, 0.03), { ...gunmetal, pos: [L * 0.02, 0.1, side * 0.1] }); // réservoir
    body.add(x.cyl(0.008, 0.008, 0.13, 5), { ...gunmetal, pos: [L * 0.14, 0.27, side * 0.12] }); // pot
  }
  if (o.extra) o.extra(body, colors, paint, trim);
  return [{ g: body.build() }];
};

// --- Hélicoptère ------------------------------------------------------------------------------------------
Fr = function helicopter(colors, o = {}) {
  const body = new Zt(), rotor = new Zt(), tail = new Zt(), s = o.s || 1;
  const paint = { c: colors[0], m: 0.38, r: 0.52, cm: 1 }, trim = { c: colors[1], m: 0.38, r: 0.58, cm: 0.6 };
  body.add(x.cap(0.082 * s, 0.32 * s, 14), { ...paint, rot: [0, 0, J / 2], scl: [1, 1, 0.8] });
  body.add(x.box(0.28 * s, 0.068 * s, 0.12 * s), { ...paint, pos: [-0.02 * s, 0.07 * s, 0] }); // capot moteur
  body.add(x.sph(0.074 * s, 14, 10), { ...glass, pos: [0.19 * s, 0.034 * s, 0], scl: [1.4, 0.86, 0.8] }); // verrière
  body.add(x.box(0.012 * s, 0.05 * s, 0.11 * s), { ...trim, pos: [0.13 * s, 0.05 * s, 0] }); // montant
  body.add(x.cyl(0.02 * s, 0.045 * s, 0.55 * s, 10), { ...paint, pos: [-0.45 * s, 0.05 * s, 0], rot: [0, 0, J / 2 + 0.06] }); // poutre de queue
  body.add(x.box(0.12 * s, 0.16 * s, 0.012), { ...trim, pos: [-0.7 * s, 0.12 * s, 0], rot: [0, 0, 0.35] }); // dérive
  body.add(x.box(0.07 * s, 0.01, 0.2 * s), { ...trim, pos: [-0.6 * s, 0.05 * s, 0] }); // stabilisateur
  body.add(x.cyl(0.012 * s, 0.012 * s, 0.1 * s, 6), { ...gunmetal, pos: [0.25 * s, -0.06 * s, 0], rot: sideX }); // canon de nez
  body.add(x.cyl(0.02, 0.026, 0.07 * s, 8), { ...steel, pos: [0, 0.14 * s, 0] }); // mât
  for (const side of [-1, 1]) {
    body.add(x.box(0.1 * s, 0.012, 0.13 * s), { ...paint, pos: [-0.02 * s, 0, side * 0.12 * s] }); // ailette
    body.add(x.cyl(0.024 * s, 0.024 * s, 0.13 * s, 8), { ...gunmetal, pos: [-0.02 * s, -0.035 * s, side * 0.17 * s], rot: sideX }); // panier
    body.add(x.cyl(0.024 * s, 0.024 * s, 0.006, 8), { c: '#C03020', e: 0.4, pos: [0.045 * s, -0.035 * s, side * 0.17 * s], rot: sideX });
    body.add(x.cyl(0.032 * s, 0.032 * s, 0.14 * s, 10), { ...trim, pos: [-0.05 * s, 0.12 * s, side * 0.05 * s], rot: sideX }); // turbine
    body.add(x.cyl(0.018 * s, 0.022 * s, 0.03 * s, 8), { ...gunmetal, pos: [-0.13 * s, 0.12 * s, side * 0.05 * s], rot: sideX });
    body.add(x.cyl(0.006, 0.006, 0.38 * s, 5), { ...steel, pos: [0, -0.11 * s, side * 0.085 * s], rot: sideX }); // patin
    for (const px of [-0.08, 0.08]) body.add(x.cyl(0.004, 0.004, 0.05 * s, 4), { ...steel, pos: [px * s, -0.09 * s, side * 0.085 * s] });
    body.add(x.box(0.04 * s, 0.03 * s, 0.006), { ...glass, pos: [0.1 * s, 0.03 * s, side * 0.07 * s] }); // hublot
  }
  if (o.twin) body.add(x.box(0.12 * s, 0.12 * s, 0.1 * s), { ...paint, pos: [-0.38 * s, 0.12 * s, 0] });
  body.add(x.sph(0.008), { c: '#FF2020', e: 4, pos: [-0.72 * s, 0.2 * s, 0] });
  const blades = o.blades || 4;
  for (let i = 0; i < blades; i++) {
    const turn = new D.Matrix4().makeRotationY((i / blades) * J * 2);
    rotor.add(x.sbox(0.62 * s, 0.005, 0.038 * s), { c: '#222324', m: 0.4, r: 0.6, pos: [0.32 * s, 0, 0], mat: turn });
    rotor.add(x.sbox(0.04 * s, 0.006, 0.04 * s), { c: '#D8C25A', m: 0.1, r: 0.6, pos: [0.61 * s, 0, 0], mat: turn }); // bout de pale
  }
  rotor.add(x.cyl(0.033, 0.033, 0.033, 10), { ...steel });
  for (let i = 0; i < 2; i++) tail.add(x.sbox(0.014, 0.17 * s, 0.02), { c: '#242526', r: 0.6, mat: new D.Matrix4().makeRotationZ((i * J) / 2) });
  const parts = [{ g: body.build() }, { g: rotor.build(), anim: 'rotor', pos: [o.twin ? 0.2 * s : 0, 0.18 * s, 0] }, { g: tail.build(), anim: 'tail', pos: [-0.72 * s, 0.12 * s, 0.025] }];
  if (o.twin) parts.push({ g: rotor.build(), anim: 'rotor', pos: [-0.38 * s, 0.2 * s, 0] });
  return parts;
};

// --- Avion ------------------------------------------------------------------------------------------------
Jo = function plane(colors, o) {
  const body = new Zt(), props = new Zt(), s = o.s || 1, sweep = o.swept ? 0.5 : 0, span = o.span || 0.62;
  const paint = { c: colors[0], m: 0.45, r: 0.46, cm: 1 }, trim = { c: colors[1], m: 0.45, r: 0.5, cm: 0.6 };
  body.add(x.cap(0.078 * s, 0.68 * s, 12), { ...paint, rot: [0, 0, J / 2], scl: [1, 1, o.fat || 1] });
  body.add(x.cone(0.078 * s, 0.2 * s, 12), { ...paint, pos: [0.52 * s, 0, 0], rot: [0, 0, -J / 2] });
  body.add(x.sph(0.058 * s, 12, 8), { ...glass, pos: [0.34 * s, 0.05 * s, 0], scl: [1.7, 0.7, 0.78] });
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) { // aile effilée en trois sections
      const t = (i + 0.5) / 3, chord = (0.28 - t * 0.14) * s, sectionSpan = (span / 3) * s;
      body.add(x.sbox(chord, 0.018 * s, sectionSpan + 0.004), { ...paint, pos: [(-0.02 - sweep * t * span * 0.5) * s, -0.012 + t * 0.012, side * (0.05 * s + t * span * s)] });
    }
    body.add(x.sbox(0.1 * s, 0.012, 0.2 * s), { ...trim, pos: [-0.42 * s, 0.012, side * 0.1 * s], rot: [0, side * sweep * 0.8, 0] });
    for (let i = 0; i < (o.engines || 0); i++) {
      const z = side * (0.16 + i * 0.16) * s;
      body.add(x.cyl(0.033 * s, 0.038 * s, 0.18 * s, 10), { ...steel, pos: [0.06 * s, -0.04 * s, z], rot: sideX });
      props.add(x.cyl(0.075 * s, 0.075 * s, 0.006, 14), { c: '#2A2A2A', r: 0.6, pos: [0.16 * s, -0.04 * s, z], rot: sideX });
    }
    if (o.jet) {
      body.add(x.cyl(0.028 * s, 0.035 * s, 0.16 * s, 10), { ...gunmetal, pos: [-0.38 * s, 0, side * 0.05 * s], rot: sideX });
      body.add(x.sph(0.02 * s), { c: '#FF8A30', e: 3, pos: [-0.47 * s, 0, side * 0.05 * s] });
      body.add(x.box(0.08 * s, 0.03 * s, 0.03 * s), { ...trim, pos: [0.14 * s, 0, side * 0.08 * s] }); // entrée d'air
    }
    body.add(x.sph(0.012), { c: side > 0 ? '#20FF40' : '#FF2020', e: 4, pos: [(-0.02 - sweep * span * 0.5) * s, 0, side * (0.05 + span) * s] });
    body.add(x.cyl(0.012 * s, 0.012 * s, 0.1 * s, 6), { ...steel, c: '#CFCFCF', pos: [(-0.06 - sweep * 0.3) * s, -0.04 * s, side * span * 0.65 * s], rot: sideX }); // charge
  }
  body.add(x.sbox(0.14 * s, (o.fin || 0.16) * s, 0.012), { ...trim, pos: [-0.45 * s, 0.08 * s, 0], rot: [0, 0, 0.35] });
  const parts = [{ g: body.build() }], propeller = props.build();
  if (propeller) parts.push({ g: propeller });
  return parts;
};
