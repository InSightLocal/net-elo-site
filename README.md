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
- Tarifs indiqués à titre commercial selon devis : 25 €/h à Clermont et alentours proches ; 30 €/h hors secteur proche lorsque l’intervention est réalisable ; majoration de 5 €/h les jours fériés ; lavage de vitres minimum 50 € sur devis. Crédit d’impôt SAP 50 % **sous conditions** ; ne pas promettre l'avance immédiate comme systématique.

## Performances

- Logo et photographies de prestations : fichiers WebP déjà présents à la racine.
- Accueil : `hero-interieur.webp` (ordinateur) et `hero-interieur-mobile.webp` (mobile), stockés directement dans le dépôt.
- Source distante retirée du CSS.
- `width` / `height` sur les images pour limiter les décalages.
- Ne pas annoncer de score PageSpeed ou Core Web Vitals sans mesure externe.

## Vérification et publication

La GitHub Action `.github/workflows/quality.yml` vérifie la syntaxe JS et lance `scripts/site_check.py` sur les liens, titres, images, canoniques, sitemap, données structurées et invariants de sécurité du site statique. PHP/Composer/vendor et plusieurs constructions JavaScript dangereuses sont explicitement interdits.

Une modification du contenu doit être contrôlée dans l'action **pages build and deployment**. Le sitemap et les dates `lastmod` doivent être mis à jour pour les changements significatifs. `.github/workflows/indexnow.yml` informe IndexNow des pages modifiées, mais l'indexation effective n'est jamais garantie.

Les anciens générateurs SEO et d’assets ont été supprimés. Le dépôt ne conserve que les automatisations nécessaires à la validation qualité/sécurité et à IndexNow.

## Données à vérifier par l'exploitante

- Les conditions particulières de devis, le statut SAP, la validité de la couverture géographique et les informations fiscales doivent correspondre à la pratique réelle.
- Le médiateur mentionné est la Société de la Médiation Professionnelle – Alteritae (coordonnées reprises du choix antérieurement communiqué et vérifiées sur son site officiel).
- Adresse physique complète de domiciliation non publiée ici afin de ne pas divulguer une adresse privée sans décision expresse ; contrôler les obligations des mentions légales.
