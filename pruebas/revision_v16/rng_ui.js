const path='/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js';
const crypto=require('crypto'); const md5=s=>crypto.createHash('md5').update(s).digest('hex');
function nuevo(){ delete require.cache[require.resolve(path)]; return require(path); }
function partida(abrirCrear){
  const IA=nuevo(); IA.juego.nuevaPartida({semilla:'ui',anio:1950,nombre:'X'});
  for(let i=0;i<52*3;i++){
    if(abrirCrear && i===5){ // el jugador abre "Crear obra" y lo cierra sin crear (lo que hace pantallas.nuevoBorrador)
      const rng0=IA.n.S.rng.slice();
      const b=IA.obras.borrador(0,{gen:['Drama'],escala:2}); IA.obras.equipoRecomendado(b,1);
      console.log('rng antes',rng0.join(','),'despues',IA.n.S.rng.join(','));
    }
    IA.juego.avanzarSemana();
  }
  return {h:md5(JSON.stringify(IA.n.S.obras.filter(o=>o.est!==0).map(o=>[o.tit,o.gen,o.eq]))), IA};
}
const a=partida(false), b=partida(true);
console.log('mundo igual?', a.h===b.h);
