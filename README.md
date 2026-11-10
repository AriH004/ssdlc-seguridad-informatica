# ResDigital — SSDLC + IA + DevSecOps

Equipo: Ariana, Cristhian y Danny. Monorepositorio del proyecto de Seguridad informática.

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

## Colaboración

- main: entrega.
- development: integración mediante PR y revisión de otro integrante.
- feature/Ari, feature/Cris y feature/Danny: trabajo individual existente; actualizar desde development antes de trabajar.

La migración se propone en una rama separada para revisar antes de integrarla.

## Documentación

- [Lineamientos del profesor](docs/ssdlc/lineamientos_proyecto.md)
- [Procedencia, automatización y pendientes](docs/ssdlc/MIGRACION-MONOREPO.md)
- [Candidatos y publicación en Docker Hub — 5.5](docs/ssdlc/DOCKER-HUB.md)
- [Prompt existente para Claude Code](docs/ssdlc/PROMPT_CLAUDE_CODE.md)

El CI importado no demuestra todavía publicación en Docker Hub ni despliegue. Estos necesitan configuración y evidencia propias.
