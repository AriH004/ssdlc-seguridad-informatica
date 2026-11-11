# Publicación de candidatos aprobados — Danny, ítem 5.5

## Base de integración actualizada

Se adopta la importación de Ari (PR #7) y el CI raíz compartido (PR #8). El PR #6 incorpora ambos mediante merge, conserva los Dockerfiles y controles de publicación, y ya no depende de fusionar la importación reemplazada del PR #1. Integrar #7 y #8, cambiar la base de #6 a `development` y obtener revisión de otro integrante antes de fusionar. El bloqueo remoto y los requisitos de configuración siguen pendientes.

## Estado y límites

Se implementan Dockerfiles, verificaciones de contenedores y publicación condicionada en CI. GitHub Actions ya ejecuta los jobs. La publicación remota no está demostrada porque todavía faltan la configuración pública real del frontend y el secreto de publicación. Las imágenes locales `local-demo` usan valores ficticios y el script impide publicarlas. No confundir preparación con cumplimiento completo de 5.5.

## Configuración necesaria en GitHub

En Settings → Secrets and variables → Actions, configurar estas variables de repositorio:

- `DOCKERHUB_USERNAME`: `dannyor94` (Docker usa nombres de repositorio en minúsculas; verificar que corresponde a la cuenta del usuario).
- `NEXT_PUBLIC_SUPABASE_URL`: URL pública del proyecto de pruebas elegido.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: únicamente clave pública anon/publishable. Nunca service_role, JWT secret ni credenciales privadas.
- `NEXT_PUBLIC_BACKEND_URL`: URL pública HTTPS del backend de destino.

Configurar `DOCKERHUB_TOKEN` como secreto con permiso de escritura limitado a los repositorios del proyecto. El dueño crea/configura el token por la interfaz segura; no enviarlo por chat, Issues o Git. La sesión de Docker Desktop de la computadora no se transfiere al runner. Si la cuenta no permite ese alcance, documentar el alcance real y quién lo administra.

En pull requests, si faltan las tres variables públicas del frontend, el CI usa valores ficticios no sensibles solamente para construir y probar la imagen; un PR nunca publica. En un `push` a `development` no se aplican esos valores: la construcción exige la configuración pública real antes de permitir la publicación.

La publicación prevista usa `dannyor94/resdigital-backend:<SHA>` y `dannyor94/resdigital-frontend:<SHA>`. No se ha confirmado todavía la autenticación de publicación en Docker Hub.

## Flujo implementado

1. CI evalúa el PR y el commit fusionado en `development` o `main` con lockfiles, calidad, secretos, migraciones y dependencias según el evento.
2. El job `images` construye cada candidato una sola vez con el SHA del commit evaluado. En un PR ese SHA identifica el commit de prueba de la fusión de GitHub, no necesariamente el head de la rama. En el push de integración se vuelve a evaluar el commit efectivamente fusionado y sus candidatos.
3. `image-candidate.mjs verify` comprueba usuario no root, revisión e identidad. En backend carga dependencias de producción y confirma el artefacto; no inicia una base ni prueba la API. En frontend comprueba HTTP 200 y HTML de la página pública `/privacidad` dentro del contenedor aislado; no sustituye E2E autenticados.
4. Guarda el candidato con `docker image save` y un registro de SHA, image ID y checksum del archivo. Los artefactos candidatos permanecen 7 días; descargarlos antes si la evaluación será posterior.
5. Solo en push a `development`, `publish` comprueba los resultados obligatorios. Un fallo, cancelación, omisión obligatoria o ausencia impide continuar. La revisión diferencial de dependencias solo se ejecuta en PR; su omisión en push es explícita y no sustituye un SCA completo.
6. Descarga los candidatos de la misma ejecución, valida checksum, carga las imágenes y compara su ID con el evaluado. No vuelve a construir. Autentica con el secreto del runner y publica la etiqueta SHA.
7. Registra el digest que devuelve el repositorio. `published-digests-<SHA>` conserva los registros 30 días. El despliegue debe consumir `repositorio@sha256:...`, no reconstruir ni depender solo de una etiqueta mutable.

Si una imagen se publica y falla la otra, la versión conjunta no está aprobada; registrar el resultado parcial y no desplegarla como satisfactoria. No se implementa reversión transaccional de publicaciones en Docker Hub.

## Demostración local reproducible

Ejecutar desde la raíz; los siguientes datos son ficticios y no representan el ambiente desplegado:

```sh
docker build --build-arg VCS_REF=local-demo -t resdigital-backend:local-demo backend
docker build --build-arg VCS_REF=local-demo --build-arg NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-public-placeholder --build-arg NEXT_PUBLIC_BACKEND_URL=http://localhost:3001 -t resdigital-frontend:local-demo frontend
node tooling/image-candidate.mjs verify backend local-demo
node tooling/image-candidate.mjs verify frontend local-demo
node --test tooling/tests/release-gate.test.mjs
```

El comando `verify` exporta archivos grandes en `image-artifacts/`, excluidos de Git. La verificación de checksum e identidad al cargar permite rechazar un candidato alterado. Las pruebas del gate comprueban que cada resultado fallido, omitido, cancelado, incompleto o ausente bloquea la decisión de publicar. Son pruebas locales de la lógica, no evidencia de un pipeline remoto ejecutado.

## Criterio para declarar 5.5 demostrado

Conservar una ejecución remota aprobada del commit integrado, etiquetas SHA visibles en Docker Hub, digest de ambas imágenes, registros que enlacen la identidad del candidato evaluado con la imagen publicada y una demostración remota de que un fallo obligatorio bloquea publicación. Otro integrante revisa el PR y los resultados. Mientras esto falte, mantener H-4 abierto.

## Referencias técnicas

- [Next.js: output standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).
- [Docker: guardar una imagen para cargarla después](https://docs.docker.com/reference/cli/docker/image/save/).
