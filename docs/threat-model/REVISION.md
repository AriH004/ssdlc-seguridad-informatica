# Revisión final del modelo

Se preparó threat-model.candidate.json en la estructura legacy v1 documentada por OWASP, con seis componentes, siete flujos, tres límites de confianza y nueve amenazas. Es un candidato generado con asistencia de IA por solicitud de completar la entrega, no un export desde Threat Dragon ni una aprobación humana.

Para cerrar 1.3, abrir/importar el candidato en OWASP Threat Dragon, revisar su migración/representación, corregir si hace falta y guardar como threat-model.json; exportar el diagrama desde la herramienta. La imagen explicativa de la entrega no sustituye esa comprobación. Registrar versión utilizada y revisión de Danny sobre la propuesta de Ariana. No se declara esa operación realizada.

T-01 a T-09 mantienen la priorización de docs/kb/amenazas.md. Todas las amenazas se dejan abiertas en el candidato para no equiparar evidencia parcial de medidas con eliminación del riesgo. M-02 y M-08 conservan evidencia histórica en 4.5/4.9; las otras medidas conservan sus límites. D-01 a D-05 y T-09 no se resuelven por inferencia; requieren decisión de Ariana y revisión.

Formato consultado: https://github.com/OWASP/threat-dragon/blob/main/td.vue/src/assets/schema/threat-dragon-v1.schema.json y modelo de ejemplo oficial ThreatDragonModels/demo-threat-model.json. Compatibilidad de apertura no verificada en esta sesión.
