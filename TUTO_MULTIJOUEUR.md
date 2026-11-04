# OWNED — Frontières / Bastorynn : jouer à plusieurs

## Démarrer avec des amis

Le **ZIP complet** contient le jeu et son serveur multijoueur. Le HTML seul permet le solo et les parties avec IA ; un hébergement statique du HTML ne lance pas les comptes, les invitations ou les parties entre appareils.

1. Extrais entièrement le ZIP sur un PC. Installe Node.js 20 ou plus récent si nécessaire.
2. Sous Windows, double-clique sur **OUVRIR_MULTIJOUER.bat**. Sur macOS/Linux, lance `node server.cjs` dans le dossier extrait.
3. Garde la fenêtre du serveur ouverte. Sur le PC hôte, le jeu est accessible à `http://localhost:8787`.
4. Sur le même Wi-Fi, tous les autres joueurs ouvrent **l’adresse réseau affichée par le serveur**, par exemple `http://192.168.1.25:8787`. Utilise ton adresse réelle ; `localhost` désigne l’appareil de la personne qui l’ouvre.
5. Dans **Combat → Amis & salons**, crée ton compte ou connecte-toi. **Rester connecté sur cet appareil** conserve la session.
6. Ajoute l’identifiant ou le code ami d’un autre joueur. Après acceptation, crée un salon puis utilise **Inviter**. Un ami peut aussi rejoindre avec le code à six caractères du salon.
7. Prépare tes cartes dans **Arsenal**, puis reviens au salon. Chaque joueur clique **Je suis prêt** ; l’hôte lance la partie.

Les invitations concernent les salons en préparation et expirent après dix minutes. Si une partie est déjà ouverte, **Quitter et rejoindre** permet d’accepter une autre invitation.

| Mode | Joueurs humains | Organisation |
|---|---:|---|
| Coopération | 2 à 4 | Une citadelle et des territoires partagés ; dépenses personnelles |
| 1 contre 1 | 2 | Un château par joueur |
| 2 contre 2 | 4 | Places 1–2 contre places 3–4 ; chacun garde son château |
| Chacun pour soi | 3 ou 4 | Un château par joueur ; tous adversaires |

Les **16 cartes** sont disponibles en escarmouche coopérative et en PvP, y compris chacun pour soi à trois joueurs. Pour une partie locale avec des IA, utilise **Escarmouche → Jouer avec les IA**.

### Modifier le salon

L’hôte peut changer la **carte avant le lancement**, sans recréer le salon. En chacun pour soi, il peut aussi sélectionner trois ou quatre places, tant que le salon ne contient pas plus de joueurs que le format choisi. Un changement de configuration annule les états « prêt » : chacun valide de nouveau. La carte et les decks sont verrouillés pendant la partie.

## Collection et decks

L’Arsenal rassemble **160 défenses et 185 troupes**. Cette mise à jour ajoute **25 troupes : cinq communes, cinq rares, cinq épiques, cinq légendaires et cinq mythiques**. Les nouvelles cartes ont leurs rôles, coûts et visuels ; les cartes déjà obtenues sont conservées.

1. Équipe jusqu’à **6 défenses et 6 troupes différentes**. Les deux sélections sont indépendantes.
2. Lorsqu’un deck est plein, touche la carte que tu veux ajouter : le jeu présente les six emplacements. **Choisis la carte à remplacer**, vérifie le changement puis confirme. La carte retirée reste dans ta collection.
3. Dans **Mes decks**, saisis un nom puis choisis **Enregistrer l’équipement actuel**. Jusqu’à douze decks peuvent être conservés ; réutiliser un nom met à jour le deck correspondant.
4. Sélectionne un deck enregistré et **Utiliser ce deck**. Si tu modifies ensuite des cartes, enregistre de nouveau pour mettre à jour ce deck nommé.
5. Depuis un salon en préparation, **Changer de deck** ouvre l’Arsenal. Reviens par **Amis**, puis déclare-toi prêt : ton nouvel équipement est transmis au salon.

Chaque joueur utilise son équipement, même en coopération. Changer de deck pendant qu’une partie existe prépare les parties suivantes ; cela ne remplace pas les cartes du combat déjà lancé.

