# OWNED — Jouer à plusieurs

## Démarrer avec des amis

**Utilise le nouveau ZIP multijoueur.** Le fichier HTML seul permet de jouer en solo ou contre l’IA. Déposer uniquement ce HTML sur Netlify ne lance pas le serveur nécessaire aux comptes, aux amis et aux parties entre appareils.

1. Extrais entièrement `OWNED_Frontieres_3D_Multijoueur.zip` sur un PC.
2. Installe Node.js 20 ou plus récent si nécessaire. Sous Windows, double-clique sur **OUVRIR_MULTIJOUER.bat**. Sur macOS/Linux, lance `node server.cjs` dans le dossier extrait.
3. Garde la fenêtre du serveur ouverte. Le jeu fonctionne sur le PC à `http://localhost:8787`.
4. Pour jouer sur le même Wi-Fi, **tous les joueurs ouvrent l’adresse réseau affichée par le serveur**, par exemple `http://192.168.1.25:8787`. Utilise l’adresse réellement affichée chez toi. Un lien contenant `localhost` ne fonctionne pas pour tes amis.
5. Dans **Combat → Amis & salons**, chaque joueur crée son compte, puis se connecte. Coche **Rester connecté sur cet appareil** pour retrouver ta session.
6. Ajoute l’identifiant ou le code ami de ton ami. Il accepte ta demande dans le même panneau.
7. Avant de créer le salon, prépare tes cartes : **Arsenal** pour les défenses, les unités et les decks enregistrés.
8. Crée un salon et choisis le mode et la carte. Dans **Inviter des amis**, clique **Inviter** à côté d’un ami. Il reçoit une invitation directement dans le jeu et clique **Rejoindre**. Vous pouvez aussi partager le code à six caractères.
9. Chaque joueur clique **Je suis prêt**, puis l’hôte lance la partie.

Les invitations concernent les salons qui n’ont pas encore commencé. Elles expirent après dix minutes. Si tu joues déjà, utilise « Quitter et rejoindre » pour accepter explicitement une invitation vers un autre salon.

| Mode | Joueurs humains | Châteaux | Organisation |
|---|---:|---:|---|
| Coopération | 2 à 4 | 1 partagé | Chacun possède son énergie et ses tourelles ; les zones sont partagées |
| 1 contre 1 | 2 | 2 | Un château par joueur |
| 2 contre 2 | 4 | 4 | Places 1–2 contre places 3–4, chacun garde son château |
| Chacun pour soi | 4 | 4 | Tous adversaires |

Pour jouer avec des IA identifiées ou en coopération seul, utilise **Escarmouche → Jouer avec les IA**.

## Enregistrer et choisir un deck

1. Dans **Arsenal**, équipe jusqu’à **6 défenses et 6 unités différentes** parmi tes cartes obtenues.
2. En haut, dans **Mes decks**, saisis un nom puis clique **Enregistrer l’équipement actuel**. Tu peux conserver jusqu’à **12 decks**. Réutiliser le même nom remplace ce deck.
3. Choisis un deck enregistré puis **Utiliser ce deck**. Le nom du deck actif s’affiche et le choix reste mémorisé après rechargement sur cet appareil.
4. Lance une partie : les défenses choisies sont utilisées en solo, campagne coopérative et escarmouche ; en PvP, les six unités choisies sont également utilisées.
5. Dans un salon en préparation, **Changer de deck** ouvre l’Arsenal. Reviens par **Amis**, puis déclare-toi prêt : ton nouvel équipement est envoyé au salon.

Chaque joueur utilise son propre équipement, même en coopération. Une partie déjà lancée conserve ses cartes ; charger un autre deck prépare la partie suivante. Les cartes peuvent être modifiées après chargement : l’Arsenal signale alors « Sélection modifiée ». Enregistre à nouveau pour mettre à jour le deck nommé. Les decks restent sur cet appareil et cette adresse de jeu.

## Faire la campagne à plusieurs

