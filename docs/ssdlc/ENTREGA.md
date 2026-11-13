# Entrega final SSDLC de ResDigital

Fecha: 13 de noviembre de 2026. Universidad Nacional de Costa Rica. Curso Seguridad Informática.

## Contexto y alcance

Se reutilizó ResDigital, un proyecto existente desplegado con frontend en Vercel, API en Railway y PostgreSQL en Supabase. Los controles SSDLC se trabajaron en una copia independiente: https://github.com/AriH004/ssdlc-seguridad-informatica. Repos originales: https://github.com/crissXcoder/ResDigital_frontend y https://github.com/crissXcoder/ResDigital_backend. Aplicación: https://res-digital-frontend.vercel.app/login.

La existencia de la aplicación original no acredita que los cambios o imágenes de la copia SSDLC estén instalados allí. El commit desplegado del proyecto original y la URL del backend no se aportaron en esta sesión. Se conserva la distinción en las evidencias.

Equipo de tres integrantes autorizado por el docente según confirmación de Ariana. No se adjunta resolución docente. Se consolidan 12 ítems distintos, cuatro por integrante, repartidos entre las siete etapas. La selección no implica que todos estén completos: cada estado se presenta con su límite y evidencia. Los revisores son asignaciones; no se atribuye aprobación por el mero hecho de figurar en esta matriz.

## Personas y revisión cruzada

| Integrante | GitHub | Revisor asignado |
|---|---|---|
| Ariana | AriH004 | Danny |
| Cristhian | crissXcoder | Ariana |
| Danny Orlando Abarca Alvarado | DannyOr94 | Cristhian |

## Selección y evidencia

El ítem 3.1 se cuenta una sola vez bajo responsabilidad de Danny, con aportes compartidos de integración y seguridad. 5.1 queda como documentación de apoyo, no como un ítem adicional seleccionado. El alcance de 6.2 corresponde a documentar el ambiente existente, no a afirmar un nuevo despliegue automático.

| Responsable | Ítem | Entregable | Revisor | Estado y límite | Evidencia |
|---|---|---|---|---|---|
| Ariana | 1.3 | Amenazas STRIDE | Danny | Parcial: candidato; falta apertura y export de Threat Dragon | [docs/threat-model/REVISION.md](../../docs/threat-model/REVISION.md) |
| Ariana | 1.4 | Medidas y comprobaciones | Danny | Documentado; validación humana y T-09 pendientes | [docs/ssdlc/evidencia/1.4/README.md](../../docs/ssdlc/evidencia/1.4/README.md) |
| Ariana | 4.5 | Autorización directa API | Danny | Evidencia disponible; servicios simulados, RLS real fuera de suite | [docs/ssdlc/evidencia/4.5/README.md](../../docs/ssdlc/evidencia/4.5/README.md) |
| Ariana | 4.9 | Defecto y corrección | Danny | Evidencia local; no confundir con demo remota | [docs/ssdlc/evidencia/4.9/README.md](../../docs/ssdlc/evidencia/4.9/README.md) |
| Cristhian | 2.4 | Wrapper y reintentos | Ariana | Implementado y pruebas conservadas | [docs/ssdlc/evidencia/2.4/README.md](../../docs/ssdlc/evidencia/2.4/README.md) |
| Cristhian | 3.2 | SAST SCA y secretos | Ariana | CI ejecutado; excepciones requieren revisión vigente | [docs/ssdlc/evidencia/3.2/README.md](../../docs/ssdlc/evidencia/3.2/README.md) |
| Cristhian | 3.6 | Bloqueo de integración | Ariana | Bloqueo por SCA verificado; detección SQLi no probada por ese run | [docs/ssdlc/evidencia/3.6/ACLARACION.md](../../docs/ssdlc/evidencia/3.6/ACLARACION.md) |
| Cristhian | 7.8 | Aprendizaje del ciclo | Ariana | Instrucciones de parametrización y trazabilidad; revisar relato demo | [docs/ssdlc/evidencia/7.8/README.md](../../docs/ssdlc/evidencia/7.8/README.md) |
| Danny | 3.1 | CI reproducible | Cristhian | Workflow y ejecuciones verificables; aporte compartido | [.github/workflows/ci.yml](../../.github/workflows/ci.yml) |
| Danny | 5.5 | Publicación de candidatos | Cristhian | Publicación con digests; despliegue original no vinculado | [docs/ssdlc/evidencia/5.5/README.md](../../docs/ssdlc/evidencia/5.5/README.md) |
| Danny | 6.2 | Ambiente y configuración | Cristhian | Plataformas y procedimiento documentados; falta reproducción revisada | [docs/ssdlc/despliegue.md](../../docs/ssdlc/despliegue.md) |
| Danny | 7.5 | Registro único | Cristhian | Issues y procedimiento; no se exige cerrar todos para este ítem | [docs/ssdlc/REGISTRO-HALLAZGOS.md](../../docs/ssdlc/REGISTRO-HALLAZGOS.md) |

