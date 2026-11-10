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

Resultado global: **NO APROBADO**. No se presenta como verde.

## Hallazgo de Gitleaks

Regla `postgres-connection-string`, `backend/src/database/scripts/bootstrap-local.sql` líneas 15 y 17, solo en el commit histórico `450a07ec` (contraseña de ejemplo `test` en comentarios del script, ya reemplazada por `PGPASSWORD` en el archivo actual). El commit ya está en `origin/development`, por lo que no se reescribe el historial.

Pendiente de decisión humana (Danny/equipo): aceptar los dos fingerprints en `.gitleaksignore` con justificación, o reescribir el historial antes de publicar. Mientras no se decida, `verify.sh` queda en rojo.

## No ejecutado

Pruebas de integración (RLS), e2e y replay de migraciones: requieren PostgreSQL/Docker (apagado en esta máquina). Quedan `INCOMPLETO`, no aprobadas.

## Regla de negocio con límites (lactancia)

`backend/src/produccion/lactancia-calc.spec.ts`: se añadieron 6 casos de valor límite (día anterior/mismo día del parto, referencia con hora, secado en el límite, parto revertido, parto en la fecha de referencia). 17/17 pasan.
