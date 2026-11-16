// Chequeos de mi presentación por escenas (BL-090). Corren con: node --test tests/
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const leer = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const HTML = leer('index.html');
const CSS = leer('css/escenario.css');
const MOTOR_SRC = leer('js/escenario.js');
const GUION_SRC = leer('js/guion.js');
const GUION = require('../js/guion.js');
const E = require('../js/escenario.js');

// ---------- un DOM mínimo, suficiente para el motor ----------
class El {
  constructor(tag, doc) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = doc;
    this.children = []; this.parentNode = null; this.attrs = {}; this.listeners = {};
    this._text = ''; this.className = ''; this.disabled = false; this.offsetWidth = 0;
    const props = {}; this.style = { props, setProperty(k, v) { props[k] = v; } };
    const self = this;
    const lista = () => self.className.split(/\s+/).filter(Boolean);
    this.classList = {
      add(...c) { self.className = [...new Set([...lista(), ...c])].join(' '); },
      remove(...c) { self.className = lista().filter((x) => !c.includes(x)).join(' '); },
      contains(c) { return lista().includes(c); },
      toggle(c, f) { if (f === undefined) f = !this.contains(c); if (f) this.add(c); else this.remove(c); return f; }
    };
  }
  get firstChild() { return this.children[0] || null; }
  appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.children.push(c); return c; }
  removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this.children = []; this._text = String(v); }
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
  emitir(t, ev = {}) {
    ev.type = t; ev.target = ev.target || this; ev.preventDefault = () => { ev.defaultPrevented = true; };
    for (let n = this; n; n = n.parentNode) (n.listeners[t] || []).forEach((f) => f(ev));
    return ev;
  }
  focus() { this.ownerDocument.activeElement = this; }
  scrollIntoView() { this.ownerDocument.scrolledTo = this.attrs.id; }
  todos(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.todos(pred, out); } return out; }
  porClase(c) { return this.todos((x) => x.classList.contains(c)); }
}

function montar({ hash = '', reducido = false } = {}) {
  const doc = { listeners: {}, activeElement: null, scrolledTo: null };
  doc.createElement = (t) => new El(t, doc);
  doc.documentElement = new El('html', doc);
  doc.addEventListener = (t, f) => { (doc.listeners[t] = doc.listeners[t] || []).push(f); };
  doc.getElementById = (id) => (id === 'puedo' ? Object.assign(new El('section', doc), { attrs: { id } }) : null);
  const timers = [];
  const win = {
    listeners: {}, scrollY: 1,
    matchMedia: () => ({ matches: reducido }),
    setTimeout: (f) => { timers.push(f); return timers.length; },
    clearTimeout: (id) => { timers[id - 1] = null; },
    scrollTo() { this.scrollY = 0; },
    addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
    location: {}
  };
  let h = hash;
  Object.defineProperty(win.location, 'hash', {
    get: () => h,
    set: (v) => { if (v === h) return; h = v; (win.listeners.hashchange || []).forEach((f) => f()); }
  });
  const flush = () => { for (let i = 0; i < 500; i++) { const f = timers.find(Boolean); if (!f) return; timers[timers.indexOf(f)] = null; f(); } };
  const raiz = new El('section', doc);
  const datos = {
    cifras: [{ valor: '100 %', etiqueta: 'del ecosistema' }, { valor: '9', etiqueta: 'repos' }],
    eras: [{ era: 'a', titulo: 'En el chat', texto: 'x' }, { era: 'b', titulo: 'Con agentes', texto: 'y' }, { era: 'c', titulo: 'La Factory', texto: 'z' }],
    linea: [
      { era: 'a', fecha: '2026-02-19', titulo: 'Nace La Bóveda', texto: '', ref: '' },
      { era: 'b', fecha: '2026-09-26', titulo: 'Agentes', texto: '', ref: '' },
      ...[19, 20, 21, 22, 24, 30, 31].map((d) => ({ era: 'c', fecha: '2026-10-' + d, titulo: 'F' + d, texto: '', ref: '' }))
    ],
    puedo: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((t) => ({ titulo: t, texto: 'x', color: 'teal' })),
    pasos: ['Producto', 'Arquitectura', 'Desarrollo', 'Revisión', 'Documentación'].map((t) => ({ titulo: t, texto: 'y' })),
    regla: 'Producción pertenece a Pablo.',
    racks: {
      'trabajo-poses': [{ src: 'assets/shiruvana/cuerpo-taller.webp', alt: 'En el taller', ancho: '720', alto: '960', titulo: 'En el taller', sub: 'Construyendo' }],
      vestuarios: ['gala', 'neon', 'pijama'].map((n) => ({ src: 'assets/shiruvana/vestuario-' + n + '.webp', alt: 'Vestida ' + n, ancho: '640', alto: '954', titulo: n.toUpperCase(), sub: 'Ocasión ' + n })),
      caras: ['hola', 'ojo'].map((n) => ({ src: 'assets/shiruvana/' + n + '-480.webp', alt: n, ancho: '480', alto: '640', titulo: n, sub: 's' }))
    },
    eco: [{ href: 'https://a/', titulo: 'La Bóveda', texto: 't', color: 'amber' }, { href: 'https://b/', titulo: 'La Guarida', texto: 't', color: 'teal' }]
  };
  const api = E.crear({ doc, win, raiz, guion: GUION, datos });
  const tecla = (key, target = raiz) => (doc.listeners.keydown || []).forEach((f) => f({ key, target, preventDefault() {} }));
  const texto = () => raiz.porClase('st-tipeo')[0].textContent;
  return { doc, win, raiz, api, flush, tecla, texto, html: doc.documentElement };
}

