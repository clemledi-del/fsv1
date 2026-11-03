/* ==========================================================================
   FERDINAND SPIRIT — LP Estimation · main.js
   1. Consentement + Pixel Meta   2. Tracking   3. Formulaire 2 étapes
   4. Upload photos               5. CTA sticky mobile
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.FS_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     1. CONSENTEMENT & PIXEL META
     ------------------------------------------------------------------ */
  var CONSENT_KEY = "fs_consent";
  var pixelReady = false;
  var queue = [];

  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }

  function loadPixel() {
    if (pixelReady || !CFG.metaPixelId || CFG.metaPixelId === "VOTRE_PIXEL_ID") {
      if (!pixelReady) console.info("[FS] Pixel Meta non configuré (js/config.js). Évènements loggés en console.");
      pixelReady = pixelReady || "debug";
      flush();
      return;
    }
    /* Code de base Meta Pixel (officiel) */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CFG.metaPixelId);
    window.fbq("track", "PageView");
    pixelReady = true;
    flush();
  }

  function flush() { while (queue.length) send.apply(null, queue.shift()); }

  function send(type, name, params) {
    if (pixelReady === true && window.fbq) window.fbq(type, name, params || {});
    else console.info("[FS] " + type + " →", name, params || {});
  }

  /** track("Lead", {...}) pour un évènement standard, track("X", {...}, true) pour un custom */
  function track(name, params, custom) {
    var args = [custom ? "trackCustom" : "track", name, params];
    if (pixelReady) send.apply(null, args); else queue.push(args);
  }
  window.fsTrack = track;

  function initConsent() {
    var bar = $("[data-consent-bar]");
    if (!CFG.requireConsent) { loadPixel(); return; }
    var choice = store(CONSENT_KEY);
    if (choice === "granted") { loadPixel(); return; }
    if (choice === "denied") { queue = []; return; }
    if (!bar) return;
    bar.hidden = false;
    document.body.classList.add("has-consent-bar");
    $$("[data-consent]", bar).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var granted = btn.getAttribute("data-consent") === "grant";
        store(CONSENT_KEY, granted ? "granted" : "denied");
        bar.hidden = true;
        document.body.classList.remove("has-consent-bar");
        if (granted) loadPixel(); else queue = [];
        updateSticky();
      });
    });
  }

  /* ------------------------------------------------------------------
     2. TRACKING CLICS (CTA, téléphone)
     ------------------------------------------------------------------ */
  function initClickTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-track]");
      if (!el) return;
      var ev = el.getAttribute("data-track");
      if (ev === "PhoneClick") track("Contact", { method: "phone" });
      else track(ev, { position: el.getAttribute("data-track-label") || "" }, true);
    });
  }

  /* ------------------------------------------------------------------
     3. FORMULAIRE (1 étape)
     ------------------------------------------------------------------ */
  var MSG = {
    required: "Ce champ est requis.",
    year: "Indiquez une année entre 1950 et " + (new Date().getFullYear() + 1) + ".",
    mileage: "Indiquez un kilométrage valide.",
    email: "Adresse email invalide.",
    phone: "Numéro de téléphone invalide.",
    zip: "Code postal à 5 chiffres.",
    consent: "Merci d'accepter pour envoyer votre demande."
  };

  var validators = {
    annee: function (v) { var y = parseInt(v, 10), max = new Date().getFullYear() + 1; return /^\d{4}$/.test(v) && y >= 1950 && y <= max ? "" : MSG.year; },
    kilometrage: function (v) { var n = parseInt(v.replace(/\s/g, ""), 10); return !isNaN(n) && n >= 0 && n < 2000000 ? "" : MSG.mileage; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : MSG.email; },
    telephone: function (v) { var d = v.replace(/[\s.\-()]/g, ""); return /^(\+33|0033|0)[1-9]\d{8}$/.test(d) || /^\+\d{8,15}$/.test(d) ? "" : MSG.phone; },
    code_postal: function (v) { return /^\d{5}$/.test(v) ? "" : MSG.zip; }
  };

  function setFieldState(input, error) {
    var field = input.closest(".field") || input.closest(".consent");
    if (!field) return;
    var err = field.querySelector(".field__error");
    field.classList.toggle("is-invalid", !!error);
    field.classList.toggle("is-valid", !error && input.type !== "checkbox" && input.value.trim() !== "");
    input.setAttribute("aria-invalid", error ? "true" : "false");
    if (error && field.classList.contains("field")) {
      if (!err) { err = document.createElement("p"); err.className = "field__error"; err.id = input.id + "-err"; field.appendChild(err); input.setAttribute("aria-describedby", err.id); }
      err.textContent = error;
    } else if (err) { err.remove(); input.removeAttribute("aria-describedby"); }
  }

  function validateInput(input) {
    if (!input.required && !input.value) { setFieldState(input, ""); return true; }
    var v = (input.value || "").trim(), error = "";
    if (input.type === "checkbox") error = input.checked ? "" : MSG.consent;
    else if (!v) error = MSG.required;
    else if (validators[input.name]) error = validators[input.name](v);
    setFieldState(input, error);
    return !error;
  }

  function validateStep(step) {
    var inputs = $$("input[required], select[required]", step);
    var firstBad = null;
    inputs.forEach(function (i) { if (!validateInput(i) && !firstBad) firstBad = i; });
    if (firstBad) firstBad.focus({ preventScroll: false });
    return !firstBad;
  }

  function initForm() {
    /* Formulaire en une seule étape */
    var form = $("#estimate-form");
    if (!form) return;
    var brand = $("#brand"), model = $("#model"), datalist = $("#model-list");
    var warn = $("[data-model-warning]");
    var started = false;

    /* -- UTM / fbclid -- */
    var qs = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"].forEach(function (k) {
      var el = form.elements[k]; if (el) el.value = qs.get(k) || "";
    });
    form.elements.page.value = location.href.split("?")[0];

    /* -- Suggestions modèles selon la marque -- */
    function fillModels() {
      var list = (CFG.models && CFG.models[brand.value]) || [];
      datalist.innerHTML = list.map(function (m) { return '<option value="' + m + '">'; }).join("");
      model.placeholder = brand.value === "Porsche" ? "911, Cayman, Boxster…" : (list.slice(0, 2).join(", ") + "…");
      checkExcluded();
    }
    function checkExcluded() {
      var v = model.value.toLowerCase();
      var hit = brand.value === "Porsche" && (CFG.excludedModels || []).some(function (x) { return v.indexOf(x) > -1; });
      warn.hidden = !hit;
    }
    brand.addEventListener("change", fillModels);
    model.addEventListener("input", checkExcluded);
    fillModels();

    /* -- Formatage kilométrage (68 000) -- */
    var km = $("#mileage");
    km.addEventListener("input", function () {
      var d = km.value.replace(/\D/g, "").slice(0, 7);
      km.value = d.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    });
    /* chiffres uniquement */
    ["#year", "#zip"].forEach(function (s) { var el = $(s); el.addEventListener("input", function () { el.value = el.value.replace(/\D/g, ""); }); });

    /* -- Validation au fil de l'eau -- */
    $$("input, select", form).forEach(function (i) {
      if (i.type === "hidden" || i.type === "file") return;
      i.addEventListener("blur", function () { if (i.value || i.closest(".is-invalid")) validateInput(i); });
      i.addEventListener("input", function () { if (i.closest(".is-invalid")) validateInput(i); });
      i.addEventListener("change", function () { if (i.type === "checkbox") validateInput(i); });
    });

    /* -- Début de saisie -- */
    form.addEventListener("focusin", function () {
      if (started) return; started = true;
      track("EstimationStart", {}, true);
    });

    /* -- Envoi -- */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(form)) return;
      if (form.elements.website.value) return; /* honeypot */

      var btn = $("[data-submit]", form), errBox = $("[data-form-error]", form);
      errBox.hidden = true;
      btn.classList.add("is-loading"); btn.setAttribute("aria-busy", "true");

      var data = new FormData(form);
      data.delete("photos");
      photos.forEach(function (f) { data.append("photos", f, f.name); });

      var request = CFG.formEndpoint
        ? fetch(CFG.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
            .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r; })
        : new Promise(function (res) { console.info("[FS] Mode TEST — données du formulaire :", Object.fromEntries(data.entries())); setTimeout(res, 900); });

      request.then(function () {
        track("Lead", { content_name: brand.value + " " + model.value, content_category: "Estimation vendeur" });
        showSuccess(form.elements.prenom.value.trim());
      }).catch(function () {
        errBox.innerHTML = 'Oups, l\'envoi n\'a pas abouti. Réessayez ou appelez-nous au <a href="tel:+33627053439">06 27 05 34 39</a>.';
        errBox.hidden = false;
      }).finally(function () {
        btn.classList.remove("is-loading"); btn.removeAttribute("aria-busy");
      });
    });

    function showSuccess(name) {
      var ok = $("[data-success]");
      $("[data-success-name]").textContent = name ? " " + name : "";
      form.hidden = true; ok.hidden = false;
      ok.focus({ preventScroll: true });
      ok.closest(".form-card").scrollIntoView({ behavior: "smooth", block: "start" });
      document.body.classList.add("is-submitted");
      updateSticky();
    }

    /* ------------------------------------------------------------------
       4. PHOTOS : aperçus, suppression, drag & drop
       ------------------------------------------------------------------ */
    var photos = [];
    var input = $("#photos"), thumbs = $("[data-thumbs]"), zone = $("[data-dropzone]");
    var maxFiles = CFG.maxFiles || 10, maxBytes = (CFG.maxFileSizeMb || 10) * 1024 * 1024;

    function addFiles(list) {
      Array.prototype.forEach.call(list, function (f) {
        if (photos.length >= maxFiles || f.size > maxBytes) return;
        if (!/^image\//.test(f.type) && f.type !== "application/pdf") return;
        photos.push(f);
      });
      input.value = "";
      render();
    }
    function render() {
      thumbs.innerHTML = "";
      photos.forEach(function (f, i) {
        var li = document.createElement("li");
        if (/^image\//.test(f.type)) {
          var img = document.createElement("img"); img.alt = ""; img.src = URL.createObjectURL(f);
          img.onload = function () { URL.revokeObjectURL(img.src); }; li.appendChild(img);
        } else { li.innerHTML = '<span class="thumb__file">PDF</span>'; }
        var del = document.createElement("button"); del.type = "button"; del.innerHTML = "&times;";
        del.setAttribute("aria-label", "Retirer " + f.name);
        del.addEventListener("click", function () { photos.splice(i, 1); render(); });
        li.appendChild(del); thumbs.appendChild(li);
      });
      $(".dropzone__title", zone).textContent = photos.length ? photos.length + " fichier" + (photos.length > 1 ? "s" : "") + " ajouté" + (photos.length > 1 ? "s" : "") + " · en ajouter" : "Ajouter des photos";
    }
    input.addEventListener("change", function () { addFiles(input.files); });
    ["dragenter", "dragover"].forEach(function (t) { zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (t) { zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.remove("is-over"); }); });
    zone.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });
  }

  /* ------------------------------------------------------------------
     5. CTA STICKY MOBILE : visible après le hero, masqué quand le formulaire est à l'écran
     ------------------------------------------------------------------ */
  var heroCta, formEl, sticky, heroOut = false, formIn = false;
  function updateSticky() {
    if (!sticky) return;
    var show = heroOut && !formIn && !document.body.classList.contains("has-consent-bar") && !document.body.classList.contains("is-submitted");
    sticky.classList.toggle("is-visible", show);
    sticky.setAttribute("aria-hidden", show ? "false" : "true");
    $$("a, button", sticky).forEach(function (el) { el.tabIndex = show ? 0 : -1; });
  }
  function initSticky() {
    sticky = $("[data-sticky-cta]"); heroCta = $(".hero__cta"); formEl = $("#estimation");
    if (!sticky || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (en) { heroOut = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; updateSticky(); }).observe(heroCta);
    /* masqué aussi quand un autre bouton « Obtenir mon estimation » est déjà à l'écran */
    var visible = new Set();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      formIn = visible.size > 0; updateSticky();
    }, { threshold: 0.15 });
    io.observe(formEl);
    $$(".process__cta, .final__actions, .site-footer").forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     6. VIDÉO YOUTUBE : iframe chargée au clic (youtube-nocookie)
     ------------------------------------------------------------------ */
  function initVideos() {
    $$("[data-video]").forEach(function (box) {
      var btn = $(".video__btn", box);
      btn.addEventListener("click", function () {
        var id = box.getAttribute("data-video");
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
        f.title = "Vendre son véhicule avec Ferdinand Spirit";
        f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
        f.allowFullscreen = true;
        box.innerHTML = ""; box.appendChild(f);
        track("VideoPlay", { video: id }, true);
      });
    });
  }

  /* ------------------------------------------------------------------
     7. CARROUSEL D'AVIS : scroll-snap natif + flèches + points + défilement auto doux
     ------------------------------------------------------------------ */
  function initCarousels() {
    $$("[data-carousel]").forEach(function (root) {
      var track = $("[data-track]", root), prev = $("[data-prev]", root), next = $("[data-next]", root), dotsBox = $("[data-dots]", root);
      var items = $$(".review", track);
      if (!items.length) return;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function step() { return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth; }
      function perView() { return Math.max(1, Math.round(track.clientWidth / step())); }
      function pages() { return Math.max(1, items.length - perView() + 1); }
      function index() { return Math.round(track.scrollLeft / step()); }
      function go(i) { track.scrollTo({ left: Math.max(0, Math.min(i, pages() - 1)) * step(), behavior: reduce ? "auto" : "smooth" }); }

      function renderDots() {
        dotsBox.innerHTML = "";
        for (var i = 0; i < pages(); i++) dotsBox.appendChild(document.createElement("span"));
        update();
      }
      function update() {
        var i = index(), n = pages();
        $$("span", dotsBox).forEach(function (d, k) { d.classList.toggle("is-active", k === Math.min(i, n - 1)); });
        prev.disabled = i <= 0; next.disabled = i >= n - 1;
      }
      prev.addEventListener("click", function () { go(index() - 1); stop(); });
      next.addEventListener("click", function () { go(index() + 1); stop(); });
      var t; track.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
      window.addEventListener("resize", renderDots);
      renderDots();

      /* Défilement automatique : 6 s, en pause au survol / focus / interaction, désactivé si "réduire les animations" */
      var timer = null, visible = false;
      function tick() { if (!visible) return; var i = index(); go(i >= pages() - 1 ? 0 : i + 1); }
      function start() { if (reduce || timer) return; timer = setInterval(tick, 6000); }
      function stop() { clearInterval(timer); timer = null; }
      ["mouseenter", "focusin", "touchstart", "pointerdown"].forEach(function (ev) { root.addEventListener(ev, stop, { passive: true }); });
      root.addEventListener("mouseleave", start);
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: .4 }).observe(root);
      start();
    });
  }

  /* ------------------------------------------------------------------
     8. DÉFILEMENT : barre de progression, header fixe, bouton retour au formulaire
     ------------------------------------------------------------------ */
  function initScrollUI() {
    var bar = $("[data-progress-bar]"), header = $(".site-header"), floatBtn = $("[data-to-top-float]");
    var hero = $(".hero"), ticking = false;
    function onScroll() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      var past = hero ? y > hero.offsetHeight - 80 : y > 600;
      if (header) header.classList.toggle("is-fixed", past && window.innerWidth >= 1024);
      if (floatBtn) floatBtn.classList.toggle("is-visible", past);
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    /* Retour en haut : desktop → formulaire du hero + focus sur le 1er champ vide ; mobile → haut de page */
    $$("[data-to-top]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        track("BackToTop", {}, true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.innerWidth >= 1024) {
          setTimeout(function () {
            var empty = $$("#estimate-form input[required], #estimate-form select[required]").filter(function (i) { return i.type !== "checkbox" && !i.value; })[0];
            if (empty) empty.focus({ preventScroll: true });
          }, 600);
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     9. SHOWROOM : 2e photo au survol (desktop) / alternance auto quand visible (mobile)
     ------------------------------------------------------------------ */
  function initCarPhotos() {
    var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    if (canHover || !("IntersectionObserver" in window)) return;
    $$(".car__media.has-alt").forEach(function (m) {
      var timer = null;
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!timer) timer = setInterval(function () { m.classList.toggle("is-alt"); }, 2800); }
        else { clearInterval(timer); timer = null; m.classList.remove("is-alt"); }
      }, { threshold: 0.6 }).observe(m);
    });
  }

  /* ------------------------------------------------------------------
     10. APPARITIONS AU DÉFILEMENT
     ------------------------------------------------------------------ */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Téléphone : formatage automatique « 06 12 34 56 78 » */
  function initPhoneFormat() {
    var tel = $("#phone"); if (!tel) return;
    tel.addEventListener("input", function () {
      var v = tel.value;
      if (/^0[\d\s]*$/.test(v)) tel.value = v.replace(/\D/g, "").slice(0, 10).replace(/(\d{2})(?=\d)/g, "$1 ");
    });
  }

  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initScrollUI();
    initCarPhotos();
    initReveal();
    initPhoneFormat();
    initCarousels();
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-consent-open]").forEach(function (b) {
      b.addEventListener("click", function () { try { localStorage.removeItem("fs_consent"); } catch (e) {} location.reload(); });
    });
    $$(".faq__item").forEach(function (d) {
      d.addEventListener("toggle", function () { if (d.open) track("FAQOpen", { question: $("summary span", d).textContent }, true); });
    });
    initVideos();
    initConsent();
    initClickTracking();
    initForm();
    initSticky();
  });
})();