Le catalogue propose les filtres **Tout / Défenses / Unités**, **Mes cartes / Catalogue complet**, la rareté et une recherche. Les cartes non obtenues restent consultables. Les six troupes de départ sont le Fantassin, l’Éclaireur à moto, la Jeep armée, le Char léger, l’Hélicoptère d’attaque et le Médecin. Chaque pack ajoute une troupe bonus aux défenses prévues. Les doublons sont conservés ; posséder plusieurs exemplaires d’une troupe ne multiplie pas sa puissance en PvP. Les probabilités des packs sont affichées dans la boutique ; les mythiques sont plus difficiles à obtenir.

## Coopération : énergie, amélioration et campagne

**Chaque élimination crédite la même prime à tous les joueurs de l’équipe.** La prime des ennemis ordinaires est ajustée au volume supplémentaire d’ennemis en coopération ; les centimes sont conservés pour que les petites primes ne disparaissent pas. Un ennemi ne peut donner sa prime qu’une fois.

Les réserves restent individuelles : construire, acheter une zone ou améliorer débite uniquement le joueur qui effectue l’action. Les revenus des forges et leurs bonus restent associés à leur propriétaire. Les territoires achetés sont utilisables par l’équipe.

Tu peux **améliorer une tourelle alliée avec ta propre énergie**, en coopération ou en équipe PvP. Son propriétaire ne change pas. La vente et le choix de son mode de ciblage restent réservés au propriétaire. Le bouton **Mes tourelles** permet de retrouver tes défenses et de centrer la caméra sur celle choisie.

La difficulté choisie — Normal, Difficile, Cauchemar ou Apocalypse — s’ajuste au nombre de joueurs présents au lancement, humains et IA compris. Les effectifs, les PV et l’étalement des vagues sont adaptés ; une déconnexion ou un changement d’onglet ne recalcule pas la difficulté en cours de route.

### Suivre la campagne ensemble

1. Ouvre **Combat → Campagne avec des amis**, choisis la mission et la difficulté, puis crée le salon de campagne.
2. Invite tes amis. À deux, trois ou quatre, préparez vos decks puis confirmez que vous êtes prêts.
3. Défendez la citadelle commune. Les victoires et étoiles sont enregistrées pour les participants ; la progression et les récompenses du profil connecté sont sauvegardées avec le compte.
4. Après le résultat, **Continuer avec le groupe** prépare la mission suivante en cas de victoire, ou la même après une défaite. Le salon est conservé, la difficulté revient à Normal et chacun doit se déclarer prêt de nouveau. Après la dernière mission, le groupe peut la rejouer.

Si un coffre occupe le résultat, ouvre-le puis retrouve le salon par **Campagne avec des amis**.

### Réparer et accélérer

**La citadelle se répare uniquement entre deux manches, en phase de construction.** Le serveur refuse toute réparation pendant l’assaut, même si le joueur dispose de l’énergie nécessaire. Une demande refusée ne retire aucune énergie. En PvP, la réparation est donc indisponible dès que le siège commence.

En solo, le bouton de vitesse permet **×1, ×2, ×3 et ×4**. En coopération, un joueur propose la vitesse ; **tous les autres joueurs humains doivent accepter** pour l’appliquer à la partie entière. Un refus ou la fin du délai laisse la vitesse actuelle. Avec des IA uniquement, la proposition du joueur humain peut s’appliquer directement. **Tous les modes PvP restent à ×1.**

## Le siège PvP

### Construire et déployer