// ---------- el guion ----------
test('guion: los 7 capítulos en escena, en orden, cada escena con texto, fondo, gato y visual conocidos', () => {
  assert.deepEqual(GUION.capitulos.map((c) => c.id), ['entrada', 'quien-soy', 'lo-que-construi', 'que-puedo-hacer', 'como-trabajo', 'vestidor', 'ecosistema']);
  const tipos = ['portada', 'titulo', 'tarjetas', 'cifras', 'eras', 'linea', 'acciones', 'pasos', 'regla', 'vestidor', 'caras', 'puertas', 'creditos'];
  for (const cap of GUION.capitulos) {
    assert.ok(cap.escenas.length >= 2, cap.id);
    for (const esc of cap.escenas) {
      assert.ok(esc.texto && esc.texto.length > 20, cap.id + ': texto');
      assert.ok(tipos.includes(esc.visual.tipo), cap.id + ': ' + esc.visual.tipo);
      assert.ok(['evolving', 'taller', 'noche'].includes(esc.fondo), cap.id + ': fondo ' + esc.fondo);
      assert.ok([null, 'sentado', 'camina', 'festeja'].includes(esc.gato), cap.id + ': gato ' + esc.gato);
      if (esc.visual.tipo === 'tarjetas') assert.ok(esc.visual.items || esc.visual.fuente === 'puedo', 'tarjetas sin fuente');
      if (esc.visual.tipo === 'vestidor') assert.ok(['vestuarios', 'trabajo-poses'].includes(esc.visual.rack), esc.visual.rack);
    }
  }
  assert.equal(GUION.proximos, undefined, 'ya no queda ningún capítulo fuera de escena');
  const fin = GUION.capitulos.at(-1).escenas.at(-1);
  assert.equal(fin.visual.tipo, 'creditos');
  assert.deepEqual(fin.visual.acciones.map((a) => a.href).slice(1), ['#/', '#lectura']);
  const puedo = GUION.capitulos[3].escenas.map((e) => e.visual);
  assert.deepEqual(puedo.map((v) => [v.desde, v.hasta]), [[0, 4], [4, undefined]], 'las 6 cartas, sin repetir ni saltear');
});

test('guion del gato: imágenes, alt de cada pose, frases y una sola salida de tono', () => {
  for (const p of ['sentado', 'camina', 'festeja']) {
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/gato/gato-' + p + '.webp')), 'falta gato-' + p);
    assert.ok(GUION.gato.alt[p], 'alt ' + p);
  }
  assert.ok(GUION.gato.frases.length >= 3);
  assert.equal(E.fraseGato(GUION.gato, 1), GUION.gato.frases[0]);
  assert.equal(E.fraseGato(GUION.gato, 4), GUION.gato.frases[3]);
  assert.equal(E.fraseGato(GUION.gato, 5), GUION.gato.harto);
  assert.equal(E.fraseGato(GUION.gato, 6), GUION.gato.frases[0], 'después vuelve a empezar');
  assert.equal(E.fraseGato(GUION.gato, 9), GUION.gato.frases[3]);
  assert.equal(E.fraseGato(GUION.gato, 10), GUION.gato.frases[0], 'el «basta» no se repite');
});

