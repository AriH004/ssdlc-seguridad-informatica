# Aprendizaje al Siguiente Ciclo de Desarrollo (Ítem 7.8 — Demostración D6)

**Responsable:** Cristhian (`crissXcoder`)  
**Fecha:** 2026-11-12  
**Marco Metodológico:** OWASP SAMM v2 (Defect Management — Stream B: Metrics & Feedback) y NIST SSDF v1.1 (RV.3.2: Prevent Vulnerability Recurrence)  
**Registro de Hallazgo Vinculado:** [Issue #33: [HALLAZGO] Inyección SQL por concatenación en consultas directas a base de datos (Demo D2 / D6)](https://github.com/AriH004/ssdlc-seguridad-informatica/issues/33)  
**Pull Request de Demostración:** [PR #32: [DEMO D2] Bloqueo de integracion por inyeccion SQL (Semgrep CE)](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32)

---

## 1. Resumen Ejecutivo y Marco Teórico

El estándar **OWASP SAMM v2** en su práctica de *Defect Management* establece que la madurez de un ciclo de vida de desarrollo seguro (SSDLC) no se mide únicamente por la capacidad de detectar y corregir defectos puntuales, sino por la existencia de un **bucle de retroalimentación cerrado (feedback loop)** que transforme cada hallazgo confirmado en:
1. **Controles preventivos upstream:** Directrices de codificación segura para desarrolladores y agentes de IA en etapas tempranas (Shift-Left).
2. **Controles detectivos automatizados:** Reglas de análisis estático (SAST) y pruebas de regresión en las compuertas de integración (Quality/Security Gates).
3. **Actualización de la base de conocimiento:** Refinamiento del modelo de amenazas y registros de auditoría.

Este documento formaliza el ciclo de mejora continua correspondiente a la **Demostración D6**, documentando cómo el hallazgo real de inyección SQL (Demo D2) se investigó mediante un análisis de causa raíz y alimentó directamente las verificaciones, gobernanza y directivas del siguiente ciclo de desarrollo de ResDigital.

---

## 2. Caso de Estudio: Hallazgo Real H-33 (Demo D2)

### 2.1 Descripción de la Vulnerabilidad
En el módulo de animales (`backend/src/animales/animales.service.ts`), se introdujo un método de consulta directa a la base de datos para recuperar animales por finca:

```typescript
// Código vulnerable (Commit 092d567)
async demoInyeccionSqlConcatenada(
  manager: EntityManager,
  idFinca: string,
): Promise<Animal[]> {
  return manager.query(
    "SELECT * FROM animal WHERE \"tenantId\" = '" + idFinca + "'",
  );
}
```

- **Clasificación:** CWE-89 (Improper Neutralization of Special Elements used in an SQL Command).
- **OWASP Top 10:** A03:2021 — Injection.
- **Severidad:** **Alta**.

### 2.2 Impacto Específico en la Arquitectura ResDigital
ResDigital es una plataforma SaaS ganadera multitenant. La seguridad de la información reposa en el estricto aislamiento de los datos entre diferentes fincas (`tenantId`). Si un atacante envía como `idFinca` una carga útil como `' OR '1'='1`, la consulta resultante se convierte en:

```sql
SELECT * FROM animal WHERE "tenantId" = '' OR '1'='1'
```

Esto **evade completamente la cláusula de inquilino**, permitiendo que un usuario de la finca A visualice el inventario, tratamientos y registros sanitarios de todas las demás fincas de la base de datos, materializando la amenaza central **T-01** (Salto de aislamiento multitenant) del modelo de amenazas.

### 2.3 Evidencia de Detección y Remediación en CI
1. **Detección y Bloqueo:** Al abrir el [PR #32](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32), el pipeline de GitHub Actions ([Run 43148785557](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43148785557)) ejecutó el contenedor de Semgrep CE, detectando la violación de la regla `resdigital-sql-concatenation` y bloqueando la integración con código de salida `1` en `Security gates` y `Monorepo required`.
2. **Remediación Segura:** En el commit `60142d2`, se implementó el uso de parámetros vinculados (`$1`), delegando el saneamiento y tipado al motor de base de datos PostgreSQL:
   ```typescript
   // Código seguro remediado (Commit 60142d2)
   async demoInyeccionSqlConcatenada(
     manager: EntityManager,
     idFinca: string,
   ): Promise<Animal[]> {
     return manager.query(
       'SELECT * FROM animal WHERE "tenantId" = $1',
       [idFinca],
     );
   }
   ```
3. **Paso a Verde:** La reevaluación en GitHub Actions ([Run 43150246422](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43150246422)) aprobó todos los checks obligatorios en 41 segundos, exportando el reporte SARIF en limpio.

---

## 3. Análisis de Causa Raíz (RCA — Los 5 Porqués)

Para asegurar que el aprendizaje no sea superficial, se aplicó la técnica de los **Cinco Porqués (5 Whys)**:

```
[1] ¿Por qué ocurrió la vulnerabilidad en el código?
    └── Porque se concatenó directamente el valor de entrada 'idFinca' en la cadena SQL.

[2] ¿Por qué se concatenó en lugar de parametrizar?
    └── Porque al escribir consultas directas sin el QueryBuilder de TypeORM, se asumió
        incorrectamente que la interpolación directa era admisible para valores simples.

[3] ¿Por qué no se previno la práctica antes de escribir el código?
    └── Porque las directrices operativas del proyecto (AGENTS.md) no instruían explícitamente
        al desarrollador ni al agente de IA sobre la prohibición de consultas raw no parametrizadas.

[4] ¿Por qué no se detectó localmente antes del commit o pull request?
    └── Porque la regla de Semgrep no estaba integrada formalmente en el hook local
        de parada del agente (agent:verify / scripts/verify.sh) ni existía verificación obligatoria pre-push.

[5] ¿Por qué el defecto llegó a ser crítico?
    └── Porque el sistema carecía de un vínculo formal entre las reglas SAST automáticas
        y la medida M-01 del modelo de amenazas (T-01), asumiendo que RLS por sí solo
        compensaba errores en consultas dinámicas.
```

---

## 4. Mejoras Incorporadas al Siguiente Ciclo de Desarrollo

A partir del análisis anterior, se implementaron cuatro mejoras permanentes en el repositorio:

### Mejora 1: Gobernanza y Directivas de Codificación Segura (`AGENTS.md`)
Se incorporó en [`AGENTS.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/AGENTS.md) una directriz estricta para el agente de codificación y para los desarrolladores humanos:

> **Reglas de Codificación Segura y Acceso a Datos (Aprendizaje Ciclo 7.8):**
> - Prohibida terminantemente la concatenación o interpolación directa de variables en consultas SQL (`EntityManager.query`, `queryRunner.query`, o QueryBuilder sin parámetros). Toda consulta dinámica DEBE usar parámetros vinculados posicionales (`$1, $2, ...`) o nombrados (`:param`) para mitigar inyecciones SQL y preservar el aislamiento multitenant (M-01 / T-01).
> - Toda vulnerabilidad en dependencias debe ser corregida o documentada formalmente en `osv-scanner.toml` referenciando un identificador de excepción `E-xx` registrado en `docs/ssdlc/REGISTRO-HALLAZGOS.md`.

*Efecto preventivo:* Cualquier agente o desarrollador que consulte el contexto del proyecto conocerá de antemano la restricción, evitando la generación de patrones inseguros.

### Mejora 2: Regla SAST en Compuerta de Integración (`resdigital-sql-concatenation`)
Se codificó de forma permanente la regla de Semgrep CE en `.semgrep/resdigital-rules.yaml`:

```yaml
rules:
  - id: resdigital-sql-concatenation
    message: "Posible inyección SQL: se detectó una consulta construida mediante concatenación directa de cadenas. Utilice parámetros vinculados ($1, $2, etc.) en lugar de concatenar entradas."
    severity: ERROR
    languages: [typescript, javascript]
    paths:
      include:
        - backend/src/
      exclude:
        - backend/src/database/migrations/
        - backend/src/test-utils/
        - "**/*.spec.ts"
        - "**/*.test.ts"
    patterns:
      - pattern-either:
          - pattern: $QR.query($X + $Y, ...)
          - pattern: $QR.query(`...${$X}...`, ...)
          - pattern: $EM.query($X + $Y, ...)
          - pattern: $EM.query(`...${$X}...`, ...)
          - pattern: $REPO.query($X + $Y, ...)
          - pattern: $REPO.query(`...${$X}...`, ...)
```

*Efecto detectivo:* Se ejecuta en cada Pull Request y push en GitHub Actions (`ci.yml`) con `--severity=ERROR --error`, impidiendo que código con este defecto pueda fusionarse a `development` o `main`.

### Mejora 3: Actualización del Modelo de Amenazas (`docs/kb/amenazas.md`)
Se actualizó la medida defensiva **M-01** (asociada a la amenaza **T-01: Salto de aislamiento multitenant**), explicitando que el aislamiento relacional no depende únicamente de las políticas de RLS en base de datos, sino de la prohibición de consultas dinámicas no parametrizadas, respaldada por la comprobación estática de Semgrep CE.

### Mejora 4: Afinación (Tuning) y Supresión Controlada de Falsos Positivos
Durante la integración de Semgrep y OSV-Scanner en CI, se identificó que la regla alertaba sobre sentencias DDL en migraciones (`ALTER TABLE`) y fixtures de pruebas. Como aprendizaje metodológico:
1. Se ajustó `.semgrepignore` y la directiva `paths.exclude` para acotar el análisis al código fuente de negocio en tiempo de ejecución.
2. Se formalizó la estructura de excepciones temporales en `osv-scanner.toml` para las 57 dependencias heredadas del monorepo, asegurando que nuevas vulnerabilidades sean bloqueadas sin paralizar el pipeline por deuda técnica previa.

---

## 5. Matriz de Trazabilidad del Ciclo

| Componente | Antes del Aprendizaje | Después del Aprendizaje (Mejora 7.8) |
|---|---|---|
| **Instrucciones del Agente (`AGENTS.md`)** | Sin mención a políticas de consultas SQL raw. | Directiva explícita de parametrización obligatoria y parámetros vinculados posicionales. |
| **Compuerta SAST en CI (`ci.yml`)** | Sin análisis estático personalizado para SQLi. | Regla `resdigital-sql-concatenation` bloqueante con severidad `ERROR`. |
| **Modelo de Amenazas (`amenazas.md`)** | Medida M-01 enfocada únicamente en RLS. | Medida M-01 fortalecida con validación SAST contra bypass de `tenantId`. |
| **Gestión de Hallazgos (`REGISTRO-HALLAZGOS.md`)** | Solo hallazgos iniciales de migración (H-2 a H-4). | Incorporación formal de H-33 con ciclo completo de verificación y remediación. |
| **Ejecución Local (`verify.sh`)** | Solo linting, typechecking y Gitleaks. | Soporte unificado para `check:semgrep` y escaneo de dependencias OSV. |

---

## 6. Conclusión

El ciclo de aprendizaje derivado del hallazgo H-33 demuestra la aplicación práctica de un SSDLC maduro: el defecto no se quedó como un parche aislado en una rama de demo, sino que generó políticas operativas ejecutables, reglas de análisis estático en CI, ajustes al modelo de amenazas y salvaguardas documentadas para prevenir de manera sistemática cualquier recurrencia en futuros ciclos de desarrollo.
