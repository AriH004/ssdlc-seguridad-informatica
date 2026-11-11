# Dudas abiertas y casos límite sugeridos (ítem 1.6)

Las dudas **no se asumen**: se resuelven con la persona responsable. Los casos de abajo son propuestas de la IA y quedan `sugerido` hasta que Ariana los apruebe.

## Dudas de permisos

| ID | Duda | Dónde se vio | Responsable | Estado |
|---|---|---|---|---|
| D-01 | Muchas rutas de lectura no llevan `@Roles` (por ejemplo `GET /animales`, `GET /animales/:id/documentos`, `GET /potreros`). ¿Debe poder leerlas cualquier rol de la finca, incluido el `peon`? | Controladores de animales, potreros, pesajes, tratamientos | Ariana | abierta |
| D-02 | El `veterinario` no puede crear animales, pesajes ni potreros. ¿Es intencional? | `@Roles` de esas rutas | Ariana | abierta |
| D-03 | `POST /auth/confirmar-invitacion` no tiene `@Roles`. ¿Qué impide que cualquier usuario autenticado intente confirmar una invitación ajena? (Se espera que la invitación esté ligada al correo del token.) | `auth.controller.ts`, `invitations.service.ts` | Ariana | abierta |
| D-04 | El `peon` puede editar (`PATCH`) un registro de producción de leche pero no anularlo. ¿Debe poder editarlo? | `produccion-leche.controller.ts` | Ariana | abierta |
| D-05 | ¿Todas las acciones sensibles (invitar, anular, corregir, dar de baja) dejan registro con usuario y fecha? Hay `evento_auth` y tablas `evento_*`, pero no se confirmó la cobertura completa. | Migraciones y servicios | Ariana | abierta |
| D-06 | ¿Swagger queda habilitado en producción? Depende de la variable `SWAGGER_ENABLED`. | `config/swagger.js`, `.env.example` | Cristhian | abierta |

## Casos límite y de abuso sugeridos por la IA (`sugerido`)

| ID | Caso | Flujo |
|---|---|---|
| S-01 | Token válido de la finca A usado contra un id de recurso de la finca B: debe responder "no encontrado", no 403. | F-03 |
| S-02 | Cuerpo con `tenantId`, `rol` o `id` de otra finca en un `POST`: debe rechazarse (400) o ignorarse. | F-01, F-03 |
| S-03 | Invitación reutilizada, vencida o para otro correo. | F-01 |
| S-04 | Anular un tratamiento ya anulado, o corregir uno de otra finca. | F-02 |
| S-05 | Tratamiento con fecha de fin anterior a la de inicio, retiro negativo o animal de sexo incompatible. | F-02 |
| S-06 | Superar el límite de peticiones y comprobar el 429 sin que se filtre información. | F-01 |
| S-07 | Petición sin `Authorization` a cada ruta: siempre 401, salvo `GET /`. | F-01 |
| S-08 | Rol inexistente en el JWT (por ejemplo `superadmin`): 401. | F-01 |
