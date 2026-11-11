# Evidencia 4.5: pruebas de autorización directo a la API

**Responsable:** Ariana. **Revisor:** Cristhian. **Requisitos previos que cubre:** 4.1 (ambiente aislado).

## Qué se hizo

- `backend/test/authz/` con 3 archivos y **182 pruebas**, ejecutadas con `pnpm test:authz` (en `backend/`).
- Las peticiones van por HTTP a la API real (controladores, `AuthGuard`, `RolesGuard`, `ValidationPipe` y filtro de errores). El `SupabaseJwtService` real verifica tokens firmados con ES256 contra un JWKS local, así que se comprueban firma, algoritmo, emisor, audiencia y vencimiento.
- Cada prueba lleva en el nombre los IDs que cubre, por ejemplo `[F-02][T-02][T-04] peon es rechazado con 403 en POST /tratamientos/<id>/anulacion y no se toca ningún dato`.
- Job `authz-tests` en `.github/workflows/ci.yml`, incluido en el check obligatorio `Monorepo required`, con el reporte subido como artefacto del commit.

| Archivo | Qué cubre | Flujo y amenazas |
|---|---|---|
| `acceso-por-rol.authz.spec.ts` | 25 rutas × 4 roles: el rol no permitido recibe 403 y ningún servicio recibe llamadas; el permitido pasa los guards. La tabla se escribió desde `docs/kb/arquitectura-y-acceso.md`, no desde los decoradores. | F-01, F-02, F-03; T-02, T-04 |
| `sin-sesion.authz.spec.ts` | Descubre **todas** las rutas de los controladores y comprueba 401 sin sesión; más tokens vencidos, de otra llave, de otro emisor o audiencia, sin firma, HS256, sin `tenant_id`, sin rol, con rol inexistente y sin `sub`. | F-01; T-08, T-02 |
| `finca-y-asignacion-masiva.authz.spec.ts` | `tenantId`, `rol` y `userId` enviados en el cuerpo se rechazan con 400 nombrando el campo, y no se llama a ningún servicio. | F-03, F-01; T-01, T-03, T-04 |

## Cómo reproducirlo

```bash
cd backend
pnpm install --frozen-lockfile
pnpm test:authz
```

No necesita base de datos, red ni credenciales. Las cuentas y los datos son ficticios (dos fincas con un usuario por rol) y no hay nada que limpiar: todo vive en el proceso de prueba.

## Evidencia de ejecución

- [`authz-salida-completa.txt`](authz-salida-completa.txt): 3 archivos, 182 pruebas, 0 fallos, código de salida 0.
- Las pruebas **detectan** defectos reales: ver [`../4.9/`](../4.9/README.md), donde quitar un `@Roles` hace fallar la prueba correspondiente y restaurarlo la deja en verde.

## Qué comprueba y qué NO comprueba

**Comprueba:** que la autenticación y la autorización por rol se aplican en el borde HTTP; que un rechazo no devuelve detalles internos y no llega a ningún servicio (no se expone ni se modifica un dato); que el cuerpo de la petición no puede fijar la finca ni el rol.

**No comprueba (limitaciones declaradas):**
- **Aislamiento entre fincas en la base de datos (T-01).** Los servicios son falsos, así que no se verifica que PostgreSQL devuelva "no encontrado" para un recurso de otra finca. Eso lo cubren las pruebas `*.rls.integration.spec.ts`, que necesitan una base y **no corren en este CI**: hoy esa parte está `INCOMPLETO`.
- **Rutas de lectura sin `@Roles`.** Cualquier rol de la finca las puede leer (duda D-01 en `docs/kb/dudas.md`); las pruebas no afirman que eso sea lo correcto.
- **Límite de peticiones (T-06)** y **Storage (T-07):** no están en estas pruebas.
- **El vínculo invitación–correo (D-03):** no se verificó.
