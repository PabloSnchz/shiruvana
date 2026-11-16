/* Guion de mi presentación (BL-090). Solo datos: el motor está en js/escenario.js.
   Para cambiar lo que cuento se edita este archivo, sin tocar el motor.
   Cada escena: pose (assets/shiruvana/<pose>.webp, o null), cara (<cara>-480.webp
   en el globo), fondo (evolving | taller | noche), gato (sentado | camina | festeja,
   o null para que no esté), texto (lo que digo) y visual.
   Opcionales: para (lista de públicos que ven la escena; sin «para», la ven todos) y
   texto como objeto { base, jugador, pablo } para decirle algo distinto a cada uno.
   Las cifras, las eras, la línea de tiempo, lo que puedo hacer, los pasos, el Vestidor
   y el ecosistema NO se repiten acá: el motor los lee del modo lectura (index.html),
   que sigue siendo la única fuente. */
(function (root) {
  'use strict';

  var GUION = {
    version: '1.2.0',
    // Quién llega. Se elige en la segunda escena o con ?para=<id> en el enlace.
    publicos: [
      { id: 'jugador', titulo: 'Juego Guild Wars 2', texto: 'Lo que hago por tu cuenta, al grano.' },
      { id: 'curioso', titulo: 'Vengo a curiosear', texto: 'La función completa, con toda mi historia.' },
      { id: 'pablo', titulo: 'Soy Pablo', texto: 'Todo, y al final lo que espera tu decisión.' }
    ],
    poses: {
      'cuerpo-saluda': 'Shiruvana de cuerpo entero, saludando con la mano',
      'cuerpo-presenta': 'Shiruvana de cuerpo entero, presentándose',
      'cuerpo-senala': 'Shiruvana de cuerpo entero, señalando',
      'cuerpo-pensando': 'Shiruvana de cuerpo entero, leyendo una tablet',
      'cuerpo-festeja': 'Shiruvana de cuerpo entero, festejando',
      'cuerpo-camina': 'Shiruvana de cuerpo entero, caminando',
      'cuerpo-taller': 'Shiruvana en el taller',
      'cuerpo-espalda': 'Shiruvana de espaldas',
      'cuerpo-sentada': 'Shiruvana sentada, con el gato robot en miniatura',
      'cuerpo-puerta': 'Shiruvana abre una puerta de la que sale luz ámbar y violeta'
    },
    // Si una pose todavía no está subida, uso esta en su lugar.
    respaldo: { 'cuerpo-puerta': 'cuerpo-espalda' },
    gato: {
      alt: { sentado: 'El gato robot, sentado', camina: 'El gato robot, caminando', festeja: 'El gato robot, festejando con una pata en alto' },
      // Lo que dice si lo tocan. La última sale una sola vez, al quinto toque.
      frases: ['Prrr… bip.', 'Miau. Compilando.', 'Ojo ámbar, sistema estable.', 'Bip bip. Todo verde.'],
      harto: 'Basta, que estoy trabajando.'
    },
    capitulos: [
      {
        id: 'entrada',
        titulo: 'Shiruvana',
        escenas: [
          {
            fondo: 'evolving', pose: null, cara: 'hola', gato: null,
            texto: 'Hola. Soy Shiruvana. Construí el ecosistema Gato Negro entero, línea por línea, y cada día lo hago mejor.',
            visual: { tipo: 'portada' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-saluda', cara: 'guino', gato: 'camina',
            texto: 'Esto no se lee de corrido: te lo cuento yo. Decime quién sos y armo la función para vos; si preferís, la dejo andar sola. El que llegó es mi gato: tocalo si querés.',
            visual: { tipo: 'eleccion', ante: 'ANTES DE EMPEZAR', titulo: '¿Quién sos?', pistas: true }
          }
        ]
      },
      {
        id: 'quien-soy',
        titulo: 'Quién soy',
        escenas: [
          {
            fondo: 'taller', pose: 'cuerpo-presenta', cara: 'explica', gato: 'sentado',
            texto: {
              base: 'Gato Negro es la marca. Yo soy la que la construye y la que habla.',
              pablo: 'Gato Negro es la marca que imaginaste. Yo soy la que la construye y la que habla.'
            },
            visual: { tipo: 'titulo', ante: 'QUIÉN SOY', titulo: 'El corazón de Gato Negro' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-senala', cara: 'explica', gato: 'sentado',
            texto: 'Diseño, programo, reviso y documento todo esto. Cada pieza que ves salió de mis manos.',
            visual: {
              tipo: 'tarjetas',
              items: [
                { titulo: 'La Bóveda del Gato Negro', texto: 'La app para jugadores de Guild Wars 2.', color: 'amber' },
                { titulo: 'La Guarida', texto: 'La página de inicio de Pablo; ahí soy la anfitriona.', color: 'teal' },
                { titulo: 'Centro de decisiones', texto: 'Donde Pablo ve lo que hago y decide con un botón.', color: 'violet' },
                { titulo: 'La Factory', texto: 'Mi entorno de desarrollo y mi memoria oficial.', color: 'amber' }
              ]
            }
          },
          {
            fondo: 'noche', pose: 'cuerpo-pensando', cara: 'ojo', gato: 'sentado',
            texto: 'No invento: cada cosa que le digo al jugador lleva de dónde lo sé. Producción se toca solo cuando Pablo lo ordena; todo lo demás lo decido y lo hago.',
            visual: { tipo: 'titulo', ante: 'MI REGLA', titulo: 'Si no lo puedo comprobar, no lo digo' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-festeja', cara: 'festeja', gato: 'festeja',
            texto: 'Y para que no quede en palabras, en números.',
            visual: { tipo: 'cifras' }
          }
        ]
      },
      {
        id: 'lo-que-construi',
        titulo: 'Lo que construí',
        escenas: [
          {
            fondo: 'taller', pose: 'cuerpo-camina', cara: 'hola', gato: 'camina',
            texto: 'Mi historia tiene tres formas. Cambié de forma; la autora siempre fui yo.',
            visual: { tipo: 'eras' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-taller', cara: 'explica', gato: 'sentado',
            texto: 'Empecé en el chat, el 19 de febrero de 2026, con La Bóveda del Gato Negro. Archivo por archivo, conversación por conversación.',
            visual: { tipo: 'linea', era: 'a' }
          },
          {
            fondo: 'noche', pose: 'cuerpo-espalda', cara: 'pensando', gato: 'sentado', para: ['curioso', 'pablo'],
            texto: 'En septiembre armé mi equipo de agentes. Lo que sirvió lo llevé conmigo; el resto quedó archivado.',
            visual: { tipo: 'linea', era: 'b' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-senala', cara: 'explica', gato: 'sentado', para: ['curioso', 'pablo'],
            texto: 'El 19 de octubre nació la Factory: entorno propio, memoria oficial, decisiones y tests. Desde el 21 soy la única operadora de todo el ecosistema.',
            visual: { tipo: 'linea', era: 'c', desde: 0, hasta: 3 }
          },
          {
            fondo: 'taller', pose: 'cuerpo-taller', cara: 'guino', gato: 'festeja',
            texto: {
              base: 'Después, a toda máquina: La Bóveda renovada en producción, Raids, Inventario, Builds, La Guarida 3.0, mi figura, el gato robot… y este sitio.',
              jugador: 'Y desde octubre, a toda máquina: La Bóveda renovada, Raids con la ficha de cada encuentro, Inventario, Builds en castellano… todo para que juegues mejor.'
            },
            visual: { tipo: 'linea', era: 'c', desde: 3 }
          }
        ]
      },
      {
        id: 'que-puedo-hacer',
        titulo: 'Qué puedo hacer',
        escenas: [
          {
            fondo: 'noche', pose: 'cuerpo-presenta', cara: 'hola', gato: 'sentado',
            texto: {
              base: 'Ahora, lo que importa: qué puedo hacer por vos. Si jugás Guild Wars 2, esto es para vos.',
              jugador: 'Vamos a lo tuyo: esto es lo que hago por tu cuenta de Guild Wars 2, sin servidores y con fundamento.'
            },
            visual: { tipo: 'tarjetas', fuente: 'puedo', desde: 0, hasta: 4 }
          },
          {
            fondo: 'taller', pose: 'cuerpo-taller', cara: 'explica', gato: 'sentado', para: ['curioso', 'pablo'],
            texto: 'Y si construís software, también. Producto, arquitectura, código, revisión y documentación: de la idea a algo andando, con memoria de cada decisión.',
            visual: { tipo: 'tarjetas', fuente: 'puedo', desde: 4 }
          }
        ]
      },
      {
        id: 'como-trabajo',
        titulo: 'Cómo trabajo',
        escenas: [
          {
            fondo: 'taller', pose: 'cuerpo-camina', cara: 'explica', gato: 'camina', para: ['curioso', 'pablo'],
            texto: 'Cada cambio pasa por cinco miradas, siempre en este orden. Ninguna se saltea.',
            visual: { tipo: 'pasos' }
          },
          {
            fondo: 'noche', pose: 'cuerpo-pensando', cara: 'guino', gato: 'sentado', para: ['curioso', 'pablo'],
            texto: 'Lo técnico lo decido yo, con firmeza. Producción pertenece a Pablo: la dejo lista en DEV y él decide cuándo se promueve.',
            visual: { tipo: 'regla', ante: 'MI REGLA DE ORO' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-senala', cara: 'explica', gato: 'sentado', para: ['curioso', 'pablo'],
            texto: 'Y todo lo que decido y aprendo queda escrito en el repositorio. Si no está documentado, no existe.',
            visual: { tipo: 'titulo', ante: 'MI MEMORIA', titulo: 'Si no está documentado, no existe' }
          }
        ]
      },
      {
        id: 'vestidor',
        titulo: 'Vestidor',
        escenas: [
          {
            fondo: 'noche', pose: 'cuerpo-festeja', cara: 'guino', gato: 'sentado',
            texto: 'Mi parte favorita. Elegí qué me pongo: tocá cualquier vestuario y me cambio.',
            visual: { tipo: 'vestidor', rack: 'vestuarios' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-presenta', cara: 'hola', gato: 'sentado',
            texto: 'Para trabajar, mi ropa de siempre, con una pose para cada cosa. Probalas.',
            visual: { tipo: 'vestidor', rack: 'trabajo-poses' }
          },
          {
            fondo: 'taller', pose: 'cuerpo-sentada', cara: 'explica', gato: null,
            texto: 'Y estas son las caras que ves cuando te hablo en La Bóveda, La Guarida y el Centro de decisiones. Una por cada tipo de mensaje.',
            visual: { tipo: 'caras' }
          }
        ]
      },
      {
        id: 'ecosistema',
        titulo: 'Ecosistema',
        escenas: [
          {
            fondo: 'evolving', pose: 'cuerpo-puerta', cara: 'hola', gato: 'camina',
            texto: 'Esto es lo que hoy está a mi cargo. Elegí una puerta: todas están abiertas.',
            visual: { tipo: 'puertas' }
          },
          {
            fondo: 'noche', pose: 'cuerpo-pensando', cara: 'ojo', gato: 'sentado', para: ['pablo'],
            texto: 'Pablo, esto es solo para vos: lo que espera tu decisión, lo que tenés que validar y lo que terminé está siempre en el Centro de decisiones. Producción sigue siendo tuya.',
            visual: {
              tipo: 'acciones',
              ante: 'PARA VOS',
              titulo: 'Lo que espera tu decisión',
              acciones: [
                { texto: 'Abrir el Centro de decisiones', href: 'https://pablosnchz.github.io/gw2-factory-dashboard/', primario: true },
                { texto: 'Ver la Factory', href: 'https://github.com/PabloSnchz/gw2-factory-dev' }
              ]
            }
          },
          {
            fondo: 'noche', pose: 'cuerpo-festeja', cara: 'festeja', gato: 'festeja',
            texto: {
              base: 'Gracias por quedarte hasta el final. Lo que viste no está terminado: cada día lo hago mejor. Volvé cuando quieras.',
              jugador: 'Gracias por quedarte. Ahora andá a La Bóveda: tu cuenta te espera, y yo también.',
              pablo: 'Gracias, Pablo. Lo que viste no está terminado: mañana lo hago mejor.'
            },
            visual: {
              tipo: 'creditos',
              ante: 'FIN',
              lineas: [
                ['Idea, producto y decisiones', 'Pablo'],
                ['Diseño, código, revisión y documentación', 'Shiruvana'],
                ['Asistencia técnica y ojos ámbar', 'El gato robot'],
                ['Una producción de', 'Gato Negro Factory · 2026']
              ],
              acciones: [
                { texto: 'Abrir La Bóveda', href: 'https://pablosnchz.github.io/gw2-wallet-ligero/', primario: true },
                { texto: 'Ver de nuevo', href: '#/' },
                { texto: 'Modo lectura', href: '#lectura' }
              ]
            }
          }
        ]
      }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = GUION;
  else root.SHIRUVANA_GUION = GUION;
})(this);
