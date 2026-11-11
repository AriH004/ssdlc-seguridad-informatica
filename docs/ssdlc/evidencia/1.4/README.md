# Evidencia 1.4: medidas y comprobaciones

Cada amenaza de [`docs/kb/amenazas.md`](../../../kb/amenazas.md) tiene medida (`M-xx`), componente, comprobación prevista, responsable, estado y decisión.

## Estado de las medidas (con evidencia)

| Medida | Amenaza | Estado | Evidencia |
|---|---|---|---|
| M-02 Roles por ruta | T-02 | **verificada** | [`4.5/authz-salida-completa.txt`](../4.5/authz-salida-completa.txt) (182 de 182) y demo [`4.9`](../4.9/README.md) donde la prueba detecta un permiso quitado |
| M-08 Verificación del JWT | T-08 | **verificada** | `sin-sesion.authz.spec.ts` (vencido, otra llave, otro emisor, otra audiencia, sin firma, HS256, sin claims) en `4.5/` |
| M-03, M-04 Lista blanca de campos | T-03, T-04 | implementada, **parcialmente verificada** | Se verifica que `tenantId`, `rol` y `userId` se rechazan en el cuerpo (`finca-y-asignacion-masiva…`). No se verifica que el rol final de una invitación sea el fijado por el propietario (D-03) |
| M-01 RLS, M-05 Gitleaks, M-06 Límite de peticiones, M-07 Storage | T-01, T-05, T-06, T-07 | implementada, **no verificada** | Sin evidencia de ejecución en este PR (T-01 depende de pruebas con base de datos que no corren en CI) |
| M-09 Registro de acciones | T-09 | propuesta | Pospuesta (ver D-05) |

Una medida pasa a `verificada` solo con una ejecución guardada; por eso las de arriba que no la tienen siguen como `implementada`.
