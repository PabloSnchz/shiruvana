// Chequeos del sitio de Shiruvana (BL-086). Corren con: node --test tests/
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const local = (u) => !/^(https?:|#|mailto:)/.test(u);
const refs = [...HTML.matchAll(/\b(?:src|srcset|href)="([^"]+)"/g)].map((m) => m[1]).filter(local);

test('toda imagen y recurso local existe en el repo', () => {
  assert.ok(refs.length >= 10);
  for (const r of refs) assert.ok(fs.existsSync(path.join(ROOT, r)), 'falta ' + r);
});

test('las imágenes son propias del sitio: no dependen de La Guarida ni de otro repo', () => {
  assert.doesNotMatch(HTML, /<img[^>]+src="https?:/, 'ninguna <img> remota');
  assert.doesNotMatch(HTML, /la-guarida\/assets/);
});

test('accesibilidad: idioma, toda <img> con alt, un solo h1 y salto al contenido', () => {
  assert.match(HTML, /<html lang="es">/);
  for (const img of HTML.match(/<img\b[^>]*>/g)) assert.match(img, /\balt="/, img.slice(0, 60));
  assert.equal((HTML.match(/<h1\b/g) || []).length, 1);
  assert.match(HTML, /class="skip" href="#quien"/);
  assert.match(HTML, /:focus-visible/);
});

test('las imágenes no se estiran: alto automático cuando el CSS fija el ancho', () => {
  const css = HTML.slice(HTML.indexOf('<style>'), HTML.indexOf('</style>'));
  assert.match(css, /\bimg \{[^}]*height: auto/, 'regla general img con height: auto');
  for (const sel of ['.about img', '.pose img']) {
    const rule = css.match(new RegExp(sel.replace('.', '\\.') + ' \\{([^}]*)\\}'));
    assert.ok(rule, sel);
    assert.match(rule[1], /height: auto/, sel + ' sin height: auto');
  }
});

test('cuenta mi historia completa: el ecosistema desde 2026-02-19, en sus tres etapas', () => {
  for (const s of ['2026-02-19', 'En el chat', 'Con agentes', 'La Factory', '100 %']) assert.ok(HTML.includes(s), s);
});

test('sin datos privados: ni keys, ni tokens, ni correos', () => {
  assert.doesNotMatch(HTML, /api[_-]?key|token|@[a-z0-9-]+\.(com|ar)/i);
});

test('Vestidor de cuerpo entero: 9 de trabajo y 9 vestuarios, sin «Próximamente»', () => {
  const sec = HTML.slice(HTML.indexOf('<section id="vestidor">'), HTML.indexOf('<section id="eco">'));
  const rack = (id) => sec.slice(sec.indexOf('id="' + id + '"'), sec.indexOf('</div>\n    </div>', sec.indexOf('id="' + id + '"')));
  const imgs = (block) => [...block.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)];
  const trabajo = imgs(rack('trabajo-poses'));
  const vestuarios = imgs(rack('vestuarios'));
  assert.equal(trabajo.length, 9, 'trabajo');
  assert.equal(vestuarios.length, 9, 'vestuarios');
  for (const [, src] of trabajo) assert.match(src, /^assets\/shiruvana\/cuerpo-[a-z]+\.webp$/);
  for (const [, src] of vestuarios) assert.match(src, /^assets\/shiruvana\/vestuario-[a-z]+\.webp$/);
  assert.equal(new Set([...trabajo, ...vestuarios].map((m) => m[1])).size, 18, 'sin repetidas');
  for (const [tag] of [...trabajo, ...vestuarios]) {
    assert.match(tag, /width="\d+" height="\d+"/, 'sin tamaño: ' + tag.slice(0, 70));
    assert.match(tag, /loading="lazy"/);
  }
  assert.doesNotMatch(sec, /Próximamente/);
  const css = HTML.slice(HTML.indexOf('<style>'), HTML.indexOf('</style>'));
  assert.match(css, /\.full \.pose img \{[^}]*aspect-ratio: 2\/3[^}]*object-fit: contain/, 'cuerpo entero sin recortar');
});
