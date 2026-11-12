# ResDigital SSDLC

Aplicaciones independientes en backend/ (NestJS) y frontend/ (Next.js). Se conservan sus lockfiles; no ejecutar instalaciones recursivas como workspace. Leer las instrucciones de cada aplicación antes de modificarla.

Los comandos comunes están en README.md. Nunca leer ni publicar valores de archivos .env, certificados, logs o credenciales. Los cambios requieren PR a development y revisión de otro integrante. No desactivar checks para conseguir una ejecución aprobada.

Los workflows activos están únicamente en .github/workflows/ de la raíz. Las configuraciones heredadas dentro de backend/.github/ y frontend/.github/ se conservan como referencia y no se ejecutan automáticamente. Consultar docs/ssdlc/MIGRACION-MONOREPO.md antes de modificar gobernanza, hooks o releases.

## Contexto del Proyecto y Dónde Consultar (Ítems 1.8 y 2.1)
Antes de modificar cualquier funcionalidad o flujo crítico, el desarrollador o agente DEBE revisar:
- **Flujos de negocio y reglas de dominio:** `docs/kb/flujos.md` (F-01 a F-03: autenticación, tratamientos y trazabilidad).
- **Arquitectura, componentes y matriz de roles:** `docs/kb/arquitectura-y-acceso.md` (matriz de permisos por rol y rutas).
- **Modelo de amenazas STRIDE y medidas:** `docs/kb/amenazas.md` (amenazas T-01 a T-09 y medidas M-01 a M-09).
- **Dudas de implementación y decisiones abiertas:** `docs/kb/dudas.md`.
- **Gestión de terceros y secretos:** `docs/kb/terceros-y-secretos.md`.
- **Verificación local obligatoria:** `bash scripts/verify.sh` o `pnpm run check:security` / `pnpm run agent:verify`.

## Reglas de Codificación Segura y Acceso a Datos (Aprendizaje Ciclo 7.8)
- Prohibida terminantemente la concatenación o interpolación directa de variables en consultas SQL (`EntityManager.query`, `queryRunner.query`, o QueryBuilder sin parámetros). Toda consulta dinámica DEBE usar parámetros vinculados posicionales (`$1, $2, ...`) o nombrados (`:param`) para mitigar inyecciones SQL y preservar el aislamiento multitenant (M-01 / T-01).
- Toda vulnerabilidad en dependencias debe ser corregida o documentada formalmente en `osv-scanner.toml` referenciando un identificador de excepción `E-xx` registrado en `docs/ssdlc/REGISTRO-HALLAZGOS.md`.

