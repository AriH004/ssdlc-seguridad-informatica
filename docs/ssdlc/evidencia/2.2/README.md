# Evidencia ítem 2.2 (Ariana)

Ejecución local de `bash scripts/verify.sh` el 2026-11-10 (Node 24.19.0, pnpm 10.32.1 vía Corepack, Windows 11).
Salida completa: [verify-salida-completa.txt](verify-salida-completa.txt).

| Paso | Resultado |
|---|---|
| lint | OK |
| typecheck | OK |
| pruebas (backend + frontend, unitarias) | OK |
| build | OK |
| gitleaks (historial + staging) | **FALLÓ**: 2 hallazgos |

Resultado global de esa primera ejecución: **NO APROBADO**. No se presentó como verde.

## Segunda ejecución (2026-11-12, `development` en `cded475`, con `.gitleaksignore` integrado por el PR #14)

Salida completa: [verify-salida-completa-aprobada.txt](verify-salida-completa-aprobada.txt).

| Paso | Resultado |
|---|---|
| lint | OK |
| typecheck | OK |
| pruebas | OK |
| build | OK |
| gitleaks (historial + staging) | OK: 0 hallazgos (los 2 fingerprints históricos están en la excepción acotada de `.gitleaksignore`) |

Resultado global: **APROBADO** para el alcance local. La excepción de Gitleaks sigue con aprobación humana PENDIENTE (Danny) y vence el 2026-12-11; no equivale a haber eliminado el hallazgo.

## Hallazgo de Gitleaks

Regla `postgres-connection-string`, `backend/src/database/scripts/bootstrap-local.sql` líneas 15 y 17, solo en el commit histórico `450a07ec` (contraseña de ejemplo `test` en comentarios del script, ya reemplazada por `PGPASSWORD` en el archivo actual). El commit ya está en `origin/development`, por lo que no se reescribe el historial.

Decisión tomada: se aceptan los dos fingerprints en `.gitleaksignore` con justificación y vencimiento (PR #14); el historial no se reescribe. La aprobación humana de Danny sigue pendiente (ver registro de hallazgos).

## No ejecutado

Pruebas de integración (RLS), e2e y replay de migraciones: requieren PostgreSQL/Docker (apagado en esta máquina). Quedan `INCOMPLETO`, no aprobadas.

## Regla de negocio con límites (lactancia)

`backend/src/produccion/lactancia-calc.spec.ts`: se añadieron 6 casos de valor límite (día anterior/mismo día del parto, referencia con hora, secado en el límite, parto revertido, parto en la fecha de referencia). 17/17 pasan.