1. Ouvre **Combat → Campagne avec des amis**. Choisis une mission débloquée et sa difficulté, puis **Créer le salon de campagne**.
2. Invite tes amis depuis le salon ou partage son code. Vous devez être **2 à 4 joueurs**, connectés au même serveur.
3. Chacun prépare son deck et clique **Je suis prêt** ; l’hôte lance la mission.
4. Défendez la même citadelle : chacun garde son énergie et ses défenses. Les territoires sont communs et la difficulté s’adapte au nombre de participants.
5. À la fin, les victoires et étoiles sont enregistrées sur les comptes des participants. Les récompenses de collection restent dans le navigateur de chacun.
6. Choisis **Continuer avec le groupe**. L’hôte prépare la mission suivante après une victoire, ou la même après une défaite, dans le même salon. La difficulté de cette nouvelle préparation revient à Normal et chacun doit se déclarer prêt à nouveau. Après la dernière mission, le groupe peut la rejouer.

Si un coffre occupe l’écran de résultat, ouvre-le puis retrouve le salon depuis **Combat → Campagne avec des amis**. Les parties en cours ne sont pas sauvegardées lors d’un redémarrage du serveur ; seule la progression de campagne terminée est conservée.

## Difficulté adaptée en coopération

La difficulté choisie (Normal, Difficile, Cauchemar ou Apocalypse) reste la base. Le jeu ajoute cet ajustement selon le nombre de joueurs présents au lancement, humains et IA compris :

| Joueurs | Effectifs ennemis | PV et boucliers ordinaires | PV et boucliers des boss |
|---:|---:|---:|---:|
| 1 | ×1 | ×1 | ×1 |
| 2 | ×1,5 | ×1,2 | ×1,8 |
| 3 | ×2 | ×1,4 | ×2,6 |
| 4 | ×2,5 | ×1,6 | ×3,4 |

Le nombre de boss reste identique. Les arrivées sont légèrement étalées pour garder les vagues lisibles. Ces paramètres sont affichés dans la préparation et le salon. Une déconnexion temporaire ou un changement d’onglet ne les modifie pas. L’énergie reste individuelle.

## Le siège PvP, étape par étape

1. Équipe **jusqu’à six défenses et six troupes différentes**. Les deux sélections sont indépendantes. Un exemplaire suffit pour utiliser une troupe plusieurs fois ; sa carte n’est pas consommée.
2. Chaque joueur commence avec **100 PV de château**, **300 énergie personnelle** et trois zones disponibles près de sa base. Tu disposes de vingt secondes pour préparer les défenses.
3. Choisis une défense dans le HUD puis un sol autorisé. Les voies de passage, l’eau, les bâtiments, les autres tourelles et les abords des châteaux restent interdits. Les autres zones s’achètent via **Territoires**.
4. Passe à l’onglet **Troupes** du HUD et sélectionne un château adverse dans **Cible**. Sur téléphone, les champs **Cible** et **Via** se trouvent dans **Outils**, en haut à droite.
5. Pour une troupe **Route**, touche sa carte : choisis d’abord « Via » pour la faire passer par un avant-poste, puis elle part de ton château jusqu’à la cible.
6. Pour une troupe **Hors-piste**, **Aérienne** ou **Amphibie**, touche sa carte puis place son départ entre **2,4 et 12 mètres de ton château**. Les aériennes volent en ligne droite. Les véhicules calculent un trajet praticable court à travers le terrain et les ponts, en évitant les bâtiments et l’eau. Les amphibies peuvent également traverser l’eau. Si aucun trajet n’existe, choisis un autre départ : aucune énergie n’est dépensée.
7. Les troupes tirent sur les troupes adverses à portée. Certaines touchent aussi les aériennes. Les alliées ne se blessent pas. **Les troupes ne ciblent, ne détruisent et ne neutralisent jamais les tourelles en PvP. Les tourelles peuvent tirer sur les troupes.**
8. Une troupe qui atteint le château adverse inflige ses dégâts au château puis disparaît. Le coût, les PV, les dégâts par tir, l’intervalle de tir, la portée et les dégâts au château sont indiqués dans la collection.

Les déploiements n’ont **ni recharge ni plafond de troupes** : seule ton énergie limite les envois. Le revenu de base est de **8 énergie/seconde**, plus **1,5 par zone achetée** et les forges. Toutes les zones peuvent être achetées directement en PvP, sans influence ni zone voisine, pour 120 à 200 énergie.

