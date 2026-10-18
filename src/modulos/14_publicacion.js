/* ==== módulo: publicacion ==== */
// V30 · La 1.0 en Google Play: un solo anuncio al abrir (solo dentro de la app, con AdMob por Capacitor),
// versión gratuita o de pago según IA_CONFIG (lo pone tools/preparar_app.py al armar la app) y créditos.
// V31 · iPhone y PC: la misma app en iOS (con el permiso de rastreo de Apple) y en Windows, macOS y Linux (Electron, sin anuncios).
// Antes del anuncio se pide el consentimiento que exige Google en Europa (UMP); en Ajustes queda «Privacidad de los anuncios».
// En el navegador y en PC no hay anuncios ni restricciones.
IA.publicacion = (function () {
  'use strict';
  // Identificadores de prueba de Google (no pagan); los reales llegan por app/config.json
  const BASE = {
    modo: 'gratis', anuncioAlAbrir: true,
    admob: {
      prueba: true,
      android: { app: 'ca-app-pub-3940256099942544~3347511713', intersticial: 'ca-app-pub-3940256099942544/1033173712' },
      ios: { app: 'ca-app-pub-3940256099942544~1458002511', intersticial: 'ca-app-pub-3940256099942544/4411468910' }
    }
  };
  const NOMBRES = { android: 'Android', ios: 'iPhone', pc: 'PC', web: 'Web' };
  let privacidad = false; // el usuario puede cambiar su consentimiento (lo dice Google al pedirlo)
  function config() {
    const c = (typeof window !== 'undefined' && window.IA_CONFIG) || {}, a = c.admob || {};
    return Object.assign({}, BASE, c, { admob: { prueba: a.prueba !== undefined ? a.prueba : BASE.admob.prueba,
      android: Object.assign({}, BASE.admob.android, a.android), ios: Object.assign({}, BASE.admob.ios, a.ios) } });
  }
  function enApp() { return typeof window !== 'undefined' && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
  function plataforma() {
    if (enApp()) return window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    if (typeof window !== 'undefined' && (window.IA_ESCRITORIO || /Electron\//.test(navigator.userAgent || ''))) return 'pc';
    return 'web';
  }
  function nombrePlataforma() { return NOMBRES[plataforma()]; }
  function plugin() { return enApp() && window.Capacitor.Plugins ? window.Capacitor.Plugins.AdMob || null : null; }
  // Consentimiento de Google (UMP): solo se muestra donde la ley lo pide; si no se puede pedir anuncios, no hay anuncio
  function consentir(ad) {
    return ad.requestConsentInfo().then(function (info) {
      if (info.status === 'REQUIRED' && info.isConsentFormAvailable) return ad.showConsentForm();
      return info;
    }).then(function (info) {
      privacidad = info.privacyOptionsRequirementStatus === 'REQUIRED';
      return info.canRequestAds !== false;
    });
  }
  // iPhone: Apple pide permiso antes de usar el identificador de publicidad (si dice que no, el anuncio sale igual, sin rastreo)
  function rastreo(ad) {
    if (plataforma() !== 'ios') return Promise.resolve();
    return ad.trackingAuthorizationStatus().then(function (r) { return r.status === 'notDetermined' ? ad.requestTrackingAuthorization() : null; });
  }
  // Un solo anuncio al abrir (versión gratuita); si algo falla, el juego sigue sin esperar
  function alAbrir() {
    const c = config(), ad = plugin(), ids = c.admob[plataforma()];
    if (!ad || !ids || c.modo === 'pago' || !c.anuncioAlAbrir) return Promise.resolve(false);
    return ad.initialize({ initializeForTesting: !!c.admob.prueba })
      .then(function () { return consentir(ad); })
      .then(function (puede) {
        if (!puede) return false;
        return rastreo(ad)
          .then(function () { return ad.prepareInterstitial({ adId: ids.intersticial, isTesting: !!c.admob.prueba }); })
          .then(function () { return ad.showInterstitial(); })
          .then(function () { return true; });
      })
      .catch(function () { return false; });
  }
  function privacidadDisponible() { return privacidad && !!plugin(); }
  function abrirPrivacidad() { const ad = plugin(); return ad ? ad.showPrivacyOptionsForm().catch(function () {}) : Promise.resolve(); }
  const CREDITOS = ['Ideado y creado por Felipe', 'Programado junto a Claude, de Anthropic'];
  function creditos() { return CREDITOS.slice(); }
  return { config: config, enApp: enApp, plataforma: plataforma, nombrePlataforma: nombrePlataforma, alAbrir: alAbrir,
    privacidadDisponible: privacidadDisponible, abrirPrivacidad: abrirPrivacidad, creditos: creditos };
})();
