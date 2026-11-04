'use strict';
// Construit le jeu depuis src/ vers dist/ (servi par server.cjs), index.html + assets/ (mode fichier)
// et simulation.js (moteur du serveur). Commande : npm run build
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const src = (...p) => path.join(root, 'src', ...p);
const read = (...p) => fs.readFileSync(src(...p), 'utf8');

// /*@include fichier*/ insère un fichier de src/ : même contenu pour le client et le serveur.
function includes(text) {
  return text.replace(/\/\*@include ([\w./-]+)\*\//g, (_, file) => includes(read(file)));
}

function hashed(name, ext, content) {
  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
  return { file: `${name}.${hash}.${ext}`, content };
}

function audioPack(file) {
  return `window.__bastorynnAudio&&window.__bastorynnAudio(${read('audio', file)});`;
}

function build() {
  const assets = [];
  const add = (asset) => { assets.push(asset); return asset.file; };

  const fontFiles = fs.readdirSync(src('fonts')).filter((f) => f.endsWith('.woff2'));
  const fontNames = {};
  for (const f of fontFiles) fontNames[f] = add(hashed(f.replace('.woff2', ''), 'woff2', fs.readFileSync(src('fonts', f))));

  const uiFiles = fs.existsSync(src('ui')) ? fs.readdirSync(src('ui')).filter((f) => f.endsWith('.css')).sort() : [];
  const css = [read('base.css'), ...uiFiles.map((f) => read('ui', f))].join('\n')
    .replace(/url\(__FONT_([\w.-]+)__\)/g, (_, f) => `url(${fontNames[f]})`);
  const cssFile = add(hashed('app', 'css', css));

  const sfxFile = add(hashed('audio-sfx', 'js', audioPack('sfx.json')));
  const musicFile = add(hashed('audio-music', 'js', audioPack('music.json')));

  const r3File = add(hashed('r3', 'js', includes(read('r3-bundle.js'))));
  const engine = includes(read('engine.js'))
    .replace('__AUDIO_SFX_FILE__', sfxFile)
    .replace('__AUDIO_MUSIC_FILE__', musicFile);
  const engineFile = add(hashed('engine', 'js', engine));

  const scripts = [r3File, engineFile].map((f) => `<script src="assets/${f}"></script>`).join('\n');
  const html = read('template.html')
    .replace('<!--STYLES-->', `<link rel="preload" href="assets/${fontNames[fontFiles[0]]}" as="font" type="font/woff2" crossorigin>\n<link rel="stylesheet" href="assets/${cssFile}">`)
    .replace('<!--SCRIPTS-->', scripts);

  const simulation = includes(read('simulation.js'));

  for (const dir of [path.join(root, 'assets'), path.join(root, 'dist', 'assets')]) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    for (const a of assets) fs.writeFileSync(path.join(dir, a.file), a.content);
  }
  fs.writeFileSync(path.join(root, 'index.html'), html);
  fs.writeFileSync(path.join(root, 'dist', 'index.html'), html);
  fs.writeFileSync(path.join(root, 'simulation.js'), simulation);

  const total = assets.reduce((n, a) => n + Buffer.byteLength(a.content), 0) + Buffer.byteLength(html);
  return { files: assets.map((a) => [a.file, Buffer.byteLength(a.content)]), html: Buffer.byteLength(html), total };
}

if (require.main === module) {
  const report = build();
  for (const [f, n] of report.files) console.log(`${String(Math.round(n / 1024)).padStart(6)} Ko  ${f}`);
  console.log(`${String(Math.round(report.html / 1024)).padStart(6)} Ko  index.html`);
  console.log(`Total ${(report.total / 1048576).toFixed(2)} Mo`);
}

module.exports = { build };