**3 bases en duel, 5 à quatre joueurs.** Les troupes terrestres s’arrêtent dans leur cercle pour capturer. L’infanterie et les éclaireurs capturent plus vite ; la puissance cumulée est plafonnée pour éviter une prise instantanée. La présence adverse conteste la capture. Pour reprendre une base, neutralise-la puis capture-la. Une base non contestée rapporte **2 énergie/s à partager entre les joueurs de son alliance**. Les aéronefs ne capturent pas. Les petites forteresses ont des drapeaux et des indicateurs de progression.

**Rôles et contre-jeu.** Infanterie pour capturer, éclaireurs rapides mais fragiles, blindés résistants, artillerie contre groupes et blindages, anti-air contre aéronefs, médecins au soin limité, Cryo pour ralentir et briser les boucliers, porte-boucliers en première ligne. La rareté ne donne aucun multiplicateur de puissance en PvP. Les coûts payent les capacités et la mobilité.

La dernière alliance avec un château debout gagne. Une partie dure au maximum quinze minutes : les PV cumulés des châteaux encore debout départagent alors les alliances. Une égalité reste possible. Les niveaux des défenses sont égalisés en PvP ; les statistiques des troupes sont adaptées au siège, distinctes de celles des ennemis de campagne. Les effets de création automatique d’unités et les attaques spéciales contre les défenses ne s’appliquent pas en PvP.

## Améliorer pendant une partie

**Défenses :** clique une tourelle posée puis **Améliorer**. Seule cette tourelle progresse, jusqu’au niveau 3. Son badge centré affiche Niv. 1, Niv. 2 ou Niv. 3 et suit la caméra ; le modèle reste visible après chaque amélioration.

**Troupes en PvP :** dans l’onglet Troupes du HUD, touche le bouton **↑ / niveau** associé à une carte. Le panneau compare les statistiques actuelles et suivantes et affiche le coût en énergie personnelle. Le clic principal sur la carte continue à envoyer une troupe.

Chaque type peut recevoir **trois améliorations**, du niveau 1 au niveau 4. Elles s’appliquent à tes unités de ce type déjà présentes et à tes futurs déploiements pour le reste de cette partie. Les autres types, les unités alliées et les défenses ne sont pas affectés. Les PV et boucliers gardent leur proportion restante : améliorer ne soigne pas gratuitement. Le prix de déploiement reste identique. Une nouvelle partie remet les recherches à zéro.

Les bases capturées rapportent +2 énergie/s à leur alliance, partagées entre ses joueurs encore en jeu. Le HUD indique ta part personnelle ; une base contestée ne produit plus tant que l’affrontement dure.

## Obtenir les troupes

La collection comporte **160 troupes, comme les 160 défenses** : les 87 modèles du PvE et 73 variantes spécialistes avec équipements 3D distincts. Six cartes de départ sont offertes : Fantassin, Éclaireur à moto, Jeep armée, Char léger, Hélicoptère d’attaque et Médecin.

Chaque ouverture de pack ajoute **une troupe bonus**, en plus des défenses prévues par ce pack. Toutes les troupes peuvent être obtenues, avec des raretés et des probabilités différentes. Les cartes restent cachées jusqu’à l’ouverture du sceau puis leur révélation. Les doublons de troupes sont conservés comme exemplaires supplémentaires ; ils n’augmentent pas les statistiques de siège.

Dans **Troupes · collection**, retire une carte équipée pour libérer un emplacement, puis équipe une autre carte obtenue. La sélection est enregistrée sur cet appareil. Prépare-la avant de créer ou rejoindre un salon.

## Changer d’onglet et reprendre une partie

**Le serveur fait avancer les parties multijoueurs.** L’hôte n’a plus besoin de garder l’onglet visible. Tant que le serveur fonctionne, les ennemis et les autres joueurs continuent. Une reconnexion à ton compte permet de reprendre ta place et de recevoir l’état actuel de la partie. Quitter volontairement le salon abandonne cette place.

Le jeu solo suit le temps écoulé quand l’onglet est masqué. Un téléphone ou un navigateur peut toutefois suspendre complètement une page : au retour, le jeu rattrape le temps écoulé. Fermer le fichier HTML ne lance pas un serveur en arrière-plan.

