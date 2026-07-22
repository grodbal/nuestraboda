/**
 * Sistema de invitaciones personalizadas para la boda de Lesly & Jairo.
 * Vincular este proyecto de Apps Script a la hoja de cálculo que contiene
 * las pestañas "Invitados" y "Confirmaciones".
 */

const CONFIG = Object.freeze({
  HOJA_INVITADOS: 'Invitados',
  HOJA_CONFIRMACIONES: 'Confirmaciones',
  URL_BASE: 'https://nuestraboda.com.pe/lesly&jairo',
  EVENTO: 'Boda Lesly & Jairo',
  FECHA_BODA: 'Sábado 05 de septiembre de 2026',
  LONGITUD_CODIGO: 12,
  MAX_NOMBRE_ACOMPANANTE: 100,
  MAX_COMENTARIO: 1000,
  MAX_USER_AGENT: 500
});

const ENCABEZADOS_INVITADOS = Object.freeze([
  'Código',
  'Invitado o grupo',
  'Cupos adultos',
  'Teléfono de referencia',
  'Activo',
  'Estado',
  'Adultos confirmados',
  'Nombres de acompañantes',
  'Teléfono confirmado',
  'Comentario',
  'Fecha de confirmación',
  'Última actualización',
  'Enlace personalizado',
  'Último ID de envío'
]);

const ENCABEZADOS_CONFIRMACIONES = Object.freeze([
  'Fecha y hora',
  'Código',
  'Invitado o grupo',
  'Cupos asignados',
  'Asistencia',
  'Adultos confirmados',
  'Nombres de acompañantes',
  'Teléfono',
  'Comentario',
  'Origen',
  'Dispositivo o navegador',
  'Tipo de operación',
  'ID de envío'
]);

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Invitaciones')
    .addItem('Configurar hojas', 'configurarHojas')
    .addSeparator()
    .addItem('Generar códigos y enlaces', 'generarCodigosYEnlaces')
    .addItem('Revisar filas incompletas', 'revisarFilasIncompletas')
    .addItem('Actualizar enlaces faltantes', 'actualizarEnlacesFaltantes')
    .addSeparator()
    .addItem('Crear casos de prueba', 'crearCasosDePrueba')
    .addToUi();
}

function configurarHojas() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  configurarHoja_(libro, CONFIG.HOJA_INVITADOS, ENCABEZADOS_INVITADOS);
  configurarHoja_(libro, CONFIG.HOJA_CONFIRMACIONES, ENCABEZADOS_CONFIRMACIONES);
  SpreadsheetApp.getUi().alert('Las hojas Invitados y Confirmaciones están configuradas.');
}

function configurarHoja_(libro, nombre, encabezados) {
  let hoja = libro.getSheetByName(nombre);
  if (!hoja) hoja = libro.insertSheet(nombre);

  if (hoja.getLastRow() === 0) {
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
  } else {
    const actuales = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), encabezados.length)).getDisplayValues()[0];
    const mapa = crearMapaEncabezados_(actuales);
    const faltantes = encabezados.filter(encabezado => mapa[normalizarEncabezado_(encabezado)] === undefined);
    if (faltantes.length) {
      hoja.getRange(1, hoja.getLastColumn() + 1, 1, faltantes.length).setValues([faltantes]);
    }
  }

  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, hoja.getLastColumn())
    .setFontWeight('bold')
    .setBackground('#e9eef3')
    .setFontColor('#263346');
  hoja.autoResizeColumns(1, hoja.getLastColumn());
  return hoja;
}

