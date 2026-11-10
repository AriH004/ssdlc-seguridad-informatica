# Registro único de hallazgos — ítem 7.5

Responsable de implementación: Danny (`DannyOr94`). Revisión humana: Ari (`AriiH08`), pendiente; no se atribuye una aprobación que no haya ocurrido.

Base acordada: importación de Ari en PR #7 y CI raíz de Danny en PR #8. El PR #5 incorpora ambas ramas sin reescribir su historial. El PR #1 se conserva solo como evidencia histórica de la propuesta reemplazada. Integrar primero las dependencias y después cambiar la base de #5 a `development` antes de fusionar.

## Fuente única

[GitHub Issues con etiqueta hallazgo](https://github.com/AriiH08/ssdlc-seguridad-informatica/issues?q=is%3Aissue%20label%3Ahallazgo) es el registro único para calidad, seguridad y operación de todas las etapas. Los datos del hallazgo y su estado se mantienen en el Issue, no se copian aquí.

El número del Issue es su identificador estable: `H-<número>`. Una amenaza o excepción se relaciona mediante un enlace a su registro existente. No se inventan IDs de amenazas o aprobaciones.

## Campos y clasificación

La plantilla `.github/ISSUE_TEMPLATE/hallazgo.yml` solicita origen, versión/alcance, evidencia reproducible, severidad justificada, responsable, otro revisor, estado, tratamiento y relaciones. Si no existe imagen, el digest se indica como no aplicable; si una comprobación no se ejecutó, se declara incompleta.

Usar una etiqueta de cada familia:

- `tipo:confirmado`, `tipo:investigacion` o `tipo:falso-positivo`.
- `severidad:baja`, `severidad:media`, `severidad:alta` o `severidad:critica`.
- `estado:abierto`, `estado:tratamiento`, `estado:bloqueado`, `estado:revision` o `estado:verificado`.

La severidad evalúa el impacto, no el número de herramientas que reportan el mismo problema. Un error de infraestructura no prueba un defecto de la aplicación ni un ataque. Un falso positivo conserva la evidencia que justifica descartarlo.

## Flujo de trabajo

1. Buscar primero por origen, versión y síntoma para evitar duplicados.
2. Crear el Issue, completar todos los campos y asignar el responsable.
3. Investigar antes de clasificar como confirmado. Registrar las dudas y su responsable.
4. Enlazar el PR correctivo y las comprobaciones del mismo commit/imagen.
5. Otro integrante valida el resultado. Cerrar como completado únicamente cuando hay corrección comprobada; cerrar un falso positivo con su justificación. Una aceptación temporal de riesgo requiere aprobación humana y vencimiento/revisión y permanece identificada como excepción, no corrección.
6. Si un hallazgo reaparece, reabrirlo o enlazar el nuevo registro y explicar el nuevo alcance.

## Excepciones y privacidad

Registrar excepciones en el mismo sistema con etiqueta `excepcion`, alcance, evidencia, justificación, responsable, dos aprobaciones humanas y fecha de vencimiento o revisión. Si cambia una exigencia académica obligatoria, la aprobación corresponde también al docente. No existe excepción que convierta una comprobación no ejecutada en aprobada.

Este repositorio es público: usar datos ficticios y logs sanitizados. Nunca adjuntar tokens, `.env`, contraseñas, datos de animales/clientes reales ni credenciales. Una credencial real expuesta se revoca o rota; no basta con borrar el texto.

## Reproducción de la demostración

Abrir el filtro de Issues, comprobar responsables y etiquetas, y entrar en cada registro para seguir origen → evidencia → tratamiento. El bloqueo de CI, los instaladores de hooks heredados y la publicación pendiente son registros separados porque tienen causas y soluciones distintas.

Registros iniciales: [H-2](https://github.com/AriiH08/ssdlc-seguridad-informatica/issues/2), [H-3](https://github.com/AriiH08/ssdlc-seguridad-informatica/issues/3) y [H-4](https://github.com/AriiH08/ssdlc-seguridad-informatica/issues/4). Consultar sus fichas para conocer el estado actualizado.

La plantilla se ofrece automáticamente en la interfaz de creación cuando esté integrada en la rama predeterminada. Mientras el PR esté pendiente, los Issues ya creados y el filtro funcionan, y se puede reutilizar el formulario como referencia sin afirmar que ya está activo en `main`.
