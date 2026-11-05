"""Apply identification colors to armor panels across the defense catalog."""
import base64
import json
from pathlib import Path
import zlib

COLORS = {
    'gatling':'#a57a34', 'canon':'#a7503a', 'mortar':'#80683c',
    'cryo':'#287e9c', 'tesla':'#7753a2', 'flame':'#bf5828',
    'acid':'#67912f', 'laser':'#bd438e', 'rail':'#4764af',
    'missile':'#a23938', 'pulse':'#b38329', 'relay':'#268262',
    'forge':'#a75235', 'radar':'#367b83', 'void':'#694291',
    'sniper':'#486987', 'flak':'#9b8136', 'mine':'#7c444e',
    'drone':'#317d64', 'mlrs':'#b15e30', 'emp':'#465bac',
    'gas':'#888638', 'orbital':'#7d569b', 'antitank':'#93364a',
    'lourde':'#427380', 'obusier':'#856642', 'phalanx':'#397599',
    'napalm':'#ae412b', 'sonic':'#337e82', 'harpon':'#3b617f',
    'plasma':'#466ec5', 'sentry':'#527359', 'frostbattery':'#548da5',
    'ionlance':'#496cac', 'skyguard':'#456485', 'siege':'#885844',
}
ARMOR = {'#7c8e6f', '#536148'}
path = Path(__file__).resolve().parents[1] / 'src/models/citadelles-pack.js'
source = path.read_text(encoding='utf8')
archive = json.loads(zlib.decompress(base64.b64decode(json.loads(source.split('=',1)[1].strip().rstrip(';')))))
palette = archive['palette']
neutral = {i for i, color in enumerate(palette) if color in ARMOR}
assert set(COLORS) == set(archive['towers']), 'Defense color map must cover the full catalog'
for family, levels in archive['towers'].items():
    color = COLORS[family]
    if color not in palette:
        palette.append(color)
    armor_id = palette.index(color)
    for model in levels.values():
        for part in model['parts'].values():
            if part:
                part['m'] = [armor_id if material in neutral else material for material in part['m']]
raw = json.dumps(archive, separators=(',',':')).encode()
encoded = json.dumps(base64.b64encode(zlib.compress(raw,9)).decode())
path.write_text(f'window.BastorynnAssetArchive={encoded};\n', encoding='utf8')
print(f'{len(COLORS)} identifications de blindage · {path.stat().st_size:,} octets')
