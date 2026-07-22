================================================================
NUESTRA BODA — MODELO PREMIUM 07 · "CONSTELACIÓN"
Invitación digital · HTML + CSS + JS puro · Sin dependencias
================================================================

CONCEPTO
Dos personas bajo el mismo cielo: preloader de estrella naciente,
portada con campo de estrellas titilantes generado por JavaScript,
historia narrada como "tres constelaciones" con nodos circulares
conectados por líneas punteadas, cuenta regresiva acompañada de una
luna simbólica que se va "llenando" a medida que se acerca la fecha,
galería tipo cúmulo de estrellas con fotos circulares conectadas por
líneas que se dibujan al hacer scroll, e itinerario presentado como
"carta astral de la noche". RSVP como "coordenada de asistencia".

CÓMO USAR
1. Coloca en esta misma carpeta:
   - foto-1.jpg a foto-4.jpg  (vertical o cuadrada, se recortan en círculo)
   - cancion.mp3  (opcional, activa "Música de fondo")
   Nota: este modelo no usa foto de portada de fondo; el hero es
   tipográfico sobre un campo de estrellas.
2. Abre index.html directamente o con Live Server.
3. Si falta alguna foto, se muestra un placeholder automático con
   la paleta índigo/plata del modelo (no se rompe la demo).

PERSONALIZACIÓN RÁPIDA (buscar y reemplazar en index.html)
- Nombres:            "Camila" / "Andrés" / "C & A"
- Fecha visible:      "6 de marzo" / "06.03.2027"
- Fecha del countdown: buscar  new Date("2027-03-06T16:30:00-05:00")
- Referencia lunar:   buscar  startRef  (fecha desde la que empieza
  a "llenarse" la luna simbólica; ajústala a cuando publiques el sitio)
- Horarios:           sección "El itinerario"
- Lugares y mapas:    sección "Las coordenadas"
- Cuentas de regalo:  sección "Guía del observador"
- Fecha límite RSVP:  "15 · 01 · 2027" y texto del ticker
- Enlace calendario:  buscar  calendar.google.com  (fechas en UTC)

PALETA (variables CSS en :root)
--midnight #0b1026 · --panel #f4f1e9 · --silver #d7dced · --nova #8fb1e0
(acento frío tipo luz estelar, distinto del dorado cálido de otros modelos)

TIPOGRAFÍA
Spectral (headlines e itálicas editoriales) + DM Mono (etiquetas,
coordenadas, datos técnicos). Combinación nueva, no usada en el
resto del portafolio.

ELEMENTOS DE FIRMA
- Campo de estrellas: generado dinámicamente por JavaScript
  (función makeStars), con parpadeo aleatorio vía CSS.
- Líneas de constelación: SVG con stroke-dashoffset que se dibujan
  al hacer scroll, conectando las fotografías como puntos de luz.
- Luna simbólica: no es una fase lunar astronómica real, sino una
  animación decorativa que representa el avance hacia la boda.

CONECTAR EL FORMULARIO A GOOGLE SHEETS (opcional)
En el JS, dentro del submit del formulario, hay un bloque comentado
"Integración opcional con Google Sheets / Apps Script".
Pega ahí la URL de tu Web App de Apps Script y descomenta el fetch.

PUBLICAR EN NETLIFY
Arrastra la carpeta completa a app.netlify.com/drop.
Configura luego el dominio nuestraboda.com.pe/nombredelapareja
según tu configuración DNS.

ACCESIBILIDAD Y RENDIMIENTO
- Respeta prefers-reduced-motion (detiene estrellas, ticker y líneas).
- Funciona sin JavaScript (fallback noscript).
- Imágenes con lazy loading, excepto las de la historia principal.
- Compatible desde 320px de ancho.
================================================================