1. Chaque joueur protège son château, dispose de sa réserve d’énergie et prépare sa défense pendant le compte à rebours.
2. Choisis une défense puis touche un sol autorisé. La pose peut s’ajuster légèrement vers une position libre proche. Le socle doit rester hors des voies, de l’eau, des bâtiments, des autres tourelles et des zones non achetées.
3. Dans le HUD, passe à **Troupes**, sélectionne le château adverse dans **Cible**, puis utilise les **boutons de voie numérotés**. Ils restent directement accessibles sur téléphone. Tu peux aussi toucher une base à capturer pour sélectionner sa voie.
4. En **Départ auto**, un appui sur la carte déploie la troupe depuis un emplacement valide près de ton château. Les troupes routières empruntent la voie choisie ; les véhicules hors piste, aéronefs et amphibies utilisent leur mode de déplacement.
5. Active **Départ précis** pour choisir toi-même le point de départ des troupes hors piste, aériennes ou amphibies : touche leur carte, puis le terrain autorisé près de ton château. Les troupes routières partent toujours par la voie sélectionnée. Un départ ou un trajet refusé ne consomme pas d’énergie.
6. Les troupes combattent les troupes adverses à portée et infligent leurs dégâts de siège lorsqu’elles atteignent le château ennemi. Les alliées ne se blessent pas. **Les troupes ne ciblent et ne détruisent pas les tourelles ; les tourelles tirent sur les troupes.**

Les envois n’ont pas de recharge propre : ton énergie limite les déploiements. Le HUD affiche le revenu personnel et l’état des bases. Les territoires supplémentaires s’achètent depuis **Territoires**.

### Capturer et contourner

Les troupes terrestres s’arrêtent dans les cercles des bases pour les capturer. L’infanterie et les éclaireurs capturent plus rapidement ; la présence de troupes adverses conteste la prise. Une base ennemie doit d’abord être neutralisée, puis capturée. Une base alliée non contestée produit de l’énergie à partager entre les membres de l’équipe encore en jeu. Les aéronefs ne capturent pas.

Les terrains PvP répartissent les châteaux et objectifs de façon symétrique, y compris à trois joueurs. Les voies utilisent aussi les îles latérales et leurs liaisons : changer de voie permet d’ouvrir un autre front et de contourner une concentration de défenses. Les véhicules évitent l’eau et les bâtiments ; les amphibies peuvent traverser l’eau et les aéronefs prennent une trajectoire directe.

En PvE, les fronts s’ouvrent progressivement. Sur l’Atoll, un front naval supplémentaire dessert l’îlot nord-est à partir de la vague 12, avec le même budget d’ennemis réparti sur les voies.

### Rôles et équilibrage

Compose une armée complémentaire : infanterie pour les bases, éclaireurs pour la mobilité, blindés pour encaisser, artillerie contre les groupes, anti-air contre les aéronefs, soins pour soutenir, Cryo pour ralentir et porte-boucliers en première ligne. Les soins se cumulent dans une limite commune par cible ; les capacités de boss inadaptées au siège ne sont pas importées depuis la campagne.

Les défenses ont un **équilibrage propre au PvP** : dégâts et progression en combat réduits, effets de contrôle limités et avantage de rareté resserré. Les statistiques PvE restent distinctes. La collection et ses niveaux ne permettent pas de contourner cette égalisation ; les améliorations achetées pendant le match gardent leur rôle tactique. La fiche de la tourelle affiche les statistiques appliquées au combat en cours.

La dernière équipe avec un château debout gagne. À la limite de durée, les PV cumulés des châteaux encore debout départagent les équipes ; une égalité reste possible.

## Améliorer pendant le combat

**Tourelles :** sélectionne une défense puis **Améliorer**. Seule cette tourelle monte de niveau, jusqu’au niveau 3. Le panneau précise à qui elle appartient et le coût débité sur ton énergie. Son badge suit la caméra. Sa tête mobile s’oriente vers la cible ; le socle reste fixe.

**Troupes :** dans le HUD, touche le petit bouton **↑ / niveau**, séparé du bouton de déploiement. Le panneau compare les statistiques et le coût de recherche. Chaque type peut recevoir trois améliorations pendant la partie, du niveau 1 au niveau 4. Elles concernent tes unités de ce type déjà présentes et tes futurs envois, sans améliorer celles des alliés. Les proportions de PV et de bouclier restantes sont préservées : l’amélioration ne soigne pas gratuitement. Le prix de déploiement ne change pas ; les recherches repartent de zéro au match suivant.

## Commandes et confort

