const IA=require('/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js');
for (const desde of [1900,1950,2000]) {
  IA.pruebas.jugar({estrategia:'normal',desde,hasta:desde+15,semilla:'e'});
  const S=IA.n.S, da=IA.economia.datosAnio(IA.n.anio());
  console.log(desde+15,'fe52 (estrenos simulados ult. 52 sem)=',S.mercado.fe52.length,'peliculas año=',Math.round(da.peliculas),'estrenos52=',S.mercado.estrenos52);
}
