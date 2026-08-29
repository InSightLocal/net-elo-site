(() => {
  const STORAGE_KEY = "netelo_cookie_consent";
  const cfg = window.NET_ELO_CONFIG || {};
  let analyticsLoaded = false;

  function loadAnalytics() {
    if (analyticsLoaded || !cfg.gaMeasurementId) return;
    analyticsLoaded = true;

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.gaMeasurementId);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.gaMeasurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function setConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
    const banner = document.getElementById("cookie-banner");
    if (banner) banner.hidden = true;
    if (value === "accepted") loadAnalytics();
  }

  function initConsent() {
    const banner = document.getElementById("cookie-banner");
    if (!banner) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted") {
      banner.hidden = true;
      loadAnalytics();
      return;
    }
    if (saved === "refused") {
      banner.hidden = true;
      return;
    }

    banner.hidden = false;

    const accept = document.getElementById("cookie-accept");
    const refuse = document.getElementById("cookie-refuse");
    if (accept) accept.addEventListener("click", () => setConsent("accepted"));
    if (refuse) refuse.addEventListener("click", () => setConsent("refused"));
  }

  document.addEventListener("DOMContentLoaded", initConsent);
})();
