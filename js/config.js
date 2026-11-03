/* ==========================================================================
   CONFIGURATION — à compléter avant la mise en ligne
   ========================================================================== */
window.FS_CONFIG = {
  /* ID du Pixel Meta (Gestionnaire d'évènements > Sources de données) */
  metaPixelId: "VOTRE_PIXEL_ID",

  /* Le Pixel n'est chargé qu'après acceptation du bandeau cookies (CNIL).
     Passer à false uniquement si un CMP (Axeptio, Didomi…) gère déjà le consentement. */
  requireConsent: true,

  /* Endpoint de réception du formulaire (POST multipart/form-data).
     Exemples : Formspree "https://formspree.io/f/xxxxxx", webhook Make/Zapier, ou API du CRM.
     Laisser vide = mode TEST (aucun envoi, succès simulé + log console). */
  formEndpoint: "",

  /* Photos : limites côté navigateur */
  maxFiles: 10,
  maxFileSizeMb: 10,

  /* Suggestions de modèles par marque (liste indicative, saisie libre conservée) */
  models: {
    "Porsche": ["911", "911 Carrera", "911 Targa", "911 Turbo", "911 GT3", "911 GT3 RS", "911 GT2 RS", "718 Cayman", "718 Boxster", "Cayman", "Boxster", "356", "912", "914", "924", "928", "944", "968", "Carrera GT", "918 Spyder"],
    "Alpine": ["A110", "A110 GT", "A110 S", "A110 R", "A110 Berlinette (1962-1977)", "A310", "A610", "GTA"],
    "Ferrari": ["296 GTB", "F8 Tributo", "488 GTB", "458 Italia", "F430", "360 Modena", "355", "Roma", "Portofino", "California", "812 Superfast", "F12", "599", "Testarossa", "328", "308"],
    "Renault Sport": ["Clio RS", "Clio V6", "Clio Williams", "Mégane RS", "Mégane RS Trophy", "Spider", "R5 Turbo"]
  },

  /* Modèles non repris (Porsche) — affiche un message informatif */
  excludedModels: ["cayenne", "panamera", "macan", "taycan"]
};
