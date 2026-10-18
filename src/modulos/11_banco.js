/* ==== módulo: banco ==== */
// V24 · Banco por escalones de prestigio con puntaje de crédito; préstamos con cuota mensual; cuentas por pagar
// con pago automático (y atrasos que cuestan); deuda semilla según la región y la dificultad; socio que toma parte
// del control y opina en lo grande; paciencia de la junta o del socio; quiebra con tres salidas (terminar, rescate
// o socio); inversiones en compañías inventadas que suben y bajan; estado anual (balance) y cambio de marca.
IA.banco = (function () {
  'use strict';
  const N = IA.n;
  const tip = function () { return IA.economia.presupuestoTipico(N.anio()); };
  const din = function (x) { return IA.ui && IA.ui.dinero ? IA.ui.dinero(x) : '$' + Math.round(x); };
  const ESCALONES = [
    { nombre: 'Caja de ahorros del barrio', fama: 0, limite: 2, tasa: 0.12 },
    { nombre: 'Banco regional', fama: 0.15, limite: 6, tasa: 0.09 },
    { nombre: 'Banco nacional', fama: 0.35, limite: 15, tasa: 0.07 },
    { nombre: 'Banca internacional', fama: 0.6, limite: 40, tasa: 0.05 },
  ];
  const COMPANIAS = [
    { id: 'tren', nombre: 'Ferrocarriles del Norte', desde: 1850, hasta: 1960, mu: 0.03, vol: 0.12 }, { id: 'tel', nombre: 'Telégrafos Unidos', desde: 1850, hasta: 1940, mu: 0.02, vol: 0.1 },
    { id: 'acero', nombre: 'Acero Cóndor', desde: 1880, hasta: 2150, mu: 0.03, vol: 0.15 }, { id: 'petro', nombre: 'Petróleos Atalaya', desde: 1905, hasta: 2070, mu: 0.05, vol: 0.22 },
    { id: 'radio', nombre: 'Radio Faro', desde: 1920, hasta: 1990, mu: 0.06, vol: 0.2 }, { id: 'elec', nombre: 'Electrónica Kumo', desde: 1950, hasta: 2150, mu: 0.07, vol: 0.25 },
    { id: 'red', nombre: 'Red Prisma', desde: 1995, hasta: 2150, mu: 0.09, vol: 0.35 }, { id: 'nube', nombre: 'Nube Austral', desde: 2005, hasta: 2150, mu: 0.08, vol: 0.3 },
    { id: 'robot', nombre: 'Robótica Ámbar', desde: 2025, hasta: 2150, mu: 0.08, vol: 0.32 }, { id: 'orbita', nombre: 'Vía Orbital', desde: 2070, hasta: 2150, mu: 0.07, vol: 0.3 },
  ];
  const SOCIOS = ['Grupo Inversor Alameda', 'Capital Horizonte', 'Fondo Tres Ríos', 'Inversiones Brújula', 'Familia Valdés-Orón'];
  function st() {
    const S = N.S;
    if (!S.banco) S.banco = { deudas: [], cuentas: [], atrasos: 0, pagados: 0, acc: {}, precios: {}, junta: 70 };
    return S.banco;
  }
  function deuda() { return st().deudas.reduce(function (s, d) { return s + d.saldo; }, 0); }
  function puntaje() {
    const S = N.S, est = S.estudios[0], b = st(), t = tip();
    const p = 300 + est.fama * 260 + Math.min(150, Math.max(-100, est.caja / t * 8)) - deuda() / t * 12 - b.atrasos * 35 + Math.min(80, b.pagados * 2) - (S.quiebras || 0) * 60;
    return Math.round(N.limitar(p, 300, 850));
  }
  function escalon() { const f = N.S.estudios[0].fama; let e = ESCALONES[0]; ESCALONES.forEach(function (x) { if (f >= x.fama) e = x; }); return e; }
  function limite() { return Math.max(0, Math.round(escalon().limite * tip() * (puntaje() - 300) / 400 - deuda())); }
  function tasa() { return N.redondear(escalon().tasa + (700 - puntaje()) / 2500, 4); }
  function cuota(monto, tasaA, meses) { const r = tasaA / 12; return Math.round(r ? monto * r / (1 - Math.pow(1 + r, -meses)) : monto / meses); }
  function pedir(monto, meses, motivo) {
    const S = N.S, b = st();
    monto = Math.round(+monto || 0); meses = Math.round(N.limitar(+meses || 24, 6, 120));
    if (monto <= 0) return 'Elige un monto.';
    if (!motivo && monto > limite()) return 'El banco solo te presta hasta ' + din(limite()) + '.';
    if (!motivo && puntaje() < 420) return 'Tu puntaje de crédito es muy bajo.';
    const ta = motivo === 'rescate' ? tasa() + 0.06 : motivo === 'semilla' ? escalon().tasa : tasa();
    const d = { id: N.sigId(), banco: motivo === 'semilla' ? 'Deuda semilla' : motivo === 'rescate' ? 'Rescate bancario' : escalon().nombre, capital: monto, saldo: monto, tasa: ta, cuota: cuota(monto, ta, meses), meses: meses, t0: S.t };
    b.deudas.push(d);
    if (motivo !== 'semilla') IA.negocio.cobrarEn(0, 'prestamo', monto); // el préstamo no es ingreso: es capital y no paga impuestos (V34)
    return '';
  }
  function prepagar(id, monto) {
    const S = N.S, d = st().deudas.filter(function (x) { return x.id === +id; })[0];
    if (!d) return 'No existe.';
    const m = Math.min(d.saldo, Math.round(+monto || d.saldo));
    if (S.estudios[0].caja < m) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'amortizacion', m); d.saldo -= m;
    if (d.saldo <= 0) st().deudas = st().deudas.filter(function (x) { return x !== d; });
    return '';
  }
  // Cuentas por pagar: las cuotas y los gastos fijos de sedes y filiales, con pago automático cada mes
  function agregarCuenta(txt, monto, meses) { st().cuentas.push({ id: N.sigId(), txt: txt, monto: Math.round(monto), meses: meses || 1 }); }
  function cuentasDelMes() {
    const b = st();
    return b.deudas.map(function (d) { return { txt: 'Cuota de ' + d.banco, monto: Math.min(d.cuota, Math.round(d.saldo * (1 + d.tasa / 12))), d: d }; }).concat(b.cuentas);
  }
  function mensual() {
    const S = N.S, b = st(), est = S.estudios[0];
    cuentasDelMes().forEach(function (c) {
      if (est.caja >= c.monto || c.d && est.caja > -tip()) {
        // V34: el interés es gasto (baja la utilidad); el capital que se devuelve no lo es
        if (c.d) { const interes = Math.min(c.monto, Math.round(c.d.saldo * c.d.tasa / 12)); IA.negocio.pagar(0, 'deuda', interes); IA.negocio.pagar(0, 'amortizacion', c.monto - interes); c.d.saldo = Math.max(0, c.d.saldo - (c.monto - interes)); b.pagados++; }
        else { IA.negocio.pagar(0, 'personal', c.monto); }
      } else {
        b.atrasos++; b.junta = Math.max(0, b.junta - 5);
        if (c.d) c.d.saldo = Math.round(c.d.saldo * 1.05);
        N.emit('noticia', { tipo: 'negocio', texto: 'Atraso en «' + c.txt + '»: recargo y baja tu puntaje de crédito.', importante: true });
      }
      if (!c.d && --c.meses <= 0) b.cuentas = b.cuentas.filter(function (x) { return x !== c; });
    });
    b.deudas = b.deudas.filter(function (d) { return d.saldo > 0; });
    // La junta (o el socio) mira el mes
    const ult = S.fin.meses[S.fin.meses.length - 1];
    if (ult) b.junta = Math.round(N.limitar(b.junta + (ult.ing >= ult.gas ? 2 : -3), 0, 100));
    if (b.junta <= 0) ultimatum();
    precios();
  }
  // ---------- Socio y junta ----------
  function socio() { return N.S.socio || null; }
  function entraSocio(aporte, parte, nom) {
    const S = N.S;
    if (S.socio) { S.socio.parte = N.redondear(Math.min(0.49, S.socio.parte + parte), 3); S.socio.aporte += aporte; }
    else S.socio = { nom: nom || N.elegir(SOCIOS), parte: N.redondear(Math.min(0.49, parte), 3), aporte: aporte, t0: S.t };
    IA.negocio.cobrarEn(0, 'aportes', aporte); // capital: no es ingreso del año (V34)
    st().junta = 50;
    N.emit('noticia', { tipo: 'negocio', texto: S.socio.nom + ' entra como socio con el ' + Math.round(S.socio.parte * 100) + ' % del estudio.', importante: true });
  }
  function ultimatum() {
    const b = st(), S = N.S;
    if (S.socio) { S.socio.parte = N.redondear(Math.min(0.49, S.socio.parte + 0.1), 3); N.emit('noticia', { tipo: 'negocio', texto: 'Tu socio pierde la paciencia y se queda con más control del estudio.', importante: true }); }
    else entraSocio(Math.round(tip() * 1.5), 0.2);
    b.junta = 40;
  }
  // El socio opina en lo grande: los gastos de más de 2 presupuestos típicos le cuestan paciencia (y con poca, los veta)
  function opinar(monto, que) {
    const S = N.S, b = st();
    if (!S.socio || monto < tip() * 2) return '';
    if (b.junta < 25) return S.socio.nom + ' veta ' + que + ': primero recupera su confianza.';
    b.junta = Math.max(0, b.junta - Math.round(monto / tip()));
    return '';
  }
  function valorEstudio() { const S = N.S, est = S.estudios[0]; return Math.max(tip(), Math.round(est.caja + (est.valorObras || 0) * tip() + valorInversiones() - deuda())); }
  function recomprar() {
    const S = N.S;
    if (!S.socio) return 'No tienes socio.';
    const p = Math.round(valorEstudio() * S.socio.parte * 1.2);
    if (S.estudios[0].caja < p) return 'Necesitas ' + din(p) + '.';
    IA.negocio.pagar(0, 'recompra', p);
    N.emit('noticia', { tipo: 'negocio', texto: 'Recompras la parte de ' + S.socio.nom + ': el estudio vuelve a ser solo tuyo.', importante: true });
    S.socio = null;
    return '';
  }
  // Dividendos del socio al cerrar el año
  function anual(util) {
    const S = N.S;
    if (S.socio && util > 0) { const d = Math.round(util * 0.75 * S.socio.parte); IA.negocio.pagar(0, 'socio', d); }
    // Dividendos de las inversiones (2 % del valor)
    Object.keys(st().acc).forEach(function (id) { const v = valorAccion(id); if (v > 0) IA.negocio.cobrarEn(0, 'inversiones', Math.round(v * 0.02)); });
  }
  // ---------- Quiebra: tres salidas ----------
  function salidasQuiebra() {
    const S = N.S, hueco = Math.max(0, -S.estudios[0].caja);
    return [
      { id: 'terminar', nombre: 'Terminar la partida', texto: 'El estudio cierra. Puedes cargar otra partida.' },
      { id: 'rescate', nombre: 'Rescate bancario', texto: 'El banco cubre el hueco y te presta ' + din(hueco + tip() * 2) + ' más caro. Baja tu prestigio.', ok: puntaje() >= 380 || !(S.rescatesJ > 0) },
      { id: 'socio', nombre: 'Buscar un socio', texto: 'Un inversionista pone ' + din(hueco + tip() * 3) + ' a cambio del 35 % del estudio.', ok: !S.socio || S.socio.parte < 0.45 },
    ];
  }
  function salir(id) {
    const S = N.S;
    if (!S.quiebra) return 'No estás en quiebra.';
    const op = salidasQuiebra().filter(function (x) { return x.id === id; })[0];
    if (!op || op.ok === false) return 'Esa salida no está disponible.';
    if (id === 'terminar') { S.quiebra.fin = 1; return ''; }
    const hueco = Math.max(0, -S.estudios[0].caja);
    if (id === 'rescate') { pedir(hueco + Math.round(tip() * 2), 60, 'rescate'); S.estudios[0].fama = N.redondear(Math.max(0.01, S.estudios[0].fama - 0.05), 3); S.rescatesJ = (S.rescatesJ || 0) + 1; }
    else entraSocio(hueco + Math.round(tip() * 3), 0.35);
    S.quiebras = (S.quiebras || 0) + 1;
    S.quiebra = null; S.semanasEnRojo = 0;
    N.emit('noticia', { tipo: 'negocio', texto: 'El estudio se salva de la quiebra (' + op.nombre.toLowerCase() + ').', importante: true });
    return '';
  }
  // ---------- Inversiones ----------
  function companias() { const a = N.anio(); return COMPANIAS.filter(function (c) { return c.desde <= a && c.hasta >= a; }); }
  function precio(id) { const p = st().precios[id]; return p === undefined ? 100 : p; }
  function precios() {
    const b = st(), crisis = IA.historia.factorMercado('nam');
    COMPANIAS.forEach(function (c) {
      if (c.desde > N.anio()) return;
      let p = precio(c.id);
      if (c.hasta < N.anio()) { p = Math.max(1, p * 0.85); } // compañía en decadencia
      else p = p * Math.exp(c.mu / 12 - c.vol * c.vol / 24 + c.vol / Math.sqrt(12) * N.normal(0, 1) + (crisis < 0.95 ? -0.03 : 0));
      b.precios[c.id] = N.redondear(N.limitar(p, 1, 1e6), 2);
    });
  }
  function valorAccion(id) { const a = st().acc[id]; return a ? Math.round(a.n * precio(id) * IA.mundo.aEpoca(1, N.anio()) * 1000) / 1000 : 0; }
  function valorInversiones() { return Object.keys(st().acc).reduce(function (s, id) { return s + valorAccion(id); }, 0); }
  function comprarAccion(id, monto) {
    const S = N.S, b = st(), c = companias().filter(function (x) { return x.id === id; })[0];
    monto = Math.round(+monto || 0);
    if (!c) return 'No cotiza.';
    if (monto <= 0 || S.estudios[0].caja < monto) return 'No alcanza la caja.';
    const n = monto / (precio(id) * IA.mundo.aEpoca(1, N.anio()));
    b.acc[id] = b.acc[id] || { n: 0, costo: 0 };
    b.acc[id].n += n; b.acc[id].costo += monto;
    IA.negocio.pagar(0, 'acciones', monto);
    return '';
  }
  function venderAccion(id) {
    const S = N.S, b = st(), a = b.acc[id];
    if (!a) return 'No tienes acciones.';
    const v = valorAccion(id), gan = v - a.costo;
    IA.negocio.cobrarEn(0, 'acciones', a.costo);
    if (gan > 0) IA.negocio.cobrarEn(0, 'inversiones', gan); else IA.negocio.pagar(0, 'inversiones', -gan);
    delete b.acc[id];
    return '';
  }
  // ---------- Estado anual ----------
  function balance() {
    const S = N.S, est = S.estudios[0], t = tip();
    const act = { caja: Math.max(0, est.caja), construcciones: Math.round((est.valorObras || 0) * t), inversiones: Math.round(valorInversiones()),
      catalogo: Math.round(S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada'; }).length * t * 0.05) };
    const pas = { deuda: Math.round(deuda()), caja: Math.max(0, -est.caja) };
    const ta = Object.keys(act).reduce(function (s, k) { return s + act[k]; }, 0), tp = pas.deuda + pas.caja;
    return { activos: act, pasivos: pas, totalA: ta, totalP: tp, patrimonio: ta - tp, socio: S.socio ? Math.round((ta - tp) * S.socio.parte) : 0 };
  }
  // ---------- Deuda semilla y cambio de marca ----------
  function semilla(region, dificultad) {
    const f = { facil: 0, normal: 0.6, dificil: 1.6, experto: 2.5, pesadilla: 4 }[dificultad] === undefined ? 0.6 : { facil: 0, normal: 0.6, dificil: 1.6, experto: 2.5, pesadilla: 4 }[dificultad];
    const r = ['nam', 'eur', 'oce'].indexOf(region) >= 0 ? 1.2 : 0.8;
    const m = Math.round(tip() * f * r);
    if (m > 0) pedir(m, 48, 'semilla');
    return m;
  }
  function costoMarca() { return Math.round(tip() * 0.5); }
  function cambiarMarca(nombre, avatarNom) {
    const S = N.S, est = S.estudios[0];
    nombre = (nombre || '').trim().slice(0, 40);
    if (!nombre) return 'Ponle un nombre.';
    if (est.caja < costoMarca()) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'marketing', costoMarca());
    const antes = est.nombre;
    est.nombre = nombre;
    if (avatarNom && S.avatar) S.avatar.nom = String(avatarNom).slice(0, 40);
    const perdida = Math.round((S.fans || 0) * 0.15);
    S.fans = (S.fans || 0) - perdida;
    S.marca = { hasta: S.t + 26, devolver: perdida, antes: antes };
    N.emit('noticia', { tipo: 'estudio', texto: antes + ' ahora se llama ' + nombre + '. Algunos fans tardan en reconocerte.', importante: true });
    return '';
  }
  function semana() {
    const S = N.S;
    if (S.marca && S.marca.devolver > 0) { const d = Math.round(S.marca.devolver / Math.max(1, S.marca.hasta - S.t)); S.fans += d; S.marca.devolver -= d; if (S.t >= S.marca.hasta) delete S.marca; }
  }
  return { ESCALONES: ESCALONES, COMPANIAS: COMPANIAS, deuda: deuda, puntaje: puntaje, escalon: escalon, limite: limite, tasa: tasa, cuota: cuota, pedir: pedir, prepagar: prepagar,
    agregarCuenta: agregarCuenta, cuentasDelMes: cuentasDelMes, mensual: mensual, socio: socio, entraSocio: entraSocio, opinar: opinar, valorEstudio: valorEstudio, recomprar: recomprar,
    anual: anual, salidasQuiebra: salidasQuiebra, salir: salir, companias: companias, precio: precio, valorAccion: valorAccion, valorInversiones: valorInversiones,
    comprarAccion: comprarAccion, venderAccion: venderAccion, balance: balance, semilla: semilla, costoMarca: costoMarca, cambiarMarca: cambiarMarca, semana: semana,
    junta: function () { return st().junta; }, estado: st };
})();
