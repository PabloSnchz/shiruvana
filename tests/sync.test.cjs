/**
 * tests/sync.test.cjs — El kit y La Guarida no se separan (BL-091 CD-3b).
 *
 * La Guarida conserva su escena (js/escena.js): tiene el consejo del día, la bienvenida, el buscador
 * y las reacciones, y está validada. El kit (kit/escena-kit.js) es la versión compartida para los
 * demás sitios. Lo que comparten tiene que ser idéntico: el recorte de mis poses, el gato y sus frases.
 * También verifica que existan en La Guarida todas las imágenes que el kit pide.
 *
 * Necesita una copia de la-guarida en la ruta de LA_GUARIDA (el CI la baja con actions/checkout).
 * Sin esa variable, se saltea.
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const LG = process.env.LA_GUARIDA ? path.resolve(process.env.LA_GUARIDA) : '';
const sin = !LG && 'sin LA_GUARIDA: corre en el CI';
const KIT = path.join(__dirname, '..', 'kit', 'escena-kit.js');
const ESC = LG && path.join(LG, 'js', 'escena.js');

/** El texto de una función de primer nivel del módulo (dos espacios de sangría). */
function bloque(src, nombre) {
  const ini = src.indexOf('\n  function ' + nombre + '(');
  assert.ok(ini >= 0, `existe function ${nombre}`);
  const fin = src.indexOf('\n  }\n', ini);
  assert.ok(fin > ini, `${nombre} cierra`);
  return src.slice(ini, fin + 4);
}

/** Imagen RGBA de prueba: fondo negro, una figura con un hueco grande y una pupila, y ruido. */
function imagen(w, h, semilla) {
  let s = semilla;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const dentro = x > w * 0.2 && x < w * 0.8 && y > h * 0.15 && y < h * 0.9;
      const hueco = x > w * 0.4 && x < w * 0.6 && y > h * 0.4 && y < h * 0.7;
      const pupila = Math.abs(x - w * 0.3) < 2 && Math.abs(y - h * 0.25) < 2;
      const v = dentro && !hueco && !pupila ? 40 + Math.floor(rnd() * 200) : Math.floor(rnd() * 16);
      d[p] = v; d[p + 1] = Math.floor(v * rnd()); d[p + 2] = v; d[p + 3] = 255;
    }
  }
  return d;
}

test('sincronía: el recorte, sus vecinos y las frases del gato son el mismo código', { skip: sin }, () => {
  const kit = fs.readFileSync(KIT, 'utf8');
  const esc = fs.readFileSync(ESC, 'utf8');
  for (const f of ['recorte', 'vecinos', 'fraseGato']) assert.equal(bloque(esc, f), bloque(kit, f), `${f} es igual en el kit y en La Guarida`);
});

test('sincronía: mismas constantes y el mismo resultado sobre imágenes de prueba', { skip: sin }, () => {
  const K = require(KIT);
  const G = require(ESC);
  for (const k of ['FRASES', 'QUEJA', 'UMBRAL', 'HUECO', 'POSES']) assert.deepEqual(K[k], G[k], k);
  for (const [w, h, s] of [[40, 60, 1], [64, 48, 7], [33, 77, 42]]) {
    const a = imagen(w, h, s), b = Uint8ClampedArray.from(a);
    const fa = K.recorte(a, w, h), fb = G.recorte(b, w, h);
    assert.ok(fa > 0 && fa < w * h, `la imagen ${w}×${h} tiene fondo y figura`);
    assert.equal(fa, fb, `${w}×${h}: mismo fondo`);
    assert.deepEqual(a, b, `${w}×${h}: mismos píxeles`);
  }
  for (let n = 0; n <= 12; n++) assert.equal(K.fraseGato(n), G.fraseGato(n), `toque ${n}`);
});

test('imágenes: todo lo que el kit pide existe en La Guarida', { skip: sin }, () => {
  const K = require(KIT);
  const base = path.join(LG, 'assets', 'brand') + path.sep;
  const urls = [
    ...K.CARAS.map(c => K.caraURL(c, base)),
    ...K.GATOS.map(g => K.gatoURL(g, base)),
    ...K.POSES.map(p => K.poseURL(p, base)),
  ];
  assert.equal(urls.length, K.CARAS.length + K.GATOS.length + K.POSES.length);
  const faltan = urls.filter(u => !fs.existsSync(u)).map(u => path.relative(LG, u));
  assert.deepEqual(faltan, []);
  assert.ok(K.BASE.endsWith('/la-guarida/assets/brand/'), 'el kit las pide a La Guarida');
});