Les salons sans aucun joueur connecté sont nettoyés après dix minutes. L’arrêt ou le redémarrage du serveur termine les parties en cours ; les comptes et amis restent conservés si leurs fichiers sont préservés.

## Comptes et sauvegarde

- Le compte conserve ton identifiant, ton pseudo, tes amis et les invitations sur **ce serveur**. La session mémorisée dure jusqu’à trente jours ; tu peux te déconnecter depuis le panneau des amis après avoir quitté ton salon.
- Les comptes de deux serveurs indépendants sont distincts. Tous les amis doivent utiliser la même adresse.
- Les victoires, étoiles et difficultés débloquées en campagne coopérative sont conservées sur le compte de chaque participant. La progression solo, la collection, les crédits, les decks et les réglages restent dans le navigateur de chaque appareil ; ils ne sont pas synchronisés entre appareils.
- Le serveur conserve ses comptes dans `data/accounts.json`, ou dans le dossier indiqué par `DATA_DIR`. Sauvegarde ce dossier lorsque tu mets le jeu à jour. Ne le publie pas dans un dépôt de code.
- Les mots de passe sont enregistrés sous forme de dérivés salés, pas en clair. Ce serveur ne propose pas de récupération par e-mail : conserve tes identifiants.

## Jouer à distance

Pour des amis sur des réseaux différents, héberge **le projet complet** sur un service capable d’exécuter un serveur Node.js durable. Une page statique seule ne suffit pas.

Le point d’entrée est `server.cjs`, la commande de démarrage est `npm start` et le port peut être fourni par la variable `PORT`. Conserve `accounts.cjs`, `simulation.js` et `dist/index.html` à leurs emplacements. Le service doit accepter les connexions HTTP longues utilisées par les notifications et les parties.

Pour conserver les comptes après un redéploiement, utilise un **disque persistant** et définis `DATA_DIR` vers son dossier. Utilise l’adresse HTTPS du service pour les connexions à distance. Partage ensuite cette même adresse à tous tes amis. Aucun hébergement public n’est créé automatiquement avec ces fichiers.

## Confort et commandes

- **⚙ Réglages** : taille du HUD de 80 à 120 %, volume des effets et du jeu, volume de la musique, coupure générale. Ces réglages sont mémorisés sur cet appareil. Le HUD limite son agrandissement si nécessaire pour tenir dans l’écran.
- **Téléphone** : portrait et paysage sont pris en charge ; glisse pour déplacer la caméra, pince pour zoomer. Le haut tient sur une ligne avec ton avatar ; les six cartes restent accessibles dans le petit bandeau du bas. Touche l’avatar pour retrouver ton profil et tes amis.
- **Outils** (en haut à droite) : ouvre le volet des capacités, du zoom, des réglages et des **Territoires**. En PvP, il contient aussi **Cible** et **Via**. La partie continue pendant que ce volet est ouvert.
- **Carte à la demande** : dans Outils, touche **Carte** pour afficher la minicarte, puis **Fermer la carte** pour libérer le terrain. **Château** recentre la vue. Le radar démarre sur une seule ligne ; son **+** affiche les détails des fronts.
- **Pose d’une défense** : la fiche résumée affiche son nom et son coût. Touche **ⓘ** pour voir ses statistiques, ou **×** pour annuler la pose. Les noms des territoires et des vigies sont masqués sur le petit écran ; les zones restent accessibles par **Outils → Territoires**.
- **Rendu mobile** : le profil graphique se choisit automatiquement, sans effet de flou de profondeur ni halo lumineux. Il réduit d’abord les ombres et les effets avant de diminuer légèrement la résolution. Sur téléphone, le rendu WebGL vise jusqu’à 2 pixels par pixel CSS avec un plancher de netteté à 1,25 ; le rendu de secours conserve aussi une définition supérieure. La fluidité dépend du téléphone et de la taille des combats ; 60 FPS ne sont pas garantis.
- **PC** : clique pour poser, glisse pour déplacer la caméra, utilise la molette pour zoomer. Les touches 1–6 sélectionnent les cartes de l’onglet actif ; Échap annule une pose.
- **PvE** : les trajets de préparation disparaissent au lancement de la vague. Les marqueurs d’entrée restent visibles pour indiquer d’où viennent les ennemis.
- **Neige** : routes brunes, unités plus sombres et luminosité réduite pour distinguer les éléments.

