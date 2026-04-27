/**
 * Consent Manager — DSGVO-konformer Cookie-Banner
 *
 * Verwaltet Zustimmung für externe Dienste:
 * - Google Fonts (Plus Jakarta Sans)
 * - Reonic Solar-Konfigurator
 *
 * Speicherung: localStorage (12 Monate gültig)
 */

const ConsentManager = (function () {
  const STORAGE_KEY = 'solaranlage-berger-consent';
  const CONSENT_VERSION = 1;
  const VALIDITY_MS = 365 * 24 * 60 * 60 * 1000; // 12 Monate

  // === Stored Preferences ===
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Validierung: Version + Ablauf
      if (data.version !== CONSENT_VERSION) return null;
      if (Date.now() - data.timestamp > VALIDITY_MS) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        timestamp: Date.now(),
        external: !!prefs.external
      }));
    } catch (e) {
      console.warn('Consent konnte nicht gespeichert werden:', e);
    }
  }

  // === DOM Elements ===
  function getBanner() { return document.getElementById('consentBanner'); }
  function getModal() { return document.getElementById('consentModal'); }
  function getExternalCheckbox() { return document.getElementById('consent-external'); }

  // === UI ===
  function showBanner() {
    const banner = getBanner();
    if (banner) {
      banner.hidden = false;
      requestAnimationFrame(() => banner.classList.add('show'));
    }
  }

  function hideBanner() {
    const banner = getBanner();
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => { banner.hidden = true; }, 300);
    }
  }

  function openSettings() {
    const modal = getModal();
    if (!modal) return;
    // Aktuelle Auswahl in Modal vorbefüllen
    const prefs = loadPrefs();
    const checkbox = getExternalCheckbox();
    if (checkbox) checkbox.checked = prefs ? prefs.external : false;

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('show'));
    document.body.style.overflow = 'hidden';
  }

  function closeSettings() {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => { modal.hidden = true; }, 300);
    document.body.style.overflow = '';
  }

  // === External Services Loader ===
  let externalLoaded = false;

  function loadGoogleFonts() {
    if (document.getElementById('google-fonts-stylesheet')) return;
    const link = document.createElement('link');
    link.id = 'google-fonts-stylesheet';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);

    // Preconnect to gstatic
    if (!document.getElementById('gstatic-preconnect')) {
      const pre = document.createElement('link');
      pre.id = 'gstatic-preconnect';
      pre.rel = 'preconnect';
      pre.href = 'https://fonts.gstatic.com';
      pre.crossOrigin = 'anonymous';
      document.head.appendChild(pre);
    }
  }

  function loadReonic() {
    if (document.getElementById('reonic-loader-script')) return;

    // Mount-Container sichtbar machen + Reonic-Element einfügen
    const mount = document.getElementById('reonicMount');
    const placeholder = document.getElementById('reonicPlaceholder');
    if (mount && !mount.querySelector('[data-reonic-type]')) {
      const reonicEl = document.createElement('div');
      reonicEl.setAttribute('data-reonic-type', 'element');
      reonicEl.setAttribute('data-product', 'energyhouse');
      reonicEl.setAttribute('data-client-id', 'fe3bac02-83eb-4b1a-94f8-f54f8a98f5f4');
      mount.appendChild(reonicEl);
    }
    if (placeholder) placeholder.hidden = true;
    if (mount) mount.hidden = false;

    const script = document.createElement('script');
    script.id = 'reonic-loader-script';
    script.src = 'https://apps.reonic.de/elements/reonic-loader.js';
    script.defer = true;
    document.body.appendChild(script);
  }

  function applyExternal(allowed) {
    if (allowed && !externalLoaded) {
      loadGoogleFonts();
      loadReonic();
      externalLoaded = true;
    }
  }

  // === Public Actions ===
  function acceptAll() {
    savePrefs({ external: true });
    applyExternal(true);
    hideBanner();
    closeSettings();
  }

  function acceptNecessary() {
    savePrefs({ external: false });
    hideBanner();
    closeSettings();
  }

  function saveSelection() {
    const checkbox = getExternalCheckbox();
    const external = checkbox ? checkbox.checked : false;
    savePrefs({ external });
    if (external) applyExternal(true);
    hideBanner();
    closeSettings();
  }

  // Wenn der Reonic-Platzhalter-Button geklickt wird, externe Dienste aktivieren
  function enableExternalAndReload() {
    savePrefs({ external: true });
    applyExternal(true);
    hideBanner();
  }

  // === Init ===
  function init() {
    const prefs = loadPrefs();
    if (prefs === null) {
      // Noch keine Entscheidung → Banner zeigen
      showBanner();
    } else {
      // Gespeicherte Auswahl anwenden
      applyExternal(prefs.external);
    }

    // Escape-Taste schließt Modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = getModal();
        if (modal && !modal.hidden) closeSettings();
      }
    });
  }

  // Auto-Init beim DOM-Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    openSettings,
    closeSettings,
    acceptAll,
    acceptNecessary,
    saveSelection,
    enableExternalAndReload
  };
})();

// Global verfügbar machen
window.ConsentManager = ConsentManager;
