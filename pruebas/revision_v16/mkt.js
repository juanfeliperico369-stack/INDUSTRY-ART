const IA=require('/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js');
IA.juego.nuevaPartida({semilla:'m',anio:1900,nombre:'X'});
[1900,1903,1905,1908,1912,1919,1920,1946,1950,1975,2019,2020,2021].forEach(a=>{
  const r=IA.economia.marketingTipico(a+1)/IA.economia.marketingTipico(a);
  console.log(a,'->',a+1,'marketing típico x', r.toFixed(2));
});
