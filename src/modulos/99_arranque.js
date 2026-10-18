/* ==== módulo: arranque ==== */
// Arranca el juego: ajustes, eventos, portada y autoguardado al salir. Si algo falla, lo dice en pantalla.
(function () {
  'use strict';
  function iniciar() {
    ART.ui.cargarAjustes();
    ART.ui.enlazar();
    ART.ui.render();
    ART.publicacion.alAbrir(); // un solo anuncio al abrir, solo en la app gratuita de Android
    // Guardado automático al ocultar la app (sin avisos de "cambios sin guardar")
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && ART.pantallas.detenerAuto) { ART.pantallas.detenerAuto(); if (ART.n.S) ART.ui.renderBarra(); }
      if (document.hidden && ART.n.S && !ART.n.S.bot && !ART.n.S.quiebra && ART.ui.ajustes().autoguardado !== 'no') ART.guardado.autoguardar();
    });
    window.addEventListener('error', function (e) {
      if (ART.ui && ART.ui.aviso) ART.ui.aviso('Error: ' + (e.message || 'desconocido'), 'mal');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
