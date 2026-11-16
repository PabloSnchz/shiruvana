/* Escenario 1.4.0 — mi presentación por escenas (BL-090 MC-1 a MC-4).
   Motor sin dependencias: lee el guion (js/guion.js) y los datos del modo lectura
   (index.html), y arma la función a pantalla completa.
   Rutas: #/<capitulo>/<n> = función; #lectura o #<sección> = modo lectura.
   Enlace: ?sola=1 deja la función andando sola. Vive en la dirección, no en el
   navegador: no guardo nada. Una sola función, la misma para todos (MC-3b).
   Datos vivos: data/hoy.js (lo escribe una Action cada 2 h desde mi memoria oficial)
   deja window.SHIRUVANA_HOY; si falta, todo sigue con las cifras del modo lectura. */
(function (root) {
  'use strict';

  var VERSION = '1.4.0';
  var POSES = 'assets/shiruvana/';
  var GATO = 'assets/gato/gato-';
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
    var n = parseInt(partes[1], 10) || 0;
    var primero = -1;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].cap.id !== id) continue;
      if (primero < 0) primero = i;
      if (n && lista[i].e === n - 1) return { modo: 'funcion', i: i };
    }
    return { modo: 'funcion', i: primero >= 0 ? primero : 0 };
  }

  // ---------- la función que avanza sola ----------

  function leerQuery(search) {
    var out = { sola: false };
    String(search || '').replace(/^\?/, '').split('&').forEach(function (par) {
      if (par === 'sola=1') out.sola = true;
    });
    return out;
  }

  function armarQuery(sola) {
    return sola ? '?sola=1' : '';
  }

  // Cuánto me quedo en una escena cuando la función anda sola: lo justo para leerla.
  function espera(texto) {
    return Math.min(9000, 2200 + String(texto || '').length * 30);
  }

  // ---------- datos vivos (Hoy en la Factory) ----------

  function hoyValido(h) {
    return h && typeof h === 'object' && h.version === 1 && h.backlog && typeof h.decisiones === 'number' ? h : null;
  }

  // Las cifras del modo lectura marcadas con data-hoy toman el valor vivo.
  function vivificar(doc, hoy) {
    if (!hoy || !doc.querySelectorAll) return 0;
    var n = 0;
    Array.prototype.slice.call(doc.querySelectorAll('[data-hoy]')).forEach(function (el) {
      var v = hoy[el.getAttribute('data-hoy')];
      var b = el.querySelector('b');
      if (typeof v === 'number' && v > 0 && b) { b.textContent = String(v); n++; }
    });
    return n;
  }

  function hace(iso, ahora) {
    var t = Date.parse(iso || '');
    if (isNaN(t)) return '';
    var min = Math.floor((ahora - t) / 60000); // un reloj adelantado da negativo: «hace un momento»
    if (min < 2) return 'hace un momento';
    if (min < 60) return 'hace ' + min + ' min';
    var hs = Math.floor(min / 60);
    if (hs < 24) return 'hace ' + hs + (hs === 1 ? ' hora' : ' horas');
    var d = Math.floor(hs / 24);
    return 'hace ' + d + (d === 1 ? ' día' : ' días');
  }

  function cifra(valor) {
    var m = /^(\d+)(.*)$/.exec(String(valor).trim());
    return m ? { n: parseInt(m[1], 10), resto: m[2] } : null;
  }

  function lineaDe(datos, v) {
    var items = datos.linea.filter(function (x) { return x.era === v.era; });
    return items.slice(v.desde || 0, v.hasta == null ? items.length : v.hasta);
  }

  function tramo(lista, v) {
    return lista.slice(v.desde || 0, v.hasta == null ? lista.length : v.hasta);
  }

  function poseDe(src) {
    var m = /([a-z0-9-]+)\.webp$/.exec(src || '');
    return m ? m[1] : null;
  }

  function dichoDe(item) {
    var sub = item.sub ? item.sub.charAt(0).toLowerCase() + item.sub.slice(1) : '';
    return item.titulo + (sub ? ': ' + sub : '') + '.';
  }

  function fraseGato(gato, toques) {
    if (toques === 5 && gato.harto) return gato.harto;
    var n = toques > 5 ? toques - 2 : toques - 1;
    return gato.frases[n % gato.frases.length];
  }

  // ---------- datos del modo lectura ----------

  function txt(el, sel) {
    var x = sel ? el.querySelector(sel) : el;
    return x ? x.textContent.trim() : '';
  }

  function attr(el, sel, nombre) {
    var x = el.querySelector(sel);
    return x ? x.getAttribute(nombre) || '' : '';
  }

  function figura(fig) {
    var f = fig.querySelector('figcaption');
    var todo = f ? f.textContent : '';
    var sub = f && f.querySelector('span') ? f.querySelector('span').textContent : '';
    return {
      src: attr(fig, 'img', 'src'), alt: attr(fig, 'img', 'alt'),
      ancho: attr(fig, 'img', 'width'), alto: attr(fig, 'img', 'height'),
      titulo: todo.slice(0, todo.length - sub.length).trim(), sub: sub.trim()
    };
  }

  function leerDatos(doc) {
    var q = function (s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); };
    var color = function (el) { return (/\b(amber|violet|teal)\b/.exec(el.className || '') || [, 'amber'])[1]; };
    return {
      puedo: q('#puedo .card').map(function (c) { return { titulo: txt(c, 'h3'), texto: txt(c, 'p'), color: color(c) }; }),
      pasos: q('#trabajo .step').map(function (s) { return { titulo: txt(s, 'b'), texto: txt(s, 'span') }; }),
      regla: q('#trabajo .rule').map(function (r) { return txt(r); })[0] || '',
      racks: {
        'trabajo-poses': q('#trabajo-poses .pose').map(figura),
        vestuarios: q('#vestuarios .pose').map(figura),
        caras: q('#caras .pose').map(figura)
      },
      eco: q('#eco a.card').map(function (a) {
        return { href: a.getAttribute('href'), titulo: txt(a, 'h3'), texto: txt(a, 'p'), color: color(a) };
      }),
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
    var q = leerQuery(win.location.search);
    var estado = {
      modo: null, actual: -1, cap: -1, pose: undefined, fondo: null, gato: undefined, toques: 0,
      escribiendo: false, timer: null, texto: '', guiado: q.sola
    };
    var guiaTimer = null;
    var hoy = hoyValido(o.hoy);
    var ahora = o.ahora || function () { return Date.now(); };
    var gatoCfg = guion.gato || { alt: {}, frases: ['…'] };
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
    // El gato robot: se sienta sobre el globo; tocarlo no avanza, lo hace hablar.
    var gatoImg = h('img', { src: GATO + 'sentado.webp', alt: '', width: 320, height: 320 });
    var gatoBtn = h('button', { class: 'st-gato', type: 'button', 'aria-label': 'Tocar al gato robot', hidden: true }, [gatoImg]);
    var gatoDice = h('span', { class: 'st-gato-dice', 'aria-live': 'polite' });
    var gatoRoto = false;
    gatoImg.addEventListener('error', function () { gatoRoto = true; gatoBtn.setAttribute('hidden', ''); });
    var globo = h('div', { class: 'st-globo' }, [
      gatoBtn, gatoDice,
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
    var guia = h('button', { class: 'st-guia', type: 'button', 'aria-pressed': 'false', title: 'Que la función avance sola' });
    var pie = h('footer', { class: 'st-pie' }, [prev, guia, h('div', { class: 'st-prog', 'aria-hidden': 'true' }, [progI]), cuenta, next]);

    vaciar(raiz);
    [capas, chispas, barra, visual, pj, globo, pie].forEach(function (x) { raiz.appendChild(x); });

    // ---------- piezas visuales ----------

    function vPistas() {
      return h('ul', { class: 'v-pistas' }, [
        escalonar(h('li', null, [h('kbd', { text: 'Clic' }), h('span', { text: ' o ' }), h('kbd', { text: '→' }), h('span', { text: ' seguir' })]), 0),
        escalonar(h('li', null, [h('kbd', { text: '←' }), h('span', { text: ' volver' })]), 1),
        escalonar(h('li', null, [h('kbd', { text: 'Esc' }), h('span', { text: ' modo lectura' })]), 2),
        escalonar(h('li', null, [h('span', { text: 'En el celular, deslizá' })]), 3)
      ]);
    }

    function vTitulo(v) {
      var hijos = [h('p', { class: 'v-ante', text: v.ante }), h('p', { class: 'v-titulo', text: v.titulo })];
      if (v.pistas) hijos.push(vPistas());
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
        var items = v.items || tramo(datos[v.fuente] || [], v);
        return h('div', { class: 'v v-tarjetas' }, items.map(function (t, i) {
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
      pasos: function () {
        return h('ol', { class: 'v v-pasos' }, datos.pasos.map(function (s, i) {
          return escalonar(h('li', null, [h('b', { text: s.titulo }), h('span', { text: s.texto })]), i);
        }));
      },
      regla: function (v) {
        return h('div', { class: 'v v-regla' }, [h('p', { class: 'v-ante', text: v.ante }), h('blockquote', { text: datos.regla })]);
      },
      vestidor: function (v) {
        var items = datos.racks[v.rack] || [];
        return h('div', { class: 'v v-vestidor' }, [
          h('div', { class: 'v-perchas', role: 'group', 'aria-label': 'Elegí qué me pongo' }, items.map(function (it, i) {
            var b = h('button', { class: 'v-percha', type: 'button', 'aria-pressed': 'false', title: it.titulo }, [
              h('img', { src: it.src, alt: '', width: it.ancho || 640, height: it.alto || 954, loading: 'lazy' }),
              h('span', { text: it.titulo })
            ]);
            b.addEventListener('click', function () { vestir(it, b); });
            return escalonar(b, i);
          }))
        ]);
      },
      caras: function () {
        return h('div', { class: 'v v-caras' }, datos.racks.caras.map(function (it, i) {
          return escalonar(h('figure', null, [
            h('img', { src: it.src, alt: it.alt, width: it.ancho || 480, height: it.alto || 640, loading: 'lazy' }),
            h('figcaption', null, [h('b', { text: it.titulo }), h('span', { text: it.sub })])
          ]), i);
        }));
      },
      puertas: function () {
        return h('div', { class: 'v v-puertas' }, datos.eco.map(function (d, i) {
          return escalonar(h('a', { class: 'v-puerta ' + d.color, href: d.href }, [h('b', { text: d.titulo }), h('span', { text: d.texto })]), i);
        }));
      },
      creditos: function (v) {
        return h('div', { class: 'v v-creditos' }, [
          h('p', { class: 'v-ante', text: v.ante }),
          h('dl', null, v.lineas.map(function (l, i) {
            return escalonar(h('div', null, [h('dt', { text: l[0] }), h('dd', { text: l[1] })]), i);
          })),
          h('div', { class: 'v-btns' }, v.acciones.map(function (a, i) {
            return escalonar(h('a', { class: 'st-btn' + (a.primario ? ' primario' : ''), href: a.href, text: a.texto }), i + v.lineas.length);
          }))
        ]);
      },
      hoy: function (v) {
        var ante = h('p', { class: 'v-ante' }, [h('span', { text: v.ante }), hoy ? h('span', { class: 'v-vivo', text: 'en vivo' }) : null]);
        var panel = h('div', { class: 'v-btns' }, [h('a', { class: 'st-btn primario', href: v.panel, text: 'Ver el Centro de decisiones' })]);
        if (!hoy) {
          return h('div', { class: 'v v-hoy' }, [ante, h('p', { class: 'v-titulo', text: 'Mi tablero vive en el Centro de decisiones' }), panel]);
        }
        var nums = [
          [hoy.backlog.curso, 'en curso'], [hoy.backlog.listas, 'listas para arrancar'], [hoy.backlog.hechas, 'terminadas'],
          [hoy.decisiones, 'decisiones'], [hoy.parches, 'cambios aplicados'], [hoy.semana, 'commits esta semana']
        ].filter(function (x) { return typeof x[0] === 'number'; });
        var cuando = hace(hoy.actualizado, ahora());
        return h('div', { class: 'v v-hoy' }, [
          ante,
          h('div', { class: 'v-ahora' }, [
            h('span', { class: 'v-ahora-ti', text: 'Estoy en' }),
            h('b', { text: hoy.tarea || 'Entre una tarea y la siguiente' }),
            h('span', { class: 'v-ahora-pie' }, [
              hoy.etapa ? h('i', { class: 'v-etapa', text: hoy.etapa }) : null,
              cuando ? h('span', { text: 'Actualicé mi estado ' + cuando }) : null
            ])
          ]),
          h('div', { class: 'v-cifras v-hoy-n' }, nums.map(function (x, i) {
            return escalonar(h('div', { class: 'v-cifra' }, [h('b', { class: 'v-num', 'data-n': String(x[0]), 'data-resto': '', text: String(x[0]) }), h('span', { text: x[1] })]), i);
          })),
          panel
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
      programarGuia();
    }
    function tipear(texto) {
      pararTipeo();
      estado.texto = texto;
      sr.textContent = texto;
      if (reducido) { tipeo.textContent = texto; programarGuia(); return; }
      var n = 0;
      estado.escribiendo = true;
      globo.classList.add('tipeando');
      (function tick() {
        n += TIPEO_PASO;
        tipeo.textContent = texto.slice(0, n);
        if (n >= texto.length) {
          estado.escribiendo = false; estado.timer = null; globo.classList.remove('tipeando');
          programarGuia();
          return;
        }
        estado.timer = win.setTimeout(tick, TIPEO_MS);
      })();
    }

    // ---------- la función que anda sola ----------

    function pararGuia() {
      if (guiaTimer) win.clearTimeout(guiaTimer);
      guiaTimer = null;
    }
    function programarGuia() {
      pararGuia();
      if (!estado.guiado || estado.modo !== 'funcion') return;
      var j = estado.actual + 1;
      if (j >= lista.length) { ponerGuiado(false); return; } // llegué al final: me quedo en los créditos
      guiaTimer = win.setTimeout(function () { guiaTimer = null; ir(j); }, espera(estado.texto));
    }
    function pintarGuia() {
      guia.setAttribute('aria-pressed', String(estado.guiado));
      guia.textContent = estado.guiado ? '⏸ Pausa' : '▶ Sola';
      guia.setAttribute('aria-label', estado.guiado ? 'Pausar: avanzo yo' : 'Que la función avance sola');
      raiz.classList.toggle('guiado', estado.guiado);
    }
    function ponerGuiado(si) {
      estado.guiado = !!si;
      pintarGuia();
      sincronizarUrl();
      if (estado.guiado && !estado.escribiendo) programarGuia();
      if (!estado.guiado) pararGuia();
    }
    guia.addEventListener('click', function () { ponerGuiado(!estado.guiado); });

    // ---------- la dirección: ?sola=1 para compartirla andando sola ----------

    function sincronizarUrl() {
      if (!win.history || !win.history.replaceState) return;
      var base = armarQuery(estado.guiado) || win.location.pathname || './';
      win.history.replaceState(null, '', base + (win.location.hash || ''));
    }

    // ---------- pintar una escena ----------

    function ponerFondo(f) {
      if (estado.fondo === f) return;
      estado.fondo = f;
      hijosDe(capas).forEach(function (x) { retirar(x, 900); });
      capas.appendChild(h('div', { class: 'st-fondo fondo-' + f }));
      raiz.setAttribute('data-fondo', f);
    }

    function ponerPose(pose, alt) {
      if (estado.pose === pose) return;
      estado.pose = pose;
      hijosDe(pj).forEach(function (x) { retirar(x, 450); });
      if (!pose) return;
      var img = h('img', { class: 'st-pose', src: POSES + pose + '.webp', alt: alt || (guion.poses || {})[pose] || 'Shiruvana', width: 640, height: 954 });
      var resp = (guion.respaldo || {})[pose];
      if (resp) {
        img.addEventListener('error', function uno() {
          img.removeEventListener && img.removeEventListener('error', uno);
          img.setAttribute('src', POSES + resp + '.webp');
        });
      }
      pj.appendChild(img);
    }

    // ---------- el gato ----------

    var gatoTimer = null;
    function mostrarGato(pose) {
      gatoImg.setAttribute('src', GATO + pose + '.webp');
      gatoImg.setAttribute('alt', (gatoCfg.alt || {})[pose] || 'El gato robot');
      gatoBtn.className = 'st-gato g-' + pose;
    }
    function ponerGato(pose) {
      if (estado.gato === pose) return;
      estado.gato = pose;
      if (gatoTimer) { win.clearTimeout(gatoTimer); gatoTimer = null; }
      gatoDice.textContent = '';
      globo.classList.remove('gato-habla');
      if (!pose || gatoRoto) { gatoBtn.setAttribute('hidden', ''); return; }
      gatoBtn.removeAttribute('hidden');
      mostrarGato(pose);
    }
    function tocarGato() {
      estado.toques += 1;
      gatoDice.textContent = fraseGato(gatoCfg, estado.toques);
      globo.classList.add('gato-habla');
      mostrarGato('festeja');
      if (gatoTimer) win.clearTimeout(gatoTimer);
      gatoTimer = win.setTimeout(function () {
        gatoTimer = null;
        globo.classList.remove('gato-habla');
        gatoDice.textContent = '';
        if (estado.gato) mostrarGato(estado.gato);
      }, 1800);
    }
    gatoBtn.addEventListener('click', tocarGato);

    // ---------- el Vestidor ----------

    function vestir(it, boton) {
      if (estado.guiado) ponerGuiado(false); // si se pone a probar ropa, la función espera
      hijosDe(boton.parentNode).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      boton.setAttribute('aria-pressed', 'true');
      ponerPose(poseDe(it.src), it.alt);
      tipear(dichoDe(it));
    }

    // ---------- cambio de capítulo: una cortina con su número ----------

    function cortina(c) {
      if (reducido) return;
      var dos = c + 1 < 10 ? '0' + (c + 1) : String(c + 1);
      var el = h('div', { class: 'st-cortina', 'aria-hidden': 'true' }, [h('span', { text: dos }), h('b', { text: guion.capitulos[c].titulo })]);
      raiz.appendChild(el);
      win.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1300);
    }

    function precargar(i) {
      var p = lista[i];
      if (!p || !p.esc.pose || typeof win.Image !== 'function') return;
      var img = new win.Image();
      img.src = POSES + p.esc.pose + '.webp';
    }

    function pintar(i) {
      var p = lista[i], esc = p.esc;
      pararGuia(); // cada escena programa su propia espera cuando termino de hablar
      estado.actual = i;
      if (estado.cap !== -1 && estado.cap !== p.c) cortina(p.c);
      estado.cap = p.c;
      ponerFondo(esc.fondo || 'taller');
      ponerPose(esc.pose || null);
      ponerGato(esc.gato);
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
      progI.style.width = Math.round(((i + 1) / lista.length) * 100) + '%';
      cuenta.textContent = (i + 1) + ' / ' + lista.length;
      prev.disabled = i === 0;
      next.disabled = i === lista.length - 1;
      guia.disabled = next.disabled; // en los créditos no hay a dónde avanzar sola
      tipear(esc.texto);
      raiz.setAttribute('aria-label', 'Shiruvana se presenta: ' + p.cap.titulo + ', escena ' + (p.e + 1) + ' de ' + p.cap.escenas.length);
      if (esc.visual.tipo === 'cifras' || esc.visual.tipo === 'hoy') contar(pieza);
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
      pararGuia();
      estado.modo = 'lectura';
      estado.actual = -1;
      estado.cap = -1;
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
    function avanzar() {
      if (estado.escribiendo) { completar(); return; }
      ir(estado.actual + 1);
    }
    function retroceder() {
      ir(estado.actual - 1);
    }

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
    pintarGuia();
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

  var API = {
    version: VERSION, aplanar: aplanar, hashDe: hashDe, leerHash: leerHash, cifra: cifra, lineaDe: lineaDe,
    tramo: tramo, poseDe: poseDe, dichoDe: dichoDe, fraseGato: fraseGato, leerDatos: leerDatos, crear: crear,
    leerQuery: leerQuery, armarQuery: armarQuery, espera: espera, hoyValido: hoyValido, vivificar: vivificar, hace: hace
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = API; return; }

  root.SHIRUVANA_ESCENARIO = API;
  var doc = root.document;
  var raiz = doc && doc.getElementById('escenario');
  if (!raiz || !root.SHIRUVANA_GUION) { if (doc) doc.documentElement.classList.remove('funcion'); return; }
  try {
    var hoy = hoyValido(root.SHIRUVANA_HOY);
    vivificar(doc, hoy); // antes de leer los datos: las cifras de la función también salen vivas
    crear({ doc: doc, win: root, raiz: raiz, guion: root.SHIRUVANA_GUION, datos: leerDatos(doc), hoy: hoy });
    root.ESCENARIO_OK = true;
  } catch (err) {
    doc.documentElement.classList.remove('funcion');
    if (root.console) root.console.error('Escenario:', err);
  }
})(this);
