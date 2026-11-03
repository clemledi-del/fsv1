# Ferdinand Spirit — LP « Vendre mon véhicule »

Site statique (HTML / CSS / JS séparés), prêt pour GitHub Pages.

```
index.html          → structure + contenus (8 blocs)
css/style.css       → design system (couleurs du site, Anton + Inter) — mobile-first
js/config.js        → À COMPLÉTER : ID Pixel Meta, endpoint formulaire, listes de modèles
js/main.js          → consentement, Pixel Meta, formulaire, photos, CTA sticky, vidéo, carrousel, FAQ
assets/img/         → visuels optimisés (WebP + JPG de secours)
assets/fonts/       → Anton + Inter auto-hébergées (RGPD, pas d'appel à Google Fonts)
```

## Blocs
1. Hero + formulaire complet (1 étape)
2. Process en 4 étapes + vidéo YouTube (chargée au clic, youtube-nocookie)
3. Pourquoi Ferdinand Spirit (4 arguments)
4. Preuve par le showroom (3 véhicules, photos chargées depuis ferdinandspirit.com)
5. Avis Google (carrousel)
6. L'équipe (Nicolas, Florent)
7. FAQ (accordéon + données structurées FAQPage)
8. CTA final + footer

## Mise en ligne GitHub Pages
1. Pousser le contenu de ce dossier à la racine d'un dépôt.
2. Settings → Pages → Branch `main` / `root` → Save.
3. **Production** : retirer `<meta name="robots" content="noindex">` dans `index.html`.

## Avant la mise en production
- [ ] `js/config.js` : `metaPixelId` + `formEndpoint`
- [ ] Logo SVG officiel (header + footer)
- [ ] Photos réelles : équipe (`lp-en-attente-equipe`), portraits Nicolas / Florent
- [ ] Copier localement les 3 photos véhicules (actuellement chargées depuis ferdinandspirit.com)
- [ ] Statut des véhicules (« Vendu » quand c'est le cas)
- [ ] Lien fiche Google Business + nombre d'avis
- [ ] Avis vendeur (François G.) — texte exact
- [ ] URL mentions légales / politique de confidentialité
- [ ] Confirmer « +15 ans » (le site indique « plus de 10 ans »)

## Pixel Meta — évènements
| Moment | Évènement |
|---|---|
| Chargement (après « Accepter ») | `PageView` |
| 1re interaction formulaire | `EstimationStart` (custom) |
| Envoi réussi | `Lead` (à utiliser comme conversion) |
| Clic téléphone | `Contact` |
| Clic CTA (hero, sticky, process, pourquoi, équipe, final) | `CTAClick` (custom, `position`) |
| Lecture vidéo | `VideoPlay` (custom) |
| Clic fiche véhicule | `ShowroomClick` (custom) |
| Question FAQ ouverte | `FAQOpen` (custom) |

Aucune donnée personnelle n'est envoyée au Pixel. Sans ID configuré, les évènements s'affichent dans la console.

## Formulaire
`formEndpoint` vide = mode test (succès simulé, données dans la console).
Champs envoyés : prenom, nom, email, telephone, code_postal, marque, modele, version, annee, kilometrage,
photos[], consentement, utm_*, fbclid, page.
