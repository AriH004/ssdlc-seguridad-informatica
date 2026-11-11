# Defensa: Ariana

> Borrador de la IA; reescribir con tus palabras antes de la defensa.

## Ítem 2.2: Calidad y pruebas locales

**Qué se hizo**
- `scripts/verify.sh`: un solo comando que corre lint, typecheck, pruebas, build y Gitleaks. Reutiliza los scripts de `package.json` y `tooling/security-tools.mjs`, los mismos que usa el CI.
- Nuevo comando `gitleaks-tree` en `tooling/security-tools.mjs`, que escanea historial y staging.
- 6 pruebas de valor límite en `lactancia-calc.spec.ts`.
- Sección "Cómo ejecutar las comprobaciones" en el README.

**Por qué así**
- Una herramienta ausente da `INCOMPLETO` y salida distinta de cero: un análisis que no corrió no es aprobado.
- Se fuerza el pnpm 10.32.1 de Corepack porque el pnpm global (v12) rompía los scripts internos con `ERR_PNPM_BAD_PM_VERSION`.
- Gitleaks no usa `dir`, porque ese modo ignora `.gitignore` y marcaba `.next/` (salida de build).

**Cómo se demuestra**: correr `bash scripts/verify.sh` y mostrar el resumen; quitar Gitleaks/dependencias y mostrar `INCOMPLETO`; romper una expectativa y ver `FALLÓ`.

**Qué comprueba**: que el código local pasa calidad estática, pruebas unitarias, compila y no tiene secretos versionados.
**Qué NO comprueba**: integración con BD/RLS, e2e, replay de migraciones, ni nada remoto. Hoy el resultado es NO APROBADO por 2 hallazgos históricos de Gitleaks (ver `evidencia/2.2/README.md`).

## Ítem 4.5: pruebas de autorización directo a la API

**Qué se hizo**
- `backend/test/authz/`: 182 pruebas con Vitest y Supertest contra la API real (controladores, guards, validación y filtro de errores). El `SupabaseJwtService` real verifica tokens ES256 firmados en la prueba contra un JWKS local.
- Tres archivos: acceso por rol (25 rutas × 4 roles), sin sesión y credenciales inválidas (descubre todas las rutas solo), y finca/asignación masiva.
- Job `authz-tests` en el CI, dentro del check obligatorio.

**Por qué así**
- La tabla de roles de la prueba sale de `docs/kb/arquitectura-y-acceso.md`, no de los decoradores del código; si no, la prueba solo repetiría el código.
- Los servicios son falsos y anotan cada llamada: si un rechazo deja una llamada, hubo exposición o modificación de datos.
- No usa base de datos ni secretos para poder correr en un repo público.

**Cómo se demuestra:** `cd backend && pnpm test:authz`; luego la demo del 4.9 (quitar un `@Roles` y ver fallar la prueba).

**Qué comprueba:** que la autenticación y los roles se aplican en la API, que los rechazos no filtran detalles ni tocan datos, y que `tenantId`/`rol` no se aceptan desde el cuerpo.
**Qué NO comprueba:** el aislamiento entre fincas en la base de datos (RLS, T-01), el límite de peticiones, Storage ni el vínculo invitación-correo. Esa parte sigue `INCOMPLETO` en CI.

## Ítem 4.9: defecto funcional y de seguridad (extra)

**Qué se hizo:** en una rama local `demo/ari-4.9`, se quitó un `@Roles` (seguridad) y se cambió `> ref` por `>= ref` en la lactancia (funcional). Para cada uno: ejecución fallida, corrección con `git revert` y ejecución aprobada. Evidencia en `docs/ssdlc/evidencia/4.9/`.
**Dato a explicar:** el primer defecto funcional (que un aborto abra la lactancia) no fue detectado porque era equivalente; se descartó y está documentado.
**Qué NO comprueba / limitaciones:** la rama de demo no se subió a GitHub y la evidencia es local; falta la ejecución en CI y la respuesta del docente sobre ramas con defectos visibles.

## Ítems 1.3 y 1.4: amenazas y medidas

**Qué se hizo:** 9 amenazas STRIDE con medida, comprobación, responsable, estado y decisión (`docs/kb/amenazas.md`). M-02 y M-08 quedaron `verificada` con evidencia del 4.5; el resto sigue `implementada` o `propuesta`.
**Pendiente tuyo:** dibujar el modelo en Threat Dragon y guardar `threat-model.json`; aprobar las reglas y amenazas marcadas `observado`/`sugerido`.
