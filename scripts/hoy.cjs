#!/usr/bin/env node
/* Hoy en la Factory (BL-090 MC-4).
   Lee mi memoria oficial (gw2-factory-dev/ai-memory) y escribe data/hoy.js, que la
   función carga como un script más: sin fetch, sin servidores, sin nada privado.
   Uso: node scripts/hoy.cjs <carpeta de gw2-factory-dev> [data/hoy.js]
   Si los datos no cambiaron, no toca el archivo (así la Action no hace commits vacíos). */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const MAX_TAREA = 160;

function contar(dir, re) {
  try { return fs.readdirSync(dir).filter((f) => re.test(f)).length; } catch (e) { return 0; }
}

// «## SECCIÓN» → cantidad de líneas «- [BL-NNN]» que tiene.
function secciones(backlog) {
  const out = {};
  let actual = null;
  for (const l of String(backlog).split('\n')) {
    const h = /^## (\S.*?)\s*$/.exec(l);
    if (h) { actual = h[1].toUpperCase(); out[actual] = out[actual] || 0; continue; }
    if (actual && /^- \[BL-\d{3}\]/.test(l)) out[actual] += 1;
  }
  return out;
}

function limpiar(t) {
  return String(t || '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // enlaces markdown → su texto
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function recortar(t, n) {
  if (t.length <= n) return t;
  const corte = t.slice(0, n - 1);
  const esp = corte.lastIndexOf(' ');
  return (esp > n * 0.6 ? corte.slice(0, esp) : corte) + '…';
}

function clave(status, k) {
  const m = new RegExp('^' + k + ':[ \\t]*(.*)$', 'm').exec(status);
  return m ? limpiar(m[1]) : '';
}

// La fecha de «Última actualización: 2026-11-16 22:37Z» en ISO, o '' si no se entiende.
function fechaIso(t) {
  const m = /(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/.exec(t || '');
  return m ? m[1] + 'T' + m[2] + ':' + m[3] + ':00Z' : '';
}

function semana(repo) {
  try {
    return parseInt(execFileSync('git', ['-C', repo, 'rev-list', '--count', '--since=7 days ago', 'HEAD'], { encoding: 'utf8' }).trim(), 10) || 0;
  } catch (e) { return null; }
}

function leer(repo, opciones) {
  const o = opciones || {};
  const mem = path.join(repo, 'ai-memory');
  const status = fs.readFileSync(path.join(mem, 'status.md'), 'utf8');
  const backlog = fs.readFileSync(path.join(mem, 'backlog.md'), 'utf8');
  const s = secciones(backlog);
  return {
    actualizado: fechaIso(clave(status, 'Última actualización')),
    estado: recortar(clave(status, 'Estado'), 60),
    tarea: recortar(clave(status, 'Tarea actual'), MAX_TAREA),
    etapa: recortar(clave(status, 'Etapa actual'), 60),
    backlog: { curso: s.IN_PROGRESS || 0, listas: s.READY || 0, bloqueadas: s.BLOCKED || 0, hechas: s.DONE || 0 },
    decisiones: contar(path.join(mem, 'decisions'), /^DEC-\d{3}.*\.md$/),
    lecciones: contar(path.join(mem, 'lessons'), /^LES-\d{3}.*\.md$/),
    funcionalidades: contar(path.join(mem, 'features'), /^FEAT-\d{3}.*\.md$/),
    parches: contar(path.join(repo, 'factory', 'patches'), /^PATCH-\d{3,}\.json$/),
    semana: o.semana !== undefined ? o.semana : semana(repo)
  };
}

function aJs(datos, generado) {
  const todo = Object.assign({ version: 1, generado: generado }, datos);
  return '/* Generado por scripts/hoy.cjs desde gw2-factory-dev/ai-memory. No editar a mano. */\n' +
    'window.SHIRUVANA_HOY = ' + JSON.stringify(todo, null, 1) + ';\n';
}

// Lo que ya está publicado, sin la hora de generación (para comparar).
function previo(archivo) {
  try {
    const t = fs.readFileSync(archivo, 'utf8');
    const j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
    delete j.generado; delete j.version;
    return j;
  } catch (e) { return null; }
}

function escribir(repo, archivo, opciones) {
  const datos = leer(repo, opciones);
  const antes = previo(archivo);
  if (antes && JSON.stringify(antes) === JSON.stringify(datos)) return false;
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, aJs(datos, (opciones && opciones.ahora) || new Date().toISOString().slice(0, 19) + 'Z'));
  return true;
}

module.exports = { secciones, limpiar, recortar, clave, fechaIso, leer, aJs, previo, escribir };

if (require.main === module) {
  const repo = process.argv[2];
  const archivo = process.argv[3] || path.join(__dirname, '..', 'data', 'hoy.js');
  if (!repo) { console.error('Uso: node scripts/hoy.cjs <gw2-factory-dev> [data/hoy.js]'); process.exit(2); }
  const cambio = escribir(repo, archivo);
  console.log(cambio ? 'hoy.js actualizado' : 'sin cambios');
}
