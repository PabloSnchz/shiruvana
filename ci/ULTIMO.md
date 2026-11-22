# CI: FALLA

- Commit verificado: 41a4dc308da93659cf6f112ed32a8f8a1413b2e1
- La Guarida verificada: 4b6b362931311479d8da350688710400f5e1caec

## Fallas

```
1:✖ guion: los 7 capítulos en escena, en orden, cada escena con texto, fondo, gato y visual conocidos (3.392375ms)
4:✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (1.284986ms)
11:✖ arranca en la primera escena, en modo función, con la portada y mi saludo tipeándose (2.711845ms)
25:✖ una sola función: la escena 2 es para todos, sin elección ni pastillas apagadas (0.896087ms)
28:✖ andando sola: pasar a modo lectura cancela la espera; avanzar a mano no deja esperas viejas (0.362138ms)
75:✖ failing tests:
78:✖ guion: los 7 capítulos en escena, en orden, cada escena con texto, fondo, gato y visual conocidos (3.392375ms)
79:  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
80:  + actual - expected
100:    actual: [ 'entrada', 'quien-soy', 'lo-que-construi', 'que-puedo-hacer', 'como-trabajo', 'vestidor', 'shiruna', 'ecosistema' ],
101:    expected: [ 'entrada', 'quien-soy', 'lo-que-construi', 'que-puedo-hacer', 'como-trabajo', 'vestidor', 'ecosistema' ],
107:✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (1.284986ms)
108:  AssertionError [ERR_ASSERTION]: shiruna-saluda
118:    actual: false,
119:    expected: true,
125:✖ arranca en la primera escena, en modo función, con la portada y mi saludo tipeándose (2.711845ms)
126:  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
139:    actual: '1 / 26',
140:    expected: '1 / 22',
146:✖ una sola función: la escena 2 es para todos, sin elección ni pastillas apagadas (0.896087ms)
147:  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
148:  + actual - expected
162:    actual: '26 / 26',
163:    expected: '22 / 22',
169:✖ andando sola: pasar a modo lectura cancela la espera; avanzar a mano no deja esperas viejas (0.362138ms)
170:  AssertionError [ERR_ASSERTION]: una sola espera viva: la de la escena actual, nunca vuelve atrás
171:  + actual - expected
186:    actual: '#/shiruna/1',
187:    expected: '#/ecosistema/1',
```

## Salida (últimos 60 KB)

