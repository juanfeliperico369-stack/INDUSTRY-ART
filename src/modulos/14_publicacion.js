/* ==== módulo: publicacion ==== */
// V30 · La 1.0 en Google Play: un solo anuncio al abrir (solo dentro de la app de Android, con AdMob por Capacitor),
// versión gratuita o de pago según IA_CONFIG (lo pone tools/preparar_app.py al armar la app) y créditos.
// En el navegador no hay anuncios ni restricciones.
IA.publicacion = (function () {
  'use strict';
  const BASE = { modo: 'gratis', anuncioAlAbrir: true, admob: { app: 'ca-app-pub-3940256099942544~3347511713', intersticial: 'ca-app-pub-3940256099942544/1033173712', prueba: true } };
  function config() { const c = (typeof window !== 'undefined' && window.IA_CONFIG) || {}; return Object.assign({}, BASE, c, { admob: Object.assign({}, BASE.admob, c.admob || {}) }); }
  function enApp() { return typeof window !== 'undefined' && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
  function plugin() { return enApp() && window.Capacitor.Plugins ? window.Capacitor.Plugins.AdMob : null; }
  // Un solo anuncio al abrir (versión gratuita); si no carga, el juego sigue sin esperar
  function alAbrir() {
    const c = config(), ad = plugin();
    if (!ad || c.modo === 'pago' || !c.anuncioAlAbrir) return Promise.resolve(false);
    return ad.initialize({ initializeForTesting: !!c.admob.prueba })
      .then(function () { return ad.prepareInterstitial({ adId: c.admob.intersticial, isTesting: !!c.admob.prueba }); })
      .then(function () { return ad.showInterstitial(); })
      .then(function () { return true; })
      .catch(function () { return false; });
  }
  const CREDITOS = ['Ideado y creado por Felipe', 'Programado junto a Claude, de Anthropic'];
  function creditos() { return CREDITOS.slice(); }
  return { config: config, enApp: enApp, alAbrir: alAbrir, creditos: creditos };
})();
