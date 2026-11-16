/* Escenario 1.0.0 — mi presentación por escenas (BL-090 MC-1).
   Motor sin dependencias: lee el guion (js/guion.js) y los datos del modo lectura
   (index.html), y arma la función a pantalla completa.
   Rutas: #/<capitulo>/<n> = función; #lectura o #<sección> = modo lectura.
   No guarda nada en el navegador. */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var POSES = 'assets/shiruvana/';
  var TIPEO_MS = 22;
  var TIPEO_PASO = 2;

  // ---------- lógica pura (se testea sin navegador) ----------

  function aplanar(guion) {
    var out = [];
    guion.capitulos.forEach(function (cap, c) {
      cap.escenas.forEach(function (esc, e) { out.push({ c: c, e: e, cap: cap, esc: esc }); });
    });
    return out;
  }

  function hashDe(lista, i) {
    var p = lista[i];
    return '#/' + p.cap.id + '/' + (p.e + 1);
  }

  function leerHash(hash, lista) {
    hash = hash || '';
    if (hash === '' || hash === '#') return { modo: 'funcion', i: 0 };
    if (hash.indexOf('#/') !== 0) return { modo: 'lectura', ancla: hash.slice(1) };
    var partes = hash.slice(2).split('/');
    var id = partes[0] || '';
    var n = parseInt(partes[1], 10) || 1;
    var primero = -1;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].cap.id !== id) continue;
      if (primero < 0) primero = i;
      if (lista[i].e === n - 1) return { modo: 'funcion', i: i };
    }
    return { modo: 'funcion', i: primero >= 0 ? primero : 0 };
  }

  function cifra(valor) {
    var m = /^(\d+)(.*)$/.exec(String(valor).trim());
    return m ? { n: parseInt(m[1], 10), resto: m[2] } : null;
  }

  function lineaDe(datos, v) {
    var items = datos.linea.filter(function (x) { return x.era === v.era; });
    return items.slice(v.desde || 0, v.hasta == null ? items.length : v.hasta);
  }

  // ---------- datos del modo lectura ----------

  function txt(el, sel) {
    var x = sel ? el.querySelector(sel) : el;
    return x ? x.textContent.trim() : '';
  }

  function leerDatos(doc) {
    var q = function (s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); };
    return {
      cifras: q('#quien .fact').map(function (f) { return { valor: txt(f, 'b'), etiqueta: txt(f, 'span') }; }),
      eras: q('#hice .era').map(function (f) {
        return { era: f.className.replace(/\bera\b/, '').trim(), titulo: txt(f, 'b'), texto: txt(f, 'span') };
      }),
      linea: q('#hice ol.tl li').map(function (li) {
        var m = /\bt-([ac])\b/.exec(li.className || '');
        return { era: m ? m[1] : 'b', fecha: txt(li, 'time'), titulo: txt(li, 'h3'), texto: txt(li, 'p'), ref: txt(li, '.ref') };
      })
    };
  }

  // ---------- escenario ----------

  function crear(o) {
    var doc = o.doc, win = o.win, raiz = o.raiz, guion = o.guion, datos = o.datos;
    var html = doc.documentElement;
    var lista = aplanar(guion);
    var reducido = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var estado = { modo: null, actual: -1, pose: undefined, fondo: null, escribiendo: false, timer: null, texto: '' };
    var primeraVez = true;

    function h(tag, attrs, hijos) {
      var el = doc.createElement(tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (k) {
          var v = attrs[k];
          if (v == null || v === false) return;
          if (k === 'class') el.className = v;
          else if (k === 'text') el.textContent = v;
          else el.setAttribute(k, v === true ? '' : String(v));
        });
      }
      (hijos || []).forEach(function (x) { if (x) el.appendChild(x); });
      return el;
    }
    function hijosDe(el) { return Array.prototype.slice.call(el.children || []); }
    function vaciar(el) { while (el.firstChild) el.removeChild(el.firstChild); }
    function retirar(el, ms) {
      el.classList.add('sale');
      win.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, reducido ? 0 : ms);
    }
    function escalonar(el, i) { el.style.setProperty('--i', String(i)); return el; }

    // Esqueleto (una sola vez)
    var capas = h('div', { class: 'st-capas', 'aria-hidden': 'true' });
    var chispas = h('div', { class: 'st-chispas', 'aria-hidden': 'true' });
    for (var k = 0; k < 14; k++) chispas.appendChild(escalonar(h('i'), k));
    var caps = h('nav', { class: 'st-caps', 'aria-label': 'Capítulos' });
    var pills = guion.capitulos.map(function (cap) {
      var a = h('a', { class: 'st-cap', href: '#/' + cap.id, text: cap.titulo });
      caps.appendChild(a);
      return a;
    });
    (guion.proximos || []).forEach(function (p) {
      caps.appendChild(h('a', { class: 'st-cap pronto', href: p.ancla, title: 'En el modo lectura; pronto en escena', text: p.titulo }));
    });
    var barra = h('header', { class: 'st-barra' }, [
      h('a', { class: 'st-marca', href: '#/' }, [
        h('img', { src: POSES + 'hola-cara-128.webp', alt: '', width: 28, height: 28 }),
        h('span', { text: 'Shiruvana' })
      ]),
      caps,
      h('a', { class: 'st-lectura', href: '#lectura', text: 'Modo lectura' })
    ]);
    var visual = h('div', { class: 'st-visual' });
    var pj = h('div', { class: 'st-pj' });
    var cara = h('img', { class: 'st-cara', src: POSES + 'hola-480.webp', alt: '', width: 48, height: 48 });
    var sr = h('span', { class: 'st-sr' });
    var tipeo = h('span', { class: 'st-tipeo', 'aria-hidden': 'true' });
    var globo = h('div', { class: 'st-globo' }, [
      cara,
      h('div', { class: 'st-dice' }, [
        h('p', { class: 'st-nombre', text: 'Shiruvana' }),
        h('p', { class: 'st-texto', 'aria-live': 'polite' }, [sr, tipeo])
      ])
    ]);
    var prev = h('button', { class: 'st-prev', type: 'button', 'aria-label': 'Escena anterior', text: '←' });
    var next = h('button', { class: 'st-next', type: 'button', text: 'Siguiente →' });
    var progI = h('i');
    var cuenta = h('span', { class: 'st-cuenta' });
    var pie = h('footer', { class: 'st-pie' }, [prev, h('div', { class: 'st-prog', 'aria-hidden': 'true' }, [progI]), cuenta, next]);

    vaciar(raiz);
    [capas, chispas, barra, visual, pj, globo, pie].forEach(function (x) { raiz.appendChild(x); });

    // ---------- piezas visuales ----------

    function vTitulo(v) {
      var hijos = [h('p', { class: 'v-ante', text: v.ante }), h('p', { class: 'v-titulo', text: v.titulo })];
      if (v.pistas) {
        hijos.push(h('ul', { class: 'v-pistas' }, [
          escalonar(h('li', null, [h('kbd', { text: 'Clic' }), h('span', { text: ' o ' }), h('kbd', { text: '→' }), h('span', { text: ' seguir' })]), 0),
          escalonar(h('li', null, [h('kbd', { text: '←' }), h('span', { text: ' volver' })]), 1),
          escalonar(h('li', null, [h('kbd', { text: 'Esc' }), h('span', { text: ' modo lectura' })]), 2),
          escalonar(h('li', null, [h('span', { text: 'En el celular, deslizá' })]), 3)
        ]));
      }
      return h('div', { class: 'v v-tit' }, hijos);
    }

    var piezas = {
      portada: function () {
        return h('div', { class: 'v v-portada' }, [
          h('p', { class: 'v-kanji', 'aria-hidden': 'true', text: '進化中' }),
          h('p', { class: 'v-evolving', text: 'EVOLVING' }),
          h('div', { class: 'v-bar', 'aria-hidden': 'true' }, [h('i')]),
          h('p', { class: 'v-tag', text: 'GATO NEGRO FACTORY · BUILDING THE VAULT' })
        ]);
      },
      titulo: vTitulo,
      tarjetas: function (v) {
        return h('div', { class: 'v v-tarjetas' }, v.items.map(function (t, i) {
          return escalonar(h('div', { class: 'v-tarjeta ' + (t.color || 'amber') }, [h('b', { text: t.titulo }), h('span', { text: t.texto })]), i);
        }));
      },
      cifras: function () {
        return h('div', { class: 'v v-cifras' }, datos.cifras.map(function (c, i) {
          var cf = cifra(c.valor);
          var b = h('b', { class: 'v-num', text: c.valor });
          if (cf) { b.setAttribute('data-n', String(cf.n)); b.setAttribute('data-resto', cf.resto); }
          return escalonar(h('div', { class: 'v-cifra' }, [b, h('span', { text: c.etiqueta })]), i);
        }));
      },
      eras: function () {
        return h('div', { class: 'v v-eras' }, datos.eras.map(function (e, i) {
          return escalonar(h('div', { class: 'v-era era-' + e.era }, [h('b', { text: e.titulo }), h('span', { text: e.texto })]), i);
        }));
      },
      linea: function (v) {
        var era = datos.eras.filter(function (e) { return e.era === v.era; })[0];
        return h('div', { class: 'v v-linea era-' + v.era }, [
          h('p', { class: 'v-ante', text: era ? era.titulo.toUpperCase() : '' }),
          h('ol', null, lineaDe(datos, v).map(function (x, i) {
            return escalonar(h('li', null, [
              h('time', { text: x.fecha }), h('b', { text: x.titulo }), h('span', { class: 'v-txt', text: x.texto }),
              x.ref ? h('span', { class: 'v-ref', text: x.ref }) : null
            ]), i);
          }))
        ]);
      },
      acciones: function (v) {
        return h('div', { class: 'v v-acciones' }, [
          h('p', { class: 'v-ante', text: v.ante }),
          h('p', { class: 'v-titulo', text: v.titulo }),
          h('div', { class: 'v-btns' }, v.acciones.map(function (a, i) {
            return escalonar(h('a', { class: 'st-btn' + (a.primario ? ' primario' : ''), href: a.href, text: a.texto }), i);
          }))
        ]);
      }
    };

    // ---------- contadores ----------

    function contar(cont) {
      var nums = [];
      (function buscar(el) {
        hijosDe(el).forEach(function (x) { if (x.getAttribute && x.getAttribute('data-n') != null) nums.push(x); else buscar(x); });
      })(cont);
      if (reducido || !nums.length) return;
      var t0 = null, dur = 900;
      var raf = win.requestAnimationFrame ? win.requestAnimationFrame.bind(win) : function (f) { return win.setTimeout(function () { f(Date.now()); }, 16); };
      nums.forEach(function (b) { b.textContent = '0' + b.getAttribute('data-resto'); });
      function paso(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var ease = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (b) {
          b.textContent = Math.round(ease * parseInt(b.getAttribute('data-n'), 10)) + b.getAttribute('data-resto');
        });
        if (p < 1 && estado.modo === 'funcion') raf(paso);
      }
      raf(paso);
    }

    // ---------- tipeo ----------

    function pararTipeo() {
      if (estado.timer) win.clearTimeout(estado.timer);
      estado.timer = null;
      estado.escribiendo = false;
      globo.classList.remove('tipeando');
    }
    function completar() {
      pararTipeo();
      tipeo.textContent = estado.texto;
    }
    function tipear(texto) {
      pararTipeo();
      estado.texto = texto;
      sr.textContent = texto;
      if (reducido) { tipeo.textContent = texto; return; }
      var n = 0;
      estado.escribiendo = true;
      globo.classList.add('tipeando');
      (function tick() {
        n += TIPEO_PASO;
        tipeo.textContent = texto.slice(0, n);
        if (n >= texto.length) { estado.escribiendo = false; estado.timer = null; globo.classList.remove('tipeando'); return; }
        estado.timer = win.setTimeout(tick, TIPEO_MS);
      })();
    }

    // ---------- pintar una escena ----------

    function ponerFondo(f) {
      if (estado.fondo === f) return;
      estado.fondo = f;
      hijosDe(capas).forEach(function (x) { retirar(x, 900); });
      capas.appendChild(h('div', { class: 'st-fondo fondo-' + f }));
      raiz.setAttribute('data-fondo', f);
    }

    function ponerPose(pose) {
      if (estado.pose === pose) return;
      estado.pose = pose;
      hijosDe(pj).forEach(function (x) { retirar(x, 450); });
      if (pose) pj.appendChild(h('img', { class: 'st-pose', src: POSES + pose + '.webp', alt: guion.poses[pose] || 'Shiruvana', width: 640, height: 954 }));
    }

    function precargar(i) {
      var p = lista[i];
      if (!p || !p.esc.pose || typeof win.Image !== 'function') return;
      var img = new win.Image();
      img.src = POSES + p.esc.pose + '.webp';
    }

    function pintar(i) {
      var p = lista[i], esc = p.esc;
      estado.actual = i;
      ponerFondo(esc.fondo || 'taller');
      ponerPose(esc.pose || null);
      pills.forEach(function (a, c) {
        a.classList.toggle('activo', c === p.c);
        if (c === p.c) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
      vaciar(visual);
      var pieza = piezas[esc.visual.tipo](esc.visual);
      visual.appendChild(pieza);
      cara.setAttribute('src', POSES + (esc.cara || 'hola') + '-480.webp');
      globo.classList.remove('entra');
      void globo.offsetWidth; // reinicia la animación del globo
      globo.classList.add('entra');
      tipear(esc.texto);
      progI.style.width = Math.round(((i + 1) / lista.length) * 100) + '%';
      cuenta.textContent = (i + 1) + ' / ' + lista.length;
      prev.disabled = i === 0;
      next.disabled = i === lista.length - 1;
      raiz.setAttribute('aria-label', 'Shiruvana se presenta: ' + p.cap.titulo + ', escena ' + (p.e + 1) + ' de ' + p.cap.escenas.length);
      if (esc.visual.tipo === 'cifras') contar(pieza);
      precargar(i + 1);
    }

    // ---------- modos y navegación ----------

    function modoFuncion(i) {
      if (estado.modo !== 'funcion') {
        estado.modo = 'funcion';
        html.classList.add('funcion');
        if (primeraVez && !reducido && i === 0) {
          var ojos = h('div', { class: 'st-ojos', 'aria-hidden': 'true' }, [h('i'), h('i')]);
          raiz.appendChild(ojos);
          win.setTimeout(function () { if (ojos.parentNode) ojos.parentNode.removeChild(ojos); }, 2300);
        }
        primeraVez = false;
        if (raiz.focus) raiz.focus();
      }
      if (i !== estado.actual) pintar(i);
    }

    function modoLectura(ancla) {
      pararTipeo();
      estado.modo = 'lectura';
      estado.actual = -1;
      html.classList.remove('funcion');
      var destino = ancla && ancla !== 'lectura' ? doc.getElementById(ancla) : null;
      if (destino && destino.scrollIntoView) destino.scrollIntoView();
      else if (win.scrollTo) win.scrollTo(0, 0);
    }

    function alHash() {
      var r = leerHash(win.location.hash, lista);
      if (r.modo === 'lectura') modoLectura(r.ancla);
      else modoFuncion(r.i);
    }

    function ir(i) {
      i = Math.max(0, Math.min(lista.length - 1, i));
      if (i === estado.actual) return;
      win.location.hash = hashDe(lista, i);
    }
    function avanzar() { if (estado.escribiendo) completar(); else ir(estado.actual + 1); }
    function retroceder() { ir(estado.actual - 1); }

    function esControl(el) {
      for (var n = el; n && n !== raiz; n = n.parentNode) {
        if (n.tagName === 'A' || n.tagName === 'BUTTON') return true;
      }
      return false;
    }

    prev.addEventListener('click', function () { retroceder(); });
    next.addEventListener('click', function () { avanzar(); });
    raiz.addEventListener('click', function (ev) { if (!esControl(ev.target)) avanzar(); });

    doc.addEventListener('keydown', function (ev) {
      if (estado.modo !== 'funcion' || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      var k = ev.key;
      if ((k === 'Enter' || k === ' ') && ev.target && esControl(ev.target)) return;
      var hecho = true;
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') avanzar();
      else if (k === 'ArrowLeft' || k === 'PageUp') retroceder();
      else if (k === 'Home') ir(0);
      else if (k === 'End') ir(lista.length - 1);
      else if (k === 'Escape') win.location.hash = '#lectura';
      else hecho = false;
      if (hecho && ev.preventDefault) ev.preventDefault();
    });

    var toque = null;
    raiz.addEventListener('touchstart', function (ev) {
      var t = ev.changedTouches && ev.changedTouches[0];
      toque = t ? { x: t.clientX, y: t.clientY } : null;
    });
    raiz.addEventListener('touchend', function (ev) {
      var t = ev.changedTouches && ev.changedTouches[0];
      if (!toque || !t) return;
      var dx = t.clientX - toque.x, dy = t.clientY - toque.y;
      toque = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (ev.preventDefault) ev.preventDefault();
        if (dx < 0) avanzar(); else retroceder();
      }
    });

    win.addEventListener('hashchange', alHash);
    alHash();

    return {
      version: VERSION,
      lista: lista,
      estado: estado,
      avanzar: avanzar,
      retroceder: retroceder,
      ir: ir
    };
  }

  var API = { version: VERSION, aplanar: aplanar, hashDe: hashDe, leerHash: leerHash, cifra: cifra, lineaDe: lineaDe, leerDatos: leerDatos, crear: crear };

  if (typeof module !== 'undefined' && module.exports) { module.exports = API; return; }

  root.SHIRUVANA_ESCENARIO = API;
  var doc = root.document;
  var raiz = doc && doc.getElementById('escenario');
  if (!raiz || !root.SHIRUVANA_GUION) { if (doc) doc.documentElement.classList.remove('funcion'); return; }
  try {
    crear({ doc: doc, win: root, raiz: raiz, guion: root.SHIRUVANA_GUION, datos: leerDatos(doc) });
    root.ESCENARIO_OK = true;
  } catch (err) {
    doc.documentElement.classList.remove('funcion');
    if (root.console) root.console.error('Escenario:', err);
  }
})(this);
