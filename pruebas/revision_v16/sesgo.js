const path='/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js';
function nuevo(){ delete require.cache[require.resolve(path)]; return require(path); }
const A=nuevo(); const ra=A.pruebas.jugar({estrategia:'normal',desde:1900,hasta:2010,semilla:'sesgo'});
const B=nuevo(); const orig=B.obras.compactar; B.obras.compactar=function(){}; // sin borrar nada
const rb=B.pruebas.jugar({estrategia:'normal',desde:1900,hasta:2010,semilla:'sesgo'});
const k=['obras','multMediano','sobre5','pierden','multMedianoJugador','crecimiento30'];
k.forEach(x=>console.log(x.padEnd(20), 'con compactar', +(+ra[x]).toFixed(3), ' sin compactar', +(+rb[x]).toFixed(3)));
console.log('misma caja final', ra.cajaFinal2025===rb.cajaFinal2025);
