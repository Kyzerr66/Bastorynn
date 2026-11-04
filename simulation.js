const RAR = ['commune', 'rare', 'epique', 'legendaire', 'mythique'];
const R = {
  commune: { label: 'Commune', color: '#B4BCCB', glow: '#8E9AB0', w: 60, drop: 64, gems: 1, price: 40, supply: 999 },
  rare: { label: 'Rare', color: '#3DA2FF', glow: '#1F7BFF', w: 26, drop: 26, gems: 2, price: 140, supply: 60 },
  epique: { label: 'Épique', color: '#B06BFF', glow: '#8A3FFC', w: 11, drop: 8.5, gems: 3, price: 420, supply: 15 },
  legendaire: { label: 'Légendaire', color: '#FFB524', glow: '#FF8A00', w: 3, drop: 1.5, gems: 4, price: 1300, supply: 4 },
  mythique: { label: 'Mythique', color: '#FF6BE8', glow: '#C13BFF', w: 1, drop: 0.28, gems: 5, price: 4200, supply: 1 },
};
const RI = (r) => RAR.indexOf(r);
// puissance par rareté : dégâts, portée, cadence
const RMUL = { dmg: [1, 1.24, 1.53, 1.90, 2.40], rng: [1, 1.04, 1.08, 1.12, 1.20], rate: [1, 1.04, 1.08, 1.14, 1.22] };

// kind : comportement moteur. air : peut viser les volants. dt : type de dégâts
const FAM = {
  gatling: { n: 'Mitrailleuse', role: 'Tirs rapides', kind: 'bullet', dt: 'phys', cost: 50, dmg: 5, rate: 0.32, range: 2.4, air: true, c: '#FFD166', desc: 'Rafales continues. Idéale contre l\'infanterie et les drones.' },
  canon: { n: 'Canon', role: 'Gros calibre', kind: 'bullet', dt: 'phys', cost: 80, dmg: 30, rate: 1.25, range: 2.6, splash: 0.35, air: false, c: '#FF8A5B', desc: 'Obus lourds avec petit éclat. Fait mal aux unités costaudes.' },
  mortar: { n: 'Mortier', role: 'Artillerie de zone', kind: 'shell', dt: 'phys', cost: 110, dmg: 34, rate: 2.2, range: 3.8, splash: 1.0, pierce: 0.5, air: false, c: '#F4A261', desc: 'Pilonne les groupes de loin. Ignore la moitié du blindage. Ne touche pas les aériens.' },
  cryo: { n: 'Cryo', role: 'Ralentissement', kind: 'bullet', dt: 'energy', cost: 70, dmg: 3, rate: 0.85, range: 2.3, air: true, slow: { p: 0.4, d: 1.8 }, c: '#7FDBFF', desc: 'Ralentit les ennemis touchés de 40 %. Donne du temps aux autres tours.' },
  tesla: { n: 'Tesla', role: 'Arcs en chaîne', kind: 'chain', dt: 'energy', cost: 100, dmg: 15, rate: 1.1, range: 2.3, chains: 2, air: true, c: '#9D8CFF', desc: 'L\'éclair rebondit sur plusieurs ennemis. Double dégâts sur les boucliers et les blindés anti-émeute.' },
  flame: { n: 'Lance-flammes', role: 'Brûlure en cône', kind: 'cone', dt: 'fire', cost: 75, dmg: 3, rate: 0.14, range: 1.7, burn: 0.6, air: false, c: '#FF5D3A', desc: 'Arrose un cône de feu et enflamme. La brûlure traverse le blindage.' },
  acid: { n: 'Acide', role: 'Flaques corrosives', kind: 'puddle', dt: 'acid', cost: 90, dmg: 9, rate: 2.4, range: 2.6, splash: 0.75, dur: 3.2, air: false, c: '#9BE564', desc: 'Crée une flaque qui ronge tout ce qui passe, blindage compris.' },
  laser: { n: 'Laser', role: 'Faisceau continu', kind: 'beam', dt: 'energy', cost: 120, dmg: 16, rate: 0, range: 2.5, ramp: 2, pierce: 0.5, air: true, c: '#FF4FD8', desc: 'Faisceau dont la puissance monte tant qu\'il reste sur la même cible.' },
  rail: { n: 'Railgun', role: 'Perce-ligne', kind: 'line', dt: 'true', cost: 150, dmg: 75, rate: 2.6, range: 4.6, air: true, c: '#C3B1FF', desc: 'Traverse tous les ennemis alignés et ignore le blindage. Très longue portée.' },
  missile: { n: 'Lance-missiles', role: 'Anti-aérien', kind: 'missile', dt: 'phys', cost: 140, dmg: 17, rate: 1.9, range: 3.3, splash: 0.35, salvo: 2, air: true, airBonus: 1.6, c: '#FF6B6B', desc: 'Salves de missiles à tête chercheuse. +60 % de dégâts contre les aériens.' },
  pulse: { n: 'Onde de choc', role: 'Impulsion de zone', kind: 'pulse', dt: 'energy', cost: 95, dmg: 16, rate: 1.7, range: 1.5, air: false, c: '#FFE066', desc: 'Frappe tout autour d\'elle à chaque impulsion et dissipe les fumigènes.' },
  relay: { n: 'Relais', role: 'Soutien', kind: 'aura', dt: 'none', cost: 90, dmg: 0, rate: 0, range: 1.6, buffRate: 0.15, air: false, c: '#2EE6A8', desc: 'Accélère les tours voisines. Plusieurs relais ne se cumulent pas.' },
  forge: { n: 'Forge', role: 'Économie', kind: 'eco', dt: 'none', cost: 80, dmg: 0, rate: 0, range: 1.4, income: 18, air: false, c: '#FFC94D', desc: 'Produit de l\'énergie à chaque fin de vague. Plus elle est rare, plus elle rapporte.' },
  radar: { n: 'Radar', role: 'Détection', kind: 'radar', dt: 'none', cost: 60, dmg: 0, rate: 0, range: 2.4, mark: 0.1, air: false, c: '#5CE1E6', desc: 'Révèle les commandos camouflés et les fumigènes et fait subir +10 % de dégâts aux ennemis détectés.' },
  void: { n: 'Singularité', role: 'Contrôle gravitationnel', kind: 'gravity', dt: 'energy', cost: 160, dmg: 24, rate: 3.2, range: 1.9, pull: 0.9, air: false, c: '#B36BFF', desc: 'Aspire les ennemis proches en arrière sur leur route et les écrase.' },
  sniper: { n: 'Tireur d\'élite', role: 'Très longue portée', kind: 'bullet', dt: 'phys', cost: 95, dmg: 40, rate: 2.0, range: 4.4, pierce: 0.3, crit: { c: 0.15, m: 2 }, air: true, prefer: 'strong', c: '#D9C7A0', desc: 'Un tir précis à très longue portée. Vise d\'abord les ennemis les plus résistants.' },
  flak: { n: 'DCA', role: 'Anti-aérien lourd', kind: 'flak', dt: 'phys', cost: 105, dmg: 22, rate: 0.85, range: 3.8, splash: 0.85, air: true, airOnly: true, c: '#9FB4C8', desc: 'Obus à fragmentation qui éclatent dans le ciel. Ne vise que les aériens, mais les déchiquette.' },
  mine: { n: 'Poseur de mines', role: 'Pièges sur la route', kind: 'mine', dt: 'phys', cost: 85, dmg: 70, rate: 2.4, range: 2.3, splash: 0.65, max: 4, air: false, c: '#C8A060', desc: 'Enterre des mines sur la route. Elles explosent au passage des troupes au sol.' },
  drone: { n: 'Nid de drones', role: 'Essaim chasseur', kind: 'missile', dt: 'phys', cost: 115, dmg: 8, rate: 1.3, range: 3.9, salvo: 4, splash: 0, air: true, c: '#7FE0C0', desc: 'Lâche des micro-drones qui poursuivent leurs cibles, au sol comme dans les airs.' },
  mlrs: { n: 'Lance-roquettes multiple', role: 'Barrage d\'artillerie', kind: 'shell', dt: 'phys', cost: 150, dmg: 22, rate: 4.2, range: 5.4, splash: 0.7, split: 5, pierce: 0.3, air: false, c: '#E07A4A', desc: 'Une salve de roquettes qui couvre toute une zone, de très loin. Rechargement lent.' },
  emp: { n: 'Canon IEM', role: 'Neutralisation', kind: 'pulse', dt: 'energy', cost: 120, dmg: 10, rate: 2.4, range: 1.9, shieldMul: 3, vehStun: { c: 0.55, d: 1.2 }, air: true, c: '#6FA8FF', desc: 'Impulsion électromagnétique : pulvérise les boucliers et paralyse véhicules et drones.' },
  gas: { n: 'Gaz incapacitant', role: 'Anti-infanterie', kind: 'puddle', dt: 'acid', cost: 90, dmg: 6, rate: 2.6, range: 2.8, splash: 1.0, dur: 3.6, infMul: 2.2, vehMul: 0.5, slow: { p: 0.35, d: 1 }, air: false, c: '#C8D86A', desc: 'Un nuage qui ralentit l\'infanterie et lui inflige le double de dégâts. Peu efficace contre les blindés.' },
  orbital: { n: 'Satellite d\'attaque', role: 'Frappe lointaine', kind: 'orbital', dt: 'true', cost: 180, dmg: 150, rate: 6.5, range: 40, splash: 0.8, air: true, c: '#FFD8A0', desc: 'Frappe depuis l\'orbite l\'ennemi le plus dangereux, entre 10 et 40 mètres. Protège sa zone morte avec des défenses rapprochées.' },
  antitank: { n: 'Missile antichar', role: 'Tueur de blindés', kind: 'missile', dt: 'phys', cost: 130, dmg: 70, rate: 2.8, range: 3.7, salvo: 1, splash: 0.2, pierce: 0.6, vehMul: 2, infMul: 0.4, prefer: 'veh', air: false, c: '#B8C060', desc: 'Un missile filoguidé qui perce les blindages : double dégâts contre les véhicules.' },
  lourde: { n: 'Mitrailleuse lourde', role: 'Perce-blindage', kind: 'bullet', dt: 'phys', cost: 85, dmg: 13, rate: 0.48, range: 2.8, pierce: 0.35, air: true, c: '#E8C060', desc: 'Calibre .50 : des rafales qui traversent les blindages légers et touchent les volants.' },
  obusier: { n: 'Obusier lourd', role: 'Artillerie lointaine', kind: 'shell', dt: 'phys', cost: 170, dmg: 62, rate: 3.6, range: 6.2, splash: 0.9, air: false, c: '#C89060', desc: 'Des obus de 155 mm tirés de très loin. Lent, mais chaque impact dévaste une zone entière.' },
  phalanx: { n: 'Défense rapprochée', role: 'Bouclier anti-aérien', kind: 'bullet', dt: 'phys', cost: 110, dmg: 4, rate: 0.08, range: 3.0, air: true, airOnly: true, airBonus: 1.2, c: '#D0E0F0', desc: 'Un canon rotatif radar qui crache un mur de balles sur tout ce qui vole. Ignore le sol.' },
  napalm: { n: 'Lance-napalm', role: 'Zone incendiaire', kind: 'puddle', dt: 'acid', cost: 120, dmg: 8, rate: 3.0, range: 3.1, splash: 0.95, dur: 3.2, burn: 0.7, infMul: 1.5, air: false, c: '#FF7A2A', desc: 'Des bidons de napalm qui embrasent le sol : tout ce qui passe brûle.' },
  sonic: { n: 'Canon sonique', role: 'Étourdissement', kind: 'pulse', dt: 'energy', cost: 115, dmg: 13, rate: 2.0, range: 2.0, air: false, c: '#9FE8D0', desc: 'Une onde de choc acoustique qui assomme l\'infanterie et fait vibrer les blindés.' },
  harpon: { n: 'Lance-harpons', role: 'Anti-navire', kind: 'bullet', dt: 'phys', cost: 105, dmg: 48, rate: 1.9, range: 3.5, pierce: 0.2, boatMul: 2.6, vehMul: 1.3, infMul: 0.6, prefer: 'veh', air: false, c: '#5AA0C8', desc: 'Des harpons explosifs : redoutables contre bateaux et aéroglisseurs, efficaces contre les blindés.' },
  plasma: { n: 'Canon à plasma', role: 'Projectile perforant', kind: 'plasma', dt: 'energy', cost: 160, dmg: 46, rate: 2.3, range: 3.9, burn: 0.3, air: false, c: '#5CF0FF', desc: 'Une boule de plasma lente qui traverse et brûle tout ce qu\'elle touche sur sa route.' },
};
// Five specialized defenses, using the existing deterministic combat behaviors.
Object.assign(FAM, {
  sentry: { n:'Guetteur', role:'Défense économique', kind:'bullet', dt:'phys', cost:35, dmg:3, rate:.3, range:2.1, air:true, c:'#A4D59A', desc:'Petit canon automatique à bas coût. Efficace en début de partie, mais faible contre les blindages.' },
  frostbattery: { n:'Batterie boréale', role:'Artillerie ralentissante', kind:'shell', dt:'energy', cost:135, dmg:20, rate:2.7, range:4.1, splash:.85, slow:{p:.35,d:1.5}, air:false, c:'#87DDF3', desc:'Un obus cryogénique ralentit de 35 % les groupes au sol. Moins de dégâts bruts qu’un mortier classique.' },
  ionlance: { n:'Lance ionique', role:'Brise-bouclier précis', kind:'bullet', dt:'energy', cost:115, dmg:27, rate:1.2, range:3.2, shieldMul:1.5, pierce:.35, air:true, c:'#7DB9FF', desc:'Tirs ionisés sur une cible : triple efficacité contre les boucliers. Ignore 35 % du blindage.' },
  skyguard: { n:'Garde-ciel', role:'DCA de zone', kind:'flak', dt:'phys', cost:125, dmg:32, rate:.95, range:4.3, splash:.9, air:true, airOnly:true, c:'#AFC2E8', desc:'Batterie à fragmentation longue portée. Frappe les groupes aériens mais ne peut pas viser le sol.' },
  siege: { n:'Briseur de siège', role:'Impact lourd à recharge lente', kind:'shell', dt:'phys', cost:220, dmg:125, rate:5.2, range:6.3, splash:1.2, pierce:.6, air:false, c:'#E7AA78', desc:'Un énorme obus contre les groupes au sol, avec 60 % de pénétration. Puissant mais coûteux et lent : protège-le avec des tirs rapides.' }
});
const DEFENSE_MODEL_ALIASES = {sentry:'gatling',frostbattery:'mortar',ionlance:'tesla',skyguard:'flak',siege:'obusier'};
const MAX_DECK = 6;
const EXPANSION_CARDS = ['sentry_0','frostbattery_0','ionlance_0','skyguard_0','siege_0'];
const FAM_ORDER = Object.keys(FAM);

// 5 cartes par famille : [nom, rareté, traits, accroche]
const CARD_DEF = {
  gatling: [
    ['Sentinelle M1', 'commune', {}, 'La vieille fidèle des avant-postes.'],
    ['Vulcain', 'rare', { rateMul: 1.15 }, 'Canons rotatifs refroidis à l\'azote.'],
    ['Hydre à six canons', 'epique', { multishot: 2 }, 'Deux cibles, zéro répit.'],
    ['Tempête d\'acier', 'legendaire', { multishot: 2, crit: { c: 0.18, m: 2.5 } }, 'Un mur de plomb qui ne s\'arrête jamais.'],
    ['Ragnarök', 'mythique', { multishot: 3, burn: 0.5, crit: { c: 0.22, m: 3 } }, 'Balles incendiaires forgées dans un soleil mourant.'],
  ],
  canon: [
    ['Bombarde', 'commune', {}, 'Lourde, lente, mais elle convainc.'],
    ['Brise-murs', 'rare', { pierce: 0.35 }, 'Conçue pour percer les carapaces.'],
    ['Mâchoire de fer', 'epique', { splash: 0.35, stun: { c: 0.12, d: 0.6 } }, 'Chaque impact fait trembler le sol.'],
    ['Dernier mot', 'legendaire', { execute: 0.12, pierce: 0.5 }, 'Achève tout ce qui vacille.'],
    ['Jugement', 'mythique', { splash: 0.8, stun: { c: 0.25, d: 1 }, pierce: 0.6 }, 'Le verdict tombe du ciel.'],
  ],
  mortar: [
    ['Pilon', 'commune', {}, 'Un tube, un obus, un cratère.'],
    ['Grêle', 'rare', { splash: 0.3 }, 'Des éclats sur toute la route.'],
    ['Fragmentation', 'epique', { split: 3 }, 'L\'obus se divise en trois charges.'],
    ['Pluie de feu', 'legendaire', { split: 4, burn: 0.5 }, 'Le ciel brûle pendant des heures.'],
    ['Apocalypse', 'mythique', { split: 6, burn: 0.8, splash: 0.5 }, 'Il ne reste que des cendres.'],
  ],
  cryo: [
    ['Givre', 'commune', {}, 'Un souffle glacé sur la route.'],
    ['Blizzard', 'rare', { multishot: 2 }, 'Deux cibles gelées à la fois.'],
    ['Zéro absolu', 'epique', { freeze: { c: 0.12, d: 1.2 } }, 'Parfois, tout s\'arrête.'],
    ['Cœur d\'hiver', 'legendaire', { multishot: 3, freeze: { c: 0.16, d: 1.5 } }, 'L\'hiver ne finit jamais ici.'],
    ['Ère glaciaire', 'mythique', { multishot: 5, freeze: { c: 0.25, d: 2 }, shatter: 0.6 }, 'Les ennemis gelés volent en éclats.'],
  ],
  tesla: [
    ['Bobine', 'commune', {}, 'Un arc qui saute d\'un ennemi à l\'autre.'],
    ['Arc voltaïque', 'rare', { chains: 1 }, 'Un rebond de plus, toujours.'],
    ['Orage', 'epique', { chains: 2, stun: { c: 0.1, d: 0.4 } }, 'La foudre paralyse.'],
    ['Fureur de Zeus', 'legendaire', { chains: 4, crit: { c: 0.15, m: 2 } }, 'Le tonnerre a choisi son camp.'],
    ['Singularité électrique', 'mythique', { chains: 8, stun: { c: 0.2, d: 0.6 }, noDecay: true }, 'L\'arc ne faiblit jamais.'],
  ],
  flame: [
    ['Brasier', 'commune', {}, 'Une flamme courte mais têtue.'],
    ['Fournaise', 'rare', { burn: 0.5 }, 'Le feu colle à la peau.'],
    ['Souffle du dragon', 'epique', { rangeMul: 1.25, burn: 0.8 }, 'Un cône qui dévore tout.'],
    ['Phénix', 'legendaire', { burn: 1.4, air: true }, 'Ses flammes atteignent les aériens.'],
    ['Soleil noir', 'mythique', { burn: 2.4, air: true, rangeMul: 1.4, melt: 0.15 }, 'Fait fondre jusqu\'aux blindages.'],
  ],
  acid: [
    ['Flaque', 'commune', {}, 'Ça ronge, lentement mais sûrement.'],
    ['Marée verte', 'rare', { splash: 0.3 }, 'Une flaque plus large.'],
    ['Corrosion', 'epique', { mark: 0.15 }, 'Les ennemis rongés subissent +15 % de dégâts.'],
    ['Peste', 'legendaire', { splash: 0.5, mark: 0.25, slow: { p: 0.25, d: 1 } }, 'Ralentit et affaiblit tout ce qui passe.'],
    ['Gouffre toxique', 'mythique', { splash: 0.9, mark: 0.35, slow: { p: 0.35, d: 1 } }, 'Rien ne traverse ce marais.'],
  ],
  laser: [
    ['Faisceau', 'commune', {}, 'Une ligne de lumière brûlante.'],
    ['Prisme', 'rare', { ramp: 1 }, 'La puissance monte encore plus vite.'],
    ['Lame de lumière', 'epique', { beams: 2 }, 'Deux faisceaux, deux cibles.'],
    ['Rayon céleste', 'legendaire', { ramp: 2, beams: 2 }, 'Un rayon tombé des étoiles.'],
    ['Lance d\'Hélios', 'mythique', { ramp: 3, beams: 3, burn: 0.5 }, 'La lumière qui consume.'],
  ],
  rail: [
    ['Aiguille', 'commune', {}, 'Un trait de lumière, une ligne de morts.'],
    ['Perce-ciel', 'rare', { rangeMul: 1.2 }, 'Touche ce que personne ne voit.'],
    ['Couperet', 'epique', { execute: 0.1 }, 'Achève les ennemis sous 10 % de vie.'],
    ['Œil du faucon', 'legendaire', { crit: { c: 0.3, m: 2.5 }, rangeMul: 1.3 }, 'Ne rate jamais un point faible.'],
    ['Fin des temps', 'mythique', { crit: { c: 0.4, m: 3 }, execute: 0.15, rateMul: 1.3 }, 'Le dernier tir de l\'univers.'],
  ],
  missile: [
    ['Guêpe', 'commune', {}, 'Deux missiles qui ne lâchent pas leur cible.'],
    ['Essaim de feu', 'rare', { salvo: 1, rateMul: 0.9 }, 'Un missile de plus par salve, rechargement plus lent.'],
    ['Faucheuse', 'epique', { salvo: 1, splash: 0.2 }, 'Des explosions en cascade.'],
    ['Chasseur stellaire', 'legendaire', { salvo: 2, burn: 0.3 }, 'Aucun hélicoptère ne passe.'],
    ['Armageddon', 'mythique', { salvo: 3, splash: 0.4, burn: 0.5 }, 'Le ciel devient un brasier.'],
  ],
  pulse: [
    ['Tambour', 'commune', {}, 'Boum. Et encore boum.'],
    ['Séisme', 'rare', { rangeMul: 1.2 }, 'L\'onde porte plus loin.'],
    ['Marteau tellurique', 'epique', { stun: { c: 0.2, d: 0.7 } }, 'Assomme ce qu\'il frappe.'],
    ['Colère du titan', 'legendaire', { stun: { c: 0.3, d: 0.9 }, knock: 0.35 }, 'Repousse les ennemis en arrière.'],
    ['Big Bang', 'mythique', { stun: { c: 0.4, d: 1.2 }, knock: 0.7, rangeMul: 1.3 }, 'Tout recommence à zéro.'],
  ],
  relay: [
    ['Antenne', 'commune', {}, '+15 % de cadence aux tours voisines.'],
    ['Amplificateur', 'rare', { buffDmg: 0.1 }, 'Ajoute +10 % de dégâts.'],
    ['Nexus', 'epique', { buffDmg: 0.15, buffRange: 0.1 }, 'Les tours voisines voient plus loin.'],
    ['Cœur du réseau', 'legendaire', { buffDmg: 0.25, buffRange: 0.12, buffCrit: 0.1 }, 'Donne des coups critiques aux voisines.'],
    ['Conscience collective', 'mythique', { buffDmg: 0.4, buffRange: 0.15, buffCrit: 0.15 }, 'Toutes les tours ne font plus qu\'une.'],
  ],
  forge: [
    ['Atelier', 'commune', {}, '+18 énergie à chaque fin de vague.'],
    ['Raffinerie', 'rare', {}, 'Rapporte davantage à chaque vague.'],
    ['Fonderie', 'epique', { bounty: 1 }, '+1 énergie par ennemi abattu à proximité.'],
    ['Mine d\'or', 'legendaire', { bounty: 2 }, 'Chaque victoire paie.'],
    ['Midas', 'mythique', { bounty: 3, interest: 0.05 }, 'Et 5 % d\'intérêts sur ton énergie.'],
  ],
  radar: [
    ['Vigie', 'commune', {}, 'Voit les commandos. +10 % de dégâts subis.'],
    ['Sonar', 'rare', { rangeMul: 1.2 }, 'Une détection plus large.'],
    ['Œil de lynx', 'epique', { mark: 0.2 }, 'Les ennemis repérés subissent +20 %.'],
    ['Satellite', 'legendaire', { mark: 0.25, rangeMul: 1.5 }, 'Rien n\'échappe à l\'orbite.'],
    ['Omniscience', 'mythique', { mark: 0.35, rangeMul: 9 }, 'Révèle et marque toute la carte.'],
  ],
  void: [
    ['Puits', 'commune', {}, 'Un petit trou dans l\'espace.'],
    ['Distorsion', 'rare', { pull: 0.4 }, 'Aspire plus loin en arrière.'],
    ['Horizon', 'epique', { pull: 0.5, slow: { p: 0.3, d: 1.5 } }, 'Le temps ralentit près du bord.'],
    ['Trou noir', 'legendaire', { pull: 0.9, rangeMul: 1.25 }, 'Même la lumière hésite.'],
    ['Néant absolu', 'mythique', { pull: 1.4, rangeMul: 1.4, execute: 0.1 }, 'Ce qui entre n\'existe plus.'],
  ],
  sniper: [
    ['Œil de lynx', 'commune', {}, 'Un fusil, une lunette, de la patience.'],
    ['Longue-vue', 'rare', { rangeMul: 1.2 }, 'Voit plus loin que tout le monde.'],
    ['Silence mortel', 'epique', { execute: 0.12 }, 'Achève tout ce qui vacille.'],
    ['Faucon noir', 'legendaire', { crit: { c: 0.35, m: 2.6 }, rateMul: 1.2 }, 'Une balle, un ennemi.'],
    ['Juge des cimes', 'mythique', { crit: { c: 0.45, m: 3 }, multishot: 2, execute: 0.15 }, 'Deux cibles à la fois, à l\'autre bout de la carte.'],
  ],
  flak: [
    ['Bofors', 'commune', {}, 'Le vieux canon antiaérien qui ne rate pas.'],
    ['Ciel de fer', 'rare', { splash: 0.3 }, 'Des éclats sur une zone plus large.'],
    ['Rideau d\'acier', 'epique', { multishot: 2 }, 'Deux cibles à chaque rafale.'],
    ['Gardien du ciel', 'legendaire', { multishot: 2, rateMul: 1.3, burn: 0.4 }, 'Les aériens tombent en flammes.'],
    ['Égide', 'mythique', { multishot: 3, rateMul: 1.5, splash: 0.5, stun: { c: 0.25, d: 1 } }, 'Rien ne vole au-dessus d\'elle.'],
  ],
  mine: [
    ['Champ de mines', 'commune', {}, 'Patience et explosif.'],
    ['Mines bondissantes', 'rare', { splash: 0.3 }, 'Elles sautent avant d\'exploser.'],
    ['Mines à fragmentation', 'epique', { split: 3 }, 'Chaque mine en libère trois autres.'],
    ['Mines thermobariques', 'legendaire', { burn: 0.6, splash: 0.5, maxAdd: 2 }, 'La route prend feu.'],
    ['Terre brûlée', 'mythique', { burn: 1, splash: 0.8, maxAdd: 4, stun: { c: 0.4, d: 1 } }, 'Rien ne traverse.'],
  ],
  drone: [
    ['Essaim', 'commune', {}, 'Quatre petits drones affamés.'],
    ['Frelons', 'rare', { salvo: 1 }, 'Un drone de plus par salve.'],
    ['Nuée de combat', 'epique', { salvo: 2, rateMul: 1.15 }, 'Le ciel bourdonne.'],
    ['Meute autonome', 'legendaire', { salvo: 3, crit: { c: 0.2, m: 2 } }, 'Ils choisissent seuls leurs proies.'],
    ['Ruche', 'mythique', { salvo: 6, burn: 0.4, rateMul: 1.3 }, 'Une colonne entière de drones.'],
  ],
  mlrs: [
    ['Katioucha', 'commune', {}, 'Les orgues de la guerre.'],
    ['Pluie d\'acier', 'rare', { split: 1 }, 'Une roquette de plus par salve.'],
    ['Tempête de feu', 'epique', { split: 2, burn: 0.4 }, 'La zone brûle longtemps.'],
    ['Marteau du ciel', 'legendaire', { split: 3, splash: 0.3, rateMul: 1.2 }, 'Tout un secteur rasé.'],
    ['Fin du monde', 'mythique', { split: 6, splash: 0.4, burn: 0.8, rateMul: 1.35 }, 'Il ne reste rien.'],
  ],
  emp: [
    ['Bobine IEM', 'commune', {}, 'Coupe le courant.'],
    ['Surtension', 'rare', { rangeMul: 1.2 }, 'Une onde plus large.'],
    ['Black-out', 'epique', { vehStun: { c: 0.75, d: 1.6 } }, 'Les moteurs s\'arrêtent net.'],
    ['Tempête solaire', 'legendaire', { rangeMul: 1.3, mark: 0.2 }, 'Les ennemis touchés subissent +20 % de dégâts.'],
    ['Nuit électronique', 'mythique', { rangeMul: 1.5, mark: 0.3, vehStun: { c: 0.9, d: 2 } }, 'Plus aucune machine ne fonctionne.'],
  ],
  gas: [
    ['Lacrymogène', 'commune', {}, 'Les yeux pleurent, les jambes ralentissent.'],
    ['Brouillard jaune', 'rare', { splash: 0.3 }, 'Un nuage plus large.'],
    ['Suffocant', 'epique', { mark: 0.15 }, 'Les ennemis touchés subissent +15 % de dégâts.'],
    ['Nuage persistant', 'legendaire', { splash: 0.5, mark: 0.2, slow: { p: 0.5, d: 1 } }, 'Personne ne sort indemne.'],
    ['Miasme', 'mythique', { splash: 0.9, mark: 0.3, slow: { p: 0.6, d: 1 } }, 'Toute une vallée immobilisée.'],
  ],
  orbital: [
    ['Œil céleste', 'commune', {}, 'Un tir venu de l\'espace.'],
    ['Lance de Zeus', 'rare', { rateMul: 1.15 }, 'Recharge plus vite.'],
    ['Faisceau stellaire', 'epique', { splash: 0.5, burn: 0.5 }, 'Le sol fond sous l\'impact.'],
    ['Constellation', 'legendaire', { multishot: 2, rateMul: 1.2 }, 'Deux frappes à la fois.'],
    ['Courroux divin', 'mythique', { multishot: 3, rateMul: 1.4, splash: 0.6, execute: 0.15 }, 'Le ciel tombe sur l\'ennemi.'],
  ],
  antitank: [
    ['Javeline', 'commune', {}, 'Tir et oubli.'],
    ['Tandem', 'rare', { pierce: 0.8 }, 'Deux charges pour percer tout blindage.'],
    ['Chasseur de chars', 'epique', { salvo: 1, rateMul: 1.1 }, 'Deux missiles par salve.'],
    ['Brise-acier', 'legendaire', { salvo: 1, execute: 0.15, rateMul: 1.2 }, 'Achève les blindés affaiblis.'],
    ['Tueur de titans', 'mythique', { salvo: 2, execute: 0.2, crit: { c: 0.3, m: 2.5 }, rateMul: 1.3 }, 'Aucun blindé ne lui résiste.'],
  ],
  lourde: [
    ['Browning', 'commune', {}, 'Un classique qui ne s\'enraye jamais.'],
    ['Bourdon', 'rare', { rateMul: 1.15 }, 'Cadence de tir accrue.'],
    ['Perce-tôle', 'epique', { pierce: 0.5, crit: { c: 0.15, m: 2 } }, 'Traverse tout ce qui roule.'],
    ['Faucheur d\'acier', 'legendaire', { multishot: 2, pierce: 0.5 }, 'Deux affûts jumelés.'],
    ['Tempête de plomb', 'mythique', { multishot: 3, pierce: 0.6, rateMul: 1.3 }, 'Un mur de balles infranchissable.'],
  ],
  obusier: [
    ['Long Tom', 'commune', {}, 'Tire au-delà de l\'horizon.'],
    ['Grand Calibre', 'rare', { splash: 0.2 }, 'Des cratères plus larges.'],
    ['Obus incendiaire', 'epique', { burn: 0.6, splash: 0.2 }, 'Le sol continue de brûler.'],
    ['Batterie royale', 'legendaire', { split: 2, rateMul: 1.15 }, 'Trois obus par salve.'],
    ['Feu roulant', 'mythique', { split: 4, burn: 0.6, rateMul: 1.3 }, 'Un tapis de feu sur toute une route.'],
  ],
  phalanx: [
    ['Goalkeeper', 'commune', {}, 'Rien ne passe au-dessus.'],
    ['Œil radar', 'rare', { rangeMul: 1.15 }, 'Détecte plus loin.'],
    ['Rideau de fer', 'epique', { crit: { c: 0.2, m: 2.2 }, rateMul: 1.1 }, 'Des balles explosives.'],
    ['Dôme de fer', 'legendaire', { multishot: 2, rangeMul: 1.15 }, 'Deux canons rotatifs.'],
    ['Ciel interdit', 'mythique', { multishot: 3, rangeMul: 1.25, rateMul: 1.2 }, 'Aucun appareil ne survit.'],
  ],
  napalm: [
    ['Brûlot', 'commune', {}, 'Une pluie de feu.'],
    ['Feu grégeois', 'rare', { dur: 1 }, 'Brûle plus longtemps.'],
    ['Enfer liquide', 'epique', { splash: 0.3, burn: 0.4 }, 'Une flaque plus large et plus chaude.'],
    ['Phosphore', 'legendaire', { burn: 0.8, slow: { p: 0.3, d: 1 }, rateMul: 1.15 }, 'Colle et ralentit.'],
    ['Apocalypse', 'mythique', { splash: 0.5, burn: 1.2, dur: 1.5, rateMul: 1.3 }, 'La terre elle-même s\'embrase.'],
  ],
  sonic: [
    ['Haut-parleur', 'commune', { stun: { c: 0.15, d: 0.6 } }, 'Assourdissant.'],
    ['Infrason', 'rare', { stun: { c: 0.22, d: 0.7 }, rangeMul: 1.1 }, 'On le sent avant de l\'entendre.'],
    ['Mur du son', 'epique', { stun: { c: 0.3, d: 0.8 }, slow: { p: 0.3, d: 1 } }, 'Une onde qui plaque au sol.'],
    ['Cri de la terre', 'legendaire', { stun: { c: 0.35, d: 1 }, rangeMul: 1.2, rateMul: 1.15 }, 'Fait trembler les chars.'],
    ['Résonance', 'mythique', { stun: { c: 0.45, d: 1.2 }, rangeMul: 1.3, rateMul: 1.3, shieldMul: 2.5 }, 'Brise les boucliers et les tympans.'],
  ],
  harpon: [
    ['Baleinier', 'commune', {}, 'Conçu pour la pêche… au gros.'],
    ['Pointe d\'acier', 'rare', { pierce: 0.4 }, 'Perce les coques.'],
    ['Torpille', 'epique', { splash: 0.5, boatMul: 3.2 }, 'Explose sous la ligne de flottaison.'],
    ['Leviathan', 'legendaire', { multishot: 2, boatMul: 3.2 }, 'Deux harpons à la fois.'],
    ['Kraken', 'mythique', { multishot: 3, boatMul: 3.8, splash: 0.5, execute: 0.15 }, 'Aucune flotte ne lui échappe.'],
  ],
  plasma: [
    ['Fusion', 'commune', {}, 'Une boule de soleil miniature.'],
    ['Perce-ligne', 'rare', { width: 0.15 }, 'Une boule plus large.'],
    ['Nova', 'epique', { burn: 0.6, split: 2 }, 'Éclate en deux petites boules à l\'impact.'],
    ['Soleil captif', 'legendaire', { width: 0.2, burn: 0.8, rateMul: 1.2 }, 'Brûle tout sur des dizaines de mètres.'],
    ['Supernova', 'mythique', { width: 0.3, burn: 1.2, split: 4, rateMul: 1.35 }, 'Une explosion d\'étoile.'],
  ],
};
Object.assign(CARD_DEF, {
  sentry:[['Guetteur M2','commune',{},'Petit budget, ligne bien gardée.']],
  frostbattery:[['Batterie boréale','rare',{},'L’assaut ralentit sous ses obus de glace.']],
  ionlance:[['Lance ionique','rare',{},'Les boucliers ne sont plus un refuge.']],
  skyguard:[['Garde-ciel','commune',{},'Une zone du ciel sous contrôle.']],
  siege:[['Briseur de siège','epique',{},'Un tir décisif. Une longue attente.']]
});
const CARDS = [];
for (const f of FAM_ORDER) CARD_DEF[f].forEach(([n, r, tr, lore], i) => CARDS.push({ id: f + '_' + i, fam: f, n, r, tr, lore, i }));
const CARD = Object.fromEntries(CARDS.map((c) => [c.id, c]));


// =====================================================================
//  ARMÉE ENNEMIE : unités militaires, adaptées au biome de chaque carte
// =====================================================================
// mv : g = terrestre, a = aérien, w = amphibie (eau + terre)
// t : inf (infanterie) / veh (véhicule) / air / boat ; r : rayon (unités monde)
const UNIT = {
  conscrit: { n: 'Conscrit', t: 'inf', mv: 'g', hp: 14, spd: 1.45, rew: 2, dmg: 1, r: 0.16, desc: 'Infanterie légère envoyée en masse. Les dégâts de zone font merveille.' },
  fantassin: { n: 'Fantassin', t: 'inf', mv: 'g', hp: 38, spd: 1.0, rew: 4, dmg: 1, r: 0.2, desc: 'Le soldat de base. Fusil d\'assaut, gilet pare-balles.' },
  moto: { n: 'Éclaireur à moto', t: 'veh', mv: 'g', hp: 26, spd: 2.0, rew: 4, dmg: 1, r: 0.22, desc: 'Très rapide. Une tour Cryo le retient.' },
  jeep: { n: 'Jeep armée', t: 'veh', mv: 'g', hp: 72, spd: 1.6, arm: 0.1, rew: 6, dmg: 1, r: 0.32, desc: 'Rapide et un peu blindée.' },
  apc: { n: 'Transport blindé', t: 'veh', mv: 'g', hp: 150, spd: 0.8, arm: 0.35, rew: 9, dmg: 2, r: 0.4, split: ['fantassin', 3], desc: 'Libère trois fantassins quand il est détruit.' },
  leger: { n: 'Char léger', t: 'veh', mv: 'g', hp: 110, spd: 0.85, arm: 0.5, rew: 9, dmg: 2, r: 0.4, desc: 'Divise par deux les dégâts physiques. Railgun, Acide et Laser le percent.' },
  bouclier: { n: 'Escouade bouclier', t: 'inf', mv: 'g', hp: 80, shield: 90, spd: 0.85, rew: 11, dmg: 2, r: 0.26, desc: 'Boucliers balistiques : absorbent les premiers dégâts. Tesla et Laser les brisent deux fois plus vite.' },
  medecin: { n: 'Médecin', t: 'inf', mv: 'g', hp: 70, spd: 0.9, rew: 11, dmg: 1, r: 0.2, heal: 0.035, healR: 1.6, healT: 'inf', desc: 'Soigne l\'infanterie autour de lui. À abattre en priorité.' },
  meca: { n: 'Mécanicien', t: 'veh', mv: 'g', hp: 90, spd: 0.9, rew: 12, dmg: 1, r: 0.32, heal: 0.03, healR: 1.8, healT: 'veh', desc: 'Camion atelier : répare les véhicules autour de lui.' },
  sapeur: { n: 'Sapeur', t: 'inf', mv: 'g', hp: 58, spd: 1.35, rew: 9, dmg: 5, r: 0.2, desc: 'Chargé d\'explosifs : 5 dégâts s\'il atteint la citadelle.' },
  officier: { n: 'Officier', t: 'inf', mv: 'g', hp: 90, spd: 0.9, rew: 13, dmg: 1, r: 0.22, haste: 0.3, hasteR: 1.6, desc: 'Galvanise les troupes : +30 % de vitesse autour de lui.' },
  commando: { n: 'Commando', t: 'inf', mv: 'g', hp: 62, spd: 1.2, rew: 10, dmg: 1, r: 0.2, stealth: true, desc: 'Camouflé. Seul un Radar à portée permet de le viser.' },
  fumigene: { n: 'Lance-fumigènes', t: 'veh', mv: 'g', hp: 95, spd: 0.95, arm: 0.2, rew: 11, dmg: 1, r: 0.34, smoke: true, desc: 'Déploie des écrans de fumée qui cachent les troupes voisines. Radar et Onde de choc les dissipent.' },
  brouilleur: { n: 'Brouilleur', t: 'veh', mv: 'g', hp: 100, spd: 0.85, arm: 0.2, rew: 14, dmg: 1, r: 0.34, jam: { r: 1.9, d: 2.2, every: 6 }, desc: 'Guerre électronique : coupe les tours proches pendant 2 s.' },
  lourd: { n: 'Char lourd', t: 'veh', mv: 'g', hp: 430, spd: 0.55, arm: 0.45, rew: 26, dmg: 4, r: 0.5, noSlow: true, desc: 'Énorme blindage. Insensible aux ralentissements.' },
  drone: { n: 'Drone kamikaze', t: 'air', mv: 'a', hp: 30, spd: 2.0, rew: 6, dmg: 1, r: 0.2, desc: 'Aérien très rapide. Vole droit vers la citadelle.' },
  helico: { n: 'Hélicoptère d\'attaque', t: 'air', mv: 'a', hp: 60, spd: 1.2, rew: 7, dmg: 1, r: 0.42, desc: 'Aérien. Seules certaines tours peuvent le toucher.' },
  transport: { n: 'Hélico de transport', t: 'air', mv: 'a', hp: 170, spd: 0.8, rew: 16, dmg: 2, r: 0.55, split: ['conscrit', 4], desc: 'Largue quatre conscrits quand il est abattu.' },
  mastodonte: { n: 'Mastodonte', t: 'veh', mv: 'g', hp: 620, spd: 0.5, arm: 0.6, rew: 38, dmg: 5, r: 0.6, noSlow: true, noStun: true, desc: 'Char super-lourd. Insensible au gel, au ralentissement et à l\'étourdissement.' },
  // spécialités régionales
  alpin: { n: 'Chasseur alpin', t: 'inf', mv: 'g', hp: 42, spd: 1.7, rew: 5, dmg: 1, r: 0.2, desc: 'Infanterie de montagne sur skis. Rapide.' },
  motoneige: { n: 'Motoneige', t: 'veh', mv: 'g', hp: 50, spd: 2.2, rew: 6, dmg: 1, r: 0.26, desc: 'Fonce sur la neige.' },
  polaire: { n: 'Char polaire', t: 'veh', mv: 'g', hp: 300, spd: 0.7, arm: 0.35, rew: 20, dmg: 3, r: 0.46, noSlow: true, desc: 'Chenilles larges, insensible au froid et aux ralentissements.' },
  technical: { n: 'Pick-up armé', t: 'veh', mv: 'g', hp: 85, spd: 1.7, rew: 7, dmg: 1, r: 0.3, desc: 'Mitrailleuse lourde sur plateau. Rapide.' },
  buggy: { n: 'Buggy des dunes', t: 'veh', mv: 'g', hp: 45, spd: 2.4, rew: 5, dmg: 1, r: 0.24, desc: 'Le plus rapide du désert.' },
  chardesert: { n: 'Char du désert', t: 'veh', mv: 'g', hp: 170, spd: 0.9, arm: 0.45, rew: 12, dmg: 2, r: 0.42, desc: 'Blindage sable, rapide pour un char.' },
  guerillero: { n: 'Guérillero', t: 'inf', mv: 'g', hp: 45, spd: 1.1, rew: 6, dmg: 1, r: 0.19, stealth: true, desc: 'Se fond dans la végétation. Il faut un Radar.' },
  quad: { n: 'Quad', t: 'veh', mv: 'g', hp: 40, spd: 2.1, rew: 5, dmg: 1, r: 0.22, desc: 'Rapide sur les pistes de jungle.' },
  pyro: { n: 'Lance-flammes', t: 'inf', mv: 'g', hp: 120, spd: 0.85, arm: 0.15, rew: 11, dmg: 2, r: 0.24, fireImm: true, desc: 'Combinaison ignifugée : insensible aux brûlures.' },
  emeute: { n: 'Blindé anti-émeute', t: 'veh', mv: 'g', hp: 150, shield: 250, spd: 0.75, arm: 0.2, rew: 16, dmg: 2, r: 0.44, desc: 'Énorme lame-bouclier à l\'avant. Tesla et Laser recommandés.' },
  robot: { n: 'Robot de combat', t: 'veh', mv: 'g', hp: 140, spd: 0.9, arm: 0.4, rew: 13, dmg: 2, r: 0.3, regen: 0.02, desc: 'Se répare tout seul. Le feu et l\'acide bloquent la réparation.' },
  hover: { n: 'Aéroglisseur', t: 'boat', mv: 'w', hp: 80, spd: 1.8, rew: 7, dmg: 1, r: 0.4, desc: 'Amphibie rapide : arrive par la mer et continue sur terre.' },
  barge: { n: 'Barge de débarquement', t: 'boat', mv: 'w', hp: 200, spd: 0.7, arm: 0.2, rew: 12, dmg: 2, r: 0.55, split: ['fantassin', 4], land: ['fantassin', 4], desc: 'Débarque quatre fantassins sur la plage, ou les libère si elle coule.' },
  vedette: { n: 'Vedette', t: 'boat', mv: 'w', hp: 60, spd: 2.3, rew: 6, dmg: 1, r: 0.34, land: ['fantassin', 2], desc: 'Bateau d\'assaut très rapide : dépose deux fantassins sur la plage.' },
  exo: { n: 'Exosquelette', t: 'inf', mv: 'g', hp: 110, spd: 1.0, arm: 0.3, rew: 10, dmg: 2, r: 0.24, fireImm: true, desc: 'Armure motorisée résistante à la chaleur.' },
  mecha: { n: 'Méca d\'assaut', t: 'veh', mv: 'g', hp: 380, spd: 0.6, arm: 0.4, rew: 24, dmg: 4, r: 0.5, noSlow: true, desc: 'Marcheur blindé de 6 mètres.' },
  // ---- nouvelles troupes communes ----
  sidecar: { n: 'Side-car mitrailleur', t: 'veh', mv: 'g', hp: 55, spd: 1.9, rew: 5, dmg: 1, r: 0.27, desc: 'Une moto, un panier, une mitrailleuse. Très rapide.' },
  choc: { n: 'Troupes de choc', t: 'inf', mv: 'g', hp: 72, spd: 1.0, rew: 7, dmg: 1, r: 0.21, enrage: 1.2, desc: 'Plus elles sont blessées, plus elles chargent vite.' },
  grenadier: { n: 'Grenadier', t: 'inf', mv: 'g', hp: 56, spd: 1.0, arm: 0.15, rew: 6, dmg: 1, r: 0.21, desc: 'Infanterie lourde avec gilet renforcé.' },
  leurre: { n: 'Leurre gonflable', t: 'veh', mv: 'g', hp: 190, spd: 0.9, rew: 4, dmg: 0, r: 0.42, taunt: true, desc: 'Un faux char : tes tours le visent en priorité. Ne fait aucun dégât.' },
  demineur: { n: 'Démineur', t: 'veh', mv: 'g', hp: 130, spd: 0.85, arm: 0.3, rew: 10, dmg: 1, r: 0.36, demine: 1.3, desc: 'Rouleau anti-mines : désamorce les mines sur son passage.' },
  ambulance: { n: 'Ambulance blindée', t: 'veh', mv: 'g', hp: 130, spd: 0.9, arm: 0.2, rew: 14, dmg: 1, r: 0.36, heal: 0.05, healR: 2.0, healT: 'inf', desc: 'Soigne l\'infanterie dans un large rayon.' },
  obusier: { n: 'Obusier automoteur', t: 'veh', mv: 'g', hp: 260, spd: 0.55, arm: 0.35, rew: 22, dmg: 3, r: 0.5, suppress: { r: 3.4, d: 2.6, every: 7 }, desc: 'Bombarde tes tours : la plus proche est neutralisée quelques secondes.' },
  katioucha: { n: 'Lance-roquettes ennemi', t: 'veh', mv: 'g', hp: 150, spd: 0.75, arm: 0.15, rew: 16, dmg: 2, r: 0.4, suppress: { r: 2.8, d: 1.8, every: 5 }, desc: 'Salves rapides qui neutralisent tes tours.' },
  genbouclier: { n: 'Générateur de bouclier', t: 'veh', mv: 'g', hp: 140, spd: 0.8, arm: 0.2, rew: 16, dmg: 1, r: 0.38, shieldAura: { r: 1.8, amt: 0.15, every: 4 }, desc: 'Projette des boucliers d\'énergie sur les troupes voisines.' },
  camionbombe: { n: 'Camion piégé', t: 'veh', mv: 'g', hp: 160, spd: 1.1, rew: 12, dmg: 8, r: 0.4, desc: 'Bourré d\'explosifs : 8 dégâts s\'il atteint la citadelle.' },
  araignee: { n: 'Méca araignée', t: 'veh', mv: 'g', hp: 160, spd: 1.3, arm: 0.25, rew: 13, dmg: 2, r: 0.38, desc: 'Marcheur à six pattes, rapide et blindé.' },
  charlf: { n: 'Char lance-flammes', t: 'veh', mv: 'g', hp: 240, spd: 0.7, arm: 0.4, rew: 16, dmg: 3, r: 0.44, fireImm: true, desc: 'Blindé et ignifugé : insensible aux brûlures.' },
  td: { n: 'Chasseur de chars', t: 'veh', mv: 'g', hp: 330, spd: 0.7, arm: 0.5, rew: 20, dmg: 3, r: 0.46, desc: 'Casemate blindée et canon énorme.' },
  elite: { n: 'Forces spéciales', t: 'inf', mv: 'g', hp: 90, spd: 1.3, arm: 0.25, rew: 14, dmg: 2, r: 0.21, stealth: true, desc: 'Camouflées et protégées. Il faut un Radar.' },
  cargo: { n: 'Avion de transport', t: 'air', mv: 'a', hp: 230, spd: 0.9, rew: 18, dmg: 2, r: 0.9, drop: ['parachutiste', 5], desc: 'Largue cinq parachutistes au milieu de la carte.' },
  parachutiste: { n: 'Parachutiste', t: 'inf', mv: 'g', hp: 40, spd: 1.1, rew: 3, dmg: 1, r: 0.2, desc: 'Tombe du ciel derrière tes lignes.' },
  chasseur: { n: 'Avion de chasse', t: 'air', mv: 'a', hp: 90, spd: 2.4, rew: 9, dmg: 2, r: 0.55, desc: 'Aérien supersonique. Il faut de la DCA.' },
  bombardier: { n: 'Bombardier', t: 'air', mv: 'a', hp: 330, spd: 0.7, rew: 22, dmg: 4, r: 0.85, desc: 'Aérien lourd et résistant.' },
  dronefurtif: { n: 'Drone furtif', t: 'air', mv: 'a', hp: 42, spd: 1.8, rew: 8, dmg: 1, r: 0.24, stealth: true, desc: 'Aérien invisible sans Radar.' },
  // ---- spécialités régionales supplémentaires ----
  chenillette: { n: 'Chenillette', t: 'veh', mv: 'g', hp: 120, spd: 1.3, arm: 0.2, rew: 8, dmg: 1, r: 0.32, desc: 'Petit véhicule chenillé des neiges.' },
  brisenieige: { n: 'Brise-neige', t: 'veh', mv: 'g', hp: 520, spd: 0.5, arm: 0.5, rew: 30, dmg: 5, r: 0.55, noSlow: true, desc: 'Char à étrave géante : rien ne l\'arrête.' },
  mehariste: { n: 'Méhariste', t: 'inf', mv: 'g', hp: 60, spd: 1.6, rew: 6, dmg: 1, r: 0.3, desc: 'Cavalier du désert, monté sur dromadaire.' },
  lancemissile: { n: 'Lanceur mobile', t: 'veh', mv: 'g', hp: 160, spd: 0.8, rew: 16, dmg: 2, r: 0.42, suppress: { r: 3.2, d: 2.2, every: 6 }, desc: 'Camion lance-missiles qui neutralise tes tours.' },
  exolourd: { n: 'Exo lourd', t: 'inf', mv: 'g', hp: 220, spd: 0.8, arm: 0.45, rew: 14, dmg: 2, r: 0.3, fireImm: true, desc: 'Armure de combat lourde, résistante à la chaleur.' },
  foreuse: { n: 'Foreuse de siège', t: 'veh', mv: 'g', hp: 360, spd: 0.55, arm: 0.4, rew: 22, dmg: 4, r: 0.5, noSlow: true, desc: 'Une foreuse géante blindée.' },
  swat: { n: 'Escouade d\'assaut', t: 'inf', mv: 'g', hp: 70, shield: 70, spd: 1.0, rew: 9, dmg: 1, r: 0.22, desc: 'Boucliers balistiques et casques intégraux.' },
  helipolice: { n: 'Hélico de patrouille', t: 'air', mv: 'a', hp: 95, spd: 1.4, rew: 8, dmg: 1, r: 0.45, desc: 'Hélicoptère léger et rapide.' },
  pisteur: { n: 'Pisteur', t: 'inf', mv: 'g', hp: 50, spd: 1.5, rew: 6, dmg: 1, r: 0.2, stealth: true, desc: 'Rapide et invisible dans la jungle.' },
  fluviale: { n: 'Embarcation fluviale', t: 'boat', mv: 'w', hp: 110, spd: 1.4, rew: 8, dmg: 1, r: 0.4, land: ['guerillero', 2], desc: 'Remonte les rivières et dépose des guérilleros.' },
  sousmarin: { n: 'Sous-marin de poche', t: 'boat', mv: 'w', hp: 200, spd: 1.0, arm: 0.3, rew: 16, dmg: 2, r: 0.5, sub: true, land: ['elite', 2], desc: 'Invisible sous l\'eau sans Radar. Débarque des commandos.' },
  hydro: { n: 'Hydroglisseur', t: 'boat', mv: 'w', hp: 55, spd: 2.6, rew: 6, dmg: 1, r: 0.36, land: ['fantassin', 1], desc: 'Le plus rapide sur l\'eau. Dépose un fantassin sur la plage.' },
  amphitank: { n: 'Char amphibie', t: 'boat', mv: 'w', hp: 260, spd: 0.8, arm: 0.35, rew: 16, dmg: 3, r: 0.45, desc: 'Un char qui nage et continue sur terre.' },
  artilleur: { n: 'Artilleur de montagne', t: 'inf', mv: 'g', hp: 75, spd: 0.9, rew: 10, dmg: 1, r: 0.22, suppress: { r: 2.6, d: 1.5, every: 6 }, desc: 'Porte un mortier léger qui neutralise tes tours.' },
  gyro: { n: 'Gyrocoptère', t: 'air', mv: 'a', hp: 70, spd: 1.6, rew: 7, dmg: 1, r: 0.4, desc: 'Petit aérien agile des montagnes.' },
  hivernal: { n: 'Char lourd hivernal', t: 'veh', mv: 'g', hp: 480, spd: 0.55, arm: 0.5, rew: 28, dmg: 4, r: 0.52, noSlow: true, desc: 'Blindage épais, chenilles larges.' },
  // boss
  b_behemoth: { n: 'Le Béhémoth', t: 'veh', mv: 'g', hp: 2400, spd: 0.45, arm: 0.3, rew: 120, dmg: 10, r: 0.85, boss: true, desc: 'Char géant à trois tourelles.' },
  b_forteresse: { n: 'La Forteresse volante', t: 'air', mv: 'a', hp: 4200, spd: 0.55, rew: 200, dmg: 14, r: 1.0, boss: true, desc: 'Bombardier lourd. Il faut de l\'anti-aérien.' },
  b_croiseur: { n: 'Le Croiseur amphibie', t: 'boat', mv: 'w', hp: 3400, spd: 0.5, arm: 0.2, rew: 160, dmg: 12, r: 0.95, boss: true, spawn: ['fantassin', 2.4], desc: 'Débarque des fantassins en avançant.' },
  b_general: { n: 'Le Général', t: 'veh', mv: 'g', hp: 3000, spd: 0.55, arm: 0.25, rew: 150, dmg: 10, r: 0.7, boss: true, regen: 0.012, haste: 0.35, hasteR: 2.4, split: ['b_garde', 2], desc: 'Véhicule de commandement : galvanise les troupes, puis libère sa garde.' },
  b_garde: { n: 'Garde d\'élite', t: 'veh', mv: 'g', hp: 1100, spd: 0.75, arm: 0.3, rew: 50, dmg: 5, r: 0.45, boss: true, desc: 'La garde rapprochée du Général.' },
  mitrailleur: { n: 'Équipe de mitrailleuse', t: 'inf', mv: 'g', hp: 85, spd: 0.8, arm: 0.1, rew: 9, dmg: 2, r: 0.24, suppress: { r: 1.6, d: 1.2, every: 8 }, desc: 'Une mitrailleuse lourde sur trépied : cloue une tour proche pendant un instant.' },
  ingenieur: { n: 'Ingénieur de combat', t: 'inf', mv: 'g', hp: 60, spd: 1.0, rew: 10, dmg: 1, r: 0.2, heal: 0.04, healR: 1.7, healT: 'veh', demine: 1.0, desc: 'Répare les véhicules autour de lui et neutralise les mines.' },
  maitrechien: { n: 'Maître-chien', t: 'inf', mv: 'g', hp: 45, spd: 2.1, rew: 6, dmg: 1, r: 0.2, desc: 'Un soldat et son chien d\'assaut. Très rapides.' },
  bulldozer: { n: 'Bulldozer blindé', t: 'veh', mv: 'g', hp: 380, spd: 0.55, arm: 0.45, rew: 22, dmg: 3, r: 0.48, noSlow: true, shieldAura: { r: 1.4, v: 40, every: 7 }, desc: 'Une lame d\'acier qui protège les troupes derrière elle.' },
  rupture: { n: 'Char de rupture', t: 'veh', mv: 'g', hp: 760, spd: 0.48, arm: 0.6, rew: 42, dmg: 5, r: 0.58, noSlow: true, enrage: 0.5, desc: 'Char lourd de percée. Accélère quand il est endommagé.' },
  quadroquette: { n: 'Quad lance-roquettes', t: 'veh', mv: 'g', hp: 110, spd: 1.6, arm: 0.1, rew: 10, dmg: 1, r: 0.3, suppress: { r: 2.2, d: 1.6, every: 6 }, desc: 'Rapide et nerveux : ses roquettes neutralisent une tour de loin.' },
  guerreelec: { n: 'Centre de guerre électronique', t: 'veh', mv: 'g', hp: 260, spd: 0.6, arm: 0.3, rew: 24, dmg: 2, r: 0.46, jam: { r: 2.6, d: 2.6, every: 7 }, desc: 'Brouille toutes les tours dans un large rayon.' },
  dronelourd: { n: 'Drone d\'attaque', t: 'air', mv: 'a', hp: 120, spd: 1.5, arm: 0.15, rew: 10, dmg: 2, r: 0.4, desc: 'Drone armé à longue autonomie, plus résistant.' },
  chinook: { n: 'Hélico lourd', t: 'air', mv: 'a', hp: 320, spd: 0.75, arm: 0.2, rew: 22, dmg: 2, r: 0.7, drop: ['fantassin', 6], desc: 'Bi-rotor qui largue six fantassins en vol.' },
  dirigeable: { n: 'Dirigeable blindé', t: 'air', mv: 'a', hp: 900, spd: 0.35, arm: 0.35, rew: 45, dmg: 6, r: 1.0, spawn: ['drone', 5], desc: 'Un mastodonte des airs qui lâche des drones kamikazes.' },
  b_dirigeable: { n: 'Le Léviathan', t: 'air', mv: 'a', hp: 5200, shield: 1200, spd: 0.3, arm: 0.35, rew: 320, dmg: 16, r: 1.6, boss: true, spawn: ['dronelourd', 4], desc: 'Forteresse volante géante. Lâche des drones d\'attaque en permanence.' },
  b_titan: { n: 'Le Titan', t: 'veh', mv: 'g', hp: 8000, shield: 3000, spd: 0.4, arm: 0.5, rew: 400, dmg: 20, r: 1.1, boss: true, noSlow: true, desc: 'Méca colossal. Bouclier, blindage, rien ne le ralentit.' },
};
// vague d'apparition (palier 0) et coût de menace
const UNLOCK = { mitrailleur: [11, 3.2], ingenieur: [11, 2.8], maitrechien: [4, 1.2], bulldozer: [15, 6], rupture: [21, 12], quadroquette: [10, 2.6], guerreelec: [18, 5.5], dronelourd: [16, 3.4], chinook: [19, 8], dirigeable: [24, 11], sidecar: [4, 1.3], choc: [8, 2.4], grenadier: [5, 1.6], leurre: [10, 2.2], demineur: [9, 2.6], ambulance: [14, 3.4], obusier: [13, 7], katioucha: [17, 5], genbouclier: [15, 4], camionbombe: [18, 4], araignee: [15, 3.6], charlf: [14, 4.5], td: [16, 6], elite: [19, 3.6], cargo: [14, 11], chasseur: [16, 2.4], bombardier: [20, 8], dronefurtif: [17, 2], chenillette: [3, 1.6], brisenieige: [16, 10], mehariste: [3, 1.4], lancemissile: [11, 5], exolourd: [9, 4], foreuse: [13, 7], swat: [6, 2.2], helipolice: [5, 1.6], pisteur: [5, 1.6], fluviale: [4, 2.2], sousmarin: [13, 5], hydro: [2, 1.3], amphitank: [9, 4.5], artilleur: [7, 2.8], gyro: [4, 1.5], hivernal: [15, 9], fantassin: [1, 1], moto: [2, 1], conscrit: [3, 0.5], jeep: [3, 1.6], leger: [5, 2.6], helico: [6, 1.5], apc: [7, 2.6], bouclier: [8, 2.6], medecin: [9, 2.8], drone: [10, 1.4], commando: [11, 2], meca: [12, 3], officier: [13, 3], fumigene: [14, 2.8], sapeur: [15, 2.2], brouilleur: [16, 3.2], lourd: [17, 9], transport: [18, 7.5], mastodonte: [20, 13],
  alpin: [2, 1.2], motoneige: [4, 1.3], polaire: [12, 7], technical: [3, 1.8], buggy: [4, 1.2], chardesert: [9, 4], guerillero: [4, 1.6], quad: [3, 1.1], pyro: [10, 3], emeute: [9, 5], robot: [11, 3.4], hover: [2, 1.8], barge: [6, 4], vedette: [3, 1.4], exo: [6, 2.6], mecha: [14, 8] };

// biomes : palette, faction, végétation, peinture des unités
const BIOME = {
  tempere: { n: 'Tempéré', faction: 'Légion de l\'Ouest', extra: [], camo: ['#55613A', '#3E4A2A', '#7A7B52'], grass: '#5A8A32', grass2: '#86A048', sand: '#CDBB8A', rock: '#7B776E', snow: '#F2F4F6', water: '#2A6E84', deep: '#0F3446', tree: 'pine', fog: '#B7C9C9', sky: ['#9EC3D6', '#E6EEF0'], sun: '#FFF1D6', hill: 0.5 },
  marais: { n: 'Marais', faction: 'Flottille du Delta', extra: ['hover', 'barge', 'vedette', 'hydro', 'amphitank', 'fluviale'], camo: ['#4E5A3C', '#33402A', '#6B6A48'], grass: '#4F6B3A', grass2: '#6E7E46', sand: '#B8A878', rock: '#6E6B60', snow: '#EEE', water: '#3A6A5E', deep: '#173A34', tree: 'willow', fog: '#AFC0B0', sky: ['#9FB9AE', '#DCE6DE'], sun: '#FFF0D0', hill: 0.35 },
  neige: { n: 'Arctique', faction: 'Division Boréale', extra: ['alpin', 'motoneige', 'polaire', 'chenillette', 'brisenieige'], camo: ['#354F66', '#243649', '#657F91'], grass: '#AABAC6', grass2: '#C4D0D8', sand: '#827461', rock: '#596B7C', snow: '#CCD8E0', water: '#2C5670', deep: '#0E2638', tree: 'snowpine', fog: '#92A7B5', sky: ['#91ABBE', '#C6D3DD'], sun: '#CCD9E5', hill: 0.45 },
  desert: { n: 'Désert', faction: 'Brigade des Sables', extra: ['technical', 'buggy', 'chardesert', 'mehariste', 'lancemissile'], camo: ['#C2A36B', '#9C7F4C', '#D9C08C'], grass: '#D2B37A', grass2: '#C49A5E', sand: '#E3CB92', rock: '#A0704A', snow: '#F5E8D0', water: '#2E7D86', deep: '#124048', tree: 'palm', fog: '#E8D6B4', sky: ['#E9C99A', '#F7ECD8'], sun: '#FFE7B8', hill: 0.5 },
  volcan: { n: 'Volcanique', faction: 'Corps de Fer', extra: ['exo', 'mecha', 'exolourd', 'foreuse'], camo: ['#3A3A3A', '#5A2A22', '#4A4A4A'], grass: '#3B3833', grass2: '#4E4740', sand: '#5A4E44', rock: '#2A2724', snow: '#6A615A', water: '#1F3A44', deep: '#0A171C', tree: 'dead', fog: '#5A4A44', sky: ['#5A3A34', '#A07060'], sun: '#FFB48A', hill: 0.55, lava: true },
  urbain: { n: 'Urbain', faction: 'Garde Métropolitaine', extra: ['emeute', 'robot', 'swat', 'helipolice'], camo: ['#6E7378', '#4A5058', '#8A9096'], grass: '#6A7060', grass2: '#7E8070', sand: '#A8A090', rock: '#6A6A6A', snow: '#DDD', water: '#2A5A6E', deep: '#0F2A38', tree: 'oak', fog: '#B0B4B8', sky: ['#A8B4BE', '#E2E6EA'], sun: '#FFF4E0', hill: 0.3, city: true },
  jungle: { n: 'Jungle', faction: 'Front Émeraude', extra: ['guerillero', 'quad', 'pyro', 'pisteur', 'fluviale'], camo: ['#3E5B2C', '#2A3E1E', '#5A6E38'], grass: '#3F6A2A', grass2: '#56823A', sand: '#C2AE7A', rock: '#5A5E4A', snow: '#EEE', water: '#2A6A5A', deep: '#0F322A', tree: 'jungle', fog: '#9DB89A', sky: ['#9CC0A8', '#E0ECDF'], sun: '#FFF0C8', hill: 0.5 },
  tropical: { n: 'Tropical', faction: 'Armada Écarlate', extra: ['hover', 'barge', 'vedette', 'sousmarin', 'hydro', 'amphitank'], camo: ['#6B7F4A', '#4A5A32', '#8A8E5A'], grass: '#5C8A3C', grass2: '#7AA048', sand: '#EED9A0', rock: '#8A7A64', snow: '#FFF', water: '#1C9CB0', deep: '#0A4A66', tree: 'palm', fog: '#BEE0E4', sky: ['#8CD0E2', '#EAF6F8'], sun: '#FFF6E0', hill: 0.4 },
  alpin: { n: 'Haute montagne', faction: 'Chasseurs des Cimes', extra: ['alpin', 'polaire', 'mecha', 'artilleur', 'gyro'], camo: ['#7A8070', '#565C4C', '#9AA090'], grass: '#6A8048', grass2: '#8A9A5A', sand: '#B8AE8A', rock: '#6E6A64', snow: '#F6F8FA', water: '#2E6A80', deep: '#0F3040', tree: 'pine', fog: '#C4D0D8', sky: ['#A4C0D4', '#E8EEF2'], sun: '#FFF6E6', hill: 0.6 },
  automne: { n: 'Forêt d\'automne', faction: 'Légion d\'Automne', extra: ['mitrailleur', 'ingenieur', 'maitrechien', 'bulldozer'], camo: ['#6A5A3A', '#4A3E2A', '#8A7650'], grass: '#7E8A3A', grass2: '#A88E3E', sand: '#CDB48A', rock: '#7A7268', snow: '#F2F0EA', water: '#2E6A78', deep: '#103240', tree: 'autumn', fog: '#D8C8B0', sky: ['#C8B8A0', '#F0E6D8'], sun: '#FFE2C0', hill: 0.55 },
  canyon: { n: 'Canyon', faction: 'Cartel du Canyon', extra: ['quadroquette', 'technical', 'buggy', 'lancemissile', 'guerreelec'], camo: ['#A86A3E', '#7A4A2A', '#C88A5A'], grass: '#B8703E', grass2: '#C8884E', sand: '#DCA678', rock: '#8A4A2E', snow: '#F2E2D0', water: '#2E7A80', deep: '#123E44', tree: 'cactus', fog: '#E8C8A8', sky: ['#E8B888', '#F8E8D4'], sun: '#FFE0B0', hill: 0.85 },
  toundra: { n: 'Toundra', faction: 'Horde Grise', extra: ['alpin', 'motoneige', 'polaire', 'mecha', 'hivernal', 'chenillette'], camo: ['#8A8E86', '#5E625A', '#B0B4AC'], grass: '#7A7E64', grass2: '#9A9A78', sand: '#B4AE94', rock: '#5A5A56', snow: '#BBCBD4', water: '#33586A', deep: '#10283A', tree: 'snowpine', fog: '#C8CCC8', sky: ['#A8B2B8', '#E4E8E8'], sun: '#FFF8EC', hill: 0.45 },
};
const CORE = ['fantassin', 'moto', 'conscrit', 'jeep', 'sidecar', 'grenadier', 'leger', 'helico', 'apc', 'choc', 'bouclier', 'medecin', 'demineur', 'leurre', 'drone', 'commando', 'meca', 'cargo', 'officier', 'obusier', 'charlf', 'ambulance', 'fumigene', 'genbouclier', 'araignee', 'sapeur', 'td', 'brouilleur', 'chasseur', 'katioucha', 'dronefurtif', 'lourd', 'camionbombe', 'transport', 'elite', 'bombardier', 'mastodonte', 'maitrechien', 'mitrailleur', 'quadroquette', 'ingenieur', 'dronelourd', 'bulldozer', 'guerreelec', 'chinook', 'rupture', 'dirigeable'];

// =====================================================================
//  CARTES (style FORTLINE : îles, secteurs à annexer, fronts)
// =====================================================================
// shape : forme générale ; lanes : fronts [côté, position 0-1, vague d'ouverture, type]
const MAPS = [
  { id: 'aube', n: 'Archipel de l\'Aube', biome: 'tempere', shape: 'island', seed: 11, size: 36, cit: [0.52, 0.76], sectors: 10, lanes: [['N', 0.42, 1], ['W', 0.25, 4], ['E', 0.3, 7]], waves: 15, hp: 0.75, tier: 0, boss: { 10: 'b_behemoth', 15: 'b_behemoth' }, brief: 'Une île tranquille, trois fronts. Apprends à annexer et à tenir la ligne.' },
  { id: 'delta', n: 'Delta des Saules', biome: 'marais', shape: 'river', seed: 23, size: 36, cit: [0.5, 0.7], sectors: 11, lanes: [['N', 0.3, 1], ['N', 0.75, 3], ['S', 0.2, 6, 'w'], ['E', 0.4, 9]], waves: 18, hp: 0.9, tier: 1, boss: { 12: 'b_croiseur', 18: 'b_behemoth' }, brief: 'Un fleuve coupe la carte : ponts, bras de mer et débarquements.' },
  { id: 'fjord', n: 'Fjord Blanc', biome: 'neige', shape: 'fjord', seed: 37, size: 36, cit: [0.45, 0.72], sectors: 11, lanes: [['N', 0.25, 1], ['N', 0.7, 4], ['W', 0.3, 7], ['E', 0.6, 10, 'w']], waves: 20, hp: 1.12, tier: 2, boss: { 10: 'b_behemoth', 20: 'b_general' }, brief: 'Montagnes, cols étroits et un fjord par lequel arrivent les aéroglisseurs.' },
  { id: 'dunes', n: 'Mer de Dunes', biome: 'desert', shape: 'continent', seed: 41, size: 38, cit: [0.55, 0.62], sectors: 13, lanes: [['N', 0.3, 1], ['E', 0.15, 3], ['S', 0.1, 6], ['W', 0.2, 9]], waves: 20, hp: 1.2, tier: 3, boss: { 10: 'b_general', 20: 'b_forteresse' }, brief: 'Citadelle au centre, attaques des quatre côtés. Les buggys sont redoutables.' },
  { id: 'caldeira', n: 'Caldeira', biome: 'volcan', shape: 'ring', seed: 53, size: 36, cit: [0.5, 0.86], sectors: 12, lanes: [['N', 0.35, 1], ['N', 0.65, 4], ['W', 0.15, 8], ['E', 0.85, 12]], waves: 22, hp: 1.25, tier: 4, boss: { 11: 'b_behemoth', 22: 'b_titan' }, brief: 'Un anneau de terre autour d\'un lac de lave. Les routes font le tour.' },
  { id: 'cite', n: 'Cité Brisée', biome: 'urbain', shape: 'city', seed: 67, size: 36, cit: [0.5, 0.55], sectors: 14, lanes: [['N', 0.2, 1], ['N', 0.8, 3], ['W', 0.5, 6], ['E', 0.4, 9], ['S', 0.7, 13]], waves: 24, hp: 1.2, tier: 5, boss: { 12: 'b_general', 24: 'b_titan' }, brief: 'Combats de rues : cinq fronts entre les immeubles en ruine.' },
  { id: 'emeraude', n: 'Jungle d\'Émeraude', biome: 'jungle', shape: 'twin', seed: 79, size: 38, cit: [0.7, 0.55], sectors: 13, lanes: [['W', 0.3, 1], ['W', 0.75, 3], ['N', 0.4, 7], ['S', 0.35, 10], ['N', 0.85, 14]], waves: 24, hp: 1.3, tier: 6, boss: { 12: 'b_forteresse', 24: 'b_general' }, brief: 'Deux îles reliées par des ponts. Les guérilleros sont invisibles sans radar.' },
  { id: 'atoll', n: 'Atoll Écarlate', biome: 'tropical', shape: 'archipelago', seed: 83, size: 38, cit: [0.5, 0.5], sectors: 14, lanes: [['N', 0.5, 1, 'w'], ['W', 0.4, 3, 'w'], ['E', 0.6, 6, 'w'], ['S', 0.5, 10, 'w'], ['W', 0.85, 14, 'w']], waves: 26, hp: 1.0, tier: 7, boss: { 13: 'b_croiseur', 26: 'b_forteresse' }, brief: 'Un chapelet d\'îlots. L\'ennemi débarque de partout.' },
  { id: 'cimes', n: 'Haut Plateau', biome: 'alpin', shape: 'highland', seed: 97, size: 40, cit: [0.5, 0.78], sectors: 15, lanes: [['N', 0.15, 1], ['N', 0.5, 3], ['N', 0.85, 6], ['W', 0.4, 10], ['E', 0.35, 14]], waves: 28, hp: 1.45, tier: 8, boss: { 14: 'b_titan', 28: 'b_general' }, brief: 'Des cols sinueux entre des pics infranchissables.' },
  { id: 'toundra', n: 'Toundra Grise', biome: 'toundra', shape: 'island', seed: 131, size: 42, cit: [0.5, 0.6], sectors: 16, lanes: [['N', 0.3, 1], ['N', 0.75, 3], ['E', 0.4, 6], ['S', 0.6, 9], ['W', 0.55, 12], ['S', 0.15, 16, 'w']], waves: 30, hp: 1.45, tier: 9, boss: { 10: 'b_behemoth', 20: 'b_forteresse', 30: 'b_titan' }, brief: 'Le dernier bastion. Six fronts. Bonne chance, commandant.' },
  { id: 'automne', n: 'Vallée Rousse', biome: 'automne', shape: 'lakes', seed: 149, size: 40, cit: [0.5, 0.62], sectors: 15, lanes: [['N', 0.25, 1], ['N', 0.7, 3], ['W', 0.35, 6], ['E', 0.5, 9], ['S', 0.2, 13]], waves: 30, hp: 1.45, tier: 10, boss: { 15: 'b_general', 30: 'b_dirigeable' }, brief: 'Des lacs, des forêts rousses et cinq routes qui convergent. Gare au Léviathan.' },
  { id: 'canyon', n: 'Canyon Écarlate', biome: 'canyon', shape: 'mesa', seed: 163, size: 40, cit: [0.5, 0.7], sectors: 15, lanes: [['N', 0.2, 1], ['N', 0.55, 3], ['E', 0.3, 7], ['W', 0.6, 10], ['N', 0.85, 14]], waves: 30, hp: 1.5, tier: 11, boss: { 15: 'b_titan', 30: 'b_forteresse' }, brief: 'Des gorges étroites entre des mesas rouges. Les quads lance-roquettes frappent vite.' },
  { id: 'baie', n: 'Baie des Corsaires', biome: 'tropical', shape: 'bay', seed: 177, size: 40, cit: [0.5, 0.8], sectors: 15, lanes: [['N', 0.5, 1, 'w'], ['W', 0.25, 3], ['E', 0.75, 5], ['N', 0.22, 8, 'w'], ['N', 0.78, 12, 'w']], waves: 32, hp: 1.5, tier: 12, boss: { 16: 'b_croiseur', 32: 'b_dirigeable' }, brief: 'Une baie en fer à cheval : les flottes entrent par le large, les blindés par les côtes.' },
  { id: 'peninsule', n: 'Péninsule de Fer', biome: 'automne', shape: 'peninsula', seed: 191, size: 40, cit: [0.5, 0.6], sectors: 14, lanes: [['S', 0.5, 1], ['W', 0.35, 3, 'w'], ['E', 0.35, 6, 'w'], ['N', 0.5, 9, 'w'], ['S', 0.3, 13]], waves: 32, hp: 1.5, tier: 13, boss: { 16: 'b_general', 32: 'b_croiseur' }, brief: 'Une langue de terre cernée par la mer : débarquements sur trois côtés.' },
  { id: 'glacier', n: 'Glacier Éternel', biome: 'neige', shape: 'lakes', seed: 211, size: 42, cit: [0.5, 0.55], sectors: 16, lanes: [['N', 0.3, 1], ['N', 0.75, 3], ['E', 0.3, 6], ['W', 0.7, 9], ['S', 0.4, 12], ['S', 0.8, 16]], waves: 34, hp: 1.55, tier: 14, boss: { 17: 'b_titan', 34: 'b_dirigeable' }, brief: 'Lacs gelés et blizzard. Six fronts, et le froid ne pardonne pas.' },
  { id: 'rempart', n: 'Ultime Rempart', biome: 'urbain', shape: 'city', seed: 233, size: 42, cit: [0.5, 0.5], sectors: 18, lanes: [['N', 0.2, 1], ['N', 0.8, 3], ['W', 0.4, 6], ['E', 0.6, 9], ['S', 0.3, 12], ['S', 0.75, 16]], waves: 36, hp: 1.6, tier: 15, boss: { 12: 'b_general', 24: 'b_dirigeable', 36: 'b_titan' }, brief: 'La capitale assiégée. Tout ce que l\'ennemi possède arrive ici. Tiens jusqu\'au bout.' },
];
MAPS.forEach(m => { m.size = Math.round(Math.round(m.size * 1.38) * 1.5 * 10) / 10; });
const SECTOR_NAMES = {
  tempere: ['Carrefour', 'Hautes-Terres', 'Plateau', 'Sylve', 'Côte', 'Estuaire', 'Les Landes', 'Val-Doré', 'Moulin', 'Falaises', 'Bocage', 'Pointe Nord', 'Prairies', 'Clairière', 'Vigie', 'Rocher'],
  marais: ['Carrefour', 'Les Saules', 'Roselière', 'Bras Mort', 'Écluse', 'Îlot Vert', 'Tourbière', 'Pontons', 'Vasière', 'Moulin', 'Marais Noir', 'Digue', 'Embouchure', 'Bayou', 'Brumes', 'Héron'],
  neige: ['Carrefour', 'Col Blanc', 'Glacier', 'Fjord', 'Moraine', 'Pic Gelé', 'Banquise', 'Refuge', 'Sapinière', 'Avalanche', 'Lac Gelé', 'Corniche', 'Vallon', 'Toundra', 'Givre', 'Aurore'],
  desert: ['Carrefour', 'Oasis', 'Grande Dune', 'Canyon', 'Caravansérail', 'Mirage', 'Erg', 'Reg', 'Puits', 'Mesa', 'Sel', 'Palmeraie', 'Ksar', 'Plateau Rouge', 'Hamada', 'Simoun'],
  volcan: ['Carrefour', 'Coulée', 'Fumerolles', 'Cendres', 'Basalte', 'Cratère', 'Obsidienne', 'Soufre', 'Brasier', 'Scories', 'Faille', 'Magma', 'Lapilli', 'Geyser', 'Forge', 'Pierre Noire'],
  urbain: ['Carrefour', 'Gare', 'Port', 'Vieille Ville', 'Usines', 'Stade', 'Hôpital', 'Faubourg', 'Marché', 'Docks', 'Parc', 'Tours', 'Rocade', 'Mairie', 'Entrepôts', 'Pont-Neuf'],
  jungle: ['Carrefour', 'Canopée', 'Rivière', 'Temple', 'Cascade', 'Mangrove', 'Liane', 'Clairière', 'Ruines', 'Bambous', 'Gorge', 'Orchidée', 'Jaguar', 'Source', 'Fougères', 'Brume'],
  tropical: ['Carrefour', 'Lagon', 'Récif', 'Cocotiers', 'Baie', 'Phare', 'Corail', 'Pointe Sud', 'Atoll', 'Plage', 'Tortue', 'Passe', 'Îlot', 'Mouillage', 'Lagune', 'Écume'],
  alpin: ['Carrefour', 'Col', 'Alpage', 'Glacier', 'Crête', 'Chalet', 'Pierrier', 'Torrent', 'Combe', 'Aiguille', 'Belvédère', 'Mélèzes', 'Cirque', 'Arête', 'Névé', 'Bergerie'],
  automne: ['Carrefour', 'Feuillage', 'Lac Doré', 'Châtaigneraie', 'Vieux Pont', 'Pressoir', 'Érables', 'Brumes', 'Colline Rousse', 'Abbaye', 'Gué', 'Vergers', 'Clocher', 'Bois Sombre', 'Étang', 'Moulin Rouge'],
  canyon: ['Carrefour', 'Mesa', 'Gorge', 'Arche', 'Ranch', 'Corniche', 'Mine', 'Défilé', 'Butte', 'Oued', 'Falaise', 'Cactus', 'Totem', 'Poste', 'Ravin', 'Fournaise'],
  toundra: ['Carrefour', 'Steppe', 'Lichen', 'Permafrost', 'Taïga', 'Bouleaux', 'Tumulus', 'Lac Gris', 'Bise', 'Mammouth', 'Rennes', 'Brume', 'Plaine', 'Vents', 'Cairn', 'Aurore'],
};

// =====================================================================
//  PROGRESSION ADDICTIVE : niveau de commandant, objectifs, succès
// =====================================================================
const LEVEL_XP = (l) => 120 + l * 80;
const LEVEL_REWARD = (l) => l % 5 === 0 ? { pack: 'elite' } : l % 3 === 0 ? { tk: 2 } : l % 2 === 0 ? { pack: 'tact' } : { c: 250 + l * 50 };
const DAILY_POOL = [
  { id: 'kills', n: 'Éliminer {n} ennemis', min: 120, max: 300, xp: 60, c: 150 },
  { id: 'waves', n: 'Tenir {n} vagues', min: 10, max: 30, xp: 60, c: 150 },
  { id: 'win', n: 'Gagner {n} mission(s)', min: 1, max: 2, xp: 90, c: 250 },
  { id: 'bid', n: 'Enchérir {n} fois', min: 3, max: 8, xp: 40, c: 100 },
  { id: 'auc', n: 'Remporter {n} enchère(s)', min: 1, max: 2, xp: 70, c: 200 },
  { id: 'annex', n: 'Annexer {n} secteurs', min: 4, max: 10, xp: 50, c: 120 },
  { id: 'boss', n: 'Abattre {n} boss', min: 1, max: 2, xp: 90, c: 250 },
  { id: 'build', n: 'Construire {n} défenses', min: 15, max: 40, xp: 40, c: 100 },
  { id: 'upgrade', n: 'Améliorer {n} tours au niveau 3', min: 3, max: 8, xp: 50, c: 120 },
  { id: 'pack', n: 'Ouvrir {n} booster(s)', min: 1, max: 3, xp: 40, c: 100 },
];
const ACHIEV = [
  { id: 'first', n: 'Baptême du feu', d: 'Gagner une première mission', k: 'wins', v: 1, r: { tk: 1 } },
  { id: 'w5', n: 'Stratège', d: 'Gagner 5 missions', k: 'wins', v: 5, r: { pack: 'tact' } },
  { id: 'w10', n: 'Maréchal', d: 'Gagner 10 missions', k: 'wins', v: 10, r: { pack: 'elite' } },
  { id: 'k1000', n: 'Mur d\'acier', d: 'Éliminer 1 000 ennemis', k: 'kills', v: 1000, r: { c: 800 } },
  { id: 'k10000', n: 'Légende vivante', d: 'Éliminer 10 000 ennemis', k: 'kills', v: 10000, r: { pack: 'elite' } },
  { id: 'boss10', n: 'Chasseur de géants', d: 'Abattre 10 boss', k: 'bosses', v: 10, r: { tk: 3 } },
  { id: 'col25', n: 'Collectionneur', d: 'Posséder 25 cartes différentes', k: 'unique', v: 25, r: { pack: 'tact' } },
  { id: 'col50', n: 'Archiviste', d: 'Posséder 50 cartes différentes', k: 'unique', v: 50, r: { pack: 'elite' } },
  { id: 'myth', n: 'L\'Élu', d: 'Posséder une carte mythique', k: 'myth', v: 1, r: { c: 3000 } },
  { id: 'stars', n: 'Perfectionniste', d: 'Obtenir 15 étoiles', k: 'stars', v: 15, r: { pack: 'elite' } },
  { id: 'auc10', n: 'Commissaire-priseur', d: 'Remporter 10 enchères', k: 'aucwins', v: 10, r: { tk: 2 } },
  { id: 'streak7', n: 'Fidèle au poste', d: 'Se connecter 7 jours d\'affilée', k: 'streak', v: 7, r: { pack: 'elite' } },
];
const STREAK = [{ c: 200 }, { tk: 1 }, { c: 400 }, { pack: 'tact' }, { c: 800 }, { tk: 2 }, { pack: 'elite' }];

const DIFF = [{ id: 0, n: 'Normal', hp: 1, bud: 1, rw: 1, c: '#6BE38A' }, { id: 1, n: 'Difficile', hp: 1.5, bud: 1.2, rw: 1.6, c: '#FFB547' }, { id: 2, n: 'Cauchemar', hp: 2.3, bud: 1.4, rw: 2.5, c: '#FF4B5C' }];

DIFF.push({id:3,n:'Apocalypse',hp:3.5,bud:1.65,rw:3.8,c:'#E687FF'});

const MapGen = (() => {
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function noise2(seed) {
    const p = new Uint8Array(512), R = rng(seed * 7919 + 1); const a = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    for (let i = 0; i < 512; i++) p[i] = a[i & 255];
    const g = (h) => [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]][h & 7];
    const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    return (x, y) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, xf = x - Math.floor(x), yf = y - Math.floor(y);
      const d = (ix, iy, dx, dy) => { const gg = g(p[p[X + ix] + Y + iy]); return gg[0] * dx + gg[1] * dy; };
      const u = f(xf), v = f(yf);
      const a1 = d(0, 0, xf, yf), b1 = d(1, 0, xf - 1, yf), c1 = d(0, 1, xf, yf - 1), d1 = d(1, 1, xf - 1, yf - 1);
      return (a1 + u * (b1 - a1) + v * (c1 - a1) + u * v * (a1 - b1 - c1 + d1)) * 0.7071 * 1.4;
    };
  }
  const fbm = (n, x, y, o = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * n(x * f, y * f); a *= 0.5; f *= 2.03; } return s; };
  // déformation partagée CPU / GPU pour des frontières organiques
  function warp(x, y, k) { return [x + 1.3 * (Math.sin(y * 0.37 + k) + 0.5 * Math.sin(x * 0.91 + k * 1.7)), y + 1.3 * (Math.cos(x * 0.33 + k * 0.6) + 0.5 * Math.cos(y * 0.83 + k * 2.3))]; }

  function shapeAt(sh, u, v, n, S) {
    const r = (cx, cy, rx, ry) => Math.sqrt(((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2);
    const nn = fbm(n, u * 4.2, v * 4.2) * 0.42;
    switch (sh) {
      case 'island': return 1 - r(0.5, 0.5, 0.46, 0.44) + nn;
      case 'river': { const rx = 0.5 + 0.16 * Math.sin(v * 5.2 + 1) + 0.05 * Math.sin(v * 13); const w = 0.035 + v * v * 0.06; let e = Math.abs(u - rx) - w; if (v > 0.9) e = Math.min(e, 0.9 - v + nn * 0.1); const edge = Math.min(u, 1 - u, v + 0.3) * 4 - 0.1; return Math.min(e * 8 + nn * 0.4 + 0.3, edge + nn); }
      case 'fjord': { const cy = 0.5 + 0.12 * Math.sin(u * 6.5); const fj = u > 0.42 ? Math.abs(v - cy) - (0.03 + (u - 0.42) * 0.12) : 1; const base = Math.min(u + 0.4, v + 0.4, 1 - v + 0.2, 1.3 - u) * 3; return Math.min(fj * 9 + nn, base + nn); }
      case 'continent': { const oasis = 1 - r(0.25, 0.3, 0.06, 0.05); return 0.8 + nn - Math.max(0, oasis + nn * 0.5) * 1.5; }
      case 'ring': { const d = r(0.5, 0.5, 0.5, 0.5); return 1 - Math.abs(d - 0.66) / 0.24 + nn; }
      case 'city': return 0.9 + nn * 0.4 - (u > 0.86 ? (u - 0.86) * 12 : 0);
      case 'twin': return Math.max(1 - r(0.28, 0.5, 0.26, 0.46), 1 - r(0.74, 0.52, 0.25, 0.44)) + nn;
      case 'archipelago': { const bl = [[0.5, 0.5, 0.2, 0.18], [0.2, 0.25, 0.14, 0.12], [0.8, 0.22, 0.13, 0.14], [0.18, 0.75, 0.13, 0.14], [0.8, 0.78, 0.15, 0.13], [0.5, 0.12, 0.1, 0.08], [0.5, 0.9, 0.11, 0.08]]; let m = -9; for (const b of bl) m = Math.max(m, 1 - r(b[0], b[1], b[2], b[3])); return m + nn * 0.8; }
      case 'highland': return 0.9 + nn;
      case 'lakes': { let k = 0.88 + nn; for (const [cx, cy, rr] of [[0.25, 0.3, 0.1], [0.72, 0.28, 0.12], [0.3, 0.8, 0.09], [0.78, 0.75, 0.08]]) k -= Math.max(0, 1 - r(cx, cy, rr, rr * 0.85)) * 1.6; return k; }
      case 'mesa': return 0.92 + nn * 0.7;
      case 'bay': return 1 - r(0.5, 0.66, 0.66, 0.6) + nn - Math.max(0, 1 - r(0.5, 0.22, 0.22, 0.34)) * 1.6;
      case 'peninsula': return 1 - r(0.5, 0.95, 0.34, 0.8) + nn * 1.1;
    }
    return 1;
  }

  function generate(P) {
    const S = P.size, res = 0.625, C = Math.round(S / res), Rr = C, B = BIOME[P.biome];
    const N = noise2(P.seed), N2 = noise2(P.seed + 99), N3 = noise2(P.seed + 777);
    const H = new Float32Array(C * Rr), obst = new Uint8Array(C * Rr);
    const idx = (c, r) => r * C + c;
    const cit = { x: P.cit[0] * S, y: P.cit[1] * S };
    const mountainAmt = (B.hill || 0.5) * (P.shape === 'highland' ? 1.35 : P.shape === 'fjord' ? 1.4 : 1);
    for (let r = 0; r < Rr; r++) for (let c = 0; c < C; c++) {
      const x = (c + 0.5) * res, y = (r + 0.5) * res, u = x / S, v = y / S;
      let e = shapeAt(P.shape, u, v, N, S) - 0.12;
      let h;
      if (e <= 0) h = Math.max(-1, e * 1.6);
      else {
        const ridge = 1 - Math.abs(fbm(N2, x * 0.09, y * 0.09, 4) * 2);
        const hills = Math.max(0, fbm(N3, x * 0.06, y * 0.06, 3)) * 0.7;
        h = Math.min(1, 0.06 + Math.min(e, 0.35) * 0.4 + hills * 0.5 + Math.max(0, ridge - 0.55) * mountainAmt * 1.25);
      }
      const dc = Math.hypot(x - cit.x, y - cit.y);
      if (dc < 3.2) { const k = Math.max(0, (dc - 2) / 1.2); h = Math.max(0.06, Math.min(h, 0.06 + k * 0.4)); if (h < 0.06) h = 0.06; }
      H[idx(c, r)] = h;
      if (h > 0.6) obst[idx(c, r)] = 1;
    }
    // ville : pâtés d'immeubles
    const blocks = [];
    if (P.shape === 'city') {
      const bs = 3.2, st = 1.1;
      for (let by = 0; by * bs < S; by++) for (let bx = 0; bx * bs < S; bx++) {
        const x0 = bx * bs + st / 2, y0 = by * bs + st / 2, w = bs - st, cx = x0 + w / 2, cy = y0 + w / 2;
        if (Math.hypot(cx - cit.x, cy - cit.y) < 4.2) continue;
        const nn = fbm(N2, cx * 0.2, cy * 0.2);
        if (nn < -0.12) { blocks.push({ x: cx, y: cy, w, h: w, park: true }); continue; }
        blocks.push({ x: cx, y: cy, w, h: w, tall: 0.6 + (nn + 0.5) * 2.2 + fbm(N3, cx, cy) * 1.2 });
        for (let r = Math.floor(y0 / res); r < Math.ceil((y0 + w) / res); r++) for (let c = Math.floor(x0 / res); c < Math.ceil((x0 + w) / res); c++) if (c >= 0 && r >= 0 && c < C && r < Rr && H[idx(c, r)] > 0) obst[idx(c, r)] = 2;
      }
    }
    const land = (c, r) => c >= 0 && r >= 0 && c < C && r < Rr && H[idx(c, r)] > 0;
    const cellOf = (x, y) => [Math.max(0, Math.min(C - 1, Math.floor(x / res))), Math.max(0, Math.min(Rr - 1, Math.floor(y / res)))];
    const heightAt = (x, y) => { const fx = x / res - 0.5, fy = y / res - 0.5, c0 = Math.max(0, Math.min(C - 2, Math.floor(fx))), r0 = Math.max(0, Math.min(Rr - 2, Math.floor(fy))), tx = Math.max(0, Math.min(1, fx - c0)), ty = Math.max(0, Math.min(1, fy - r0)); const a = H[idx(c0, r0)], b = H[idx(c0 + 1, r0)], cc = H[idx(c0, r0 + 1)], d = H[idx(c0 + 1, r0 + 1)]; return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + cc * (1 - tx) * ty + d * tx * ty; };

    // distance à la côte (pour que les navires longent les côtes)
    const dLand = new Float32Array(C * Rr).fill(99);
    { const qq = []; for (let i = 0; i < H.length; i++) if (H[i] > 0) { dLand[i] = 0; qq.push(i); } for (let h = 0; h < qq.length; h++) { const i = qq[h], c = i % C, r = (i / C) | 0; for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= C || nr >= Rr) continue; const j = idx(nc, nr); if (dLand[j] > dLand[i] + 1) { dLand[j] = dLand[i] + 1; qq.push(j); } } } }
    // ---------------- fronts (A*) ----------------
    const bridgesOK = ['river', 'twin', 'archipelago', 'fjord', 'island', 'ring'].includes(P.shape);
    const laneCost = new Float32Array(C * Rr);
    const lanes = [];
    const [gc, gr] = cellOf(cit.x, cit.y);
    function astar(sc, sr, kind) {
      const open = [], g = new Float32Array(C * Rr).fill(Infinity), from = new Int32Array(C * Rr).fill(-1), closed = new Uint8Array(C * Rr);
      const hf = (c, r) => Math.hypot(c - gc, r - gr);
      const push = (n, f) => { open.push([f, n]); let i = open.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (open[p][0] <= open[i][0]) break; [open[p], open[i]] = [open[i], open[p]]; i = p; } };
      const pop = () => { const t = open[0], l = open.pop(); if (open.length) { open[0] = l; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < open.length && open[a][0] < open[m][0]) m = a; if (b < open.length && open[b][0] < open[m][0]) m = b; if (m === i) break; [open[m], open[i]] = [open[i], open[m]]; i = m; } } return t; };
      const s = idx(sc, sr); g[s] = 0; push(s, hf(sc, sr));
      const cost = (c, r) => {
        const i = idx(c, r), h = H[i];
        if (obst[i]) return Infinity;
        let k;
        if (h <= 0) k = kind === 'w' ? 1 + Math.max(0, Math.min(8, dLand[i]) - 2) * 0.45 : bridgesOK ? 16 : Infinity;
        else k = (kind === 'w' ? 3 : 1) + h * 3;
        const dc = Math.hypot(c - gc, r - gr) * res;
        if (dc > 5) k += laneCost[i];
        return k;
      };
      while (open.length) {
        const [, n] = pop(); if (closed[n]) continue; closed[n] = 1;
        const c = n % C, r = (n / C) | 0;
        if (Math.abs(c - gc) <= 1 && Math.abs(r - gr) <= 1) { const path = []; let k = n; while (k >= 0) { path.push([k % C, (k / C) | 0]); k = from[k]; } return path.reverse(); }
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (!dc && !dr) continue; const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= C || nr >= Rr) continue;
          if (dc && dr && (obst[idx(c + dc, r)] || obst[idx(c, r + dr)])) continue;
          const k = cost(nc, nr); if (k === Infinity) continue;
          const ni = idx(nc, nr), ng = g[n] + k * (dc && dr ? 1.414 : 1);
          if (ng < g[ni]) { g[ni] = ng; from[ni] = n; push(ni, ng + hf(nc, nr) * 1.02); }
        }
      }
      return null;
    }
    const rdp = (pts, eps) => { if (pts.length < 3) return pts; let dm = 0, im = 0; const a = pts[0], b = pts[pts.length - 1]; for (let i = 1; i < pts.length - 1; i++) { const p = pts[i], L = Math.hypot(b.x - a.x, b.y - a.y) || 1, d = Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) / L; if (d > dm) { dm = d; im = i; } } return dm > eps ? [...rdp(pts.slice(0, im + 1), eps).slice(0, -1), ...rdp(pts.slice(im), eps)] : [a, b]; };
    const chaikin = (pts, it) => { for (let k = 0; k < it; k++) { const o = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; o.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 }, { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 }); } o.push(pts[pts.length - 1]); pts = o; } return pts; };
    const SIDE = { N: 'Nord', S: 'Sud', E: 'Est', W: 'Ouest' };
    // The north-east island of the Atoll had no route within defense range.
    // Give it a late naval approach without lengthening the existing fronts.
    const lanePlans=P.id==='atoll'?[...P.lanes,['N',.8,12,'w']]:P.lanes;
    lanePlans.forEach(([side, pos, unlock, kind], li) => {
      kind = kind || 'g';
      let x = side === 'W' ? 0.25 : side === 'E' ? S - 0.25 : pos * S, y = side === 'N' ? 0.25 : side === 'S' ? S - 0.25 : pos * S;
      let [c, r] = cellOf(x, y);
      if (kind === 'g' && !(land(c, r) && !obst[idx(c, r)])) { let bd = 1e9, bc = c, br = r; for (let rr = 0; rr < Rr; rr++) for (let cc = 0; cc < C; cc++) { if (!land(cc, rr) || obst[idx(cc, rr)] || H[idx(cc, rr)] > 0.45) continue; const d = Math.hypot(cc - c, rr - r); if (d < bd) { bd = d; bc = cc; br = rr; } } c = bc; r = br; }
      let raw = astar(c, r, kind);
      if (!raw) { // col creusé dans la montagne
        const save = obst.slice(); for (let i = 0; i < obst.length; i++) if (obst[i] === 1) obst[i] = 0;
        const hard = astar(c, r, kind); obst.set(save);
        if (hard) { for (const [hc, hr] of hard) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const nc = hc + dc, nr = hr + dr; if (nc >= 0 && nr >= 0 && nc < C && nr < Rr && obst[idx(nc, nr)] === 1) { obst[idx(nc, nr)] = 0; H[idx(nc, nr)] = Math.min(H[idx(nc, nr)], 0.52); } } raw = hard; }
      }
      if (!raw) return;
      let pts = raw.map(([c, r]) => ({ x: (c + 0.5) * res, y: (r + 0.5) * res }));
      if (kind === 'w' || !land(c, r)) pts.unshift({ x: Math.max(-1.5, Math.min(S + 1.5, x + (side === 'W' ? -1.5 : side === 'E' ? 1.5 : 0))), y: Math.max(-1.5, Math.min(S + 1.5, y + (side === 'N' ? -1.5 : side === 'S' ? 1.5 : 0))) });
      pts = chaikin(rdp(pts, 0.55), 3);
      // s'arrête au pied de la citadelle
      while (pts.length > 2 && Math.hypot(pts[pts.length - 2].x - cit.x, pts[pts.length - 2].y - cit.y) < 1.6) pts.pop();
      const lp = pts[pts.length - 1], ang = Math.atan2(lp.y - cit.y, lp.x - cit.x); pts[pts.length - 1] = { x: cit.x + Math.cos(ang) * 1.5, y: cit.y + Math.sin(ang) * 1.5 };
      for (const [c2, r2] of raw) for (let dr = -4; dr <= 4; dr++) for (let dc = -4; dc <= 4; dc++) { const nc = c2 + dc, nr = r2 + dr; if (nc >= 0 && nr >= 0 && nc < C && nr < Rr) laneCost[idx(nc, nr)] = Math.max(laneCost[idx(nc, nr)], 5 - Math.hypot(dc, dr)); }
      const L = mkLane(pts); L.id = li; L.kind = kind; L.unlock = unlock; L.side = side; L.name = li>=P.lanes.length?'Îlot nord-est':SIDE[side]; L.start = pts[0];
      // segments sur l'eau = ponts (fronts terrestres) ou navigation
      L.water = []; let inW = -1;
      for (let d = 0; d <= L.len; d += 0.25) { const p = posAt(L, d), w = heightAt(p.x, p.y) <= 0.01 && p.x > 0 && p.y > 0 && p.x < S && p.y < S; if (w && inW < 0) inW = d; if (!w && inW >= 0) { L.water.push([inW, d]); inW = -1; } }
      if (inW >= 0) L.water.push([inW, L.len]);
      // trajectoire aérienne
      const st = { x: Math.max(-2, Math.min(S + 2, x + (side === 'W' ? -2 : side === 'E' ? 2 : 0))), y: Math.max(-2, Math.min(S + 2, y + (side === 'N' ? -2 : side === 'S' ? 2 : 0))) };
      const mid = { x: (st.x + cit.x) / 2 + (st.y - cit.y) * 0.12, y: (st.y + cit.y) / 2 - (st.x - cit.x) * 0.12 };
      L.air = mkLane(chaikin([st, mid, { x: cit.x, y: cit.y - 0.3 }], 3));
      lanes.push(L);
    });

    // Broad buildable terraces alongside the routes; roads stay untouched.
    const hills = [];
    const laneDistance = (x,y) => {let min=Infinity;for(const L of lanes)for(const s of L.segs){const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,l=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((x-s.a.x)*dx+(y-s.a.y)*dy)/(l||1)));min=Math.min(min,(x-s.a.x-t*dx)**2+(y-s.a.y-t*dy)**2);}return Math.sqrt(min);};
    for(const L of lanes) for(let d=5;d<L.len-4;d+=7){
      const p=posAt(L,d),side=hills.length%2?1:-1,x=p.x-Math.sin(p.ang)*3.5*side,y=p.y+Math.cos(p.ang)*3.5*side;
      const radius=2.5, top=.53;
      if(x<4||y<4||x>S-4||y>S-4||heightAt(x,y)<.05||Math.hypot(x-cit.x,y-cit.y)<4||hills.some(h=>Math.hypot(h.x-x,h.y-y)<6))continue;
      if(hills.length>=9)continue;
      if([0,1,2,3,4,5,6,7].some(a=>heightAt(x+Math.cos(a*Math.PI/4)*2,y+Math.sin(a*Math.PI/4)*2)<.04))continue;
      for(let bi=blocks.length-1;bi>=0;bi--){const b=blocks[bi];if(Math.hypot(b.x-x,b.y-y)<4){for(let rr=Math.max(0,Math.floor((b.y-b.h/2)/res));rr<Math.min(Rr,Math.ceil((b.y+b.h/2)/res));rr++)for(let cc=Math.max(0,Math.floor((b.x-b.w/2)/res));cc<Math.min(C,Math.ceil((b.x+b.w/2)/res));cc++)obst[idx(cc,rr)]=0;blocks.splice(bi,1);}}
      hills.push({x,y,r:radius,top,name:'Vigie '+(hills.length+1)});
      for(let rr=Math.max(0,Math.floor((y-4)/res));rr<Math.min(Rr,Math.ceil((y+4)/res));rr++)for(let cc=Math.max(0,Math.floor((x-4)/res));cc<Math.min(C,Math.ceil((x+4)/res));cc++){
        const xx=(cc+.5)*res,yy=(rr+.5)*res,j=idx(cc,rr),dd=Math.hypot(xx-x,yy-y);
        if(dd>radius+1.1||H[j]<=.02||laneDistance(xx,yy)<1.15||obst[j]===2)continue;
        const k=Math.max(0,Math.min(1,(radius+1.1-dd)/1.35)),smooth=k*k*(3-2*k);
        H[j]=H[j]*(1-smooth)+top*smooth;obst[j]=0;
      }
      if(hills.length>=9)break;
    }
    // ---------------- secteurs ----------------
    const R = rng(P.seed * 31 + 5);
    let landCells = 0; for (let i = 0; i < H.length; i++) if (H[i] > 0 && !obst[i]) landCells++;
    const area = landCells * res * res, dmin = Math.sqrt(area / P.sectors) * 0.82;
    const seeds = [{ x: cit.x, y: cit.y }];
    for (let k = 0; k < 6000 && seeds.length < P.sectors; k++) {
      const x = R() * S, y = R() * S, [c, r] = cellOf(x, y);
      if (!land(c, r) || obst[idx(c, r)]) continue;
      if (seeds.every((s) => Math.hypot(s.x - x, s.y - y) >= dmin)) seeds.push({ x, y });
    }
    const wk = P.seed % 7 + 0.3;
    const sectorAt = (x, y) => { const [wx, wy] = warp(x, y, wk); let b = 0, bd = 1e9; for (let i = 0; i < seeds.length; i++) { const d = (wx - seeds[i].x) ** 2 + (wy - seeds[i].y) ** 2; if (d < bd) { bd = d; b = i; } } return b; };
    const cnt = new Array(seeds.length).fill(0), cx = new Array(seeds.length).fill(0), cy = new Array(seeds.length).fill(0);
    for (let r = 0; r < Rr; r++) for (let c = 0; c < C; c++) if (H[idx(c, r)] > 0 && !obst[idx(c, r)]) { const x = (c + 0.5) * res, y = (r + 0.5) * res, s = sectorAt(x, y); cnt[s]++; cx[s] += x; cy[s] += y; }
    const names = SECTOR_NAMES[P.biome].slice();
    const order = seeds.map((s, i) => i).sort((a, b) => Math.hypot(seeds[a].x - cit.x, seeds[a].y - cit.y) - Math.hypot(seeds[b].x - cit.x, seeds[b].y - cit.y));
    const sectors = seeds.map((s, i) => {
      const d = Math.hypot(s.x - cit.x, s.y - cit.y), rank = order.indexOf(i);
      return { id: i, x: s.x, y: s.y, lx: cnt[i] ? cx[i] / cnt[i] : s.x, ly: cnt[i] ? cy[i] / cnt[i] : s.y, area: cnt[i] * res * res, d, name: i === 0 ? 'Citadelle' : names[rank] || 'Secteur ' + rank,
        cost: rank <= 2 ? 0 : Math.round((55 + d * 5.2) / 5) * 5, inf: d > S * 0.42 ? 2 : 1, income: Math.max(12, Math.min(28, Math.round(12 + cnt[i] * res * res / 8))), owned: rank <= 2 };
    });

    const distLane=laneDistance,slots=[];for(const sector of sectors)sector.slots=0;
    // ---------------- décor ----------------
    const occupied = (x, y, rad) => hills.some(h=>Math.hypot(x-h.x,y-h.y)<h.r+.8) || distLane(x, y) < rad || slots.some((s) => (s.x - x) ** 2 + (s.y - y) ** 2 < 0.8) || Math.hypot(x - cit.x, y - cit.y) < 2.6;
    const trees = [], rocks = [], houses = [];
    const treeN = noise2(P.seed + 5);
    for (let y = 0.3; y < S; y += 0.55) for (let x = 0.3; x < S; x += 0.55) {
      const jx = x + (R() - 0.5) * 0.5, jy = y + (R() - 0.5) * 0.5, [c, r] = cellOf(jx, jy), h = H[idx(c, r)];
      if (h <= 0.03 || obst[idx(c, r)] === 2) continue;
      const f = fbm(treeN, jx * 0.12, jy * 0.12, 3) + (B.tree === 'jungle' ? 0.25 : B.tree === 'palm' ? -0.18 : B.tree === 'dead' ? -0.1 : 0);
      if (h > 0.6) { if (R() < 0.15 && rocks.length < 500) rocks.push({ x: jx, y: jy, s: 0.4 + R() * 0.6, r: R() * 6 }); continue; }
      if (f > 0.1 && h < 0.55 && !occupied(jx, jy, 0.75) && trees.length < 1800) trees.push({ x: jx, y: jy, s: 0.7 + R() * 0.6, r: R() * 6, v: R() });
      else if (h > 0.38 && R() < 0.06 && !occupied(jx, jy, 0.7)) rocks.push({ x: jx, y: jy, s: 0.25 + R() * 0.35, r: R() * 6 });
    }
    if (P.shape !== 'city') {
      const vs = sectors.filter((s) => !s.owned).sort(() => R() - 0.5).slice(0, 3);
      for (const s of vs) for (let i = 0; i < 6; i++) { const a = R() * 6.28, d = 0.6 + R() * 1.6, x = s.lx + Math.cos(a) * d, y = s.ly + Math.sin(a) * d, [c, r] = cellOf(x, y); if (H[idx(c, r)] > 0.03 && H[idx(c, r)] < 0.5 && !obst[idx(c, r)] && !occupied(x, y, 1)) houses.push({ x, y, r: Math.round(R() * 4) * (Math.PI / 2) + (R() - 0.5) * 0.3, s: 0.8 + R() * 0.4, v: R() }); }
      for (let i = trees.length - 1; i >= 0; i--) if (houses.some((h) => (h.x - trees[i].x) ** 2 + (h.y - trees[i].y) ** 2 < 0.5)) trees.splice(i, 1);
    }
    // Clear terraces for building; individual trees elsewhere remain decorative.
    for(let i=trees.length-1;i>=0;i--)if(hills.some(h=>Math.hypot(trees[i].x-h.x,trees[i].y-h.y)<h.r+.8))trees.splice(i,1);
    return { P, S, res, C, Rr, H, obst, cit, lanes, sectors, slots: [], trees, rocks, houses, blocks, hills, roadScale:1.2, roadHalfWidth:.52*1.2, laneDistance, sectorAt, heightAt, warpK: wk, seeds, biome: B, lava: !!B.lava && P.shape === 'ring' };
  }
  function mkLane(pts) { const segs = []; let len = 0; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b.x - a.x, b.y - a.y); if (l < 1e-6) continue; segs.push({ a, b, l, s: len, ang: Math.atan2(b.y - a.y, b.x - a.x) }); len += l; } return { pts, segs, len }; }
  function posAt(L, d) { d = Math.max(0, Math.min(L.len, d)); let lo = 0, hi = L.segs.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (L.segs[m].s + L.segs[m].l < d) lo = m + 1; else hi = m; } const s = L.segs[lo], t = s.l ? (d - s.s) / s.l : 0; return { x: s.a.x + (s.b.x - s.a.x) * t, y: s.a.y + (s.b.y - s.a.y) * t, ang: s.ang }; }
  const CACHE = {};
  function get(id) { if (CACHE[id]) return CACHE[id]; const P = MAPS.find((m) => m.id === id) || id; return (CACHE[P.id || id] = generate(P)); }
  return { generate, get, posAt, mkLane, warp };
})();

// =====================================================================
//  MOTEUR DE COMBAT v8 — secteurs, fronts, armée (unités monde)
// =====================================================================
// Shared rules: this exact module is compiled into browser and server bundles.
const Tactical = (() => {
  const cfg = {"weather":{"phaseSeconds":120,"noticeSeconds":12,"fogRange":0.88,"rainBurn":0.65,"snowSpeed":0.92,"strikeEvery":18,"strikeRadius":1.8,"strikeNotice":3},"reactions":{"cooldown":1.5,"bonusCap":40,"pvpBonusCap":8,"maxClouds":6}};
  const climates = {
    tempere: ['clear','rain','fog','storm','wind'], marais: ['clear','fog','rain','storm','wind'],
    neige: ['clear','snow','wind','fog'], toundra: ['clear','wind','snow','fog'], alpin: ['clear','snow','fog','wind'],
    desert: ['clear','wind','clear','wind'], volcan: ['clear','wind','fog','wind'], canyon: ['clear','wind','fog','wind'],
    tropical: ['clear','rain','storm','wind'], jungle: ['clear','rain','fog','storm'],
    urbain: ['clear','fog','rain','wind'], automne: ['clear','wind','rain','fog']
  };
  const weatherNames = {clear:'Temps clair',rain:'Pluie',fog:'Brouillard',storm:'Orage',snow:'Neige',wind:'Vent fort'};
  const weatherHelp = {clear:'Aucun modificateur.',rain:'Brûlures plus courtes ; électricité renforcée.',fog:'Portée de tir −12 %. Un radar proche compense.',storm:'Conductivité renforcée. Cercles de foudre annoncés 3 s avant impact.',snow:'Mobilité terrestre −8 % ; givre prolongé.',wind:'Les fumées se dissipent deux fois plus vite.'};
  const reactions = {fracture:['Fracture','#a9e8ff'],thermal:['Choc thermique','#ffb18d'],conductive:['Conductivité','#b4adff'],corrosive:['Vapeur corrosive','#b7e584'],rupture:['Protection rompue','#80bfff']};
  const cloudQueues=new WeakMap();
  const branches = {
    precision:{name:'Perforation',desc:'Dégâts +25 %, pénétration +15 points ; délai entre tirs +10 %.',dmg:1.25,rate:1.1,pierce:.15},
    barrage:{name:'Barrage',desc:'Cadence +25 %, zone +15 % ; dégâts par tir −15 %.',dmg:.85,rate:.8,splash:1.15},
    control:{name:'Contrôle',desc:'Durée du ralentissement +35 %, portée +10 % ; dégâts −15 %.',dmg:.85,range:1.1,slow:1.35},
    reach:{name:'Vigie',desc:'Portée +20 % ; délai entre tirs +12 %.',range:1.2,rate:1.12},
    support:{name:'Amplification',desc:'Soutien et revenus +20 % ; couverture −10 %.',support:1.2,range:.9}
  };
  const orders = {
    assault:{name:'Tir soutenu',desc:'Cadence +12 % pendant 2 vagues.',rate:1/1.12},
    lookout:{name:'Observation',desc:'Portée +12 % pendant 2 vagues.',range:1.12},
    recovery:{name:'Réactivité',desc:'Recharge des pouvoirs accélérée de 25 % pendant 2 vagues.',ability:1.25}
  };
  function init(B) {
    B.weather={kind:'clear',next:'clear',phase:-1,endsAt:cfg.weather.phaseSeconds,warnings:[],strikeCycle:-1};
    B.tactical={reactions:0,log:[],leaked:{},orders:0};
    B.orderOffer=null;B.order=null;
  }
  function weatherAt(B,time=B.t) {
    const list=climates[B.P.biome]||climates.tempere, phase=Math.floor(time/cfg.weather.phaseSeconds);
    // Clear opening, then a seed-dependent rotation. No mutable RNG state.
    const kindAt=n=>n===0?'clear':list[1+((n-1+(B.P.seed%Math.max(1,list.length-1)))%(list.length-1))];
    return {phase,kind:kindAt(phase),next:kindAt(phase+1),endsAt:(phase+1)*cfg.weather.phaseSeconds};
  }
  function tick(B,dt) {
    if(!B.weather)init(B);
    const w=B.weather,next=weatherAt(B);
    if(w.phase!==next.phase){Object.assign(w,next);w.warnings=[];w.strikeCycle=-1;B.ev.push({k:'weather',name:weatherNames[w.kind]});Engine.refresh(B);}
    if(w.endsAt-B.t<=cfg.weather.noticeSeconds&&w.noticePhase!==w.phase){w.noticePhase=w.phase;B.ev.push({k:'weatherSoon',name:weatherNames[w.next]});}
    if(w.kind==='storm'&&B.phase==='wave'){
      const cycle=Math.floor(B.t/cfg.weather.strikeEvery),impact=(cycle+1)*cfg.weather.strikeEvery;
      if(w.strikeCycle!==cycle){
        w.strikeCycle=cycle;
        const sites=B.pvp?(B.W.bases||[B.W.cit]).map(p=>{const dx=B.W.S/2-p.x,dy=B.W.S/2-p.y,len=Math.hypot(dx,dy)||1;return {x:p.x+dx/len*6,y:p.y+dy/len*6};}):Engine.activeLanes(B).map(l=>MapGen.posAt(l,l.len*(.4+(cycle%3)*.12)));
        w.warnings=sites.map(p=>({x:p.x,y:p.y,r:cfg.weather.strikeRadius,at:impact,hit:false}));
      }
      for(const q of w.warnings)if(!q.hit&&B.t+dt>=q.at){
        q.hit=true;for(const m of B.mobs)if(!m.dead&&Math.hypot(m.x-q.x,m.y-q.y)<=q.r)Engine.hit(B,m,Math.min(B.pvp?18:35,m.maxHp*.06),{dt:'energy',reaction:false,ev:false});
        B.ev.push({k:'lightning',x:q.x,y:q.y,r:q.r});
      }
    }else w.warnings=[];
  }
  function wet(B,m){return m.onWater||['rain','storm'].includes(B.weather?.kind);}
  function cold(S){return ['cryo','frostbattery'].includes(S.fam)||!!S.freeze;}
  function event(B,m,key){
    const [name,color]=reactions[key];m.reactionReady=B.t+cfg.reactions.cooldown;
    B.tactical.reactions++;B.tactical.log.push({name,at:B.t});if(B.tactical.log.length>5)B.tactical.log.shift();
    B.ev.push({k:'reaction',name,key,x:m.x,y:m.y,c:color});
  }
  function impact(B,m,dmg,S){
    if(S.reaction===false||dmg<=0||!B.tactical)return 0;
    const fire=S.dt==='fire'&&S.fam, chilled=m.frz>0||(m.chillUntil||0)>B.t;
    if((m.reactionReady||0)>B.t)return 0;
    let key=null,extra=0;
    if((fire&&chilled)||(cold(S)&&m.burnT>0)){
      key='thermal';extra=Math.min(dmg*.3,m.maxHp*.05);m.frz=0;m.slowT=0;m.chillUntil=0;m.burnT=0;m._thermalAt=B.t;
    }else if(chilled&&(['shell','missile','mine'].includes(S.kind)||S.fam==='canon')){
      key='fracture';extra=Math.min(dmg*(m.arm>.1?.3:.15),m.maxHp*.05);m.frz=0;m.chillUntil=0;m.slowT=0;
    }else if((fire&&m.acidT>0)||(S.dt==='acid'&&m.burnT>0)){
      key='corrosive';
      // Bounded independent cloud. It cannot trigger reactions of its own.
      const cloud={x:m.x,y:m.y,r:.75,t:1.4,T:1.4,dps:B.pvp?2:5,born:B.t,tw:S.tw,mark:0,reactionCloud:true};
      B.puddles.push(cloud);
      // A bounded queue avoids scanning an ever-growing array during mass reactions.
      const clouds=(cloudQueues.get(B)||[]).filter(p=>p.t>0);clouds.push(cloud);
      while(clouds.length>cfg.reactions.maxClouds)clouds.shift().t=0;
      cloudQueues.set(B,clouds);
    }else if(S.kind==='chain'&&wet(B,m)){
      key='conductive';extra=dmg*.12;
    }else if(m.shield>0&&['pulse','emp','sonic'].includes(S.fam)){
      key='rupture';m.shield=Math.max(0,m.shield-Math.min(m.maxShield*.2,B.pvp?18:45));
    }
    if(key){event(B,m,key);return Math.min(extra,B.pvp?cfg.reactions.pvpBonusCap:cfg.reactions.bonusCap);}
    return 0;
  }
  function effect(B,m,S){
    if(cold(S)&&!m.def.noSlow&&m._thermalAt!==B.t)m.chillUntil=B.t+(B.weather?.kind==='snow'?2.4:2);
  }
  function branchOptions(tw){const kind=FAM[CARD[tw.card].fam].kind;
    if(['eco','aura','radar'].includes(kind))return ['reach','support'];
    if(cold(tw.S||{fam:CARD[tw.card].fam}))return ['control','barrage'];
    return ['precision','barrage'];
  }
  function specialize(B,tw,id){
    if(!tw||!B.towers.includes(tw))return 'Défense introuvable';
    if(tw.lvl<2)return 'Améliore cette défense au niveau 2.';
    if(tw.branch)return 'Spécialisation déjà choisie pour cette défense.';
    if(!branchOptions(tw).includes(id))return 'Spécialisation invalide';
    tw.branch=id;Engine.refresh(B);B.ev.push({k:'upgrade',x:tw.x,y:tw.y,tw:tw.id,c:'#ecc779'});return true;
  }
  function stats(S,tw){const q=branches[tw.branch];if(!q)return S;
    // Smaller modifiers in competitive games; meaningful tradeoffs are retained.
    const factor=v=>tw.pvp?1+(v-1)*.55:v;
    if(q.dmg)S.dmg*=factor(q.dmg);if(q.rate)S.rate*=factor(q.rate);if(q.range)S.range*=factor(q.range);
    if(q.pierce)S.pierce=Math.min(.85,S.pierce+q.pierce*(tw.pvp?.55:1));
    if(q.splash)S.splash*=factor(q.splash);if(q.slow&&S.slow)S.slow={...S.slow,d:S.slow.d*factor(q.slow)};
    if(q.support){for(const key of ['income','buffRate','buffDmg','buffRange','buffCrit','mark'])if(Number.isFinite(S[key]))S[key]*=factor(q.support);S.income=Math.round(S.income||0);}
    return S;
  }
  function boardStats(B,tw){
    const S=tw.S;
    if(B.weather?.kind==='fog'&&!['eco','radar','aura'].includes(S.kind)){
      const radarOrder=!B.pvp&&B.order?orders[B.order.id]?.range||1:1;
      const covered=B.towers.some(t=>t.S?.kind==='radar'&&t.jam<=0&&Math.hypot(t.x-tw.x,t.y-tw.y)<=Engine.stats(t).range*radarOrder);
      if(!covered)S.range*=cfg.weather.fogRange;
    }
    if(B.order&&!B.pvp){const o=orders[B.order.id];if(o?.rate)S.rate*=o.rate;if(o?.range)S.range*=o.range;}
    if(S.maxRange)S.range=Math.min(S.range,S.maxRange);
  }
  function onStart(B){if(B.order&&B.wave>B.order.untilWave){B.order=null;Engine.refresh(B);}B.orderOffer=null;}
  function onClear(B){if(!B.pvp&&B.wave>0&&B.wave%3===0&&(B.endless||B.wave<B.maxWave))B.orderOffer={wave:B.wave,options:Object.keys(orders)};}
  function chooseOrder(B,id){
    if(B.pvp||B.phase!=='build'||!B.orderOffer||!B.orderOffer.options.includes(id))return 'Ordre indisponible';
    B.order={id,untilWave:B.wave+2};B.orderOffer=null;B.tactical.orders++;Engine.refresh(B);return true;
  }
  function leaked(B,m){if(!B.tactical)return;B.tactical.leaked[m.type]=(B.tactical.leaked[m.type]||0)+m.def.dmg;}
  function advice(counts){
    let air=0,armor=0,stealth=0,swarm=0,shield=0;
    for(const [id,n] of Object.entries(counts||{})){const d=UNIT[id];if(!d)continue;if(d.mv==='a')air+=n;if(d.arm>=.25)armor+=n;if(d.stealth||d.sub)stealth+=n;if(d.shield)shield+=n;if(d.t==='inf')swarm+=n;}
    const lines=[];if(air)lines.push({key:'air',n:air,label:'Aériens',tip:'Mitrailleuse, missiles ou DCA : les mortiers ne les touchent pas.'});
    if(armor)lines.push({key:'armor',n:armor,label:'Blindés',tip:'Canon perforant, antichar ou cryo suivi d’un impact explosif.'});
    if(stealth)lines.push({key:'stealth',n:stealth,label:'Camouflage',tip:'Place un radar pour révéler les ennemis cachés.'});
    if(shield)lines.push({key:'shield',n:shield,label:'Boucliers',tip:'Tesla et IEM : l’électricité est efficace contre leurs protections.'});
    if(swarm||!lines.length)lines.push({key:'swarm',n:swarm,label:'Infanterie',tip:'Mitrailleuse et mortier couvrent les groupes ; le cryo les retient.'});
    return lines;
  }
  const grids=new WeakMap(),identities=new WeakMap();
  function target(B,id){const pool=B.enemyPool||B.mobs,g=identities.get(B),m=g?.pool===pool?g.byId.get(id):pool.find(m=>m.id===id);return m&&!m.dead?m:undefined;}
  function index(B){const pool=B.enemyPool||B.mobs,byId=new Map();for(const m of pool)if(!m.dead)byId.set(m.id,m);identities.set(B,{pool,byId});if(pool.length<32){grids.delete(B);return;}const cells=new Map(),order=new Map();let radius=0;
    pool.forEach((m,i)=>{if(m.dead)return;order.set(m,i);radius=Math.max(radius,m.def.r||0);const k=Math.floor(m.x/4)+':'+Math.floor(m.y/4);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(m);});grids.set(B,{pool,cells,order,radius});
  }
  function candidates(B,p,r){const pool=B.enemyPool||B.mobs,g=grids.get(B);if(!g||g.pool!==pool||r>24)return pool;
    const radius=r+g.radius*.6,out=[];for(let x=Math.floor((p.x-radius)/4);x<=Math.floor((p.x+radius)/4);x++)for(let y=Math.floor((p.y-radius)/4);y<=Math.floor((p.y+radius)/4);y++){const bucket=g.cells.get(x+':'+y);if(bucket)out.push(...bucket);}
    // Preserve original target tie-breaking, including taunt priority.
    return out.sort((a,b)=>g.order.get(a)-g.order.get(b));
  }
  function invalidate(B){grids.delete(B);identities.delete(B);}
  function* areaCandidates(B,p,r){
    const pool=B.enemyPool||B.mobs,initial=pool.length,near=candidates(B,p,r);
    // Array iterators include children spawned by a kill during the same blast.
    // Preserve that behavior even when the spatial query returns a separate list.
    yield* near;
    if(near!==pool)for(let i=initial;i<pool.length;i++)yield pool[i];
  }
  return {cfg,init,tick,weatherAt,weatherNames,weatherHelp,reactions,wet,impact,effect,branches,branchOptions,specialize,stats,boardStats,orders,onStart,onClear,chooseOrder,leaked,advice,index,candidates,areaCandidates,target,invalidate};
})();

// Profiles come from combat stats, including rarity traits and PvP normalization.
const DefenseGuide=(()=>{
  let mode='pve',filter='all';
  const labels={instant:'Impact immédiat',dot:'Dégâts dans la durée',slow:'Ralentissement',armor:'Anti-armure',shield:'Anti-bouclier',air:'Anti-aérien',area:'Zone / groupes',support:'Soutien',close:'Défense rapprochée'};
  function profile(id,pvp=false){
    const c=CARD[id],f=FAM[c.fam],S=Engine.stats({card:id,lvl:1,clvl:1,pvp}),roles=[];
    const cold=['cryo','frostbattery'].includes(c.fam)||!!S.freeze,fire=S.dt==='fire'||S.burn>0,acid=S.dt==='acid';
    const element=cold?'❄ Givre':S.dt==='fire'?'♨ Feu':acid?'◈ Acide':S.kind==='chain'?'ϟ Électricité':S.dt==='energy'?'✦ Énergie':S.dt==='true'?'◎ Dégâts purs':S.dt==='none'?'◇ Soutien':'◆ Physique';
    if(S.dmg&&S.kind!=='puddle'&&S.kind!=='beam')roles.push('instant');
    if(S.kind==='puddle'||S.kind==='beam'||S.burn)roles.push('dot');
    if(S.slow||S.freeze||S.stun||S.vehStun||S.pull)roles.push('slow');
    if(S.pierce||S.melt||acid||S.dt==='fire'||S.dt==='true')roles.push('armor');
    if(S.dt==='energy'||S.shieldMul>1)roles.push('shield');
    if(S.air)roles.push('air');
    if(S.splash||['pulse','cone','gravity','chain','puddle'].includes(S.kind)||S.multi>1)roles.push('area');
    if(['eco','radar','aura'].includes(S.kind))roles.push('support');
    if(S.dmg&&!S.minRange&&!S.airOnly&&S.range<=3.5)roles.push('close');
    return {id,f,S,roles,element,cold,fire,acid,impact:['shell','missile','mine'].includes(S.kind)||c.fam==='canon',electric:S.kind==='chain',rupture:['pulse','emp','sonic'].includes(c.fam)};
  }
  const reactions=[
    {key:'fracture',left:'Givre',right:'Obus / missile / mine / canon',name:'Fracture',effect:'Impact renforcé (+15 %, ou +30 % contre une armure >10 %). Consomme le givre.',a:p=>p.cold,b:p=>p.impact},
    {key:'thermal',left:'Givre',right:'Feu / brûlure',name:'Choc thermique',effect:'Explosion de dégâts (+30 % de l’impact). Consomme le givre et la brûlure.',a:p=>p.cold,b:p=>p.fire},
    {key:'corrosive',left:'Acide',right:'Feu / brûlure',name:'Vapeur corrosive',effect:'Petit nuage acide de 1,4 s : 5 dégâts/s en PvE, 2 en PvP.',a:p=>p.acid,b:p=>p.fire},
    {key:'conductive',left:'Eau / pluie / orage',right:'Tesla',name:'Conductivité',effect:'Impact électrique renforcé de 12 %. Dépend du terrain ou de la météo.',environment:true,b:p=>p.electric},
    {key:'rupture',left:'Bouclier ennemi',right:'Onde / IEM / sonique',name:'Protection rompue',effect:'Retire 20 % du bouclier maximal, jusqu’à 45 points en PvE ou 18 en PvP.',environment:true,b:p=>p.rupture}
  ];
  function comboState(ids,pvp=false){const list=ids.filter(id=>CARD[id]).map(id=>profile(id,pvp));return reactions.map(r=>({...r,ready:(r.environment||list.some(r.a))&&list.some(r.b)}));}
  const num=n=>Number(n.toFixed(2));
  function badges(id){const p=profile(id);return '<div class="defense-badges"><span>'+p.element+'</span><span>'+labels[['slow','dot','shield','armor','instant','support'].find(r=>p.roles.includes(r))||'support']+'</span></div>';}
  function detail(id,pvp=false){const p=profile(id,pvp),s=p.S,lines=[];
    if(s.slow)lines.push('Ralentit de '+Math.round(s.slow.p*100)+' % pendant '+num(s.slow.d)+' s. Les résistances ennemies s’appliquent.');
    if(s.freeze)lines.push('Gel : '+Math.round(s.freeze.c*100)+' % de chance, jusqu’à '+num(Math.min(1.8,s.freeze.d))+' s ; les boss résistent.');
    if(p.acid)lines.push('Ignore l’armure. Le contact réduit aussi l’armure restante de '+(pvp?'8':'15')+' % pendant 0,6 s, renouvelé dans le nuage.');
    if(s.pierce)lines.push('Ignore '+Math.round(s.pierce*100)+' % de l’armure sur ce tir ; ne réduit pas l’armure pour les autres tours.');
    if(s.melt)lines.push('Érode définitivement '+num(s.melt*5)+' points de pourcentage d’armure par impact.');
    if(s.burn)lines.push('Brûle pendant '+(pvp?'1,4':'2,5')+' s (durée réduite sous la pluie). Les brûlures ne s’additionnent pas : la plus forte est conservée.');
    if(s.kind==='puddle')lines.push('Nuage : dégâts continus aux ennemis au sol qui restent dans sa zone.');
    if(s.kind==='beam')lines.push('Faisceau continu : dégâts progressifs tant que la cible reste à portée.');
    if(s.dt==='energy')lines.push('Énergie : efficacité doublée sur les boucliers avant les bonus propres à la carte. L’armure reste active.');
    if(s.dt==='fire'||s.dt==='true')lines.push(s.dt==='fire'?'Le feu ignore l’armure et traverse les boucliers.':'Les dégâts purs ignorent l’armure, mais les boucliers les absorbent.');
    if(s.minRange)lines.push('Tir entre '+num(s.minRange)+' et '+num(s.range)+' m : prévois une tour rapprochée dans la zone morte.');
    if(!lines.length)lines.push(p.f.desc);
    return '<section class="defense-detail"><b>'+(pvp?'PvP':'PvE')+' · '+p.element+' · '+p.f.role+'</b><div class="defense-tags">'+p.roles.map(r=>'<span>'+labels[r]+'</span>').join('')+'</div><ul>'+lines.map(t=>'<li>'+t+'</li>').join('')+'</ul></section>';
  }
  function diagram(ids,pvp=false){return '<div class="reaction-map">'+comboState(ids,pvp).map(r=>'<article class="reaction-row '+(r.ready?'ready':'')+'"><div class="reaction-formula"><span>'+r.left+'</span><i>+</i><span>'+r.right+'</span><i>→</i><strong>'+r.name+'</strong></div><p>'+r.effect+'</p><small>'+(r.ready?(r.environment?'✓ Prêt si la condition est présente':'✓ Combinaison dans ton deck'):'À compléter dans ton deck')+'</small></article>').join('')+'</div><p class="reaction-note">Une seule réaction par ennemi toutes les '+Tactical.cfg.reactions.cooldown+' s. Les bonus de dégâts sont plafonnés à '+(pvp?Tactical.cfg.reactions.pvpBonusCap:Tactical.cfg.reactions.bonusCap)+' ; Fracture et Choc thermique sont aussi limités à 5 % des PV max. Les nuages ne déclenchent pas de réaction en chaîne.</p>';}
  function analysis(ids,pvp=false){const ps=ids.filter(id=>CARD[id]).map(id=>profile(id,pvp)),needs=['close','air','slow','armor','area'],missing=needs.filter(r=>!ps.some(p=>p.roles.includes(r)));return {ps,missing};}
  function mount(host,refreshCollection){
    const panel=document.createElement('section');panel.className='deck-lab';panel.setAttribute('aria-label','Analyse du deck et réactions');host.querySelector('.deck8').after(panel);
    function paint(){const pvp=mode==='pvp',{ps,missing}=analysis(G.deck,pvp),cost=ps.reduce((n,p)=>n+Engine.cost(p.id,pvp),0),suggest=CARDS.filter(c=>owned(c.id)&&!G.deck.includes(c.id)).filter(c=>profile(c.id,pvp).roles.some(r=>missing.includes(r))).sort((a,b)=>Engine.cost(a.id,pvp)-Engine.cost(b.id,pvp)).slice(0,3);
      panel.innerHTML='<header><div><small>COMPOSE TA DÉFENSE</small><h3>Rôles & réactions</h3></div><div class="deck-mode" role="group" aria-label="Mode d’analyse"><button data-guide-mode="pve" aria-pressed="'+!pvp+'">PvE</button><button data-guide-mode="pvp" aria-pressed="'+pvp+'">PvP</button></div></header><p>'+ps.length+' / 6 défenses · coût moyen '+(ps.length?Math.round(cost/ps.length):0)+' ⚡ · '+(pvp?'Statistiques normalisées, niveaux de collection ignorés.':'Profil de base des cartes ; les améliorations en partie renforcent leurs effets.')+'</p><div class="deck-coverage">'+['close','air','slow','armor','area'].map(r=>'<span class="'+(missing.includes(r)?'missing':'covered')+'">'+(missing.includes(r)?'○ ':'✓ ')+labels[r]+'</span>').join('')+'</div><p role="status">'+(missing.length?'À prévoir : '+missing.map(r=>labels[r].toLowerCase()).join(', ')+'.':'Les cinq rôles principaux sont couverts. Adapte le placement et les cartes à la vague.')+'</p>'+(ps.some(p=>p.S.minRange)?'<p>◎ Protège les zones mortes de tes artilleries avec une défense rapprochée.</p>':'')+(suggest.length?'<div class="deck-suggestions">Cartes possédées à examiner : '+suggest.map(c=>'<button data-guide-card="'+c.id+'">'+c.n+'</button>').join('')+'</div>':'')+'<details class="deck-reactions"><summary>Schéma des réactions élémentaires</summary>'+diagram(G.deck,pvp)+'</details><details><summary>Effets des cartes de ce deck</summary>'+ps.map(p=>'<h4>'+CARD[p.id].n+'</h4>'+detail(p.id,pvp)).join('')+'</details>';
    }
    panel.onclick=e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.guideMode){mode=b.dataset.guideMode;paint();refreshCollection?.();panel.querySelector('[data-guide-mode="'+mode+'"]').focus();}if(b.dataset.guideCard)cardSheet(b.dataset.guideCard);};paint();
    const wrap=document.createElement('label');wrap.className='defense-role-filter';wrap.innerHTML='Filtrer par effet <select aria-label="Rôle de défense"><option value="all">Tous les effets</option>'+Object.entries(labels).map(([id,n])=>'<option value="'+id+'">'+n+'</option>').join('')+'</select>';host.querySelector('#catalogueCount').before(wrap);const select=wrap.querySelector('select');select.value=filter;select.disabled=arsenalType==='units';select.onchange=()=>{filter=select.value;renderArsenal();};
  }
  function matches(id){return filter==='all'||!!CARD[id]&&profile(id,mode==='pvp').roles.includes(filter);}
  return {profile,badges,detail,diagram,analysis,comboState,mount,matches,reactions};
})();


const Engine = (() => {
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const posAt = MapGen.posAt;
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function mission(id) { return MAPS.find((m) => m.id === id); }

  function create(o) {
    const P = o.preset || mission(o.mission) || MAPS[0];
    const W = o.world || MapGen.get(P.id);
    const pool = [...CORE, ...BIOME[P.biome].extra];
    if (W.lanes.some((l) => l.kind === 'w')) for (const k of ['hover', 'vedette', 'barge']) if (!pool.includes(k)) pool.push(k);
    const B = {
      P, W, deck: (Array.isArray(o.deck) ? o.deck : []).filter((d,i,a)=>CARD[d.id]&&a.findIndex(x=>x.id===d.id)===i).slice(0,MAX_DECK), endless: !!o.endless, t: 0, phase: 'build', wave: 0, maxWave: o.endless ? 9999 : P.waves, hp: 20, maxHp: 20, energy: 280 + P.tier * 15, inf: 2,
      tierHp: (o.endless ? 0.9 : P.hp) * (o.diff ? DIFF[o.diff].hp : 1), diff: o.diff || 0, tier: P.tier, pool, owned: W.sectors.map((s) => s.owned),
      towers: [], mobs: [], shots: [], puddles: [], smokes: [], mines: [], queue: [], wt: 0, ev: [], kills: 0, leaks: 0, bosses: 0, nid: 1, rnd: rng(o.seed || 12345),
      ab: { strike: { cd: 0, max: 40 }, stasis: { cd: 0, max: 35 } }, stats: { dmg: 0, built: 0, earned: 0, annexed: 0, upgraded3: 0 }, seen: {}, waveInfo: null, speed: 1, paused: false,
    };
    B.next = () => B.nid++; Tactical.init(B);
    return B;
  }
  const activeLanes = (B, w = B.wave) => B.W.lanes.filter((l) => l.unlock <= Math.max(1, w));

  // ---------------- secteurs ----------------
  function annex(B, sid) {
    if(['lose','win'].includes(B.phase))return 'Partie terminée';
    const s = B.W.sectors[sid]; if (!Number.isInteger(sid)||!s) return 'Secteur invalide'; if(B.owned[sid])return 'Zone déjà disponible';
    if (B.energy < s.cost) return `Il faut ${s.cost} d'énergie`;
    if (B.inf < s.inf) return 'Influence insuffisante : repousse une vague pour en gagner';
    B.energy -= s.cost; B.inf -= s.inf; B.owned[sid] = true; B.stats.annexed++;
    B.ev.push({ k: 'annex', sid, x: s.lx, y: s.ly }); return true;
  }
  const income = (B) => B.W.sectors.reduce((a, s, i) => a + (B.owned[i] ? s.income : 0), 0);

  // ---------------- tours ----------------
  // Metres in world coordinates. Caps also apply after height, support and orders.
  const firingLimits=Object.freeze({orbital:{min:10,max:40,damage:.85},mortar:{min:1.65,max:7,damage:.92},sniper:{min:1.95,max:8,damage:.92},rail:{min:1.9,max:9,damage:.92},mlrs:{min:2.5,max:10,damage:.9},obusier:{min:2.7,max:11,damage:.9},siege:{min:2.8,max:11,damage:.9},frostbattery:{min:1.75,max:7,damage:.95},skyguard:{min:1.6,max:7.5,damage:.95}});
  const pvpDeadZones=Object.freeze({canon:.8,mortar:1.65,sniper:1.95,rail:1.9,mlrs:2.5,obusier:2.7,siege:2.8,orbital:3.2,antitank:1.2,frostbattery:1.75,skyguard:1.6,flak:1.1,plasma:1.1,missile:.9});
  function cost(cardId,pvp=false) { const c = CARD[cardId]; return Math.round(FAM[c.fam].cost * (1 + 0.12 * RI(c.r))+(pvp&&c.fam==='orbital'?110:0)); }
  function upCost(tw) { return tw.lvl >= 3 ? 0 : Math.round(cost(tw.card,!!tw.pvp) * [0.75, 1.25][tw.lvl - 1]); }
  function stats(tw) {
    const c = CARD[tw.card], f = FAM[c.fam], tr = c.tr, ri = RI(c.r), L = tw.lvl - 1, cl = tw.pvp?1:(tw.clvl || 1), b = tw.buff || { rate: 0, dmg: 0, range: 0, crit: 0 };
    const limits=firingLimits[c.fam];
    const rarityDamage=tw.pvp?1+.075*ri:RMUL.dmg[ri],rarityRate=tw.pvp?1+.035*ri:RMUL.rate[ri];
    let range = f.range * RMUL.rng[ri] * (tr.rangeMul || 1) * [1, 1.08, 1.16][L] * (1 + b.range);
    if (f.kind === 'radar' && (tr.rangeMul || 1) >= 9) range = 99;
    const bc = tr.crit || f.crit; const crit = bc ? { c: bc.c + b.crit, m: bc.m } : b.crit ? { c: b.crit, m: 2 } : null;
    const S = {
      kind: f.kind, dt: f.dt, pvp:!!tw.pvp, range: range * (tw.high ? 1.25 : 1), minRange:limits?.min||(tw.pvp?(pvpDeadZones[c.fam]||0):0), maxRange:limits?.max||0, crit,
      dmg: f.dmg * rarityDamage * (tw.pvp?[1,1.22,1.5]:[1,1.55,2.3])[L] * (tw.pvp ? .44 : 1) * (1 + 0.08 * (cl - 1)) * (1 + b.dmg) * (tw.pvp?1:(tw.setb || 1)) * (tw.high ? 1.1 : 1),
      rate: f.rate ? f.rate / (rarityRate * (tr.rateMul || 1) * [1, 1.06, 1.14][L]) / (1 + b.rate) : 0,
      splash: f.splash ? f.splash + (tr.splash || 0) + L * 0.1 : tr.splash || 0,
      pierce: Math.max(f.pierce || 0, tr.pierce || 0), air: f.air || !!tr.air, airBonus: f.airBonus || 1,
      slow: tr.slow || f.slow || null, freeze: tr.freeze || null, stun: tr.stun || null, burn: (f.burn || 0) + (tr.burn || 0),
      chains: (f.chains || 0) + (tr.chains || 0) + L, noDecay: !!tr.noDecay, multi: (tr.multishot || 1), exec: tr.execute || 0,
      split: (f.split || 0) + (tr.split || 0), airOnly: !!f.airOnly, infMul: tr.infMul || f.infMul || 1, vehMul: tr.vehMul || f.vehMul || 1, boatMul: tr.boatMul || f.boatMul || 0, shieldMul: tr.shieldMul || f.shieldMul || 1, vehStun: tr.vehStun || f.vehStun || null, max: (f.max || 0) + (tr.maxAdd || 0) + L, width: 0.32 + (tr.width || 0), prefer: f.prefer || null, fam: c.fam, ramp: (f.ramp || 0) + (tr.ramp || 0), beams: tr.beams || 1, salvo: (f.salvo || 0) + (tr.salvo || 0) + (L >= 2 ? 1 : 0),
      knock: tr.knock || 0, pull: (f.pull || 0) + (tr.pull || 0), mark: (f.mark || 0) + (tr.mark || 0), shatter: tr.shatter || 0, melt: tr.melt || 0,
      dur: (f.dur || 0) + (tr.dur || 0) + L * 0.4, bounty: tr.bounty || 0, interest: tr.interest || 0,
      income: f.income ? Math.round(f.income * RMUL.dmg[ri] * [1, 1.6, 2.4][L]) : 0,
      buffRate: f.kind === 'aura' ? (f.buffRate * (1 + 0.3 * ri)) * [1, 1.4, 1.8][L] : 0,
      buffDmg: (tr.buffDmg || 0) * [1, 1.3, 1.6][L], buffRange: tr.buffRange || 0, buffCrit: tr.buffCrit || 0,
    };
    if (f.kind === 'radar') S.mark *= [1, 1.3, 1.6][L];
    if(tw.pvp){
      // Multi-target rarities keep their specialty without replacing several
      // complete defenses at a fraction of the price of the opposing army.
      const parallel=Math.max(1,S.multi,S.beams);
      S.dmg/=S.kind==='orbital'?parallel:Math.sqrt(parallel);
      // Normalize the extra payload relative to this family's common version,
      // so cluster shells and chains keep their role without multiplying every
      // other rarity, upgrade and critical bonus at full strength.
      const cluster=(1+.65*S.split)/(1+.65*(f.split||0));
      const salvo=Math.max(1,S.salvo/Math.max(1,f.salvo||1));
      const chainPower=(n,noDecay)=>noDecay?n+1:(1-Math.pow(.8,n+1))/.2;
      const chain=S.kind==='chain'?chainPower(S.chains,S.noDecay)/chainPower(f.chains||0,false):1;
      const ramp=S.kind==='beam'?(1+S.ramp)/(1+(f.ramp||0)):1;
      const critPower=c=>c?1+c.c*(c.m-1):1;
      const critical=critPower(S.crit)/critPower(f.crit);
      S.dmg/=Math.sqrt(Math.max(1,cluster)*salvo*Math.max(1,chain)*Math.max(1,ramp)*Math.max(1,critical));
      if(S.kind==='orbital'){S.range=Math.min(40,S.range);S.rate=Math.max(15,S.rate);S.dmg=Math.min(45,S.dmg);S.splash=Math.min(.6,S.splash);S.multi=Math.min(2,S.multi);S.exec=0;}
      if(S.slow)S.slow={...S.slow,p:Math.min(.3,S.slow.p),d:Math.min(1.5,S.slow.d)};
      if(S.freeze)S.freeze={...S.freeze,d:Math.min(.65,S.freeze.d)};
      if(S.stun)S.stun={...S.stun,d:Math.min(.55,S.stun.d)};
      if(S.vehStun)S.vehStun={...S.vehStun,d:Math.min(.55,S.vehStun.d)};
      S.burn=Math.min(.35,S.burn);S.buffRate=Math.min(.35,S.buffRate);
    }
    if(limits)S.dmg*=limits.damage;
    Tactical.stats(S,tw);if(S.maxRange)S.range=Math.min(S.range,S.maxRange);return S;
  }
  function refresh(B) {
    const relays = B.towers.filter((t) => FAM[CARD[t.card].fam].kind === 'aura' && !(t.jam > 0));
    for (const t of B.towers) {
      const b = { rate: 0, dmg: 0, range: 0, crit: 0 };
      if (FAM[CARD[t.card].fam].kind !== 'aura') for (const r of relays) { const rs = stats(r); if (dist(r, t) <= rs.range + 0.01) { b.rate = Math.max(b.rate, rs.buffRate); b.dmg = Math.max(b.dmg, rs.buffDmg); b.range = Math.max(b.range, rs.buffRange); b.crit = Math.max(b.crit, rs.buffCrit); } }
      t.buff = b;t.pvp=!!B.pvp;t.S = stats(t);
    }
    // All radar ranges must be current before fog coverage is evaluated.
    for (const t of B.towers) {
      Tactical.boardStats(B,t);
      // The trap area follows the displayed range, including upgrades and relays.
      if(t.S.kind==='mine' && t._mineRange!==t.S.range){
        t._mineRange=t.S.range;t.spots=[];
        for(const L of B.W.lanes)for(let d=0;d<L.len;d+=.4){
          if(L.water.some(([a,b])=>d>=a-.3&&d<=b+.3))continue;
          const p=posAt(L,d);if(Math.hypot(p.x-t.x,p.y-t.y)<=t.S.range)t.spots.push({x:p.x,y:p.y,lane:L.id});
        }
      }
    }
  }
  function radius(card) { const f=CARD[card]?.fam; return ['mlrs','obusier','orbital','forge','void','siege'].includes(f)?.6:['canon','mortar','missile','flak','lourde','napalm','antitank','frostbattery','skyguard','ionlance'].includes(f)?.48:.345; }
  const footprintSamples=Array.from({length:16},(_,i)=>({x:Math.cos(i*Math.PI/8),y:Math.sin(i*Math.PI/8)}));
  function lockedSector(B,p,r=0) {
    let sid=B.W.sectorAt(p.x,p.y);if(!B.owned[sid])return sid;
    if(r>0)for(const q of footprintSamples){sid=B.W.sectorAt(p.x+q.x*r,p.y+q.y*r);if(!B.owned[sid])return sid;}
    return -1;
  }
  function checkPlace(B,di,p) {
    const d=B.deck[di]; if(!d||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return 'Position invalide';
    const W=B.W,r=radius(d.id),x=p.x,y=p.y;
    if(x<r||y<r||x>W.S-r||y>W.S-r)return 'En dehors de la carte';
    if(B.towers.length>=120)return 'Limite de 120 défenses atteinte';
    if((W.bases||[W.cit]).some(b=>Math.hypot(x-b.x,y-b.y)<2+r))return 'Laisse de la place autour de la citadelle';
    if((W.outposts||[]).some(o=>Math.hypot(x-o.x,y-o.y)<1.25+r))return 'Avant-poste : garde le bâtiment libre';
    if(W.laneDistance(x,y)<W.roadHalfWidth+.04+r)return 'POSE INTERDITE · Le socle empiète sur une voie de passage';
    // Circle/rectangle contact leaves genuine free space around building corners.
    if(W.blocks.some(b=>!b.park&&Math.hypot(Math.max(0,Math.abs(x-b.x)-b.w/2),Math.max(0,Math.abs(y-b.y)-b.h/2))<r)||W.houses.some(h=>Math.hypot(x-h.x,y-h.y)<.5+r))return 'Bâtiment dans la zone';
    let low=W.heightAt(x,y),high=low;
    if(!Number.isFinite(low)||low<.035)return 'Eau ou rive : sol ferme nécessaire';
    for(let i=0;i<footprintSamples.length;i+=2){const q=footprintSamples[i],h=W.heightAt(x+q.x*r,y+q.y*r);if(!Number.isFinite(h)||h<.035)return 'Eau ou rive : sol ferme nécessaire';low=Math.min(low,h);high=Math.max(high,h);}
    if(high-low>.24)return 'Pente trop forte pour cette défense';
    const locked=lockedSector(B,p,r);if(locked>=0)return 'ZONE VERROUILLÉE · Achète '+W.sectors[locked].name+' pour construire ici';
    if((B.allTowers?B.allTowers():B.towers).some(t=>Math.hypot(x-t.x,y-t.y)<r+radius(t.card)+.10))return 'Défenses trop proches : espace de sécurité requis';
    if(B.energy<cost(d.id,!!B.pvp))return 'Énergie insuffisante';
    if(['lose','win'].includes(B.phase))return 'Partie terminée';
    return null;
  }
  function canBuild(B, p, di=0) { return !checkPlace(B,di,p); }
  // Local touch assistance: exact validation is shared with the server. No
  // random search, state mutation or teleport to a distant construction zone.
  const placementOffsets=[[.16,8],[.32,12],[.5,16],[.72,20],[.9,24],[1.1,28]].flatMap(([r,n])=>Array.from({length:n},(_,i)=>({x:Math.cos(i*Math.PI*2/n)*r,y:Math.sin(i*Math.PI*2/n)*r})));
  function resolvePlacement(B,di,p){
    const d=B?.deck?.[di];
    if(!d||!CARD[d.id]||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.y<0||p.x>B.W.S||p.y>B.W.S||B.energy<cost(d.id,!!B.pvp)||B.towers.length>=120||['win','lose'].includes(B.phase))return null;
    if(!checkPlace(B,di,p))return {x:p.x,y:p.y};
    for(const q of placementOffsets){const candidate={x:p.x+q.x,y:p.y+q.y};if(!checkPlace(B,di,candidate))return candidate;}
    return null;
  }
  function place(B, di, p) {
    const error=checkPlace(B,di,p);if(error)return error;
    const d=B.deck[di],k=cost(d.id,!!B.pvp);B.energy-=k;
    const tw={id:B.next(),card:d.id,pvp:!!B.pvp,clvl:d.lvl||1,setb:d.setb||1,slot:-1,x:p.x,y:p.y,high:B.W.hills.some(h=>Math.hypot(p.x-h.x,p.y-h.y)<h.r-.6),lvl:1,cd:.65,ang:-Math.PI/2,mode:FAM[CARD[d.id].fam].prefer==='strong'?'strong':'first',spent:k,kills:0,dmg:0,beams:[],fire:0,jam:0};
    B.towers.push(tw);B.stats.built++;refresh(B);B.ev.push({k:'build',x:tw.x,y:tw.y,c:FAM[CARD[d.id].fam].c,r:CARD[d.id].r,tw:tw.id});return tw;
  }

  function upgrade(B, tw) {
    const k = upCost(tw); if (!k) return 'Niveau max'; if (B.energy < k) return 'Énergie insuffisante';
    B.energy -= k; tw.lvl++; tw.spent += k; if (tw.lvl === 3) B.stats.upgraded3++; refresh(B); B.ev.push({ k: 'upgrade', x: tw.x, y: tw.y, c: FAM[CARD[tw.card].fam].c, tw: tw.id }); return tw;
  }
  function sell(B, tw) { const v = Math.floor(tw.spent * 0.7); B.energy += v; B.towers = B.towers.filter((t) => t !== tw); refresh(B); B.ev.push({ k: 'sell', x: tw.x, y: tw.y, v, tw: tw.id }); return v; }
  function repair(B) { if(B.phase!=='build')return ['win','lose'].includes(B.phase)?'Partie terminée':'Réparation disponible uniquement entre deux manches';if (B.hp >= B.maxHp) return 'Citadelle intacte'; if (B.energy < 100) return 'Il faut 100 d\'énergie'; B.energy -= 100; B.hp = Math.min(B.maxHp, B.hp + 6); B.ev.push({ k: 'repair', x: B.W.cit.x, y: B.W.cit.y }); return true; }

  // ---------------- vagues ----------------
  function hpMul(B, w) {
    const n=Math.max(0,w-1),growth=1.048+.003*Math.min(8,B.tier)+.007*(B.diff||0);
    // Later maps add fronts and unit counters, without an uncapped exponential
    // based on both their index and their already longer wave count.
    return B.tierHp*(B.P.id==='aube'&&!B.diff ? .72 : .86)*(1+.085*n)*Math.pow(growth,n);
  }
  function genWave(B, w) {
    const R = B.rnd, tier = B.tier, q = [];
    const lanes = activeLanes(B, w), gL = lanes.filter((l) => l.kind === 'g'), wL = lanes.filter((l) => l.kind === 'w');
    let avail = B.pool.filter((k) => UNLOCK[k] && w >= Math.max(1, UNLOCK[k][0] - Math.min(tier, 6) * 0.8));
    avail = avail.filter((k) => UNIT[k].mv !== 'w' || wL.length);
    if (!avail.length) avail = ['fantassin'];
    const fresh = avail.filter((k) => !B.seen[k]);
    let boss = B.P.boss?.[w] || (B.endless && w % 10 === 0 ? ['b_behemoth', 'b_croiseur', 'b_general', 'b_forteresse', 'b_titan'][(w / 10 - 1) % 5] : null);
    if (boss && UNIT[boss].mv === 'w' && !wL.length) boss = 'b_behemoth';
    const budgetFronts=B.P.lanes?Math.max(1,B.P.lanes.filter(l=>l[2]<=Math.max(1,w)).length):lanes.length;
    let budget = (10 + w * 4.9) * (1 + tier * 0.12) * (1 + (budgetFronts - 1) * 0.12) * (boss ? 0.55 : 1) * (B.diff ? DIFF[B.diff].bud : 1);
    const main = fresh.length ? fresh[fresh.length - 1] : avail[Math.floor(R() * avail.length)];
    const groups = [];
    const capOf = (t) => (UNIT[t].jam || UNIT[t].suppress ? 4 : UNIT[t].drop || (UNIT[t].split && UNIT[t].mv === 'a') ? 3 : UNLOCK[t][1] >= 5 ? 6 : UNIT[t].mv === 'a' || UNIT[t].dmg >= 3 || UNIT[t].stealth ? 8 : 22);
    const used = {}; const add = (type, n) => { n = Math.min(n, capOf(type) - (used[type] || 0)); if (n > 0) { groups.push({ type, n }); used[type] = (used[type] || 0) + n; } return Math.max(0, n); };
    const mb = budget * (fresh.length ? 0.45 : 0.4), mn = Math.max(1, Math.min(main === 'conscrit' ? 30 : 14, Math.round(mb / UNLOCK[main][1]))); budget -= add(main, mn) * UNLOCK[main][1];
    let guard = 0;
    while (budget > 0.5 && guard++ < 60) {
      const t = avail[Math.floor(R() * avail.length)], cst = UNLOCK[t][1];
      if (cst > budget * 1.3 && guard < 40) continue;
      const n = Math.max(1, Math.min(Math.round((budget * (0.25 + R() * 0.35)) / cst), t === 'conscrit' ? 18 : 10));
      budget -= Math.max(1, add(t, n)) * cst;
    }
    for (let i = groups.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [groups[i], groups[j]] = [groups[j], groups[i]]; }
    const gap = Math.max(0.2, 0.85 - w * 0.018);
    const times = lanes.map(() => 0.6 + R() * 0.8);
    let gi = 0;
    for (const g of groups) {
      const mv = UNIT[g.type].mv, okG = lanes.filter((l) => l.kind === 'g' || !l.water.length || l.len - l.water[l.water.length - 1][1] >= 9);
      const cand = mv === 'w' ? wL : mv === 'a' ? lanes : okG.length ? okG : lanes;
      const L = cand[gi++ % cand.length], li = lanes.indexOf(L);
      for (let i = 0; i < g.n; i++) { q.push({ type: g.type, lane: L.id, at: times[li] }); times[li] += g.type === 'conscrit' ? gap * 0.45 : gap * (UNIT[g.type].r > 0.35 ? 1.7 : 1); }
      times[li] += 1 + R() * 1.2;
    }
    if (boss) { const bmv = UNIT[boss].mv, okB = lanes.filter((l) => l.kind === 'g' || !l.water.length || l.len - l.water[l.water.length - 1][1] >= 9), cand = bmv === 'w' ? wL : bmv === 'a' ? lanes : okB.length ? okB : lanes; const L = cand[w % cand.length]; q.push({ type: boss, lane: L.id, at: Math.max(...times) * 0.45 + 1.5 }); }
    q.sort((a, b) => a.at - b.at);
    const counts = {}; for (const x of q) counts[x.type] = (counts[x.type] || 0) + 1;
    const newLane = B.W.lanes.find((l) => l.unlock === w + 1);
    return CoopBalance.wave(B,{ q, counts, boss, fresh: fresh.includes(main) ? main : null, lanes: lanes.map((l) => l.id), newLane: newLane ? newLane.id : null });
  }
  function preview(B) { const save = B.rnd; B.rnd = rng((B.wave + 1) * 977 + 13 + B.P.seed); const r = genWave(B, B.wave + 1); B.rnd = save; return r; }
  function startWave(B) {
    if (B.phase !== 'build') return;
    B.wave++; Tactical.onStart(B); B.rnd = rng(B.wave * 977 + 13 + B.P.seed);
    const W = genWave(B, B.wave); B.queue = W.q; B.wt = 0; B.phase = 'wave'; B.waveInfo = W;
    for (const k of Object.keys(W.counts)) B.seen[k] = true;
    B.ev.push({ k: 'wave', w: B.wave, boss: W.boss, fresh: W.fresh, opened: B.W.lanes.filter((l) => l.unlock === B.wave && B.wave > 1).map((l) => l.id) });
  }
  function laneOf(B, id) { return B.W.lanes.find((l) => l.id === id) || B.W.lanes[0]; }
  function spawn(B, type, lane, d = 0, child) {
    const def = UNIT[type], w = B.wave, L = typeof lane === 'object' ? lane : laneOf(B, lane);
    const mul = def.boss ? B.tierHp * (1 + 0.05 * Math.max(0, w - 10)) * (B.endless ? Math.pow(1.12, w / 10) : 1) : hpMul(B, w);
    const scale = CoopBalance.hpFactor(B,def.boss);const hp = Math.round(def.hp * mul * scale), air = def.mv === 'a';
    const path = air ? L.air : L;
    // les troupes terrestres d'une voie maritime arrivent en péniche de débarquement (plus d'apparition sur la plage)
    const boat = !child && !air && def.mv === 'g' && L.kind === 'w' && L.water.length > 0;
    const m = {
      id: B.next(), type, def, hp, maxHp: hp, shield: def.shield ? Math.round(def.shield * mul * scale) : 0, maxShield: def.shield ? Math.round(def.shield * mul * scale) : 0,
      spd: def.spd * 0.62 * (0.95 + B.rnd() * 0.1), arm: def.arm || 0, air, lane: L, path, d, off: (B.rnd() - 0.5) * 0.5, x: 0, y: 0, ang: 0,
      slowP: 0, slowT: 0, frz: 0, stun: 0, burn: 0, burnT: 0, acidT: 0, acidM: 0, rMark: 0, rev: false, revT: 0, hid: 0, spT: 0, abT: 1 + B.rnd() * 3, hitT: 0, haste: 0, dead: false, born: B.t, prog: 0, spawnT: child ? 0 : 0, onWater: false, boat,
    };
    B.mobs.push(m); place1(m); Tactical.invalidate(B);
    if (def.boss && !child) { B.ev.push({ k: 'boss', type, x: m.x, y: m.y }); }
    return m;
  }
  function place1(m) { const p = posAt(m.path, m.d), o = m.air ? 0 : m.off; m.x = p.x - Math.sin(p.ang) * o; m.y = p.y + Math.cos(p.ang) * o; m.ang = p.ang; m.onWater = !m.air && m.lane.water.some(([a, b]) => m.d >= a && m.d <= b); if (m.boat && m.lane.water.length && !m.onWater && m.d > m.lane.water[m.lane.water.length - 1][1]) { m.boat = false; m.landed = 1; } }

  // ---------------- boucle ----------------
  function step(B, dt) {
    if (B.paused || B.phase === 'win' || B.phase === 'lose') return;
    while (dt > 0.0001) { const h = Math.min(dt, 1 / 30); tick(B, h); dt -= h; if (B.phase === 'win' || B.phase === 'lose') break; }
  }
  function jamTower(t,duration){
    if(t.jam>0||t.jamGuard>0)return false;
    t.jam=duration;return true;
  }
  const hitSets=new WeakMap();
  function hitSet(ids){let set=hitSets.get(ids);if(!set||set.size!==ids.length){set=new Set(ids);hitSets.set(ids,set);}return set;}
  function tick(B, dt) {
    Tactical.invalidate(B); B.t += dt; Tactical.tick(B,dt);
    for (const k in B.ab) B.ab[k].cd = Math.max(0, B.ab[k].cd - dt * (!B.pvp&&B.order?.id==='recovery'?1.25:1));
    for (const p of B.puddles) p.t -= dt; B.puddles = B.puddles.filter((p) => p.t > 0);
    for (const s of B.smokes) s.t -= dt*(B.weather?.kind==='wind'?2:1); B.smokes = B.smokes.filter((s) => s.t > 0);
    let supportsDirty=false;
    for (const t of B.towers) { const was=t.jam;t.jam = Math.max(0, t.jam - dt);t.jamGuard=Math.max(0,(t.jamGuard||0)-dt);if(was>0&&t.jam===0){t.jamGuard=.8;if(t.S.kind==='aura')supportsDirty=true;} }
    if(supportsDirty){refresh(B);supportsDirty=false;}
    if (B.phase !== 'wave') { for (const t of B.towers) { t.beams = []; t.fire = Math.max(0, t.fire - dt); } return; }
    B.wt += dt;
    while (B.queue.length && B.queue[0].at <= B.wt) { const q = B.queue.shift(); spawn(B, q.type, q.lane); }
    const radars = B.towers.filter((t) => t.S.kind === 'radar' && t.jam <= 0);
    const hasters = B.mobs.filter((m) => m.def.haste && !m.dead), healers = B.mobs.filter((m) => m.def.heal && !m.dead);
    for (const m of B.mobs) {
      if (m.dead) continue;
      m.rev = false; m.rMark = 0; m.hid = 0;
      for (const r of radars) if (dist(r, m) <= r.S.range) { m.rev = true; m.rMark = Math.max(m.rMark, r.S.mark); }
      for (const s of B.smokes) if (!m.air && Math.hypot(s.x - m.x, s.y - m.y) < s.r) m.hid = 1;
      m.haste = 0; for (const s of hasters) if (s !== m && (!B.pvp || s.faction===m.faction) && dist(s, m) <= s.def.hasteR) m.haste = Math.max(m.haste, s.def.haste);
    }
    // A support group extends coverage; overlapping healers do not multiply
    // regeneration into an unkillable pack.
    for(const m of B.mobs){
      if(m.dead||m.hp>=m.maxHp)continue;let rate=0;
      for(const h of healers)if(h!==m&&(!B.pvp||m.faction===h.faction)&&m.def.t===h.def.healT&&dist(h,m)<=h.def.healR)rate=Math.max(rate,h.def.heal);
      if(rate>0){m.hp=Math.min(m.maxHp,m.hp+m.maxHp*rate*dt);m.healT=.3;}
    }
    for (const m of B.mobs) {
      if (m.dead) continue;
      m.hitT = Math.max(0, m.hitT - dt); m.revT = Math.max(0, m.revT - dt); m.healT = Math.max(0, (m.healT || 0) - dt);
      m.slowT = Math.max(0, m.slowT - dt); m.frz = Math.max(0, m.frz - dt); m.stun = Math.max(0, m.stun - dt); m.acidT = Math.max(0, m.acidT - dt);
      if (m.burnT > 0) { m.burnT -= dt; hit(B, m, m.burn * dt, { dt: 'fire', ev: false }); if (m.dead) continue; }
      if (m.def.regen && m.burnT <= 0 && m.acidT <= 0) m.hp = Math.min(m.maxHp, m.hp + m.maxHp * m.def.regen * dt);
      if (m.spawnT > 0) { m.spawnT -= dt; continue; }
      m.abT -= dt;
      if (m.def.smoke && m.abT <= 0) { m.abT = 5; B.smokes.push({ x: m.x, y: m.y, r: 1.4, t: 3.5, T: 3.5 }); B.ev.push({ k: 'smoke', x: m.x, y: m.y }); }
      if (!B.pvp && m.def.suppress && m.abT <= 0) { const S2 = m.def.suppress; let best = null, bd = S2.r; for (const t of B.towers) { const dd = dist(t, m); if (dd < bd && t.jam <= 0 && !(t.jamGuard>0)) { bd = dd; best = t; } } if (best) { m.abT = S2.every;jamTower(best,S2.d);if(best.S.kind==='aura')supportsDirty=true;B.ev.push({ k: 'suppress', x: m.x, y: m.y, tw: best.id }); } else m.abT = 0.5; }
      if (m.def.shieldAura && m.abT <= 0) { const A = m.def.shieldAura; m.abT = A.every; for (const o of B.mobs) if (!o.dead && o !== m && (!B.pvp || o.faction===m.faction) && !o.air && dist(o, m) <= A.r) { const cap = Math.round(o.maxHp * 0.5),amount=Number.isFinite(A.amt)?o.maxHp*A.amt:Math.max(0,Number(A.v)||0);o.maxShield=Math.max(o.maxShield,cap);o.shield=Math.min(o.maxShield,o.shield+amount); } B.ev.push({ k: 'shieldaura', x: m.x, y: m.y, r: A.r }); }
      if (!B.pvp && m.def.demine) { for (let i = B.mines.length - 1; i >= 0; i--) { const q = B.mines[i]; if (Math.hypot(q.x - m.x, q.y - m.y) <= m.def.demine) { B.mines.splice(i, 1); B.ev.push({ k: 'demine', x: q.x, y: q.y }); } } }
      if (!B.pvp && m.def.jam && m.abT <= 0) { m.abT = m.def.jam.every; let n = 0; for (const t of B.towers) if (dist(t, m) <= m.def.jam.r&&jamTower(t,m.def.jam.d)) { if(t.S.kind==='aura')supportsDirty=true;n++; }if(n)B.ev.push({ k: 'jam', x: m.x, y: m.y, r: m.def.jam.r, n }); }
      if (!B.pvp && m.def.spawn) { m.spT += dt; if (m.spT >= m.def.spawn[1]) { m.spT = 0; const c = spawn(B, m.def.spawn[0], m.lane, Math.max(0, m.d - 0.3), true); c.d = m.d; place1(c); } }
      let sp = m.spd * (1 + m.haste) * (B.weather?.kind==='snow'&&!m.air&&!m.onWater?Tactical.cfg.weather.snowSpeed:1);
      if (m.def.enrage) sp *= 1 + (1 - m.hp / m.maxHp) * m.def.enrage;
      // Cryo effects respect noSlow when applied. The player Stasis ability can
      // still interrupt a resistant target briefly, as its duration specifies.
      if(m.frz>0)sp=0;else if(!m.def.noSlow&&m.slowT>0)sp*=1-m.slowP;
      if (m.stun > 0 || B.pvp && m.engaged) sp = 0;
      if (m.onWater && m.def.mv === 'g') sp *= 0.8;
      m.d += sp * dt; m.prog = m.d / m.path.len + (m.air ? 0.02 : 0); m.moving = sp > 0;
      place1(m);
      if (!B.pvp && m.def.land && m.lane.water.length && m.d > m.lane.water[m.lane.water.length - 1][1] + 0.3) { // débarquement
        const [t, n] = m.def.land; for (let i = 0; i < n; i++) { const c = spawn(B, t, m.lane, m.d - i * 0.25, true); c.off = (B.rnd() - 0.5) * 0.6; place1(c); }
        m.dead = true; B.ev.push({ k: 'land', x: m.x, y: m.y, n }); continue;
      }
      if (!B.pvp && m.def.drop && !m.dropped && m.d > m.path.len * 0.45) { // largage de parachutistes
        m.dropped = true; const G = B.W.lanes.filter((l) => l.kind === 'g'); const L = G.length ? G.reduce((a, l) => (nearestD2(l, m) < nearestD2(a, m) ? l : a)) : m.lane;
        const d0 = nearestD(L, m); const [t, n] = m.def.drop; for (let i = 0; i < n; i++) { const c = spawn(B, t, L, Math.max(0, d0 - 0.6 + i * 0.3), true); c.off = (B.rnd() - 0.5) * 0.6; place1(c); c.spawnT = 1.4; }
        B.ev.push({ k: 'drop', x: m.x, y: m.y, n });
      }
      if (m.d >= m.path.len) {
        m.dead = true; m.escaped = true; Tactical.leaked(B,m); B.hp = Math.max(0, B.hp - m.def.dmg); B.leaks++;
        B.ev.push({ k: 'leak', dmg: m.def.dmg, x: m.x, y: m.y, id: m.id });
        if (B.hp <= 0) { B.phase = 'lose'; B.ev.push({ k: 'lose' }); return; }
      }
    }
    if(supportsDirty)refresh(B);
    Tactical.index(B);
    for (const p of B.puddles) {
      if(p.t<=0||B.t<(p.born||0))continue;
      for (const m of Tactical.areaCandidates(B,p,p.r)) if (!m.dead && !m.air && m.spawnT<=0 && (m.x-p.x)**2+(m.y-p.y)**2<=p.r*p.r) {
      hit(B, m, p.dps * dt, { dt: 'acid', tw: p.tw, ev: false, reaction:!p.reactionCloud, infMul: p.infMul, vehMul: p.vehMul });if(m.dead)continue;
      const oldMark=m.acidT>0?m.acidM:0;m.acidT=.6;m.acidM=Math.max(oldMark||0,p.mark||0);
      if (p.burn && !m.def.fireImm) { m.burn = Math.max(m.burnT > 0 ? m.burn : 0, p.pvp?Math.min(6,p.burn):p.burn); m.burnT = Math.max(m.burnT, p.pvp?1.4:1.6); }
      if (p.slow&&!m.def.noSlow) {const power=p.slow.p*(m.def.boss ? .5 : 1);m.slowP=Math.max(m.slowT>0?m.slowP:0,power);m.slowT=Math.max(m.slowT,.4);}
      }
    }
    for (let i = B.mines.length - 1; i >= 0; i--) {
      const q = B.mines[i]; q.arm -= dt; if (q.arm > 0) continue;
      if (!B.towers.includes(q.tw)) { B.mines.splice(i, 1); continue; }
      const trig = Tactical.candidates(B,q,.32).find((m) => !m.dead && !m.air && m.spawnT <= 0 && !m.onWater && Math.hypot(m.x - q.x, m.y - q.y) <= 0.32 + m.def.r * 0.5);
      if (trig) { B.mines.splice(i, 1); aoe(B, q.x, q.y, q.S.splash, q.S.dmg, q.S, q.tw, false); B.ev.push({ k: 'boom', x: q.x, y: q.y, r: q.S.splash, c: '#FFB060', mine: true }); if (q.S.split) for (let k = 0; k < q.S.split; k++) { const a = (k / q.S.split) * Math.PI * 2 + B.rnd(), r = q.S.splash * (0.9 + B.rnd() * 0.6); B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'shell', sub: true, S: q.S, tw: q.tw, x0: q.x, y0: q.y, x: q.x, y: q.y, tx: q.x + Math.cos(a) * r, ty: q.y + Math.sin(a) * r, t: 0, T: 0.35, H: 0.5 }); } }
    }
    // The spatial index also owns the tick's identity lookup.
    for (const tw of B.towers) {
      const S = tw.S; tw.fire = Math.max(0, tw.fire - dt);
      if (tw.jam > 0) { tw.beams = []; continue; }
      if (S.kind === 'aura' || S.kind === 'eco' || S.kind === 'radar') continue;
      const tracked=Tactical.target(B,tw.aimId);
      if(tracked&&targetable(tracked,S)&&(!S.airOnly||tracked.air)&&inFiringBand(tw,tracked,S))aim(tw,tracked);
      else {tw.aimId=null;if(tw.cd>0&&S.kind!=='mine')pick(B,tw,1);}
      if (S.kind === 'beam') { beam(B, tw, dt); continue; }
      tw.cd -= dt; if (tw.cd > 0) continue;
      if (fire(B, tw)) { tw.cd += S.rate; tw.fire = 0.12; } else tw.cd = .12;
    }
    for (const s of B.shots) {
      s.t += dt;
      if (s.t < 0) continue;
      if (s.kind === 'missile') {
        const tg = Tactical.target(B,s.tg); if (tg) { s.tx = tg.x; s.ty = tg.y; }
        const a = Math.atan2(s.ty - s.y, s.tx - s.x); s.ang += clamp(((a - s.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI, -dt * 7, dt * 7);
        const px=s.x,py=s.y,v = 4 + s.t * 6; s.x += Math.cos(s.ang) * v * dt; s.y += Math.sin(s.ang) * v * dt;
        const dx=s.x-px,dy=s.y-py,l2=dx*dx+dy*dy,u=l2?clamp(((s.tx-px)*dx+(s.ty-py)*dy)/l2,0,1):0;
        if (Math.hypot(s.tx-px-u*dx,s.ty-py-u*dy) < 0.25 || s.t > 3) { s.done = true; boom(B, s); }
      } else if (s.kind === 'plasma') {
        s.x += s.vx * dt; s.y += s.vy * dt;const hits=hitSet(s.hitIds);
        for (const m of Tactical.areaCandidates(B,s,s.S.width)) { if (m.dead || m.air || m.spawnT > 0 || hits.has(m.id)) continue; if (Math.hypot(m.x - s.x, m.y - s.y) <= s.S.width + m.def.r * 0.6) { s.hitIds.push(m.id);hits.add(m.id); hit(B, m, s.S.dmg, { ...s.S, tw: s.tw }); applyFx(B, m, s.S); m.revT = Math.max(m.revT, 0.5); } }
        if (s.t >= s.T) { s.done = true; B.ev.push({ k: 'boom', x: s.x, y: s.y, r: 0.5, c: '#5CF0FF', small: true, plasma: true }); if (s.S.split) aoe(B, s.x, s.y, 0.4 + s.S.split * 0.12, s.S.dmg * 0.5, s.S, s.tw, false); }
      } else if (s.kind === 'orbital') {
        const tg = Tactical.target(B,s.tg);
        if(tg&&!inFiringBand(s.tw,tg,s.S)){s.done=true;continue;}
        if (tg) { s.tx = tg.x; s.ty = tg.y; }
        if (s.t >= s.T) { s.done = true; aoe(B, s.tx, s.ty, s.S.splash, s.S.dmg, s.S, s.tw, true,s.volleyHits||null); B.ev.push({ k: 'orbital', x: s.tx, y: s.ty, r: s.S.splash }); }
      } else if (s.kind === 'flak') {
        const tg = Tactical.target(B,s.tg); if (tg) { s.tx = tg.x; s.ty = tg.y; }
        const k = Math.min(1, s.t / s.T); s.x = s.x0 + (s.tx - s.x0) * k; s.y = s.y0 + (s.ty - s.y0) * k;
        if (k >= 1) { s.done = true; for (const m of (B.enemyPool||B.mobs)) if (!m.dead && m.air && m.spawnT<=0 && Math.hypot(m.x - s.tx, m.y - s.ty) <= s.S.splash + m.def.r * 0.5) { hit(B, m, m.id === s.tg ? s.S.dmg : s.S.dmg * 0.6, { ...s.S, tw: s.tw }); applyFx(B, m, s.S); } B.ev.push({ k: 'flak', x: s.tx, y: s.ty, r: s.S.splash, type: tg ? tg.type : 'helico' }); }
      } else { const k = Math.min(1, s.t / s.T); s.x = s.x0 + (s.tx - s.x0) * k; s.y = s.y0 + (s.ty - s.y0) * k; s.h = Math.sin(k * Math.PI) * s.H; if (k >= 1) { s.done = true; boom(B, s); } }
    }
    B.shots = B.shots.filter((s) => !s.done);
    B.mobs = B.mobs.filter((m) => !m.dead);
    if (!B.pvp && !B.queue.length && !B.mobs.length && B.phase === 'wave') endWave(B);
  }
  // ---------------- dégâts ----------------
  function markOf(m) { return Math.min(0.7, (m.acidT > 0 ? m.acidM : 0) + m.rMark); }
  function hit(B, m, dmg, o) {
    if (m.dead || dmg <= 0) return;
    let mul = 1 + markOf(m);
    if (m.air && o.airBonus) mul *= o.airBonus;
    if (o.shatter && m.frz > 0) mul *= 1 + o.shatter;
    if (m.def.t === 'inf') mul *= o.infMul || 1; else if (m.def.t === 'boat') mul *= o.boatMul || o.vehMul || 1; else if (!m.air) mul *= o.vehMul || 1;
    if (o.crit && B.rnd() < o.crit.c) { mul *= o.crit.m; if (o.tw) B.ev.push({ k: 'crit', x: m.x, y: m.y }); }
    let d = dmg * mul + Tactical.impact(B,m,dmg,o);
    if (m.shield > 0 && o.dt !== 'fire') {
      const f = (o.dt === 'energy' ? 2 : 1) * (o.shieldMul || 1), sd = d * f, take = Math.min(m.shield, sd);
      m.shield -= take; d = (sd - take) / f;
      if (m.shield <= 0) B.ev.push({ k: 'shieldbreak', x: m.x, y: m.y });
    }
    let arm = m.arm * (m.acidT>0?(B.pvp?.92:.85):1) * (1 - (o.pierce || 0)); if (o.dt === 'true' || o.dt === 'acid' || o.dt === 'fire') arm = 0;
    d *= 1 - arm;
    if (d <= 0) { m.hitT = 0.08; return; }
    if(o.tw?.owner!=null)m.lastHitOwner=o.tw.owner; m.hp -= d; m.hitT = 0.12; B.stats.dmg += d; if (o.tw) o.tw.dmg += d;
    if (o.exec && m.hp > 0 && !m.def.boss && m.hp < m.maxHp * o.exec) { m.hp = 0; B.ev.push({ k: 'exec', x: m.x, y: m.y }); }
    if (o.ev !== false && d >= 1) B.ev.push({ k: 'dmg', x: m.x, y: m.y - m.def.r, v: d, big: d > 60 });
    if (m.hp <= 0) kill(B, m, o.tw);
  }
  function applyFx(B, m, S) {
    if (m.dead) return;
    Tactical.effect(B,m,S);
    if(m._thermalAt===B.t)return;
    const nsl = m.def.noSlow, boss = m.def.boss;
    if (S.slow && !nsl) { const p = S.slow.p * (boss ? 0.5 : 1); if (p >= m.slowP || m.slowT <= 0) { m.slowP = p; } m.slowT = Math.max(m.slowT, S.slow.d); }
    if (S.freeze && !nsl && !boss && !(m.frz>0) && B.t>=(m.freezeReady||0) && B.rnd() < S.freeze.c) { m.frz = Math.min(1.8,S.freeze.d);m.freezeReady=B.t+m.frz+.8; B.ev.push({ k: 'freeze', x: m.x, y: m.y }); }
    if (S.stun && !m.def.noStun && !(m.stun>0) && B.t>=(m.stunReady||0) && B.rnd() < S.stun.c * (boss ? 0.4 : 1)) { m.stun = Math.min(1.4,S.stun.d);m.stunReady=B.t+m.stun+.8; B.ev.push({ k: 'stun', x: m.x, y: m.y }); }
    if (S.vehStun && m.def.t !== 'inf' && !m.def.noStun && !(m.stun>0) && B.t>=(m.stunReady||0) && B.rnd() < S.vehStun.c * (boss ? 0.3 : 1)) { m.stun = Math.min(1.4,S.vehStun.d);m.stunReady=B.t+m.stun+.8; B.ev.push({ k: 'emp', x: m.x, y: m.y }); }
    if (S.burn && !m.def.fireImm) { const raw = S.dmg * 3 * S.burn / Math.max(1, S.multi),dps=S.pvp?Math.min(6,raw):raw;if (dps >= m.burn || m.burnT <= 0) m.burn = dps; m.burnT = (S.pvp?1.4:2.5)*(Tactical.wet(B,m)?Tactical.cfg.weather.rainBurn:1); }
    if (S.melt && m.arm > 0) m.arm = Math.max(0, m.arm - S.melt * 0.05);
  }
  function credit(B,amount,owner,shared=false){
    if(!B.wallets){B.energy+=amount;return;}
    if(shared&&B.coop&&!B.pvp){for(const id of Object.keys(B.wallets))B.wallets[id]=Math.round((B.wallets[id]+amount)*100)/100;return;}
    const id=owner??B._actor;
    if(id!=null&&Object.hasOwn(B.wallets,id)){B.wallets[id]+=amount;return;}
    const ids=Object.keys(B.wallets),base=Math.floor(amount/ids.length),extra=amount-base*ids.length;
    ids.forEach((key,i)=>B.wallets[key]+=base+(i===0?extra:0));
  }
  function kill(B, m, tw) { if(B.pvp&&B.playerBoard)B=B.playerBoard(tw?.owner??m.lastHitOwner)||B;
    if (m.dead) return; m.dead = true; m.hp = 0;
    const base=B.pvp?Math.max(3,Math.round((m.weapon?.cost||30)*.15)):Math.round(m.def.rew*1.25*(1+B.wave*.02));
    const rew=Math.round(base*CoopBalance.rewardFactor(B,!!m.def.boss)*100)/100;
    credit(B,rew,tw?.owner,true);B.stats.earned=Math.round((B.stats.earned+rew)*100)/100;B.kills++;
    if (tw) tw.kills++;
    for (const f of B.towers) { const S = f.S; if (S.bounty && dist(f, m) <= S.range + 0.5) { credit(B,S.bounty,f.owner); } }
    B.ev.push({ k: 'death', x: m.x, y: m.y, type: m.type, rew, boss: !!m.def.boss, air: m.air, id: m.id, t: m.def.t, ang: m.ang, water: m.onWater }); if (m.def.boss) B.bosses++;
    if (!B.pvp && m.def.split) { const [t, n] = m.def.split; for (let i = 0; i < n; i++) { const L = m.lane, child = spawn(B, t, L, 0, true); const air = UNIT[t].mv === 'a'; if (m.air && !air) { child.d = nearestD(L, m); } else if (!air) { child.d = Math.max(0, m.air ? nearestD(L, m) : m.d - 0.2 * i); } else child.d = m.d; child.off = (B.rnd() - 0.5) * 0.5; place1(child); } }
  }
  function nearestD2(L, pt) { const d = nearestD(L, pt), p = posAt(L, d); return Math.hypot(p.x - pt.x, p.y - pt.y); }
  function nearestD(L, pt) { let best = 0, bd = 1e9; for (let d = 0; d <= L.len; d += 0.3) { const p = posAt(L, d), dd = Math.hypot(p.x - pt.x, p.y - pt.y); if (dd < bd) { bd = dd; best = d; } } return best; }
  function aim(tw,m){if(!m)return;tw.aimId=m.id;tw.aimX=m.x;tw.aimY=m.y;tw.ang=Math.atan2(m.y-tw.y,m.x-tw.x);}
  const targetable = (m, S) => !m.dead && m.spawnT <= 0 && (!m.air || S.air) && ((!m.def.stealth && m.hid <= 0 && !(m.def.sub && m.onWater)) || m.rev || m.revT > 0);
  const inFiringBand=(tw,m,S=tw.S,outer=S.range)=>{const d2=(tw.x-m.x)**2+(tw.y-m.y)**2,limit=Math.min(outer+(S.kind==='orbital'?0:(m.def?.r||0)*.6),S.maxRange||Infinity);return d2>=(S.minRange||0)**2&&d2<=limit*limit;};
  function pick(B, tw, n, rangeOverride) {
    const S = tw.S, rg = rangeOverride || S.range;
    let c = Tactical.candidates(B,tw,rg).filter((m) => targetable(m, S) && (!S.airOnly || m.air) && inFiringBand(tw,m,S,rg));
    if (!c.length) return c;
    const tt = c.filter((m) => m.def.taunt); if (tt.length && !S.airOnly) {aim(tw,tt[0]);return tt.slice(0,n);}
    if (tw.mode === 'strong') c.sort((a, b) => b.hp + b.shield - a.hp - a.shield);
    else if (tw.mode === 'close') c.sort((a, b) => dist(a, tw) - dist(b, tw));
    else c.sort((a, b) => b.prog - a.prog);
    if (S.prefer === 'veh') c.sort((a, b) => (a.def.t === 'inf' ? 1 : 0) - (b.def.t === 'inf' ? 1 : 0));
    aim(tw,c[0]);return c.slice(0, n);
  }
  function aoe(B, x, y, r, dmg, S, tw, air, volleyHits=null) {
    const hits=volleyHits?hitSet(volleyHits):null;
    for (const m of Tactical.areaCandidates(B,{x,y},r)) if (!m.dead && m.spawnT <= 0 && (air || !m.air) && (S.kind!=='orbital'||inFiringBand(tw,m,S)) && (!hits||!hits.has(m.id)) && Math.hypot(m.x - x, m.y - y) <= r + m.def.r * 0.6) {if(hits){volleyHits.push(m.id);hits.add(m.id);}hit(B, m, dmg, { ...S, tw, ev: true }); applyFx(B, m, S); m.revT = Math.max(m.revT, 0.8); }
  }

  function boom(B, s) {
    const S = s.S;
    if(s.glob){B.ev.push({k:'boom',x:s.tx,y:s.ty,r:.3,c:FAM[S.fam].c,small:true});return;}
    if (s.kind === 'missile') {
      const tg = Tactical.target(B,s.tg);
      if (tg) { hit(B, tg, S.dmg, { ...S, tw: s.tw }); applyFx(B, tg, S); }
      if (S.splash) for (const m of Tactical.areaCandidates(B,s,S.splash)) if (m !== tg && !m.dead && m.spawnT<=0 && (!m.air||S.air) && Math.hypot(m.x - s.x, m.y - s.y) <= S.splash) { hit(B, m, S.dmg * 0.5, { ...S, tw: s.tw }); applyFx(B, m, S); }
      B.ev.push({ k: 'boom', x: s.x, y: s.y, r: Math.max(0.35, S.splash), c: '#FF6B6B', small: true });
      return;
    }
    aoe(B, s.tx, s.ty, S.splash, S.dmg * (s.sub ? 0.45 : 1), S, s.tw, false);
    B.ev.push({ k: 'boom', x: s.tx, y: s.ty, r: S.splash * (s.sub ? 0.6 : 1), c: S.burn ? '#FF6A2A' : '#F4A261', sub: s.sub });
    if (S.split && !s.sub) for (let i = 0; i < S.split; i++) { const a = (i / S.split) * Math.PI * 2 + B.rnd(), r = S.splash * (0.8 + B.rnd() * 0.6); B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'shell', sub: true, S, tw: s.tw, x0: s.tx, y0: s.ty, x: s.tx, y: s.ty, tx: s.tx + Math.cos(a) * r, ty: s.ty + Math.sin(a) * r, t: 0, T: 0.35, H: 0.5 }); }
  }
  function lead(m, t) { const p = posAt(m.path, m.d + m.spd * t * (m.slowT > 0 ? 1 - m.slowP : 1) * (m.frz > 0 || m.stun > 0 ? 0 : 1)); return { x: p.x - Math.sin(p.ang) * (m.air ? 0 : m.off), y: p.y + Math.cos(p.ang) * (m.air ? 0 : m.off) }; }
  function fire(B, tw) {
    const S = tw.S;
    switch (S.kind) {
      case 'bullet': {
        const T = pick(B, tw, S.multi); if (!T.length) return false;
        tw.ang = Math.atan2(T[0].y - tw.y, T[0].x - tw.x);
        for (const m of T) {
          B.ev.push({ k: 'tracer', x: tw.x, y: tw.y, x2: m.x, y2: m.y, air: m.air, c: FAM[CARD[tw.card].fam].c, fam: CARD[tw.card].fam, tw: tw.id });
          hit(B, m, S.dmg, { ...S, tw }); applyFx(B, m, S);
          if (S.splash) { for (const o of Tactical.areaCandidates(B,m,S.splash)) if (o !== m && !o.dead && !o.air && Math.hypot(o.x - m.x, o.y - m.y) <= S.splash) hit(B, o, S.dmg * 0.5, { ...S, tw }); B.ev.push({ k: 'boom', x: m.x, y: m.y, r: S.splash, c: '#FF8A5B', small: true }); }
        }
        return true;
      }
      case 'shell': {
        const T = pick(B, tw, 1); if (!T.length) return false;
        const m = T[0], dd = dist(tw, m), Tt = clamp(dd / 4, 0.45, 1.1), p = lead(m, Tt);
        tw.ang = Math.atan2(p.y - tw.y, p.x - tw.x);
        B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'shell', S, tw, x0: tw.x, y0: tw.y, x: tw.x, y: tw.y, tx: p.x, ty: p.y, t: 0, T: Tt, H: 1.2 + dd * 0.25 });
        B.ev.push({ k: 'muzzle', x: tw.x, y: tw.y, ang: tw.ang, c: '#F4A261', big: true, tw: tw.id });
        return true;
      }
      case 'missile': {
        const T = pick(B, tw, S.salvo); if (!T.length) return false;
        tw.ang = Math.atan2(T[0].y - tw.y, T[0].x - tw.x);
        for (let i = 0; i < S.salvo; i++) { const m = T[i % T.length]; B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'missile', S, tw, tg: m.id, x: tw.x, y: tw.y, tx: m.x, ty: m.y, ang: tw.ang + (i - (S.salvo - 1) / 2) * 0.5, t: -i * 0.06 }); }
        return true;
      }
      case 'chain': {
        const T = pick(B, tw, 1); if (!T.length) return false;
        let cur = T[0], d = S.dmg; const pts = [{ x: tw.x, y: tw.y - 0.35 }], done = new Set();
        tw.ang = Math.atan2(cur.y - tw.y, cur.x - tw.x);
        for (let i = 0,limit=Math.min(12,S.chains+(Tactical.wet(B,cur)?1:0)); i <= limit && cur; i++) {
          pts.push({ x: cur.x, y: cur.y }); done.add(cur.id); hit(B, cur, d, { ...S, tw }); applyFx(B, cur, S);
          if (!S.noDecay) d *= 0.8;
          let nx = null, nd = 1.5; for (const o of Tactical.candidates(B,cur,1.5)) if (!done.has(o.id) && targetable(o, S)) { const q = Math.hypot(o.x - cur.x, o.y - cur.y); if (q < nd) { nd = q; nx = o; } }
          cur = nx;
        }
        B.ev.push({ k: 'chain', pts, tw: tw.id });
        return true;
      }
      case 'cone': {
        const T = pick(B, tw, 1); if (!T.length) return false;
        const a = Math.atan2(T[0].y - tw.y, T[0].x - tw.x); tw.ang = a;
        for (const m of (B.enemyPool||B.mobs)) { if (m.dead || m.spawnT > 0 || (m.air && !S.air)) continue; const dd = dist(m, tw); if (dd > S.range + m.def.r) continue; const da = Math.abs(((Math.atan2(m.y - tw.y, m.x - tw.x) - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (da < 0.5 || dd < 0.5) { hit(B, m, S.dmg, { ...S, tw, ev: false }); applyFx(B, m, S); } }
        B.ev.push({ k: 'flame', x: tw.x, y: tw.y, ang: a, r: S.range, tw: tw.id });
        return true;
      }
      case 'puddle': {
        const T = pick(B, tw, 1); if (!T.length) return false;
        const p = lead(T[0], 0.5); tw.ang = Math.atan2(p.y - tw.y, p.x - tw.x);
        B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'shell', S: { ...S, splash: 0 }, tw, x0: tw.x, y0: tw.y, x: tw.x, y: tw.y, tx: p.x, ty: p.y, t: 0, T: 0.4, H: 0.8, glob: true });
        B.puddles.push({ x: p.x, y: p.y, r: S.splash, t: S.dur + 0.4, T: S.dur + 0.4, dps: S.dmg * 1.6, mark: S.mark, slow: S.slow, tw, born: B.t + 0.4, fam: S.fam,pvp:S.pvp,burn: S.burn ? S.dmg * 2.2 * S.burn : 0, infMul: S.infMul, vehMul: S.vehMul });
        return true;
      }
      case 'line': {
        const T = pick(B, tw, 1); if (!T.length) return false;
        const a = Math.atan2(T[0].y - tw.y, T[0].x - tw.x); tw.ang = a;
        const L = S.maxRange?S.range:S.range+0.5, ex = tw.x + Math.cos(a) * L, ey = tw.y + Math.sin(a) * L;
        for (const m of (B.enemyPool||B.mobs)) { if (m.dead || !targetable(m, { air: true }) || !inFiringBand(tw,m,S)) continue; const px = m.x - tw.x, py = m.y - tw.y, along = px * Math.cos(a) + py * Math.sin(a), perp = Math.abs(-px * Math.sin(a) + py * Math.cos(a)); if (along >= (S.minRange||0) && along < L && perp < 0.28 + m.def.r * 0.6) { hit(B, m, S.dmg, { ...S, tw }); applyFx(B, m, S); } }
        B.ev.push({ k: 'rail', x: tw.x, y: tw.y, x2: ex, y2: ey, c: FAM.rail.c, tw: tw.id });
        return true;
      }
      case 'pulse': {
        const near = (B.enemyPool||B.mobs).filter((m) => !m.dead && (!m.air || S.air) && m.spawnT <= 0 && dist(m, tw) <= S.range + m.def.r * 0.6);
        if (!near.length) return false;
        aim(tw,near[0]);
        for (const s of B.smokes) if (Math.hypot(s.x - tw.x, s.y - tw.y) < S.range + s.r) { s.t = Math.min(s.t, 0.3); }
        for (const m of near) { m.revT = 1; hit(B, m, S.dmg, { ...S, tw }); applyFx(B, m, S); if (S.knock && !m.def.noStun && !m.dead) m.d = Math.max(0, m.d - S.knock * (m.def.boss ? 0.3 : 1)); }
        B.ev.push({ k: 'pulse', x: tw.x, y: tw.y, r: S.range, c: FAM[S.fam].c, fam: S.fam });
        return true;
      }
      case 'flak': {
        const T = pick(B, tw, S.multi); if (!T.length) return false;
        tw.ang = Math.atan2(T[0].y - tw.y, T[0].x - tw.x);
        for (const m of T) { B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'flak', S, tw, tg: m.id, x0: tw.x, y0: tw.y, x: tw.x, y: tw.y, tx: m.x, ty: m.y, t: 0, T: 0.3 + dist(tw, m) * 0.05, H: 0 }); }
        B.ev.push({ k: 'muzzle', x: tw.x, y: tw.y, ang: tw.ang, c: '#FFD08A', tw: tw.id, small: true });
        return true;
      }
      case 'mine': {
        if (!tw.spots || !tw.spots.length) return false;
        const mine = B.mines.filter((q) => q.tw === tw); if (mine.length >= Math.max(1, S.max)) return false;
        const openLanes=new Set(activeLanes(B).map(l=>l.id));
        const free = tw.spots.filter((p) => (p.lane==null||openLanes.has(p.lane))&&!B.mines.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 0.7)); if (!free.length) return false;
        const p = free[Math.floor(B.rnd() * free.length)];
        tw.aimId=null;tw.aimX=p.x;tw.aimY=p.y;tw.ang=Math.atan2(p.y-tw.y,p.x-tw.x);
        B.mines.push({ x: p.x, y: p.y, tw, S, arm: 0.8, id: B.next() });
        B.ev.push({ k: 'mineset', x: p.x, y: p.y, tw: tw.id });
        return true;
      }
      case 'orbital': {
        const locked = new Set(B.shots.filter((s) => s.kind === 'orbital').map((s) => s.tg)); const T = (B.enemyPool||B.mobs).filter((m) => targetable(m, S) && !locked.has(m.id) && inFiringBand(tw,m,S)).sort((a, b) => b.hp + b.shield - a.hp - a.shield).slice(0, S.multi);
        if (!T.length) return false;
        aim(tw,T[0]);
        const volleyHits=[];
        for (const m of T) { B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'orbital', S, tw, tg: m.id, x: m.x, y: m.y, tx: m.x, ty: m.y, t: 0, T: 0.8,volleyHits }); B.ev.push({ k: 'lock', x: m.x, y: m.y, id: m.id }); }
        return true;
      }
      case 'plasma': {
        const T = pick(B, tw, 1); if (!T.length) return false;
        const p = lead(T[0], dist(tw, T[0]) / 3.2), a = Math.atan2(p.y - tw.y, p.x - tw.x); tw.ang = a;
        B.shots.push({ pid: String(B.player??B.team??0)+":"+(B.nextShotId=(B.nextShotId||0)+1), kind: 'plasma', S, tw, x: tw.x + Math.cos(a) * 0.3, y: tw.y + Math.sin(a) * 0.3, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2, t: 0, T: (S.range + 1.2) / 3.2, hitIds: [] });
        B.ev.push({ k: 'muzzle', x: tw.x, y: tw.y, ang: a, c: '#5CF0FF', tw: tw.id, plasma: true });
        return true;
      }
      case 'gravity': {
        const near = (B.enemyPool||B.mobs).filter((m) => targetable(m, S) && !m.air && dist(m, tw) <= S.range + m.def.r * 0.6);
        if (!near.length) return false;
        aim(tw,near[0]);
        for (const m of near) { hit(B, m, S.dmg, { ...S, tw }); applyFx(B, m, S); if (!m.dead) m.d = Math.max(0, m.d - S.pull * (m.def.boss || m.def.noStun ? 0.25 : 1)); }
        B.ev.push({ k: 'void', x: tw.x, y: tw.y, r: S.range });
        return true;
      }
    }
    return false;
  }
  function beam(B, tw, dt) {
    const S = tw.S;
    const old = tw.beams || [];
    const pool=B.enemyPool||B.mobs,held=tw._beamMode===tw.mode?old.map(b=>Tactical.target(B,b.id)).filter(m=>m&&targetable(m,S)&&(!S.airOnly||m.air)&&inFiringBand(tw,m,S)):[];
    const T=[...held,...pick(B,tw,S.beams).filter(m=>!held.includes(m))].slice(0,S.beams);tw._beamMode=tw.mode;
    tw.beams = T.map((m) => { const o = old.find((b) => b.id === m.id); return { id: m.id, rt: o ? o.rt + dt : 0, x: m.x, y: m.y }; });
    if (T.length) aim(tw,T[0]);
    for (let i = 0; i < T.length; i++) { const b = tw.beams[i], mult = 1 + Math.min(S.ramp, b.rt * 0.8); hit(B, T[i], S.dmg * mult * dt, { ...S, tw, ev: false }); if (S.burn) applyFx(B, T[i], { ...S, slow: null, freeze: null, stun: null }); }
  }
  function endWave(B) {
    B.phase = 'build';
    const bonus = 20 + B.wave * 4, sec = income(B); let inc = 0;
    for (const t of B.towers) if (t.S.income) { inc += t.S.income; B.ev.push({ k: 'income', x: t.x, y: t.y, v: t.S.income }); }
    const interest = Math.max(0, ...B.towers.map((t) => t.S.interest || 0)), int = Math.round(B.energy * interest);
    if(B.wallets){
      for(const id of Object.keys(B.wallets)){const own=B.towers.filter(t=>String(t.owner)===id),income=own.reduce((n,t)=>n+(t.S.income||0),0),rate=Math.max(0,...own.map(t=>t.S.interest||0));B.wallets[id]+=bonus+sec+income+Math.round(B.wallets[id]*rate);}
    }else B.energy += bonus + sec + inc + int;
    B.inf += 1;
    B.ev.push({ k: 'clear', w: B.wave, bonus, sec, inc, int }); Tactical.onClear(B);
    if (!B.endless && B.wave >= B.maxWave) { B.phase = 'win'; B.ev.push({ k: 'win' }); }
  }
  function ability(B, kind, x, y) {
    if(!['strike','stasis'].includes(kind)||!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>B.W.S||y>B.W.S)return false;
    const a = B.ab[kind]; if (!a || a.cd > 0 || B.phase !== 'wave') return false;
    a.cd = a.max;
    if (kind === 'strike') { const d = 110 * (1 + 0.16 * B.wave); for (const m of (B.enemyPool||B.mobs)) if (!m.dead && Math.hypot(m.x - x, m.y - y) <= 1.6 + m.def.r) hit(B, m, d, { dt: 'true' }); for (const s of B.smokes) if (Math.hypot(s.x - x, s.y - y) < 2.5) s.t = 0.2; B.ev.push({ k: 'strike', x, y, r: 1.6 }); }
    else { for (const m of (B.enemyPool||B.mobs)) if (!m.dead && Math.hypot(m.x - x, m.y - y) <= 1.9 + m.def.r) m.frz = Math.max(m.frz, m.def.noStun ? 1 : m.def.boss ? 1.4 : 3.2); B.ev.push({ k: 'stasis', x, y, r: 1.9 }); }
    return true;
  }
  function stars(B) { return B.phase !== 'win' ? 0 : B.hp >= B.maxHp ? 3 : B.hp >= B.maxHp * 0.6 ? 2 : 1; }
  return { spawn, hit, inFiringBand, radius, lockedSector, checkPlace, resolvePlacement, create, step, place, upgrade, sell, repair, annex, income, startWave, preview, ability, cost, upCost, stats, canBuild, refresh, stars, hpMul, activeLanes, posAt };
})();

// =====================================================================
//  ÉCRAN DE COMBAT 3D : interface tactique au-dessus de la vue Three.js
// =====================================================================

const WaveRadar=(()=>{
  const previews=new WeakMap(),palette=['#ffc56d','#7ae6f1','#c6adff','#ff9eac','#b9eb86'];
  function describe(B){
    if(B.radarState&&B.radarState.phase===B.phase&&B.radarState.wave===(B.phase==='build'?B.wave+1:B.wave))return B.radarState;
    const phase=B.phase,wave=phase==='build'?B.wave+1:B.wave,lanes=new Map();
    const add=(id,type,pending)=>{if(id==null)return;let row=lanes.get(id);if(!row){row={id,ground:0,air:0,pending:0,live:0};lanes.set(id,row);}row[UNIT[type]?.mv==='a'?'air':'ground']++;row[pending?'pending':'live']++;};
    if(phase==='build'&&(B.endless||B.wave<B.maxWave)){
      let cache=previews.get(B);if(!cache||cache.wave!==wave){cache={wave,data:Engine.preview(B)};previews.set(B,cache);}for(const q of cache.data.q)add(q.lane,q.type,true);
    }else if(phase==='wave'){for(const q of B.queue||[])add(q.lane,q.type,true);for(const m of B.mobs||[])if(!m.dead)add(m.lane?.id??m.laneId,m.type,false);}
    const rows=[...lanes.values()].sort((a,b)=>a.id-b.id);return {phase,wave,total:rows.reduce((n,l)=>n+l.ground+l.air,0),lanes:rows};
  }
  function create(B,V,root){
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const panel=document.createElement('section');panel.id='waveRadar';panel.setAttribute('aria-label','Origine des vagues');panel.innerHTML='<div class="wave-radar-head"><div><span class="wave-eyebrow">RADAR TACTIQUE</span><b id="waveRadarTitle"></b></div><button id="waveRoutes" aria-pressed="true" title="Afficher ou masquer les trajectoires">Trajets ✓</button><button id="waveFold" aria-expanded="true" aria-label="Réduire le radar">−</button></div><p class="wave-summary" id="waveRadarSummary"></p><div class="wave-lanes" id="waveLaneList"></div><small class="wave-help">Clique un front pour voir son entrée.</small>';root.appendChild(panel);
    const canvas=document.createElement('canvas');canvas.className='wave-route-overlay';canvas.setAttribute('aria-hidden','true');root.appendChild(canvas);const ctx=canvas.getContext('2d');
    const layer=document.createElement('div');layer.className='wave-markers';root.appendChild(layer);
    const notice=document.createElement('div');notice.className='wave-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');root.appendChild(notice);
    const flash=document.createElement('div');flash.className='wave-hit-flash';flash.setAttribute('aria-hidden','true');root.appendChild(flash);
    let state,signature='',age=0,clock=0,lastPhase='',visible=true,noticeUntil=0,focused=null,seen=new WeakSet(),markers=[],width=0,height=0,top=0,bottom=0,timer=1;
    const routes=new Map();
    for(const L of B.W.lanes)for(const kind of ['ground','air']){const path=kind==='air'?L.air:L;if(!path)continue;const pts=Array.from({length:33},(_,i)=>{const p=MapGen.posAt(path,path.len*i/32);return {x:p.x,y:p.y,h:V.groundY(p.x,p.y)+(kind==='air'?1.4:.16)};});routes.set(L.id+':'+kind,{L,kind,pts,path});}
    const color=id=>palette[B.W.lanes.findIndex(l=>l.id===id)%palette.length]||palette[0];
    function focus(id,kind){const l=state?.lanes.find(l=>l.id===id),L=B.W.lanes.find(l=>l.id===id);if(!L)return;focused=id;const path=kind==='air'||(!kind&&l&&!l.ground)?L.air:L,p=MapGen.posAt(path,Math.min(4,path.len*.1));V.focus(p.x,p.y);panel.querySelectorAll('[data-front]').forEach(e=>e.classList.toggle('selected',+e.dataset.front===id));}
    panel.querySelector('#waveRoutes').onclick=e=>{visible=!visible;e.currentTarget.setAttribute('aria-pressed',String(visible));e.currentTarget.textContent=visible?'Trajets ✓':'Trajets masqués';};
    panel.querySelector('#waveFold').onclick=e=>{const folded=panel.classList.toggle('folded');e.currentTarget.textContent=folded?'+':'−';e.currentTarget.setAttribute('aria-expanded',String(!folded));e.currentTarget.setAttribute('aria-label',folded?'Développer le radar':'Réduire le radar');};
    panel.querySelector('#waveLaneList').onclick=e=>{const b=e.target.closest('[data-front]');if(b)focus(+b.dataset.front);};
    function announce(text,kind=''){notice.textContent=text;notice.className='wave-notice visible '+kind;noticeUntil=clock+3.3;}
    function refresh(){state=describe(B);const sig=state.phase+':'+state.wave+':'+state.lanes.map(l=>`${l.id}-${!!l.air}-${!!l.ground}`).join('|');
      const routeButton=panel.querySelector('#waveRoutes');routeButton.disabled=B.phase!=='build';routeButton.setAttribute('aria-pressed',String(visible&&B.phase==='build'));routeButton.textContent=B.phase==='build'?(visible?'Trajets ✓':'Trajets masqués'):'Trajets masqués';
      panel.classList.toggle('under-attack',state.phase==='wave');panel.querySelector('#waveRadarTitle').textContent=state.phase==='build'?`Préparer la vague ${state.wave}`:state.phase==='wave'?`Vague ${state.wave} · assaut en cours`:'Opération terminée';
      panel.querySelector('#waveRadarSummary').textContent=state.phase==='build'?`${state.total} ennemis prévus · ${state.lanes.length} front${state.lanes.length>1?'s':''}`:state.phase==='wave'?`${state.total} ennemis restants, arrivées incluses`:'Tous les fronts sont au repos.';
      if(sig!==signature){signature=sig;layer.replaceChildren();markers=[];panel.querySelector('#waveLaneList').innerHTML=state.lanes.map(l=>{const L=B.W.lanes.find(x=>x.id===l.id);return `<button class="wave-lane ${focused===l.id?'selected':''}" style="--front:${color(l.id)}" data-front="${l.id}"><span class="wave-number">${B.W.lanes.indexOf(L)+1}</span><span><b>${esc(L?.name||'Front')}</b><small>${l.ground?(L?.kind==='w'?'Mer / débarquement':'Voie terrestre'):''}${l.ground&&l.air?' + ':''}${l.air?'Air':''}${L?.unlock===state.wave?' · NOUVEAU':''}</small></span><strong class="wave-count"></strong><i>↗</i></button>`;}).join('');
        for(const l of state.lanes){const L=B.W.lanes.find(x=>x.id===l.id);if(!L)continue;for(const kind of ['ground','air'])if(l[kind]){const route=routes.get(l.id+':'+kind);if(!route)continue;const e=document.createElement('button');e.className='wave-entry';e.style.setProperty('--front',color(l.id));e.innerHTML=`<span class="wave-entry-arrow">↑</span><b>${B.W.lanes.indexOf(L)+1}${kind==='air'?' · AIR':''}</b><small>ENTRÉE</small>`;e.setAttribute('aria-label',`Voir l'entrée ${L.name}${kind==='air'?' aérienne':''}`);e.onclick=()=>focus(l.id,kind);layer.appendChild(e);markers.push({e,route});}}
      }
      for(const l of state.lanes){const row=panel.querySelector(`[data-front="${l.id}"]`);if(row){row.querySelector('.wave-count').textContent=l.ground+l.air;row.title=state.phase==='build'?`${l.ground+l.air} ennemis prévus`:`${l.live} sur le terrain · ${l.pending} à venir`;}}
      if(lastPhase&&lastPhase!==B.phase+':'+B.wave){if(B.phase==='wave')announce(`VAGUE ${B.wave} · ${state.lanes.length} FRONT${state.lanes.length>1?'S':''} EN APPROCHE`);else if(B.phase==='build')announce(`VAGUE ${B.wave} REPOUSSÉE · PRÉPARE TES DÉFENSES`,'clear');}lastPhase=B.phase+':'+B.wave;
      width=root.clientWidth;height=root.clientHeight;top=(root.querySelector('.b-top')?.getBoundingClientRect().bottom||70)+8;bottom=height-(root.querySelector('.b-bottom')?.offsetHeight||220)-18;
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}panel.style.top=top+'px';notice.style.top=(top+8)+'px';
      const players=root.querySelector('.front-players');if(players)players.style.top=(top+panel.offsetHeight+8)+'px';
    }
    function arrow(p,q,c,size=6){const a=Math.atan2(q.y-p.y,q.x-p.x);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-size,-size*.6);ctx.lineTo(size,0);ctx.lineTo(-size,size*.6);ctx.strokeStyle='#071218';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=2.3;ctx.stroke();ctx.restore();}
    function frame(dt){clock+=dt;age+=dt;timer+=dt;if(timer>.18){refresh();timer=0;}if(!state)return;if(clock>noticeUntil)notice.classList.remove('visible');
      for(const ev of B.ev){if(seen.has(ev))continue;seen.add(ev);if(ev.k==='leak'){flash.classList.remove('hit');void flash.offsetWidth;flash.classList.add('hit');}if(ev.k==='build'||ev.k==='upgrade'){const el=root.querySelector('#bEn');el?.classList.remove('resource-pop');if(el){void el.offsetWidth;el.classList.add('resource-pop');}}}
      ctx.clearRect(0,0,width,height);ctx.save();ctx.beginPath();ctx.rect(0,top,width,Math.max(0,bottom-top));ctx.clip();
      const panelRect=panel.getBoundingClientRect(),placed=[];
      for(const m of markers){const {route,e}=m,c=color(route.L.id),pp=route.pts.map(p=>V.project(p.x,p.y,p.h));
        if(visible&&B.phase==='build'){ctx.beginPath();let drawing=false;for(const p of pp){if(!p.ok){drawing=false;continue;}if(!drawing){ctx.moveTo(p.x,p.y);drawing=true;}else ctx.lineTo(p.x,p.y);}ctx.lineWidth=5;ctx.strokeStyle='#06121b80';ctx.stroke();ctx.lineWidth=2.2;ctx.strokeStyle=c+'b0';ctx.setLineDash(route.kind==='air'?[4,8]:[10,8]);ctx.lineDashOffset=RM?0:-clock*14;ctx.stroke();ctx.setLineDash([]);
          for(let i=0;i<3;i++){const d=((RM?i/3:(clock*.055+i/3)%1))*.85*route.path.len;const p=MapGen.posAt(route.path,d),q=MapGen.posAt(route.path,Math.min(route.path.len,d+.5));arrow(V.project(p.x,p.y,V.groundY(p.x,p.y)+(route.kind==='air'?1.4:.2)),V.project(q.x,q.y,V.groundY(q.x,q.y)+(route.kind==='air'?1.4:.2)),c);}}
        const p=pp[0],q=pp[2];let x=Math.max(38,Math.min(width-38,p.x)),y=Math.max(top+24,Math.min(bottom-20,p.y));const off=!p.ok||x!==p.x||y!==p.y;
        // Keep edge indicators readable instead of placing them under the radar.
        if(x<panelRect.right+32&&y<panelRect.bottom+25)y=Math.min(bottom-20,panelRect.bottom+28);
        for(let j=0;j<markers.length&&placed.some(o=>Math.abs(o.x-x)<65&&Math.abs(o.y-y)<56);j++){y+=57;if(y>bottom-20){y=Math.max(top+24,bottom-20-j*57);x=Math.min(width-38,x+70);}}placed.push({x,y});
        e.classList.toggle('offscreen',off);e.querySelector('small').textContent=off?'HORS CHAMP':'ENTRÉE';e.style.left=x+'px';e.style.top=y+'px';e.style.display=bottom-top>70?'':'none';
        e.querySelector('.wave-entry-arrow').style.transform=`rotate(${Math.atan2((off?p.y-y:q.y-p.y),(off?p.x-x:q.x-p.x))*180/Math.PI+90}deg)`;
      }ctx.restore();
    }
    function drawMini(c,n){if(!state)return;const sc=n/B.W.S;c.save();c.font='bold 12px sans-serif';c.textAlign='center';c.textBaseline='middle';
      for(const m of markers){const r=m.route,c1=color(r.L.id);c.strokeStyle=c1;c.lineWidth=1.6;c.setLineDash(r.kind==='air'?[3,3]:[]);if(visible&&B.phase==='build'){c.beginPath();r.pts.forEach((p,i)=>i?c.lineTo(p.x*sc,p.y*sc):c.moveTo(p.x*sc,p.y*sc));c.stroke();}c.setLineDash([]);const p=r.pts[0],x=Math.max(10,Math.min(n-10,p.x*sc)),y=Math.max(10,Math.min(n-10,p.y*sc));c.fillStyle='#0b1520';c.beginPath();c.arc(x,y,9,0,Math.PI*2);c.fill();c.strokeStyle=c1;c.lineWidth=2;c.stroke();c.fillStyle=c1;c.fillText(String(B.W.lanes.indexOf(r.L)+1),x,y);}
      c.restore();
    }
    refresh();return {frame,drawMini,dispose(){panel.remove();canvas.remove();layer.remove();notice.remove();flash.remove();routes.clear();markers=[];}};
  }
  return {describe,create};
})();

// Software-rendered boundaries use the same warped sectorAt field as game rules.
// WebGL already draws this field directly on its terrain material.

const TroopData=(()=>{
 const starters=['fantassin','moto','jeep','leger','helico','medecin'];
 const wheels=new Set(['moto','jeep','meca','sapeur','motoneige','technical','buggy','quad','sidecar','ambulance','camionbombe','chenillette','mehariste','bulldozer','quadroquette','guerreelec','demineur']);
 const roles={
  infantry:{name:'Infanterie',hp:100,damage:12,rate:.95,range:2.65,speed:1.05,armor:.05,castleDamage:4,capturePower:1.5,air:true,ability:'Capture les avant-postes 50 % plus vite.',counter:'Éclaireurs et petites escouades',weakness:'Explosions et blindés'},
  scout:{name:'Éclaireur',hp:65,damage:7,rate:.8,range:2.25,speed:1.65,armor:0,castleDamage:3,capturePower:1.8,air:false,ability:'Capture 80 % plus vite ; très mobile.',counter:'Bases isolées et soutiens',weakness:'Cryo et tirs rapides'},
  armor:{name:'Blindé',hp:235,damage:19,rate:1.5,range:3.1,speed:.65,armor:.35,castleDamage:7,capturePower:1,air:false,ability:'Blindage : réduit les dégâts subis de 35 %.',counter:'Infanterie et tirs physiques',weakness:'Artillerie et dégâts perforants'},
  siege:{name:'Artillerie',hp:125,damage:25,rate:2,range:4.2,speed:.7,armor:.08,castleDamage:10,capturePower:.8,air:false,splash:1.1,damageType:'explosive',bonusVs:'armor',bonusMultiplier:1.35,ability:'Explosion de zone et +35 % contre les blindés.',counter:'Groupes serrés et blindés',weakness:'Éclaireurs rapides et aéronefs'},
  antiair:{name:'Anti-aérien',hp:120,damage:11,rate:1.05,range:4,speed:.85,armor:.1,castleDamage:3,capturePower:1,air:true,bonusVs:'air',bonusMultiplier:1.8,ability:'+80 % de dégâts aux troupes aériennes.',counter:'Hélicoptères, drones et avions',weakness:'Blindés au sol'},
  medic:{name:'Soutien médical',hp:95,damage:5,rate:1.2,range:2.5,speed:.95,armor:.05,castleDamage:2,capturePower:1,air:false,heal:4,healRadius:2.8,healTargets:3,ability:'Répartit 4 PV/s entre trois alliés blessés au maximum, hors soigneurs.',counter:'Usure des escouades alliées',weakness:'Assaut direct et dégâts de zone'},
  cryo:{name:'Contrôle Cryo',hp:115,damage:8,rate:1.1,range:3.2,speed:.85,armor:.05,castleDamage:3,capturePower:1,air:true,slow:.28,slowDuration:1.5,damageType:'energy',ability:'Ralentit les troupes touchées de 28 % pendant 1,5 s.',counter:'Éclaireurs et boucliers',weakness:'Artillerie à longue portée'},
  shield:{name:'Porte-bouclier',hp:155,damage:10,rate:1.2,range:2.8,speed:.75,armor:.12,maxShield:65,castleDamage:5,capturePower:1.2,air:false,shieldRegen:2.5,ability:'65 PV de bouclier ; recharge de 2,5 PV/s après 3 s sans subir de dégâts.',counter:'Premières salves et tenue de position',weakness:'Énergie : dégâts doublés au bouclier'}
 };
 const armorProfiles={
  // Unique PvP tank stats: 3 mythic/legendary tanks must not share generic role stats.
  leger:{hp:285,damage:16,rate:1.35,range:3,speed:.84,armor:.29,castleDamage:6},
  chardesert:{hp:320,damage:19,rate:1.48,range:3.15,speed:.82,armor:.29,castleDamage:6},
  polaire:{hp:360,damage:22,rate:1.75,range:3,speed:.67,armor:.37,castleDamage:7},
  robot:{hp:290,damage:16,rate:1.1,range:3.2,speed:.8,armor:.32,castleDamage:5},
  mecha:{hp:440,damage:26,rate:2,range:3.25,speed:.58,armor:.38,castleDamage:8},
  td:{hp:390,damage:32,rate:2.2,range:4,speed:.60,armor:.33,pierce:.45,bonusVs:'armor',bonusMultiplier:1.35,castleDamage:8},
  lourd:{hp:445,damage:24,rate:1.8,range:3,speed:.55,armor:.40,castleDamage:8},
  mastodonte:{hp:575,damage:26,rate:1.95,range:3,speed:.48,armor:.47,castleDamage:9},
  rupture:{hp:590,damage:30,rate:2,range:3.2,speed:.46,armor:.46,castleDamage:10},
  b_garde:{hp:530,damage:21,rate:1.2,range:2.95,speed:.74,armor:.35,castleDamage:7},
  b_behemoth:{hp:750,damage:38,rate:2.6,range:3.6,speed:.42,armor:.42,castleDamage:11},
  b_general:{hp:605,damage:22,rate:1.45,range:3.2,speed:.56,armor:.37,castleDamage:8},
  b_titan:{hp:840,damage:33,rate:2.4,range:3.45,speed:.37,armor:.47,castleDamage:12}
 };
 const families=[
  ['infantry',['fantassin','commando','grenadier'],['Voltigeur','Fusilier sentinelle','Grenadier tactique','Légionnaire','Ranger urbain','Éclaireur de ligne','Infanterie de réserve','Commando de garnison','Vétéran de frontière']],
  ['scout',['moto','jeep','quad'],['Moto d’avant-garde','Jeep de reconnaissance','Quad éclaireur','Moto des steppes','Jeep des marais','Quad de liaison','Moto de flanc','Jeep d’interception','Quad patrouilleur']],
  ['armor',['leger','lourd','robot'],['Char sentinelle','Char cuirassé','Robot gardien','Char de percée','Char bastion','Marcheur de garde','Char pisteur','Char de commandement','Robot rempart']],
  ['siege',['obusier','katioucha','foreuse'],['Obusier tactique','Batterie mobile','Foreuse d’assaut','Obusier de campagne','Salveur blindé','Foreuse bélier','Mortier automoteur','Lance-roquettes de siège','Foreuse lourde']],
  ['antiair',['lancemissile','mitrailleur','technical'],['Lanceur Ciel-clair','Équipe DCA','Pick-up antiaérien','Lanceur intercepteur','Tireur de drones','Patrouilleur DCA','Lanceur Horizon','Mitrailleur aérien','Escorte antiaérienne']],
  ['medic',['medecin','ambulance','meca'],['Secouriste de ligne','Ambulance tactique','Atelier mobile','Médecin de garnison','Ambulance de front','Camion de soutien','Brancardier blindé','Poste médical mobile','Atelier de campagne']],
  ['cryo',['brouilleur','robot','guerreelec'],['Projecteur Cryo','Robot de stase','Station de contrôle','Camion polaire','Robot givre','Centre de ralentissement','Diffuseur de gel','Robot hivernal','Contrôleur de zone']],
  ['shield',['bouclier','swat','genbouclier'],['Garde à bouclier','Escouade rempart','Porteur d’égide','Sentinelle balistique','Escouade bastion','Générateur mobile','Garde de citadelle','Escouade de protection','Porteur de rempart']]
 ];
 const tints={infantry:'#B5C783',scout:'#E3C66C',armor:'#9FA999',siege:'#D79664',antiair:'#89B8DD',medic:'#7CD0B2',cryo:'#8BDDE0',shield:'#A5A2DB'};
 const variants={};
 const add=(id,name,base,role,index)=>{
  const u=UNIT[base],v={base,index,role,tint:tints[role],scale:1+(index%3-1)*.07};
  variants[id]=v;UNIT[id]={...u,n:name,_model:base,_role:role,_variant:index,_collectibleOnly:true,desc:roles[role].ability};
 };
 // 73 new specialist loadouts bring 87 original models to 160 collectible troops.
 const target=Object.keys(CARD).length;
 for(const [role,bases,names]of families)for(let i=0;i<names.length&&Object.keys(UNIT).length<target;i++)add('special_'+role+'_'+i,names[i],bases[i%bases.length],role,i);
 if(Object.keys(UNIT).length<target)add('special_egide_commandant','Égide du commandant','b_garde','shield',9);
 // Five additional specialists per rarity. Their price follows their actual
 // combat profile; rarity never multiplies PvP damage or hit points.
 const reinforcements=[
  {id:'renfort_fusilier',n:'Fusilier de ligne',base:'fantassin',role:'infantry',rarity:'commune',stats:{hp:110,damage:10,rate:.9,range:2.9,speed:1.02,capturePower:1.5},ability:'Capture 50 % plus vite ; fusil de portée 2,9 m.',counter:'Éclaireurs et occupation des bases',weakness:'Artillerie et blindés'},
  {id:'renfort_estafette',n:'Estafette',base:'moto',role:'scout',rarity:'commune',stats:{hp:55,damage:5,rate:.7,range:2.1,speed:1.95,capturePower:2},ability:'Capture deux fois plus vite et traverse le terrain à 1,95 m/s.',counter:'Avant-postes abandonnés',weakness:'Ralentissement et tirs rapides'},
  {id:'renfort_guetteur',n:'Guetteur anti-drone',base:'mitrailleur',role:'antiair',rarity:'commune',stats:{hp:90,damage:8,rate:.85,range:3.4,speed:.92,armor:.05,bonusMultiplier:2},ability:'Privilégie les aéronefs à portée ; +100 % de dégâts contre eux.',counter:'Drones et aviation légère',weakness:'Chars et artillerie'},
  {id:'renfort_secouriste',n:'Secouriste de tranchée',base:'medecin',role:'medic',rarity:'commune',stats:{hp:80,damage:4,rate:1.25,range:2.4,speed:1.05,heal:5,healTargets:1,healRadius:2.3},ability:'Concentre 5 PV/s sur un allié blessé à 2,3 m, hors soigneurs.',counter:'Usure d’un garde de première ligne',weakness:'Dégâts de zone et attaques directes'},
  {id:'renfort_grenadier',n:'Grenadier léger',base:'grenadier',role:'siege',rarity:'commune',stats:{hp:95,damage:16,rate:1.8,range:3.15,speed:.92,armor:.05,splash:.7,bonusVs:null,bonusMultiplier:1,castleDamage:6,capturePower:1.2},ability:'Grenades de zone dans un rayon de 0,7 m ; 6 dégâts à la citadelle.',counter:'Infanterie regroupée',weakness:'Aéronefs et longue portée'},
  {id:'renfort_lancier',n:'Lancier antichar',base:'lancemissile',role:'siege',rarity:'rare',stats:{hp:100,damage:26,rate:1.8,range:4.1,speed:.78,armor:.05,splash:0,pierce:.45,bonusMultiplier:1.3,castleDamage:7},ability:'Ignore 45 % du blindage ; +30 % de dégâts contre les blindés.',counter:'Chars et marcheurs blindés',weakness:'Infanterie nombreuse et aéronefs'},
  {id:'renfort_givre',n:'Sentinelle du givre',base:'robot',role:'cryo',rarity:'rare',stats:{hp:145,damage:7,rate:1.3,range:3.2,speed:.8,armor:.12,slow:.35,slowDuration:1.6},ability:'Ralentit de 35 % pendant 1,6 s ; tirs énergétiques contre les boucliers.',counter:'Unités rapides et porte-boucliers',weakness:'Artillerie et assauts nombreux'},
  {id:'renfort_atelier',n:'Véhicule atelier',base:'meca',role:'medic',rarity:'rare',stats:{hp:140,damage:4,rate:1.5,range:2.5,speed:.82,armor:.15,heal:6,healTargets:2,healRadius:3},ability:'Répartit 6 PV/s entre deux alliés blessés à 3 m, hors soigneurs.',counter:'Usure des escouades mobiles',weakness:'Interception et dégâts de zone'},
  {id:'renfort_rives',n:'Escorte des rives',base:'amphitank',role:'armor',rarity:'rare',stats:{hp:200,damage:15,rate:1.35,range:3.2,speed:.78,armor:.25,capturePower:1.2},ability:'Traverse l’eau ; blindage de 25 % et capture 20 % plus vite.',counter:'Approches maritimes et petites escouades',weakness:'Perforation et artillerie'},
  {id:'renfort_kestrel',n:'Intercepteur Kestrel',base:'gyro',role:'antiair',rarity:'rare',stats:{hp:85,damage:10,rate:.85,range:3.4,speed:1.4,armor:0,bonusMultiplier:1.65},ability:'Privilégie les aéronefs ; +65 % de dégâts contre eux.',counter:'Drones et hélicoptères isolés',weakness:'DCA et groupes de tireurs'},
  {id:'renfort_faraday',n:'Tireur Faraday',base:'exo',role:'infantry',rarity:'epique',stats:{hp:115,damage:20,rate:1.6,range:4.5,speed:.9,armor:.1,pierce:.55,damageType:'energy',capturePower:1},ability:'Tir énergétique à 4,5 m ; ignore 55 % du blindage.',counter:'Boucliers et cibles blindées isolées',weakness:'Éclaireurs rapprochés et groupes'},
  {id:'renfort_bastion',n:'Bastion ambulant',base:'genbouclier',role:'shield',rarity:'epique',stats:{hp:175,damage:8,rate:1.35,range:2.6,speed:.68,armor:.15,maxShield:100,shieldRegen:3.2,capturePower:1.3},ability:'Bouclier de 100 PV ; recharge 3,2 PV/s après 3 s sans être touché.',counter:'Premières salves et défense des bases',weakness:'Énergie et artillerie à distance'},
  {id:'renfort_brume',n:'Mortier des brumes',base:'obusier',role:'siege',rarity:'epique',stats:{hp:145,damage:27,rate:2.6,range:4.9,speed:.62,armor:.1,splash:1.3,pierce:.2,bonusMultiplier:1.2,castleDamage:11},ability:'Explosion de 1,3 m ; +20 % contre les blindés et 20 % de pénétration.',counter:'Colonnes serrées et blindés',weakness:'Aviation et éclaireurs rapides'},
  {id:'renfort_falaises',n:'Traqueur de falaises',base:'quad',role:'scout',rarity:'epique',stats:{hp:80,damage:8,rate:.8,range:2.7,speed:1.7,capturePower:2.2},ability:'Capture 120 % plus vite ; contourne les routes à 1,7 m/s.',counter:'Bases isolées et soutiens exposés',weakness:'Cryo et défenses rapprochées'},
  {id:'renfort_secours',n:'Aéronef de secours',base:'transport',role:'medic',rarity:'epique',stats:{hp:120,damage:4,rate:1.4,range:2.5,speed:1.15,armor:.05,heal:6,healRadius:3.4,healTargets:3},ability:'Répartit 6 PV/s entre trois alliés blessés à 3,4 m, hors soigneurs.',counter:'Usure des troupes au sol et aériennes',weakness:'Intercepteurs et DCA'},
  {id:'renfort_aurore',n:'Batterie mobile Aurore',base:'polaire',role:'cryo',rarity:'legendaire',stats:{hp:165,damage:12,rate:1.7,range:3.8,speed:.7,armor:.18,slow:.35,slowDuration:1.8,splash:.55,castleDamage:4},ability:'Impact cryogénique de 0,55 m ; ralentit de 35 % pendant 1,8 s.',counter:'Groupes mobiles et boucliers',weakness:'Artillerie plus lointaine'},
  {id:'renfort_mistral',n:'Intercepteur Mistral',base:'chasseur',role:'antiair',rarity:'legendaire',stats:{hp:105,damage:13,rate:1.1,range:4.4,speed:1.3,armor:.06,bonusMultiplier:1.8},ability:'Privilégie les aéronefs à 4,4 m ; +80 % de dégâts contre eux.',counter:'Bombardiers et aviation de soutien',weakness:'Batteries antiaériennes'},
  {id:'renfort_belier',n:'Bélier des frontières',base:'rupture',role:'armor',rarity:'legendaire',stats:{hp:280,damage:24,rate:1.9,range:2.7,speed:.58,armor:.38,pierce:.15,castleDamage:8,capturePower:.8},ability:'Blindage de 38 % ; ignore 15 % du blindage ennemi. Lent et lourd.',counter:'Lignes d’infanterie et tirs légers',weakness:'Perforation, ralentissement et aviation'},
  {id:'renfort_etendard',n:'Porte-étendard',base:'elite',role:'infantry',rarity:'legendaire',stats:{hp:135,damage:11,rate:.8,range:3.05,speed:.95,armor:.1,capturePower:2},ability:'Capture deux fois plus vite ; protège son avance par des tirs rapides.',counter:'Avant-postes disputés et éclaireurs',weakness:'Dégâts de zone et blindés'},
  {id:'renfort_sanctuaire',n:'Sanctuaire mobile',base:'ambulance',role:'medic',rarity:'legendaire',stats:{hp:145,damage:3,rate:1.6,range:2.2,speed:.75,armor:.12,heal:9,healTargets:3,healRadius:3.2},ability:'Répartit 9 PV/s entre trois alliés blessés à 3,2 m, hors soigneurs.',counter:'Attrition des groupes protégés',weakness:'Attaques directes et artillerie'},
  {id:'renfort_horizon',n:'Horizon',base:'b_behemoth',role:'siege',rarity:'mythique',stats:{hp:195,damage:42,rate:3.3,range:5.4,speed:.5,armor:.16,splash:1.2,pierce:.35,bonusMultiplier:1.3,castleDamage:12},ability:'Barrage de 1,2 m à 5,4 m ; +30 % contre les blindés, 35 % de pénétration.',counter:'Colonnes blindées et groupes serrés',weakness:'Aviation et flancs rapides'},
  {id:'renfort_zenith',n:'Égide du Zénith',base:'b_garde',role:'shield',rarity:'mythique',stats:{hp:190,damage:11,rate:1.45,range:3.15,speed:.65,armor:.16,maxShield:115,shieldRegen:3.5,capturePower:1.3},ability:'Bouclier de 115 PV ; recharge 3,5 PV/s après 3 s sans être touché.',counter:'Salves initiales et tenue d’avant-poste',weakness:'Énergie et artillerie'},
  {id:'renfort_polaire',n:'Éclat polaire',base:'guerreelec',role:'cryo',rarity:'mythique',stats:{hp:145,damage:10,rate:1.6,range:4.3,speed:.72,armor:.1,slow:.4,slowDuration:1.8,splash:.7},ability:'Zone de stase de 0,7 m ; ralentit de 40 % pendant 1,8 s.',counter:'Assauts regroupés et unités rapides',weakness:'Portée de siège et attaques dispersées'},
  {id:'renfort_valkyrie',n:'Valkyrie',base:'dronelourd',role:'antiair',rarity:'mythique',stats:{hp:145,damage:14,rate:1.25,range:4.1,speed:1.2,armor:.1,maxShield:35,bonusMultiplier:1.85},ability:'35 PV de bouclier ; privilégie les aéronefs, +85 % contre eux.',counter:'Aviation lourde et escorte aérienne',weakness:'DCA et énergie'},
  {id:'renfort_abyssal',n:'Passeur abyssal',base:'sousmarin',role:'scout',rarity:'mythique',stats:{hp:110,damage:9,rate:1,range:2.7,speed:1.35,armor:.12,capturePower:2.2,castleDamage:4},ability:'Amphibie visible : traverse l’eau et capture 120 % plus vite.',counter:'Bases côtières et contournements',weakness:'Cryo et tirs rapides'}
 ];
 for(let i=0;i<reinforcements.length;i++){
  const spec=reinforcements[i],base=UNIT[spec.base];
  if(!base||Object.hasOwn(UNIT,spec.id))throw Error('Spécialiste invalide : '+spec.id);
  variants[spec.id]={base:spec.base,index:10+i,role:spec.role,rarity:spec.rarity,tint:tints[spec.role],scale:1,profile:spec};
  UNIT[spec.id]={...base,n:spec.n,_model:spec.base,_role:spec.role,_variant:10+i,_collectibleOnly:true,boss:false,desc:spec.ability};
 }
 const roleOf=id=>{
  const u=UNIT[id];if(u._role)return u._role;
  if(u.heal)return 'medic';if(u.jam||id==='polaire')return 'cryo';
  if(u.shield||u.shieldAura||u.taunt)return 'shield';
  if(['chasseur','gyro','helipolice','lancemissile','dronelourd'].includes(id))return 'antiair';
  if(u.suppress||['sapeur','camionbombe','foreuse','bombardier','pyro','charlf','b_forteresse'].includes(id))return 'siege';
  if(u.arm>=.3||u.hp>=260||u.boss)return 'armor';
  if(u.spd>=1.6||u.stealth||id==='drone')return 'scout';return 'infantry';
 };
 const model=id=>variants[id]?.base||UNIT[id]?._model||id;
 const mobility=id=>{const u=UNIT[id],base=model(id);return u.mv==='a'?'air':u.mv==='w'?'amphibie':wheels.has(base)?'terrain':'route';};
 function rarity(id){if(variants[id]){if(variants[id].rarity)return variants[id].rarity;const i=variants[id].index;return i<4?'commune':i<7?'rare':i===7?'epique':i===8?'legendaire':'mythique';}const u=UNIT[id];return u.boss?'mythique':u.hp>=550?'legendaire':u.hp>=260?'epique':u.hp>=100||u.mv==='a'?'rare':'commune';}
 const cached={};
 function stats(id){if(cached[id])return cached[id];const u=UNIT[id],role=roleOf(id),v=variants[id],specification=v?.profile,tailored=!v&&role==='armor'?armorProfiles[id]:null,a=specification?{...roles[role],...specification.stats,ability:specification.ability,counter:specification.counter,weakness:specification.weakness}:tailored?{...roles[role],...tailored}:roles[role],mv=mobility(id);
  // Sidegrades exchange durability, damage or movement; neither rarity nor boss HP
  // is used as an unrestricted PvP multiplier. Original colossal models are capped.
  const style=v?v.index%3:(u.spd>=1.5?2:u.arm>=.3?0:1),bulk=style===0?1.15:style===2?.85:1,damageFactor=style===1?1.08:1;
  const spec=v?Math.floor(v.index/3)%3:0,range=Number((a.range+(spec===1?.4:spec===2?-.25:0)).toFixed(2));
  const hp=Math.round(a.hp*(specification||tailored?1:bulk)),damage=Math.round(a.damage*(specification||tailored?1:damageFactor*(spec===1?.88:spec===2?1.12:1))),speed=Number((a.speed*(specification||tailored?1:(style===2?1.15:style===0?.92:1)*(mv==='air'?1.12:1))).toFixed(2)),effectiveRange=specification||tailored?a.range:range;
  const armor=a.armor,maxShield=a.maxShield||0,dps=damage/a.rate;
  const durability=(hp+maxShield*.65)/(1-armor),rangeBonus=Math.max(0,effectiveRange-2.5)*5;
  const support=(a.heal?10+a.heal*2.3:0)+(a.slow?8+a.slow*16:0)+(a.shieldRegen?3+a.shieldRegen*1.2:0)+(a.splash?8+a.splash*7:0)+(a.bonusVs?7:0)+(a.pierce||0)*15+Math.max(0,(a.capturePower||1)-1.5)*7;
  const movePremium=mv==='air'?24:mv==='terrain'?7:mv==='amphibie'?10:0;
  const armorPremium=role==='armor'?Math.max(0,hp-235)*.17:0;const cost=Math.round((15+Math.sqrt(durability*dps)*.62+rangeBonus+support+movePremium+armorPremium+Math.max(0,speed-1)*10)/5)*5;
  const capturePower=mv==='air'?0:a.capturePower,ability=mv==='air'?a.ability.replace(/Capture.*?\./,'')+' Vol direct, ne capture pas les bases.':a.ability;
  return cached[id]=Object.freeze({...a,role,roleName:a.name,hp,damage,cost,speed,range:effectiveRange,armor,maxShield,damageType:a.damageType||'physical',pierce:a.pierce||0,splash:a.splash||0,slow:a.slow||0,slowDuration:a.slowDuration||0,heal:a.heal||0,healRadius:a.healRadius||0,healTargets:a.healTargets||0,shieldRegen:a.shieldRegen||0,bonusVs:a.bonusVs||null,bonusMultiplier:a.bonusMultiplier||1,capturePower,ability:ability.trim(),mobility:mv,castleDamage:mv==='air'?Math.min(5,a.castleDamage):a.castleDamage,air:a.air||mv==='air'});
 }
 const valid=deck=>[...new Set(Array.isArray(deck)?deck:[])].filter(id=>Object.hasOwn(UNIT,id)).slice(0,6);
 return{starters,mobility,rarity,stats,valid,model,variant:id=>variants[id]||null,roleOf,roles,reinforcements:reinforcements.map(s=>s.id),all:Object.keys(UNIT)};
})();

// Match-only research, keyed by player and troop type. It never changes the
// collection, a teammate's units, PvE statistics or individual defense upgrades.
const TroopUpgrades=(()=>{
 const MAX=3,cache=new Map(),eraCache=new Map();
 const known=type=>typeof type==='string'&&Object.hasOwn(UNIT,type);
 const validPlayer=(s,p)=>s?.pvp&&Number.isInteger(p)&&p>=0&&!!s.boards?.[p];

 // PvP evolution occurs every 75 seconds after combat begins; PvE remains unchanged.
 function tier(s){return s?.pvp&&s.started?Math.min(10,Math.floor(Math.max(0,(s.clock||0)-(s.startedAt??20))/75)):0;}
 function evolved(s,type,base){const n=tier(s);if(!n||!base)return base;const key=type+':'+(base.upgradeLevel||0)+':'+n;if(eraCache.has(key))return eraCache.get(key);
  const next=Object.freeze({...base,hp:Math.round(base.hp*(1+.10*n)),damage:Math.round(base.damage*(1+.06*n)),maxShield:Math.round(base.maxShield*(1+.07*n)),shieldRegen:Number((base.shieldRegen*(1+.035*n)).toFixed(2)),heal:Number((base.heal*(1+.035*n)).toFixed(2)),castleDamage:Math.round(base.castleDamage*(1+.045*n)),evolutionTier:n});
  eraCache.set(key,next);return next;
 }
 function configure(s){if(!s?.pvp)return;s.troopUpgrades=s.boards.map(()=>Object.create(null));s.troopEra=0;}
 function level(s,p,type){if(!validPlayer(s,p)||!known(type))return 0;const n=s.troopUpgrades?.[p]?.[type];return Number.isInteger(n)&&n>=0&&n<=MAX?n:0;}
 function scaled(type,n){if(!known(type))return null;if(!n)return TroopData.stats(type);const key=type+':'+n;if(cache.has(key))return cache.get(key);const b=TroopData.stats(type),heal=Number((b.heal*(1+.07*n)).toFixed(2)),shieldRegen=Number((b.shieldRegen*(1+.07*n)).toFixed(2)),maxShield=Math.round(b.maxShield*(1+.1*n)),ability=b.role==='medic'?'Répartit '+heal+' PV/s entre '+(b.healTargets||3)+' allié(s) blessé(s) à '+(b.healRadius||4)+' m, hors soigneurs.':b.role==='shield'?maxShield+' PV de bouclier ; recharge de '+shieldRegen+' PV/s après 3 s sans subir de dégâts.':b.ability,value=Object.freeze({...b,ability,hp:Math.round(b.hp*(1+.12*n)),damage:Math.round(b.damage*(1+.1*n)),maxShield,heal,shieldRegen,castleDamage:Math.min(b.castleDamage+2,Math.round(b.castleDamage*(1+.08*n))),upgradeLevel:n});cache.set(key,value);return value;}
 function stats(s,p,type){return evolved(s,type,scaled(type,level(s,p,type)));}
 function cost(s,p,type){if(!validPlayer(s,p)||!known(type))return null;const n=level(s,p,type);if(n>=MAX)return null;return Math.max([80,140,220][n],Math.round(TroopData.stats(type).cost*[2.5,4.5,7][n]/5)*5);}
 function preview(s,p,type){if(!validPlayer(s,p)||!known(type))return null;const n=level(s,p,type);return n<MAX?evolved(s,type,scaled(type,n+1)):null;}
 function upgrade(s,p,data){
  if(!validPlayer(s,p))return 'Les améliorations de troupes sont réservées au PvP.';
  const b=s.boards[p],type=data?.type;
  if(s.ended||b.phase==='lose'||b.phase==='win')return 'La partie de ce joueur est terminée.';
  if(!known(type)||!b.troopDeck?.includes(type))return 'Choisis un type de troupe équipé dans ton armée.';
  const before=level(s,p,type),price=cost(s,p,type);if(before>=MAX||price==null)return 'Ce type de troupe a atteint son niveau maximal.';
  if(!Number.isFinite(b.energy)||b.energy<price)return 'Énergie personnelle insuffisante pour cette amélioration.';
  // A single synchronous operation on the authoritative simulation prevents
  // overlapping commands from spending the same personal energy twice.
  const next=evolved(s,type,scaled(type,before+1));b.energy-=price;s.troopUpgrades??=s.boards.map(()=>Object.create(null));s.troopUpgrades[p]??=Object.create(null);s.troopUpgrades[p][type]=before+1;
  for(const destination of s.boards)for(const m of destination.mobs||[]){
   if(m.dead||m.owner!==p||m.type!==type)continue;
   const hpFraction=m.maxHp>0?Math.max(0,Math.min(1,m.hp/m.maxHp)):0,shieldFraction=m.maxShield>0?Math.max(0,Math.min(1,m.shield/m.maxShield)):0;
   m.maxHp=next.hp;m.hp=hpFraction*next.hp;m.maxShield=next.maxShield;m.shield=shieldFraction*next.maxShield;
   m.weapon=next;m.upgradeLevel=before+1;m.def={...m.def,dmg:next.castleDamage};
   // Preserve armor corrosion, crowd-control, targeting, damage totals, attack
   // cooldown and shield recharge delay. Research is not a heal or an attack reset.
  }
  if(b.ev&&b.ev.length<120)b.ev.push({k:'build',x:b.W.cit.x,y:b.W.cit.y,r:1.4,c:'#d6bf78'});
  return true;
 }

 function sync(s){const n=tier(s);if(!s?.pvp||s.troopEra===n)return;s.troopEra=n;
  for(const board of s.boards||[])for(const m of board.mobs||[]){
   if(m.dead||!m.weapon||!Number.isInteger(m.owner)||!known(m.type))continue;
   const next=stats(s,m.owner,m.type),healthFraction=m.maxHp>0?Math.max(0,Math.min(1,m.hp/m.maxHp)):1,shieldFraction=m.maxShield>0?Math.max(0,Math.min(1,m.shield/m.maxShield)):0;
   m.maxHp=next.hp;m.hp=Math.max(1,Math.min(next.hp,Math.round(next.hp*healthFraction)));m.maxShield=next.maxShield;m.shield=Math.round(next.maxShield*shieldFraction);
   m.weapon=next;m.def={...m.def,dmg:next.castleDamage};m.upgradeLevel=level(s,m.owner,m.type);
  }
 }
 return{MAX,configure,level,cost,stats,preview,upgrade,sync,tier};
})();

const SiegePvP=(()=>{
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function lane(pts,id=0){const l=MapGen.mkLane(pts);Object.assign(l,{id,kind:'g',unlock:1,name:'Liaison '+(id+1),side:'n',start:pts[0],water:[]});l.air=MapGen.mkLane([pts[0],pts.at(-1)]);return l;}
 function simplify(pts){if(pts.length<3)return pts;const out=[pts[0]];for(let i=1;i<pts.length-1;i++){const a=out.at(-1),b=pts[i],c=pts[i+1];if(Math.abs((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x))>.001)out.push(b);}out.push(pts.at(-1));return out;}
 function world(source,count){
  // Competitive terrain is mirrored for 2/4 seats and rotational for 3 seats.
  // Flank routes deliberately cross the outer land masses; the middle is faster.
  if(![2,3,4].includes(count))throw Error('Le PvP se joue à 2, 3 ou 4 joueurs.');
  const S=source.S,mid=S/2,center={x:mid,y:mid},triangle=count===3,turn=Math.PI*2/3,axis=-Math.PI/2;
  const point=(x,y)=>({x:x*S,y:y*S}),polar=(r,a)=>({x:mid+Math.cos(a)*r*S,y:mid+Math.sin(a)*r*S});
  const bases=triangle?Array.from({length:3},(_,i)=>polar(.33,axis+i*turn)):count===2?[point(.5,.84),point(.5,.16)]:[point(.18,.82),point(.82,.82),point(.18,.18),point(.82,.18)];
  const coords=count===2?[[.14,.5],[.5,.5],[.86,.5]]:[[.14,.5],[.5,.14],[.5,.5],[.86,.5],[.5,.86]];
  const names=count===2?['Bastion Ouest','Fort Central','Bastion Est']:['Fort Ouest','Fort Nord','Citadelle Centrale','Fort Est','Fort Sud'];
  const outposts=triangle?[...Array.from({length:3},(_,i)=>({id:i,name:['Fort Est','Fort Sud','Fort Ouest'][i],...polar(.19,axis+turn*(i+.5)),r:3.5})),{id:3,name:'Fort Central',...center,r:3.5}]:coords.map(([x,y],id)=>({id,name:names[id],...point(x,y),r:3.5}));
  const canonical=(x,y)=>{if(triangle){const radius=Math.hypot(x-mid,y-mid),angle=Math.atan2(y-mid,x-mid)-axis,fold=((angle+turn/2)%turn+turn)%turn-turn/2;return{x:mid+Math.cos(axis+Math.abs(fold))*radius,y:mid+Math.sin(axis+Math.abs(fold))*radius};}const a=Math.abs(x-mid),b=Math.abs(y-mid);return{x:mid+Math.min(a,b),y:mid+Math.max(a,b)};};
  const rawHeight=(x,y)=>{const p=canonical(x,y);return source.heightAt(p.x,p.y);};
  // Search one symmetry wedge, then transform back. Equivalent starts therefore
  // get exactly the same road lengths even where an island forces a detour.
  const anchorCache=new Map();
  function landAnchor(p){
   const q=canonical(p.x,p.y),key=q.x.toFixed(5)+':'+q.y.toFixed(5);let chosen=anchorCache.get(key);
   if(!chosen){let best=Infinity;chosen=q;const search=Math.min(8,S*.105),axisLocked=!triangle&&Math.abs(q.x-mid)<.001,diagonalLocked=!triangle&&Math.abs(q.x-q.y)<.001,qa=Math.atan2(q.y-mid,q.x-mid),radialLocked=triangle&&(Math.abs(qa-axis)<.001||Math.abs(qa-axis-turn/2)<.001);
    for(let dy=-search;dy<=search+.01;dy+=.75)for(let dx=-search;dx<=search+.01;dx+=.75){let x=axisLocked?mid:q.x+dx,y=diagonalLocked?x:q.y+dy;if(radialLocked){const r=distance(center,q)+dy;x=mid+Math.cos(qa)*r;y=mid+Math.sin(qa)*r;}const t={x,y};
     if(distance(q,t)>search||x<1||y<1||x>S-1||y>S-1||distance(canonical(x,y),t)>.002||triangle&&distance(center,t)>S*.462)continue;
     const h=source.heightAt(x,y);if(h<.055||h>.6)continue;
     let land=0;for(let k=0;k<8;k++){const angle=k*Math.PI/4;if(rawHeight(x+Math.cos(angle)*1.8,y+Math.sin(angle)*1.8)>.035)land++;}
     const score=distance(q,t)+(8-land)*.7+Math.abs(h-.18)*.2;
     if(score<best){best=score;chosen=t;}
    }anchorCache.set(key,chosen);
   }
   if(triangle){const a=Math.atan2(p.y-mid,p.x-mid)-axis,k=Math.floor((a+turn/2)/turn),fold=a-k*turn,sign=fold<0?-1:1,angle=axis+sign*(Math.atan2(chosen.y-mid,chosen.x-mid)-axis)+k*turn,r=distance(center,chosen);return{x:mid+Math.cos(angle)*r,y:mid+Math.sin(angle)*r};}
   const x=p.x-mid,y=p.y-mid,swap=Math.abs(x)>Math.abs(y);return{x:mid+(x<0?-1:1)*(swap?chosen.y-mid:chosen.x-mid),y:mid+(y<0?-1:1)*(swap?chosen.x-mid:chosen.y-mid)};
  }
  const W={...source,pvp:true,bases,outposts,hub:center,cit:bases[0],warpK:-1,slots:[],blocks:[],houses:[],hills:[],obst:new Uint8Array(source.obst.length)};
  W.routes=bases.map(b=>outposts.map(o=>{
   const points=[{...b}],central=distance(o,center)<1;
   if(!central){const a=Math.atan2(b.y-mid,b.x-mid);let delta=Math.atan2(o.y-mid,o.x-mid)-a;while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
    // The diametrically opposite triangular flank consistently goes clockwise.
    if(triangle&&Math.abs(Math.abs(delta)-Math.PI)<.001)delta=Math.PI;
    const radius=triangle?(Math.abs(delta)>Math.PI*.6?.45:.40):count===2?.43:Math.abs(delta)>Math.PI/2?.28:.43;
    const steps=Math.max(1,Math.ceil((Math.abs(delta)-.00001)/(Math.PI/4)));
    for(let j=1;j<steps;j++){const desired=polar(radius,a+delta*j/steps),candidate=landAnchor(desired),safe=bases.every(other=>other===b||distance(candidate,other)>5)&&outposts.every(other=>distance(candidate,other)>4.2);points.push(safe?candidate:desired);}
   }
   const previous=points.at(-1),d=distance(previous,o);points.push({x:o.x+(previous.x-o.x)*2.5/d,y:o.y+(previous.y-o.y)*2.5/d});
   return points.filter((p,i)=>!i||distance(p,points[i-1])>.1);
  }));
  for(const o of outposts)o.anchor={...W.routes[0][o.id].at(-1)};
  W.lanes=W.routes.flatMap((rs,i)=>rs.map((pts,j)=>Object.assign(lane(pts,i*outposts.length+j),{name:outposts[j].name,route:j})));
  for(const o of outposts){const pts=Array.from({length:49},(_,i)=>({x:o.x+Math.cos(i*Math.PI/24)*2.5,y:o.y+Math.sin(i*Math.PI/24)*2.5}));W.lanes.push(Object.assign(lane(pts,W.lanes.length),{name:o.name}));}
  W.branches=W.routes.map(rs=>rs[0]);
  W.laneDistance=(x,y)=>{let best=Infinity;for(const L of W.lanes)for(const seg of L.segs){const dx=seg.b.x-seg.a.x,dy=seg.b.y-seg.a.y,t=Math.max(0,Math.min(1,((x-seg.a.x)*dx+(y-seg.a.y)*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(x-seg.a.x-t*dx,y-seg.a.y-t*dy));}return best;};
  const orbit=p=>{const out=[];if(triangle){const r=distance(p,center),angle=Math.atan2(p.y-mid,p.x-mid)-axis;for(let i=0;i<3;i++)for(const direction of [-1,1]){const a=axis+direction*angle+i*turn,q={...p,x:mid+Math.cos(a)*r,y:mid+Math.sin(a)*r};if(!out.some(t=>distance(t,q)<.01))out.push(q);}return out;}const a=Math.abs(p.x-mid),b=Math.abs(p.y-mid);for(const [u,v]of [[a,b],[b,a]])for(const sx of [-1,1])for(const sy of [-1,1]){const q={...p,x:mid+sx*u,y:mid+sy*v};if(!out.some(t=>distance(t,q)<.01))out.push(q);}return out;};
  const hillSites=triangle?[polar(.425,axis),polar(.34,axis+.55),polar(.4,axis+.82)]:[[.3,.86],[.16,.66],[.34,.64],[.1,.7]].map(([x,y])=>point(x,y));
  for(const candidate of hillSites){const group=orbit(candidate);if(group.every(p=>W.laneDistance(p.x,p.y)>4&&bases.every(b=>distance(b,p)>6)&&outposts.every(o=>distance(o,p)>7)&&W.hills.every(h=>distance(h,p)>7))){for(const p of group)W.hills.push({...p,r:2.5,top:.53,name:'Vigie '+(W.hills.length+1)});if(W.hills.length>=8)break;}}
  const pads=[...bases,...outposts];
  const ground=(x,y)=>{let h=rawHeight(x,y);for(const b of pads){const d=Math.hypot(b.x-x,b.y-y),radius=b.r?5:9;if(d<radius){const k=Math.min(1,(radius-d)/2);h=h*(1-k)+.18*k;}}for(const hill of W.hills){const d=Math.hypot(hill.x-x,hill.y-y);if(d<3.6){const k=Math.max(0,Math.min(1,(3.6-d)/1.35)),smooth=k*k*(3-2*k);h=h*(1-smooth)+.53*smooth;}}if(triangle){const edge=Math.max(0,Math.min(1,(distance(center,{x,y})/S-.465)/.025));h=h*(1-edge)-.6*edge;}return h;};
  W.H=new Float32Array(source.H.length);for(let r=0;r<W.Rr;r++)for(let c=0;c<W.C;c++)W.H[r*W.C+c]=ground((c+.5)*W.res,(r+.5)*W.res);
  W.heightAt=ground;
  const keep=p=>W.heightAt(p.x,p.y)>.04&&W.hills.every(h=>distance(h,p)>h.r+.8)&&bases.every(b=>distance(b,p)>4)&&outposts.every(o=>distance(o,p)>4.2)&&W.laneDistance(p.x,p.y)>1.5;
  const mirror=list=>list.filter(p=>triangle?distance(p,center)<S*.465&&(()=>{const a=(Math.atan2(p.y-mid,p.x-mid)-axis+Math.PI*2)%(Math.PI*2);return a<=turn/2;})():p.x>=mid&&p.y>=p.x).flatMap(orbit).filter(keep);
  W.trees=mirror(source.trees);W.rocks=mirror(source.rocks);
  W.seeds=triangle?[{...center},...Array.from({length:3},(_,i)=>[[.32,0],[.29,-.4],[.29,.4],[.17,0],[.46,0]].map(([r,a])=>polar(r,axis+i*turn+a))).flat()]:Array.from({length:16},(_,i)=>point((i%4+.5)/4,(Math.floor(i/4)+.5)/4));
  W.sectorAt=triangle?(x,y)=>{let nearest=0,best=Infinity;for(let i=0;i<W.seeds.length;i++){const p=W.seeds[i],d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;nearest=i;}}return nearest;}:(x,y)=>Math.max(0,Math.min(3,Math.floor(y/S*4)))*4+Math.max(0,Math.min(3,Math.floor(x/S*4)));
  W.sectors=W.seeds.map((p,id)=>({id,...p,lx:p.x,ly:p.y,area:S*S/16,d:0,name:'Territoire '+(id+1),cost:160,inf:0,income:20,passive:1.5,slots:0,owned:false}));
  for(const L of W.lanes)markWater(W,L);
  delete W._nav;delete W._routePaths;return W;
 }
 function markWater(W,l){let begin=null;for(let d=0;d<=l.len+.25;d+=.25){const p=MapGen.posAt(l,Math.min(l.len,d)),wet=d<=l.len&&W.heightAt(p.x,p.y)<.035;if(wet&&begin==null)begin=d;if(!wet&&begin!=null){l.water.push([begin,Math.min(l.len,d)]);begin=null;}}return l;}
 function routePoints(W,player,target,route=0){const r=Number.isInteger(route)?route:0,A=W.routes[player]?.[r],B=W.routes[target]?.[r],o=W.outposts[r];if(!A||!B||!o)return null;const a=A.at(-1),b=B.at(-1),start=Math.atan2(a.y-o.y,a.x-o.x);let delta=Math.atan2(b.y-o.y,b.x-o.x)-start;while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;const n=Math.max(1,Math.ceil(Math.abs(delta)/(.13))),arc=Array.from({length:n},(_,i)=>({x:o.x+Math.cos(start+delta*(i+1)/n)*2.5,y:o.y+Math.sin(start+delta*(i+1)/n)*2.5}));return [...A,...arc,...B.slice(0,-1).reverse()];}
 function terrainPath(W,start,end,amphibious=false,roadMode=false){
  const cell=roadMode?1:.5,n=Math.ceil(W.S/cell),key=(x,y)=>y*n+x,point=i=>({x:(i%n+.5)*cell,y:(Math.floor(i/n)+.5)*cell}),sx=Math.max(0,Math.min(n-1,Math.floor(start.x/cell))),sy=Math.max(0,Math.min(n-1,Math.floor(start.y/cell))),ex=Math.max(0,Math.min(n-1,Math.floor(end.x/cell))),ey=Math.max(0,Math.min(n-1,Math.floor(end.y/cell))),a=key(sx,sy),z=key(ex,ey),heap=[],dist=new Float64Array(n*n).fill(Infinity),prev=new Int32Array(n*n).fill(-1),closed=new Uint8Array(n*n);
  const caches=W._nav||(W._nav={}),cache=caches[(roadMode?'road:':'')+(amphibious?'water':'land')]||(caches[(roadMode?'road:':'')+(amphibious?'water':'land')]=new Uint8Array(n*n));
  const walk=(x,y)=>{if(x<0||y<0||x>=n||y>=n)return false;const p={x:(x+.5)*cell,y:(y+.5)*cell},id=key(x,y);if(!cache[id]){const ground=amphibious||W.heightAt(p.x,p.y)>=.035||W.laneDistance(p.x,p.y)<=Math.max(.55,W.roadHalfWidth),clear=ground&&!(W.outposts||[]).some(o=>distance(o,p)<2)&&!W.blocks.some(b=>!b.park&&Math.abs(b.x-p.x)<b.w/2+.4&&Math.abs(b.y-p.y)<b.h/2+.4)&&!W.houses.some(h=>distance(h,p)<.8);cache[id]=clear?2:1;}return cache[id]===2&&!W.bases.some(b=>distance(b,end)>3&&distance(b,start)>3&&distance(b,p)<2.2);};
  const push=(id,f)=>{const v={id,f};heap.push(v);let j=heap.length-1;while(j){const p=(j-1)>>1;if(heap[p].f<=f)break;heap[j]=heap[p];j=p;}heap[j]=v;};
  const pop=()=>{const top=heap[0],v=heap.pop();if(heap.length){let j=0;while(j*2+1<heap.length){let c=j*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=v.f)break;heap[j]=heap[c];j=c;}heap[j]=v;}return top.id;};
  dist[a]=0;push(a,0);while(heap.length){const id=pop();if(closed[id])continue;if(id===z){const pts=[end];let t=id;while(t!==a&&t>=0){pts.push(point(t));t=prev[t];}pts.push(start);return pts.reverse();}closed[id]=1;const x=id%n,y=Math.floor(id/n);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||!walk(x+dx,y+dy)||dx&&dy&&(!walk(x+dx,y)||!walk(x,y+dy)))continue;const to=key(x+dx,y+dy),cost=dist[id]+Math.hypot(dx,dy)*(roadMode&&W.heightAt((x+dx+.5)*cell,(y+dy+.5)*cell)<.035?6:1);if(cost<dist[to]){dist[to]=cost;prev[to]=id;push(to,cost+Math.hypot(x+dx-ex,y+dy-ey));}}}return null;
 }
 function configure(s,self){const P=MAPS.find(m=>m.id===s.map),W=world(MapGen.get(P.id),s.players.length);let uid=1;s.pvp=true;s.world=W;s.started=false;s.deployCd={};s.incomeClock=0;s.botClock=0;s.outposts=W.outposts.map(o=>({id:o.id,owner:null,claimTeam:null,progress:0,contested:false}));
  s.boards=s.players.map((p,i)=>{const cit=W.bases[i],near=[W.sectorAt(cit.x,cit.y),...[...W.sectors].filter(z=>z.id!==W.sectorAt(cit.x,cit.y)).sort((a,b)=>distance(a,cit)-distance(b,cit)).slice(0,2).map(z=>z.id)],owned=W.sectors.map(z=>near.includes(z.id)),sectors=W.sectors.map(z=>({...z,name:z.id===W.sectorAt(cit.x,cit.y)?'Secteur de ta base':z.id===0?'Secteur sud':z.name,owned:owned[z.id],cost:Math.min(200,120+Math.round(distance(z,cit))),inf:0,passive:owned[z.id]?0:1.5})),world={...W,cit,sectors};const deck=(p.defenses||['gatling_0','canon_0','cryo_0','mortar_0','missile_0','forge_0']).filter(id=>CARD[id]).slice(0,6).map(id=>({id,lvl:1,setb:1})),b=Engine.create({preset:P,world,deck,seed:443+i});b.pvp=true;b.player=i;b.team=s.teams[i];b.maxHp=b.hp=100;b.wallets={[i]:300};b.viewer=i;Object.defineProperty(b,'energy',{enumerable:true,configurable:true,get(){return this.wallets[i];},set(v){this.wallets[i]=v;}});b.next=()=>uid++;b.playerBoard=i=>s.boards[i];b.allTowers=()=>s.boards.flatMap(q=>q.towers);b.troopDeck=TroopData.valid(p.troops||TroopData.starters);if(!b.troopDeck.length)b.troopDeck=[...TroopData.starters];return b;});TroopUpgrades.configure(s);
 }
 function start(s){if(s.started)return;s.started=true;s.startedAt=s.clock;s.troopEra=0;s.nextWaveAt=null;for(const b of s.boards){if(b.phase==='lose')continue;b.phase='wave';b.wave=1;b.maxWave=1;}}
 function board(s,player){return s.boards[s.pvp?player:s.teams[player]];}
 function cachedTerrainPath(W,start,end,amphibious){const key=(amphibious?'w:':'g:')+Math.floor(start.x*2)+','+Math.floor(start.y*2)+':'+end.x+','+end.y,cache=W._deployPaths||(W._deployPaths=new Map());if(cache.has(key)){const pts=cache.get(key);return [start,...pts.slice(1)];}const pts=terrainPath(W,start,end,amphibious);if(pts){if(cache.size>=96)cache.delete(cache.keys().next().value);cache.set(key,pts);}return pts;}
 function defaultSpawn(s,player,type,route=0,target){
  const W=s?.world,from=W?.bases?.[player],stats=UNIT[type]&&TroopData.stats(type);if(!from||!stats)return null;
  const routePoints=W.routes[player]?.[route],to=routePoints?.[1]||W.bases[target]||W.hub,angle=Math.atan2(to.y-from.y,to.x-from.x);
  for(const radius of [4,6,8,10,12,14,16])for(const offset of [0,.25,-.25,.5,-.5,1,-1]){
   const p={x:from.x+Math.cos(angle+offset)*radius,y:from.y+Math.sin(angle+offset)*radius};
   if(p.x<1||p.y<1||p.x>W.S-1||p.y>W.S-1||W.bases.some((b,i)=>i!==player&&distance(p,b)<4))continue;
   if(stats.mobility!=='air'&&(stats.mobility!=='amphibie'&&W.heightAt(p.x,p.y)<.035||W.outposts.some(o=>distance(o,p)<2)||W.blocks.some(b=>!b.park&&Math.abs(b.x-p.x)<b.w/2+.4&&Math.abs(b.y-p.y)<b.h/2+.4)||W.houses.some(h=>distance(h,p)<.8)))continue;
   return p;
  }return null;
 }
 const combatDefCache=new WeakMap();function combatDefinition(type,stats){let def=combatDefCache.get(stats);if(def)return def;const unit=UNIT[type];def=Object.freeze({n:unit.n,t:unit.t,mv:unit.mv,hp:stats.hp,spd:stats.speed,dmg:stats.castleDamage,arm:stats.armor||0,r:Math.min(.65,unit.r||.3),boss:false,rew:0});combatDefCache.set(stats,def);return def;}
 function deployment(s,player,d){
  if(!s?.pvp||!Number.isInteger(player)||!s.boards?.[player]||!d||!Number.isInteger(d.slot)||!Number.isInteger(d.target))return 'Troupe ou cible invalide.';
  const b=s.boards[player],target=s.boards[d.target],type=b.troopDeck[d.slot];if(!type)return 'Sélectionne une des six troupes équipées.';if(!s.started)return 'Le siège n’a pas encore commencé.';if(s.ended||b.phase==='lose')return 'Ton château est détruit ou la partie est terminée.';if(!target||target.team===b.team||target.phase==='lose')return 'Choisis un château adverse encore debout.';
  const stats=TroopUpgrades.stats(s,player,type);if(b.energy<stats.cost)return 'Énergie personnelle insuffisante.';if(d.route!=null&&(!Number.isInteger(d.route)||d.route<0||d.route>=s.world.outposts.length))return 'Route invalide.';
  const W=s.world,from=W.bases[player],to=W.bases[d.target],route=d.route??0;let pts,spawn=from;
  if(stats.mobility==='route')pts=routePoints(W,player,d.target,route);
  else{
   spawn=d.p==null?defaultSpawn(s,player,type,route,d.target):d.p;
   if(!spawn||!Number.isFinite(spawn.x)||!Number.isFinite(spawn.y)||spawn.x<1||spawn.y<1||spawn.x>W.S-1||spawn.y>W.S-1)return 'Place le point de départ sur la carte.';
   if(distance(spawn,from)>16||distance(spawn,from)<2.4)return 'Déploie entre 2,4 et 16 mètres de ton château.';
   if(stats.mobility!=='air'&&W.heightAt(spawn.x,spawn.y)<.035&&stats.mobility!=='amphibie')return 'Ce véhicule doit démarrer sur la terre ferme.';
   if(W.bases.some((p,i)=>i!==player&&distance(spawn,p)<4))return 'Départ trop proche d’un château adverse.';
   if(stats.mobility!=='air'&&W.outposts.some(o=>distance(o,spawn)<2))return 'Départ dans un avant-poste.';
   if(stats.mobility!=='air'&&(W.blocks.some(b=>!b.park&&Math.abs(b.x-spawn.x)<b.w/2+.4&&Math.abs(b.y-spawn.y)<b.h/2+.4)||W.houses.some(h=>distance(h,spawn)<.8)))return 'Départ dans un bâtiment.';
   pts=stats.mobility==='air'?[spawn,to]:cachedTerrainPath(W,spawn,to,stats.mobility==='amphibie');if(!pts)return 'Aucun trajet praticable. Choisis un autre point de départ.';
  }
  if(!pts||pts.length<2)return 'Cette voie ne mène pas au château choisi.';
  const routeKey=player+':'+d.target+':'+route,paths=W._routePaths||(W._routePaths={}),path=stats.mobility==='route'?(paths[routeKey]||(paths[routeKey]=markWater(W,lane(pts,player*4+d.target)))):markWater(W,lane(pts,player*4+d.target));
  const m=Engine.spawn(target,type,path,stats.mobility==='route'?2.4:0,true),unit=UNIT[type];
  m.hp=m.maxHp=stats.hp;m.spd=stats.speed;m.shield=m.maxShield=stats.maxShield||0;m.arm=stats.armor||0;m.boat=false;
  // A PvP card is a normalized combat profile, never a copy of its PvE boss.
  // Whitelisting prevents stealth, submarine invulnerability, taunts, spawns,
  // native regeneration and other enemy abilities from leaking into a match.
  m.def=combatDefinition(type,stats);
  m.owner=player;m.faction=b.team;m.targetPlayer=d.target;m.weapon=stats;m.upgradeLevel=TroopUpgrades.level(s,player,type);m.fireCd=.35;m.kills=0;m.dmg=0;m.off=0;m.routeKind=stats.mobility;m.spawnT=.2;m.shieldQuiet=0;
  const origin=MapGen.posAt(m.path,m.d);m.x=origin.x;m.y=origin.y;b.energy-=stats.cost;b.ev.push({k:'build',x:m.x,y:m.y,r:.5,c:'#e6b96b'});return true;
 }
 function spatialIndex(all){const buckets=new Map(),size=5;for(const m of all){const key=Math.floor(m.x/size)+':'+Math.floor(m.y/size);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(m);}return (p,r,team=null,enemies=false)=>{const out=[],x=Math.floor(p.x/size),y=Math.floor(p.y/size),n=Math.ceil(r/size);for(let dy=-n;dy<=n;dy++)for(let dx=-n;dx<=n;dx++){const list=buckets.get((x+dx)+':'+(y+dy));if(list)for(const m of list)if((team==null||(enemies?m.faction!==team:m.faction===team))&&!m.dead&&(m.x-p.x)**2+(m.y-p.y)**2<=r*r)out.push(m);}return out;};}
 function captureStep(s,dt,all=s.boards.flatMap(b=>b.mobs).filter(m=>!m.dead),nearby=spatialIndex(all)){
  for(const m of all)m.capturing=false;
  for(const state of s.outposts){const o=s.world.outposts[state.id],troops=nearby(o,o.r).filter(m=>!m.air&&m.spawnT<=0&&s.boards[m.owner]?.phase!=='lose'),teams=[...new Set(troops.map(m=>m.faction))];state.contested=teams.length>1;
   if(state.contested)continue;if(!teams.length){state.progress=Math.max(0,state.progress-dt*.08);if(!state.progress)state.claimTeam=null;continue;}
   const team=teams[0];if(state.owner===team){state.progress=Math.max(0,state.progress-dt*.25);if(!state.progress)state.claimTeam=null;continue;}
   if(state.claimTeam!==team){state.claimTeam=team;state.progress=0;}
   const power=Math.min(3,troops.reduce((n,m)=>n+(m.weapon?.capturePower??1),0));state.progress=Math.min(1,state.progress+dt*power/8);
   for(const m of troops){m.capturing=true;m.engaged=true;}
   if(state.progress>=1){const was=state.owner;state.owner=was==null?team:null;state.progress=0;state.claimTeam=null;for(const b of s.boards)b.ev.push({k:'build',x:o.x,y:o.y,r:2,c:was==null?'#8fdfba':'#e6bb78'});}
  }
 }
 const healingLimit=m=>Math.min(12,Math.max(5,m.maxHp*.06));
 const favored=(w,m)=>w.bonusVs==='air'?!!m.air:w.bonusVs==='armor'?(m.arm>=.2||m.weapon?.role==='armor'):w.bonusVs==='shield'?m.shield>0:w.bonusVs==='infantry'?m.def.t==='inf':false;
 function combatStep(s,dt,all,nearby=spatialIndex(all)){
  const heals=new Map(),attacks=[];
  for(const m of all)if(m.weapon)m.spd=m.weapon.speed;
  for(const m of all){
   m.engaged=false;m.fireCd=(m.fireCd||0)-dt;if(m.dead||!m.weapon||m.spawnT>0||m.frz>0||m.stun>0)continue;
   const w=m.weapon;
   if(w.shieldRegen){m.shieldQuiet=m.hitT>0?0:(m.shieldQuiet||0)+dt;if(m.shieldQuiet>=3)m.shield=Math.min(m.maxShield,m.shield+w.shieldRegen*dt);}
   if(w.heal){
    // Medics keep pace with a nearby frontline unit instead of overtaking it
    // and arriving alone in enemy turret range. Combat slows still apply later.
    const escorts=nearby(m,(w.healRadius||2.8)+.8,m.faction).filter(o=>o!==m&&o.faction===m.faction&&!o.weapon?.heal&&o.spawnT<=0);
    if(escorts.length){const escort=escorts.sort((a,b)=>(b.maxHp+b.maxShield)-(a.maxHp+a.maxShield)||distance(a,m)-distance(b,m))[0],ahead=(m.x-escort.x)*Math.cos(m.ang)+(m.y-escort.y)*Math.sin(m.ang);if(ahead>.45)m.spd=Math.min(w.speed,escort.weapon?.speed||escort.spd);}
    const allies=nearby(m,w.healRadius||2.8,m.faction).filter(o=>o!==m&&o.faction===m.faction&&o.spawnT<=0&&o.hp<o.maxHp&&!o.weapon?.heal).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id-b.id).slice(0,w.healTargets||3);
    for(const o of allies)heals.set(o,(heals.get(o)||0)+w.heal*dt/allies.length);
   }
   let enemy=null,priority=-1,near=Infinity;
   for(const o of nearby(m,w.range,m.faction,true)){
    if(o.faction===m.faction||o.spawnT>0||o.air&&!w.air)continue;
    const score=favored(w,o)?1:0,d=Math.sqrt((o.x-m.x)**2+(o.y-m.y)**2);
    if(score>priority||score===priority&&(d<near-.0001||Math.abs(d-near)<.0001&&o.id<(enemy?.id??Infinity))){priority=score;near=d;enemy=o;}
   }
   if(enemy){
    m.engaged=true;m.aimAng=m.ang=Math.atan2(enemy.y-m.y,enemy.x-m.x);
    if(m.fireCd<=0){m.fireCd=Math.max(0,m.fireCd)+w.rate;attacks.push({m,w,enemy,targets:w.splash?nearby(enemy,w.splash,m.faction,true).filter(o=>o.faction!==m.faction&&o.spawnT<=0&&(!o.air||w.air)):[enemy]});}
   }
  }
  // A target has one shared healing budget, regardless of healer count or order.
  for(const [m,amount]of heals)if(!m.dead){const gain=Math.min(amount,healingLimit(m)*dt,m.maxHp-m.hp);if(gain>0){m.hp+=gain;m.healT=.3;}}
  // All shots ready during this tick are committed together. Losing a unit to
  // another simultaneous shot does not cancel the shot it has already fired.
  for(const {m,w,enemy,targets}of attacks){
   const own=s.boards[m.owner];if(!own)continue;
   for(const o of targets){let dmg=w.damage*(o===enemy?1:.55);if(favored(w,o))dmg*=w.bonusMultiplier||1.5;
    Engine.hit(own,o,dmg,{dt:w.damageType||'physical',pierce:w.pierce||0,tw:m,ev:false});
    if(!o.dead&&w.slow&&!o.def.noSlow){o.slowP=Math.max(o.slowT>0?o.slowP:0,w.slow);o.slowT=Math.max(o.slowT,w.slowDuration||1.5);}
   }
   if(own.ev.length<120)own.ev.push({k:'tracer',x:m.x,y:m.y,x2:enemy.x,y2:enemy.y,c:w.slow?'#9cdeed':'#ffc77b',air:enemy.air});
   if(w.splash&&own.ev.length<120)own.ev.push({k:'boom',x:enemy.x,y:enemy.y,r:w.splash,c:'#d9aa6d'});
  }
 }
 function step(s,dt){if(s.ended)return;s.clock+=dt;if(!s.started&&s.clock>=s.nextWaveAt)start(s);if(!s.started)return;TroopUpgrades.sync(s);
  const all=s.boards.flatMap(b=>b.mobs).filter(m=>!m.dead&&s.boards[m.owner]?.phase!=='lose'&&s.boards[m.targetPlayer]?.phase!=='lose'),nearby=spatialIndex(all);
  combatStep(s,dt,all,nearby);
  captureStep(s,dt,all,nearby);
  for(const b of s.boards){b.enemyPool=all.filter(m=>!m.dead&&m.faction!==b.team);Engine.step(b,dt);for(const m of b.mobs)if(m.engaged&&Number.isFinite(m.aimAng))m.ang=m.aimAng;delete b.enemyPool;}
  for(const b of s.boards)b.mobs=b.mobs.filter(m=>!m.dead&&s.boards[m.owner]?.phase!=='lose'&&s.boards[m.targetPlayer]?.phase!=='lose');
  s.incomeClock+=dt;if(s.incomeClock>=1){s.incomeClock-=1;for(const b of s.boards)if(b.phase!=='lose'){const income=b.towers.reduce((n,t)=>n+(t.S.income||0),0)/20;const ownedPosts=s.outposts.filter(o=>o.owner===b.team&&!o.contested).length,teamSize=s.boards.filter(q=>q.team===b.team&&q.phase!=='lose').length;b.energy+=8+Math.max(0,b.owned.filter(Boolean).length-3)*1.5+income+ownedPosts*2/teamSize;b.inf=Math.min(20,b.inf+1/20);}}
  s.botClock+=dt;if(s.botClock>=1.6){s.botClock=0;s.players.forEach((p,i)=>{
   if(!p.bot||s.boards[i].phase==='lose')return;const b=s.boards[i],enemies=s.boards.filter(q=>q.team!==b.team&&q.phase!=='lose');if(!enemies.length)return;
   const threats=all.filter(m=>m.faction!==b.team&&distance(m,b.W.cit)<14),attacker=threats.sort((a,c)=>distance(a,b.W.cit)-distance(c,b.W.cit))[0];
   // FFA bots rotate fronts instead of all selecting seat zero indefinitely.
   const target=enemies.find(q=>q.player===attacker?.owner)||enemies[(Math.floor(s.clock/20)+i)%enemies.length];
   if(b.towers.length<6&&b.energy>=80){for(let k=0;k<36;k++){const a=k*.9+i,r=3.2+(k%5)*.85,p={x:b.W.cit.x+Math.cos(a)*r,y:b.W.cit.y+Math.sin(a)*r},di=k%b.deck.length;if(!Engine.checkPlace(b,di,p)){const t=Engine.place(b,di,p);if(typeof t!=='string')t.owner=i;break;}}}
   const ownTroops=all.filter(m=>m.owner===i&&!m.dead),needAir=threats.some(m=>m.air),slots=b.troopDeck.map((type,slot)=>({type,slot,stats:TroopData.stats(type)}));
   let choices=slots.filter(q=>q.stats.cost<=b.energy&&(q.stats.role!=='medic'||ownTroops.length>=3));if(!choices.length)return;
   if(needAir&&choices.some(q=>q.stats.role==='antiair'))choices=choices.filter(q=>q.stats.role==='antiair');
   else if(ownTroops.filter(m=>m.hp<m.maxHp*.6&&!m.weapon.heal).length>=3&&!ownTroops.some(m=>m.weapon.heal)&&choices.some(q=>q.stats.heal))choices=choices.filter(q=>q.stats.heal);
   const chosen=choices[Math.floor(b.rnd()*choices.length)];
   if(ownTroops.filter(m=>m.type===chosen.type).length>=3){const cost=TroopUpgrades.cost(s,i,chosen.type);if(cost!=null&&b.energy>=cost+chosen.stats.cost*2)TroopUpgrades.upgrade(s,i,{type:chosen.type});}
   const routes=s.outposts.map(o=>({id:o.id,score:(o.owner===b.team?3:o.contested?2:0)+b.rnd()})).sort((a,c)=>a.score-c.score);
   deployment(s,i,{slot:chosen.slot,target:target.player,route:routes[0].id});
  });}
  const teams=[...new Set(s.boards.filter(b=>b.phase!=='lose').map(b=>b.team))];if(teams.length<=1){s.ended=true;s.winner=teams[0]??null;s.resultDue=performance.now()+800;}else if(s.clock>=900){const scores=teams.map(t=>({t,h:s.boards.filter(b=>b.team===t).reduce((n,b)=>n+b.hp,0)})).sort((a,b)=>b.h-a.h);s.ended=true;s.winner=scores[0].h===scores[1].h?'draw':scores[0].t;s.resultDue=performance.now()+800;}
 }
 return {world,configure,start,step,deployment,defaultSpawn,terrainPath,board,routePoints,captureStep,spatialIndex,combatStep,healingLimit,combatDefinition};
})();


const CoopBalance=(()=>{
 const clampCount=n=>Math.max(1,Math.min(4,Math.floor(Number(n)||1)));
 function parameters(count){const players=clampCount(count),extra=players-1;return Object.freeze({players,mobCountMul:1+extra*.5,hpMul:1+extra*.2,bossHpMul:1+extra*.8,durationMul:1+extra*.12});}
 function configure(B,count){if(B.pvp)return null;if(B.coop)return B.coop;B.coop=parameters(count);return B.coop;}
 function hpFactor(B,boss=false){return B.pvp||!B.coop?1:boss?B.coop.bossHpMul:B.coop.hpMul;}
 // Each ordinary kill pays every player. Normalize its value by the extra
 // enemies, keeping a comparable income per player while preserving cents.
 function rewardFactor(B,boss=false){return B.pvp||!B.coop||boss?1:1/B.coop.mobCountMul;}
 function wave(B,info){const c=B.coop;if(B.pvp||!c||c.players===1)return info;const q=[];let index=0;
  for(const entry of info.q){if(UNIT[entry.type]?.boss){q.push({...entry,at:entry.at*c.durationMul});continue;}
   const copies=Math.floor((index+1)*c.mobCountMul)-Math.floor(index*c.mobCountMul);index++;
   for(let k=0;k<copies;k++)q.push({...entry,at:entry.at*c.durationMul+k*.12});
  }
  q.sort((a,b)=>a.at-b.at);const counts={};for(const e of q)counts[e.type]=(counts[e.type]||0)+1;
  return {...info,q,counts,coopPlayers:c.players};
 }
 return {parameters,configure,hpFactor,rewardFactor,wave};
})();

// World-space level labels; all gameplay and geometry stay in the existing engine.

const MatchSpeed=(()=>{
 const allowed=[1,2,3,4];
 function configure(s){s.speed=1;s.realClock=0;s.speedVote=null;s.speedVoteSeq=0;for(const b of s.boards)b.speed=1;}
 function apply(s,value){s.speed=value;for(const b of s.boards)b.speed=value;s.speedVote=null;}
 function ready(s){const v=s.speedVote;if(v&&v.eligible.every(id=>v.accepted.includes(id)))apply(s,v.speed);}
 function request(s,player,data){
  if(!s||s.pvp||s.mode!=='coop')return 'La vitesse reste à ×1 en PvP.';
  if(s.ended||!s.players[player])return 'Cette partie est terminée.';
  const value=data?.value;if(!allowed.includes(value))return 'Vitesse invalide.';
  if(s.speedVote)return 'Un vote est déjà en cours. Accepte, refuse ou attends sa fin.';
  if(value===s.speed)return 'Cette vitesse est déjà active.';
  const eligible=s.players.filter(p=>!p.bot).map(p=>p.id);
  s.speedVote={id:++s.speedVoteSeq,by:player,speed:value,eligible,accepted:[player],expiresAt:s.realClock+30};
  ready(s);return true;
 }
 function vote(s,player,data){
  const v=s?.speedVote;if(s?.pvp||!v||v.id!==data?.id)return 'Ce vote est terminé.';
  if(!v.eligible.includes(player)||typeof data.accept!=='boolean')return 'Vote invalide.';
  if(data.accept===false){s.speedVote=null;return true;}
  if(!v.accepted.includes(player))v.accepted.push(player);ready(s);return true;
 }
 function tick(s,dt){s.realClock=(s.realClock||0)+Math.max(0,dt);if(s.speedVote&&s.realClock>=s.speedVote.expiresAt)s.speedVote=null;}
 return{configure,request,vote,tick,allowed};
})();


const Frontier = (()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const T=R3.THREE, colors=['#70e7b3','#ff977c','#87bfff','#deb3ff'];
  const standard=['gatling_0','canon_0','cryo_0','mortar_0','missile_0','forge_0'].map(id=>({id,lvl:1,setb:1}));
  const MODES={coop:{n:'Coopération',sub:'1 à 4 · une citadelle',teams:n=>Array(n).fill(0)},duel:{n:'1 contre 1',sub:'Deux châteaux, un vainqueur',teams:()=>[0,1]},duo:{n:'2 contre 2',sub:'4 châteaux · 2 alliances',teams:()=>[0,0,1,1]},ffa:{n:'Chacun pour soi',sub:'3 ou 4 châteaux · chacun pour soi',teams:n=>Array.from({length:n},(_,i)=>i)}};
  let B,V,root,ghostMesh=null,ghostRing=null,ghostP=null,mini=null,miniBg=null,hillEls=[],timer=0,session=null,room=null,transport=null,lastNet=0,netBusy=false,connectionEpoch=0,pendingEvents=[],architecture=null,worldFx=null,radar=null,territories=null,outposts3D=null,performanceUI=null,towerLevels=null,hud=null,mobileHud=null,towerFinder=null,mode='coop';
  let profile;try{profile=JSON.parse(localStorage.getItem('owned-front-profile'))||{};}catch{profile={};}
  profile.name||='Commandant';profile.id||='OW-'+Math.random().toString(36).slice(2,8).toUpperCase();profile.friends||=[];
  const saveProfile=()=>{try{localStorage.setItem('owned-front-profile',JSON.stringify(profile));}catch{}};saveProfile();
  const dps=s=>s.kind==='beam'?s.dmg:['eco','aura','radar'].includes(s.kind)?0:s.kind==='puddle'?s.dmg*1.6:s.rate?s.dmg*(s.kind==='missile'?s.salvo||1:s.multi||1)/s.rate:0;
  function statHTML(s,tw){
    const f=FAM[CARD[tw.card].fam],next=tw.lvl<3?Engine.stats({...tw,lvl:tw.lvl+1}):null;
    if(next&&B)Tactical.boardStats(B,{...tw,S:next});
    // Collection cards use PvE values; always show the separate PvP tuning for long-range weapons.
    const pvpPreview=!s.pvp&&tw.card?Engine.stats({...tw,pvp:true,clvl:1,setb:1}):null;
    const pvpDetails=pvpPreview&&pvpPreview.minRange?'<p><b>Équilibrage PvP :</b> '+Number(pvpPreview.dmg.toFixed(1))+' dégâts par impact · recharge '+Number(pvpPreview.rate.toFixed(1))+' s · portée utile '+pvpPreview.minRange.toFixed(1)+' à '+pvpPreview.range.toFixed(1)+' m · coût '+Engine.cost(tw.card,true)+' énergie. Les ennemis trop proches ne peuvent pas être ciblés.</p>':'';
    const stats=[];const add=(name,v,unit='',nv)=>stats.push(`<div><span>${name}</span><b>${typeof v==='number'?(Number.isInteger(v)?v:v.toFixed(name.includes('Intervalle')||name.includes('Diamètre')?2:1)):v}${unit}</b>${nv!=null?`<small>Au niv. suivant : ${Number(nv).toFixed(name.includes('Intervalle')?2:1)}${unit}</small>`:''}</div>`);
    if(s.dmg){add(s.kind==='puddle'?'Dégâts de la zone / s':s.kind==='beam'?'Dégâts initiaux / s':'Dégâts par impact',s.kind==='puddle'?s.dmg*1.6:s.dmg,'',next?(s.kind==='puddle'?next.dmg*1.6:next.dmg):null);if(s.rate)add('Intervalle de tir',s.rate,' s',next?.rate);add('DPS théorique',dps(s),'',next?dps(next):null);}
    if(s.income)add(session?.pvp?'Énergie / seconde':'Énergie par vague',session?.pvp?s.income/20:s.income,'',next?(session?.pvp?next.income/20:next.income):null);
    if(s.buffRate)add('Cadence des voisins',s.buffRate*100,' %',next?next.buffRate*100:null);
    if(s.mark)add('Dégâts subis par la cible',s.mark*100,' %',next?next.mark*100:null);
    add('Portée',s.range>50?'Toute la carte':s.range,s.range>50?'':' m',next&&next.range<50?next.range:null);if(s.minRange)add('Zone morte',s.minRange,' m',next?.minRange??null);
    add('Diamètre au sol',Engine.radius(tw.card)*2,' m');
    if(s.slow)add('Ralentissement',s.slow.p*100,' %');if(s.splash)add('Rayon de zone',s.splash,' m');
    return `<div class="front-stats"><p class="front-role"><b>${esc(f.role)}</b> · <strong>${s.pvp?'PvP':'PvE / collection'}</strong> · ${s.airOnly?'Cibles aériennes uniquement':s.air?'Sol + air':'Cibles au sol'}</p><div class="front-statgrid">${stats.join('')}</div><p>${esc(f.desc)}</p><p>${tw.high?'▲ En hauteur : portée +25 % et dégâts +10 %, déjà inclus.':'▲ Sur un plateau : portée +25 % et dégâts +10 %.'} Espace libre entre les socles : 0,10 m minimum.</p>${pvpDetails}${s.dmg?`<p>DPS = dégâts par seconde ${s.kind==='beam'?'au début du faisceau':s.kind==='puddle'?'pour une cible dans la zone':'avant blindage, critiques et dégâts secondaires'}. ${s.kind==='shell'&&s.split?'Les sous-munitions ne sont pas incluses dans ce calcul.':''} ${s.chains?'Les rebonds peuvent toucher plusieurs cibles.':''}</p>`:''}</div>`;
  }
  function lobbyHTML(){return `<div class="front-lobby"><div class="front-eyebrow">FRONTIÈRES · Mise à jour tactique</div><h3>Le terrain change la bataille.</h3><p>Construis sur les plaines ou domine depuis les collines. Assemble ton escouade, partage une citadelle ou mets les défenses adverses à l’épreuve.</p><div class="front-modes">${Object.entries(MODES).map(([k,m])=>`<button class="front-mode" data-front-mode="${k}"><b>${m.n}</b><small>${m.sub}</small></button>`).join('')}</div><div class="front-actions"><button class="btn gold" id="frontPractice">Escarmouche</button><button class="btn glass" id="frontFriends">Amis & salons</button><button class="btn glass" id="frontTroops">Troupes · collection</button><button class="btn glass" id="frontRules">Guide tactique</button><button class="btn glass" id="frontMultiHelp">Tuto multijoueur</button></div><div class="front-metrics"><span><strong>16</strong>cartes agrandies</span><span><strong>4</strong>difficultés</span><span><strong>Libre</strong>placement au sol</span><span><strong>+25 %</strong>portée en hauteur</span></div></div>`;}
  function bindLobby(){document.querySelectorAll('[data-front-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.frontMode;setup();});$('frontPractice').onclick=()=>setup();const campaignButton=document.createElement('button');campaignButton.className='btn gold';campaignButton.id='campaignCoop';campaignButton.textContent='Campagne avec des amis';campaignButton.onclick=campaignMenu;const play=$('play');if(play&&!$('campaignCoop'))play.after(campaignButton);$('frontFriends').onclick=friends;$('frontRules').onclick=guide;$('frontTroops').onclick=()=>Troops.open();$('frontMultiHelp').onclick=multiplayerGuide;Social.badge();}
  function dialog(content){return scene(`<div class="front-dialog">${content}</div>`,'front-scene');}
  function guide(){dialog(`<div class="front-eyebrow">Manuel de terrain</div><h3>Lis le terrain. Tiens la ligne.</h3><div class="front-note"><p><strong>Radar tactique.</strong> Les fronts numérotés annoncent les entrées réellement utilisées. Clique un front pour y centrer la caméra. Les flèches suivent le sens des ennemis ; les voies aériennes sont indiquées séparément. Le bouton Trajets masque les lignes, et − réduit le radar.</p><p><strong>1 · Pose libre.</strong> Choisis une carte puis clique sur un sol libre dans une zone disponible, ou glisse-la vers la carte. Vert : construction possible ; rouge : le motif s’affiche. Les routes, l’eau, les bâtiments et les pentes trop fortes restent interdits.</p><p><strong>2 · Hauteurs.</strong> Les vigies sont de vrais plateaux en relief. Une défense sur leur sommet gagne 25 % de portée et 10 % de dégâts. Les grosses pièces ont un socle plus large.</p><p><strong>3 · Économie.</strong> L’énergie sert à poser, améliorer et réparer entre deux manches. Pendant un assaut, la réparation est bloquée. En coop, chaque élimination donne de l’énergie à tous ; les dépenses restent personnelles. Tu peux améliorer une tourelle alliée avec ton énergie. Les 3 zones les plus proches du château sont disponibles au départ. Clique une zone verrouillée ou le bouton Territoires pour l’acheter avec de l’énergie et de l’influence. Chaque zone peut être achetée directement, même éloignée. En PvP, seule l’énergie est nécessaire. L’achat débloque la construction et augmente le revenu. En coopération, les zones achetées sont partagées par ton équipe et repartent à zéro à chaque nouvelle partie. Les forges produisent à chaque vague.</p><p><strong>4 · Combat.</strong> Combine ralentissement et dégâts de zone. Garde une défense anti-air. La minimap permet de déplacer rapidement la caméra. Échap annule la pose ; 1–6 sélectionne une carte.</p><p><strong>5 · Confrontation.</strong> Chaque joueur possède son château sur la même carte, y compris en 2 contre 2. Équipe 6 défenses et 6 troupes maximum dans ton arsenal. Après 20 secondes de préparation, sélectionne un château adverse puis une troupe : les unités de route partent automatiquement de ta base. Les aériennes, amphibies et véhicules hors-piste partent aussi en un appui. Active « Départ précis » pour choisir leur point de départ à 2,4–12 m du château. Les aériennes volent directement ; les véhicules calculent le trajet praticable le plus court en évitant les bâtiments et l’eau, sauf les amphibies. Les troupes adverses se tirent dessus ; les alliées ne se blessent pas. Les troupes ne ciblent jamais les tourelles et ne les détruisent pas. Les tourelles, elles, peuvent attaquer les troupes. Déploie sans délai ni plafond de troupes tant que tu as assez d’énergie. Choisis la route d’un avant-poste : 3 objectifs en duel, 4 à trois joueurs et 5 à quatre joueurs. Des troupes terrestres seules dans le cercle le capturent ; des ennemis le contestent. Chaque base rapporte +2 énergie/s à partager entre les alliés. Chaque joueur gagne 8 énergie par seconde, plus ses territoires et forges. La dernière alliance debout gagne ; à 15 minutes, les PV cumulés départagent les équipes, avec égalité possible.</p><p><strong>6 · Jouer ensemble.</strong> Le ZIP multijoueur inclut le serveur à lancer sur un PC. Les amis connectent leurs navigateurs à son adresse sur le même réseau, puis entrent le code du salon. Le serveur continue même lorsque l’hôte change d’onglet. Le fichier HTML seul propose les parties contre l’IA.</p></div><button class="btn light full" data-close>Compris</button>`);}
  function multiplayerGuide(){dialog(`<div class="front-eyebrow">Jouer ensemble · PC et téléphone</div><h3>Ton premier salon multijoueur</h3><div class="front-note front-tutorial"><p><strong>Le plus simple : le même Wi-Fi.</strong> Un seul PC lance le serveur. Les autres joueurs utilisent simplement leur navigateur, y compris sur téléphone.</p><ol><li>Extrais entièrement le ZIP multijoueur. Sur le PC hôte, installe la version <b>LTS</b> de <a href="https://nodejs.org/fr/download" target="_blank" rel="noopener">Node.js</a> si nécessaire.</li><li>Sous Windows, double-clique <code>OUVRIR_MULTIJOUER.bat</code>. Garde la fenêtre ouverte. Le jeu s’ouvre ; sinon, ouvre <code>http://localhost:8787</code>.</li><li>Dans la fenêtre du serveur, repère l’adresse « Pour tes amis sur le même réseau ». <b>Tout le monde, y compris l’hôte, ouvre cette adresse.</b> Ne partage pas une adresse localhost.</li><li>Dans <b>Amis & salons</b>, chaque joueur crée un compte puis se connecte. Coche <b>Rester connecté</b>. Ajoute ton ami avec son identifiant ou son code ami : il doit accepter la demande.</li><li>Prépare tes défenses et tes troupes dans l’arsenal, puis <b>Créer un salon</b>. Choisis la carte et le mode. Clique <b>Inviter des amis → Inviter</b> ; ton ami reçoit l’invitation et clique <b>Rejoindre</b>. Le code du salon fonctionne aussi.</li><li>Chacun clique <b>Je suis prêt</b> ; l’hôte clique <b>Lancer la partie</b>. Garde le serveur ouvert. L’onglet hôte peut être masqué.</li></ol><p><b>Coop :</b> 2 à 4 humains dans un salon. <b>1 contre 1 :</b> 2 joueurs. <b>2 contre 2 :</b> 4 joueurs. <b>Chacun pour soi :</b> 3 ou 4 joueurs. En 2 contre 2, les places 1–2 affrontent les places 3–4. Le solo reste disponible en escarmouche.</p><details><summary>Mes amis sont chez eux : comment jouer à distance ?</summary><p>Il faut une adresse publique hébergeant le serveur. Le tutoriel du ZIP explique la mise en ligne sur un service Node.js, avec les réglages : démarrage <code>npm start</code>, contrôle de santé <code>/api/health</code> et dossier <code>DATA_DIR</code> sur un stockage persistant pour les comptes. Tous les joueurs utilisent ensuite cette même adresse.</p><p>Le HTML déposé seul sur Netlify ne lance pas ce serveur. Aucun serveur public n’est créé automatiquement.</p></details><details><summary>Ça ne se connecte pas</summary><p>Vérifie que le serveur est ouvert, que vous utilisez la même adresse réseau et le même Wi-Fi. Sur un réseau invité, les appareils peuvent être isolés. Si Windows demande une autorisation réseau, sélectionne ton réseau privé. Ne désactive pas le pare-feu.</p><p>Crée un compte et garde « Rester connecté » activé. Dans Amis, envoie une demande avec son identifiant. Une fois acceptée, crée un salon puis clique « Inviter ». Ton ami reçoit une notification et peut rejoindre directement. Les comptes et les amis sont conservés sur ce serveur.</p></details></div><div class="front-actions"><button class="btn gold" id="tutorialFriends">Amis & salons</button><button class="btn glass" data-close>Fermer</button></div>`);$('tutorialFriends').onclick=friends;}

  function coopSummary(count,diff){const c=CoopBalance.parameters(count),f=n=>Number(n.toFixed(2)).toLocaleString('fr-FR');return `<b>Coopération à ${c.players} joueur${c.players>1?'s':''} · ${DIFF[diff]?.n||'Normal'}</b><span>Ennemis ×${f(c.mobCountMul)} · PV ×${f(c.hpMul)} · PV des boss ×${f(c.bossHpMul)}</span><small>Multiplicateurs ajoutés à la difficulté choisie. Humains et IA comptent au lancement ; une déconnexion ne change pas les vagues.</small>`;}
  function campaignMenu(){if(room?.config.campaign&&room.completed){campaignRoom();return;}const choices=MAPS.filter(m=>unlocked(m)),selected=choices.find(m=>m.id===G.mis)||choices[0];
    const sc=dialog(`<div class="front-eyebrow">Campagne coopérative · 2 à 4 joueurs</div><h3>Continuer la campagne ensemble</h3><p class="front-note">Une citadelle commune, ton énergie et tes six défenses. La difficulté s’adapte au nombre de joueurs. Les victoires et étoiles de coopération sont conservées sur le compte de chaque participant ; la collection et les récompenses restent sur cet appareil.</p><label class="front-field">Mission<select id="campaignMap">${choices.map(m=>`<option value="${m.id}" ${m.id===selected.id?'selected':''}>${esc(m.n)}</option>`).join('')}</select></label><label class="front-field">Difficulté<select id="campaignDiff"></select></label><div class="front-actions"><button class="btn gold" id="campaignCreate">Créer le salon de campagne</button><button class="btn glass" data-close>Retour</button></div><p id="campaignError" role="status"></p>`);
    const update=()=>{$('campaignDiff').innerHTML=DIFF.filter(d=>d.id<=CampaignCoop.progress($('campaignMap').value).d).map(d=>`<option value="${d.id}">${d.n}</option>`).join('');};$('campaignMap').onchange=update;update();
    $('campaignCreate').onclick=async()=>{const button=$('campaignCreate');button.disabled=true;try{await connect('create',{config:{mode:'coop',campaign:true,map:$('campaignMap').value,diff:+$('campaignDiff').value,count:4}});showRoom();}catch(e){if($('campaignError'))$('campaignError').textContent=e.message;}finally{button.disabled=false;}};
  }
  function finishCampaign(result){if(room)room.completed=true;Battle.close();session=null;G.paused=false;if(result)battleEnd(result);else{render(true);showRoom();}Social.refresh();}
  async function campaignRoom(){try{if(room?.self===0&&room.started)await send('campaignNext');showRoom();}catch(e){toast(e.message,'bad');}}
  function setup(){const sc=dialog(`<div class="front-eyebrow">Salle tactique</div><h3>Préparer une partie</h3><div class="front-grid"><label class="front-field">Mode<select id="fMode">${Object.entries(MODES).map(([k,m])=>`<option value="${k}" ${mode===k?'selected':''}>${m.n}</option>`).join('')}</select></label><label class="front-field">Carte<select id="fMap">${MAPS.map(m=>`<option value="${m.id}" ${G.mis===m.id?'selected':''}>${esc(m.n)}</option>`).join('')}</select></label><label class="front-field">Difficulté<select id="fDiff">${DIFF.map(d=>`<option value="${d.id}">${d.n} · PV ×${d.hp}</option>`).join('')}</select></label><label class="front-field">Nombre de joueurs<select id="fCount">${[1,2,3,4].map(n=>`<option ${n===4?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="front-coop-balance" id="fCoopBalance" aria-live="polite"></div><p class="front-note">Escarmouche : les places libres sont jouées par des <strong>IA identifiées</strong>. En PvP : ta sélection de 6 défenses et 6 troupes maximum, un château par joueur, énergie personnelle. Les niveaux des défenses sont égalisés. La difficulté concerne les vagues en coopération.</p><div class="front-actions"><button class="btn gold" id="fStart">Jouer avec les IA</button><button class="btn" id="fOnline">Créer un salon amis</button><button class="btn glass" data-close>Retour</button></div><p id="fErr" class="front-error"></p>`);
    const config=()=>({mode:$('fMode').value,map:$('fMap').value,diff:+$('fDiff').value,count:+$('fCount').value});
    const syncCoop=()=>{const c=config(),coop=c.mode==='coop',ffa=c.mode==='ffa';$('fCount').closest('label').hidden=!coop&&!ffa;for(const option of $('fCount').options)option.disabled=ffa&&+option.value<3;if(ffa&&+$('fCount').value<3)$('fCount').value='3';$('fDiff').closest('label').hidden=!coop;$('fCoopBalance').hidden=!coop;if(coop)$('fCoopBalance').innerHTML=coopSummary(c.count,c.diff);};for(const id of ['fMode','fDiff','fCount'])$(id).onchange=syncCoop;syncCoop();
    $('fStart').onclick=()=>{const c=config(),n=['coop','ffa'].includes(c.mode)?c.count:c.mode==='duel'?2:4;c.players=Array.from({length:n},(_,i)=>({id:i,name:i?['Vega','Atlas','Echo'][i-1]:profile.name,bot:i>0,...i?{}:Troops.loadout()}));closeScene(true);begin(c,0,true);};
    $('fOnline').onclick=async()=>{try{const c=config();await connect('create',{config:c,name:profile.name,friendId:profile.id});showRoom();}catch(e){$('fErr').textContent=e.message;}};
  }
  function getBase(){return location.protocol==='file:'?'':location.origin;}
  async function api(path,body){const base=getBase();if(!base)throw Error('Pour jouer entre appareils, lance OUVRIR_MULTIJOUER.bat du ZIP, puis ouvre l’adresse affichée.');let r;try{r=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(6000)});}catch{throw Error('Serveur indisponible. Lance le serveur inclus dans le ZIP et utilise son adresse.');}let data;try{data=await r.json();}catch{throw Error('Ce site ne possède pas le serveur multijoueur. Utilise le ZIP et son lanceur.');}if(!r.ok)throw Error(data.error||'Connexion refusée');return data;}
  async function connect(kind,body){await Social.ensure();if(kind==='create'||kind==='join')await CloudProgress.flush();const r=await api(kind,{...body,loadout:Troops.loadout()});const epoch=++connectionEpoch;transport?.close();if(room?.code!==r.room.code){if(Battle.B)Battle.close();session=null;G.paused=false;}room=r.room;transport=new EventSource(`/api/events?room=${encodeURIComponent(room.code)}&token=${encodeURIComponent(r.token)}`);room.token=r.token;room.self=r.self;transport.onmessage=e=>{if(epoch!==connectionEpoch)return;try{receive(JSON.parse(e.data));}catch(error){console.error('Salon : erreur de synchronisation',error);if(!session&&room){try{showRoom();const err=document.getElementById('roomErr');if(err)err.textContent='Problème temporaire de synchronisation du salon. La connexion reste ouverte.';}catch(recoveryError){console.error('Restauration du salon impossible',recoveryError);}}}};transport.onerror=()=>{if(epoch!==connectionEpoch)return;if(B)Battle.hint('Connexion interrompue : tentative de reconnexion…');};transport.onopen=()=>{if(epoch!==connectionEpoch)return;if(B)Battle.hint('Connexion au salon rétablie.');};return room;}
  async function send(type,data={}){if(!room)return;if(type==='loadout')await CloudProgress.flush();return api('send',{room:room.code,token:room.token,type,data});}
  function receive(m){if(!room)return;if(m.type==='seat'){if(Number.isInteger(m.self)&&m.self>=0&&m.self<room.capacity)room.self=m.self;return;}if(m.type==='room'){const auth={token:room.token,self:room.self};room={...m.room,...auth};if($('roomRoster'))paintRoom();Social.refresh();if(session)session.disconnected=false;}else if(m.type==='start'){if(!session){closeScene(true);begin(m.config,room.self,false);}}else if(m.type==='command'&&session?.host){const error=apply(m.from,m.data);if(typeof error==='string')send('notice',{to:m.from,text:error}).catch(()=>{});}else if(m.type==='state'&&session&&!session.host){applySnapshot(m.data);}else if(m.type==='notice'&&m.data.to===room?.self){Battle.hint(m.data.text);}else if(m.type==='closed'){if(session)session.disconnected=true;if(B)Battle.hint('Le salon a été fermé.');else toast('Le salon a été fermé.','bad');transport?.close();room=null;Social.refresh();} }
  function friends(){Social.open();}
  async function join(code){await connect('join',{code:String(code).trim().toUpperCase()});if(!room.started)showRoom();}
  async function resume(){if(room&&!session?.ended){if(!session)showRoom();return;}await connect('resume',{});if(!room.started)showRoom();}
  function showRoom(){dialog(`<div class="front-eyebrow">Salon privé · <span id="roomMode"></span></div><h3>Code : <span id="roomCode"></span></h3><div class="front-connection">Connexion au serveur active · jusqu’à 4 joueurs</div><div class="room-config"><label class="front-field">Carte<select id="roomMap">${MAPS.map(m=>`<option value="${m.id}">${esc(m.n)}</option>`).join('')}</select></label><label class="front-field" id="roomCountField">Joueurs<select id="roomCount"><option value="3">3 joueurs</option><option value="4">4 joueurs</option></select></label><button class="btn glass" id="roomApply">Appliquer la carte</button></div><p class="front-note" id="roomConfigInfo">L’hôte peut changer la carte avant le départ. Les joueurs devront confirmer à nouveau leur statut prêt.</p><div id="roomRoster"></div><div id="roomCoopBalance" class="front-coop-balance" aria-live="polite"></div><p class="front-note">Les équipes suivent l’ordre des places : en 2 contre 2, places 1–2 face aux places 3–4. Chacun doit se déclarer prêt. L’hôte démarre la partie. Le serveur la fait avancer, même lorsque son onglet est masqué.</p><label class="front-field">Lien d’invitation à transmettre<input id="roomInvite" readonly></label><div class="front-actions"><button class="btn gold" id="roomReady">Je suis prêt</button><button class="btn" id="roomLaunch">Lancer la partie</button><button class="btn glass" id="roomDeck">Changer de deck</button><button class="btn glass" id="roomFriends">Inviter des amis</button><button class="btn glass" id="roomLeave">Quitter</button></div><p id="roomErr" class="front-error"></p>`);paintRoom();$('roomApply').onclick=async()=>{const button=$('roomApply');button.disabled=true;try{await send('configure',{map:$('roomMap').value,count:+$('roomCount').value});}catch(e){if($('roomErr'))$('roomErr').textContent=e.message;}finally{if(button.isConnected)button.disabled=!room||room.started||room.self!==0;}};$('roomDeck').onclick=async()=>{if(room.started)return;try{if(room.players[room.self]?.ready)await send('ready');}catch(e){toast(e.message,'bad');return;}closeScene(true);tab('arsenal');toast('Choisis ton deck, puis reviens au salon par Amis.','good');};$('roomFriends').onclick=()=>Social.open();$('roomReady').onclick=async()=>{try{if(!room.players[room.self]?.ready)await send('loadout',Troops.loadout());await send('ready');}catch(e){if($('roomErr'))$('roomErr').textContent=e.message;}};$('roomLaunch').onclick=()=>send('start').catch(e=>{const err=$('roomErr');if(err)err.textContent=e.message;else toast(e.message,'bad');});$('roomLeave').onclick=async()=>{try{await send('leave');}catch{}transport?.close();transport=null;room=null;Social.refresh();closeScene();};}
  function paintRoom(){if(!room)return;const mayEdit=room.self===0&&!room.started;$('roomMap').value=room.config.map;$('roomMap').disabled=!mayEdit;$('roomCount').value=String(room.capacity);$('roomCount').disabled=!mayEdit;$('roomCountField').hidden=room.config.mode!=='ffa';$('roomApply').hidden=room.self!==0;$('roomApply').disabled=!mayEdit;$('roomConfigInfo').textContent=room.started?'Carte verrouillée pour la partie en cours.':room.self===0?'Les 16 cartes sont jouables. Un changement annule les statuts prêts.':'L’hôte peut changer la carte avant le départ.';const cb=$('roomCoopBalance');if(cb){cb.hidden=room.config.mode!=='coop';if(!cb.hidden)cb.innerHTML=coopSummary(room.players.filter(Boolean).length,room.config.diff);}$('roomCode').textContent=room.code;$('roomMode').textContent=(room.config.campaign?'Campagne coopérative':MODES[room.config.mode].n)+' · '+MAPS.find(m=>m.id===room.config.map)?.n;$('roomInvite').value=location.origin+'/?room='+room.code;$('roomRoster').innerHTML=Array.from({length:room.capacity},(_,i)=>{const p=room.players[i];return `<div class="front-row"><span class="front-avatar" style="color:${colors[i]}">${i+1}</span><b>${p?esc(p.name):'Place libre'}</b><span style="margin-left:auto">${p?(p.connected?(p.ready?'Prêt ✓':'En préparation'):'Déconnecté'):'En attente'}</span></div>`;}).join('');$('roomLaunch').style.display=room.self===0?'':'none';$('roomDeck').disabled=room.started;$('roomReady').disabled=room.started;$('roomLaunch').disabled=room.started;$('roomReady').textContent=room.started?'En attente de la prochaine mission':room.players[room.self]?.ready?'Annuler mon statut prêt':'Je suis prêt';}
  function begin(c,self,host){
    const teams=MODES[c.mode].teams(c.players.length);const P=MAPS.find(m=>m.id===c.map)||MAPS[0],W=MapGen.get(P.id);
    const boards=[...new Set(teams)].map(team=>{const b=Engine.create({preset:P,world:W,deck:(c.mode==='coop'&&c.players[self]?.defenses?.length?c.players[self].defenses.map(id=>({id,lvl:1})):standard.map(d=>({...d}))),diff:c.diff,seed:443});const count=teams.filter(t=>t===team).length;b.wallets=Object.fromEntries(c.players.filter((_,i)=>teams[i]===team).map(p=>[p.id,300]));b.viewer=teams[self]===team?self:c.players.find((_,i)=>teams[i]===team).id;Object.defineProperty(b,'energy',{enumerable:true,configurable:true,get(){return this.wallets[this._actor??this.viewer]??0;},set(v){this.wallets[this._actor??this.viewer]=v;}});if(c.mode==='coop')CoopBalance.configure(b,count);b.team=team;b.ab.strike.max=35;b.mpWaveTime=0;return b;});
    session={...c,teams,boards,self,host,clock:0,botTime:0,nextWaveAt:20,ended:false,attackCd:{},waveDeadline:0};if(c.mode!=='coop')SiegePvP.configure(session,self);MatchSpeed.configure(session);pendingEvents=session.boards.map(()=>[]);lastNet=0;
    G.paused=true;const my=SiegePvP.board(session,self);
    Battle.open({preset:P,world:my.W,state:my,deck:my.deck,diff:c.diff,onEnd:()=>{if(room)send('leave').catch(()=>{});transport?.close();transport=null;room=null;session=null;G.paused=false;render(true);}});
  }
  function attach(b,v,r){B=b;V=v;root=r;timer=0;architecture=Architecture3D.attach(V,B.W);worldFx=FrontierFX.create(V,B);radar=B.pvp?null:WaveRadar.create(B,V,root);territories=TerritoryUI.create(B,V,root);
    const help=document.createElement('div');help.className='front-help';help.innerHTML='<b>POSE LIBRE · OCCUPE LES HAUTEURS</b>Clique une défense, puis un sol libre dans une zone disponible. Glisser : caméra.';root.appendChild(help);
    mini=document.createElement('canvas');mini.width=440;mini.height=440;mini.className='front-minimap';mini.title='Cliquer pour déplacer la caméra';mini.setAttribute('aria-label','Minicarte tactique');root.appendChild(mini);mini.onclick=e=>{const r=mini.getBoundingClientRect();V.focus((e.clientX-r.left)/r.width*B.W.S,(e.clientY-r.top)/r.height*B.W.S);};
    if(V.orbit){const row=root.querySelector('.b-side');for(const [label,angle]of [['↶',-.35],['↷',.35]]){const b=document.createElement('button');b.className='b-ic sm';b.textContent=label;b.setAttribute('aria-label',angle<0?'Tourner la vue à gauche':'Tourner la vue à droite');b.onclick=()=>V.orbit(angle);row.appendChild(b);}}
    miniBg=new Image();miniBg.src=B.pvp?siegeMini(B.W):mapThumb(B.P.id,440,440);
    const co=document.createElement('div');co.className='front-coords';co.textContent=`${B.W.S} × ${B.W.S} m · ${DIFF[B.diff].n} · ${V.software?'3D · compatible':'3D'}`;if(B.coop){co.textContent+=' · Coop '+B.coop.players+' joueurs';co.title=coopSummary(B.coop.players,B.diff).replace(/<[^>]+>/g,' ');}root.appendChild(co);
    if(V.terrain){for(const h of B.W.hills){const pts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,x=h.x+Math.cos(a)*(h.r-.55),y=h.y+Math.sin(a)*(h.r-.55);pts.push(new T.Vector3(x,V.groundY(x,y)+.04,y));}const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#a6c985',transparent:true,opacity:.6}));V.scene.add(line);}}
    hillEls=B.W.hills.map(h=>{const e=document.createElement('div');e.className='front-hill';e.innerHTML='▲ '+h.name+'<span>Portée +25 %</span>';root.appendChild(e);return {h,e};});
    PlayerProfile.mount(root);hud=CompactHUD.create(B,V,root);TacticalUI.attach(B,V,root);
    const tip=document.createElement('div');tip.className='front-ghost-tip hidden';tip.id='frontGhostTip';root.appendChild(tip);
    if(session){const players=document.createElement('div');players.className='front-players';players.id='frontPlayers';root.appendChild(players);help.innerHTML=`<b>${MODES[session.mode].n.toUpperCase()} · ${session.authority==='server'?'SERVEUR ACTIF':session.host?'LOCAL':'JOUEUR'}</b>${session.mode==='coop'?'Citadelle partagée · gains d’élimination communs · dépenses personnelles · '+(B.coop?.players||session.players.length)+' joueurs.':'Protège ta citadelle. Fais tomber celles des autres.'}`;
    }
    Troops.attach(B,V,root);towerLevels=TowerLevelUI.attach(B,V,root);outposts3D=Outpost3D.attach(B,V,root);performanceUI=RuntimePerformance.attach(V,root);mobileHud=MobileHUD.attach(B,V,root);towerFinder=TowerFinder.attach(B,V,root);const vote=document.createElement('section');vote.id='coopSpeedVote';vote.className='coop-speed-vote';vote.hidden=true;vote.setAttribute('aria-live','polite');root.appendChild(vote);
  }
  function detach(){TacticalUI.detach();towerFinder?.dispose();towerFinder=null;mobileHud?.dispose();mobileHud=null;towerLevels?.dispose();towerLevels=null;performanceUI?.dispose();performanceUI=null;outposts3D?.dispose();outposts3D=null;Troops.detach();hud?.dispose();hud=null;territories?.dispose();territories=null;architecture?.dispose();architecture=null;radar?.dispose();radar=null;worldFx?.dispose();worldFx=null;ghost(null);if(V&&ghostMesh)V.scene.remove(ghostMesh);if(ghostMesh)ghostMesh.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});ghostMesh=null;ghostRing=null;B=null;V=null;root=null;hillEls=[];}
  function ghost(data){if(!V||!root)return;const tip=$('frontGhostTip');if(!data){ghostP=null;if(ghostMesh)ghostMesh.visible=false;tip?.classList.add('hidden');V.showRange(0,0,null);return;}
    const {p,di,error,adjusted}=data,d=B.deck[di],r=Engine.radius(d.id),high=B.W.hills.some(h=>Math.hypot(p.x-h.x,p.y-h.y)<h.r-.6),st=Engine.stats({pvp:!!B.pvp,card:d.id,lvl:1,clvl:d.lvl,high});ghostP=data;
    Tactical.boardStats(B,{...p,S:st});
    if(!ghostMesh){ghostMesh=new T.Group();const mat=()=>new T.MeshBasicMaterial({color:'#7affb6',transparent:true,opacity:.48,wireframe:true,depthTest:false});const base=new T.Mesh(new T.CylinderGeometry(1,1,.16,16),mat());ghostMesh.add(base);const tower=new T.Mesh(new T.BoxGeometry(.9,.7,.9),mat());tower.position.y=.4;ghostMesh.add(tower);const barrel=new T.Mesh(new T.BoxGeometry(1,.16,.18),mat());barrel.position.set(.6,.8,0);ghostMesh.add(barrel);ghostRing=new T.Mesh(new T.RingGeometry(1,1.07,48),mat());ghostRing.rotation.x=-Math.PI/2;ghostRing.position.y=.05;ghostMesh.add(ghostRing);V.scene.add(ghostMesh);}
    ghostMesh.visible=!error;ghostMesh.position.set(p.x,V.groundY(p.x,p.y)+.14,p.y);ghostMesh.scale.set(r,1,r);ghostMesh.traverse(o=>{if(o.material)o.material.color.set(error?'#ff626d':'#7affb6');});V.showRange(p.x,p.y,st.range,error?'#ff626d':'#7affb6',st.minRange);tip.className='front-ghost-tip'+(error?' bad':'');tip.textContent=error||`${CARD[d.id].n} · ${Engine.cost(d.id,!!B.pvp)} énergie · ${adjusted?'Pose ajustée · ':''}${high?'▲ Bonus de hauteur actif':'Sol libre'} · diamètre ${(r*2).toFixed(2)} m${st.minRange?' · portée utile '+st.minRange.toFixed(1)+'–'+st.range.toFixed(1)+' m':''}`;
  }
  function execute(b,k,d,player){
    if(!b||['win','lose'].includes(b.phase))return 'Cette citadelle ne combat plus.';
    if(k==='place'){if(!Number.isInteger(d.di)||d.di<0||d.di>=b.deck.length)return 'Défense invalide';const pos=Engine.resolvePlacement(b,d.di,d.p);const r=Engine.place(b,d.di,pos||d.p);if(typeof r!=='string')r.owner=player;return r;}
    if(['upgrade','sell','target','specialize'].includes(k)){
      const boards=session?.pvp?session.boards:[b],ownerBoard=boards.find(q=>q.towers.some(t=>t.id===d.id)),tw=ownerBoard?.towers.find(t=>t.id===d.id);if(!tw)return 'Défense introuvable';
      const own=!session||tw.owner===player,allied=!session||session.teams[tw.owner]===session.teams[player];
      if(k==='upgrade'){if(!allied)return 'Seules tes tourelles et celles de tes alliés peuvent être améliorées.';if(['lose','win'].includes(ownerBoard.phase))return 'Cette tourelle ne combat plus.';const result=Engine.upgrade(b,tw);if(typeof result!=='string'&&ownerBoard!==b)Engine.refresh(ownerBoard);return result;}
      if(!own)return 'Seul le propriétaire peut vendre ou changer le ciblage de cette défense.';
      if(k==='specialize')return Tactical.specialize(ownerBoard,tw,d.branch);
      if(k==='sell')return Engine.sell(b,tw);if(!['first','strong','close'].includes(d.mode))return 'Ciblage invalide';tw.mode=d.mode;return true;
    }
    if(k==='annex')return Number.isInteger(d.sid)&&b.W.sectors[d.sid]?Engine.annex(b,d.sid):'Secteur invalide';
    if(k==='repair')return Engine.repair(b);
    if(k==='order')return Tactical.chooseOrder(b,d.id);
    if(k==='ability'){if(!['strike','stasis'].includes(d.kind)||!d.p||!Number.isFinite(d.p.x)||!Number.isFinite(d.p.y)||d.p.x<0||d.p.y<0||d.p.x>b.W.S||d.p.y>b.W.S)return 'Cible invalide';return Engine.ability(b,d.kind,d.p.x,d.p.y);}
    if(k==='wave'){if(session){if(player!==0)return 'L’hôte contrôle le départ des vagues.';if(session.boards.some(b=>b.phase==='wave'))return 'Attends la fin des assauts en cours.';nextWave();return true;}Engine.startWave(b);return true;}
    return 'Action inconnue';
  }
  function command(k,d={},b=B){if(!session)return execute(b,k,d,0);if(session.ended||session.disconnected)return 'Partie arrêtée.';if(!session.host){send('command',{k,d}).catch(e=>Battle.hint(e.message));return true;}return apply(session.self,{k,d});}
  function apply(player,msg){if(!session||!session.players[player]||!msg||typeof msg!=='object')return 'Joueur invalide';const b=SiegePvP.board(session,player),prior=b._actor,priorDeck=b.deck;b._actor=player;if(session.mode==='coop')b.deck=(session.players[player].defenses||standard.map(d=>d.id)).map(id=>({id,lvl:1}));try{return applyCommand(player,msg);}finally{b._actor=prior;b.deck=priorDeck;}}
  function applyCommand(player,msg){if(!session||!session.players[player]||session.ended)return 'Joueur invalide';const b=SiegePvP.board(session,player);if(msg.k==='speed')return MatchSpeed.request(session,player,msg.d||{});if(msg.k==='speedVote')return MatchSpeed.vote(session,player,msg.d||{});if(session.pvp&&msg.k==='troopUpgrade')return TroopUpgrades.upgrade(session,player,msg.d||{});if(session.pvp&&msg.k==='troop')return SiegePvP.deployment(session,player,msg.d||{});return execute(b,msg.k,msg.d||{},player);}
  function nextWave(){if(session.pvp){SiegePvP.start(session);return;}for(const b of session.boards)if(b.phase==='build'){Engine.startWave(b);b.mpWaveTime=session.clock;}session.nextWaveAt=null;}
  function botAct(i){const b=session.boards[session.teams[i]],prev=b._actor;b._actor=i;try{botActOwn(i);}finally{b._actor=prev;}}
  function botActOwn(i){const s=session,b=s.boards[s.teams[i]];if(['lose','win'].includes(b.phase))return;const r=b.rnd;let chosen=null;
    const affordable=b.deck.map((d,di)=>({di,cost:Engine.cost(d.id,!!b.pvp)})).filter(d=>d.cost<=b.energy);
    if(b.towers.filter(t=>t.owner===i).length>=3&&b.energy>200&&r()<.18){const zone=b.W.sectors.filter(z=>!b.owned[z.id]&&b.energy>=z.cost+100&&b.inf>=z.inf).sort((a,c)=>a.d-c.d)[0];if(zone)apply(i,{k:'annex',d:{sid:zone.id}});}
    if(affordable.length){for(let j=0;j<50;j++){const di=affordable[Math.floor(r()*affordable.length)].di,L=Engine.activeLanes(b)[Math.floor(r()*Engine.activeLanes(b).length)],pos=MapGen.posAt(L,Math.max(0,L.len*(.35+r()*.6))),a=r()*Math.PI*2,d=1.1+r()*1.8,p={x:pos.x+Math.cos(a)*d,y:pos.y+Math.sin(a)*d};if(!Engine.checkPlace(b,di,p)){chosen={di,p};break;}}}
    if(chosen&&b.towers.filter(t=>t.owner===i).length<14)apply(i,{k:'place',d:chosen});else{const tw=b.towers.find(t=>t.owner===i&&t.lvl<3&&b.energy>=Engine.upCost(t));if(tw)apply(i,{k:'upgrade',d:{id:tw.id}});}
    if(s.mode!=='coop'&&r()<.3&&b.energy>130){const targets=s.boards.filter(t=>t!==b&&t.phase==='wave');if(targets.length)apply(i,{k:'attack',d:{target:targets[Math.floor(r()*targets.length)].team}});}
  }
  function step(dt){const s=session;if(!s||s.disconnected)return;if(s.ended){if(room&&s.host&&!netBusy&&!s.finalSent){netBusy=true;send('state',snapshot()).then(()=>s.finalSent=true).catch(()=>{}).finally(()=>netBusy=false);}return;}if(!s.host){const smoothing=1-Math.exp(-Math.max(0,dt)*9);for(const b of s.boards)for(const m of b.mobs)if(m._target){m.x+=(m._target.x-m.x)*smoothing;m.y+=(m._target.y-m.y)*smoothing;}return;}
    MatchSpeed.tick(s,dt);dt*=s.pvp?1:s.speed;
    if(s.pvp){SiegePvP.step(s,dt);s.boards.forEach((b,i)=>{pendingEvents[i].push(...b.ev);if(pendingEvents[i].length>240)pendingEvents[i].splice(0,pendingEvents[i].length-240);if(!B)b.ev.length=0;else if(b.ev.length>120)b.ev.splice(0,b.ev.length-120);});return;}
    s.clock+=dt;for(const b of s.boards){Engine.step(b,dt);if(s.mode!=='coop'&&b.phase==='wave'&&s.clock-b.mpWaveTime>180){b.hp=0;b.phase='lose';b.ev.push({k:'lose'});}pendingEvents[b.team].push(...b.ev);if(pendingEvents[b.team].length>240)pendingEvents[b.team].splice(0,pendingEvents[b.team].length-240);if(b!==B)b.ev.length=0;}
    s.botTime+=dt;if(s.botTime>1.4){s.botTime=0;s.players.forEach((p,i)=>{if(p.bot)botAct(i);});}
    const active=s.boards.filter(b=>b.phase!=='lose');let finished=false,winner=null;
    if(s.mode==='coop'){finished=['win','lose'].includes(s.boards[0].phase);winner=s.boards[0].phase==='win'?0:null;}
    else if(active.length<=1){finished=true;winner=active[0]?.team??null;}else if(active.every(b=>b.phase==='win')){finished=true;const sorted=[...active].sort((a,b)=>b.hp-a.hp||b.kills-a.kills);winner=sorted[0].hp===sorted[1].hp&&sorted[0].kills===sorted[1].kills?'draw':sorted[0].team;}
    if(finished){s.ended=true;s.winner=winner;s.resultDue=performance.now()+800;}
    if(!s.ended&&s.boards.every(b=>b.phase!=='wave')){if(s.nextWaveAt==null)s.nextWaveAt=s.clock+16;if(s.clock>=s.nextWaveAt)nextWave();}
    lastNet+=dt;if(room&&lastNet>.12&&!netBusy){lastNet=0;netBusy=true;const snap=snapshot();send('state',snap).catch(()=>{s.disconnected=true;Battle.hint('Connexion perdue : la partie est suspendue.');}).finally(()=>netBusy=false);}
  }
  function snapshot(){const s=session;return {speed:s.speed,realClock:s.realClock,speedVote:s.speedVote,pvp:!!s.pvp,started:s.started,startedAt:s.startedAt,troopEra:s.troopEra,outposts:s.outposts,troopUpgrades:s.troopUpgrades,deployCd:s.deployCd,clock:s.clock,nextWaveAt:s.nextWaveAt,ended:s.ended,winner:s.winner,attackCd:s.attackCd,boards:s.boards.map((b,i)=>{const copy={};for(const k of ['speed','t','phase','wave','maxWave','hp','maxHp','energy','wallets','inf','owned','towers','mobs','shots','puddles','smokes','mines','kills','leaks','bosses','ab','stats','seen','team','player','troopDeck','coop','weather','tactical','orderOffer','order'])copy[k]=b[k];copy.radarState=b.pvp?null:WaveRadar.describe(b);copy.nextIntel=b.phase==='build'&&!b.pvp?Engine.preview(b).counts:null;copy.ev=pendingEvents[i].splice(0);return JSON.parse(JSON.stringify(copy,(k,v)=>['def','path','lane','spots','_target','weapon','shieldQuiet','fireCd','_beamMode','reactionReady','freezeReady','stunReady','_thermalAt'].includes(k)?undefined:typeof v==='number'&&Number.isFinite(v)&&!Number.isInteger(v)?Math.round(v*1000)/1000:k==='tw'&&v&&typeof v==='object'?{__tw:v.id}:v));})};}
  function applySnapshot(data){const s=session;if(!s||!data?.boards)return;s.clock=data.clock;s.speed=[1,2,3,4].includes(data.speed)?data.speed:1;s.realClock=data.realClock||0;s.speedVote=data.speedVote||null;s.started=data.started;s.startedAt=data.startedAt??s.startedAt;s.troopEra=data.troopEra??s.troopEra;s.outposts=data.outposts||s.outposts;s.troopUpgrades=data.troopUpgrades||s.troopUpgrades;s.deployCd=data.deployCd||{};s.nextWaveAt=data.nextWaveAt;s.attackCd=data.attackCd||{};
    data.boards.forEach((src,i)=>{const b=s.boards[i];if(!b)return;const old=new Map(b.mobs.map(m=>[m.id,m]));const events=[...b.ev,...src.ev];Object.assign(b,src);b.ev=events.slice(-300);for(const m of b.mobs){m.def=s.pvp?SiegePvP.combatDefinition(m.type,TroopUpgrades.stats(s,m.owner,m.type)):UNIT[m.type];const prior=old.get(m.id);if(prior&&!(globalThis.document?.hidden)){m._target={x:m.x,y:m.y};m.x=prior.x;m.y=prior.y;}}
      const towerById=new Map(b.towers.map(t=>[t.id,t]));for(const arr of [b.shots,b.puddles,b.mines])for(const q of arr){if(q.tw?.__tw)q.tw=towerById.get(q.tw.__tw)||{id:0,card:'gatling_0',x:q.x,y:q.y};}
    });
    if(data.ended&&!s.ended){s.ended=true;s.winner=data.winner;s.resultDue=performance.now()+800;}
  }
  function renderState(b=B){if(!session?.pvp)return b;const out={...b};for(const k of ['towers','mobs','shots','puddles','smokes','mines','ev'])out[k]=session.boards.flatMap(q=>q[k]);return out;}
  function clearRenderEvents(){if(session?.pvp)for(const b of session.boards)b.ev.length=0;}
  function siegeMini(W){const canvas=document.createElement('canvas');canvas.width=canvas.height=440;const c=canvas.getContext('2d'),sc=440/W.S;c.fillStyle=W.biome.water;c.fillRect(0,0,440,440);for(let r=0;r<W.Rr;r++)for(let k=0;k<W.C;k++){const h=W.H[r*W.C+k];if(h<.015)continue;c.fillStyle=h<.06?W.biome.sand:h>.45?W.biome.grass2:W.biome.grass;c.fillRect(k*W.res*sc,r*W.res*sc,W.res*sc+1,W.res*sc+1);}c.strokeStyle=W.biome.sand;c.lineWidth=W.roadHalfWidth*2*sc;c.lineJoin='round';for(const L of W.lanes){c.beginPath();L.pts.forEach((p,i)=>i?c.lineTo(p.x*sc,p.y*sc):c.moveTo(p.x*sc,p.y*sc));c.stroke();}return canvas.toDataURL();}
  function drawMini(){if(!mini||!B||(root.classList.contains('mobile-hud')&&!root.classList.contains('map-expanded')))return;const view=renderState(B);const c=mini.getContext('2d'),n=440,sc=n/B.W.S;c.clearRect(0,0,n,n);if(miniBg.complete&&miniBg.naturalWidth)c.drawImage(miniBg,0,0,n,n);else{c.fillStyle='#20372e';c.fillRect(0,0,n,n);}for(const h of B.W.hills){c.strokeStyle='#c6e9b0';c.lineWidth=1;c.beginPath();c.arc(h.x*sc,h.y*sc,h.r*sc,0,7);c.stroke();}for(const t of view.towers){c.fillStyle=colors[t.owner||0];c.beginPath();c.arc(t.x*sc,t.y*sc,2.7,0,7);c.fill();}for(const m of view.mobs){if(m.dead)continue;c.fillStyle=B.pvp?colors[m.owner]:m.def.boss?'#fff1bb':'#ff6a61';c.fillRect(m.x*sc-1,m.y*sc-1,m.def.boss?4:2.5,m.def.boss?4:2.5);}if(session?.pvp){for(const o of B.W.outposts||[]){const state=session.outposts?.find(q=>q.id===o.id),col=state?.owner==null?'#d9cfad':colors[state.owner];c.fillStyle=col;c.strokeStyle=state?.contested?'#ff654f':'#112731';c.lineWidth=2;c.beginPath();c.arc(o.x*sc,o.y*sc,5,0,Math.PI*2);c.fill();c.stroke();}for(const q of session.boards){c.fillStyle=colors[q.player];c.strokeStyle='#06171c';c.lineWidth=2;c.fillRect(q.W.cit.x*sc-5,q.W.cit.y*sc-5,10,10);c.strokeRect(q.W.cit.x*sc-5,q.W.cit.y*sc-5,10,10);c.fillStyle='#fff';c.font='bold 12px sans-serif';c.fillText(q.player+1,q.W.cit.x*sc+7,q.W.cit.y*sc+4);}}radar?.drawMini(c,n);c.strokeStyle='#fff';c.lineWidth=1.4;c.strokeRect((V.cam.tx-5)*sc,(V.cam.tz-4)*sc,10*sc,8*sc);}
  function frame(dt){if(!B||!V)return;Troops.frame(dt);outposts3D?.frame(dt);hud?.frame(dt);mobileHud?.frame(dt);territories?.frame(dt);architecture?.frame(B.paused?0:dt);worldFx?.frame(B.paused?0:dt);radar?.frame(B.paused?0:dt);timer+=dt;for(const {h,e} of hillEls){const p=V.project(h.x,h.y,V.groundY(h.x,h.y)+.3);const bot=root.querySelector('.b-bottom')?.offsetHeight||240;e.style.display=!B.towers.some(t=>Math.hypot(t.x-h.x,t.y-h.y)<h.r)&&p.ok&&p.x>45&&p.x<innerWidth-45&&p.y>(session?190:145)&&p.y<innerHeight-bot-35?'':'none';e.style.left=p.x+'px';e.style.top=p.y+'px';}
    // Visible ownership rings and landed base footprint, no gameplay obstruction.
    for(const t of renderState(B).towers){const rig=V.rigs?.get(t.id);if(rig?.g?.add&&!rig.frontBase){const radius=Engine.radius(t.card);const mesh=new T.Mesh(new T.RingGeometry(radius*.93/.75,radius/.75,40),new T.MeshBasicMaterial({color:colors[t.owner||0],transparent:true,opacity:.65,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.y=.045;rig.g.add(mesh);rig.frontBase=mesh;}}
    if(ghostP?.error){const p=V.project(ghostP.p.x,ghostP.p.y,V.groundY(ghostP.p.x,ghostP.p.y)+.2);let cross=$('frontNoBuild');if(!cross){cross=document.createElement('div');cross.id='frontNoBuild';cross.className='front-no-build';cross.textContent='✕';root.appendChild(cross);}cross.style.display='';cross.style.left=p.x+'px';cross.style.top=p.y+'px';}else if($('frontNoBuild'))$('frontNoBuild').style.display='none';
    if(timer>.18){timer=0;speedVoteUI();drawMini();const bottom=(root.querySelector('.b-bottom')?.offsetHeight||220)+12;mini.style.bottom=bottom+'px';root.querySelector('.front-coords').style.bottom=(bottom+mini.offsetHeight+6)+'px';if(session){const s=session;const playerHTML=s.boards.map(b=>`<div class="front-player ${b.phase==='lose'?'out':''}" style="--team:${colors[b.team]}"><b>${s.pvp?esc(s.players[b.player].name):'Équipe '+(b.team+1)} · ${b.hp}/${b.maxHp} ♥</b><small>${s.pvp?(s.players[b.player].bot?'IA · ':'')+(b.player===s.self?'Toi':b.team===B.team?'Allié':'Adversaire'):s.players.filter((_,i)=>s.teams[i]===b.team).map(p=>esc(p.name)+(p.bot?' · IA':'')).join(' + ')}</small><small>${b.phase==='lose'?'Éliminée':b.phase==='win'?'Mission terminée':'Vague '+b.wave+' · '+b.kills+' éliminations'}</small></div>`).join('');const playerBox=$('frontPlayers');if(playerBox._html!==playerHTML){playerBox._html=playerHTML;playerBox.innerHTML=playerHTML;}if(B.phase==='wave')$('bGoS').textContent='Assaut synchronisé';if(s.nextWaveAt!=null&&B.phase==='build')$('bGoS').textContent='Départ dans '+Math.max(0,Math.ceil(s.nextWaveAt-s.clock))+' s';if($('frontAttack')){const cd=Math.max(0,Math.ceil((s.attackCd[s.self]||0)-s.clock));$('frontAttack').textContent=cd?'Recharge · '+cd+' s':'Envoyer un assaut · 80 ⚡';$('frontAttack').disabled=cd>0||B.energy<80||B.phase!=='wave';root.querySelector('.front-pvp').style.bottom=bottom+'px';}if(s.ended&&s.resultDue&&performance.now()>s.resultDue){s.resultDue=null;showResult();}}}
  }
  function afterFrame(dt){towerLevels?.frame(dt);towerFinder?.frame(dt);TacticalUI.frame(dt);}
  function speedVoteUI(){
    const el=root?.querySelector('#coopSpeedVote');if(!el)return;const vote=session?.speedVote;el.hidden=!vote;if(!vote){el._sig='';return;}
    const accepted=vote.accepted.includes(session.self),left=Math.max(0,Math.ceil(vote.expiresAt-session.realClock)),signature=[vote.id,vote.accepted.join(','),left].join('|');if(el._sig===signature)return;el._sig=signature;
    el.innerHTML=`<div><b>Passer à ×${vote.speed} ?</b><span>${esc(session.players[vote.by]?.name||'Un allié')} · ${vote.accepted.length}/${vote.eligible.length} d’accord · ${left} s</span></div><button type="button" data-speed-yes ${accepted?'disabled':''}>${accepted?'Accepté ✓':'Accepter'}</button><button type="button" data-speed-no>Refuser</button>`;
    el.querySelector('[data-speed-yes]').onclick=()=>command('speedVote',{id:vote.id,accept:true});el.querySelector('[data-speed-no]').onclick=()=>command('speedVote',{id:vote.id,accept:false});
  }
  function towerAccess(id){const board=(session?.pvp?session.boards:[B]).find(b=>b?.towers.some(t=>t.id===id)),tw=board?.towers.find(t=>t.id===id);if(!tw)return null;return{tw,board,own:!session||tw.owner===session.self,allied:!session||session.teams[tw.owner]===session.teams[session.self],name:session?.players[tw.owner]?.name||'Toi'};}
  function showResult(){const s=session;if(s.campaign){setTimeout(()=>{if(session===s)CampaignCoop.finish(s);},0);return;}dialog(`<div class="front-eyebrow">Fin de l’escarmouche</div><h3>${s.winner==='draw'?'Égalité':s.winner==null?'Citadelle tombée':s.winner===s.teams[s.self]?'Victoire de ton équipe':'Victoire de l’équipe '+(s.winner+1)}</h3>${s.boards.map(b=>`<div class="front-row"><b>${s.pvp?esc(s.players[b.player].name):'Équipe '+(b.team+1)}</b><span>${b.hp} PV · ${b.kills} éliminations</span></div>`).join('')}<p class="front-note">Le PvP utilise tes cartes équipées avec des niveaux égalisés et n’affecte pas la progression de ta campagne.</p><button class="btn gold full" id="frontResultExit">Retour au QG</button>`);$('frontResultExit').onclick=()=>{closeScene(true);if(room)send('leave').catch(()=>{});transport?.close();transport=null;room=null;Battle.close();session=null;G.paused=false;render(true);};}
  function packIntro(sc,p,onReveal){
    const layer=document.createElement('div');layer.className='front-pack-stage';layer.innerHTML=`<div class="front-eyebrow">Ravitaillement sécurisé</div><h3>${esc(p.n)}</h3><div class="front-pack-halo"></div><div class="front-pack-burst" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--angle:${i*22.5}deg;--reach:${150+i%4*35}px"></i>`).join('')}</div><button class="front-pack" aria-label="Ouvrir le pack" style="--p1:${p.p1};--p2:${p.p2}"><strong>OWNED</strong><small>${p.cards} CARTE${p.cards>1?'S':''}</small><span class="front-pack-seal">SCELLÉ</span></button><button class="btn gold front-pack-trigger">Déchirer le sceau</button><p class="front-pack-caption" aria-live="polite">Tes cartes restent secrètes jusqu’à l’ouverture.</p>`;sc.appendChild(layer);let opened=false;
    layer.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(opened)return;opened=true;layer.querySelectorAll('button').forEach(el=>el.disabled=true);layer.querySelector('.front-pack-caption').textContent='Ouverture du ravitaillement…';sfx.rip();buzzV([20,40,30]);layer.classList.add('opening');setTimeout(()=>{if(!sc.isConnected)return;layer.remove();onReveal();sfx.pop();},RM?180:1050);});
    layer.querySelector('.front-pack-trigger').focus({preventScroll:true});
  }

  addEventListener('keydown',e=>{if(!B||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;if(e.key==='Escape'){Battle.cancelPlace();}if(/^[1-6]$/.test(e.key)){if(Troops.key(+e.key-1))return;const el=root.querySelectorAll('#bDeck .b-card')[+e.key-1];if(el){el.dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,clientX:0,clientY:0}));el.dispatchEvent(new PointerEvent('pointerup',{pointerId:1,clientX:0,clientY:0}));}}});
  return {towerAccess,renderState,clearRenderEvents,attach,detach,frame,afterFrame,ghost,dps,statHTML,lobbyHTML,bindLobby,packIntro,command,step,setup,friends,guide,multiplayerGuide,join,resume,setProfile:u=>{profile.name=u.name;profile.id=u.id;saveProfile();},get room(){return room;},begin,snapshot,applySnapshot,apply,campaignMenu,finishCampaign,campaignRoom,get session(){return session;}};
})();




globalThis.OwnedGame={Engine,MapGen,MAPS,Frontier,WaveRadar,CARD,UNIT,FAM,TroopData,TroopUpgrades,CoopBalance,SiegePvP,MatchSpeed,Tactical,DefenseGuide};
