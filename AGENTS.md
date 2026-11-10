# ResDigital SSDLC

Aplicaciones independientes en backend/ (NestJS) y frontend/ (Next.js). Se conservan sus lockfiles; no ejecutar instalaciones recursivas como workspace. Leer las instrucciones de cada aplicación antes de modificarla.

Los comandos comunes están en README.md. Nunca leer ni publicar valores de archivos .env, certificados, logs o credenciales. Los cambios requieren PR a development y revisión de otro integrante. No desactivar checks para conseguir una ejecución aprobada.

Los workflows activos están únicamente en .github/workflows/ de la raíz. Las configuraciones heredadas dentro de backend/.github/ y frontend/.github/ se conservan como referencia y no se ejecutan automáticamente. Consultar docs/ssdlc/MIGRACION-MONOREPO.md antes de modificar gobernanza, hooks o releases.
