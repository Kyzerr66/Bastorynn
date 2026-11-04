# Bastorynn : comptes et progression persistants

## Sur Render

1. Extraire le ZIP et mettre son contenu dans le dépôt GitHub relié à Render. Conserver le dossier `dist`. Ne pas publier `data`, `node_modules` ou un mot de passe.
2. Garder la même adresse `https://bastorynn.onrender.com/` afin de retrouver les anciennes sauvegardes du navigateur.
3. Dans Render, garder `DATABASE_URL` avec l’URI du **Session pooler**, port **5432**. Remplacer `[YOUR-PASSWORD]` par le mot de passe de la base. Encoder les caractères réservés du mot de passe dans l’URI. Ne jamais partager cette valeur.
4. Build Command : `npm ci`. Start Command : `npm start`. Déployer le dernier commit et attendre l’état Live.
5. Ouvrir `/api/health` sur le site. Le bloc `storage` doit indiquer `type: "postgres"`, `connected: true`, `persistent: true`. Un état Live seul ne prouve pas qu’une progression a été enregistrée.

La table `bastorynn_private.game_accounts` est créée automatiquement. Elle contient comptes, sessions et progressions ; le schéma privé n’est pas exposé par l’API publique Supabase. Ne pas le rendre public. Les utilisateurs du jeu ne sont pas des utilisateurs Supabase Auth : leur authentification reste gérée par le serveur existant.

Si le démarrage échoue, consulter les logs Render. Le serveur s’arrête si DATABASE_URL est définie mais inutilisable : il ne repart pas discrètement sur un fichier temporaire. Vérifier mot de passe, hôte et port. TLS vérifie le certificat ; si nécessaire, fournir le certificat racine officiel de la base dans `DATABASE_CA_CERT`. Ne pas désactiver TLS en production. `DATABASE_TLS=local-test` est exclusivement réservé aux tests locaux.

## Premier passage des anciennes sauvegardes

Depuis le navigateur qui possède la progression, se connecter (ou créer le compte). Si ce compte n’a pas encore de sauvegarde en ligne, le jeu demande s’il faut lui associer la progression de cet appareil. Vérifier le niveau indiqué avant d’accepter. Une sauvegarde en ligne existante est chargée en priorité.

Les comptes de l’ancienne version étaient dans le fichier local du serveur. Un ancien `data/accounts.json` encore disponible peut être copié dans DATA_DIR avant le premier démarrage : il sera importé uniquement si la nouvelle base est vide. Ne jamais mettre ce fichier privé dans GitHub. Si Render a déjà supprimé ce fichier lors d’un déploiement, la nouvelle version ne peut pas recréer les anciens mots de passe ou liens d’amitié. Recréer alors le compte et importer la progression encore présente dans le navigateur. Garder le même pseudo seul ne récupère pas l’ancien compte.

## Test rapide sur deux appareils

1. Se connecter depuis le premier appareil et noter niveau, crédits et quelques cartes du catalogue.
2. Enregistrer un deck nommé « Test sauvegarde ».
3. La sauvegarde est automatique. Attendre quelques secondes après la modification ; le profil affiche « Sauvegarde automatique activée ». Un problème de sauvegarde y apparaît séparément.
4. Ouvrir le même site sur un autre appareil ou dans un navigateur privé. Choisir **Connexion**, avec le même identifiant et mot de passe (ne pas créer un autre compte).
5. Vérifier le niveau, la collection et le deck. Fermer les parties avant de changer d’appareil.
6. Pour tester un déploiement, garder les deux jeux fermés, redéployer, puis se reconnecter et vérifier à nouveau.

Ne pas jouer simultanément sur deux appareils avec le même compte : la seconde écriture d’une ancienne version est refusée pour éviter d’écraser la progression récente. Le profil indique alors « Session modifiée ». Le bouton « Recharger la progression » recharge la progression du serveur sans exporter de fichier. Les copies locales en attente sont conservées ; elles ne remplacent jamais automatiquement une sauvegarde plus récente.

Une coupure réseau affiche « Sauvegarde en attente ». Garder la page ouverte : la sauvegarde reprend automatiquement après reconnexion, avec un bouton Réessayer en cas de besoin. La fermeture immédiate d’un onglet avant l’accusé de sauvegarde ne garantit pas une copie en ligne. Le jeu conserve une copie locale et retente lors de la reconnexion.

## Limites et entretien

- Sans connexion à un compte, la progression reste propre au navigateur.
- Réglages d’affichage/audio et parties en cours ne sont pas synchronisés.
- Les gains restent calculés par le client existant ; cette mise à jour n’est pas un système anti-triche.
- Garder une seule instance du serveur de jeu : les salons actifs restent en mémoire. Les transactions protègent les comptes durant le chevauchement des déploiements.
- Une table de sauvegarde sérialisée convient à une petite bêta. Pour une forte fréquentation, prévoir des lignes par joueur et une validation serveur des récompenses.
- Exporter régulièrement les données de la base. Une base persistante ne remplace pas une sauvegarde indépendante.
- Le profil ne propose aucun export JSON ; les copies de secours locales restent internes au jeu.
- Les comptes existants utilisent identifiant + mot de passe ; aucun e-mail de récupération n’est configuré.

## Validation de cette livraison

Tests automatisés : création/connexion, séparation des comptes, sauvegarde de progression, refus d’une révision obsolète, format invalide, amis, reconnexion après redémarrage. Tests également réalisés avec le moteur PostgreSQL embarqué PGlite, puis dans deux navigateurs Chromium isolés pour vérifier le transfert de progression et la déconnexion. La connexion à votre projet Supabase et le déploiement Render nécessitent la vérification `/api/health` ci-dessus ; aucun secret de production n’est inclus dans le ZIP.