## Demostración integrada

1. Mostrar los tres flujos F-01 autenticación/invitaciones, F-02 tratamientos y F-03 aislamiento entre fincas, su matriz de permisos y amenazas.
2. Mostrar el wrapper de verificación y sus reintentos; explicar resultado aprobado frente a incompleto y bloqueo que requiere intervención humana.
3. Abrir el workflow y sus ejecuciones. Para la demo 3.6, indicar que el fallo verificado fue SCA y no atribuir a Semgrep un análisis omitido. No fusionar #32.
4. Mostrar evidencia 4.5 (182 pruebas de autorización) y los resultados locales fallidos/corregidos de 4.9. La suite de autorización simula servicios: no demuestra por sí sola RLS en PostgreSQL.
5. Abrir el registro candidato y ambos JSON de publicación; explicar SHA del código frente a digest de imagen. Mostrar ambiente Vercel/Railway/Supabase por separado.
6. Abrir un hallazgo, sus relaciones y el aprendizaje incorporado en AGENTS.md. El registro puede contener hallazgos abiertos sin dejar de cumplir su función.

## Versiones y resultados comprobados

- PR #12: integrado, commit 508e957995ff349eea2a222465dff31f8e00fe13. Run 43085152364 success, publicación incluida. Respalda el informe individual de Danny del 12/nov.
- Commit cb9fd80ca120f8fd97d4ce7085d601f35fcf5c50 de development: run 43477589260 success. Ambos registros publicados se conservan en evidencia/5.5. Ver release-record.md para digests y límites.
- PR #38: run 43480453407 aprobado; fusionado a development en d80ff9e5af2a278f82586014011e951413e2addb. PR #37 fue fusionado a main en 1bf7d8ed9b090394acb582ad3c43a8fd1adff94c. No se atribuye a main contenido incorporado después a development.
- El PR final que incorpora este documento exige nueva revisión y CI del SHA actual. No hereda la aprobación del PR #38.

## Limitaciones y cierre humano

- Abrir, revisar y guardar el candidato en Threat Dragon y exportar diagrama; mientras no se haga, 1.3 permanece parcial.
- Validar las decisiones D-01 a D-05 y registrar tratamiento vigente de T-09; no se inventa aceptación del riesgo.
- Confirmar configuración efectiva y commit activo de Vercel/Railway. El ambiente existente no se modifica ni se prueba destructivamente para esta entrega.
- No se encontró SBOM/Trivy de las imágenes en el workflow inspeccionado; no se declara 3.3 implementado ni se completa 5.1 por tener solo digests.
- Las excepciones de dependencias y Gitleaks deben conservar responsable, revisión y vencimiento. CI verde no implica ausencia de vulnerabilidades ni aprobación humana de todas las excepciones.
- El gate de publicación se reforzó en el PR final para esperar authz-tests; necesita revisión humana y verificación del mismo commit.

## Enlaces de revisión

- Repositorio: https://github.com/AriH004/ssdlc-seguridad-informatica
- PR #12: https://github.com/AriH004/ssdlc-seguridad-informatica/pull/12
- PR #32 de demostración, sin fusionar automáticamente: https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32
- PR #37: https://github.com/AriH004/ssdlc-seguridad-informatica/pull/37
- PR #38: https://github.com/AriH004/ssdlc-seguridad-informatica/pull/38
- CI documentación: https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43480453407
- Registro de hallazgos: https://github.com/AriH004/ssdlc-seguridad-informatica/issues

El informe individual de Danny complementa la entrega grupal. Sus referencias locales no publicadas no se presentan aquí como archivos disponibles en el repositorio. Las capturas generales de Docker Hub no sustituyen los registros de digest conservados.
