# Historique des versions

## v1.2.0 (octobre 2026)

Synthèse par email et demande d'audit.

- « Faire auditer nos usages » ouvre un formulaire de contact dans les deux versions. La demande arrive par email chez Mind W3B, avec la synthèse du calcul en pièce jointe.
- « Recevoir la synthèse » remplace « Copier la synthèse » : la synthèse est envoyée par email au visiteur, Mind W3B est prévenu à chaque envoi. Case facultative pour les actualités de Mind W3B. Le texte reste copiable après l'envoi.
- Deux fonctions Vercel (`api/synthese.js`, `api/audit.js`) envoient les emails via Resend. Elles recalculent la synthèse avec le moteur partagé.
- Texte de la synthèse extrait dans `assets/js/synthese.js`, partagé par les pages et les fonctions.
- Nouvelle page `/confidentialite`, liée depuis le pied de page des deux versions.

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
