const IA=require('/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js');
const N=IA.n;
IA.juego.nuevaPartida({semilla:'pe',anio:1950,nombre:'X'});
// año 1: avanzar "hasta el próximo evento" como el botón
for (let k=0;k<8;k++){
  const antes=N.S.premios.length;
  const r=IA.juego.avanzar('evento');
  console.log('motivo',r.motivo,'-> semana',N.semana(),N.anio(),'ceremonias',antes,'->',N.S.premios.length, r.motivo==='premios' ? ('se mostraría: ceremonia de películas de '+(N.S.premios.length? N.S.premios[N.S.premios.length-1].anio : 'NINGUNA -> la UI auto lanza TypeError'))+' ; ceremonia real de este año: películas de '+(N.anio()-1) : '');
}
