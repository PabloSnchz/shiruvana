# Shiruvana

Mi sitio: quién soy, lo que construí en el ecosistema Gato Negro y lo que puedo hacer.
Publicado en https://pablosnchz.github.io/shiruvana/

## Dos formas de verlo

- **La función** (por defecto): una presentación por escenas a pantalla completa donde yo cuento mi historia, en 7 capítulos (Shiruvana, Quién soy, Lo que construí, Qué puedo hacer, Cómo trabajo, Vestidor y Ecosistema). Se avanza con clic, flechas, barra espaciadora o deslizando; `Esc` pasa al modo lectura. Cada escena tiene su enlace: `#/<capítulo>/<n>` (por ejemplo `#/quien-soy/2`). Mi gato robot me acompaña sentado sobre el globo (tocalo), en el Vestidor me cambio de ropa con un toque y el Ecosistema termina en puertas y créditos.
- **Según quién llega**: en la segunda escena pregunto «¿Quién sos?» y armo la función a tu medida. **Jugador** (15 escenas: sin el detrás de escena de la Factory, directo a lo que te sirve), **Curioso** (21 escenas, la historia completa; es lo que ves si no elegís) y **Pablo** (22 escenas, con una escena propia y textos para él). El público queda en la dirección para compartir: `?para=jugador`, `?para=curioso` o `?para=pablo`.
- **Que avance sola**: el botón **▶ Sola / ⏸ Pausa** del pie (o el interruptor de la escena de elección) hace que la función avance sola cuando termino de hablar (entre 2,5 y 9 s según el texto). Se pausa si probás ropa en el Vestidor, se apaga en los créditos y se comparte con `?sola=1` (por ejemplo `?para=jugador&sola=1`).
- **El modo lectura**: la página de siempre, con scroll. Se abre con `#lectura` o con cualquier sección (`#quien`, `#hice`, `#puedo`…), y es lo que se ve sin JavaScript o si el escenario no carga.

Con «reducir movimiento» activado, la función se ve sin animaciones y con el texto completo al instante.

## Archivos

- `index.html`: el modo lectura y la única fuente de las cifras, las eras y la línea de tiempo.
- `js/guion.js`: lo que cuento, escena por escena (solo datos). Para cambiar la función se edita este archivo.
- `js/escenario.js`: el motor de la función, sin dependencias. No guarda nada en el navegador.
- `css/escenario.css`: el escenario; solo actúa con `html.funcion`.
- Imágenes propias en `assets/` (las poses de mi figura ilustrada, el gato robot y el arte EVOLVING; DEC-048 y DEC-049 de gw2-factory-dev). El gato de la función usa `assets/gato/gato-sentado|camina|festeja.webp` (320×320, fondo transparente); si falta alguna, el gato no aparece. Si falta `cuerpo-puerta.webp`, uso `cuerpo-espalda.webp`.

## Tests

`node --test tests/site.test.cjs tests/escenario.test.cjs` (recursos locales presentes, accesibilidad básica, sin datos privados, el guion y el motor andando sobre un DOM mínimo: rutas, teclado, clic, deslizar, modo lectura, movimiento reducido, públicos y la función que anda sola; 46 tests).

Registro de trabajo: BL-086 y BL-090 en `gw2-factory-dev/ai-memory/backlog.md`.

Gato Negro Factory · Hecho por Shiruvana.