- **Téléphone :** glisse pour déplacer la caméra, pince pour zoomer. Les cartes, la cible et les voies ont des zones de toucher distinctes. Portrait et paysage sont pris en charge.
- **PC :** clique pour sélectionner ou poser, glisse pour déplacer la vue, utilise la molette pour zoomer. Les touches 1–6 sélectionnent les cartes de l’onglet actif ; Échap annule une pose.
- **Mes tourelles :** repère tes défenses, consulte leur liste et centre la caméra sur une tourelle. Sa fiche distingue tes défenses des défenses alliées.
- **Outils :** capacités, zoom, réglages, territoires et accès à la minicarte. **Château** recentre la vue ; la minicarte peut être refermée pour libérer l’écran.
- **Pose :** le nom et le coût restent visibles. **ⓘ** ouvre les statistiques ; **×** annule. Une aide bornée corrige les petits décalages du toucher sans autoriser la construction dans une zone interdite.
- **Réglages :** taille du HUD, volumes et coupure générale sont mémorisés sur l’appareil. Le HUD utilise des panneaux plus sobres et des angles moins arrondis.
- **Rendu :** adaptation des ombres, des effets et des particules à la charge ; absence de flou de profondeur sur mobile, projectiles interpolés et secousses limitées. La simulation conserve les unités et les dégâts lorsque le rendu réduit ses effets.
- **Fronts PvE :** les lignes de préparation peuvent se masquer au lancement ; les marqueurs d’entrée indiquent les arrivées. Le radar permet de centrer la caméra sur un front.

## Comptes, sauvegarde et retour sur un autre appareil

**Connecté au même compte sur la même adresse de jeu, tu retrouves ta progression sur un autre appareil** : niveau, expérience, monnaies, collection, decks équipés et enregistrés, progression et récompenses sont synchronisés automatiquement. Les réglages de son, d’affichage et de taille du HUD restent propres à chaque appareil.

| Situation | Où les données sont conservées |
|---|---|
| Compte connecté et `DATABASE_URL` configurée | Base PostgreSQL, dont Supabase ; sauvegarde indépendante du disque temporaire de l’hébergement |
| Compte connecté sans `DATABASE_URL` | Fichier `accounts.json` du serveur, dans `DATA_DIR` ou `data/` ; accessible aux appareils connectés à ce serveur |
| Invité ou HTML ouvert seul | Navigateur de cet appareil ; pas de synchronisation de compte entre appareils |

La sauvegarde se fait automatiquement après les changements. Le panneau du profil sert à signaler une erreur ou à réessayer lorsque nécessaire. Il n’est pas nécessaire d’exporter un fichier JSON.

À la première connexion d’un compte sans progression, le jeu peut proposer de lui associer la progression locale. Si une autre session a déjà modifié le même compte, le jeu demande de recharger la version du compte plutôt que d’écraser silencieusement des changements. Les comptes de deux serveurs indépendants restent distincts.

Le serveur fait avancer les parties multijoueurs même si l’hôte change d’onglet. Tant que le serveur et la partie fonctionnent, une reconnexion au même compte permet de retrouver sa place et l’état actuel. Quitter volontairement le salon abandonne cette place. Le rendu reprend au retour dans la fenêtre ; une récupération du contexte graphique ne réinitialise pas le combat.

En solo, la simulation suit le temps écoulé et peut le rattraper au retour d’un onglet suspendu. Fermer le HTML ne crée pas de service en arrière-plan. Les salons sans joueur connecté sont nettoyés après dix minutes. Un redémarrage du serveur termine les combats en cours, mais conserve les comptes et la progression dès lors que leur stockage persistant est préservé.

## Héberger et mettre à jour le projet

Pour jouer depuis plusieurs réseaux, déploie **le projet complet** sur un service qui exécute un serveur Node.js durable. Une page statique seule ne fournit pas le serveur multijoueur.

- Installation des dépendances : `npm ci`.
- Démarrage : `npm start`, avec `server.cjs` comme point d’entrée.
- Le port est fourni par `PORT` lorsque l’hébergeur le demande.
- Conserve ensemble `server.cjs`, `simulation.js`, `accounts.cjs`, `account-store.cjs`, `progress.cjs`, `package.json`, `package-lock.json` et le dossier `dist/`.
- Le service doit accepter les connexions HTTP longues des notifications et des parties.
- Pour une sauvegarde PostgreSQL, configure `DATABASE_URL` côté serveur en suivant **INSTALLER_SUPABASE.md**. Cette variable n’a pas à être ajoutée au HTML.
- Sans PostgreSQL, place `DATA_DIR` sur un disque persistant et conserve son contenu lors des mises à jour.

