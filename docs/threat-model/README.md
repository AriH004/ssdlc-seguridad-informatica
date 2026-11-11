# Modelo de amenazas en OWASP Threat Dragon (ítem 1.3)

El dibujo y el archivo JSON los hace **una persona** (Ariana); la IA solo deja el borrador y la tabla de amenazas.

## Pasos

1. Abre OWASP Threat Dragon (aplicación de escritorio o versión web).
2. Crea un modelo nuevo: **ResDigital**, con el modelo STRIDE.
3. Dibuja el diagrama de flujo de datos con los elementos de [`../kb/arquitectura-y-acceso.md`](../kb/arquitectura-y-acceso.md):
   - Actor externo: Usuario (navegador).
   - Procesos: Frontend (Next.js), Backend (NestJS).
   - Almacenes: PostgreSQL con RLS, Supabase Storage.
   - Servicio externo: Supabase Auth.
   - Fronteras de confianza: navegador | aplicación | servicios gestionados.
4. Agrega las amenazas de [`../kb/amenazas.md`](../kb/amenazas.md) (`T-01` a `T-09`), cada una asociada al elemento que afecta, con la categoría STRIDE, la prioridad y la medida `M-xx`.
5. Guarda el modelo como **`docs/threat-model/threat-model.json`** y expórtalo también como imagen para la entrega.
6. Verifica que el JSON no tenga secretos ni datos reales antes de hacer commit.

## Mínimos de la rúbrica

- Al menos 3 amenazas (aquí hay 9), cada una con recurso, impacto y prioridad justificada.
- Cada amenaza prioritaria con decisión (mitigar o posponer con quién acepta el riesgo y cuándo se revisa), medida, comprobación prevista y responsable.

## Borrador del diagrama

Está en Mermaid en `docs/kb/arquitectura-y-acceso.md`. El JSON de Threat Dragon es la versión oficial para la defensa.
