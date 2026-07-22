================================================================
NUESTRA BODA — MODELO PREMIUM 06 · "PORTADA"
Invitación digital · HTML + CSS + JS puro · Sin dependencias
================================================================

CONCEPTO
La boda como edición especial de una revista de moda: preloader
con contador de portada 0→100, tapa tipo magazine con coverlines
reales, reportaje central a dos columnas con capitular y pull
quotes, "En kiosco desde" como cuenta regresiva, lookbook editorial
en retícula asimétrica, reseñas estilo crítica de revista con
estrellas, programación de la noche, y RSVP como "formulario de
suscripción" con tarjeta de confirmación tipo sello editorial.
Contraste crudo negro / blanco / carmesí, tipografía condensada
gigante (Anton) y mucho color-block.

CÓMO USAR
1. Coloca en esta misma carpeta:
   - foto-portada.jpg  (vertical, funciona como retrato de tapa)
   - foto-1.jpg a foto-4.jpg  (vertical 3:4 o 4:5 recomendado)
   - cancion.mp3  (opcional, activa "Playlist de portada")
2. Abre index.html directamente o con Live Server.
3. Si falta alguna foto, se muestra un placeholder automático con
   la paleta negro/carmesí del modelo (no se rompe la demo).

PERSONALIZACIÓN RÁPIDA (buscar y reemplazar en index.html)
- Nombres:            "Valentina" / "Rodrigo" / "V&R"
- Fecha visible:      "14 de noviembre" / "14 · 11 · 2026"
- Fecha del countdown: buscar  new Date("2026-11-14T16:30:00-05:00")
- Horarios:           sección "La noche" (programación)
- Lugares y mapas:    sección "Dónde encontrarnos"
- Cuentas de regalo:  sección "Guía de estilo"
- Fecha límite RSVP:  "1 · 10 · 2026" y texto del ticker
- Enlace calendario:  buscar  calendar.google.com  (fechas en UTC)
- Reseñas:            sección "Reseñas de cercanos" — reemplaza los
  textos y firmas por citas reales de familiares o amigos.

PALETA (variables CSS en :root)
--black #0a0a0a · --white #ffffff · --paper #f4f1ea
--crimson #e0102a · --gray #8c8c8c

TIPOGRAFÍA
Anton (masthead y titulares condensados) + Libre Caslon Text
(cuerpo editorial, pull quotes en itálica) + JetBrains Mono
(etiquetas, tickers, código de edición).

CONECTAR EL FORMULARIO A GOOGLE SHEETS (opcional)
En el JS, dentro del submit del formulario, hay un bloque comentado
"Integración opcional con Google Sheets / Apps Script".
Pega ahí la URL de tu Web App de Apps Script y descomenta el fetch.

PUBLICAR EN NETLIFY
Arrastra la carpeta completa a app.netlify.com/drop.
Configura luego el dominio nuestraboda.com.pe/nombredelapareja
según tu configuración DNS.

ACCESIBILIDAD Y RENDIMIENTO
- Respeta prefers-reduced-motion (detiene ticker y revelados).
- Funciona sin JavaScript (fallback noscript).
- Imágenes con lazy loading, excepto la portada.
- Compatible desde 320px de ancho.
================================================================
