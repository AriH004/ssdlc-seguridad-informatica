# Flujos críticos (ítem 1.1)

Los tres flujos se eligen por los datos que manejan y por el impacto de un fallo. Todas las reglas están `observado` (vistas en el código) salvo que se indique `sugerido`. Ariana debe aprobarlas.

Roles del sistema: `propietario`, `administrador`, `peon`, `veterinario`. Cada finca es un *tenant*.

---

## F-01 Inicio de sesión, perfil e invitación de personal a la finca

- **Actor:** usuario autenticado en Supabase; el propietario invita a otros.
- **Objetivo:** entrar a la finca correcta con el rol correcto y gestionar quién forma parte del equipo.
- **Resultado esperado:** el backend acepta solo JWT válidos con `tenant_id` y `rol` reconocidos; solo el propietario invita; el rol del invitado lo fija el propietario, no el invitado.
- **Código:** `backend/src/auth/` (`auth.guard.ts`, `roles.guard.ts`, `auth.controller.ts`, `services/invitations.service.ts`).

| ID | Regla | Estado |
|---|---|---|
| F-01/R-01 | La autenticación es 100 % de Supabase Auth; el backend solo verifica el JWT contra JWKS (ES256, `jose`). | observado |
| F-01/R-02 | Toda ruta exige `Authorization: Bearer` salvo las marcadas `@Public()` (hoy solo `GET /`). | observado |
| F-01/R-03 | Un JWT sin `tenant_id`, `rol` o `sub`, o con un rol que no sea uno de los cuatro, se rechaza con 401. | observado |
| F-01/R-04 | `POST /auth/invitar` y `GET /auth/invitaciones` son solo del `propietario`. | observado |
| F-01/R-05 | Al confirmar una invitación se aplica el rol predefinido por el propietario y se ignora cualquier rol inyectado. | observado |
| F-01/R-06 | `/auth` tiene un límite de 10 peticiones por minuto; el resto de la API, 120 por minuto (configurable). | observado |

**Criterios**

- **Éxito.** *Dado* un propietario con sesión válida, *cuando* invita a un correo con el rol `peon`, *entonces* queda una invitación de su finca y el invitado, al confirmarla, obtiene el rol `peon` y la finca del propietario.
- **Error.** *Dado* un token vencido o con firma inválida, *cuando* llama a cualquier ruta protegida, *entonces* recibe 401 sin detalle del motivo y no se abre ninguna transacción.
- **Uso indebido.** *Dado* un `administrador` o un `peon`, *cuando* llama a `POST /auth/invitar`, *entonces* recibe 403 y no se crea ninguna invitación. *Dado* un invitado que intenta enviar `rol: propietario` al confirmar, *entonces* el rol final sigue siendo el que fijó el propietario (`sugerido`: verificar con prueba directa a la API).

---

## F-02 Registro, corrección y anulación de tratamientos sanitarios (retiros de leche y carne)

- **Actor:** `propietario`, `administrador`, `veterinario` y `peon` (con límites).
- **Objetivo:** registrar tratamientos con sus períodos de retiro, corregirlos o anularlos con trazabilidad.
- **Resultado esperado:** los retiros activos son confiables; un dato alterado no pasa inadvertido.
- **Impacto de un fallo:** sanitario y comercial (leche o carne con retiro vigente salen al mercado).
- **Código:** `backend/src/tratamientos/`, `backend/src/sanitary/`, `evento_tratamiento` y tablas relacionadas.

| ID | Regla | Estado |
|---|---|---|
| F-02/R-01 | Crear un tratamiento: `propietario`, `administrador`, `peon` y `veterinario`. | observado |
| F-02/R-02 | Corregir (`POST /tratamientos/:id/correccion`) y anular (`/anulacion`): `propietario`, `administrador` y `veterinario`; **no** el `peon`. | observado |
| F-02/R-03 | Consultar retiros activos, estado sanitario y tratamientos de un animal: cualquier rol autenticado de la finca. | observado |
| F-02/R-04 | Hay compatibilidad de sexo entre el tratamiento y el animal, y un documento de respaldo opcional en un bucket privado. | observado |
| F-02/R-05 | La anulación y la corrección no borran el registro histórico (trazabilidad por eventos). | sugerido (confirmar en el servicio) |

**Criterios**

- **Éxito.** *Dado* un veterinario con sesión, *cuando* registra un tratamiento con retiro de leche para un animal de su finca, *entonces* el retiro aparece en `retiros-activos` hasta su fecha de fin.
- **Error.** *Dado* un cuerpo con campos no permitidos o fechas inválidas, *cuando* se envía, *entonces* responde 400 y no se crea nada (validación con `whitelist` y `forbidNonWhitelisted`).
- **Uso indebido.** *Dado* un `peon`, *cuando* intenta anular o corregir un tratamiento, *entonces* recibe 403 y el tratamiento y su retiro quedan idénticos. *Dado* un usuario de otra finca, *cuando* pide un tratamiento por id, *entonces* no obtiene el registro (aislamiento por RLS, ver F-03).

---

## F-03 Aislamiento de datos entre fincas (multi-tenant con RLS)

- **Actor:** cualquier usuario autenticado; el riesgo es un usuario de la finca A que ve o modifica datos de la finca B.
- **Objetivo:** cada finca ve y modifica solo sus propios datos, aunque el código de un controlador falle.
- **Resultado esperado:** PostgreSQL aplica las políticas por finca en cada petición.
- **Impacto de un fallo:** fuga de datos entre clientes; es el mayor riesgo del sistema.
- **Código:** `backend/src/auth/interceptors/rls-transaction.interceptor.ts`, migraciones `ForceRLS*`, `IsolateDomainAccessToAppRole`, `EnforceEventAnimalTenant`.

| ID | Regla | Estado |
|---|---|---|
| F-03/R-01 | Cada petición autenticada abre una transacción, fija los claims con `set_config('request.jwt.claims', ...)` y ejecuta `SET LOCAL ROLE resdigital_app`. | observado |
| F-03/R-02 | El rol de la app no puede ser superusuario, no tiene `BYPASSRLS`, no es dueño de tablas ni tiene `CREATE` en `public`; si no se cumple, el proceso no arranca. | observado |
| F-03/R-03 | Las tablas de dominio tienen RLS habilitado con políticas por `tenant_id`. | observado |
| F-03/R-04 | El `tenant_id` sale del JWT verificado, nunca del cuerpo de la petición. | observado |
| F-03/R-05 | Los eventos exigen que el animal pertenezca a la misma finca (`EnforceEventAnimalTenant`). | observado |

**Criterios**

- **Éxito.** *Dado* un usuario de la finca A, *cuando* lista animales, *entonces* solo ve los de A.
- **Error.** *Dado* un id de animal de otra finca, *cuando* se consulta, *entonces* la respuesta es "no encontrado" y no revela que existe.
- **Uso indebido.** *Dado* un usuario de la finca A, *cuando* envía en el cuerpo un `tenantId` de la finca B para crear un animal o un evento, *entonces* el dato se rechaza o se ignora y no se crea nada en B. *Dado* un animal de B, *cuando* A intenta registrarle un evento, *entonces* falla.