```
✖ guion: los 7 capítulos en escena, en orden, cada escena con texto, fondo, gato y visual conocidos (3.392375ms)
✔ guion del gato: imágenes, alt de cada pose, frases y una sola salida de tono (0.324451ms)
✔ guion: hablo en primera persona y nunca de mí en tercera (0.220955ms)
✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (1.284986ms)
✔ las anclas que uso existen en el modo lectura (0.27077ms)
✔ lo que leo de los otros capítulos está en el modo lectura: 6 cartas, 5 pasos, 1 regla, 9+9+7 figuras, 5 puertas (0.465725ms)
✔ los datos que leo del modo lectura están: 5 cifras, 3 eras, 12 hitos (4 chat, 1 agentes, 7 Factory) (0.268206ms)
✔ leerDatos arma cifras, eras y hitos desde el DOM (0.606368ms)
✔ leerDatos arma cartas, pasos, regla, figuras del Vestidor y puertas desde el DOM (3.659921ms)
✔ rutas: vacío y #/ abren la función; #/<cap>/<n> va a la escena; #sección es modo lectura (0.653038ms)
✖ arranca en la primera escena, en modo función, con la portada y mi saludo tipeándose (2.711845ms)
✔ avanzar: el primer toque completa el texto, el segundo pasa de escena y cambia el hash (0.575121ms)
✔ teclado, clic y deslizar: → ← Inicio Fin y Esc; los botones no disparan doble avance (1.804251ms)
✔ modo lectura y vuelta: #puedo va a la sección; #/ vuelve a empezar; las teclas no actúan leyendo (0.563523ms)
✔ cada capítulo marca su pastilla y la escena de cifras y de hitos usa los datos de lectura (0.869936ms)
✔ movimiento reducido: sin tipeo, sin ojos, texto completo al instante (0.531605ms)
✔ el gato: no está en la portada, llega en la escena 2, cambia de pose y se va cuando el guion dice null (1.587413ms)
✔ tocar al gato: habla, festeja, no avanza la escena y al quinto toque se harta (0.445855ms)
✔ si una imagen del gato no carga, el gato desaparece y no rompe nada (1.991655ms)
✔ cortina: al cambiar de capítulo aparece con su número y se va sola; no en la primera escena ni dentro del capítulo (1.508153ms)
✔ Qué puedo hacer y Cómo trabajo: cartas en dos tramos, cinco pasos y la regla, todo desde el modo lectura (0.808294ms)
✔ Vestidor: tocar una percha me cambia de ropa, lo digo, marca la elegida y no avanza; al salir vuelvo a mi pose (0.698577ms)
✔ Ecosistema: puertas que son enlaces reales, mi pose en la puerta con respaldo, y créditos con salida (0.592016ms)
✔ lógica pura: leerQuery solo entiende sola=1, armarQuery y espera (0.16498ms)
✖ una sola función: la escena 2 es para todos, sin elección ni pastillas apagadas (0.896087ms)
✔ andando sola: tocar mientras escribo completa el texto y la espera arranca igual (0.269918ms)
✔ andando sola: saltar de capítulo mientras escribo no deja que una espera vieja me devuelva atrás (0.831879ms)
✖ andando sola: pasar a modo lectura cancela la espera; avanzar a mano no deja esperas viejas (0.362138ms)
✔ la función que anda sola: espera a que termine de hablar, avanza, se apaga al final y vive en la dirección (0.295627ms)
✔ andando sola: no corta mientras escribo, el Vestidor la pausa y el modo lectura la frena (0.180283ms)
✔ lógica pura: hoyValido rechaza lo que no reconoce; hace() cuenta en minutos, horas y días (0.148706ms)
✔ vivificar: las cifras marcadas con data-hoy toman el valor vivo; las demás y los valores raros no se tocan (0.170739ms)
✔ Hoy en la Factory: la escena muestra la tarea, la etapa, hace cuánto y seis cifras vivas, con enlace al Centro de decisiones (0.479846ms)
✔ Hoy en la Factory sin datos vivos: no inventa nada, manda al Centro de decisiones; sin commits de la semana, esa cifra no aparece (2.715401ms)
✔ data/hoy.js: lo genera la Action, es válido y trae las tres cifras que el modo lectura marca como vivas (1.312357ms)
✔ index.html: escenario vacío al principio del body, scripts al final y arranque seguro (0.142446ms)
✔ CSS: solo actúa con html.funcion, respeta movimiento reducido y celular, sus url() existen (0.243087ms)
✔ MC-3b: la barra no cruza la pantalla y mi figura se funde con el fondo (0.140402ms)
✔ sin datos privados ni almacenamiento: el motor y el guion no guardan nada ni piden nada afuera (0.569021ms)
✔ tamaño: cada archivo nuevo bajo 40 KB (DEC-021) (0.179792ms)
✔ leer: cuenta decisiones, lecciones, funcionalidades, parches y el backlog por sección (2.053539ms)
✔ leer: la tarea, la etapa y la fecha salen de status.md, limpias; lo que espera a Pablo no se publica (0.91813ms)
✔ recortar: corta en una palabra y nunca pasa del máximo (0.681121ms)
✔ escribir: genera window.SHIRUVANA_HOY; si nada cambió no reescribe (sin commits vacíos) (4.32677ms)
✔ la Action: corre sola cada 2 horas, lee la Factory pública y solo commitea si hubo cambios (0.23751ms)
✔ kit: versión fija y piezas exportadas (0.703966ms)
✔ imágenes: caras, gato y poses con su archivo; lo desconocido cae en lo seguro (0.190348ms)
✔ gato: cuatro frases que rotan y la queja al quinto toque (0.451273ms)
✔ plegado: como lo dejaste; la primera vez, abierto (0.109546ms)
✔ globo: escapa el texto, nombra quién habla y los botones tienen nombre (0.309298ms)
✔ recorte: el negro del borde y los huecos grandes quedan transparentes; la figura y la pupila, no (9.690859ms)
✔ recorte: el hueco chico no pasa a fondo con el umbral por defecto; con hueco 0 sí (6.57336ms)
✔ css: colores en --svk-* y contraste AA (0.454798ms)
✔ css: foco visible, sin animación con movimiento reducido y todo con prefijo svk- (0.465885ms)
✔ toda imagen y recurso local existe en el repo (5.472474ms)
✔ las imágenes son propias del sitio: no dependen de La Guarida ni de otro repo (0.269378ms)
✔ accesibilidad: idioma, toda <img> con alt, un solo h1 y salto al contenido (0.364882ms)
✔ las imágenes no se estiran: alto automático cuando el CSS fija el ancho (0.200714ms)
✔ cuenta mi historia completa: el ecosistema desde 2026-02-19, en sus tres etapas (0.169156ms)
✔ sin datos privados: ni keys, ni tokens, ni correos (0.385223ms)
✔ Vestidor de cuerpo entero: 9 de trabajo y 9 vestuarios, sin «Próximamente» (0.500518ms)
✔ cuerpo entero fuera del Vestidor: me presento en «Quién soy» y camino en «Cómo trabajo», sin recortes (0.228867ms)
✔ sincronía: el recorte, sus vecinos y las frases del gato son el mismo código (0.658066ms)
✔ sincronía: mismas constantes y el mismo resultado sobre imágenes de prueba (14.756327ms)
✔ imágenes: todo lo que el kit pide existe en La Guarida (2.626566ms)
ℹ tests 65
ℹ suites 0
ℹ pass 60
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0

✖ failing tests:

test at tests/escenario.test.cjs:104:1
✖ guion: los 7 capítulos en escena, en orden, cada escena con texto, fondo, gato y visual conocidos (3.392375ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
    [
      'entrada',
      'quien-soy',
      'lo-que-construi',
      'que-puedo-hacer',
      'como-trabajo',
      'vestidor',
  +   'shiruna',
      'ecosistema'
    ]
  
      at TestContext.<anonymous> (/home/runner/work/shiruvana/shiruvana/tests/escenario.test.cjs:105:10)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.start (node:internal/test_runner/test:944:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: [ 'entrada', 'quien-soy', 'lo-que-construi', 'que-puedo-hacer', 'como-trabajo', 'vestidor', 'shiruna', 'ecosistema' ],
    expected: [ 'entrada', 'quien-soy', 'lo-que-construi', 'que-puedo-hacer', 'como-trabajo', 'vestidor', 'ecosistema' ],
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at tests/escenario.test.cjs:150:1
✖ guion: toda pose y toda cara existen en assets y las poses tienen alt (1.284986ms)
  AssertionError [ERR_ASSERTION]: shiruna-saluda
      at TestContext.<anonymous> (/home/runner/work/shiruvana/shiruvana/tests/escenario.test.cjs:153:14)
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

test at tests/escenario.test.cjs:255:1
✖ arranca en la primera escena, en modo función, con la portada y mi saludo tipeándose (2.711845ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  '1 / 26' !== '1 / 22'
  
      at TestContext.<anonymous> (/home/runner/work/shiruvana/shiruvana/tests/escenario.test.cjs:266:10)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
      at Test.postRun (node:internal/test_runner/test:1173:19)
      at Test.run (node:internal/test_runner/test:1101:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:744:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: '1 / 26',
    expected: '1 / 22',
    operator: 'strictEqual',
    diff: 'simple'
  }

test at tests/escenario.test.cjs:492:1
✖ una sola función: la escena 2 es para todos, sin elección ni pastillas apagadas (0.896087ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected
  
  + '26 / 26'
  - '22 / 22'
  
      at TestContext.<anonymous> (/home/runner/work/shiruvana/shiruvana/tests/escenario.test.cjs:508:10)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
      at Test.postRun (node:internal/test_runner/test:1173:19)
      at Test.run (node:internal/test_runner/test:1101:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:744:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: '26 / 26',
    expected: '22 / 22',
    operator: 'strictEqual',
    diff: 'simple'
  }

test at tests/escenario.test.cjs:529:1
✖ andando sola: pasar a modo lectura cancela la espera; avanzar a mano no deja esperas viejas (0.362138ms)
  AssertionError [ERR_ASSERTION]: una sola espera viva: la de la escena actual, nunca vuelve atrás
  + actual - expected
  
  + '#/shiruna/1'
  - '#/ecosistema/1'
       ^
  
      at TestContext.<anonymous> (/home/runner/work/shiruvana/shiruvana/tests/escenario.test.cjs:539:10)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
      at Test.postRun (node:internal/test_runner/test:1173:19)
      at Test.run (node:internal/test_runner/test:1101:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:744:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: '#/shiruna/1',
    expected: '#/ecosistema/1',
    operator: 'strictEqual',
    diff: 'simple'
  }
```
