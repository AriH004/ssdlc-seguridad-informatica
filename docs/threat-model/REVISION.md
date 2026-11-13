# Revisión pendiente del modelo

El [catálogo estructurado](threat-model.draft.json) conserva las nueve amenazas y medidas de [la base de conocimiento](../kb/amenazas.md), sin elevar estados ni atribuir aprobación. Es un borrador de IA, **no un archivo importable ni un export de Threat Dragon**. Según el README de esta carpeta, Ariana dibuja y exporta el modelo oficial. No se fabrica esa evidencia.

Validar arquitectura, prioridades y medidas; representar navegador, frontend, API, Auth, PostgreSQL y Storage con tres zonas de confianza y los siete flujos de arquitectura-y-acceso.md. Asociar T-01 a base/API, T-02 a T-04 y T-06 a API, T-05 a API/credenciales, T-07 a Storage, T-08 a Auth/API y T-09 a auditoría.

Para cerrar 1.3, guardar threat-model.json desde OWASP Threat Dragon y su imagen exportada, comprobar apertura y registrar versión de herramienta, commit y revisor. Para 1.4, revisar D-01 a D-05 y la aceptación de riesgo T-09: la fecha previa (12/nov/2026) venció y no demuestra aprobación; responsable debe registrar decisión y nueva fecha.

Referencia de formato oficial: [esquemas de OWASP Threat Dragon](https://github.com/OWASP/threat-dragon/tree/main/td.vue/src/assets/schema).
