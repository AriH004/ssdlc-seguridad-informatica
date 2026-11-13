# Configuración alternativa local o VPS

El ambiente real reportado es Vercel + Railway + Supabase. Consultar [documentación de ambiente real](../docs/ssdlc/despliegue.md). compose.yaml conserva únicamente una alternativa de pruebas, no el despliegue activo ni evidencia de su ejecución. No construye imágenes y solo expone puertos en loopback; necesita proxy HTTPS si se usa remotamente. Las referencias de imagen deben copiarse por digest de un registro aprobado; Compose exige presencia, no valida aprobación ni sintaxis del digest.