function generarCodigosYEnlaces() {
  const ui = SpreadsheetApp.getUi();
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(1000)) {
    ui.alert('Ya hay otra generación en curso. Espera unos segundos e intenta nuevamente.');
    return;
  }

  try {
    const resultado = procesarCodigosYEnlaces_(true);
    const mensaje = [
      'Proceso terminado.',
      '',
      'Invitaciones generadas: ' + resultado.invitacionesGeneradas,
      'Filas ya configuradas: ' + resultado.filasConfiguradas,
      'Filas con errores: ' + resultado.filasConErrores
    ];
    if (resultado.filasError.length) {
      mensaje.push('', 'Revisa las filas: ' + resultado.filasError.join(', '));
    }
    ui.alert(mensaje.join('\n'));
  } catch (error) {
    Logger.log('generarCodigosYEnlaces: ' + error.stack);
    ui.alert('No pudimos completar el proceso. Verifica que la hoja Invitados tenga los encabezados correctos e intenta nuevamente.');
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function actualizarEnlacesFaltantes() {
  const resultado = procesarCodigosYEnlaces_(false);
  SpreadsheetApp.getUi().alert('Enlaces actualizados: ' + resultado.enlacesActualizados + '.');
}

function procesarCodigosYEnlaces_(crearCodigos) {
  const hoja = obtenerHoja_(CONFIG.HOJA_INVITADOS, ENCABEZADOS_INVITADOS);
  if (hoja.getLastRow() < 2) {
    return {
      codigos: 0,
      enlacesActualizados: 0,
      invitacionesGeneradas: 0,
      filasConfiguradas: 0,
      filasConErrores: 0,
      filasError: []
    };
  }

  const rango = hoja.getDataRange();
  const valores = rango.getValues();
  const mapa = crearMapaEncabezados_(valores[0]);
  const columnaCodigo = mapa[normalizarEncabezado_('Código')];
  const columnaInvitado = mapa[normalizarEncabezado_('Invitado o grupo')];
  const columnaEnlace = mapa[normalizarEncabezado_('Enlace personalizado')];
  const columnaActivo = mapa[normalizarEncabezado_('Activo')];
  const columnaEstado = mapa[normalizarEncabezado_('Estado')];
  const columnaCupos = mapa[normalizarEncabezado_('Cupos adultos')];
  const codigosUsados = new Set();

  for (let fila = 1; fila < valores.length; fila += 1) {
    const existente = normalizarCodigo_(valores[fila][columnaCodigo]);
    if (existente) codigosUsados.add(existente);
  }

  let codigosCreados = 0;
  let enlacesActualizados = 0;
  let invitacionesGeneradas = 0;
  let filasConfiguradas = 0;
  const filasError = [];

  for (let fila = 1; fila < valores.length; fila += 1) {
    const numeroFila = fila + 1;
    const filaTieneDatos = valores[fila].some(valor => String(valor == null ? '' : valor).trim() !== '');
    if (!filaTieneDatos) continue;

    const invitado = String(valores[fila][columnaInvitado] || '').trim();
    const cuposAdultos = Number(valores[fila][columnaCupos]);
    const activoActual = String(valores[fila][columnaActivo] || '').trim();
    const activoValido = !activoActual || esValorActivoValido_(activoActual);
    if (!invitado || !Number.isInteger(cuposAdultos) || cuposAdultos < 1 || !activoValido) {
      filasError.push(numeroFila);
      continue;
    }

    let filaActualizada = false;

    let codigo = normalizarCodigo_(valores[fila][columnaCodigo]);
    if (!codigo && crearCodigos) {
      codigo = generarCodigoUnico_(codigosUsados);
      valores[fila][columnaCodigo] = codigo;
      hoja.getRange(fila + 1, columnaCodigo + 1).setValue(codigo);
      codigosUsados.add(codigo);
      codigosCreados += 1;
      filaActualizada = true;
    }

    if (!activoActual) {
      valores[fila][columnaActivo] = 'Sí';
      hoja.getRange(fila + 1, columnaActivo + 1).setValue('Sí');
      filaActualizada = true;
    }
    if (!String(valores[fila][columnaEstado] || '').trim()) {
      valores[fila][columnaEstado] = 'Pendiente';
      hoja.getRange(fila + 1, columnaEstado + 1).setValue('Pendiente');
      filaActualizada = true;
    }

    const enlaceActual = String(valores[fila][columnaEnlace] || '').trim();
    if (!enlaceActual && codigo) {
      const enlace = CONFIG.URL_BASE + '?i=' + encodeURIComponent(codigo);
      valores[fila][columnaEnlace] = enlace;
      hoja.getRange(fila + 1, columnaEnlace + 1).setValue(enlace);
      enlacesActualizados += 1;
      filaActualizada = true;
    }

    if (filaActualizada) invitacionesGeneradas += 1;
    else filasConfiguradas += 1;
  }
  return {
    codigos: codigosCreados,
    enlacesActualizados: enlacesActualizados,
    invitacionesGeneradas: invitacionesGeneradas,
    filasConfiguradas: filasConfiguradas,
    filasConErrores: filasError.length,
    filasError: filasError
  };
}

function revisarFilasIncompletas() {
  const ui = SpreadsheetApp.getUi();
  try {
    const hoja = obtenerHoja_(CONFIG.HOJA_INVITADOS, ENCABEZADOS_INVITADOS);
    if (hoja.getLastRow() < 2) {
      ui.alert('No hay invitados registrados para revisar.');
      return;
    }

    const valores = hoja.getDataRange().getValues();
    const mapa = crearMapaEncabezados_(valores[0]);
    const columnaInvitado = mapa[normalizarEncabezado_('Invitado o grupo')];
    const columnaCupos = mapa[normalizarEncabezado_('Cupos adultos')];
    const columnaActivo = mapa[normalizarEncabezado_('Activo')];
    const columnaCodigo = mapa[normalizarEncabezado_('Código')];
    const columnaEnlace = mapa[normalizarEncabezado_('Enlace personalizado')];
    const filasIncompletas = [];

    for (let fila = 1; fila < valores.length; fila += 1) {
      const invitado = String(valores[fila][columnaInvitado] || '').trim();
      if (!invitado) continue;
      const cuposAdultos = Number(valores[fila][columnaCupos]);
      const activo = String(valores[fila][columnaActivo] || '').trim();
      const codigo = normalizarCodigo_(valores[fila][columnaCodigo]);
      const enlace = String(valores[fila][columnaEnlace] || '').trim();
      const incompleta = !Number.isInteger(cuposAdultos) || cuposAdultos < 1 ||
        !esValorActivoValido_(activo) || !codigo || !enlace;
      if (incompleta) filasIncompletas.push(fila + 1);
    }

    if (!filasIncompletas.length) {
      ui.alert('Revisión terminada. No hay filas incompletas.');
      return;
    }
    ui.alert(
      'Revisión terminada.\n\nFilas incompletas: ' + filasIncompletas.length +
      '\nRevisa las filas: ' + filasIncompletas.join(', ')
    );
  } catch (error) {
    Logger.log('revisarFilasIncompletas: ' + error.stack);
    ui.alert('No pudimos revisar las filas. Verifica que la hoja Invitados tenga los encabezados correctos e intenta nuevamente.');
  }
}

function esValorActivoValido_(valor) {
  const normalizado = normalizarEncabezado_(valor);
  return normalizado === 'si' || normalizado === 'no';
}

function generarCodigoUnico_(codigosUsados) {
  for (let intento = 0; intento < 25; intento += 1) {
    const codigo = Utilities.getUuid().replace(/-/g, '').toUpperCase().slice(0, CONFIG.LONGITUD_CODIGO);
    if (!codigosUsados.has(codigo)) return codigo;
  }
  throw new Error('No se pudo generar un código único. Intenta nuevamente.');
}

function doGet(e) {
  const parametros = e && e.parameter ? e.parameter : {};
  const callback = String(parametros.callback || '').trim();
  let respuesta;

  try {
    const accion = String(parametros.action || '').toLowerCase();
    if (accion === 'lookup') {
      respuesta = consultarInvitado_(parametros.code);
    } else if (accion === 'submissionstatus') {
      respuesta = consultarEstadoEnvio_(parametros.submissionId);
    } else {
      respuesta = { ok: false, error: 'Solicitud no válida' };
    }
  } catch (error) {
    Logger.log('doGet: ' + error.stack);
    respuesta = { ok: false, error: 'No pudimos validar la invitación' };
  }

  if (callback) {
    if (!/^[a-zA-Z_$][0-9a-zA-Z_$.]*$/.test(callback)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Callback no válido' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(respuesta) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(JSON.stringify(respuesta))
    .setMimeType(ContentService.MimeType.JSON);
}

function consultarInvitado_(codigoRecibido) {
  const codigo = normalizarCodigo_(codigoRecibido);
  if (!esCodigoValido_(codigo)) return respuestaInvitacionNoValida_();

  const registro = buscarInvitadoPorCodigo_(codigo);
  if (!registro || !esActivo_(registro.valor('Activo'))) return respuestaInvitacionNoValida_();

  const cuposAdultos = numeroEntero_(registro.valor('Cupos adultos'));
  if (cuposAdultos < 1) return respuestaInvitacionNoValida_();

  const estado = normalizarEstado_(registro.valor('Estado'));
  const adultosConfirmados = estado === 'Confirmado'
    ? Math.min(Math.max(numeroEntero_(registro.valor('Adultos confirmados')), 1), cuposAdultos)
    : 0;
  const acompanantes = estado === 'Confirmado'
    ? separarAcompanantes_(registro.valor('Nombres de acompañantes')).slice(0, Math.max(adultosConfirmados - 1, 0))
    : [];

  return {
    ok: true,
    codigo: codigo,
    invitado: String(registro.valor('Invitado o grupo') || '').trim(),
    cuposAdultos: cuposAdultos,
    estado: estado,
    adultosConfirmados: adultosConfirmados,
    acompanantes: acompanantes
  };
}

function respuestaInvitacionNoValida_() {
  return { ok: false, error: 'Código inválido o inactivo' };
}

function consultarEstadoEnvio_(submissionIdRecibido) {
  const submissionId = normalizarSubmissionId_(submissionIdRecibido);
  if (!esSubmissionIdValido_(submissionId)) {
    return {
      ok: false,
      found: false,
      submissionId: submissionId,
      error: 'Identificador de envío no válido'
    };
  }

  const confirmacion = buscarConfirmacionPorSubmissionId_(submissionId);
  if (!confirmacion) {
    return { ok: true, found: false, submissionId: submissionId };
  }

  return {
    ok: true,
    found: true,
    submissionId: submissionId,
    codigo: confirmacion.codigo,
    invitado: confirmacion.invitado,
    asistencia: confirmacion.asistencia,
    adultosConfirmados: confirmacion.adultosConfirmados,
    acompanantes: confirmacion.acompanantes,
    estado: confirmacion.estado,
    tipoOperacion: confirmacion.tipoOperacion
  };
}

function buscarConfirmacionPorSubmissionId_(submissionId) {
  const hoja = obtenerHoja_(CONFIG.HOJA_CONFIRMACIONES, ENCABEZADOS_CONFIRMACIONES);
  if (hoja.getLastRow() < 2) return null;
  const valores = hoja.getDataRange().getValues();
  const mapa = crearMapaEncabezados_(valores[0]);
  const columnaId = mapa[normalizarEncabezado_('ID de envío')];

  for (let indice = valores.length - 1; indice >= 1; indice -= 1) {
    if (normalizarSubmissionId_(valores[indice][columnaId]) !== submissionId) continue;
    const valor = encabezado => valores[indice][mapa[normalizarEncabezado_(encabezado)]];
    const asistencia = String(valor('Asistencia') || '').trim();
    const adultosConfirmados = Math.max(numeroEntero_(valor('Adultos confirmados')), 0);
    return {
      codigo: normalizarCodigo_(valor('Código')),
      invitado: String(valor('Invitado o grupo') || '').trim(),
      asistencia: asistencia,
      adultosConfirmados: adultosConfirmados,
      acompanantes: asistencia === 'Sí asistiré'
        ? separarAcompanantes_(valor('Nombres de acompañantes')).slice(0, Math.max(adultosConfirmados - 1, 0))
        : [],
      estado: asistencia === 'Sí asistiré' ? 'Confirmado' : 'No asistirá',
      tipoOperacion: String(valor('Tipo de operación') || '').trim()
    };
  }
  return null;
}

function doPost(e) {
  const parametros = e && e.parameter ? e.parameter : {};
  const submissionId = normalizarSubmissionId_(parametros.submission_id);
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);
    if (!esSubmissionIdValido_(submissionId)) {
      throw errorPublico_('La solicitud de confirmación no es válida.');
    }
    const resultadoAnterior = buscarConfirmacionPorSubmissionId_(submissionId);
    if (resultadoAnterior) {
      console.log(JSON.stringify({
        etapa: 'respuesta_doPost',
        ok: true,
        submissionId: submissionId,
        operacion: 'reintento_idempotente'
      }));
      return crearRespuestaFormulario_({
        source: 'lesly-jairo-rsvp',
        ok: true,
        message: 'Confirmación registrada correctamente',
        submissionId: submissionId,
        codigo: resultadoAnterior.codigo,
        invitado: resultadoAnterior.invitado,
        asistencia: resultadoAnterior.asistencia,
        estado: resultadoAnterior.estado,
        adultosConfirmados: resultadoAnterior.adultosConfirmados,
        acompanantes: resultadoAnterior.acompanantes,
        tipoOperacion: resultadoAnterior.tipoOperacion
      });
    }
    const resultado = guardarConfirmacion_(parametros, submissionId);
    console.log(JSON.stringify({
      etapa: 'respuesta_doPost',
      ok: true,
      submissionId: submissionId
    }));
    return crearRespuestaFormulario_({
      source: 'lesly-jairo-rsvp',
      ok: true,
      message: 'Confirmación registrada correctamente',
      submissionId: submissionId,
      codigo: resultado.codigo,
      invitado: resultado.invitado,
      asistencia: resultado.asistencia,
      estado: resultado.estado,
      adultosConfirmados: resultado.adultosConfirmados,
      acompanantes: resultado.acompanantes,
      tipoOperacion: resultado.tipoOperacion
    });
  } catch (error) {
    Logger.log('doPost: ' + error.stack);
    const mensaje = error && error.publico
      ? error.message
      : 'No pudimos guardar tu confirmación. Intenta nuevamente.';
    return crearRespuestaFormulario_({
      source: 'lesly-jairo-rsvp',
      ok: false,
      message: mensaje,
      submissionId: submissionId
    });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function guardarConfirmacion_(parametros, submissionId) {
  const codigo = normalizarCodigo_(parametros.codigo_invitacion);
  if (!esCodigoValido_(codigo)) throw errorPublico_('La invitación no es válida.');

  const registro = buscarInvitadoPorCodigo_(codigo);
  if (!registro || !esActivo_(registro.valor('Activo'))) throw errorPublico_('La invitación no es válida o está inactiva.');

  const invitado = String(registro.valor('Invitado o grupo') || '').trim();
  const cuposPermitidos = numeroEntero_(registro.valor('Cupos adultos'));
  if (!invitado || cuposPermitidos < 1) throw errorPublico_('La invitación no tiene cupos disponibles.');
  if (normalizarEncabezado_(parametros.nombre) !== normalizarEncabezado_(invitado)) {
    throw errorPublico_('El nombre no corresponde a esta invitación.');
  }

  const asistencia = String(parametros.asistencia || '').trim();
  const cantidadSolicitada = Number(parametros.cantidad_adultos);
  const telefono = String(parametros.telefono || '').replace(/\D/g, '');
  const comentario = limitarTexto_(parametros.comentario, CONFIG.MAX_COMENTARIO);

  if (asistencia !== 'Sí asistiré' && asistencia !== 'No podré asistir') {
    throw errorPublico_('Selecciona una opción de asistencia válida.');
  }
  if (!/^9\d{8}$/.test(telefono)) throw errorPublico_('Ingresa un celular válido de 9 dígitos.');

  if (asistencia === 'Sí asistiré') {
    if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada < 1 || cantidadSolicitada > cuposPermitidos) {
      throw errorPublico_('La cantidad supera los cupos asignados.');
    }
  } else if (cantidadSolicitada !== 0) {
    throw errorPublico_('La cantidad debe ser 0 cuando no asistirás.');
  }

  const acompanantes = validarYObtenerAcompanantes_(parametros, asistencia, cantidadSolicitada);
  const nombresAcompanantes = acompanantes.join(' | ');

  const estadoAnterior = normalizarEstado_(registro.valor('Estado'));
  const tipoOperacion = estadoAnterior === 'Pendiente' ? 'Primera confirmación' : 'Actualización de confirmación';
  const estadoNuevo = asistencia === 'Sí asistiré' ? 'Confirmado' : 'No asistirá';
  const adultosConfirmados = asistencia === 'Sí asistiré' ? cantidadSolicitada : 0;
  const ahora = new Date();

  registro.actualizar({
    'Estado': estadoNuevo,
    'Adultos confirmados': adultosConfirmados,
    'Nombres de acompañantes': nombresAcompanantes,
    'Teléfono confirmado': telefono,
    'Comentario': comentario,
    'Fecha de confirmación': ahora,
    'Última actualización': ahora,
    'Último ID de envío': submissionId
  });

  const hojaHistorial = obtenerHoja_(CONFIG.HOJA_CONFIRMACIONES, ENCABEZADOS_CONFIRMACIONES);
  hojaHistorial.appendRow([
    ahora,
    codigo,
    invitado,
    cuposPermitidos,
    asistencia,
    adultosConfirmados,
    nombresAcompanantes,
    telefono,
    comentario,
    limitarTexto_(parametros.origen || 'Invitación web', 120),
    limitarTexto_(parametros.user_agent, CONFIG.MAX_USER_AGENT),
    tipoOperacion,
    submissionId
  ]);

  return {
    codigo: codigo,
    invitado: invitado,
    asistencia: asistencia,
    estado: estadoNuevo,
    adultosConfirmados: adultosConfirmados,
    acompanantes: acompanantes,
    tipoOperacion: tipoOperacion
  };
}

function validarYObtenerAcompanantes_(parametros, asistencia, cantidadAdultos) {
  const cantidadEsperada = asistencia === 'Sí asistiré'
    ? Math.max(cantidadAdultos - 1, 0)
    : 0;
  const clavesRecibidas = Object.keys(parametros).filter(clave => /^acompanante_\d+$/.test(clave));
  const tieneClaveInvalida = clavesRecibidas.some(clave => {
    const indice = Number(clave.replace('acompanante_', ''));
    return !Number.isInteger(indice) || indice < 1 || indice > cantidadEsperada || clave !== 'acompanante_' + indice;
  });

  if (tieneClaveInvalida) {
    throw errorPublico_('La cantidad de acompañantes no coincide con los adultos confirmados.');
  }

  const acompanantes = [];
  for (let indice = 1; indice <= cantidadEsperada; indice += 1) {
    const nombre = normalizarNombreAcompanante_(parametros['acompanante_' + indice]);
    if (!nombre) throw errorPublico_('Indica el nombre del acompañante ' + indice + '.');
    if (nombre.length > CONFIG.MAX_NOMBRE_ACOMPANANTE) {
      throw errorPublico_('El nombre del acompañante ' + indice + ' no puede superar los 100 caracteres.');
    }
    acompanantes.push(nombre);
  }

  if (acompanantes.length !== cantidadEsperada) {
    throw errorPublico_('Debes registrar los nombres de tus ' + cantidadEsperada + ' acompañantes.');
  }
  return acompanantes;
}

function normalizarNombreAcompanante_(valor) {
  return String(valor || '').trim().replace(/\s+/g, ' ');
}

function separarAcompanantes_(valor) {
  return String(valor || '')
    .split('|')
    .map(normalizarNombreAcompanante_)
    .filter(nombre => nombre && nombre.length <= CONFIG.MAX_NOMBRE_ACOMPANANTE);
}

function crearRespuestaFormulario_(payload) {
  const payloadSeguro = JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  const html = [
    '<!doctype html>',
    '<html>',
    '<head><meta charset="UTF-8"></head>',
    '<body>',
    '<script>',
    '(function(){',
    'var payload=' + payloadSeguro + ';',
    'window.parent.postMessage(payload, "*");',
    'if(window.top && window.top !== window.parent){window.top.postMessage(payload, "*");}',
    '}());',
    '<\/script>',
    '</body>',
    '</html>'
  ].join('');

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function obtenerHoja_(nombre, encabezadosEsperados) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  if (!hoja) throw new Error('No existe la hoja ' + nombre + '. Ejecuta configurarHojas().');
  const encabezados = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), encabezadosEsperados.length)).getDisplayValues()[0];
  const mapa = crearMapaEncabezados_(encabezados);
  encabezadosEsperados.forEach(encabezado => {
    if (mapa[normalizarEncabezado_(encabezado)] === undefined) throw new Error('Falta el encabezado: ' + encabezado);
  });
  return hoja;
}

