// tests/kit.test.cjs — kit/escena-kit.js y kit/escena-kit.css (BL-091 CD-3).
// Correr: node --test tests/kit.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const K = require('../kit/escena-kit.js');

const CSS = fs.readFileSync(path.join(__dirname, '..', 'kit', 'escena-kit.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('kit: versión fija y piezas exportadas', () => {
  assert.equal(K.VERSION, '1.0.0');
  for (const f of ['caraURL', 'gatoURL', 'poseURL', 'fraseGato', 'plegadoInicial', 'globoHTML', 'recorte', 'esc']) assert.equal(typeof K[f], 'function', f);
  assert.match(K.BASE, /^https:\/\/pablosnchz\.github\.io\//, 'imágenes del mismo origen (el canvas puede leerlas)');
});

test('imágenes: caras, gato y poses con su archivo; lo desconocido cae en lo seguro', () => {
  assert.equal(K.caraURL('ojo'), K.BASE + 'shiruvana/shiruvana-ojo-cara-128.webp');
  assert.equal(K.caraURL('no-existe'), K.BASE + 'shiruvana/shiruvana-hola-cara-128.webp');
  assert.equal(K.gatoURL('camina'), K.BASE + 'gato/gato-camina.webp');
  assert.equal(K.gatoURL('vuela'), K.BASE + 'gato/gato-sentado.webp');
  assert.equal(K.poseURL('pensando', 'x/'), 'x/shiruvana/cuerpo-pensando.webp');
  assert.equal(K.poseURL('baila', 'x/'), 'x/shiruvana/cuerpo-sentada.webp');
});

test('gato: cuatro frases que rotan y la queja al quinto toque', () => {
  assert.equal(K.fraseGato(0), '');
  assert.deepEqual([1, 2, 3, 4].map(K.fraseGato), K.FRASES);
  assert.equal(K.fraseGato(5), K.QUEJA);
  assert.equal(K.fraseGato(6), K.FRASES[0]);
});

test('plegado: como lo dejaste; la primera vez, abierto', () => {
  assert.equal(K.plegadoInicial(null), false);
  assert.equal(K.plegadoInicial({ plegado: true }), true);
  assert.equal(K.plegadoInicial({ plegado: 'si' }), false);
});

test('globo: escapa el texto, nombra quién habla y los botones tienen nombre', () => {
  const h = K.globoHTML({ texto: '<img src=x onerror=1> & "hola"', cara: 'ojo' });
  assert.ok(!h.includes('<img src=x'), 'el texto no inyecta HTML');
  assert.ok(h.includes('&lt;img src=x onerror=1&gt; &amp; &quot;hola&quot;'));
  assert.match(h, /<p class="svk-nombre">Shiruvana<\/p>/);
  assert.match(h, /class="svk-gato" aria-label="Tocar al gato robot"/);
  assert.match(h, /class="svk-plegar" aria-expanded="true" aria-label="Plegar mi globo"/);
  assert.match(h, /class="svk-cara" src="[^"]*shiruvana-ojo-cara-128\.webp" alt=""/, 'cara decorativa');
  assert.match(h, /class="svk-gato-dice" aria-live="polite"/);
});

/** Imagen de prueba: fondo negro, figura gris, un hueco negro grande y una pupila negra chica. */
function imagen(w, h) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const figura = x >= 10 && x < 90 && y >= 10 && y < 90;
    const hueco = x >= 30 && x < 50 && y >= 30 && y < 50;      // 400 px = 4 % → fondo
    const pupila = x >= 70 && x < 72 && y >= 70 && y < 72;      // 4 px → figura
    const v = figura && !hueco && !pupila ? 160 : 0;
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  return d;
}
const alfa = (d, w, x, y) => d[(y * w + x) * 4 + 3];

test('recorte: el negro del borde y los huecos grandes quedan transparentes; la figura y la pupila, no', () => {
  const w = 100, h = 100, d = imagen(w, h);
  const fondo = K.recorte(d, w, h);
  assert.equal(alfa(d, w, 0, 0), 0, 'esquina');
  assert.equal(alfa(d, w, 5, 50), 0, 'borde');
  assert.equal(alfa(d, w, 40, 40), 0, 'hueco grande');
  assert.equal(alfa(d, w, 20, 20), 255, 'figura');
  assert.equal(alfa(d, w, 70, 70), 255, 'pupila');
  assert.equal(fondo, w * h - 80 * 80 + 400, 'cuenta los píxeles de fondo');
  // Borde: se achica un píxel y se suaviza dos veces → rampa 0, 28, 85, 170, 227, 255.
  assert.deepEqual([8, 9, 10, 11, 12, 13].map(x => alfa(d, w, x, 50)), [0, 28, 85, 170, 227, 255], 'borde suavizado');
  assert.equal(d[(50 * w + 50) * 4], 160, 'el color no cambia: solo el alfa');
});

test('recorte: el hueco chico no pasa a fondo con el umbral por defecto; con hueco 0 sí', () => {
  const w = 100, h = 100, d = imagen(w, h);
  K.recorte(d, w, h, null, 0);
  assert.ok(alfa(d, w, 70, 70) < 255, 'con hueco 0 la pupila también es fondo');
});

/* ------------------------------------------------------------ CSS */

function hex(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function lum(c) { return c.map(v => v / 255).map(s => (s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); }
function ratio(a, b) { const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
const VARS = Object.fromEntries([...CSS.match(/\.svk-globo\s*\{([^}]*)\}/)[1].matchAll(/(--svk-[\w-]+):\s*([^;]+);/g)].map(x => [x[1], x[2].trim()]));

test('css: colores en --svk-* y contraste AA', () => {
  for (const [, n] of CSS.matchAll(/var\((--svk-[\w-]+)\)/g)) assert.ok(n in VARS, `${n} existe`);
  for (const [fg, bg] of [['--svk-text', '--svk-bg'], ['--svk-amber', '--svk-bg'], ['--svk-muted', '--svk-bg'], ['--svk-ink', '--svk-amber']]) {
    const r = ratio(VARS[fg], VARS[bg]);
    assert.ok(r >= 4.5, `${fg} sobre ${bg} = ${r.toFixed(2)}`);
  }
  assert.ok(ratio(VARS['--svk-amber'], VARS['--svk-bg']) >= 3, 'foco ámbar visible (≥ 3:1)');
});

test('css: foco visible, sin animación con movimiento reducido y todo con prefijo svk-', () => {
  assert.match(CSS, /\.svk-plegar:focus-visible, \.svk-gato:focus-visible \{ outline: 2px solid var\(--svk-amber\)/);
  const rm = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(rm, /\.svk-globo \{ animation: none; \}/);
  assert.match(rm, /\.svk-gato\.is-salta img \{ animation: none; \}/);
  const clases = [...CSS.matchAll(/\.([a-z][\w-]*)/g)].map(x => x[1]).filter(c => !/^\d/.test(c));
  assert.deepEqual([...new Set(clases.filter(c => !c.startsWith('svk-') && !['is-plegado', 'is-salta'].includes(c)))], [], 'no pisa clases de otros sitios');
  assert.match(CSS, /\.svk-gato-dice:empty \{ display: none; \}/);
});
