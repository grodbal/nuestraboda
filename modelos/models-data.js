/* ================================================================
   NUESTRA BODA — CATÁLOGO DE MODELOS
   ================================================================
   Este es el ÚNICO archivo que necesitas editar para que un modelo
   nuevo aparezca en la página /modelos/. La tarjeta, el número,
   los colores y el contador del encabezado se generan solos.

   CÓMO AGREGAR UN MODELO NUEVO
   -----------------------------------------------------------------
   1. Sube la carpeta de tu invitación junto a las demás, por ejemplo:
        /valentina&rodrigo/index.html
   2. Copia uno de los bloques { ... } de abajo, pégalo al final del
      arreglo (antes del corchete final "]") y edita sus datos.
   3. Guarda. Recarga /modelos/index.html — listo, ya aparece.

   CAMPOS
   -----------------------------------------------------------------
   href          (obligatorio) Ruta a la carpeta de la invitación.
   coupleTitle   (obligatorio) Nombre de la pareja. Usa "<br>" si
                 quieres forzar un salto de línea en el título.
   category      (opcional) Etiqueta de estilo, ej. "Romance nocturno".
                 Si la omites se muestra "Modelo personalizado".
                 Además alimenta los filtros de arriba de la grilla:
                 categorías repetidas se agrupan automáticamente.
   description   (opcional) Una frase corta describiendo el modelo.
   thumb         (opcional) Si NO la defines, la tarjeta muestra
                 automáticamente una vista previa EN VIVO de la
                 portada real de esa invitación (un iframe a escala
                 reducida apuntando a "href"). No necesitas sacar
                 capturas de pantalla — simplemente sube la carpeta
                 y la vista previa se genera sola.
                 Solo define "thumb" si prefieres usar una imagen
                 estática en vez de la vista previa en vivo (por
                 ejemplo, para aligerar la carga en conexiones lentas
                 o si una invitación en particular es muy pesada).
                 Ej: thumb: "../valentina&rodrigo/preview.jpg"
   palette       (opcional) Arreglo de 3 colores hex para el fondo
                 de respaldo que se ve mientras carga la vista previa
                 en vivo (o si "href" aún no existe), ej.
                 ["#0b1026","#060812","#8fb1e0"].
                 Si lo omites, se asigna una paleta automática.
   motif         (opcional) Número del 1 al 8 que elige la
                 composición del fondo generado (marco, cortina,
                 grilla, retrato, orgánico, arco, pilar, rombos).
                 Si lo omites, se asigna automáticamente por orden.
   ================================================================ */

window.SITE_MODELS = [

  {
    href: "../alessandra&mateo/",
    
    category: "Editorial contemporáneo",
    description: "Una composición editorial de alto contraste con fotografía protagonista.",
    palette: ["#85675b", "#251e1c", "#d1b277"],
    motif: 1
  },
  {
    href: "../valentina&rodrigo/",
    
    category: "Editorial revista",
    description: "Contrastes oscuros, detalles de lujo y una experiencia visual envolvente.",
    palette: ["#1a1921", "#664751", "#ffffff"],
    motif: 3
  },
  {
    href: "../antuaneth&alonso/",
    
    category: "Romance nocturno",
    description: "Una experiencia profunda, elegante y cinematográfica.",
    palette: ["#bc2b30", "#541b25", "#1e090e"],
    motif: 2
  },
  {
    href: "../daniela&joaquin/",
    
    category: "Viaje y destinos",
    description: "La historia de la pareja contada como un recorrido entre lugares y recuerdos.",
    palette: ["#d9d0bd", "#82734e", "#7b3438"],
    motif: 3
  },
    {
    href: "../camila&andres/",
   
    category: "Viaje y destinos",
    description: "La historia de la pareja contada como un recorrido entre lugares y recuerdos.",
    palette: ["#d9d0bd", "#82734e", "#7b3438"],
    motif: 8
  },
  {
    href: "../melanie&victor/",
    
    category: "Álbum analógico",
    description: "Recuerdos espontáneos presentados como páginas de un álbum personal.",
    palette: ["#d2a59c", "#80625f", "#f0e5d5"],
    motif: 4
  },
  {
    href: "../valentina&sebastian/",
  
    category: "Editorial nocturno",
    description: "Contrastes oscuros, detalles de lujo y una experiencia visual envolvente.",
    palette: ["#1a1921", "#664751", "#ffffff"],
    motif: 8
  },
  {
    href: "../camila&sebastian/",
    
    category: "Jardín contemporáneo",
    description: "Naturaleza, texturas orgánicas y una composición elegante sin excesos.",
    palette: ["#15221c", "#60705d", "#e7d2a4"],
    motif: 5
  },
  {
    href: "../ingrid&gonzalo/",
    
    category: "Arquitectura clásica",
    description: "Una puesta en escena sofisticada inspirada en hoteles y salones europeos.",
    palette: ["#bda476", "#3a3123", "#171410"],
    motif: 6
  },
  {
    href: "../lucero&jorge/",
    
    category: "Arquitectura clásica",
    description: "Una puesta en escena sofisticada inspirada en hoteles y salones europeos.",
    palette: ["#bda476", "#3a3123", "#171410"],
    motif: 2
  },
  {
    href: "../isabel&gabriel/",
    
    category: "Botánico elegante",
    description: "Una invitación luminosa con sensibilidad romántica y detalles naturales.",
    palette: ["#f0e5d4", "#879075", "#ffffff"],
    motif: 7
  },
  {
    href: "../renata&nicolas/",
   
    category: "Arquitectura clásica",
    description: "Una puesta en escena sofisticada inspirada en hoteles y salones europeos.",
    palette: ["#bda476", "#3a3123", "#171410"],
    motif: 6
  }

  /* Copia este bloque para agregar un modelo nuevo:
  ,{
    href: "../nombre-de-la-carpeta/",
    coupleTitle: "Nombre<br>&amp; Nombre",
    category: "Estilo del modelo",
    description: "Una frase corta describiendo el concepto.",
    palette: ["#111111", "#333333", "#c9a227"],
    motif: 1
  }
  */

];
