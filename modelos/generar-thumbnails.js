/* ================================================================
   GENERADOR DE THUMBNAILS — Nuestra Boda / catálogo de modelos
   ================================================================
   Qué hace:
   Recorre todos los modelos definidos en models-data.js, abre cada
   invitación en un navegador headless, espera a que el preloader
   (si lo tiene) termine y las animaciones de entrada se asienten,
   y guarda una captura SOLO de la primera hoja (la sección #hero)
   como "preview.webp" dentro de la propia carpeta del modelo.

   Con eso, en models-data.js solo tienes que agregar:
     thumb: "../nombre-carpeta/preview.webp"
   (este mismo script te lo puede escribir automáticamente — ver
   la opción AUTO_PATCH_MODELS_DATA más abajo).

   Por qué así:
   - Nunca carga la invitación completa dentro de la página de
     catálogo (cero GA duplicado, cero fuentes/JS extra en /modelos/).
   - El usuario ve la portada real al instante, sin hover ni espera.
   - El screenshot es solo el "hero", no la página entera: pesa poco
     y es justo lo que el usuario necesita para decidir con un vistazo.

   REQUISITOS (una sola vez, en tu máquina):
     npm install playwright sharp
     npx playwright install chromium

   USO:
     node generar-thumbnails.js

   Puedes correrlo:
     a) Contra el sitio en producción → deja MODE = "live"
     b) Contra tus carpetas en local (antes de subir) → MODE = "local"
   ================================================================ */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const sharp = require("sharp");

/* ---------------------------------------------------------------
   CONFIGURACIÓN — edita esto según dónde estés corriendo el script
   --------------------------------------------------------------- */
const CONFIG = {
  // "live"  -> abre cada modelo en tu dominio real (más confiable:
  //            usa exactamente lo que ve el usuario, con sus assets).
  // "local" -> abre cada modelo desde una carpeta en tu disco.
  MODE: "live",

  // Solo si MODE = "live": dominio base (sin slash final).
  LIVE_BASE_URL: "https://www.nuestraboda.com.pe",

  // Solo si MODE = "local": carpeta que contiene todas las carpetas
  // de modelos (alessandra&mateo/, valentina&rodrigo/, etc.) y también
  // el propio models-data.js.
  LOCAL_BASE_DIR: __dirname,

  // Ruta a tu catálogo (para leer los "href" de cada modelo).
  MODELS_DATA_PATH: path.join(__dirname, "models-data.js"),

  // Tamaño virtual del "hero" a capturar (debe calzar con el ancho
  // de escritorio para el que están pensadas tus portadas).
  VIEWPORT: { width: 1440, height: 900 },

  // Ancho final del archivo guardado (se reduce con sharp; el thumb
  // en la grilla nunca se ve a tamaño completo, así que no hace
  // falta guardar 1440px de ancho real).
  OUTPUT_WIDTH: 900,
  OUTPUT_QUALITY: 82, // calidad webp (0-100)

  // Nombre del archivo que se guarda dentro de cada carpeta de modelo.
  OUTPUT_FILENAME: "preview.webp",

  // Si es true, además de generar las imágenes, reescribe
  // models-data.js agregando/actualizando el campo "thumb" de cada
  // bloque automáticamente (crea un .bak antes de tocar el archivo).
  AUTO_PATCH_MODELS_DATA: true,

  // Si es true (recomendado): al correr el script de nuevo, SOLO
  // procesa los modelos que todavía no tienen "thumb" en
  // models-data.js. Así, cada vez que agregas una invitación nueva,
  // el script no vuelve a generar las 18 anteriores — solo la nueva.
  // Ponlo en false si quieres forzar la regeneración de TODAS las
  // miniaturas (por ejemplo, si rediseñaste varios heros).
  SKIP_EXISTING: true,

  // Cuánto esperar (ms) después de que el preloader termine (o, si
  // el modelo no tiene preloader, después de que cargue la página)
  // para dejar que las animaciones de entrada del hero se asienten.
  SETTLE_MS: 1200,

  // Tiempo máximo (ms) que se espera a que aparezca #preloader.done.
  // Si el modelo no tiene preloader, esto simplemente hace timeout
  // y el script sigue sin problema.
  PRELOADER_TIMEOUT_MS: 6000,
};

