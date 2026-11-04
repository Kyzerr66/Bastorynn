// Calculs faits une seule fois à la création de la carte : ils évitent un coût à chaque pixel, à chaque image.

// Même répartition des territoires que le moteur : index du secteur et distance à sa frontière.
function bakeSectors(seeds, warp, span, pad) {
  const size = 512, total = span + pad * 2, index = new Uint8Array(size * size), edge = new Uint8Array(size * size);
  const xs = seeds.map((s) => s.x), ys = seeds.map((s) => s.y), count = seeds.length;
  for (let row = 0; row < size; row++) {
    const py = ((row + 0.5) / size) * total - pad;
    for (let col = 0; col < size; col++) {
      const px = ((col + 0.5) / size) * total - pad;
      let wx = px, wy = py;
      if (warp >= 0) {
        wx = px + 1.3 * (Math.sin(py * 0.37 + warp) + 0.5 * Math.sin(px * 0.91 + warp * 1.7));
        wy = py + 1.3 * (Math.cos(px * 0.33 + warp * 0.6) + 0.5 * Math.cos(py * 0.83 + warp * 2.3));
      }
      let first = 1e18, second = 1e18, nearest = 0;
      for (let i = 0; i < count; i++) {
        const dx = wx - xs[i], dy = wy - ys[i], d = dx * dx + dy * dy;
        if (d < first) { second = first; first = d; nearest = i; } else if (d < second) second = d;
      }
      index[row * size + col] = nearest;
      edge[row * size + col] = Math.min(255, ((Math.sqrt(second) - Math.sqrt(first)) / 4) * 255);
    }
  }
  const texture = (data, filter) => {
    const t = new D.DataTexture(data, size, size, D.RedFormat, D.UnsignedByteType);
    t.minFilter = t.magFilter = filter;
    t.wrapS = t.wrapT = D.ClampToEdgeWrapping;
    t.needsUpdate = true;
    return t;
  };
  return { index: texture(index, D.NearestFilter), edge: texture(edge, D.LinearFilter) };
}

const terrainNoise = (x, y) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  return (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) + (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v;
};

// Taches d'herbe sèche, sous-bois sombres et grain : le sol cesse d'être un aplat.
function enrichTerrainColors(positions, colors, biome) {
  const dry = new D.Color(biome.sand).convertSRGBToLinear();
  for (let i = 0; i < colors.length; i += 3) {
    const px = positions[i], h = positions[i + 1], pz = positions[i + 2];
    if (h < 0.12) continue;
    const broad = terrainNoise(px * 0.16, pz * 0.16), medium = terrainNoise(px * 0.55 + 40, pz * 0.55), fine = terrainNoise(px * 2.1, pz * 2.1 + 70);
    const shade = 0.84 + broad * 0.18 + medium * 0.1 + fine * 0.05;
    const dryness = Math.max(0, Math.min(1, (medium * 0.6 + broad * 0.6 - 0.68) * 4)) * 0.14;
    for (let k = 0; k < 3; k++) {
      const base = colors[i + k] * shade;
      colors[i + k] = base * (1 - dryness) + dry.toArray()[k] * shade * 0.8 * dryness;
    }
  }
}
