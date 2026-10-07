# Calculateur d'empreinte environnementale de l'IA en entreprise

Outil gratuit de [Mind W3B](https://www.mindw3b.co/) pour estimer l'énergie, le carbone et l'eau consommés par les usages d'IA générative d'une entreprise.

En ligne : https://calculateur.mindw3b.co/

![Aperçu](assets/img/og-image.png)

## Deux versions

- **Version simple** (`/`, page d'accueil) : pensée pour les dirigeants. Trois questions obligatoires (nombre d'utilisateurs, outils, fréquence) et six facultatives pour resserrer la fourchette. Elle donne les émissions annuelles, une fourchette, un niveau de précision et le gain possible en optimisant les usages. Un lien ouvre le mode expert prérempli avec les réponses.
- **Mode expert** (`/expert`) : le calculateur détaillé, usage par usage, décrit ci-dessous.

Pour un même usage, les deux versions donnent des ordres de grandeur proches mais pas identiques : la version simple applique un PUE par outil, un forfait fabrication de +2 % et 3,5 L d'eau par kWh, là où le mode expert détaille chaque poste par hébergeur et par région.

## Ce que fait le mode expert

- Décrire plusieurs usages (assistant interne, support client, assistant de code…) avec leur modèle, leur hébergement, leur région et leurs volumes de tokens.
- Obtenir l'électricité, les émissions de gaz à effet de serre et l'eau consommée, par mois ou par an, avec une fourchette basse, centrale et haute.
- Voir d'où viennent les émissions : calcul GPU, serveur et veille, refroidissement, fabrication du matériel, entraînement amorti.
- Simuler des leviers d'optimisation : réduction des tokens d'entrée et de sortie, routage vers un modèle léger.
## Synthèse et demande d'audit

Le bloc résultat des deux versions propose deux actions :

- **Faire auditer nos usages** : formulaire (nom, entreprise, email, téléphone et message facultatifs, consentement). Mind W3B reçoit la demande par email, avec la synthèse du calcul en pièce jointe (`synthese-calcul.txt`) ; « Répondre » écrit directement au visiteur.
- **Recevoir la synthèse** : le visiteur saisit son email et reçoit sa synthèse dans un email aux couleurs de Mind W3B. Mind W3B reçoit une notification à chaque envoi, qui indique si le visiteur a coché la case des actualités (le sujet commence alors par `[Actualités : oui]`). Le texte reste copiable après l'envoi.

Les saisies restent dans le navigateur de l'utilisateur (localStorage) tant qu'il n'envoie pas l'un de ces formulaires. Les fonctions d'envoi recalculent la synthèse à partir des réponses, avec le même moteur que les pages : aucun texte venant du navigateur n'est recopié tel quel dans les emails. Elles ne stockent rien : les données ne vivent que dans les emails.

Protections contre les abus : champ piège invisible, délai minimum avant envoi, vérification de l'origine de la requête, limite de 5 envois par IP toutes les 10 minutes et de 3 synthèses par adresse email par heure (compteurs en mémoire, approximatifs sur Vercel).

## Méthode

Le détail est publié en bas de la page. En résumé :

1. Un token coûte environ 2 opérations par paramètre actif du modèle.
2. Ce calcul est converti en temps de GPU (référence NVIDIA H100) selon un taux d'utilisation réaliste, différent pour la lecture des tokens d'entrée et la génération des tokens de sortie.
3. On ajoute le serveur hors GPU, les machines en veille, puis le refroidissement et le bâtiment (PUE).
4. L'électricité est convertie en carbone (intensité du réseau de la région) et en eau (eau sur site et eau de production électrique).
5. La fabrication du matériel est amortie au temps de GPU, l'entraînement est ajouté sous forme de forfait.

La taille des modèles fermés n'est pas publiée par leurs éditeurs : ils sont regroupés en classes avec une fourchette de paramètres actifs, ce qui explique l'écart entre les estimations basse et haute.

Le périmètre s'inspire des travaux publics d'Impact'IA (SNCF, Resilio, Wavestone) et d'EcoLogits. Les formules, paramètres et données de cet outil ont été établis séparément à partir de sources primaires citées dans la page.

## Structure

```
.
├── index.html               Version simple (page d'accueil)
├── expert.html              Mode expert, servi en /expert
├── confidentialite.html     Politique de confidentialité, servie en /confidentialite
├── api/
│   ├── synthese.js          POST /api/synthese : synthèse au visiteur, notification à Mind W3B
│   ├── audit.js             POST /api/audit : demande d'audit à Mind W3B
│   └── _lib/                Outils communs et gabarits des emails (non exposés)
├── assets/
│   ├── css/simple.css       Styles de la version simple et de la politique de confidentialité
│   ├── css/style.css        Styles du mode expert (thèmes clair et sombre)
│   ├── css/contact.css      Fenêtres « Faire auditer nos usages » et « Recevoir la synthèse »
│   ├── js/moteur.js         Référentiels et formules, partagés par les deux pages et par api/
│   ├── js/synthese.js       Texte de la synthèse, partagé par les deux pages et par api/
│   ├── js/simple.js         Interface de la version simple
│   ├── js/calculateur.js    Interface du mode expert
│   ├── js/contact.js        Formulaires de synthèse et d'audit
│   └── img/                 Logo, favicon, image de partage
├── vercel.json              Configuration d'hébergement
└── CHANGELOG.md             Historique des versions
```

Site statique, sans dépendance ni étape de build, plus deux fonctions Vercel (Node 18 ou plus récent) qui appellent l'API de Resend. Seules les polices Sora et Manrope sont chargées depuis Google Fonts.

## Lancer en local

Servir le dossier (les chemins sont absolus, et `/expert` repose sur `cleanUrls`) :

```bash
npx serve .
```

Puis ouvrir http://localhost:3000/ et http://localhost:3000/expert.

`npx serve` ne fait pas tourner les fonctions de `api/` : pour tester les envois, utiliser `npx vercel dev` avec les variables d'environnement ci-dessous.

La CSP (`script-src 'self'`) interdit tout script inline et tout attribut `onclick` : les interactions passent uniquement par `addEventListener`.

## Mettre à jour les hypothèses

Tous les référentiels sont dans `assets/js/moteur.js` :

- `MODELS` : modèles et paramètres actifs (bas, central, haut) ;
- `OPS` : hébergeurs, PUE et WUE ;
- `GRIDS` : intensité carbone par région (kg CO₂e/kWh) ;
- `SC` : hypothèses des scénarios bas, central et haut ;
- `HYP_DEF` : hypothèses techniques modifiables dans la page ;
- `OUTILS`, `EXTRAS`, `FREQ`, `REFLEXION` : hypothèses de la version simple (PUE et réseau par outil, volumes des usages complémentaires).

Après une modification de méthode, pensez à mettre à jour le tableau de la section « Méthode » dans `expert.html`, le numéro de version et le `CHANGELOG.md`.

## Déploiement

Le dépôt est relié à Vercel : chaque push sur `main` redéploie le site.

### Envoi des emails (Resend)

1. Dans Resend, ajouter un domaine d'envoi (de préférence un sous-domaine, par exemple `send.mindw3b.co`), puis créer chez l'hébergeur DNS les enregistrements indiqués (SPF, DKIM, MX). Attendre que le domaine soit vérifié. Une règle DMARC sur `mindw3b.co` est recommandée.
2. Créer une clé API avec l'accès « Sending access », limitée à ce domaine.
3. Dans Vercel (Settings → Environment Variables, pour Production et Preview) :

| Variable | Exemple | Rôle |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_…` | Clé API Resend (obligatoire) |
| `MAIL_FROM` | `Mind W3B <calculateur@send.mindw3b.co>` | Expéditeur, sur le domaine vérifié |
| `MAIL_TO` | `nolan.nabeth@mindw3b.co` | Destinataire des demandes et notifications (valeur par défaut) |
| `SITE_URL` | `https://calculateur.mindw3b.co` | Adresse du site, pour le logo et les liens des emails (valeur par défaut) |

4. Redéployer pour que les variables soient prises en compte.

Sans `RESEND_API_KEY`, les formulaires affichent une erreur et proposent d'écrire directement à Mind W3B.

## Licence

© 2026 Mind W3B. Tous droits réservés.

Ce dépôt est public pour que chacun puisse vérifier la méthode de calcul. Aucune licence de réutilisation n'est accordée : voir le fichier [LICENSE](LICENSE). L'outil en ligne reste libre et gratuit.

Une erreur dans la méthode ou une source plus récente ? Ouvrez une issue : les retours sont les bienvenus.
