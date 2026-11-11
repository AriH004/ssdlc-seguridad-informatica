# Terceros y secretos (ítem 1.5)

**No se escribe ningún valor.** Las dependencias exactas están en `backend/package.json`, `frontend/package.json` y sus lockfiles; aquí no se copia ese inventario.

## Servicios externos

| Servicio | Función | Datos que recibe | Riesgos y tratamiento |
|---|---|---|---|
| Supabase Auth | Identidad, registro e inicio de sesión | Correos, contraseñas (solo las ve Supabase), JWT | Si cae, nadie entra. La app nunca guarda contraseñas ni hashes. |
| Supabase PostgreSQL | Base de datos con RLS | Todos los datos de dominio | Rol de la app sin `BYPASSRLS`; credencial de la base rotable (runbook de rotación). |
| Supabase Storage | Documentos de animales | PDF e imágenes de las fincas | Bucket privado; sin políticas públicas. |
| GitHub | Repositorio, PR y CI | Código y reportes | Repo público: nunca secretos reales; protección de ramas y revisión cruzada. |
| Docker Hub | Almacenar imágenes aprobadas | Imágenes sin secretos | Token con permisos mínimos; la publicación sin secretos termina en `INCOMPLETO`. |
| Proveedor de IA | Asistencia de desarrollo | Fragmentos de código | No se envían secretos ni datos reales; revisión humana de lo generado. |

## Dependencias críticas

Framework y seguridad del backend: NestJS, TypeORM, `jose` (verificación de JWT), `helmet`, `express-rate-limit`, `class-validator` y `zod`. Frontend: Next.js, `@supabase/ssr` y TanStack Query. Se vigilan con revisión de dependencias en CI, Dependabot y la auditoría semanal; OSV-Scanner se agrega en 3.2.

## Secretos (sin valores)

| Secreto | Propósito | Quién lo consume | Permisos | Responsable | Ubicación prevista |
|---|---|---|---|---|---|
| `DATABASE_URL` | Conexión de la app a PostgreSQL | Backend | Rol `resdigital_app`, sin `BYPASSRLS` | Cristhian | Variable de entorno del despliegue |
| `DATABASE_CA_CERT` | Certificado CA para la conexión | Backend | Solo lectura | Cristhian | Variable de entorno |
| `SUPABASE_URL` | Dirección del proyecto | Backend y frontend | Pública | Cristhian | `.env.example` (nombre) |
| `SUPABASE_ANON_KEY` | Clave pública de Supabase | Backend y frontend | Limitada por RLS | Cristhian | Variable de entorno |
| `SUPABASE_SERVICE_ROLE_KEY` | Acceso administrativo a Supabase | Backend (invitaciones) | **Total, salta RLS** | Cristhian | Variable de entorno protegida; nunca en el repo |
| `SUPABASE_JWT_SECRET` | Verificación del JWT | Backend | Alto | Cristhian | Variable de entorno |
| `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` | Publicar imágenes | CI (`release`) | Token de mínimo privilegio | Danny | Secretos de GitHub Actions |

Nota: la `service_role` y la contraseña de la base ya se filtraron una vez en el proyecto base. Si alguna vez se confirma una exposición, **se rota o revoca**; eliminarla del archivo no basta.
