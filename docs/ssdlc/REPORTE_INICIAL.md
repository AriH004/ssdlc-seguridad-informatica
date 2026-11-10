# Reporte inicial (Fase 0, solo lectura)

Fecha: 2026-11-10. Rama: `feature/Ari`. No se ejecutó nada destructivo ni se leyó ningún `.env`.
Estado de cada afirmación: `observado` (visto en el código/árbol), salvo que se indique otra cosa.

## 1. Estructura

- Monorepo **sin workspace**: `backend/` (NestJS) y `frontend/` (Next.js), cada uno con su `pnpm-lock.yaml` y `pnpm-workspace.yaml`. Raíz: `package.json` con scripts que delegan con `pnpm --dir`.
- pnpm 10.32.1, Node `>=24.14.0 <25` (local: v24.19.0).
- Remoto: `AriiH08/ssdlc-seguridad-informatica`. Ramas remotas: `main`, `development`, `feature/Ari|Cris|Danny*`, `chore/monorepo-migration`. **Ya existe `development`** (no hay que renombrar `dev`).

## 2. Comandos reales

| Qué | Backend | Frontend |
|---|---|---|
| lint | `oxlint --type-aware src/ test/` | `eslint` (**no** oxlint) |
| typecheck | `tsc --noEmit` | `tsc --noEmit` |
| test | `vitest run` | `vitest run` |
| build | `nest build` | `next build` |
| integración / e2e | `test:integration` (necesita BD), `test:e2e` | `test:e2e` (Playwright) |

Desde la raíz: `install:apps`, `lint`, `typecheck`, `test`, `build`, `check:workflows`.

## 3. Inventario del prompt frente al código real

| Dice el prompt (3b) | Realidad observada |
|---|---|
| Pruebas de autorización (`auth.guard`, `roles.guard`, `role-matrix`, `mass-assignment`, `rate-limit-key`) | **Confirmado** en `backend/src/auth/tests/` |
| Cálculos reproductivos y lactancia | **Confirmado** (`produccion/lactancia-calc.spec.ts`, `reproductivo/tests/*`) |
| Integración RLS | **Confirmado** (`*.integration.spec.ts`); necesitan PostgreSQL, no corren sin BD |
| CI con jobs política, secretos, dependencias, calidad, replay, actionlint, `required` | **Parcial**: el CI raíz tiene `quality` (matriz), `security` (Gitleaks + actionlint), `dependencies`, `migration-replay` y `required`. **No hay job `policy`** en la raíz |
| `git-policy`, `required-status` | Existen solo en `backend/tooling` y `frontend/tooling`, duplicados; no se usan desde la raíz |
| `.gitleaks.toml` | Existe en la raíz |
| `pre-commit`/`pre-push` (Husky) | Solo dentro de `backend/.husky`; apuntan a ramas `dev` |
| `CODEOWNERS`, plantilla de PR, rulesets | **Solo heredados** dentro de `backend/.github` y `frontend/.github` (no ejecutan). **No hay `CODEOWNERS` ni plantilla de PR en la raíz** |
| `release.yml`, `maintenance.yml` | **No existen** (solo `ci.yml` en `.github/workflows/`) |
| `CLAUDE.md` heredado de otro contexto | `backend/CLAUDE.md`, `frontend/CLAUDE.md` y `frontend/AGENTS.md` existen; hay que revisarlos. Raíz tiene `AGENTS.md` pero **no** `CLAUDE.md` |
| OpenSpec | **No se encontró** `openspec/` |
| Runbooks | `backend/docs/runbooks/` existe |

## 4. Qué falta para el alcance

Base de conocimiento y amenazas (`docs/kb/`), `scripts/verify.sh`, `scripts/setup/*`, `scripts/test-env/`, Dockerfiles, `release.yml`, `deploy.yml`, `despliegue.md`, `.claude/settings.json`, plantilla de PR raíz, `CODEOWNERS` raíz, `labels.sh`, plantilla `excepcion.yml` (solo existe `hallazgo.yml`), `PASOS_MANUALES.md`, `ENTREGA.md`, `defensa/*`.

## 5. Hallazgos de higiene (a revisar antes de publicar)

1. `backend/dist/`, `node_modules/`, `tsconfig.build.tsbuildinfo` y `frontend/tsconfig.tsbuildinfo` existen en el disco; **ninguno está versionado** (comprobado con `git ls-files`). Verificar que `.gitignore` los cubra.
2. Migración duplicada: `1792700000000-IsolateNewEventDetailTables.ts` y `1793300000000-IsolateNewEventDetailTables.ts` (mismo SQL; documentado en `MIGRACION-MONOREPO.md`). No tocar sin decisión del equipo.
3. CI remoto: la única ejecución registrada falló por **bloqueo de facturación** (jobs no iniciados). Eso es `INCOMPLETO`, no aprobado.
4. Entorno local: **Gitleaks no está instalado**, **Docker está apagado**. Por tanto `scripts/verify.sh` fallará con `INCOMPLETO: gitleaks` hasta instalarlo, y replay de migraciones/integración no se pueden ejecutar localmente.

## 6. Preguntas abiertas (van a `docs/kb/dudas.md` cuando exista)

- ¿El docente aprobó 9 ítems para un equipo de 3? (responsable: equipo)
- ¿Qué plataforma de despliegue y qué beneficio educativo está activo? (Ariana)
- ¿Se resuelve la facturación de GitHub Actions antes del jueves? (dueña del repo)
- ¿Quién instala Gitleaks y activa Docker en cada máquina?
