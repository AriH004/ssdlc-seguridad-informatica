# Ambiente de pruebas — ítem 6.2

Responsable según reparto: Danny. Revisor: Cristhian. Estado: **propuesta versionada, sin VPS ni dominio confirmado, sin despliegue ejecutado**. Validar plataforma y presupuesto antes de provisionar.

## Plataforma y componentes

Propuesta reproducible: VPS Linux con Docker Engine y Compose v2, proxy HTTPS administrado en el host, frontend Next.js (3000), backend NestJS (3001) y proyecto Supabase de pruebas separado (Auth, PostgreSQL y Storage privado). [Compose](../../deploy/compose.yaml) expone ambos puertos exclusivamente en 127.0.0.1; no contiene base de datos ni credenciales. Firewall: entrada pública solo HTTPS, HTTP si se requiere renovación/redirección, y administración restringida al operador.

## Prerrequisitos y configuración

1. Aprobar el [registro de versión](release-record.md), resolver faltantes y confirmar ambos digests. No usar latest ni reconstruir durante despliegue.
2. Configurar DNS y proxy TLS hacia localhost:3000 para la web y localhost:3001 para la API. Verificar certificados y reglas del proxy antes de exponer acceso. No declarar HTTPS verificado sin comprobarlo.
3. Fuera de Git, crear archivo de entorno backend con permisos 0600 y acceso limitado al operador. Inyectarlo mediante BACKEND_ENV_FILE (ruta absoluta). No mostrar su contenido ni usar compose config sin --quiet: puede expandir secretos.
4. Variables backend: DATABASE_URL, DATABASE_CA_CERT, SUPABASE_URL y FRONTEND_URL (origen HTTPS exacto). SUPABASE_SERVICE_ROLE_KEY solo en backend si se usan invitaciones/storage; nunca en NEXT_PUBLIC ni argumentos de build. JWT se comprueba por JWKS; no se requiere secreto simétrico para ese guard. NODE_ENV, PORT y Swagger los fija Compose. CA contiene el PEM confiable, no una ruta; mantener validación TLS activa.
5. Revisar rol de conexión y permisos con el [runbook de mínimo privilegio](../../backend/docs/runbooks/02-rol-minimo-privilegio.md); no asumir que una variable configura RLS. Preparar migraciones desde checkout del mismo SHA con credencial de migración separada, tras respaldo; la imagen runtime no contiene el código TypeScript necesario para pnpm migration:run. No ejecutar seeds de desarrollo contra producción.
6. Frontend: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y NEXT_PUBLIC_BACKEND_URL quedan incorporadas durante build. Confirmar que los candidatos publicados corresponden al ambiente elegido; variables runtime no las reemplazan. Si cambian, generar y evaluar otro candidato.

## Ejecución por el operador (shell Linux)

Con BACKEND_IMAGE y FRONTEND_IMAGE exportadas como repositorio@sha256 del registro aprobado y BACKEND_ENV_FILE definido por el operador:

```sh
docker compose -f deploy/compose.yaml config --quiet
docker compose -f deploy/compose.yaml pull
docker compose -f deploy/compose.yaml up -d --no-build
docker compose -f deploy/compose.yaml ps
```

Registrar fecha, operador, commit y digests efectivamente ejecutados; comparar RepoDigests con el registro. Verificar /privacidad devuelve HTML 200, GET / de API responde, una ruta protegida sin sesión devuelve 401 y un flujo autenticado con datos ficticios funciona. GET / no demuestra disponibilidad de PostgreSQL. Registrar resultados sanitizados; no guardar tokens, cuerpos sensibles ni entorno expandido.

## Recuperación y límites

Antes de actualizar, conservar ambos digests anteriores y respaldo consistente de base/configuración. Para revertir, restaurar las referencias anteriores y ejecutar up -d --no-build, luego repetir comprobaciones. Si las migraciones son incompatibles, detener escrituras y aplicar el plan de restauración aprobado; volver solo a las imágenes no restaura datos. Para primer despliegue fallido: retirar rutas públicas, ejecutar docker compose -f deploy/compose.yaml down y recuperar respaldo de pruebas si se alteró la base. down no elimina recursos Supabase; no usar down -v ni borrar datos sin decisión del operador.

No se implementa aquí despliegue automático (6.1), proxy TLS, gestor de secretos, backup automático ni evidencia de ejecución. Para cerrar 6.2 faltan plataforma real, operador y reproducción revisada por otro integrante.
