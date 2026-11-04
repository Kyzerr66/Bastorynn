# Corrections de sécurité et de stabilité

## Ce qui change

- **Gel des comptes :** le corps des requêtes est lu avant la transaction, avec un délai de 30 s. Un envoi interrompu ne bloque plus les autres joueurs.
- **Limites de tentatives :** elles utilisent l'adresse réelle du joueur. La mémoire utilisée est bornée et purgée, et le pseudo est validé avant d'être stocké.
- **Decks :** chaque carte doit être une carte de départ ou figurer dans la sauvegarde en ligne du joueur. Sinon le serveur répond 409 avec un message invitant à réessayer.
- **En-têtes :** CSP, `X-Frame-Options`, `Referrer-Policy` sur toutes les réponses, et HSTS en HTTPS.
- **Zoom :** `maximum-scale=1` est retiré des menus. Le combat garde `touch-action:none`.
- **Champ identifiant :** son motif était rejeté par les navigateurs récents, donc la vérification était ignorée. Il est corrigé dans `engine-part-13.js`.
- **Partie terminée :** le serveur arrête de la simuler et de l'envoyer. Un joueur qui se reconnecte reçoit l'état final.
- **Énergie en PvP :** chaque joueur ne reçoit que celle de son équipe.
- **Campagne :** si l'hôte a quitté, le joueur restant devient hôte à la fin de la mission et peut lancer la suivante.
- **Salons inactifs :** un salon d'attente se ferme après 30 min sans action, même avec un onglet ouvert. Une partie terminée se ferme 10 min après la dernière action.
- **Départ pendant la préparation :** le joueur qui quitte n'est plus remis en jeu au début du siège. Son adversaire gagne à la fin des 20 s de préparation au lieu de rester bloqué. Le correctif est dans `simulation.js` et `engine-part-14.js`.
- **Tests :** `npm test` lance `test/server-guards.test.cjs`.

## Ce qui a été testé en local

Serveur réel avec stockage local : comptes, decks, limites, commandes invalides, redémarrage, et duel complet lancé depuis l'interface. **PostgreSQL, Render et les téléphones réels n'ont pas été testés.**

## Adresse IP du joueur

| Situation | Adresse utilisée |
|---|---|
| Render (variable `RENDER` présente) | En-tête `CF-Connecting-IP` |
| `TRUSTED_IP_HEADER` définie | L'en-tête indiqué, prioritaire sur le cas Render |
| Réseau local ou autre | Adresse du socket |

Ne définis `TRUSTED_IP_HEADER` que si ton proxy remplace toujours cet en-tête. Sinon un joueur peut le forger et contourner les limites.

## À vérifier après déploiement

1. `/api/health` indique toujours `connected: true`.
2. Connexion, sauvegarde, création de salon et partie à deux fonctionnent.
3. Un deck avec une carte tout juste gagnée est accepté après quelques secondes.
4. Avec une connexion, 18 mauvais mots de passe sur un compte de test bloquent ce réseau. Depuis un autre réseau (4G), le bon mot de passe fonctionne encore.

## Limites restantes

- `verification/validation.json` décrit encore la version 2.2.0 d'origine : son `simulation_sha256` ne correspond plus au `simulation.js` modifié.
- Le masquage de l'énergie entre alliés et adversaires en 2 contre 2 n'est testé qu'au niveau du module, pas dans une vraie partie à quatre.

- La progression reste envoyée par le client : un joueur peut la falsifier pour y ajouter des cartes, et donc passer la vérification des decks.
- Tous les comptes restent dans une seule ligne JSON, et le calcul scrypt de connexion se fait encore pendant la transaction.
