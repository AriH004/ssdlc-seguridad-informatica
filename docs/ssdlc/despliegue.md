# Ambiente real de ResDigital — ítem 6.2

## Origen y alcance

El equipo reutilizó una aplicación existente y creó un repositorio separado para demostrar SSDLC. Información de alojamiento confirmada por Ariana el 13/nov/2026: frontend en Vercel, backend en Railway y base de datos en Supabase. No se atribuye a la copia SSDLC un despliegue que no se ha comprobado.

- Frontend original: https://github.com/crissXcoder/ResDigital_frontend
- Backend original: https://github.com/crissXcoder/ResDigital_backend
- Frontend público: https://res-digital-frontend.vercel.app/login
- Copia SSDLC: https://github.com/AriH004/ssdlc-seguridad-informatica
- Backend público Railway: URL no aportada; no se inventa.

La plataforma está identificada; faltan capturas sanitizadas de configuración y el commit activo en cada servicio para certificar la reproducción del ambiente real. Las instrucciones siguientes son el procedimiento reproducible previsto a partir de los manifiestos, no una afirmación de haber accedido a las consolas. Responsable según reparto: Danny; revisor: Cristhian.

## Componentes y servicios

Navegador → frontend Next.js en Vercel → API NestJS en Railway → PostgreSQL en Supabase. El código utiliza además Supabase Auth/JWKS y Storage privado para documentos; sus políticas y configuración activas en el ambiente original no se auditaron en esta revisión. Las credenciales de base y service_role son exclusivamente de servidor. El frontend recibe solo URL y clave pública de Supabase.

## Reproducción en un ambiente separado de pruebas

1. Registrar repositorio, rama y SHA que se desea desplegar. Si se usan los repos originales, usar sus propios manifiestos; los comandos abajo corresponden al monorepositorio SSDLC. No sustituir el despliegue original por la copia sin revisar diferencias.
2. Crear proyecto Supabase de pruebas aislado. Configurar Auth, URLs de redirección permitidas y Storage privado; revisar los runbooks de backend/docs/runbooks. Suministrar DATABASE_URL y DATABASE_CA_CERT mediante variables protegidas del backend. Mantener TLS verificado y synchronize=false. Aplicar migraciones del mismo SHA con credencial de migración separada y respaldo previo; no ejecutar seeds de desarrollo contra producción.
3. En Vercel, importar el repositorio autorizado, framework Next.js, raíz frontend para el monorepo, instalación pnpm install --frozen-lockfile y build pnpm build. Para el repo frontend independiente, la raíz es la del proyecto. Usar las versiones fijadas en package.json. Configurar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y NEXT_PUBLIC_BACKEND_URL con los datos públicos del ambiente. Se incorporan al build; cambiarlas exige reconstrucción y nueva evaluación. Nunca poner service_role en NEXT_PUBLIC.
4. En Railway, crear servicio desde el repositorio autorizado, raíz backend para el monorepo o raíz del repo backend independiente. Con Nixpacks/Railpack, usar pnpm install --frozen-lockfile, pnpm build y pnpm start:prod; confirmar el builder efectivo en la consola. Alternativamente, usar el Dockerfile backend ya versionado. No se afirma que el ambiente original utilice estas imágenes Docker Hub.
5. En backend, fijar NODE_ENV=production, FRONTEND_URL al origen HTTPS exacto de Vercel, SUPABASE_URL, DATABASE_URL y DATABASE_CA_CERT; SUPABASE_SERVICE_ROLE_KEY solo para funciones backend que la necesiten. Mantener SWAGGER_ENABLED=false. Railway proporciona PORT; la aplicación lo consume. No registrar valores secretos ni entorno expandido en evidencias.
6. Habilitar el dominio HTTPS público del backend y configurar esa URL en el build del frontend. No exponer PostgreSQL como servicio de Railway ni desactivar RLS/TLS para resolver errores. Revisar conexiones admitidas y permisos en Supabase.
7. Registrar fecha, operador, repositorio, rama, SHA y deployment ID de cada plataforma. Con datos ficticios, comprobar login, perfil, una operación permitida y una denegada; guardar resultados sanitizados. GET / del backend solo es comprobación básica, no prueba completa de PostgreSQL. No ejecutar ataques ni pruebas destructivas contra el ambiente original.

## Evidencia disponible y pendiente

El equipo aportó URL frontend, repos originales y plataformas. Se conservan pruebas y CI de la copia SSDLC; no prueban qué SHA ejecutan Vercel/Railway. Para cerrar 6.2: capturas sin secretos de raíz/build/start y enlaces/IDs de despliegue, configuración por nombre y reproducción revisada. Para 6.3 o 6.5 haría falta además verificar identidad y funcionamiento del despliegue; no se declaran elegidos ni completados aquí.

## Recuperación

Antes de cambios, conservar deployment IDs y SHA de frontend/backend, configuración protegida y respaldo consistente de PostgreSQL. Volver al despliegue previo mediante la plataforma y repetir las comprobaciones. La reversión de la aplicación no revierte migraciones ni datos: ante incompatibilidad, detener escrituras y aplicar el plan de restauración aprobado. No se ejecutó ni se atribuye una reversión en esta entrega.

## Configuración alternativa

deploy/compose.yaml es una propuesta opcional local/VPS; no describe el alojamiento real. No forma parte de una evidencia de despliegue ejecutado.

## Referencias de procedimiento

- Vercel Git y monorepos: https://vercel.com/docs/git y https://vercel.com/docs/monorepos
- Railway monorepos: https://docs.railway.com/deployments/monorepo
- Railway healthchecks: https://docs.railway.com/deployments/healthchecks