Partage ensuite la même adresse HTTPS à tous les joueurs. Pour mettre à jour le jeu, remplace les fichiers du projet, conserve la configuration de sauvegarde et les données, puis redéploie. Recharge le jeu sur tous les appareils et crée un nouveau salon pour utiliser les mêmes règles et les nouvelles cartes. Les fichiers de validation Google, `sitemap.xml` et `robots.txt` restent dans `dist/`.

## Résoudre un blocage

| Symptôme | Vérification utile |
|---|---|
| Serveur indisponible | Le serveur est démarré et l’adresse ouverte est bien celle qu’il affiche |
| Salon introuvable chez un ami | Même adresse de jeu ; sur Wi-Fi, utilise l’adresse réseau réelle du PC, pas `localhost` |
| Le téléphone ne charge pas la page | Même réseau pour la méthode locale ; vérifier l’adresse et l’accès autorisé par le pare-feu du PC |
| Impossible de lancer | Toutes les places du format choisi sont occupées, connectées et prêtes ; après un changement de carte, chacun doit valider de nouveau |
| Amélioration ou vente indisponible | Une tourelle ennemie ne s’améliore pas ; seul le propriétaire peut vendre ou changer le ciblage |
| Réparation indisponible | Attendre la phase de construction entre deux manches |
| Déploiement refusé | Vérifier énergie, cible adverse, voie et point de départ ; essayer Départ auto |
| Progression absente sur un autre appareil | Même compte et même adresse de serveur ; vérifier que la sauvegarde du premier appareil est terminée |
| Comptes perdus après redéploiement | Vérifier `DATABASE_URL` ou la persistance du dossier `DATA_DIR` |
| Vote de vitesse non appliqué | Tous les joueurs humains doivent accepter avant la fin du délai ; en PvP la vitesse est fixée à ×1 |
| Une troupe ignore une tourelle | C’est la règle du siège : elle combat les troupes adverses et avance vers le château |

## Validation Google Search Console

Pour la propriété **Préfixe de l’URL** `https://bastorynn.onrender.com/`, le ZIP contient le fichier de validation Google d’origine. Après avoir remplacé **tout le projet** sur Render et attendu la fin du déploiement, ouvre `https://bastorynn.onrender.com/googlea6c20ef694929c4d.html` : la page doit afficher `google-site-verification: googlea6c20ef694929c4d.html`. Reviens alors à Search Console et clique **Valider**. Conserve ce fichier dans `dist/` lors des prochaines mises à jour pour que la validation reste active.

La validation prouve que tu contrôles le site ; elle ne garantit pas son apparition immédiate dans Google. Après validation, utilise **Inspection de l’URL** sur la page d’accueil et **Demander une indexation**. Ne publie pas seulement le fichier HTML du jeu : le serveur Node et le fichier Google placé dans `dist/` sont nécessaires.

## Retrouver Bastorynn dans Google

Le sitemap du site est `https://bastorynn.onrender.com/sitemap.xml`. Après avoir déployé **le ZIP multijoueur entier**, vérifie que cette adresse affiche un XML contenant `https://bastorynn.onrender.com/`. Dans Google Search Console, sélectionne la propriété `https://bastorynn.onrender.com/`, ouvre **Sitemaps**, puis saisis `sitemap.xml` dans « Ajouter un sitemap » et clique **Envoyer**. Le fichier `robots.txt` indique également cette adresse aux moteurs de recherche.

La propriété validée ne place pas automatiquement le jeu dans les résultats. Cette version affiche **Bastorynn** dans le titre et l’en-tête et fournit une description du jeu aux moteurs de recherche. Après le déploiement sur la nouvelle adresse `https://bastorynn.onrender.com/`, ouvre cette propriété dans Google Search Console, colle **l’URL de la page d’accueil** dans « Inspection de l’URL », lance le test de l’URL en ligne puis choisis **Demander une indexation**. Consulte ensuite l’état d’indexation dans Search Console. Google peut prendre plusieurs jours ou semaines et ne garantit pas l’affichage ou un rang précis.