function buscarInvitadoPorCodigo_(codigo) {
  const hoja = obtenerHoja_(CONFIG.HOJA_INVITADOS, ENCABEZADOS_INVITADOS);
  if (hoja.getLastRow() < 2) return null;
  const valores = hoja.getDataRange().getValues();
  const mapa = crearMapaEncabezados_(valores[0]);
  const columnaCodigo = mapa[normalizarEncabezado_('Código')];

  for (let indice = 1; indice < valores.length; indice += 1) {
    if (normalizarCodigo_(valores[indice][columnaCodigo]) !== codigo) continue;
    return {
      hoja: hoja,
      fila: indice + 1,
      valores: valores[indice],
      mapa: mapa,
      valor: function(encabezado) {
        return this.valores[this.mapa[normalizarEncabezado_(encabezado)]];
      },
      actualizar: function(cambios) {
        Object.keys(cambios).forEach(encabezado => {
          const columna = this.mapa[normalizarEncabezado_(encabezado)];
          this.valores[columna] = cambios[encabezado];
          this.hoja.getRange(this.fila, columna + 1).setValue(cambios[encabezado]);
        });
      }
    };
  }
  return null;
}

function crearMapaEncabezados_(encabezados) {
  return encabezados.reduce((mapa, encabezado, indice) => {
    const clave = normalizarEncabezado_(encabezado);
    if (clave) mapa[clave] = indice;
    return mapa;
  }, {});
}

