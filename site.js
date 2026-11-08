(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-navigation');
  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    nav?.classList.toggle('is-open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menuButton.focus();
    }
  });
  nav?.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', (e) => {
    if (menuButton && nav && !menuButton.contains(e.target) && !nav.contains(e.target)) closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 1151px)');
  const resetMenu = (event) => { if (event.matches) closeMenu(); };
  if (desktop.addEventListener) desktop.addEventListener('change', resetMenu);
  else desktop.addListener?.(resetMenu);

  const STORAGE_KEY = 'netelo_cookie_consent';
  const cfg = window.NET_ELO_CONFIG || {};
  const banner = document.getElementById('cookie-banner');
  let analyticsLoaded = false;
  const readConsent = () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } };
  const saveConsent = (value) => { try { localStorage.setItem(STORAGE_KEY, value); } catch { /* navigateur privé */ } };
  const showBanner = () => {
    if (!banner) return;
    banner.hidden = false;
    document.body.classList.add('cookie-open');
  };
  const hideBanner = () => {
    if (banner) banner.hidden = true;
    document.body.classList.remove('cookie-open');
  };
  const loadAnalytics = () => {
    if (analyticsLoaded || !cfg.gaMeasurementId) return;
    analyticsLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.gaMeasurementId);
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.gaMeasurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  };
  const choice = (value) => {
    const wasLoaded = analyticsLoaded;
    saveConsent(value); hideBanner();
    const status = document.getElementById('cookie-choice-status');
    if (status) status.textContent = value === 'accepted' ? 'Mesure d’audience acceptée.' : 'Mesure d’audience refusée.';
    if (value === 'accepted') loadAnalytics();
    // Si un script d'audience a déjà été chargé, recharge la page pour appliquer le refus.
    if (value === 'refused' && wasLoaded) window.location.reload();
  };
  document.getElementById('cookie-accept')?.addEventListener('click', () => choice('accepted'));
  document.getElementById('cookie-refuse')?.addEventListener('click', () => choice('refused'));
  document.querySelectorAll('[data-cookie-settings]').forEach(button => {
    button.addEventListener('click', () => {
      showBanner();
      document.getElementById('cookie-refuse')?.focus();
    });
  });
  const saved = readConsent();
  if (saved === 'accepted') { hideBanner(); loadAnalytics(); }
  else if (saved === 'refused') hideBanner();
  else showBanner();

  // Le formulaire prépare le message dans la messagerie ou le presse-papiers,
  // sans envoyer les champs à un service tiers du site.
  const form = document.getElementById('devis-form');
  const status = document.getElementById('devis-status');
  const preview = document.getElementById('devis-preview');
  const previewText = document.getElementById('devis-preview-text');
  const buildMessage = () => {
    const data = new FormData(form);
    const val = name => String(data.get(name) || '').trim();
    const rows = [
      ['Nom', val('nom')], ['E-mail', val('email')],
      ['Commune', val('commune')], ['Téléphone', val('telephone')],
      ['Prestation', val('prestation')], ['Fréquence ou volume', val('frequence')],
      ['Détails', val('message')]
    ];
    const subject = 'Demande de devis Net Elo — ' + val('prestation');
    const body = 'Bonjour Élodie,\n\nJe vous contacte pour une demande de devis.\n\n'
      + rows.map(([k,v]) => k + ' : ' + (v || 'Non précisé')).join('\n')
      + '\n\nCordialement,\n' + val('nom');
    return { subject, body };
  };
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const { subject, body } = buildMessage();
    if (status) status.textContent = 'Votre messagerie va s’ouvrir. Vérifiez puis validez l’envoi : rien ne part automatiquement.';
    window.location.href = 'mailto:net.elo@icloud.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  document.getElementById('devis-copy')?.addEventListener('click', async () => {
    if (!form?.reportValidity()) return;
    const { subject, body } = buildMessage();
    const full = 'Destinataire : net.elo@icloud.com\nObjet : ' + subject + '\n\n' + body;
    if (preview && previewText) { preview.hidden = false; previewText.value = full; }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard not available');
      await navigator.clipboard.writeText(full);
      if (status) status.textContent = 'Demande copiée. Collez-la dans votre messagerie puis envoyez-la.';
    } catch {
      previewText?.focus();
      previewText?.select();
      if (status) status.textContent = 'Texte affiché ci-dessous : copiez-le depuis la zone de texte.';
    }
  });
})();
