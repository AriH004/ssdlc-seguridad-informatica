# Aclaración verificada de la demo 3.6

El 13/nov/2026 se contrastaron por API los pasos del run 43148785557 con run-43148785557-falla.txt. El paso fallido fue OSV-Scanner (SCA dependencies); Semgrep CE quedó skipped. Monorepo required falló y publish quedó skipped. Esto prueba bloqueo de CI por un control fallido, pero no detección SQLi por Semgrep en esa ejecución. El relato previo que atribuye ese fallo a Semgrep queda corregido por esta aclaración.

El run 43150246422 muestra una ejecución posterior aprobada; no se atribuye la corrección del fallo previo a una causa que los registros no demuestren. PR #32 se conserva como demostración separada, sin fusionar automáticamente. La validación completa de la regla SQLi necesita una ejecución controlada donde Semgrep sí corra y reporte el patrón. No se introdujo código vulnerable en development para producirla.

Fuente: https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43148785557 y artefacto de texto versionado en esta carpeta.
