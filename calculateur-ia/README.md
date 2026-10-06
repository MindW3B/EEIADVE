# Calculateur d'empreinte environnementale de l'IA en entreprise

Outil gratuit de [Mind W3B](https://www.mindw3b.co/) pour estimer l'énergie, le carbone et l'eau consommés par les usages d'IA générative d'une entreprise.

En ligne : https://calculateur.mindw3b.co/

![Aperçu](assets/img/og-image.png)

## Ce que fait l'outil

- Décrire plusieurs usages (assistant interne, support client, assistant de code…) avec leur modèle, leur hébergement, leur région et leurs volumes de tokens.
- Obtenir l'électricité, les émissions de gaz à effet de serre et l'eau consommée, par mois ou par an, avec une fourchette basse, centrale et haute.
- Voir d'où viennent les émissions : calcul GPU, serveur et veille, refroidissement, fabrication du matériel, entraînement amorti.
- Simuler des leviers d'optimisation : réduction des tokens d'entrée et de sortie, routage vers un modèle léger.
- Copier une synthèse texte des résultats.

Les saisies restent dans le navigateur de l'utilisateur (localStorage). Aucune donnée n'est envoyée à un serveur.

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
├── index.html               Page de l'outil
├── assets/
│   ├── css/style.css        Styles (thèmes clair et sombre)
│   ├── js/calculateur.js    Référentiels, calcul et interface
│   └── img/                 Logo, favicon, image de partage
├── vercel.json              Configuration d'hébergement
└── CHANGELOG.md             Historique des versions
```

Site statique, sans dépendance ni étape de build. Seules les polices Sora et Manrope sont chargées depuis Google Fonts.

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
npx serve .
```

## Mettre à jour les hypothèses

Tous les référentiels sont en haut de `assets/js/calculateur.js` :

- `MODELS` : modèles et paramètres actifs (bas, central, haut) ;
- `OPS` : hébergeurs, PUE et WUE ;
- `GRIDS` : intensité carbone par région (kg CO₂e/kWh) ;
- `SC` : hypothèses des scénarios bas, central et haut ;
- `HYP_DEF` : hypothèses techniques modifiables dans la page.

Après une modification de méthode, pensez à mettre à jour le tableau de la section « Méthode » dans `index.html`, le numéro de version et le `CHANGELOG.md`.

## Déploiement

Le dépôt est relié à Vercel : chaque push sur `main` redéploie le site.

## Licence

© 2026 Mind W3B. Tous droits réservés.

Ce dépôt est public pour que chacun puisse vérifier la méthode de calcul. Aucune licence de réutilisation n'est accordée : voir le fichier [LICENSE](LICENSE). L'outil en ligne reste libre et gratuit.

Une erreur dans la méthode ou une source plus récente ? Ouvrez une issue : les retours sont les bienvenus.
