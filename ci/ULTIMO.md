# CI: FALLA

- Commit verificado: b8c6373093ddc10a3bdcb3847e9c74252ac72990
- La Guarida verificada: 4b6b362931311479d8da350688710400f5e1caec

## Fallas

```
4:✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (5.047558ms)
58:✖ toda imagen y recurso local existe en el repo (6.140938ms)
78:✖ failing tests:
81:✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (5.047558ms)
82:  AssertionError [ERR_ASSERTION]: shiruna-saluda
92:    actual: false,
93:    expected: true,
99:✖ toda imagen y recurso local existe en el repo (6.140938ms)
100:  AssertionError [ERR_ASSERTION]: falta assets/shiruvana/shiruna-saluda.webp
108:    actual: false,
109:    expected: true,
```

## Salida (últimos 60 KB)

```
✔ guion: los 8 capítulos en escena, en orden, cada escena con texto, fondo, gato y visual conocidos (3.39372ms)
✔ guion del gato: imágenes, alt de cada pose, frases y una sola salida de tono (0.50702ms)
✔ guion: hablo en primera persona y nunca de mí en tercera (0.402825ms)
✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (5.047558ms)
✔ las anclas que uso existen en el modo lectura (0.402584ms)
✔ lo que leo de los otros capítulos está en el modo lectura: 6 cartas, 5 pasos, 1 regla, 9+9+7 figuras, 5 puertas (0.767529ms)
✔ los datos que leo del modo lectura están: 5 cifras, 3 eras, 12 hitos (4 chat, 1 agentes, 7 Factory) (0.482464ms)
✔ leerDatos arma cifras, eras y hitos desde el DOM (1.160716ms)
✔ leerDatos arma cartas, pasos, regla, figuras del Vestidor y puertas desde el DOM (1.592043ms)
✔ rutas: vacío y #/ abren la función; #/<cap>/<n> va a la escena; #sección es modo lectura (1.04054ms)
✔ arranca en la primera escena, en modo función, con la portada y mi saludo tipeándose (4.179555ms)
✔ avanzar: el primer toque completa el texto, el segundo pasa de escena y cambia el hash (1.13149ms)
✔ teclado, clic y deslizar: → ← Inicio Fin y Esc; los botones no disparan doble avance (7.048478ms)
✔ modo lectura y vuelta: #puedo va a la sección; #/ vuelve a empezar; las teclas no actúan leyendo (1.031774ms)
✔ cada capítulo marca su pastilla y la escena de cifras y de hitos usa los datos de lectura (2.61605ms)
✔ movimiento reducido: sin tipeo, sin ojos, texto completo al instante (1.021534ms)
✔ el gato: no está en la portada, llega en la escena 2, cambia de pose y se va cuando el guion dice null (2.564535ms)
✔ tocar al gato: habla, festeja, no avanza la escena y al quinto toque se harta (1.103708ms)
✔ si una imagen del gato no carga, el gato desaparece y no rompe nada (3.458261ms)
✔ cortina: al cambiar de capítulo aparece con su número y se va sola; no en la primera escena ni dentro del capítulo (2.514212ms)
✔ Qué puedo hacer y Cómo trabajo: cartas en dos tramos, cinco pasos y la regla, todo desde el modo lectura (1.610578ms)
✔ Vestidor: tocar una percha me cambia de ropa, lo digo, marca la elegida y no avanza; al salir vuelvo a mi pose (1.3873ms)
✔ Ecosistema: puertas que son enlaces reales, mi pose en la puerta con respaldo, y créditos con salida (1.053825ms)
✔ lógica pura: leerQuery solo entiende sola=1, armarQuery y espera (0.254236ms)
✔ una sola función: la escena 2 es para todos, sin elección ni pastillas apagadas (1.075967ms)
✔ andando sola: tocar mientras escribo completa el texto y la espera arranca igual (0.437039ms)
✔ andando sola: saltar de capítulo mientras escribo no deja que una espera vieja me devuelva atrás (1.176044ms)
✔ andando sola: pasar a modo lectura cancela la espera; avanzar a mano no deja esperas viejas (0.473046ms)
✔ la función que anda sola: espera a que termine de hablar, avanza, se apaga al final y vive en la dirección (0.516909ms)
✔ andando sola: no corta mientras escribo, el Vestidor la pausa y el modo lectura la frena (0.303158ms)
✔ lógica pura: hoyValido rechaza lo que no reconoce; hace() cuenta en minutos, horas y días (0.232275ms)
✔ vivificar: las cifras marcadas con data-hoy toman el valor vivo; las demás y los valores raros no se tocan (0.348283ms)
✔ Hoy en la Factory: la escena muestra la tarea, la etapa, hace cuánto y seis cifras vivas, con enlace al Centro de decisiones (1.158701ms)
✔ Hoy en la Factory sin datos vivos: no inventa nada, manda al Centro de decisiones; sin commits de la semana, esa cifra no aparece (5.012824ms)
✔ data/hoy.js: lo genera la Action, es válido y trae las tres cifras que el modo lectura marca como vivas (1.790686ms)
✔ index.html: escenario vacío al principio del body, scripts al final y arranque seguro (0.185317ms)
✔ CSS: solo actúa con html.funcion, respeta movimiento reducido y celular, sus url() existen (0.252453ms)
✔ MC-3b: la barra no cruza la pantalla y mi figura se funde con el fondo (0.239188ms)
✔ sin datos privados ni almacenamiento: el motor y el guion no guardan nada ni piden nada afuera (0.627055ms)
✔ tamaño: cada archivo nuevo bajo 40 KB (DEC-021) (0.187742ms)
✔ capítulo Shiruna: antes del Ecosistema; Shiruna saluda y trabaja, Pablo nos dio vida, y los créditos los nombran (0.396613ms)
✔ función: en el capítulo Shiruna la pose es la de ella, con su alt, y si vuelvo a mí vuelve la mía (0.372028ms)
✔ modo lectura: la sección Mi familia con Shiruna y Pablo, imágenes propias del sitio con alt y tamaño (0.397936ms)
✔ leer: cuenta decisiones, lecciones, funcionalidades, parches y el backlog por sección (3.747833ms)
✔ leer: la tarea, la etapa y la fecha salen de status.md, limpias; lo que espera a Pablo no se publica (1.493889ms)
✔ recortar: corta en una palabra y nunca pasa del máximo (1.028247ms)
✔ escribir: genera window.SHIRUVANA_HOY; si nada cambió no reescribe (sin commits vacíos) (4.514551ms)
✔ la Action: corre sola cada 2 horas, lee la Factory pública y solo commitea si hubo cambios (0.441317ms)
✔ kit: versión fija y piezas exportadas (1.608084ms)
✔ imágenes: caras, gato y poses con su archivo; lo desconocido cae en lo seguro (0.397585ms)
✔ gato: cuatro frases que rotan y la queja al quinto toque (1.00832ms)
✔ plegado: como lo dejaste; la primera vez, abierto (0.212789ms)
✔ globo: escapa el texto, nombra quién habla y los botones tienen nombre (0.589515ms)
✔ recorte: el negro del borde y los huecos grandes quedan transparentes; la figura y la pupila, no (17.039769ms)
✔ recorte: el hueco chico no pasa a fondo con el umbral por defecto; con hueco 0 sí (4.657628ms)
✔ css: colores en --svk-* y contraste AA (0.713918ms)
✔ css: foco visible, sin animación con movimiento reducido y todo con prefijo svk- (0.819876ms)
✖ toda imagen y recurso local existe en el repo (6.140938ms)
✔ las imágenes son propias del sitio: no dependen de La Guarida ni de otro repo (0.485931ms)
✔ accesibilidad: idioma, toda <img> con alt, un solo h1 y salto al contenido (0.623699ms)
✔ las imágenes no se estiran: alto automático cuando el CSS fija el ancho (0.48583ms)
✔ cuenta mi historia completa: el ecosistema desde 2026-02-19, en sus tres etapas (0.242564ms)
✔ sin datos privados: ni keys, ni tokens, ni correos (0.606296ms)
✔ Vestidor de cuerpo entero: 9 de trabajo y 9 vestuarios, sin «Próximamente» (0.848129ms)
✔ cuerpo entero fuera del Vestidor: me presento en «Quién soy» y camino en «Cómo trabajo», sin recortes (0.647624ms)
✔ sincronía: el recorte, sus vecinos y las frases del gato son el mismo código (1.703723ms)
✔ sincronía: mismas constantes y el mismo resultado sobre imágenes de prueba (34.310295ms)
✔ imágenes: todo lo que el kit pide existe en La Guarida (0.852658ms)
ℹ tests 68
ℹ suites 0
ℹ pass 66
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0

✖ failing tests:

test at tests/escenario.test.cjs:152:1
✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (5.047558ms)
  AssertionError [ERR_ASSERTION]: shiruna-saluda
      at TestContext.<anonymous> (/home/runner/work/shiruvana/shiruvana/tests/escenario.test.cjs:155:14)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
      at Test.postRun (node:internal/test_runner/test:1173:19)
      at Test.run (node:internal/test_runner/test:1101:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:744:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: '==',
    diff: 'simple'
  }

test at tests/site.test.cjs:13:1
✖ toda imagen y recurso local existe en el repo (6.140938ms)
  AssertionError [ERR_ASSERTION]: falta assets/shiruvana/shiruna-saluda.webp
      at TestContext.<anonymous> (/home/runner/work/shiruvana/shiruvana/tests/site.test.cjs:15:32)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.start (node:internal/test_runner/test:944:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: '==',
    diff: 'simple'
  }
```