function normalizarEncabezado_(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizarCodigo_(valor) {
  return String(valor || '').replace(/\s+/g, '').toUpperCase().slice(0, 32);
}

function esCodigoValido_(codigo) {
  return /^[A-Z0-9]{10,16}$/.test(codigo);
}

function normalizarSubmissionId_(valor) {
  return String(valor || '').trim();
}

function esSubmissionIdValido_(submissionId) {
  return /^rsvp_[0-9]{10,16}_[a-z0-9]{5,20}$/i.test(submissionId);
}

function esActivo_(valor) {
  const normalizado = normalizarEncabezado_(valor);
  return ['si', 'true', '1', 'activo'].indexOf(normalizado) !== -1;
}

function normalizarEstado_(valor) {
  const estado = normalizarEncabezado_(valor);
  if (estado === 'confirmado') return 'Confirmado';
  if (estado === 'no asistira') return 'No asistirá';
  return 'Pendiente';
}

function numeroEntero_(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) ? numero : 0;
}

function limitarTexto_(valor, maximo) {
  return String(valor || '').trim().slice(0, maximo);
}

function errorPublico_(mensaje) {
  const error = new Error(mensaje);
  error.publico = true;
  return error;
}

function crearCasosDePrueba() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  configurarHoja_(libro, CONFIG.HOJA_INVITADOS, ENCABEZADOS_INVITADOS);
  configurarHoja_(libro, CONFIG.HOJA_CONFIRMACIONES, ENCABEZADOS_CONFIRMACIONES);
  const hoja = libro.getSheetByName(CONFIG.HOJA_INVITADOS);
  const encabezadosActuales = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getDisplayValues()[0];
  const mapa = crearMapaEncabezados_(encabezadosActuales);
  const columnaCodigo = mapa[normalizarEncabezado_('Código')];
  const existentes = hoja.getLastRow() > 1
    ? new Set(hoja.getRange(2, columnaCodigo + 1, hoja.getLastRow() - 1, 1).getDisplayValues().flat().map(normalizarCodigo_))
    : new Set();
  const ahora = new Date();
  const casos = [
    { 'Código':'TESTUNO00001', 'Invitado o grupo':'Invitación individual de prueba', 'Cupos adultos':1, 'Teléfono de referencia':'900000001', 'Activo':'Sí', 'Estado':'Pendiente' },
    { 'Código':'TESTPAREJA02', 'Invitado o grupo':'Pareja de prueba', 'Cupos adultos':2, 'Teléfono de referencia':'900000002', 'Activo':'Sí', 'Estado':'Pendiente' },
    { 'Código':'TESTGRUPO004', 'Invitado o grupo':'Grupo familiar de prueba', 'Cupos adultos':4, 'Teléfono de referencia':'900000003', 'Activo':'Sí', 'Estado':'Pendiente' },
    { 'Código':'TESTINACTIVO', 'Invitado o grupo':'Invitación inactiva de prueba', 'Cupos adultos':2, 'Teléfono de referencia':'900000004', 'Activo':'No', 'Estado':'Pendiente' },
    { 'Código':'TESTCONFIRM2', 'Invitado o grupo':'Invitación confirmada de prueba', 'Cupos adultos':2, 'Teléfono de referencia':'900000005', 'Activo':'Sí', 'Estado':'Confirmado', 'Adultos confirmados':2, 'Nombres de acompañantes':'Acompañante de prueba', 'Fecha de confirmación':ahora, 'Última actualización':ahora },
    { 'Código':'TESTNOASISTE', 'Invitado o grupo':'Invitación que no asistirá', 'Cupos adultos':2, 'Teléfono de referencia':'900000006', 'Activo':'Sí', 'Estado':'No asistirá', 'Adultos confirmados':0, 'Nombres de acompañantes':'', 'Fecha de confirmación':ahora, 'Última actualización':ahora }
  ];

  casos.forEach(caso => {
    if (existentes.has(caso['Código'])) return;
    const valoresCaso = encabezadosActuales.map(encabezado => {
      const clave = Object.keys(caso).find(nombre => normalizarEncabezado_(nombre) === normalizarEncabezado_(encabezado));
      return clave ? caso[clave] : '';
    });
    hoja.appendRow(valoresCaso);
  });
  procesarCodigosYEnlaces_(false);
  Logger.log('Para código inexistente usa ?i=NOEXISTE0000; ese código no se agrega a la hoja.');
  SpreadsheetApp.getUi().alert('Casos de prueba creados. Usa NOEXISTE0000 para probar un código inexistente.');
}
