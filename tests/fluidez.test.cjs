// Fluidez (FLU-2, 2026-11-23): que bajar por el sitio y mirar la presentación no pese.
// Mismo criterio que La Guarida y el Centro de mando: nada de desenfoques detrás (backdrop-filter)
// ni fondos con background-attachment: fixed, que el navegador rehace en cada paso del scroll.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const ESTILO = HTML.slice(HTML.indexOf('<style>'), HTML.indexOf('</style>'));
const CSS = fs.readFileSync(path.join(ROOT, 'css/escenario.css'), 'utf8');
const regla = (src, sel) => {
  const i = src.indexOf(sel + ' {');
  assert.ok(i >= 0, 'falta ' + sel);
  return src.slice(i, src.indexOf('}', i));
};
const alfa = (bloque) => {
  const m = /background: rgba\(\s*\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/.exec(bloque);
  assert.ok(m, 'sin fondo rgba: ' + bloque.slice(0, 60));
  return parseFloat(m[1]);
};

test('fluidez: ni el modo lectura ni la presentación usan desenfoques detrás ni fondos fijos', () => {
  for (const [nombre, src] of [['index.html', ESTILO], ['css/escenario.css', CSS]]) {
    assert.doesNotMatch(src, /backdrop-filter\s*:/, nombre + ': backdrop-filter se recalcula en cada cuadro');
    assert.doesNotMatch(src, /background-attachment\s*:\s*fixed/, nombre + ': fondo fijo repinta la pantalla al bajar');
  }
});

test('fluidez: lo que antes se desenfocaba ahora es casi opaco y se ve igual', () => {
  assert.ok(alfa(regla(ESTILO, 'nav.top')) >= 0.94, 'barra de arriba');
  assert.match(regla(ESTILO, 'nav.top'), /position: sticky/, 'la barra sigue pegada arriba');
  assert.ok(alfa(regla(CSS, '\n.st-caps')) >= 0.9, 'cápsula de capítulos');
  assert.ok(alfa(regla(CSS, '\n.st-globo')) >= 0.9, 'globo donde hablo');
});
