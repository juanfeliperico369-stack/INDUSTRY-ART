const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 1200 } });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(800);
  const res = await p.evaluate(async () => {
    const set = new Set();
    const juntar = () => { ['vista', 'ficha', 'modal', 'barra', 'menu'].forEach(id => { const w = document.createTreeWalker(document.getElementById(id), NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const s = n.nodeValue.trim(); if (s.length > 2 && /[a-záéíóúñ]{3}/i.test(s)) set.add(s); } document.getElementById(id).querySelectorAll('[aria-label],[title],[placeholder]').forEach(e => ['aria-label', 'title', 'placeholder'].forEach(a => { const v = e.getAttribute(a); if (v && v.length > 2) set.add(v.trim()); })); }); };
    for (const anio of [1850, 1925, 1995, 2060]) {
      ART.juego.nuevaPartida({ semilla: 'en' + anio, anio: anio, nombre: 'Lang', avatar: { nombre: 'Me' } });
      const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 80; i++) { P.decidir(est); ART.juego.avanzarSemana(); }
      const U = ART.ui, A = U.acciones; U.render(); juntar(); U.cerrarModal();
      for (const s of ['estudio', 'obras', 'talento', 'mundo', 'negocio']) { U.irA(s); for (const u of Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v'))) { U.irA(s, u); juntar(); } }
      for (const med of ['cine', 'tv', 'musica', 'juegos', 'teatro', 'libros']) { try { A.crearObra(med); juntar(); A.crCamino('nueva'); for (let i = 0; i < 14; i++) { try { A.crTab(String(i)); juntar(); } catch (e) {} } for (const tb of ['idea', 'historia', 'publico', 'personajes', 'arte', 'produccion', 'equipo', 'resumen']) { try { A.mdTab(tb); juntar(); } catch (e) {} } } catch (e) {} U.cerrarModal(); U.cerrarFicha(); }
      A.abrirAjustes(); juntar(); U.cerrarModal(); A.verPrivacidad(); juntar(); U.cerrarModal();
      const o = ART.n.S.obras.filter(o => o.est === 0 && o.et === 'terminada')[0]; if (o) { A.verObra(String(o.id)); juntar(); U.cerrarFicha(); }
      A.verTalento(String(ART.n.S.talentos[3].id)); juntar(); U.cerrarFicha();
    }
    await ART.idioma.poner('en'); await new Promise(r => setTimeout(r, 1500));
    const ES = /\b(de|del|las|los|que|para|con|una|obras?|semanas?|años?|tus|está|más|según|cuando|hasta|también|sin|pero|por|cada|como|sus|desde|entre|se|su|al|el|la|y|o|en)\b/i;
    const malas = [];
    set.forEach(s => { if (/^[«“"].*[»”"]$/.test(s)) return; const e = ART.idioma.texto(s); if (ES.test(e) && e.split(' ').length > 1) malas.push([s, e]); });
    return { total: set.size, malas };
  });
  fs.writeFileSync(process.argv[3], JSON.stringify(res.malas, null, 1)); console.log(res.total, res.malas.length); await b.close(); })();
