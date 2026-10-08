# Calculateur d'empreinte environnementale de l'IA en entreprise

Outil gratuit de [Mind W3B](https://www.mindw3b.co/) pour estimer l'énergie, le carbone et l'eau consommés par les usages d'IA générative d'une entreprise.

En ligne : https://eeiadve-calculateur-ia.vercel.app/

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
## Synthèse PDF et demande d'audit

Le bloc résultat des deux versions propose deux actions :

- **Faire auditer vos usages** : formulaire (nom, entreprise, email, téléphone et message facultatifs, consentement). La demande est enregistrée dans la base du projet avec la synthèse du calcul.
- **Télécharger votre synthèse** : le visiteur saisit un email valide pour obtenir un récapitulatif PDF aux couleurs de Mind W3B (une page en version simple). Une case facultative permet de recevoir les actualités. L'email est enregistré avec la synthèse ; le PDF est dessiné dans le navigateur (`assets/js/rapport.js`, sans bibliothèque). Le texte reste copiable.

Les formulaires reçus se consultent sur **`/admin`**, protégée par mot de passe : liste filtrable, détail et synthèse de chaque demande, export CSV (séparateur « ; », lisible par Excel) et suppression.

Les saisies restent dans le navigateur de l'utilisateur (localStorage) tant qu'il n'envoie pas l'un de ces formulaires. Les fonctions recalculent la synthèse à partir des réponses, avec le même moteur que les pages : aucun texte de synthèse venant du navigateur n'est enregistré tel quel.

Protections contre les abus : champ piège invisible, délai minimum avant envoi, vérification de l'origine de la requête, limite d'envois par IP (5 demandes d'audit et 8 synthèses toutes les 10 minutes) (compteurs en mémoire, approximatifs sur Vercel). Sur `/admin` : 10 essais de mot de passe par IP et par quart d'heure.

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
├── admin.html               Formulaires reçus, servie en /admin (mot de passe)
├── api/
│   ├── audit.js             POST /api/audit : enregistre une demande d'audit
│   ├── synthese.js          POST /api/synthese : enregistre l'email laissé pour télécharger la synthèse
│   ├── admin.js             GET / DELETE /api/admin : lecture et suppression des formulaires
│   └── _lib/                Outils communs et accès à la base (non exposés)
├── assets/
│   ├── css/simple.css       Styles de la version simple et de la politique de confidentialité
│   ├── css/style.css        Styles du mode expert (thèmes clair et sombre)
│   ├── css/contact.css      Fenêtres « Faire auditer vos usages » et « Télécharger votre synthèse »
│   ├── css/admin.css        Styles de la page /admin
│   ├── js/moteur.js         Référentiels et formules, partagés par les deux pages et par api/
│   ├── js/synthese.js       Texte de la synthèse, partagé par les deux pages et par api/
│   ├── js/simple.js         Interface de la version simple
│   ├── js/calculateur.js    Interface du mode expert
│   ├── js/rapport.js        Synthèse en PDF (canvas puis PDF, sans dépendance)
│   ├── js/contact.js        Fenêtres de synthèse et d'audit
│   ├── js/admin.js          Page /admin
│   ├── css/fonts.css        Déclaration des polices hébergées
│   ├── fonts/               Sora et Manrope (woff2, licence SIL OFL)
│   └── img/                 Logo, favicon, image de partage
├── vercel.json              Configuration d'hébergement
└── CHANGELOG.md             Historique des versions
```

Site statique, sans dépendance ni étape de build, plus trois fonctions Vercel (Node 18 ou plus récent) qui enregistrent les formulaires dans une base Upstash Redis. Les polices Sora et Manrope sont hébergées sur le site (`assets/fonts/`, licence SIL OFL) : aucune ressource n'est chargée depuis un service tiers. La mesure d'audience passe par Vercel Web Analytics, servi depuis le domaine du site (`/_vercel/insights/`), sans cookie.

## Lancer en local

Servir le dossier (les chemins sont absolus, et `/expert` repose sur `cleanUrls`) :

```bash
npx serve .
```

Puis ouvrir http://localhost:3000/ et http://localhost:3000/expert.

`npx serve` ne fait pas tourner les fonctions de `api/` : pour tester les formulaires, utiliser `npx vercel dev` avec les variables d'environnement ci-dessous.

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

### Adresse du site

L'adresse publique est définie par `SITE` dans `assets/js/moteur.js` (synthèse et PDF) et reprise dans les balises `canonical` et `og:` des pages, le README et la LICENSE. Pour la changer partout, depuis la racine du dépôt :

```bash
./changer-adresse.sh calculateur.mindw3b.co
```

### Base de données des formulaires

1. Dans Vercel : Storage → Create Database → **Upstash for Redis** (région européenne, par exemple Francfort), puis la relier au projet pour Production et Preview. Vercel ajoute alors `KV_REST_API_URL` et `KV_REST_API_TOKEN` (les noms `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` sont aussi acceptés).
2. Ajouter la variable `ADMIN_PASSWORD` (mot de passe long) pour Production et Preview.
3. Redéployer pour que les variables soient prises en compte.

Sans base reliée, les formulaires affichent une erreur et proposent d'écrire directement à Mind W3B.

### Mesure d'audience

Les pages publiques (`/`, `/expert`, `/confidentialite`) chargent `/_vercel/insights/script.js`. La page `/admin` n'est pas mesurée.

1. Dans Vercel : onglet **Analytics** du projet → **Enable** (Web Analytics).
2. Redéployer. Tant que l'option n'est pas activée, le script renvoie une 404 sans effet sur le site.

Les statistiques se consultent dans l'onglet Analytics. Le script est servi par le site lui-même : la politique de sécurité (`script-src 'self'`, `connect-src 'self'`) n'a pas besoin d'être modifiée.

## Licence

© 2026 Mind W3B. Tous droits réservés.

Ce dépôt est public pour que chacun puisse vérifier la méthode de calcul. Aucune licence de réutilisation n'est accordée : voir le fichier [LICENSE](LICENSE). L'outil en ligne reste libre et gratuit.

Une erreur dans la méthode ou une source plus récente ? Ouvrez une issue : les retours sont les bienvenus.
