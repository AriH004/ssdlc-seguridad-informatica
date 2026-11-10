# Migración a monorepositorio

## Base definitiva acordada

Por decisión de Danny, la importación de Ari en el PR #7 (`feature/Ari`, commit `a2647e1825d37f63615872861d92ee9b219a9e15`) reemplaza la propuesta de importación del PR #1. Se conservan sus cambios de `dev` a `development` y todos sus archivos de aplicación. El historial que sigue documenta el trabajo anterior; no implica que el PR #1 sea la base de integración actual.

El CI raíz y los comandos comunes se trasladan a `feature/Danny-ci-base-ari`, construida directamente desde la base de Ari. Los aportes de hallazgos y Docker incorporan esta base mediante merges normales, sin reescribir los commits previos ni perder evidencia.

Orden de integración: PR #7 hacia `development`; después el PR de CI sobre la base de Ari; finalmente los PR #5 (registro) y #6 (Docker), cambiando sus bases a `development` cuando sus dependencias estén integradas. La revisión de otro integrante y las comprobaciones obligatorias siguen pendientes; no se omiten por el cambio de base.

La importación de Ari contiene además `1792700000000-IsolateNewEventDetailTables.ts`, junto a `1793300000000-IsolateNewEventDetailTables.ts`: la comparación confirma el mismo SQL con distinto identificador. Se conserva la base sin editar migraciones existentes. El equipo debe revisar esta duplicación antes de ejecutar migraciones; esta adopción no acredita un replay de base de datos aprobado.

## Procedencia

Se importaron únicamente los archivos versionados de las copias locales, sin modificar los originales. No se copió el historial Git antiguo, node_modules, .env, logs ni archivos generados. Los repositorios originales conservan el historial y la atribución previa.

- Backend: https://github.com/crissXcoder/ResDigital_backend — commit a15b96f26273fe615e9348fd1857dfd0c726a537
- Frontend: https://github.com/crissXcoder/ResDigital_frontend — commit 2f9e3470ccdce44a625dc50b8641e8addf8cdb84

Se conserva la documentación previa del repositorio de destino.

## Automatización

El CI raíz ejecuta lint, typecheck, unitarias y build en ambas aplicaciones; contrato OpenAPI del frontend; replay de migraciones del backend con servicios desechables; revisión de dependencias en PR; Gitleaks y actionlint. Los scripts de seguridad reutilizan los binarios y checksums fijados en el backend original. La ejecución en GitHub debe verificarse después de publicar y abrir el PR.

Las carpetas .github dentro de cada aplicación son referencias heredadas: GitHub solo ejecuta los workflows de la raíz. Sus políticas, CODEOWNERS y hooks antiguos asumen repositorios independientes, ramas dev y responsables originales; no instalarlos sin adaptarlos. Los tests de política heredados no equivalen a validar la gobernanza nueva. Los borradores de release originales no publican imágenes ni despliegan.

## Pendientes reales

- Configurar en GitHub protecciones para development y main: PR, revisión de otro integrante y check Monorepo required obligatorio. Los JSON heredados no configuran por sí solos el nuevo repositorio.
- Acordar responsables y CODEOWNERS con los usuarios GitHub de los tres miembros.
- Elegir plataforma de despliegue y configurar secretos en el repositorio nuevo; no se transfieren desde los anteriores.
- Implementar publicación Docker Hub, despliegue y recuperación si forman parte del alcance. No existe un despliegue nuevo demostrado en esta migración.
- Revisar los nueve ítems y autorización del equipo de tres con el docente.

Cada nuevo aporte académico debe tener PR y evidencia propios; la importación no convierte trabajo previo en aporte nuevo.

## Verificación local de la migración

- Node.js 24.19.0, pnpm 10.32.1; instalaciones con ambos lockfiles congelados: aprobadas.
- Backend: lint (con advertencias heredadas), tipos, 36 archivos / 462 pruebas unitarias y build: aprobados.
- Frontend: lint (28 advertencias heredadas, cero errores), tipos, 60 archivos / 369 pruebas unitarias y build de producción: aprobados.
- Contrato OpenAPI del frontend, Gitleaks sobre la importación y actionlint del workflow raíz: aprobados.
- Dos ejemplos de URL PostgreSQL en comentarios de bootstrap-local.sql se ajustaron para usar PGPASSWORD, sin alterar SQL ejecutable. No eran credenciales de producción.
- Los tipos OpenAPI se regeneraron para normalizar finales de línea; se define LF en la raíz para evitar diferencias Windows/Linux.
- Replay de migraciones: no ejecutado localmente, motor Docker apagado. Pendiente comprobar el job en GitHub.
- E2E, despliegue, autorización contra ambiente real y protecciones remotas: no verificados por estas pruebas locales.

## Primera ejecución remota

PR: https://github.com/AriiH08/ssdlc-seguridad-informatica/pull/1

Ejecución: https://github.com/AriiH08/ssdlc-seguridad-informatica/actions/runs/42838594931

GitHub no inició ninguno de los jobs y registró: "The job was not started because your account is locked due to a billing issue."
La validación remota está incompleta. El propietario del repositorio debe resolver el bloqueo de facturación y volver a ejecutar CI; no se debe presentar esta ejecución como una comprobación técnica aprobada ni desactivar controles para omitirla.