/* ---------------------------------------------------------------
   Lee models-data.js y extrae los href de cada bloque, en orden.
   No requiere que el archivo sea JSON válido (es un archivo JS con
   comentarios), solo le interesa el patrón href: "...".
   --------------------------------------------------------------- */
function readModelHrefs(modelsDataPath) {
  const src = fs.readFileSync(modelsDataPath, "utf8");
  // Quita comentarios /* ... */ solo para la búsqueda de hrefs, así no
  // se cuela el bloque de ejemplo comentado al final del archivo.
  const srcWithoutComments = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const hrefRegex = /href:\s*["'`](.*?)["'`]/g;
  const hrefs = [];
  let match;
  while ((match = hrefRegex.exec(srcWithoutComments)) !== null) {
    hrefs.push(match[1]);
  }
  return { src, hrefs };
}

/* "../alessandra&mateo/" -> "alessandra&mateo" */
function folderNameFromHref(href) {
  return href.replace(/^(\.\.?\/)+/, "").replace(/\/+$/, "");
}

/* Revisa si el bloque de ese href ya tiene un campo "thumb" (para
   no reprocesarlo cuando SKIP_EXISTING está activo). */
function hrefAlreadyHasThumb(src, href) {
  const hrefEscaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockRegex = new RegExp(
    `\\{[^{}]*?href:\\s*["'\`]${hrefEscaped}["'\`][^{}]*?\\}`,
    "s"
  );
  const block = src.match(blockRegex);
  if (!block) return false;
  return /thumb\s*:\s*["'`].+?["'`]/.test(block[0]);
}

function buildTargetUrl(href) {
  const folder = folderNameFromHref(href);
  if (CONFIG.MODE === "live") {
    return `${CONFIG.LIVE_BASE_URL}/${folder}/`;
  }
  const indexPath = path.join(CONFIG.LOCAL_BASE_DIR, folder, "index.html");
  return "file://" + indexPath;
}

function outputPathFor(href) {
  const folder = folderNameFromHref(href);
  const dir =
    CONFIG.MODE === "local"
      ? path.join(CONFIG.LOCAL_BASE_DIR, folder)
      : path.join(__dirname, "thumbnails-generados", folder);
  return { dir, file: path.join(dir, CONFIG.OUTPUT_FILENAME) };
}

async function captureHero(page, url) {
  await page.goto(url, { waitUntil: "load", timeout: 30000 });

  // Si el modelo tiene preloader, espera a que termine. Si no lo
  // tiene, esto hace timeout solo y seguimos sin drama.
  try {
    await page.waitForSelector("#preloader.done", {
      timeout: CONFIG.PRELOADER_TIMEOUT_MS,
    });
  } catch (_) {
    /* no tenía preloader, o tardó más de la cuenta: seguimos igual */
  }

  await page.waitForTimeout(CONFIG.SETTLE_MS);

  const hero = await page.$("#hero");
  if (hero) {
    return await hero.screenshot();
  }
  // Fallback: si algún modelo no usa id="hero", capturamos el
  // viewport inicial completo (equivalente a la primera pantalla).
  return await page.screenshot({
    clip: { x: 0, y: 0, width: CONFIG.VIEWPORT.width, height: CONFIG.VIEWPORT.height },
  });
}

/* ---------------------------------------------------------------
   Reescribe models-data.js agregando/actualizando "thumb" en el
   bloque que tenga el href correspondiente. Conserva todo lo demás
   tal cual. Crea un .bak antes de escribir.
   --------------------------------------------------------------- */
function patchModelsData(src, hrefToThumb) {
  let out = src;

  for (const [href, thumbPath] of Object.entries(hrefToThumb)) {
    const hrefEscaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Encuentra el bloque { ... } que contiene ese href exacto.
    const blockRegex = new RegExp(
      `(\\{[^{}]*?href:\\s*["'\`]${hrefEscaped}["'\`][^{}]*?)(\\n\\s*\\})`,
      "s"
    );
    out = out.replace(blockRegex, (full, body, closing) => {
      if (/thumb\s*:/.test(body)) {
        // ya tenía thumb: lo actualiza
        return (
          body.replace(/thumb\s*:\s*["'`].*?["'`]/, `thumb: "${thumbPath}"`) +
          closing
        );
      }
      // no tenía thumb: lo agrega al final del bloque
      const trimmed = body.replace(/\s*$/, "");
      const needsComma = /[^\s,]\s*$/.test(trimmed) && !trimmed.endsWith(",");
      return `${trimmed}${needsComma ? "," : ""}\n    thumb: "${thumbPath}"${closing}`;
    });
  }

  return out;
}

async function main() {
  const { src, hrefs: allHrefs } = readModelHrefs(CONFIG.MODELS_DATA_PATH);
  console.log(`Encontrados ${allHrefs.length} modelos en models-data.js`);

  const hrefs = CONFIG.SKIP_EXISTING
    ? allHrefs.filter((h) => !hrefAlreadyHasThumb(src, h))
    : allHrefs;

  const skipped = allHrefs.length - hrefs.length;
  if (skipped > 0) {
    console.log(`${skipped} ya tienen "thumb" y se van a saltar (SKIP_EXISTING).`);
  }
  console.log(`Se van a generar ${hrefs.length} thumbnail(s) nuevo(s).\n`);

  if (hrefs.length === 0) {
    console.log("Nada que hacer — todos los modelos ya tienen thumb.");
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: CONFIG.VIEWPORT });

  // Bloquea analítica mientras generamos capturas, para no disparar
  // page views / conversiones fantasma en tu cuenta de Ads/Analytics.
  await context.route(
    /googletagmanager\.com|google-analytics\.com|doubleclick\.net/,
    (route) => route.abort()
  );

  const hrefToThumb = {};
  let ok = 0;
  let failed = [];

  for (const href of hrefs) {
    const folder = folderNameFromHref(href);
    const url = buildTargetUrl(href);
    const { dir, file } = outputPathFor(href);

    process.stdout.write(`→ ${folder} ... `);
    try {
      const page = await context.newPage();
      const buffer = await captureHero(page, url);
      await page.close();

      fs.mkdirSync(dir, { recursive: true });
      await sharp(buffer)
        .resize({ width: CONFIG.OUTPUT_WIDTH })
        .webp({ quality: CONFIG.OUTPUT_QUALITY })
        .toFile(file);

      const thumbPath = href.replace(/\/$/, "") + "/" + CONFIG.OUTPUT_FILENAME;
      hrefToThumb[href] = CONFIG.MODE === "local" ? thumbPath : thumbPath;

      console.log("OK");
      ok++;
    } catch (err) {
      console.log("FALLÓ");
      failed.push({ folder, error: err.message });
    }
  }

  await browser.close();

  console.log(`\n${ok}/${hrefs.length} thumbnails generados.`);
  if (failed.length) {
    console.log("\nModelos que fallaron (revísalos manualmente):");
    failed.forEach((f) => console.log(`  - ${f.folder}: ${f.error}`));
  }

  if (CONFIG.AUTO_PATCH_MODELS_DATA && Object.keys(hrefToThumb).length) {
    const backupPath = CONFIG.MODELS_DATA_PATH + ".bak";
    fs.copyFileSync(CONFIG.MODELS_DATA_PATH, backupPath);
    const patched = patchModelsData(src, hrefToThumb);
    fs.writeFileSync(CONFIG.MODELS_DATA_PATH, patched, "utf8");
    console.log(`\nmodels-data.js actualizado con los "thumb" nuevos.`);
    console.log(`Respaldo del original guardado en: ${backupPath}`);
  } else if (Object.keys(hrefToThumb).length) {
    console.log("\nAgrega esto manualmente a cada bloque en models-data.js:\n");
    for (const [href, thumbPath] of Object.entries(hrefToThumb)) {
      console.log(`  ${href}  ->  thumb: "${thumbPath}"`);
    }
  }
}

main().catch((err) => {
  console.error("Error general:", err);
  process.exit(1);
});
