const path='/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js';
const crypto=require('crypto');
const md5=s=>crypto.createHash('md5').update(s).digest('hex');
function nuevo(){ delete require.cache[require.resolve(path)]; return require(path); }
function jugarSemanas(IA, n){ const est=IA.pruebas.ESTRATEGIAS.normal; for(let i=0;i<n;i++){ IA.pruebas.decidir(est); IA.juego.avanzarSemana(); } }
// A: continuo
let A=nuevo(); A.juego.nuevaPartida({semilla:'gc',anio:1950,nombre:'B',bot:true}); jugarSemanas(A, 52*12+17); jugarSemanas(A, 52*12);
const hA=md5(JSON.stringify(A.n.S));
// B: guarda/carga en medio en una instancia NUEVA del módulo (como recargar la página)
let B=nuevo(); B.juego.nuevaPartida({semilla:'gc',anio:1950,nombre:'B',bot:true}); jugarSemanas(B, 52*12+17);
const txt=JSON.stringify(B.n.S);
let C=nuevo(); C.n.S=JSON.parse(txt); C.juego.conectar(); C.talentos.reindexar(); C.obras.reindexar();
jugarSemanas(C, 52*12);
const hC=md5(JSON.stringify(C.n.S));
console.log('continuo',hA,'cargado',hC, hA===hC);
// D: carga en la MISMA instancia (cargar partida sin recargar página) 
let D=nuevo(); D.juego.nuevaPartida({semilla:'gc',anio:1950,nombre:'B',bot:true}); jugarSemanas(D, 52*12+17);
const txtD=JSON.stringify(D.n.S); jugarSemanas(D, 52*3);
D.n.S=JSON.parse(txtD); D.juego.conectar(); D.talentos.reindexar(); D.obras.reindexar(); jugarSemanas(D, 52*12);
console.log('misma instancia', md5(JSON.stringify(D.n.S))===hA);
