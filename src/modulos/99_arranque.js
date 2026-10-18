/* ==== módulo: arranque ==== */
// Arranca el juego: ajustes, eventos, portada y autoguardado al salir. Si algo falla, lo dice en pantalla.
(function () {
  'use strict';
  function iniciar() {
    IA.ui.cargarAjustes();
    IA.ui.enlazar();
    IA.ui.render();
    IA.publicacion.alAbrir(); // un solo anuncio al abrir, solo en la app gratuita de Android
    // Guardado automático al ocultar la app (sin avisos de "cambios sin guardar")
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && IA.pantallas.detenerAuto) { IA.pantallas.detenerAuto(); if (IA.n.S) IA.ui.renderBarra(); }
      if (document.hidden && IA.n.S && !IA.n.S.bot && !IA.n.S.quiebra && IA.ui.ajustes().autoguardado !== 'no') IA.guardado.autoguardar();
    });
    window.addEventListener('error', function (e) {
      if (IA.ui && IA.ui.aviso) IA.ui.aviso('Error: ' + (e.message || 'desconocido'), 'mal');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
