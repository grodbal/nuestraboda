# Claudia & Kenny — enlaces personalizados y confirmación automática

Esta versión conserva la lógica de confirmaciones del sistema de Lesly & Jairo, pero el diseño es independiente y está construido para Claudia & Kenny.

## 1. Archivos

- `index.html`: invitación web.
- `google-apps-script.gs`: backend para Google Sheets / Apps Script.
- Carpeta esperada `assets/`:
  - `cancion.mp3`
  - `foto-portada.jpg`
  - `foto-01.jpg` a `foto-06.jpg`
  - `foto-final.jpg`

Si las fotos o la canción todavía no existen, el HTML muestra fondos neutros para que la primera versión siga siendo visible.

## 2. Google Sheets

Crea una hoja de cálculo y abre **Extensiones > Apps Script**. Pega el contenido de `google-apps-script.gs`, guarda y ejecuta una vez `configurarHojas()`.

Se crean o validan las pestañas:

### Invitados

1. Código
2. Invitado o grupo
3. Cupos adultos
4. Teléfono de referencia
5. Activo
6. Estado
7. Adultos confirmados
8. Nombres de acompañantes
9. Teléfono confirmado
10. Comentario
11. Fecha de confirmación
12. Última actualización
13. Enlace personalizado
14. Último ID de envío

### Confirmaciones

1. Fecha y hora
2. Código
3. Invitado o grupo
4. Cupos asignados
5. Asistencia
6. Adultos confirmados
7. Nombres de acompañantes
8. Teléfono
9. Comentario
10. Origen
11. Dispositivo o navegador
12. Tipo de operación
13. ID de envío

## 3. Registrar invitados

En `Invitados`, Claudia completa únicamente:

- `Invitado o grupo`
- `Cupos adultos`
- `Teléfono de referencia` (opcional para administración)

Luego usa el menú **Invitaciones > Generar códigos y enlaces**. El Apps Script genera códigos únicos y enlaces como:

`https://nuestraboda.com.pe/claudia&kenny?i=CODIGO`

No edites manualmente los códigos generados.

## 4. Desplegar Apps Script

En Apps Script:

1. **Implementar > Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Ejecutar como: **Yo**.
4. Permitir acceso sin iniciar sesión.
5. Implementar y copiar la URL terminada en `/exec`.

En `index.html`, reemplaza:

```js
const GOOGLE_SCRIPT_URL = 'PEGAR_AQUI_URL_EXEC_DE_APPS_SCRIPT';
```

por la URL `/exec`.

También reemplaza:

```js
const WHATSAPP_NOVIOS = 'PEGAR_AQUI_NUMERO_WHATSAPP';
```

por el número de WhatsApp que recibirá el aviso, en formato internacional sin `+` ni espacios. Ejemplo Perú: `51987654321`.

## 5. Modo vista previa

La primera versión viene con:

```js
const PREVIEW_MODE = true;
```

Así puedes abrir `index.html` sin tener todavía Apps Script configurado. La invitación simula un invitado de prueba con 2 cupos y permite visualizar el formulario completo, pero no escribe nada en Sheets.

Para la versión final cambia a:

```js
const PREVIEW_MODE = false;
```

No publiques la versión final con `PREVIEW_MODE = true`.

## 6. Cómo funciona la confirmación

1. El enlace contiene `?i=CODIGO`.
2. El HTML consulta el Apps Script mediante JSONP (`action=lookup`).
3. El Apps Script devuelve el nombre del invitado, sus cupos y su estado actual.
4. El formulario se precarga con el nombre y limita los adultos al máximo asignado.
5. Si confirma más de un adulto, se generan automáticamente los campos de acompañantes.
6. Cada envío recibe un `submission_id` único.
7. El formulario se envía una sola vez al iframe oculto.
8. El navegador consulta `action=submissionStatus` aproximadamente cada 1.2 segundos, durante un máximo de 25 segundos.
9. La hoja `Confirmaciones` es la fuente definitiva para saber si el envío quedó guardado.
10. Si la verificación no termina a tiempo, aparece **Verificar nuevamente**. Ese botón consulta el mismo ID y no vuelve a enviar el formulario, por lo que evita duplicados.
11. Si el WhatsApp está configurado, al confirmar se prepara un mensaje para los novios.

Una segunda respuesta del mismo invitado actualiza el estado de su fila en `Invitados` y agrega el cambio al historial de `Confirmaciones`.

## 7. Casos de prueba

Desde el menú **Invitaciones > Crear casos de prueba** se crean códigos como:

- `TESTUNO00001` — 1 cupo.
- `TESTPAREJA02` — 2 cupos.
- `TESTGRUPO004` — 4 cupos.
- `TESTINACTIVO` — invitación inactiva.
- `TESTCONFIRM2` — invitación ya confirmada.
- `TESTNOASISTE` — invitación que indicó que no asistirá.

También puedes probar un código inexistente con `NOEXISTE0000`.

Ejemplo local:

`http://localhost:8000/?i=TESTPAREJA02`

## 8. Datos pendientes de Claudia & Kenny

Antes de publicar faltará completar:

- Hora real del evento. En `index.html` actualiza el texto de ceremonia, recepción, itinerario y la constante `weddingDate`.
- Fotografías de la pareja.
- Canción de portada.
- Números de cuenta BCP y Scotiabank / CCI.
- Número de WhatsApp de los novios o responsable.
- Texto definitivo de la sección “Dulces sueños” si el evento tendrá o no restricción para niños.
- Enlace para compartir fotografías, si desean activar esa función.

## 9. No modificar

Para no romper la automatización, evita cambiar los nombres de estos campos del formulario:

- `codigo_invitacion`
- `submission_id`
- `nombre`
- `telefono`
- `asistencia`
- `cantidad_adultos`
- `acompanante_1`, `acompanante_2`, etc.
- `comentario`

Tampoco renombres los encabezados de las hojas `Invitados` y `Confirmaciones`.
