# ResDigital — SSDLC + IA + DevSecOps

Equipo: Ariana, Cristhian y Danny. Monorepositorio del proyecto de Seguridad informática.

Base de aplicación acordada: importación de Ari en el [PR #7](https://github.com/AriiH08/ssdlc-seguridad-informatica/pull/7). La importación alternativa del PR #1 queda reemplazada; el CI, los hallazgos y Docker se conservan como aportes separados sobre esa base.

## Estructura

- backend/: API NestJS, TypeORM, PostgreSQL/Supabase.
- frontend/: interfaz Next.js y React.
- .github/workflows/: CI activo del monorepositorio.
- docs/ssdlc/: alcance y documentación del curso.

## Preparación

Usar Node.js 24 (>=24.14.0 y <25), Corepack y pnpm 10.32.1. Cada aplicación conserva su lockfile y su configuración pnpm; no es un workspace de dependencias compartidas.

```sh
corepack enable
corepack pnpm install:apps
```

Crear backend/.env y frontend/.env.local a partir de los .env.example correspondientes y completar los valores localmente. Nunca subir credenciales. Consultar los README de cada aplicación para base de datos, migraciones y servicios externos.

## Comandos desde la raíz

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm check:workflows
```

En dos terminales:

```sh
corepack pnpm dev:backend
corepack pnpm dev:frontend
```

Comandos específicos: corepack pnpm --dir backend test:integration o corepack pnpm --dir frontend test:e2e. Estos requieren sus ambientes de prueba; no están implícitos en las pruebas unitarias.

## Cómo ejecutar las comprobaciones

```sh
corepack pnpm install:apps
bash scripts/verify.sh
```

`scripts/verify.sh` ejecuta lint, typecheck, pruebas unitarias, build y Gitleaks (historial y cambios en staging) con el pnpm fijado por Corepack. Si falta una herramienta o dependencia termina con `INCOMPLETO: <herramienta>`; si algún paso falla, con `NO APROBADO`. Solo el mensaje `RESULTADO: APROBADO` cuenta como verde. No incluye integración con base de datos, e2e ni replay de migraciones (requieren Docker/PostgreSQL; el CI los ejecuta aparte). Gitleaks se descarga y verifica por checksum desde `tooling/security-tools.mjs`.

## Colaboración

- main: entrega.
- development: integración mediante PR y revisión de otro integrante.
- feature/Ari, feature/Cris y feature/Danny: trabajo individual existente; actualizar desde development antes de trabajar.

La migración se propone en una rama separada para revisar antes de integrarla.

## Documentación

- [Lineamientos del profesor](docs/ssdlc/lineamientos_proyecto.md)
- [Procedencia, automatización y pendientes](docs/ssdlc/MIGRACION-MONOREPO.md)
- [Registro único de hallazgos — 7.5](docs/ssdlc/REGISTRO-HALLAZGOS.md)
- [Prompt existente para Claude Code](docs/ssdlc/PROMPT_CLAUDE_CODE.md)

El CI importado no demuestra todavía publicación en Docker Hub ni despliegue. Estos necesitan configuración y evidencia propias.
