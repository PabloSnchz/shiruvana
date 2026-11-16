// Chequeos del generador de «Hoy en la Factory» (BL-090 MC-4). Corren con: node --test tests/hoy.test.cjs
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const H = require('../scripts/hoy.cjs');

const ROOT = path.join(__dirname, '..');

function fabrica() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'factory-'));
  const mem = path.join(repo, 'ai-memory');
  for (const d of ['decisions', 'lessons', 'features']) fs.mkdirSync(path.join(mem, d), { recursive: true });
  fs.mkdirSync(path.join(repo, 'factory', 'patches'), { recursive: true });
  fs.writeFileSync(path.join(mem, 'status.md'), [
    '# Estado', '', 'Última actualización: 2026-11-16 22:37Z', '',
    'Estado: EN CURSO', 'Tarea actual: BL-090 — El **sitio** de Shiruvana como [presentación](https://x/) animada, con `escenas`', 'Motivo: x',
    'Etapa actual: DEVELOPMENT', 'Próxima acción: seguir', '', '## Esperando a Pablo', '', '- [BL-090] Validación: algo privado que no publico', ''
  ].join('\n'));
  fs.writeFileSync(path.join(mem, 'backlog.md'), [
    '# Backlog', '', '## READY', '', '- [BL-091] [ALTO] a', '- [BL-092] [MEDIO] b', '', '## IN_PROGRESS', '', '- [BL-090] [MEDIO] c',
    '  - sub [BL-001] no cuenta', '', '## BLOCKED', '', '## DONE', '', '- [BL-001] d', '- [BL-002] e', '- [BL-003] f', ''
  ].join('\n'));
  ['DEC-001-a.md', 'DEC-002-b.md', 'README.md'].forEach((f) => fs.writeFileSync(path.join(mem, 'decisions', f), 'x'));
  ['LES-001-a.md'].forEach((f) => fs.writeFileSync(path.join(mem, 'lessons', f), 'x'));
  ['FEAT-000-a.md', 'FEAT-001-b.md', 'FEAT-002-c.md'].forEach((f) => fs.writeFileSync(path.join(mem, 'features', f), 'x'));
  ['PATCH-001.json', 'PATCH-378.json', 'RESULT-378.md'].forEach((f) => fs.writeFileSync(path.join(repo, 'factory', 'patches', f), 'x'));
  return repo;
}

test('leer: cuenta decisiones, lecciones, funcionalidades, parches y el backlog por sección', () => {
  const d = H.leer(fabrica(), { semana: 12 });
  assert.equal(d.decisiones, 2);
  assert.equal(d.lecciones, 1);
  assert.equal(d.funcionalidades, 3);
  assert.equal(d.parches, 2, 'solo PATCH-*.json, no los RESULT');
  assert.deepEqual(d.backlog, { curso: 1, listas: 2, bloqueadas: 0, hechas: 3 });
  assert.equal(d.semana, 12);
});

test('leer: la tarea, la etapa y la fecha salen de status.md, limpias; lo que espera a Pablo no se publica', () => {
  const d = H.leer(fabrica(), { semana: 0 });
  assert.equal(d.tarea, 'BL-090 — El sitio de Shiruvana como presentación animada, con escenas');
  assert.equal(d.etapa, 'DEVELOPMENT');
  assert.equal(d.estado, 'EN CURSO');
  assert.equal(d.actualizado, '2026-11-16T22:37:00Z');
  assert.doesNotMatch(JSON.stringify(d), /privado|Validación|https?:/);
});

test('recortar: corta en una palabra y nunca pasa del máximo', () => {
  assert.equal(H.recortar('corto', 10), 'corto');
  const t = H.recortar('una tarea muy larga que no entra en el globo', 20);
  assert.ok(t.length <= 20, t);
  assert.ok(t.endsWith('…'));
  assert.doesNotMatch(t, / …$/);
  assert.equal(H.fechaIso('sin fecha'), '');
});

test('escribir: genera window.SHIRUVANA_HOY; si nada cambió no reescribe (sin commits vacíos)', () => {
  const repo = fabrica();
  const archivo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hoy-')), 'data', 'hoy.js');
  assert.equal(H.escribir(repo, archivo, { semana: 5, ahora: '2026-11-16T23:00:00Z' }), true);
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(archivo, 'utf8'), ctx);
  assert.equal(ctx.window.SHIRUVANA_HOY.version, 1);
  assert.equal(ctx.window.SHIRUVANA_HOY.generado, '2026-11-16T23:00:00Z');
  assert.equal(ctx.window.SHIRUVANA_HOY.decisiones, 2);
  assert.equal(H.escribir(repo, archivo, { semana: 5, ahora: '2026-11-17T01:00:00Z' }), false, 'mismos datos: no toca nada');
  assert.match(fs.readFileSync(archivo, 'utf8'), /2026-11-16T23:00:00Z/);
  fs.writeFileSync(path.join(repo, 'ai-memory', 'decisions', 'DEC-003-c.md'), 'x');
  assert.equal(H.escribir(repo, archivo, { semana: 5, ahora: '2026-11-17T02:00:00Z' }), true, 'una decisión nueva sí');
});

test('la Action: corre sola cada 2 horas, lee la Factory pública y solo commitea si hubo cambios', () => {
  const yml = fs.readFileSync(path.join(ROOT, '.github/workflows/hoy.yml'), 'utf8');
  assert.match(yml, /schedule:\n\s+- cron: '\d+ \*\/2 \* \* \*'/);
  assert.match(yml, /workflow_dispatch:/);
  assert.match(yml, /contents: write/);
  assert.match(yml, /repository: PabloSnchz\/gw2-factory-dev/);
  assert.match(yml, /fetch-depth: 0/);
  assert.match(yml, /node scripts\/hoy\.cjs factory data\/hoy\.js/);
  assert.match(yml, /git diff --quiet -- data\/hoy\.js/);
  assert.doesNotMatch(yml, /secrets\./, 'no necesita secretos: la Factory es pública');
});