## Si quelque chose ne fonctionne pas

| Symptôme | À vérifier |
|---|---|
| « Serveur indisponible » | Le lanceur est-il ouvert et l’adresse est-elle celle du serveur ? |
| Ton ami ne trouve pas le salon | Même adresse et même réseau pour la méthode Wi-Fi ; ne partage pas `localhost` |
| Le téléphone ne charge pas le jeu | Réseau Wi-Fi invité isolé, pare-feu du PC ou mauvaise adresse réseau |
| Impossible de lancer | Toutes les places nécessaires sont remplies, connectées et marquées prêtes |
| Le bouton Inviter est grisé | Crée un salon qui n’a pas encore démarré |
| Déploiement refusé | Énergie personnelle, cible ennemie, route et point de départ autorisé |
| Les comptes disparaissent après un redéploiement | Le dossier `DATA_DIR` doit être sur un stockage persistant |
| Une troupe ne tire pas sur une tourelle | C’est la règle du PvP : seules les troupes adverses sont ciblées |


## Fluidité et invitations répétées

Le rendu adapte automatiquement la résolution, les ombres et les effets pour viser 60 FPS. La simulation conserve toutes les troupes et tous les dégâts ; les recherches de cibles et les trajets utilisent des caches et des voisinages spatiaux. Les mises à jour réseau sont regroupées et interpolées. Ce réglage ne garantit pas 60 FPS sur tous les appareils, notamment dans le mode de rendu logiciel.

Les nouvelles invitations pointent vers le nouveau salon. Les invitations expirées ou liées à une partie lancée/terminée sont retirées. Si tu joues déjà, « Quitter et rejoindre » permet de changer explicitement de salon. La liste d’amis permet la recherche et le filtre En ligne.

## Catalogue partagé dans l’Arsenal

L’Arsenal rassemble 160 défenses et 160 unités. Choisis Tout, Défenses ou Unités, puis Mes cartes ou Catalogue complet. Le filtre de rareté propose Commune, Rare, Épique, Légendaire et Mythique. La recherche et le filtre de famille des défenses se combinent avec ces choix. Les cartes apparaissent par lots de 24 avec Afficher davantage. Touche une unité pour consulter son rôle et ses statistiques, puis l’équiper ou la retirer : 6 défenses et 6 unités maximum, au moins une unité équipée. Les unités non obtenues restent consultables dans le catalogue.


## Équité des cartes PvP et présentation des unités

Les parties PvP utilisent désormais une implantation symétrique sur les 16 cartes. En duel, les deux châteaux sont opposés et les trois bases à capturer sont à égale distance de chaque camp. À quatre joueurs, les quatre châteaux et les cinq bases forment une disposition symétrique : chaque position dispose des mêmes distances vers les objectifs. Relief, collines, zones de départ et prix des territoires suivent cette symétrie. Les routes contournent les bâtiments des bases pour laisser passer les troupes.

Ces cartes s’appliquent aux nouvelles parties. Après avoir remplacé le projet sur ton hébergement, recharge le jeu sur tous les appareils et crée un nouveau salon pour que tout le monde utilise la même version.

Les cartes d’unités utilisent la même présentation que les défenses dans le catalogue et le deck : cadre et fond de rareté, cinq losanges, coût en énergie, nom, rôle et statistiques. Les unités non obtenues affichent le même état verrouillé que les défenses. Les visuels des unités sont recadrés pour limiter les modèles coupés.

## Projectiles et niveaux des défenses

Les obus de mortier et missiles s’animent entre les mises à jour de simulation et du réseau. Leur trajectoire visuelle est indépendante de la fréquence des messages ; les dégâts restent calculés par le serveur. Les missiles rapides détectent aussi une cible traversée entre deux positions, et les salves respectent leur décalage de départ. Une interruption réseau prolongée cesse l’extrapolation pour éviter des projectiles fantômes.

Les niveaux des défenses utilisent les chiffres 1 à 3, sont centrés sous les tourelles et se mettent à jour après le déplacement de la caméra. Les badges qui se chevauchent sont masqués pour préserver la lisibilité.
