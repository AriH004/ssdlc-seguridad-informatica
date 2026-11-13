# Evidencia 4.1: ambiente aislado de pruebas y datos controlados

**Responsable:** Ariana. **Revisor:** Danny. Ejecución local del 2026-11-12 sobre `development` (`cded475`), Windows 11, Docker 29.6.2.
Salida completa: [integration-salida-completa.txt](integration-salida-completa.txt).

## Cómo se inicia, se carga y se limpia

Un solo comando, desde la raíz del repo (requiere Docker encendido):

```bash
corepack pnpm --dir backend test:integration
```

Lo ejecuta `backend/tooling/integration-tests.mjs`, que:

1. Levanta un contenedor PostgreSQL 15 desechable (imagen fijada por digest), enlazado solo a loopback, con base `resdigital_test_<id>`, nombre de contenedor y contraseñas aleatorios. No carga `.env` ni usa datos de producción.
2. Compila y aplica **todas las migraciones** (41 en esta ejecución, cero pendientes).
3. Carga datos ficticios: una fila de catálogo (`QA Raza Global`) y, por cada suite, dos fincas (A y B) y un usuario por finca con UUID aleatorio (`backend/src/test-utils/integration-tenant.ts`).
4. Verifica HTTP real: arranque, 401 anónimo, 429 con CORS y rechazo de origen ajeno, 413 por exceso de lote.
5. Ejecuta las suites de integración (RLS, flujos), las unitarias y la e2e.
6. **Limpia y lo comprueba:** consulta que no quedó ninguna finca, usuario, animal, potrero ni evento, y elimina el contenedor y la base.

Cada ejecución crea un ambiente nuevo, por lo que puede repetirse sin depender de ejecuciones anteriores.

## Resultado

| Etapa | Resultado |
|---|---|
| Replay de migraciones | 41 aplicadas, 0 pendientes |
| HTTP 401 / 429 / 413 | confirmados |
| Suites de integración | 7 archivos, 40 pruebas: OK |
| Limpieza SQL | cero fincas, usuarios, animales, potreros y eventos |
| Pruebas unitarias | 36 archivos, 467 pruebas: OK |
| e2e | 1 archivo, 1 prueba: OK |
| Limpieza Docker | contenedor y base eliminados |

## Limitaciones (no se presentan como resueltas)

- **No corre en CI.** `.github/workflows/ci.yml` solo ejecuta `migration-replay` y `authz-tests`; `test:integration` aún no se invoca desde el pipeline, y el ítem pide reutilizar estos scripts en CI. Pendiente: job propuesto por PR con revisión de otro integrante.
- **Cuentas con distintos permisos:** este ambiente siembra dos fincas con un usuario cada una (aislamiento entre fincas, T-01), no un usuario por rol. Los roles se prueban en `backend/test/authz/` con tokens firmados contra un JWKS local, sin base de datos (ver evidencia 4.5).
- Ejecutado una sola vez, en una máquina local.
