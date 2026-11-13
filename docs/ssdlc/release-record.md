# Registro de candidato — 5.1

Commit evaluado: `cb9fd80ca120f8fd97d4ce7085d601f35fcf5c50` (development).

[CI de integración y publicación](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43477589260). Cambios incluidos: integración de evidencias de pruebas, ambiente aislado y actualización NestJS; consultar el historial de ese commit para el detalle. Este registro describe el candidato anterior a este PR documental; los checks del PR no se atribuyen a estas imágenes.

- backend: `dannyor94/resdigital-backend@sha256:542f6015a0c39b7e064966846adf85cba1a06ccca122a4cc206dabe8e39dd2b6`; [registro conservado](evidencia/5.5/backend-published.json).
- frontend: `dannyor94/resdigital-frontend@sha256:163fd9f65caaa3684aa0bea82f03be104d8a82575c570c5c6a5f6f1db7230158`; [registro conservado](evidencia/5.5/frontend-published.json).

[Registro estructurado](release-record.json). Reportes de seguridad y autorización: artefactos security-reports-cb9fd80ca120f8fd97d4ce7085d601f35fcf5c50 y authz-report-cb9fd80ca120f8fd97d4ce7085d601f35fcf5c50 de la ejecución. Los candidatos expiran el 20/nov/2026 y los registros publicados el 13/dic/2026; se conservan aquí ambos registros JSON. No confundir el digest del ZIP de Actions con el digest de una imagen.

Estado: **parcial, sin aprobación humana registrada aquí**. Faltan enlaces a SBOM y análisis Trivy de las imágenes; no aparecen en el workflow inspeccionado. No hay evidencia de despliegue ni E2E autenticados en el ambiente destino. 5.1 no se declara completo hasta reunir esas referencias.

Atención: publish depende de quality, security, dependencies, migration-replay e images, pero no de authz-tests; Monorepo required sí lo incluye. Documentar y revisar esta brecha antes de considerar el gate suficiente para publicar versiones aprobadas.
