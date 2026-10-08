# Historique des versions

## Non publié

- Page 404 aux couleurs du site, `robots.txt` et `sitemap.xml`.
- Adresse email de contact assemblée dans le navigateur : plus jamais en clair dans le code servi.
- Sécurité : la limite d'essais sur `/admin` bloque désormais vraiment la vérification du mot de passe ; compteurs d'envois partagés dans la base Redis (IP jamais stockée en clair) au lieu de la mémoire de chaque instance.
- En-têtes HTTP renforcés (HSTS, COOP, CSP `object-src 'none'` et `upgrade-insecure-requests`) et fichier `/.well-known/security.txt`.
- Mesure d'audience avec Vercel Web Analytics sur les pages publiques (sans cookie, `/admin` exclue).
- Politique de confidentialité complétée : section « Mesure d'audience », rôle de Vercel et durée de conservation des statistiques.
- Équivalent voiture affiché en kilomètres en dessous d'un aller-retour Paris–Marseille.
- Compteur des questions facultatives sur 6, comme annoncé.
- Gain affiché « selon nos simulations ».
- Adresse du site centralisée (`SITE` dans `moteur.js`, script `changer-adresse.sh`), désormais mindw3b-calculateur.vercel.app (canonical, og:url, og:image, sitemap, robots.txt, security.txt, README, LICENSE).
- Nettoyage du code : styles et exports inutilisés retirés, commentaires harmonisés.

## v1.2.0 (octobre 2026)

Demande d'audit et synthèse en PDF.

- « Faire auditer nos usages » ouvre un formulaire de contact dans les deux versions. La demande est enregistrée avec la synthèse du calcul.
- « Télécharger la synthèse » remplace « Copier la synthèse » : contre un email valide, le visiteur obtient un récapitulatif PDF aux couleurs de Mind W3B, avec une case facultative pour les actualités.
- Les formulaires sont enregistrés dans une base Upstash Redis (fonctions Vercel `api/audit.js`, `api/synthese.js`) et se consultent sur `/admin`, protégée par mot de passe, avec export CSV et suppression.
- Texte de la synthèse extrait dans `assets/js/synthese.js`, partagé par les pages et les fonctions, qui le recalculent côté serveur.
- Nouvelle page `/confidentialite`, liée depuis le pied de page des deux versions.
- Polices Sora et Manrope hébergées sur le site : plus aucun appel à Google Fonts.

## v1.1.0 (octobre 2026)

Version simple pour les dirigeants.

- Nouvelle page d'accueil : trois questions (utilisateurs, outils, fréquence) et six questions facultatives pour affiner.
- Résultat annuel avec fourchette en échelle logarithmique, niveau de précision, équivalents parlants et gain possible en optimisant.
- Détail électricité, eau et requêtes, et ouverture du mode expert prérempli avec les réponses.
- L'ancien calculateur devient le mode expert, servi en `/expert`. Ses résultats sont inchangés.
- Formules et référentiels extraits dans `assets/js/moteur.js`, partagé par les deux pages.

## v1.0.0 (octobre 2026)

Première version publique.

- Calcul multi-usages : énergie, carbone et eau, par mois ou par an.
- Fourchettes basse, centrale et haute.
- Modèles fermés regroupés en classes de taille, modèles ouverts avec leur taille publiée, modèle personnalisé.
- Hébergeurs (Google Cloud, AWS, Azure, colocation, salle serveur interne) et régions d'hébergement.
- Répartition des émissions par poste.
- Simulateur de leviers d'optimisation.
- Synthèse copiable, thèmes clair et sombre, sauvegarde locale des saisies.
