# Correctif de chargement 4.0.1

La page initiale passe à environ 447 Ko grâce au chargement externe du moteur 3D. Le moteur du jeu utilise un seul fichier JavaScript plutôt que des fragments réunis et réévalués à chaque démarrage.

Le serveur ouvre le port HTTP sans attendre la base de sauvegarde. Le contrôle de disponibilité répond indépendamment des transactions de compte. Les appels aux comptes renvoient un état indisponible explicite pendant l’initialisation ; aucun compte ni sauvegarde PostgreSQL n’est remplacé par un stockage local.

Le navigateur limite l’attente des modèles à huit secondes et utilise les modèles intégrés si nécessaire. Une ressource essentielle indisponible affiche un bouton Réessayer. L’attente de la sauvegarde initiale est limitée à six secondes ; en cas de panne réseau ou serveur, le solo reste accessible et une copie distincte de la progression est conservée sous owned-offline-progress-v1. Cette copie n’est pas fusionnée automatiquement dans une sauvegarde de compte.

Validation : 58 tests automatisés, parcours Chrome ordinateur/mobile/paysage et hors ligne, puis simulation de base indisponible, archive 3D absente, téléchargement 3D bloqué et moteur absent. Voir verification/loading-failures.json et verification/loading-tests.txt.

Le site public ne répondait pas lors du diagnostic (aucun octet reçu en 25 secondes). Les tests locaux reproduisent les blocages internes et valident leurs corrections ; l’état et la configuration de l’hébergement Render doivent être vérifiés après déploiement.