test('guion: hablo en primera persona y nunca de mí en tercera', () => {
  const textos = GUION.capitulos.flatMap((c) => c.escenas.map((e) => e.texto)).join(' ');
  assert.match(textos, /Soy Shiruvana/);
  assert.doesNotMatch(textos, /Shiruvana (hace|construyó|es la|cuenta)/);
});

test('guion: toda pose y toda cara existen en assets y las poses tienen alt', () => {
  for (const cap of GUION.capitulos) for (const esc of cap.escenas) {
    if (esc.pose) {
      assert.ok(fs.existsSync(path.join(ROOT, 'assets/shiruvana', esc.pose + '.webp')), esc.pose);
      assert.ok(GUION.poses[esc.pose], 'alt de ' + esc.pose);
    }
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/shiruvana', (esc.cara || 'hola') + '-480.webp')), 'cara ' + esc.cara);
  }
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/shiruvana/hola-cara-128.webp')));
});

test('las anclas que uso existen en el modo lectura', () => {
  const anclas = GUION.capitulos.flatMap((c) => c.escenas)
    .filter((e) => e.visual.acciones).flatMap((e) => e.visual.acciones.map((a) => a.href)).filter((h) => /^#[^/]/.test(h) && h !== '#lectura');
  for (const a of anclas) assert.match(HTML, new RegExp('<section id="' + a.slice(1) + '"'), a);
  for (const r of ['trabajo-poses', 'vestuarios', 'caras']) assert.match(HTML, new RegExp('id="' + r + '"'), r);
});

test('lo que leo de los otros capítulos está en el modo lectura: 6 cartas, 5 pasos, 1 regla, 9+9+7 figuras, 5 puertas', () => {
  const sec = (id) => HTML.slice(HTML.indexOf('<section id="' + id + '">'), HTML.indexOf('</section>', HTML.indexOf('<section id="' + id + '">')));
  assert.equal((sec('puedo').match(/<div class="card (amber|violet|teal)">/g) || []).length, 6);
  assert.equal((sec('trabajo').match(/<div class="step">/g) || []).length, 5);
  assert.equal((sec('trabajo').match(/<p class="rule">/g) || []).length, 1);
  assert.equal((sec('vestidor').match(/<figure class="pose">/g) || []).length, 25);
  const caras = sec('vestidor').slice(sec('vestidor').indexOf('id="caras"'));
  assert.equal((caras.match(/<figure class="pose">/g) || []).length, 7);
  assert.equal((sec('eco').match(/<a class="card (amber|violet|teal)" href="https?:\/\/[^"]+">/g) || []).length, 5);
  for (const f of sec('vestidor').match(/<figure class="pose">.*?<\/figure>/g)) assert.match(f, /<figcaption>[^<]+<span>[^<]+<\/span><\/figcaption>/, 'figcaption con título y bajada');
});

test('los datos que leo del modo lectura están: 5 cifras, 3 eras, 12 hitos (4 chat, 1 agentes, 7 Factory)', () => {
  assert.equal((HTML.match(/<div class="fact">/g) || []).length, 5);
  assert.equal((HTML.match(/<div class="era [abc]">/g) || []).length, 3);
  const tl = HTML.slice(HTML.indexOf('<ol class="tl">'), HTML.indexOf('</ol>'));
  assert.equal((tl.match(/<li class="t-a">/g) || []).length, 4);
  assert.equal((tl.match(/<li>/g) || []).length, 1);
  assert.equal((tl.match(/<li class="t-c">/g) || []).length, 7);
  const linea = GUION.capitulos.flatMap((c) => c.escenas).filter((e) => e.visual.tipo === 'linea');
  const cuenta = { a: 4, b: 1, c: 7 };
  let c = 0;
  for (const e of linea) {
    const n = Math.min(e.visual.hasta == null ? cuenta[e.visual.era] : e.visual.hasta, cuenta[e.visual.era]) - (e.visual.desde || 0);
    assert.ok(n > 0, 'tramo vacío en era ' + e.visual.era);
    if (e.visual.era === 'c') c += n;
  }
  assert.equal(c, 7, 'los 7 hitos de la Factory aparecen una sola vez');
});

test('leerDatos arma cifras, eras y hitos desde el DOM', () => {
  const nodo = (cls, hijos) => ({ className: cls, textContent: '', querySelector: (s) => hijos[s] ? { textContent: ' ' + hijos[s] + ' ' } : null });
  const doc = { querySelectorAll: (s) => ({
    '#quien .fact': [nodo('fact', { b: '100 %', span: 'del ecosistema' })],
    '#hice .era': [nodo('era a', { b: 'En el chat', span: 'x' })],
    '#hice ol.tl li': [nodo('t-a', { time: '2026-02-19', h3: 'Nace', p: 't', '.ref': 'r' }), nodo('', { time: 'x', h3: 'y', p: 'z' })]
  }[s] || []) };
  const d = E.leerDatos(doc);
  assert.deepEqual(d.cifras, [{ valor: '100 %', etiqueta: 'del ecosistema' }]);
  assert.deepEqual(d.eras, [{ era: 'a', titulo: 'En el chat', texto: 'x' }]);
  assert.equal(d.linea[0].era, 'a'); assert.equal(d.linea[0].ref, 'r');
  assert.equal(d.linea[1].era, 'b'); assert.equal(d.linea[1].ref, '');
  assert.deepEqual(d.puedo, []); assert.equal(d.regla, ''); assert.deepEqual(d.racks.vestuarios, []);
});

test('leerDatos arma cartas, pasos, regla, figuras del Vestidor y puertas desde el DOM', () => {
  const t = (s) => ({ textContent: s });
  const nodo = (cls, hijos, extra = {}) => ({ className: cls, textContent: extra.texto || '', getAttribute: (k) => (extra.attrs || {})[k] || null, querySelector: (s) => hijos[s] || null });
  const img = (attrs) => ({ getAttribute: (k) => attrs[k] || null });
  const fig = (src, titulo, sub) => nodo('pose', {
    img: img({ src, alt: 'alt ' + titulo, width: '640', height: '954' }),
    figcaption: { textContent: titulo + sub, querySelector: (s) => (s === 'span' ? t(sub) : null) }
  });
  const doc = { querySelectorAll: (s) => ({
    '#puedo .card': [nodo('card violet', { h3: t('Hablarte'), p: t('Con fundamento') })],
    '#trabajo .step': [nodo('step', { b: t('Producto'), span: t('¿Qué resuelve?') })],
    '#trabajo .rule': [nodo('rule', {}, { texto: ' Producción es de Pablo. ' })],
    '#vestuarios .pose': [fig('assets/shiruvana/vestuario-gala.webp', 'Gala', 'Ocasiones especiales')],
    '#eco a.card': [nodo('card teal', { h3: t('La Guarida'), p: t('Inicio') }, { attrs: { href: 'https://g/' } })]
  }[s] || []) };
  const d = E.leerDatos(doc);
  assert.deepEqual(d.puedo, [{ titulo: 'Hablarte', texto: 'Con fundamento', color: 'violet' }]);
  assert.deepEqual(d.pasos, [{ titulo: 'Producto', texto: '¿Qué resuelve?' }]);
  assert.equal(d.regla, 'Producción es de Pablo.');
  assert.deepEqual(d.racks.vestuarios, [{ src: 'assets/shiruvana/vestuario-gala.webp', alt: 'alt Gala', ancho: '640', alto: '954', titulo: 'Gala', sub: 'Ocasiones especiales' }]);
  assert.deepEqual(d.eco, [{ href: 'https://g/', titulo: 'La Guarida', texto: 'Inicio', color: 'teal' }]);
  assert.equal(E.poseDe('assets/shiruvana/vestuario-gala.webp'), 'vestuario-gala');
  assert.equal(E.dichoDe({ titulo: 'Gala', sub: 'Ocasiones especiales' }), 'Gala: ocasiones especiales.');
  assert.deepEqual(E.tramo([1, 2, 3, 4, 5, 6], { desde: 4 }), [5, 6]);
});

// ---------- rutas ----------
test('rutas: vacío y #/ abren la función; #/<cap>/<n> va a la escena; #sección es modo lectura', () => {
  const L = E.aplanar(GUION);
  assert.deepEqual(E.leerHash('', L), { modo: 'funcion', i: 0 });
  assert.deepEqual(E.leerHash('#/', L), { modo: 'funcion', i: 0 });
  assert.equal(E.leerHash('#/quien-soy/3', L).i, L.findIndex((p) => p.cap.id === 'quien-soy' && p.e === 2));
  assert.equal(E.leerHash('#/quien-soy/99', L).i, L.findIndex((p) => p.cap.id === 'quien-soy'));
  assert.equal(E.leerHash('#/no-existe', L).i, 0);
  assert.deepEqual(E.leerHash('#quien', L), { modo: 'lectura', ancla: 'quien' });
  assert.deepEqual(E.leerHash('#lectura', L), { modo: 'lectura', ancla: 'lectura' });
  for (let i = 0; i < L.length; i++) assert.equal(E.leerHash(E.hashDe(L, i), L).i, i, 'ida y vuelta ' + i);
  assert.deepEqual(E.cifra('100 %'), { n: 100, resto: ' %' });
  assert.equal(E.cifra('AA'), null);
});

// ---------- el motor andando ----------
test('arranca en la primera escena, en modo función, con la portada y mi saludo tipeándose', () => {
  const m = montar();
  assert.ok(m.html.classList.contains('funcion'));
  assert.equal(m.api.estado.actual, 0);
  assert.equal(m.raiz.porClase('v-portada').length, 1);
  assert.equal(m.raiz.porClase('st-ojos').length, 1, 'se abren los ojos del gato');
  assert.ok(m.api.estado.escribiendo);
  assert.ok(m.texto().length < GUION.capitulos[0].escenas[0].texto.length);
  assert.equal(m.raiz.porClase('st-sr')[0].textContent, GUION.capitulos[0].escenas[0].texto, 'el lector de pantalla recibe el texto completo');
  m.flush();
  assert.equal(m.texto(), GUION.capitulos[0].escenas[0].texto);
  assert.equal(m.raiz.porClase('st-cuenta')[0].textContent, '1 / ' + m.api.lista.length);
  assert.equal(m.raiz.porClase('st-prev')[0].disabled, true);
});

test('avanzar: el primer toque completa el texto, el segundo pasa de escena y cambia el hash', () => {
  const m = montar();
  m.api.avanzar();
  assert.equal(m.api.estado.actual, 0);
  assert.equal(m.texto(), GUION.capitulos[0].escenas[0].texto);
  m.api.avanzar();
  assert.equal(m.api.estado.actual, 1);
  assert.equal(m.win.location.hash, '#/entrada/2');
  const pose = m.raiz.porClase('st-pose');
  assert.equal(pose.length, 1);
  assert.equal(pose[0].getAttribute('src'), 'assets/shiruvana/cuerpo-saluda.webp');
  assert.ok(pose[0].getAttribute('alt'));
});

test('teclado, clic y deslizar: → ← Inicio Fin y Esc; los botones no disparan doble avance', () => {
  const m = montar();
  const ultimo = m.api.lista.length - 1;
  m.flush(); m.tecla('ArrowRight'); assert.equal(m.api.estado.actual, 1);
  m.tecla('ArrowLeft'); assert.equal(m.api.estado.actual, 0);
  m.tecla('End'); assert.equal(m.api.estado.actual, ultimo);
  assert.equal(m.raiz.porClase('st-next')[0].disabled, true);
  m.flush(); m.tecla('ArrowRight'); assert.equal(m.api.estado.actual, ultimo, 'no pasa del final');
  m.tecla('Home'); assert.equal(m.api.estado.actual, 0);
  m.flush();
  m.raiz.emitir('click'); assert.equal(m.api.estado.actual, 1, 'clic en el escenario avanza');
  m.flush();
  const lectura = m.raiz.porClase('st-lectura')[0];
  lectura.emitir('click'); assert.equal(m.api.estado.actual, 1, 'clic en un enlace no avanza');
  m.tecla('Enter', lectura); assert.equal(m.api.estado.actual, 1, 'Enter sobre un enlace es del enlace');
  m.raiz.porClase('st-next')[0].emitir('click'); assert.equal(m.api.estado.actual, 2, 'Siguiente avanza una sola vez');
  m.flush();
  m.raiz.emitir('touchstart', { changedTouches: [{ clientX: 300, clientY: 100 }] });
  m.raiz.emitir('touchend', { changedTouches: [{ clientX: 100, clientY: 110 }] });
  assert.equal(m.api.estado.actual, 3, 'deslizar a la izquierda avanza');
  m.raiz.emitir('touchstart', { changedTouches: [{ clientX: 100, clientY: 100 }] });
  m.raiz.emitir('touchend', { changedTouches: [{ clientX: 300, clientY: 100 }] });
  assert.equal(m.api.estado.actual, 2, 'deslizar a la derecha vuelve');
  m.tecla('Escape');
  assert.equal(m.win.location.hash, '#lectura');
  assert.ok(!m.html.classList.contains('funcion'));
});

test('modo lectura y vuelta: #puedo va a la sección; #/ vuelve a empezar; las teclas no actúan leyendo', () => {
  const m = montar({ hash: '#puedo' });
  assert.ok(!m.html.classList.contains('funcion'));
  assert.equal(m.doc.scrolledTo, 'puedo');
  m.tecla('ArrowRight');
  assert.equal(m.api.estado.actual, -1);
  m.win.location.hash = '#/';
  assert.ok(m.html.classList.contains('funcion'));
  assert.equal(m.api.estado.actual, 0);
  assert.equal(m.raiz.porClase('st-ojos').length, 1, 'la primera entrada a la función abre los ojos del gato');
  m.flush();
  assert.equal(m.raiz.porClase('st-ojos').length, 0, 'y se retiran solos');
  m.win.location.hash = '#lectura';
  m.win.location.hash = '#/';
  assert.equal(m.raiz.porClase('st-ojos').length, 0, 'no se repiten en la segunda entrada');
  assert.equal(m.api.estado.actual, 0, 'volver a la función repinta la escena');
  assert.equal(m.raiz.porClase('v-portada').length, 1);
});

test('cada capítulo marca su pastilla y la escena de cifras y de hitos usa los datos de lectura', () => {
  const m = montar({ hash: '#/quien-soy/4' });
  const pills = m.raiz.porClase('st-cap');
  assert.equal(pills.length, GUION.capitulos.length);
  assert.equal(m.raiz.porClase('pronto').length, 0);
  assert.equal(pills[1].getAttribute('aria-current'), 'step');
  assert.equal(pills[0].getAttribute('aria-current'), null);
  assert.equal(m.raiz.porClase('v-cifra').length, 2);
  m.win.location.hash = '#/lo-que-construi/4';
  const hitos = m.raiz.porClase('v-linea')[0].todos((x) => x.tagName === 'LI');
  assert.deepEqual(hitos.map((li) => li.children[1].textContent), ['F19', 'F20', 'F21']);
  m.win.location.hash = '#/lo-que-construi/5';
  assert.equal(m.raiz.porClase('v-linea')[0].todos((x) => x.tagName === 'LI').length, 4);
});

test('movimiento reducido: sin tipeo, sin ojos, texto completo al instante', () => {
  const m = montar({ reducido: true });
  assert.equal(m.api.estado.escribiendo, false);
  assert.equal(m.texto(), GUION.capitulos[0].escenas[0].texto);
  assert.equal(m.raiz.porClase('st-ojos').length, 0);
  m.api.avanzar();
  assert.equal(m.api.estado.actual, 1, 'sin tipeo, un toque ya avanza');
});

// ---------- MC-2: gato, Vestidor, cortina y los capítulos nuevos ----------
const ir = (m, hash) => { m.win.location.hash = hash; m.flush(); };
const gato = (m) => m.raiz.porClase('st-gato')[0];
const gatoImg = (m) => gato(m).children[0];

test('el gato: no está en la portada, llega en la escena 2, cambia de pose y se va cuando el guion dice null', () => {
  const m = montar();
  assert.notEqual(gato(m).getAttribute('hidden'), null, 'en la portada no está');
  ir(m, '#/entrada/2');
  assert.equal(gato(m).getAttribute('hidden'), null);
  assert.equal(gatoImg(m).getAttribute('src'), 'assets/gato/gato-camina.webp');
  assert.ok(gato(m).classList.contains('g-camina'));
  assert.equal(gatoImg(m).getAttribute('alt'), GUION.gato.alt.camina);
  ir(m, '#/quien-soy/1');
  assert.equal(gatoImg(m).getAttribute('src'), 'assets/gato/gato-sentado.webp');
  ir(m, '#/vestidor/3');
  assert.notEqual(gato(m).getAttribute('hidden'), null, 'en las caras se baja del globo');
});

test('tocar al gato: habla, festeja, no avanza la escena y al quinto toque se harta', () => {
  const m = montar({ hash: '#/quien-soy/1' });
  m.flush();
  const dice = m.raiz.porClase('st-gato-dice')[0];
  gato(m).emitir('click');
  assert.equal(m.api.estado.actual, 2, 'tocar al gato no avanza');
  assert.equal(dice.textContent, GUION.gato.frases[0]);
  assert.equal(gatoImg(m).getAttribute('src'), 'assets/gato/gato-festeja.webp');
  assert.ok(m.raiz.porClase('st-globo')[0].classList.contains('gato-habla'));
  m.flush();
  assert.equal(dice.textContent, '', 'se calla solo');
  assert.equal(gatoImg(m).getAttribute('src'), 'assets/gato/gato-sentado.webp', 'y vuelve a su pose');
  for (let i = 0; i < 4; i++) gato(m).emitir('click');
  assert.equal(dice.textContent, GUION.gato.harto);
});

test('si una imagen del gato no carga, el gato desaparece y no rompe nada', () => {
  const m = montar({ hash: '#/quien-soy/1' });
  gatoImg(m).emitir('error');
  assert.notEqual(gato(m).getAttribute('hidden'), null);
  ir(m, '#/quien-soy/4');
  assert.notEqual(gato(m).getAttribute('hidden'), null, 'sigue escondido aunque cambie de pose');
  assert.equal(m.api.estado.actual, 5);
});

test('cortina: al cambiar de capítulo aparece con su número y se va sola; no en la primera escena ni dentro del capítulo', () => {
  const m = montar();
  assert.equal(m.raiz.porClase('st-cortina').length, 0, 'no al arrancar');
  m.flush(); m.tecla('ArrowRight');
  assert.equal(m.raiz.porClase('st-cortina').length, 0, 'no dentro del capítulo');
  m.flush(); m.tecla('ArrowRight');
  const c = m.raiz.porClase('st-cortina');
  assert.equal(c.length, 1);
  assert.equal(c[0].textContent, '02Quién soy');
  assert.equal(c[0].getAttribute('aria-hidden'), 'true');
  m.flush();
  assert.equal(m.raiz.porClase('st-cortina').length, 0, 'se retira');
  ir(m, '#lectura');
  m.win.location.hash = '#/vestidor/1';
  assert.equal(m.raiz.porClase('st-cortina').length, 0, 'volviendo del modo lectura, sin cortina');
  const r = montar({ reducido: true, hash: '#/entrada/2' });
  r.tecla('ArrowRight');
  assert.equal(r.api.estado.actual, 2);
  assert.equal(r.raiz.porClase('st-cortina').length, 0, 'con movimiento reducido, sin cortina');
});

test('Qué puedo hacer y Cómo trabajo: cartas en dos tramos, cinco pasos y la regla, todo desde el modo lectura', () => {
  const m = montar({ hash: '#/que-puedo-hacer/1' });
  assert.deepEqual(m.raiz.porClase('v-tarjeta').map((t) => t.children[0].textContent), ['P1', 'P2', 'P3', 'P4']);
  ir(m, '#/que-puedo-hacer/2');
  assert.deepEqual(m.raiz.porClase('v-tarjeta').map((t) => t.children[0].textContent), ['P5', 'P6']);
  assert.ok(m.raiz.porClase('v-tarjeta')[0].classList.contains('teal'));
  ir(m, '#/como-trabajo/1');
  const pasos = m.raiz.porClase('v-pasos')[0].children;
  assert.deepEqual(pasos.map((li) => li.children[0].textContent), ['Producto', 'Arquitectura', 'Desarrollo', 'Revisión', 'Documentación']);
  ir(m, '#/como-trabajo/2');
  assert.equal(m.raiz.porClase('v-regla')[0].todos((x) => x.tagName === 'BLOCKQUOTE')[0].textContent, 'Producción pertenece a Pablo.');
});

test('Vestidor: tocar una percha me cambia de ropa, lo digo, marca la elegida y no avanza; al salir vuelvo a mi pose', () => {
  const m = montar({ hash: '#/vestidor/1' });
  m.flush();
  const perchas = m.raiz.porClase('v-percha');
  assert.equal(perchas.length, 3);
  assert.equal(perchas[0].getAttribute('type'), 'button');
  assert.equal(perchas[0].children[0].getAttribute('loading'), 'lazy');
  perchas[1].emitir('click');
  assert.equal(m.api.estado.actual, m.api.lista.findIndex((p) => p.cap.id === 'vestidor'), 'no avanza');
  const pose = m.raiz.porClase('st-pose').filter((x) => !x.classList.contains('sale'));
  assert.equal(pose.length, 1);
  assert.equal(pose[0].getAttribute('src'), 'assets/shiruvana/vestuario-neon.webp');
  assert.equal(pose[0].getAttribute('alt'), 'Vestida neon');
  assert.equal(m.raiz.porClase('st-sr')[0].textContent, 'NEON: ocasión neon.');
  assert.deepEqual(perchas.map((p) => p.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  m.flush(); m.tecla('Enter', perchas[2]);
  assert.equal(m.api.estado.actual, m.api.lista.findIndex((p) => p.cap.id === 'vestidor'), 'Enter sobre una percha es de la percha');
  ir(m, '#/vestidor/2');
  const actual = m.raiz.porClase('st-pose').filter((x) => !x.classList.contains('sale'));
  assert.equal(actual[0].getAttribute('src'), 'assets/shiruvana/cuerpo-presenta.webp');
  assert.equal(m.raiz.porClase('v-percha')[0].children[0].getAttribute('width'), '720', 'respeta el tamaño de cada figura');
  ir(m, '#/vestidor/3');
  assert.equal(m.raiz.porClase('v-caras')[0].children.length, 2);
});

test('Ecosistema: puertas que son enlaces reales, mi pose en la puerta con respaldo, y créditos con salida', () => {
  const m = montar({ hash: '#/ecosistema/1' });
  const puertas = m.raiz.porClase('v-puerta');
  assert.deepEqual(puertas.map((p) => [p.tagName, p.getAttribute('href')]), [['A', 'https://a/'], ['A', 'https://b/']]);
  puertas[0].emitir('click');
  assert.equal(m.win.location.hash, '#/ecosistema/1', 'entrar por una puerta no avanza la función');
  const pose = m.raiz.porClase('st-pose')[0];
  assert.equal(pose.getAttribute('src'), 'assets/shiruvana/cuerpo-puerta.webp');
  pose.emitir('error');
  assert.equal(pose.getAttribute('src'), 'assets/shiruvana/cuerpo-espalda.webp', 'si la puerta no está subida, me ves de espaldas');
  ir(m, '#/ecosistema/2');
  assert.equal(m.api.estado.actual, m.api.lista.length - 1);
  const cred = m.raiz.porClase('v-creditos')[0];
  assert.ok(cred.textContent.includes('Pablo') && cred.textContent.includes('Shiruvana'));
  assert.deepEqual(cred.porClase('st-btn').map((b) => b.getAttribute('href')), ['https://pablosnchz.github.io/gw2-wallet-ligero/', '#/', '#lectura']);
  cred.porClase('st-btn')[1].emitir('click');
  m.win.location.hash = '#/';
  assert.equal(m.api.estado.actual, 0, 'Ver de nuevo vuelve al principio');
});

// ---------- página, estilos y reglas del sitio ----------
test('index.html: escenario vacío al principio del body, scripts al final y arranque seguro', () => {
  assert.match(HTML, /<body>\n<section id="escenario" aria-roledescription="presentación" aria-label="[^"]+" tabindex="-1"><\/section>/);
  assert.match(HTML, /<script src="js\/guion\.js"><\/script>\n<script src="js\/escenario\.js"><\/script>\n<\/body>/);
  assert.match(HTML, /<link rel="stylesheet" href="css\/escenario\.css">/);
  assert.match(HTML, /ESCENARIO_OK\) d\.documentElement\.classList\.remove\('funcion'\)/, 'si el escenario no carga, vuelve la lectura');
  assert.match(HTML, /<a class="l play" href="#\/">/, 'desde la lectura se vuelve a la presentación');
});

test('CSS: solo actúa con html.funcion, respeta movimiento reducido y celular, sus url() existen', () => {
  assert.match(CSS, /#escenario \{ display: none; \}/);
  assert.match(CSS, /html\.funcion body > \*:not\(#escenario\) \{ display: none !important; \}/);
  assert.match(CSS, /@media \(prefers-reduced-motion: reduce\) \{[^@]*animation: none !important/);
  assert.match(CSS, /@media \(max-width: 760px\)/);
  for (const [, u] of CSS.matchAll(/url\("([^"]+)"\)/g)) assert.ok(fs.existsSync(path.join(ROOT, 'css', u)), 'falta ' + u);
});

test('sin datos privados ni almacenamiento: el motor y el guion no guardan nada ni piden nada afuera', () => {
  for (const src of [MOTOR_SRC, GUION_SRC, CSS]) {
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/);
    assert.doesNotMatch(src, /fetch\(|XMLHttpRequest/);
    assert.doesNotMatch(src, /api[_-]?key|token|@[a-z0-9-]+\.(com|ar)/i);
  }
});

test('tamaño: cada archivo nuevo bajo 40 KB (DEC-021)', () => {
  for (const p of ['js/escenario.js', 'js/guion.js', 'css/escenario.css']) assert.ok(fs.statSync(path.join(ROOT, p)).size < 40 * 1024, p);
});
