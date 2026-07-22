# Enlaces personalizados — Lesly & Jairo

El sistema usa un solo `index.html`. Cada invitación se identifica con un enlace como:

`https://nuestraboda.com.pe/lesly&jairo?i=CODIGO`

## 1. Preparar Google Sheets

1. Crea una hoja de cálculo de Google.
2. Abre **Extensiones > Apps Script**.
3. Reemplaza el contenido del editor por el archivo `google-apps-script.gs`.
4. Guarda el proyecto.
5. Ejecuta una vez la función `configurarHojas` y acepta los permisos solicitados.

El script crea o valida estas dos pestañas:

### Invitados

Los encabezados exactos son:

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

Los encabezados exactos son:

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

Si las hojas ya existían, vuelve a ejecutar `configurarHojas`. El script añadirá automáticamente cualquier encabezado faltante, incluidas `Último ID de envío` e `ID de envío`, sin reemplazar encabezados ni registros existentes. La posición física puede quedar al final en una hoja antigua; la lectura se realiza de forma segura por nombre de encabezado.

## 2. Registrar invitados

En `Invitados`, Lesly añade una fila por persona, pareja o grupo y completa únicamente:

- `Invitado o grupo`: por ejemplo, `Ana y Luis`.
- `Cupos adultos`: máximo total de adultos, incluyendo al invitado principal.
- `Teléfono de referencia`: dato administrativo; no se envía al navegador.

Deja vacíos `Código`, `Activo`, `Estado` y `Enlace personalizado`. El sistema completará automáticamente `Activo` con `Sí` y `Estado` con `Pendiente`, además de crear el código y el enlace. No escribas `Sí` en la columna `Estado`.

No edites manualmente los códigos ni los enlaces. Una segunda respuesta no crea otra fila: actualiza la fila existente y añade el cambio al historial `Confirmaciones`.

## 3. Generar códigos y enlaces

1. Recarga la hoja de cálculo para que aparezca el menú **Invitaciones**.
2. Selecciona **Invitaciones > Generar códigos y enlaces**.
3. Revisa el resumen mostrado al terminar. Si existen errores, corrige las filas indicadas y vuelve a ejecutar la opción.
4. Comprueba que `Activo` diga `Sí` y `Estado` diga `Pendiente`.
5. Copia el valor de `Enlace personalizado` y envíalo por WhatsApp al invitado correspondiente.

La función ignora filas totalmente vacías, no reemplaza códigos ni enlaces existentes y no devuelve a `Pendiente` a invitados que estén `Confirmado` o `No asistirá`. Tampoco modifica adultos confirmados, acompañantes, comentarios ni identificadores de envío.

Si una fila tiene nombre pero los cupos están vacíos, son `0`, contienen decimales o no son un número, no se genera la invitación y la fila aparece en el resumen de errores. Puedes usar **Invitaciones > Revisar filas incompletas** para obtener los números de fila sin modificar ningún dato.

### Crear un botón en Google Sheets

1. En la hoja `Invitados`, selecciona **Insertar > Dibujo** o inserta una imagen sobre las celdas.
2. Crea un botón con el texto **Generar códigos y enlaces**.
3. Guarda el dibujo y selecciónalo desde la hoja.
4. Abre el menú de tres puntos del dibujo y selecciona **Asignar secuencia de comandos**.
5. Escribe exactamente `generarCodigosYEnlaces`, sin paréntesis.

El botón y la opción del menú ejecutan la misma función. Si se producen dos clics rápidos, el sistema evita que ambas ejecuciones generen códigos simultáneamente.

Después de guardar el nuevo código de Apps Script, recarga la hoja de cálculo para actualizar el menú `Invitaciones`. Si las pestañas y todos los encabezados de este documento ya existen, no necesitas ejecutar nuevamente `configurarHojas()`. En una hoja nueva o si falta algún encabezado, sí debes ejecutarla una vez.

