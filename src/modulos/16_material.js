/* ==== módulo: material ==== */
// Editor de material: agrega un material propio o una licencia de otra empresa (con la opción de cargar una obra
// famosa de los hitos del arte), edita lo tuyo y retoca los temas, personajes y sinopsis de las obras libres para tus
// adaptaciones. Se abre desde Obras › Crear obra › Usar material y desde el Editor Sandbox.
ART.materialUI = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, X = ART.taxonomia, U = ART.ui, t = ART.t, esc = N.esc, ac = U.accion;
  const dinero = U.dinero, icono = U.icono;
  let ed = null; // { id, libre (obra de dominio público), d: datos }
  function M() { return ART.metas; }
  function chip(txt, a, v, on, des) { return '<button class="chip' + (on ? ' on' : '') + '" data-a="' + a + '" data-v="' + esc(v) + '"' + (des ? ' disabled' : '') + '>' + esc(txt) + '</button>'; }
  function campo(nombre, html, extra) { return '<label class="campo' + (extra ? ' ' + extra : '') + '"><span>' + nombre + '</span>' + html + '</label>'; }
  function generos() { return D.familias.reduce(function (a, f) { return a.concat(f.generos); }, []).sort(function (a, b) { return a.localeCompare(b, 'es'); }); }
  function formulario() {
    const d = ed.d, nuevo = !ed.id, libre = ed.libre, a = N.anio();
    let h = '<div class="fila entre"><h2>' + (nuevo ? 'Agregar material' : 'Editar material') + '</h2><button class="ico" data-a="cerrarModal" aria-label="' + t('cerrar') + '">' + icono('cerrar') + '</button></div>';
    h += '<p class="nota info">' + (nuevo ? 'Agrega un material propio o uno con licencia (por ejemplo, un universo de personajes de otra empresa). Con licencia pagas los derechos una vez.' :
      libre ? 'Es de dominio público: puedes cambiar sus temas, personajes y sinopsis para tus adaptaciones.' : 'Cambia lo que quieras: se usa en tus próximas adaptaciones.') + '</p>';
    const obras = nuevo ? ART.hitosArte.obrasHasta(a) : [];
    const en = ART.idioma && ART.idioma.actual() === 'en';
    if (obras.length) h += campo('¿Es tu contenido un hito histórico?', '<select data-c="mtHito" data-fijo="' + (en ? '1' : '') + '"><option value="">' + (en ? '— no —' : '— no —') + '</option>' + obras.map(function (x) { return '<option value="' + x.i + '"' + (ed.hito === x.i ? ' selected' : '') + '>' + x.h[0] + ' · ' + esc(en && x.o.titEN ? x.o.titEN : x.o.tit) + '</option>'; }).join('') + '</select>');
    const fijo = libre ? ' disabled' : '';
    h += campo('Título', '<input type="text" maxlength="60" data-c="mtCampo" data-k="tit" value="' + esc(d.tit) + '"' + fijo + '>');
    h += campo('Autor o dueño', '<input type="text" maxlength="50" data-c="mtCampo" data-k="autor" value="' + esc(d.autor) + '"' + fijo + '>');
    h += '<div class="fila" style="flex-wrap:nowrap">' + campo('Año', '<input type="number" data-c="mtCampo" data-k="anio" value="' + esc(d.anio) + '"' + fijo + '>', 'crece') +
      campo('Tipo', '<select data-c="mtCampo" data-k="tipo"' + fijo + '>' + M().TIPOS_MATERIAL.map(function (x) { return '<option' + (x === d.tipo ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select>', 'crece') + '</div>';
    if (nuevo) {
      h += '<label class="campo"><span>¿De quién es?</span></label><div class="chips">' + chip('Es mío: lo inventé', 'mtLic', '0', !d.lic) + chip('Licencia de otra empresa', 'mtLic', '1', d.lic) + '</div>';
      h += campo('Fama del material: <b id="mtFama">' + d.fama + '</b>' + (d.lic ? '' : ' (lo propio empieza poco conocido: hasta 40)'), '<input type="range" min="10" max="' + (d.lic ? 100 : 40) + '" value="' + d.fama + '" data-i="mtFama" data-c="mtCampo" data-k="fama">', 'rango');
      if (d.lic) h += '<p class="nota">Derechos: <b id="mtPrecio">' + (N.S.sandbox ? 'gratis con el Editor' : dinero(M().precioLicencia(d.fama))) + '</b> · más fama, más público y más caro</p>';
    }
    if (!libre) h += '<label class="campo"><span>Géneros (hasta 3)</span></label><div class="chips">' + generos().map(function (g) { const on = d.gen.indexOf(g) >= 0; return chip(g, 'mtGen', g, on, !on && d.gen.length >= 3); }).join('') + '</div>';
    h += '<label class="campo"><span>Temas y tópicos (hasta 9) · ' + d.tem.length + ' elegidos</span></label>' + X.familiasTema.map(function (f) {
      const n = f.items.filter(function (x) { return d.tem.indexOf(x) >= 0; }).length;
      return '<details' + (n ? ' open' : '') + '><summary class="tenue">' + esc(f.nombre) + (n ? ' · ' + n : '') + '</summary><div class="chips" style="margin:6px 0">' + f.items.map(function (x) { return chip(x, 'mtTema', x, d.tem.indexOf(x) >= 0); }).join('') + '</div></details>';
    }).join('');
    h += campo('Personajes (uno por línea; agrega «:F» o «:M» si quieres)', '<textarea rows="5" data-c="mtCampo" data-k="pjs">' + esc(d.pjs) + '</textarea>');
    h += campo('Sinopsis', '<textarea rows="3" maxlength="400" data-c="mtCampo" data-k="sin">' + esc(d.sin) + '</textarea>');
    h += '<div class="fila entre" style="margin-top:10px">' + (ed.id && !libre && !d.lic ? '<button class="btn peligro" data-a="mtBorrar">Borrar</button>' : '<button class="btn" data-a="cerrarModal">' + t('cancelar') + '</button>') +
      '<button class="btn primario" data-a="mtGuardar">' + icono('guardar') + (nuevo ? (d.lic ? 'Comprar derechos y agregar' : 'Agregar') : 'Guardar') + '</button></div>';
    return h;
  }
  function redibujar() { const c = document.querySelector('#modal .caja'), y = c ? c.scrollTop : 0; U.modal(formulario()); const c2 = document.querySelector('#modal .caja'); if (c2) c2.scrollTop = y; }
  function textoPjs(l) { return (l || []).map(function (p) { return typeof p === 'string' ? p : p.n + (p.s === 'F' ? ':F' : ''); }).join('\n'); }
  function nuevo() { ed = { id: null, libre: false, d: { tit: '', autor: '', anio: N.anio(), tipo: 'Novela', gen: [], tem: [], pjs: '', sin: '', lic: 0, fama: 30 } }; U.modal(formulario()); }
  function editar(id) {
    const m = X.material(id);
    if (!m) return;
    const libre = X.dominio.some(function (x) { return x.id === id; }), c = X.canon(m), ret = N.S.edit && N.S.edit.pdo && N.S.edit.pdo[id];
    ed = { id: id, libre: libre, d: { tit: m.tit, autor: m.autor, anio: m.anio, tipo: m.tipo || 'Novela', gen: (m.gen || []).slice(), tem: ((ret && ret.tem) || m.tem || []).slice(),
      pjs: c ? textoPjs(c.pj) : textoPjs(m.pjs || m.pers), sin: c ? c.sin : m.sin || '', lic: m.lic || 0, fama: Math.round((m.fama || 0.3) * 100) } };
    U.modal(formulario());
  }
  function refrescarDespues() { if (ART.creacion && ART.creacion.estado.etapa === 'material' && U.fichaAbierta()) ART.creacion.refrescar(); else U.refrescar(); }
  ac('mtNuevo', nuevo);
  ac('mtEditar', function (v) { editar(v); });
  ac('mtCampo', function (v, el) {
    const k = el.getAttribute('data-k');
    ed.d[k] = k === 'fama' ? Math.round(+v) : v;
    if (k === 'tipo') redibujar();
  });
  ac('mtFama', function (v) {
    const b = document.getElementById('mtFama'); if (b) b.textContent = v;
    const p = document.getElementById('mtPrecio'); if (p && !N.S.sandbox) p.textContent = dinero(M().precioLicencia(+v));
  });
  ac('mtLic', function (v) { ed.d.lic = +v; if (!ed.d.lic) ed.d.fama = Math.min(40, ed.d.fama); redibujar(); });
  ac('mtGen', function (v) { const l = ed.d.gen, i = l.indexOf(v); if (i >= 0) l.splice(i, 1); else if (l.length < 3) l.push(v); redibujar(); });
  ac('mtTema', function (v) { const l = ed.d.tem, i = l.indexOf(v); if (i >= 0) l.splice(i, 1); else if (l.length < 9) l.push(v); else { U.aviso('Hasta 9 temas', 'mal'); return; } redibujar(); });
  ac('mtHito', function (v) {
    if (v === '') { ed.hito = null; return; }
    const o = ART.hitosArte.obra(+v);
    if (!o) return;
    const en = ART.idioma && ART.idioma.actual() === 'en';
    Object.assign(ed.d, { tit: en && o.titEN ? o.titEN : o.tit, autor: o.autor, anio: o.anio, tipo: M().TIPOS_MATERIAL.indexOf(o.tipo) >= 0 ? o.tipo : 'Novela', gen: o.gen.filter(function (g) { return D.familiaDe[g]; }).slice(0, 3), lic: 1, fama: 90, sin: en && o.sinEN ? o.sinEN : o.sin });
    ed.hito = +v;
    U.aviso('Hito histórico cargado: revisa y agrega');
    redibujar();
  });
  ac('mtGuardar', function () {
    const e = M().guardarMaterial(ed.d, ed.id);
    if (e) { U.aviso(e, 'mal'); return; }
    U.cerrarModal(); U.aviso(ed.id ? 'Material actualizado' : 'Material agregado: ya puedes adaptarlo');
    refrescarDespues();
  });
  ac('mtBorrar', function () { const e = M().borrarMaterial(ed.id); if (e) { U.aviso(e, 'mal'); return; } U.cerrarModal(); U.aviso('Material borrado'); refrescarDespues(); });
  // Tarjeta de «Tus materiales» para la pantalla Usar material
  function tarjetaPropios() {
    const l = (N.S.edit && N.S.edit.mat) || [];
    return '<div class="tarjeta"><div class="fila entre"><h3>Tus materiales y derechos (' + l.length + ')</h3><button class="btn primario" data-a="mtNuevo">' + icono('mas') + 'Agregar material</button></div>' +
      (l.length ? l.map(function (m) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(m.tit) + '</b><span class="tenue chico">' + esc((m.tipo || 'Material') + ' · ' + m.autor + ' · ' + m.anio + (m.lic ? ' · licencia' : ' · propio')) + '</span></div><button class="btn" data-a="mtEditar" data-v="' + esc(m.id) + '">Editar</button></div>'; }).join('')
        : '<p class="nota">Agrega material propio o con licencia, y edita temas, personajes y sinopsis de cualquiera.</p>') + '</div>';
  }
  return { nuevo: nuevo, editar: editar, tarjetaPropios: tarjetaPropios };
})();
