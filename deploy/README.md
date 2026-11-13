# Configuración propuesta de despliegue

Consultar [ambiente y procedimiento](../docs/ssdlc/despliegue.md). compose.yaml no construye imágenes y solo publica puertos en loopback. Requiere un proxy HTTPS en el host y servicios Supabase separados. No ejecutar en producción como parte de esta entrega documental. Las referencias BACKEND_IMAGE y FRONTEND_IMAGE deben copiarse completas por digest desde un registro aprobado; Compose exige presencia, pero no valida su sintaxis ni aprobación.
