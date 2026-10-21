# Paquetes de realidad (mods de datos)

Un paquete es un archivo `.json` con compañías, talentos, catálogo de obras, material e hitos que se conecta a una partida.
**Solo contiene datos, nunca código**: el juego lo valida, limita el tamaño (8 MB) y escapa todo el texto.

## Dónde se usa
- **Partida nueva:** el bloque «Paquete de realidad (mod)» permite elegir un paquete instalado o «+ Cargar…». Hay dos modos: sumar las compañías a los estudios del juego, o jugar solo con las compañías del paquete.
- **Estudio › Editor › Paquetes de realidad:** desde ahí se carga, se ve, se quita o se conecta un paquete a la partida abierta. También se puede **exportar tu realidad** (tu partida convertida en paquete para compartir) y descargar la **plantilla**.
- El paquete queda guardado en la partida, así que al compartir la partida se comparte su realidad.

## Formato (versión 1)
```json
{
  "formato": "industry-art-realidad", "version": 1,
  "id": "mi_paquete", "nombre": "…", "autor": "…", "descripcion": "…", "anioBase": 2026,
  "estudios": [{
    "id": "clave", "nombre": "…", "pais": "us", "fundado": 1923, "tipo": "Corporación",
    "familia": "FJ", "valor": 150000000000, "historia": "…",
    "hitos": [[1937, "texto"]], "franquicias": ["…"],
    "obras": [{ "tit": "…", "anio": 1994, "medio": "cine", "gen": ["Drama"], "bruto": 0, "costo": 0, "crit": 0, "pub": 0, "franq": "…", "nivel": "A" }]
  }],
  "talentos": [{ "nom": "…", "sx": "F", "nac": 1970, "muerte": 0, "pais": "us", "of": "direccion", "hab": 80, "fama": 0.7, "estudio": "clave", "bio": "…" }],
  "material": [{ "tit": "…", "autor": "…", "anio": "1990", "libre": 2100, "gen": ["Aventura"], "fama": 0.8, "tipo": "Novela", "temas": ["…"], "personajes": ["Nombre:F"], "sinopsis": "…", "dueno": "clave" }],
  "personas": { "clave": ["Nombre", "direccion", "M", "Estados Unidos", 1946, 0] },
  "hitos": [{ "anio": 1977, "tipo": "o", "medio": 0, "texto": "…", "en": "…", "persona": "clave", "obra": { "tit": "…", "tipo": "Película", "gen": ["Ciencia ficción"] }, "fam": "IM", "v": 0.2, "cons": "el público pide más …", "consEN": "…" }]
}
```

### Valores permitidos
- **Países (`pais`):** us, ca, mx, br, ar, co, cl, pe, cu, pa, gb, fr, de, es, it, ru, ng, eg, za, ma, ke, in, cn, jp, kr, th, hk, au, nz, fj, ws, pg.
- **Familias (`familia`, `fam`):** AA (acción), IM (imaginación), SM (suspenso), DR (drama), HM (humor y música), FJ (familia), AV (vanguardia), RD (romance).
- **Medios (`medio` de las obras):** cine, tv, musica, juegos, teatro, libros. En los hitos, `medio` es un número: 0 Película, 1 Serie, 2 Videojuego, 3 Teatro, 4 Canción, 5 Novela, -1 otro.
- **Oficios (`of`):** guion, direccion, produccion, fotografia, musica, edicion, arte, interprete.
- **`nivel` de las obras:** A (grandes), B (medianas), C (menores).
- **`libre`** es el año en que el material pasa a dominio público. Si es posterior a la fecha de la partida, el material tiene derechos.

## Qué hace en la partida
- Cada compañía entra como estudio rival real. Su tamaño sale del valor y del catálogo, y su fama crece con sus franquicias y obras grandes.
- Los talentos vivos entran al mundo con su edad, país, oficio, habilidad y fama.
- El material se puede adaptar.
- Los hitos aparecen en Mundo › Historia y, si tienen consecuencia, mueven los gustos del público.

## Límites
300 compañías, 400 obras por compañía, 4.000 talentos, 2.000 materiales y 3.000 hitos por paquete, en un archivo de 8 MB como máximo.
