const CONFIG = Object.freeze({
  EVENT_NAME: 'Lesly y Jairo',
  FOLDER_ID: '1H2Xeyrnf3jzpbAub7A5IA5seRTvIf6Ph',
  ACCESS_KEY: 'LJ-7kQ2-9mX4',
  TIMEZONE: 'America/Lima',
  MAX_FILE_SIZE_MB: 10,
  MAX_FILES_PER_BATCH: 20,
  UPLOADS_CLOSE_AT: '2026-09-20T23:59:59-05:00',
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
});

/**
 * Sirve la página pública únicamente cuando la URL contiene la clave correcta.
 */
function doGet(e) {
  const accessKey = String((e && e.parameter && e.parameter.key) || '');

  if (accessKey !== CONFIG.ACCESS_KEY) {
    return HtmlService.createHtmlOutput(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Acceso no disponible</title>
        </head>
        <body style="font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f7f2ec;color:#40362f;text-align:center;padding:24px;box-sizing:border-box;">
          <main>
            <h1 style="font-size:26px;margin-bottom:10px;">Acceso no disponible</h1>
            <p style="max-width:440px;line-height:1.6;">Utiliza el enlace o código QR oficial compartido por Lesly y Jairo.</p>
          </main>
        </body>
      </html>
    `)
      .setTitle('Acceso no disponible')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (!uploadsAreOpen_()) {
    return HtmlService.createHtmlOutput(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Álbum cerrado</title>
        </head>
        <body style="font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f7f2ec;color:#40362f;text-align:center;padding:24px;box-sizing:border-box;">
          <main>
            <h1 style="font-size:26px;margin-bottom:10px;">El álbum ya está cerrado</h1>
            <p style="max-width:440px;line-height:1.6;">Gracias por haber compartido tus recuerdos con Lesly y Jairo.</p>
          </main>
        </body>
      </html>
    `)
      .setTitle('Álbum cerrado')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  const template = HtmlService.createTemplateFromFile('Index');
  template.eventName = CONFIG.EVENT_NAME;
  template.accessKey = CONFIG.ACCESS_KEY;
  template.maxFileSizeMb = CONFIG.MAX_FILE_SIZE_MB;
  template.maxFilesPerBatch = CONFIG.MAX_FILES_PER_BATCH;

  return template
    .evaluate()
    .setTitle(`Comparte tus fotos | ${CONFIG.EVENT_NAME}`)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Ejecuta esta función manualmente una sola vez desde el editor para autorizar
 * el acceso del proyecto a la carpeta privada de Google Drive.
 */
function authorizeApp() {
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  console.log(`Carpeta autorizada: ${folder.getName()}`);
}

/**
 * Recibe una fotografía en Base64 y la guarda en la carpeta privada.
 */
function uploadPhoto(payload) {
  validatePayload_(payload);

  if (!uploadsAreOpen_()) {
    throw new Error('El periodo para subir fotografías ya finalizó.');
  }

  const guestName = sanitizeText_(payload.guestName, 60);
  const originalName = sanitizeText_(payload.originalName, 120);
  const uploadId = sanitizeUploadId_(payload.uploadId);
  const mimeType = normalizeMimeType_(payload.mimeType, originalName);

  if (!CONFIG.ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Formato no permitido. Usa JPG, PNG, WEBP, HEIC o HEIF.');
  }

  const bytes = Utilities.base64Decode(payload.base64);
  const maxBytes = CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;

  if (!bytes.length) {
    throw new Error('La fotografía está vacía o dañada.');
  }

  if (bytes.length > maxBytes) {
    throw new Error(`Cada fotografía debe pesar como máximo ${CONFIG.MAX_FILE_SIZE_MB} MB.`);
  }

  const extension = getExtension_(originalName, mimeType);
  const guestPart = sanitizeFilePart_(guestName).slice(0, 45) || 'Invitado';
  const originalPart = sanitizeFilePart_(removeExtension_(originalName)).slice(0, 45) || 'Foto';
  const finalName = `${guestPart}_${originalPart}_${uploadId}.${extension}`;
  const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);

  // Hace que los reintentos sean seguros: si ya se guardó el mismo archivo,
  // devuelve éxito sin crear una segunda copia.
  const existing = folder.getFilesByName(finalName);
  if (existing.hasNext()) {
    return {
      success: true,
      alreadyUploaded: true,
      savedName: finalName
    };
  }

  const blob = Utilities.newBlob(bytes, mimeType, finalName);
  const file = folder.createFile(blob);
  file.setDescription(
    `Evento: ${CONFIG.EVENT_NAME}\n` +
    `Invitado: ${guestName}\n` +
    `Nombre original: ${originalName}\n` +
    `Fecha de carga: ${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm:ss')}`
  );

  return {
    success: true,
    alreadyUploaded: false,
    savedName: finalName
  };
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('No se recibieron datos válidos.');
  }

  if (String(payload.accessKey || '') !== CONFIG.ACCESS_KEY) {
    throw new Error('Acceso no autorizado.');
  }

  if (!String(payload.guestName || '').trim()) {
    throw new Error('Escribe tu nombre antes de subir las fotografías.');
  }

  if (!String(payload.originalName || '').trim()) {
    throw new Error('No se pudo identificar el archivo.');
  }

  if (!String(payload.base64 || '').trim()) {
    throw new Error('No se recibieron los datos de la fotografía.');
  }
}

function uploadsAreOpen_() {
  return new Date().getTime() <= new Date(CONFIG.UPLOADS_CLOSE_AT).getTime();
}

function sanitizeText_(value, maxLength) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeUploadId_(value) {
  const clean = String(value || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  if (clean.length < 8) {
    throw new Error('Identificador de carga inválido. Intenta nuevamente.');
  }
  return clean;
}

function sanitizeFilePart_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function removeExtension_(fileName) {
  return String(fileName || '').replace(/\.[^.]+$/, '');
}

function normalizeMimeType_(mimeType, fileName) {
  const normalized = String(mimeType || '').toLowerCase().trim();
  if (CONFIG.ALLOWED_MIME_TYPES.includes(normalized)) {
    return normalized;
  }

  const extension = String(fileName || '').split('.').pop().toLowerCase();
  const mimeByExtension = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif'
  };

  return mimeByExtension[extension] || normalized;
}

function getExtension_(fileName, mimeType) {
  const extension = String(fileName || '').split('.').pop().toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

  if (allowedExtensions.includes(extension)) {
    return extension === 'jpeg' ? 'jpg' : extension;
  }

  const extensionByMime = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif'
  };

  return extensionByMime[mimeType] || 'jpg';
}
