# Bastorynn — Citadelles V4

La refonte habille le jeu avec une palette ardoise, céramique et citron vert. L'accueil, les accès aux modes, la navigation, l'arsenal, les cartes, les fenêtres et le HUD partagent désormais les mêmes couleurs, espacements et contrôles. Les sauvegardes de decks se replient pour laisser les cartes visibles dès l'ouverture de l'arsenal.

## Modèles réellement intégrés

- 36 familles de défenses, avec trois niveaux visuels. Les raretés conservent leur liseré distinct.
- 87 modèles de base d'unités, utilisés par l'ensemble des variantes du catalogue. Les pivots et animations de déplacement restent compatibles avec le moteur.
- 10 variantes de végétation ; nouveaux donjon, maisons, rochers et plateformes. Les maisons et la végétation utilisent le rendu instancié. Le relief, les routes et les ouvertures des remparts restent procéduraux pour correspondre à chaque carte.
- Source éditable : `conception-3d/Bastorynn-Citadelles.blend`, avec bibliothèque organisée et scène Studio.

Les modèles existants ont été importés dans Blender, simplifiés et retravaillés avec de nouveaux matériaux et socles. Il s'agit d'une refonte de cette bibliothèque, pas d'une collection entièrement sculptée de zéro. Les équipements de spécialisation restent ajoutés par le moteur.

Le lot exporté passe de 1 002 392 à 411 828 triangles, nouveaux décors inclus : environ 59 % de moins. L'archive chargée par le jeu pèse 2,57 Mo en JavaScript. Ce gain de géométrie n'est pas une promesse de FPS sur tous les appareils. La foreuse conserve son maillage, car le modificateur de simplification de Blender bloque sur ce modèle.

## Base de code et intégration de Claude

L'archive `Bastorynn-refonte.zip` a été examinée. Ses principes de séparation des modèles et d'habillage détaillé ont servi de référence. La base publiée reste la V3.2 corrigée : ses règles partagées, sauvegardes, protections serveur et optimisations sont conservées. L'extension expérimentale de 14 familles et 12 unités de l'archive n'a pas été fusionnée dans cette refonte visuelle, car elle demanderait une nouvelle passe d'équilibrage et de synchronisation serveur. Aucun texte de l'archive n'a été considéré comme une instruction de publication.

Les limites de Courroux (10–40 m), les angles morts des défenses longues portées, l'anti-double-impact, la corrosion bornée et les différences PvE/PvP restent inchangés et testés.

## Design et validation

[Maquettes Figma éditables](https://www.figma.com/design/sOMbAInE8ss4scp8J74sgQ) : accueil desktop, arsenal et accueil mobile. Le quota Starter a empêché l'ajout final de l'image Blender dans la maquette ; le rendu est livré dans `verification/screenshots/v4-blender-studio.png`.

- 58 tests automatisés réussis : combat, réseau local, catalogues, assets et sécurité serveur.
- Parcours Chrome en 1440×900, 390×844 et 844×390 : accueil, initiation, placement, spécialisation, combat, arsenal et menus.
- Chargement HTTP et ouverture locale hors ligne vérifiés ; audio toujours différé jusqu'à l'interaction, aucune violation CSP détectée.
- Stress de rendu avec 200 et 600 unités : aucun plantage, qualité adaptée à la charge. Mesures dans `verification/stress-browser-v4.json`, avec simulation suspendue et navigateur de test ; elles ne mesurent pas les FPS d'un appareil physique.

L'hébergement public et les performances sur téléphones physiques ne sont pas vérifiés par cette livraison.

## Relancer ou modifier

`npm install`, `npm run build`, puis `npm start`. Le serveur sert le jeu dans `dist/`. Pour le solo hors ligne, ouvrir `index.html` dans un navigateur récent qui prend en charge `DecompressionStream`.

La feuille `src/citadelles.css` contient l'habillage, `src/tactical-ui.js` l'accueil et les raccourcis, et `src/blender-models.js` le décodage et l'adaptation des modèles au moteur. La route HTTP n'autorise que les assets explicitement listés.

Pour régénérer les modèles :

```sh
blender --background --factory-startup --threads 4 --python conception-3d/refonte_blender.py
blender --background conception-3d/Bastorynn-Citadelles.blend --threads 4 --python conception-3d/prepare_showcase.py
npm run build
npm test
```

`conception-3d/source-meshes.json.gz` contient les maillages de départ, afin que cette chaîne reste reproductible sans accès au poste d'origine. Les scripts écrivent uniquement le projet Blender et ses assets dérivés. Les captures et mesures de validation sont réunies dans `verification/`.
