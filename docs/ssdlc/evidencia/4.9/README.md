# Evidencia 4.9 y demo D4: defecto funcional y defecto de seguridad

**Responsable:** Ariana. **Datos:** solo cuentas y datos ficticios de `backend/test/authz/support/ambiente.ts`.

Los defectos se introdujeron a propósito en la rama local `demo/ari-4.9` (nunca se fusionan). Para cada uno hay tres evidencias: ejecución fallida, corrección y ejecución aprobada. Commits en [`commits-demo.txt`](commits-demo.txt).

## Defecto de seguridad (permiso que deja de comprobarse) · F-02 · T-02, T-04

- **Qué se rompió:** se quitó `@Roles('propietario', 'administrador', 'veterinario')` de `POST /tratamientos/:id/anulacion`, de modo que un peón podía anular tratamientos. Diff: [`seguridad-diff.txt`](seguridad-diff.txt). Commit `8c19c11`.
- **Ejecución fallida:** [`seguridad-1-ejecucion-fallida-authz.txt`](seguridad-1-ejecucion-fallida-authz.txt): 181 pasan y **1 falla**, `[F-02][T-02][T-04] peon es rechazado con 403 en POST /tratamientos/<id>/anulacion…`. También falla la prueba heredada `role-matrix` ([`seguridad-1b-…`](seguridad-1b-ejecucion-fallida-role-matrix.txt)).
- **Corrección:** `git revert` del commit del defecto, commit `fb8a74a`. No se tocó ninguna prueba.
- **Ejecución aprobada:** [`seguridad-2-ejecucion-aprobada-authz.txt`](seguridad-2-ejecucion-aprobada-authz.txt): 182 de 182, y [`seguridad-2b-…`](seguridad-2b-ejecucion-aprobada-role-matrix.txt): 6 de 6.

## Defecto funcional (regla de negocio que deja de cumplirse) · lactancia

- **Qué se rompió:** en `derivarLactancia` se cambió `> ref` por `>= ref`, así un evento del mismo día de la fecha de referencia dejaba de contar (el parto del día no iniciaba la lactancia). Diff: [`funcional-diff.txt`](funcional-diff.txt). Commit `09e0546`.
- **Ejecución fallida:** [`funcional-1-ejecucion-fallida.txt`](funcional-1-ejecucion-fallida.txt): **6 de 17 fallan**, incluidas las de valor límite `el día anterior al parto aún no está en lactancia; el mismo día sí` y `con la misma fecha decide el registrado después`.
- **Corrección:** `git revert`, commit `475d9bb`.
- **Ejecución aprobada:** [`funcional-2-ejecucion-aprobada.txt`](funcional-2-ejecucion-aprobada.txt): 17 de 17.

## Las pruebas no se debilitaron

La IA no editó ninguna aserción para que pasara. [`archivos-de-prueba-tocados.txt`](archivos-de-prueba-tocados.txt) lista los archivos de prueba modificados entre la base de la rama y su final: **ninguno**. El diff neto de la rama contra su base es vacío para el código: [`diff-final-contra-base.txt`](diff-final-contra-base.txt).

## Un intento descartado (se deja por honestidad)

El primer defecto funcional probado fue hacer que un aborto abriera la lactancia. **No fue detectado**, porque la función `cuenta()` filtra los abortos antes de llegar a ese punto: el cambio era equivalente y no alteraba el comportamiento. Se descartó y se usó el defecto de arriba, que sí cambia el resultado.

## Limitaciones

- La rama `demo/ari-4.9` existe solo en el equipo local; **no se subió a GitHub**. Las ejecuciones fallida y aprobada son locales. Falta la evidencia en CI (PR de demostración con el check `Authz tests` en rojo y luego en verde); se prepara cuando el job `authz-tests` esté en `development`.
- Está pendiente la respuesta del docente sobre dejar visibles ramas con defectos controlados en el repo público.