Este cambio afecta únicamente las herramientas administrativas que se ejecutan desde Google Sheets. No es necesario volver a desplegar la aplicación web si ya estaba publicada con el sistema de confirmaciones y `submissionStatus` vigente.

## 4. Desplegar Apps Script

1. En Apps Script, selecciona **Implementar > Nueva implementación**.
2. Elige **Aplicación web**.
3. Configura **Ejecutar como: Yo**.
4. En acceso, elige la opción que permita usar la aplicación sin iniciar sesión. El texto exacto puede variar según el tipo de cuenta de Google.
5. Implementa y copia la URL terminada en `/exec`.
6. Como esta ampliación modifica el Apps Script, debes editar la implementación existente, seleccionar **Nueva versión** y volver a implementar. Conserva la misma URL `/exec` para no tener que modificar nuevamente el HTML.

## 5. Conectar el HTML

En `index.html`, busca esta línea:

```js
const GOOGLE_SCRIPT_URL = 'PEGAR_AQUI_URL_EXEC_DE_APPS_SCRIPT';
```

Reemplaza únicamente el texto entre comillas por la URL `/exec` copiada en el paso anterior. Esa única constante se usa para consultar el invitado mediante JSONP, enviar el formulario y verificar el resultado guardado.

### Cómo se comprueba una confirmación

Cada envío recibe un `submissionId` único. El formulario se envía una sola vez al iframe oculto y, después de 800 ms, la invitación consulta por JSONP si ese identificador ya aparece en `Confirmaciones`. Las consultas son secuenciales, aproximadamente cada 1.2 segundos, durante un máximo de 25 segundos.

El `postMessage` de Apps Script se conserva como respuesta rápida opcional, pero el éxito ya no depende de él. La hoja `Confirmaciones` es la fuente definitiva: un mismo `submissionId` nunca genera dos filas aunque se repita la solicitud.

Si la verificación no concluye, la invitación muestra **Verificar nuevamente**. Ese botón consulta el mismo `submissionId`; no vuelve a enviar el formulario ni duplica la confirmación.

## 6. Probar antes de publicar

En la hoja, ejecuta `crearCasosDePrueba`. Se añadirán casos para:

- Invitación individual de 1 cupo: `TESTUNO00001`.
- Pareja de 2 cupos: `TESTPAREJA02`.
- Grupo de 4 cupos: `TESTGRUPO004`.
- Invitación inactiva: `TESTINACTIVO`.
- Invitación previamente confirmada: `TESTCONFIRM2`.
- Invitación que no asistirá: `TESTNOASISTE`.
- Código inexistente: usa `NOEXISTE0000` (no se añade a la hoja).

Ejemplo local:

`http://localhost:PUERTO/?i=TESTPAREJA02`

Comprueba también una URL sin `?i`, códigos en minúsculas y códigos con espacios codificados. En `PREVIEW_MODE`, la consulta sigue funcionando, pero el envío y WhatsApp permanecen desactivados.

Para validar el flujo final, confirma que:

- `Invitados > Último ID de envío` recibe el identificador más reciente.
- `Confirmaciones > ID de envío` contiene el mismo valor.
- la pantalla cambia a éxito aunque el navegador descarte el `postMessage` del iframe de Google;
- WhatsApp se abre una sola vez;
- **Verificar nuevamente** no añade otra fila a `Confirmaciones`.

`TESTCONFIRM2` incluye un acompañante previamente guardado para comprobar la precarga. Los nombres se guardan consolidados con ` | ` en ambas hojas, pero el servidor siempre reconstruye esa lista desde los campos individuales y no confía en el valor oculto enviado por el navegador.

## 7. Activar la invitación final

Después de validar todo y antes de publicar, busca en `index.html`:

```js
const PREVIEW_MODE = true;
```

Cámbialo a:

```js
const PREVIEW_MODE = false;
```

No cambies este valor mientras la invitación siga en revisión.
