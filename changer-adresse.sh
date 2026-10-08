#!/bin/sh
# Remplace l'adresse publique du calculateur dans tout le dépôt
# (balises canonical et og des pages, synthèse, PDF, README, LICENSE).
# Usage : ./changer-adresse.sh calculateur.mindw3b.co
set -e
cd "$(dirname "$0")"
nouvelle=${1:?"Usage : $0 nouvelle-adresse (sans https://)"}
ancienne=$(sed -n "s|^var SITE='https://\([^/']*\)/';|\1|p" calculateur-ia/assets/js/moteur.js)
[ -n "$ancienne" ] || { echo "Adresse actuelle introuvable dans moteur.js" >&2; exit 1; }
git grep -lF "$ancienne" -- . ':!changer-adresse.sh' | xargs perl -pi -e "s/\Q$ancienne\E/$nouvelle/g"
echo "$ancienne -> $nouvelle"
git grep -nF "$nouvelle" -- . ':!changer-adresse.sh'
