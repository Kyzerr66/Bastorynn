// Modèles des douze nouvelles unités. Une partie animée : { g, anim, pos }.
const newUnits = {
  x_tireur(c) {
    return be(['#4C5A3C', '#30381F', '#5E6A48'], {
      pack: '#3C4228', helm: { c: '#3E4A2E', r: 0.9, cm: 1 },
      extra: (s) => {
        s.add(x.cyl(0.004, 0.004, 0.2, 4), { ...gunmetal, pos: [0.29, 0.292, 0], rot: sideX }); // long canon
        s.add(x.cyl(0.011, 0.011, 0.07, 6), { ...gunmetal, pos: [0.09, 0.322, 0], rot: sideX }); // lunette
        for (const z of [-0.02, 0.02]) s.add(x.cyl(0.002, 0.002, 0.08, 3), { ...gunmetal, pos: [0.3, 0.255, z], rot: [z * 8, 0, 0.1] }); // bipied
      },
    });
  },
  x_roquette(c) {
    return be(c, {
      gun: false, pack: c[1],
      extra: (s) => {
        s.add(x.cyl(0.032, 0.032, 0.34, 10), { c: '#3F4A35', m: 0.3, r: 0.68, pos: [0.04, 0.36, 0.05], rot: sideX }); // tube
        s.add(x.cyl(0.04, 0.032, 0.04, 10), { ...gunmetal, pos: [-0.14, 0.36, 0.05], rot: sideX });
        s.add(x.cone(0.03, 0.05, 8), { c: '#7A3020', m: 0.2, r: 0.6, pos: [0.23, 0.36, 0.05], rot: [0, 0, -J / 2] });
        s.add(x.box(0.03, 0.03, 0.012), { ...gunmetal, pos: [0.07, 0.395, 0.05] });
        s.add(x.box(0.05, 0.1, 0.09), { c: '#4A4A32', r: 0.9, pos: [-0.075, 0.27, 0] });
      },
    });
  },
  x_mule(c) {
    const body = new Zt(), left = new Zt(), right = new Zt(), paint = hull(c[0]), trim = hull(c[1], 0.6);
    body.add(x.box(0.42, 0.11, 0.17), { ...paint, pos: [0, 0.3, 0] });
    body.add(x.box(0.34, 0.06, 0.2), { ...canvas, pos: [-0.03, 0.385, 0] }); // charge
    body.add(x.box(0.1, 0.07, 0.09), { ...trim, pos: [0.25, 0.34, 0] }); // tête capteurs
    body.add(x.box(0.008, 0.024, 0.06), { ...glow('#6FF0C8', 2), pos: [0.302, 0.345, 0] });
    body.add(x.cyl(0.002, 0.002, 0.16, 3), { ...gunmetal, pos: [-0.15, 0.48, 0.05] });
    [left, right].forEach((leg, side) => {
      for (const [px, pz] of side ? [[0.15, -0.1], [-0.15, 0.1]] : [[0.15, 0.1], [-0.15, -0.1]]) {
        leg.add(x.cap(0.022, 0.09, 6), { ...steel, pos: [px, -0.08, pz], rot: [0, 0, 0.3] });
        leg.add(x.cap(0.016, 0.1, 5), { ...gunmetal, pos: [px - 0.012, -0.19, pz], rot: [0, 0, -0.25] });
        leg.add(x.box(0.05, 0.016, 0.04), { ...rubber, pos: [px + 0.012, -0.262, pz] });
      }
    });
    return [{ g: body.build() }, { g: left.build(), anim: 'legL', pos: [0, 0.27, 0] }, { g: right.build(), anim: 'legR', pos: [0, 0.27, 0] }];
  },
  x_tripode(c) {
    const body = new Zt(), left = new Zt(), right = new Zt(), head = new Zt(), paint = hull(c[0]), trim = hull(c[1], 0.7);
    body.add(x.sph(0.15, 14, 10), { ...paint, pos: [0, 0.62, 0], scl: [1.2, 0.72, 1.05] }); // nacelle
    body.add(x.tor(0.17, 0.016, 5, 20), { ...trim, pos: [0, 0.6, 0], rot: [J / 2, 0, 0] });
    body.add(x.cyl(0.09, 0.05, 0.11, 10), { ...gunmetal, pos: [0, 0.5, 0] });
    for (const side of [-1, 1]) body.add(x.box(0.08, 0.08, 0.04), { ...trim, pos: [-0.1, 0.62, side * 0.16] }); // nacelles latérales
    [left, right].forEach((leg, i) => {
      const angles = i ? [J] : [J / 3, -J / 3];
      for (const a of angles) {
        const px = Math.cos(a), pz = Math.sin(a);
        leg.add(x.cap(0.026, 0.28, 6), { ...steel, pos: [px * 0.16, -0.06, pz * 0.16], rot: [pz * 0.95, 0, -px * 0.95] }); // cuisse
        leg.add(x.cap(0.02, 0.34, 6), { ...gunmetal, pos: [px * 0.32, -0.33, pz * 0.32], rot: [-pz * 0.22, 0, px * 0.22] }); // jambe
        leg.add(x.sph(0.034), { ...trim, pos: [px * 0.3, -0.15, pz * 0.3] }); // genou
        leg.add(x.cyl(0.04, 0.056, 0.024, 8), { ...rubber, pos: [px * 0.36, -0.5, pz * 0.36] });
      }
    });
    head.add(x.box(0.2, 0.09, 0.17), { ...paint, pos: [0.02, 0.05, 0] });
    head.add(x.box(0.05, 0.03, 0.1), { ...glow('#FF6A3A', 2), pos: [0.12, 0.08, 0] });
    for (const z of [-0.05, 0.05]) {
      head.add(x.cyl(0.018, 0.022, 0.36, 8), { ...steel, pos: [0.3, 0.04, z], rot: sideX });
      head.add(x.cyl(0.026, 0.024, 0.03, 7), { ...gunmetal, pos: [0.48, 0.04, z], rot: sideX });
    }
    return [{ g: body.build() }, { g: left.build(), anim: 'legL', pos: [0, 0.52, 0] }, { g: right.build(), anim: 'legR', pos: [0, 0.52, 0] }, { g: head.build(), anim: 'turret', pos: [0, 0.7, 0] }];
  },
  x_chenille(c) {
    return rn(c, {
      L: 0.46, W: 0.3, th: 0.09, tw: 0.07, ts: 0.68, bl: 0.28,
      extra: (body, head) => {
        body.add(x.box(0.05, 0.014, 0.2), { ...glow('#6FF0C8', 1.2), pos: [0.2, 0.2, 0] }); // bandeau capteurs
        head.add(x.sph(0.026), { ...glass, pos: [0.06, 0.09, -0.05] });
      },
    });
  },
  x_semi(c) {
    const body = new Zt(), head = new Zt(), paint = hull(c[0]), trim = hull(c[1], 0.7);
    Zi(body, [0.24], 0.15, 0.07);
    for (const z of [-0.14, 0.14]) {
      body.add(x.box(0.36, 0.085, 0.08), { ...rubber, pos: [-0.15, 0.058, z] });
      for (let i = 0; i < 4; i++) body.add(x.cyl(0.032, 0.032, 0.09, 8), { c: '#3B3D3F', m: 0.72, r: 0.45, pos: [-0.29 + i * 0.09, 0.048, z], rot: sideY() });
    }
    body.add(x.box(0.66, 0.1, 0.26), { ...paint, pos: [0, 0.16, 0] });
    body.add(x.box(0.18, 0.05, 0.25), { ...paint, pos: [0.32, 0.2, 0], rot: [0, 0, -0.3] });
    body.add(x.box(0.14, 0.09, 0.26), { ...paint, pos: [0.12, 0.25, 0] });
    body.add(x.box(0.01, 0.04, 0.2), { ...glass, pos: [0.195, 0.275, 0] });
    for (const z of [-0.14, 0.14]) body.add(x.box(0.36, 0.1, 0.014), { ...trim, pos: [-0.15, 0.25, z] });
    head.add(x.box(0.14, 0.08, 0.16), { ...trim, pos: [0, 0.04, 0] });
    head.add(x.box(0.016, 0.11, 0.18), { ...paint, pos: [0.08, 0.05, 0] }); // bouclier
    head.add(x.cyl(0.012, 0.016, 0.34, 7), { ...steel, pos: [0.26, 0.045, 0], rot: sideX });
    head.add(x.box(0.05, 0.04, 0.05), { ...canvas, pos: [-0.05, 0.03, 0.09] });
    return [{ g: body.build() }, { g: head.build(), anim: 'turret', pos: [-0.14, 0.3, 0] }];
  },
  x_bombarde(c) {
    return zn(c, {
      L: 0.72,
      extra: (body, _, paint, trim) => {
        body.add(x.box(0.38, 0.1, 0.28), { ...paint, pos: [-0.14, 0.21, 0] });
        for (const z of [-0.14, 0.14]) body.add(x.box(0.38, 0.08, 0.012), { ...trim, pos: [-0.14, 0.3, z] });
        body.add(x.cyl(0.05, 0.065, 0.32, 12), { ...steel, c: '#4C5158', pos: [-0.16, 0.38, 0], rot: [0, 0, -0.55] }); // tube
        body.add(x.cyl(0.075, 0.075, 0.016, 10), { ...gunmetal, pos: [-0.27, 0.27, 0] }); // plaque de base
        for (let i = 0; i < 3; i++) body.add(x.cyl(0.02, 0.02, 0.1, 7), { ...brass, pos: [-0.02 - i * 0.05, 0.29, -0.09], rot: sideY() }); // obus
      },
    });
  },
  x_iem(c) {
    return rn(c, {
      L: 0.74, W: 0.44, ts: 1.05, bl: 0.3,
      extra: (body, head) => {
        for (let i = 0; i < 3; i++) head.add(x.tor(0.05, 0.012, 4, 12), { c: '#A9713F', m: 0.95, r: 0.32, pos: [0.24 + i * 0.07, 0.056, 0], rot: [0, J / 2, 0] });
        head.add(x.cyl(0.018, 0.04, 0.16, 8), { ...steel, pos: [-0.1, 0.18, -0.05] }); // mât à bobines
        for (let i = 0; i < 3; i++) head.add(x.cyl(0.05 - i * 0.012, 0.05 - i * 0.012, 0.012, 10), { c: '#A9713F', m: 0.95, r: 0.32, pos: [-0.1, 0.15 + i * 0.035, -0.05] });
        head.add(x.sph(0.026), { ...glow('#7FB2FF', 3), pos: [-0.1, 0.27, -0.05] });
        body.add(x.box(0.2, 0.03, 0.08), { ...glow('#7FB2FF', 0.8), pos: [-0.1, 0.25, 0] });
      },
    });
  },
  x_hover(c) {
    const body = new Zt(), fan = new Zt(), paint = hull(c[0]), trim = hull(c[1], 0.7);
    body.add(x.cap(0.12, 0.54, 10), { ...rubber, c: '#22242A', pos: [0, 0.1, 0], rot: [0, 0, J / 2], scl: [0.72, 1, 2.05] }); // jupe
    body.add(x.box(0.66, 0.08, 0.34), { ...paint, pos: [0, 0.21, 0] });
    body.add(x.box(0.18, 0.05, 0.32), { ...paint, pos: [0.36, 0.2, 0], rot: [0, 0, -0.3] });
    body.add(x.box(0.2, 0.09, 0.22), { ...trim, pos: [0.14, 0.29, 0] });
    body.add(x.box(0.01, 0.05, 0.19), { ...glass, pos: [0.245, 0.3, 0], rot: [0, 0, 0.3] });
    for (const z of [-0.16, 0.16]) {
      body.add(x.tor(0.07, 0.01, 4, 16), { ...trim, pos: [-0.27, 0.32, z], rot: [0, J / 2, 0] }); // carénage
      fan.add(x.cyl(0.066, 0.066, 0.005, 10), { c: '#2A2A2A', r: 0.6, pos: [-0.27, 0.32, z], rot: sideX });
      body.add(x.box(0.012, 0.13, 0.012), { ...steel, pos: [-0.27, 0.25, z] });
    }
    body.add(x.cyl(0.012, 0.016, 0.26, 7), { ...steel, pos: [0.36, 0.34, 0], rot: sideX });
    return [{ g: body.build() }, { g: fan.build() }];
  },
  x_quadri(c) {
    const body = new Zt(), rotors = [], paint = { c: c[0], m: 0.4, r: 0.5, cm: 1 }, trim = { c: c[1], m: 0.4, r: 0.55, cm: 0.6 };
    body.add(x.box(0.24, 0.07, 0.15), { ...paint });
    body.add(x.sph(0.048, 10, 8), { ...glass, pos: [0.1, -0.035, 0] });
    body.add(x.cyl(0.008, 0.008, 0.14, 5), { ...gunmetal, pos: [0.13, -0.07, 0], rot: sideX });
    for (const [px, pz] of [[0.2, 0.2], [0.2, -0.2], [-0.2, 0.2], [-0.2, -0.2]]) {
      body.add(x.box(Math.hypot(px, pz), 0.018, 0.022), { ...trim, pos: [px / 2, 0, pz / 2], rot: [0, -Math.atan2(pz, px), 0] });
      body.add(x.tor(0.095, 0.011, 4, 16), { ...trim, pos: [px, 0.012, pz], rot: [J / 2, 0, 0] }); // carénage
      const rotor = new Zt();
      rotor.add(x.sbox(0.17, 0.004, 0.02), { c: '#222', r: 0.6 });
      rotor.add(x.sbox(0.02, 0.004, 0.17), { c: '#222', r: 0.6 });
      rotors.push({ g: rotor.build(), anim: 'rotor', pos: [px, 0.022, pz] });
    }
    body.add(x.sph(0.008), { c: '#FF2020', e: 4, pos: [-0.12, 0.04, 0] });
    return [{ g: body.build() }, ...rotors];
  },
  x_autogire(c) {
    const body = new Zt(), rotor = new Zt(), prop = new Zt(), paint = { c: c[0], m: 0.38, r: 0.52, cm: 1 }, trim = { c: c[1], m: 0.38, r: 0.58, cm: 0.6 };
    body.add(x.cap(0.07, 0.26, 10), { ...paint, rot: [0, 0, J / 2], scl: [1, 1, 0.78] });
    body.add(x.sph(0.058, 10, 8), { ...glass, pos: [0.16, 0.024, 0], scl: [1.3, 0.8, 0.78] });
    for (const side of [-1, 1]) {
      body.add(x.cyl(0.01, 0.01, 0.4, 5), { ...steel, pos: [-0.3, 0.02, side * 0.05], rot: sideX }); // poutres
      body.add(x.cyl(0.024, 0.024, 0.012, 8), { ...rubber, pos: [0.02, -0.11, side * 0.1], rot: sideY() });
    }
    body.add(x.sbox(0.11, 0.1, 0.012), { ...trim, pos: [-0.5, 0.05, 0] });
    body.add(x.sbox(0.09, 0.012, 0.2), { ...trim, pos: [-0.5, 0.02, 0] });
    body.add(x.cyl(0.012, 0.018, 0.16, 7), { ...steel, pos: [-0.02, 0.15, 0] });
    for (let i = 0; i < 3; i++) rotor.add(x.sbox(0.42, 0.005, 0.03), { c: '#242526', m: 0.4, r: 0.6, pos: [0.21, 0, 0], mat: new D.Matrix4().makeRotationY((i / 3) * J * 2) });
    prop.add(x.sbox(0.012, 0.18, 0.018), { c: '#242526', r: 0.6 });
    prop.add(x.sbox(0.012, 0.018, 0.18), { c: '#242526', r: 0.6 });
    return [{ g: body.build() }, { g: rotor.build(), anim: 'rotor', pos: [-0.02, 0.23, 0] }, { g: prop.build(), anim: 'tail', pos: [-0.24, 0.02, 0] }];
  },
  x_intercepteur(c) {
    return Jo(['#6F7E8C', '#47525C'], { s: 0.86, jet: true, swept: true, span: 0.6, fin: 0.2, fat: 0.85 });
  },
};
{
  const originalUnit = jlRaw;
  jlRaw = (type, colors) => (newUnits[type] ? newUnits[type](colors) : originalUnit(type, colors));
}
