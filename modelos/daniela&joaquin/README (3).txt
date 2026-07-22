================================================================
NUESTRA BODA — MODELO PREMIUM 08 · "NEÓN"
Invitación digital · HTML + CSS + JS puro · Sin dependencias
================================================================

CONCEPTO
La boda como una noche de ciudad: preloader de letrero de neón
encendiéndose, portada con fondos "aurora" en movimiento (blobs
difuminados de color), nombres con efecto glitch RGB al cargar,
texto con degradado holográfico animado (rosa → violeta → cian),
tarjetas con bordes de degradado giratorio, historia como "tres
instantes", galería con marcos de neón de distinto color cada uno,
itinerario como línea de tiempo con puntos luminosos, y RSVP como
"entrada a la noche" con confirmación en sello holográfico.

CÓMO USAR
1. Coloca en esta misma carpeta:
   - foto-1.jpg a foto-4.jpg  (vertical 4:5 recomendado)
   - cancion.mp3  (opcional, activa "Playlist de la noche")
   Nota: este modelo no usa foto de portada de fondo; el hero es
   tipográfico sobre fondos de color en movimiento.
2. Abre index.html directamente o con Live Server.
3. Si falta alguna foto, se muestra un placeholder automático con
   la paleta neón del modelo (no se rompe la demo).

PERSONALIZACIÓN RÁPIDA (buscar y reemplazar en index.html)
- Nombres:            "Daniela" / "Joaquín" / "D&J"
  (ojo: "Daniela" y "Joaquín" aparecen también en atributos
  data-text="Daniela" del efecto glitch — reemplaza ambas apariciones)
- Fecha visible:      "22 de agosto" / "22.08.2026"
- Fecha del countdown: buscar  new Date("2026-08-22T16:30:00-05:00")
- Horarios:           sección "La noche" (itinerario)
- Lugares y mapas:    sección "Dónde encontrarnos"
- Cuentas de regalo:  sección "Guía de la noche"
- Fecha límite RSVP:  "1 · 07 · 2026" y texto del ticker
- Enlace calendario:  buscar  calendar.google.com  (fechas en UTC)

PALETA (variables CSS en :root)
--black #08060d · --pink #ff2e88 · --purple #8b5cf6 · --cyan #28e5ff

TIPOGRAFÍA
Unbounded (headlines geométricos y contundentes) + Martian Mono
(etiquetas, reloj de cuenta regresiva, look digital) + Plus Jakarta
Sans (texto de lectura). Combinación nueva, no usada en el resto
del portafolio.

ELEMENTOS DE FIRMA
- Fondos "aurora": tres formas difuminadas de color que se mueven
  lentamente (clase .aurora), reutilizadas en portada, cuenta
  regresiva, RSVP y cierre.
- Bordes giratorios: clase .glow-border — un degradado cónico que
  rota detrás de tarjetas y botones clave (insignia de fecha, reloj,
  ticket de confirmación).
- Efecto glitch: los nombres del hero usan un atributo data-text
  duplicado en rosa/cian que se desalinea brevemente al cargar.
- Texto holográfico: clase .holo-text, degradado animado que se
  usa con moderación en acentos puntuales (ampersands, palabras clave).

CONECTAR EL FORMULARIO A GOOGLE SHEETS (opcional)
En el JS, dentro del submit del formulario, hay un bloque comentado
"Integración opcional con Google Sheets / Apps Script".
Pega ahí la URL de tu Web App de Apps Script y descomenta el fetch.

PUBLICAR EN NETLIFY
Arrastra la carpeta completa a app.netlify.com/drop.
Configura luego el dominio nuestraboda.com.pe/nombredelapareja
según tu configuración DNS.

ACCESIBILIDAD Y RENDIMIENTO
- Respeta prefers-reduced-motion (detiene aurora, glitch, bordes
  giratorios y degradado holográfico).
- Funciona sin JavaScript (fallback noscript).
- Imágenes con lazy loading, excepto las de la sección de historia.
- Compatible desde 320px de ancho.
================================================================
