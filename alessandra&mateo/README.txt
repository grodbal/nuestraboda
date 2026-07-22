================================================================
NUESTRA BODA — MODELO PREMIUM 05 · "SILENCIO"
Invitación digital · HTML + CSS + JS puro · Sin dependencias
================================================================

CONCEPTO
Lujo silencioso: casi sin ornamento, una sola tipografía
protagonista (Newsreader) y el espacio en blanco como material
principal. Sin marcos decorativos, sin metáforas (no hay "boleto"
ni "sobre de semillas"): el RSVP es un formulario limpio y directo.
Un hilo vertical fino marca el avance de lectura como único gesto
interactivo de firma. Un solo acento de color aparece apenas una
vez, al confirmar asistencia.

CÓMO USAR
1. Coloca en esta misma carpeta:
   - foto-portada.jpg  (horizontal, panorámica funciona mejor)
   - foto-1.jpg a foto-4.jpg  (vertical 3:4 o 4:5 recomendado)
   - cancion.mp3  (opcional, activa "Reproducir música")
2. Abre index.html directamente o con Live Server.
3. Si falta alguna foto, se muestra un placeholder neutro
   automático (no se rompe la demo).

PERSONALIZACIÓN RÁPIDA (buscar y reemplazar en index.html)
- Nombres:            "Alessandra" / "Mateo" / "A & M"
- Fecha visible:      "17 de octubre" / "17 · 10 · 2026"
- Fecha del countdown: buscar  new Date("2026-10-17T16:30:00-05:00")
- Horarios:           sección "El día" (itinerario)
- Lugares y mapas:    sección "Dónde encontrarnos"
- Fecha límite RSVP:  "20 de septiembre"
- Enlace calendario:  este modelo no incluye botón de calendario
  por diseño (minimalismo); puede añadirse siguiendo el patrón de
  los modelos 02, 03 o 04 si se desea.

PALETA (variables CSS en :root)
--white #faf9f6 · --ink #161613 · --gray #8a877e · --accent #a4402c
(el acento se usa una sola vez: el punto de confirmación del RSVP)

TIPOGRAFÍA
Newsreader (display, óptica grande) + Space Grotesk (etiquetas,
formulario). Solo dos familias, con pesos muy limitados a propósito.

FILOSOFÍA DE DISEÑO
Este modelo es intencionalmente el más contenido del portafolio:
está pensado para parejas que piden "elegante pero simple". La
sofisticación está en el espaciado, el ritmo tipográfico y la
ausencia de decoración — no añadas marcos, iconos ni color extra
sin razón, o se pierde el efecto.

CONECTAR EL FORMULARIO A GOOGLE SHEETS (opcional)
En el JS, dentro del submit del formulario, hay un bloque comentado
"Integración opcional con Google Sheets / Apps Script".
Pega ahí la URL de tu Web App de Apps Script y descomenta el fetch.

PUBLICAR EN NETLIFY
Arrastra la carpeta completa a app.netlify.com/drop.
Configura luego el dominio nuestraboda.com.pe/nombredelapareja
según tu configuración DNS.

ACCESIBILIDAD Y RENDIMIENTO
- Respeta prefers-reduced-motion (detiene el hilo de lectura y revelados).
- Funciona sin JavaScript (fallback noscript).
- Imágenes con lazy loading, excepto la portada.
- Compatible desde 320px de ancho.
================================================================
