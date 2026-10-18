/* ==== módulo: publicacion ==== */
// La 1.0 en Google Play: un solo anuncio al abrir (solo dentro de la app, con AdMob por Capacitor),
// versión gratuita o de pago según ART_CONFIG (lo pone tools/preparar_app.py al armar la app) y créditos.
// IPhone y PC: la misma app en iOS (con el permiso de rastreo de Apple) y en Windows, macOS y Linux (Electron, sin anuncios).
// Antes del anuncio se pide el consentimiento que exige Google en Europa (UMP); en Ajustes queda «Privacidad de los anuncios».
// Compra única «Versión completa» (Google Play y App Store) que solo quita el anuncio; el juego es el mismo para todos.
// La compra se consulta a la tienda cada vez que se abre la app (un reembolso la quita); sin internet vale la última respuesta.
// En el navegador y en PC no hay anuncios ni compras.
ART.publicacion = (function () {
  'use strict';
  // Identificadores de prueba de Google (no pagan); los reales llegan por app/config.json
  const BASE = {
    modo: 'gratis', anuncioAlAbrir: true, compra: 'version_completa',
    admob: {
      prueba: true,
      android: { app: 'ca-app-pub-3940256099942544~3347511713', intersticial: 'ca-app-pub-3940256099942544/1033173712' },
      ios: { app: 'ca-app-pub-3940256099942544~1458002511', intersticial: 'ca-app-pub-3940256099942544/4411468910' }
    }
  };
  const NOMBRES = { android: 'Android', ios: 'iPhone', pc: 'PC', web: 'Web' };
  let privacidad = false; // el usuario puede cambiar su consentimiento (lo dice Google al pedirlo)
  const CLAVE_COMPRA = 'industryart_completa';
  let completa = leerCompra(), precioTexto = '';
  function leerCompra() { try { return localStorage.getItem(CLAVE_COMPRA) === 'si'; } catch (e) { return false; } }
  function anotarCompra(si) { completa = !!si; try { if (si) localStorage.setItem(CLAVE_COMPRA, 'si'); else localStorage.removeItem(CLAVE_COMPRA); } catch (e) { /* sin almacenamiento: vale la sesión */ } }
  function config() {
    const c = (typeof window !== 'undefined' && (window.ART_CONFIG || window.IA_CONFIG)) || {}, a = c.admob || {};
    return Object.assign({}, BASE, c, { admob: { prueba: a.prueba !== undefined ? a.prueba : BASE.admob.prueba,
      android: Object.assign({}, BASE.admob.android, a.android), ios: Object.assign({}, BASE.admob.ios, a.ios) } });
  }
  function enApp() { return typeof window !== 'undefined' && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
  function plataforma() {
    if (enApp()) return window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    if (typeof window !== 'undefined' && (window.ART_ESCRITORIO || /Electron\//.test(navigator.userAgent || ''))) return 'pc';
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
  // ---- Compra «Versión completa» ----
  function tienda() { return enApp() && window.Capacitor.Plugins ? window.Capacitor.Plugins.NativePurchases || null : null; }
  function conTiempo(p, ms) { return Promise.race([p, new Promise(function (_, no) { setTimeout(function () { no(new Error('tiempo')); }, ms); })]); }
  // Vale solo la compra de este producto ya pagada (en Android, estado «1»; un pago pendiente todavía no cuenta)
  function valida(t) { return !!t && t.productIdentifier === config().compra && (plataforma() !== 'android' || String(t.purchaseState) === '1'); }
  // Pregunta a Google Play o a la App Store qué compró esta cuenta; si la tienda no responde, queda lo último que se supo
  function revisarCompra() {
    const st = tienda();
    if (!st || config().modo === 'pago') return Promise.resolve(completa);
    return conTiempo(st.getPurchases({ productType: 'inapp', onlyCurrentEntitlements: true }), 4000)
      .then(function (r) { anotarCompra((r.purchases || []).some(valida)); return completa; })
      .catch(function () { return completa; });
  }
  function compraDisponible() { return !!tienda() && config().modo !== 'pago'; }
  function tieneCompleta() { return config().modo === 'pago' || completa; }
  function precio() {
    const st = tienda();
    if (!st) return Promise.resolve('');
    return conTiempo(st.getProduct({ productIdentifier: config().compra, productType: 'inapp' }), 4000)
      .then(function (r) { precioTexto = (r.product && r.product.priceString) || ''; return precioTexto; }).catch(function () { return precioTexto; });
  }
  function precioGuardado() { return precioTexto; }
  // Devuelve 'ok', 'pendiente', 'cancelada' o 'error'
  function comprar() {
    const st = tienda();
    if (!st) return Promise.resolve('error');
    return st.purchaseProduct({ productIdentifier: config().compra, productType: 'inapp' })
      .then(function (t) {
        if (valida(t)) { anotarCompra(true); return 'ok'; }
        return t && String(t.purchaseState) === '0' ? 'pendiente' : 'error';
      })
      .catch(function (e) { return /cancel/i.test(String(e && (e.code || e.message))) ? 'cancelada' : 'error'; });
  }
  function restaurar() {
    const st = tienda();
    if (!st) return Promise.resolve(false);
    return st.restorePurchases().catch(function () {}).then(revisarCompra);
  }
  // Un solo anuncio al abrir (versión gratuita); si algo falla, el juego sigue sin esperar
  function alAbrir() {
    return revisarCompra().then(anuncio);
  }
  function anuncio() {
    const c = config(), ad = plugin(), ids = c.admob[plataforma()];
    if (!ad || !ids || c.modo === 'pago' || !c.anuncioAlAbrir || completa) return Promise.resolve(false);
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
  // ---------- Guardar un archivo (partida, paquete o documento de la idea) ----------
  // En el navegador y en PC, una descarga normal. En la app (Android y iPhone) el visor web no descarga: el archivo se
  // escribe en la caché de la app (Filesystem) y se abre el menú Compartir para guardarlo en Archivos, Drive o el correo.
  function aBase64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    return btoa(s);
  }
  function nombreSeguro(n) { return String(n || 'archivo').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_.-]+/g, '_').slice(0, 80) || 'archivo'; }
  // Dentro de un visor web embebido no se puede descargar directo: se pide con el permiso de descargas del visor
  let descargasVisor;
  function visor() {
    if (descargasVisor === undefined) descargasVisor = typeof window !== 'undefined' && window.claude && typeof window.claude.use === 'function' ? Promise.resolve(window.claude.use('downloads')).catch(function () { return null; }) : Promise.resolve(null);
    return descargasVisor;
  }
  const EXT_VISOR = /\.(docx|txt|json|md|csv|pdf|zip|png|jpg)$/i;
  function guardarArchivo(nombre, contenido, tipo) {
    nombre = nombreSeguro(nombre);
    const bytes = typeof contenido === 'string' ? new TextEncoder().encode(contenido) : contenido;
    const listo = function (extra) { return Object.assign({ ok: true, nombre: nombre, bytes: bytes.length }, extra || {}); };
    const fallo = function (e, extra) { return Object.assign({ ok: false, nombre: nombre, error: (e && (e.message || e.code)) || String(e) }, extra || {}); };
    const cancelado = function (e) { return /cancel|declined|abort/i.test(String(e && (e.code || e.message || e.name || e))); };
    // 1. App de Android o iPhone: se escribe en la app y se abre Compartir; si eso falla, se guarda en Documentos
    const P = enApp() && window.Capacitor.Plugins;
    if (P && P.Filesystem) {
      const b64 = aBase64(bytes);
      const enDocumentos = function () {
        return P.Filesystem.writeFile({ path: 'INDUSTRY ART/' + nombre, data: b64, directory: 'DOCUMENTS', recursive: true })
          .then(function () { return listo({ ruta: 'Documentos/INDUSTRY ART/' + nombre }); });
      };
      if (!P.Share) return enDocumentos().catch(function (e) { return fallo(e); });
      return P.Filesystem.writeFile({ path: nombre, data: b64, directory: 'CACHE' })
        .then(function (r) { return P.Share.share({ title: nombre, files: [r.uri], dialogTitle: 'Guardar o compartir' }); })
        .then(function () { return listo(); }, function (e) { return cancelado(e) ? fallo(e, { cancelado: true }) : enDocumentos(); })
        .catch(function (e) { return fallo(e); });
    }
    return visor().then(function (d) {
      // 2. Visor web embebido: pide confirmación y guarda (solo ciertas extensiones: la partida va como .json)
      if (d && typeof d.save === 'function') {
        const nom = EXT_VISOR.test(nombre) ? nombre : nombre + '.json';
        return d.save({ filename: nom, data: new Blob([bytes]) }).then(function () { return listo({ nombre: nom }); }, function (e) { return cancelado(e) ? fallo(e, { cancelado: true }) : fallo(e); });
      }
      // 3. Celular: el menú Compartir del sistema (Drive, Archivos, correo) si el navegador sabe compartir archivos
      try {
        const archivo = typeof File === 'function' ? new File([bytes], nombre, { type: tipo || 'application/octet-stream' }) : null;
        const tactil = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
        if (archivo && tactil && navigator.canShare && navigator.canShare({ files: [archivo] })) {
          return navigator.share({ files: [archivo], title: nombre }).then(function () { return listo(); }, function (e) { return cancelado(e) ? fallo(e, { cancelado: true }) : descargaNormal(); });
        }
      } catch (e) { /* sin Compartir: descarga normal */ }
      return descargaNormal();
    });
    // 4. Navegador y PC: descarga normal
    function descargaNormal() {
      try {
        const url = URL.createObjectURL(new Blob([bytes], { type: tipo || 'application/octet-stream' }));
        const a = document.createElement('a');
        a.href = url; a.download = nombre; a.rel = 'noopener';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        return listo();
      } catch (e) {
        return fallo(e);
      }
    }
  }
  const CREDITOS = ['Ideado y creado por OneZero', 'Programado por Faro'];
  function creditos() { return CREDITOS.slice(); }
  return { config: config, enApp: enApp, plataforma: plataforma, nombrePlataforma: nombrePlataforma, alAbrir: alAbrir,
    privacidadDisponible: privacidadDisponible, abrirPrivacidad: abrirPrivacidad, creditos: creditos,
    revisarCompra: revisarCompra, compraDisponible: compraDisponible, tieneCompleta: tieneCompleta, precio: precio, precioGuardado: precioGuardado,
    comprar: comprar, restaurar: restaurar, guardarArchivo: guardarArchivo };
})();
