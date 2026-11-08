# Site Net Elo — net-elo.fr

Site vitrine statique de **Net Elo (Élodie Massin E.I.)**, publié via GitHub Pages depuis le dépôt `InSightLocal/net-elo-site` sur `main`.

## Contenu

Pages principales : `index.html`, `aide-menagere.html`, `vitres.html`, `sap.html`, `secteur-intervention.html`, `a-propos.html`, `faq.html`, `contact.html`.

Pages de transparence : `mentions-legales.html`, `confidentialite.html`, `cookies.html`, `404.html`. Sitemap de **8 pages principales** ; la page 404 est exclue de l'index.

## Interface, contact et confidentialité

- Menu mobile accessible avec ouverture par bouton et fermeture par touche Échap.
- Formulaire de devis sur `contact.html` : prépare un **courriel à envoyer volontairement** ou copie le texte. Il n'envoie pas automatiquement une demande à un serveur.
- Google Analytics 4 est chargé **uniquement après consentement** (script `site.js` / identifiant `site-config.js`). Les préférences sont accessibles via `cookies.html`. Ne pas installer de nouveaux traceurs sans revoir les informations RGPD.
- Bandeau mobile appel/devis conservé.
- Tarifs indiqués à titre commercial selon devis : ménage régulier 25 €/h, ponctuel 28 €/h, vitres dès 30 €. Crédit d’impôt SAP 50 % **sous conditions** ; ne pas promettre l'avance immédiate comme systématique.

## Performances

- Logo et photographies de prestations : fichiers WebP déjà présents à la racine.
- Accueil : `hero-interieur.webp` (ordinateur) et `hero-interieur-mobile.webp` (mobile), générés à partir de l’illustration d’accueil antérieure par `.github/workflows/prepare-site-assets.yml`.
- Source distante retirée du CSS.
- `width` / `height` sur les images pour limiter les décalages.
- Ne pas annoncer de score PageSpeed ou Core Web Vitals sans mesure externe.

## Vérification et publication

La GitHub Action `.github/workflows/quality.yml` vérifie la syntaxe JS et lance `scripts/site_check.py` sur les liens, titres, images, canoniques, sitemap et données structurées.

Une modification du contenu doit être contrôlée dans l'action **pages build and deployment**. Le sitemap et les dates `lastmod` doivent être mis à jour pour les changements significatifs. `.github/workflows/indexnow.yml` informe IndexNow des pages modifiées, mais l'indexation effective n'est jamais garantie.

Les anciens workflows `seo-phase2.yml` et `integrate-structured-data.yml` sont des scripts historiques, pouvant réécrire certains fichiers s’ils sont déclenchés manuellement : ne pas les relancer sans auditer leurs effets.

## Données à vérifier par l'exploitante

- Les conditions particulières de devis, le statut SAP, la validité de la couverture géographique et les informations fiscales doivent correspondre à la pratique réelle.
- Le médiateur mentionné est la Société de la Médiation Professionnelle – Alteritae (coordonnées reprises du choix antérieurement communiqué et vérifiées sur son site officiel).
- Adresse physique complète de domiciliation non publiée ici afin de ne pas divulguer une adresse privée sans décision expresse ; contrôler les obligations des mentions légales.
