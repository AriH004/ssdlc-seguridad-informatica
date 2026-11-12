# Evidencia: Demostración de Bloqueo de Integración (Ítem 3.6 — Demo D2)

**Responsable:** Cristhian (`crissXcoder`)  
**Fecha:** 2026-11-12  
**Pull Request de Demostración:** [PR #32: [DEMO D2] Bloqueo de integracion por inyeccion SQL (Semgrep CE)](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32)  
**Rama de defecto:** `demo/cris-d2`  
**Rama base destino:** `development`

---

## 1. Objetivo y Criterios de la Demostración

Demostrar de forma controlada y auditable que las puertas de seguridad implementadas en el pipeline de Integración Continua (CI) bloquean efectivamente la integración de código vulnerable, evitando que cualquier defecto de seguridad ingrese a las ramas protegidas (`development` y `main`), y que una vez remediado el defecto mediante prácticas seguras, el pipeline evalúa nuevamente el cambio y permite la integración en verde.

### Matriz de Defecto Controlado (D2)
- **Tipo de Defecto:** Inyección SQL (CWE-89 / OWASP Top 10 A03:2021 - Injection).
- **Herramienta Detectora:** Semgrep CE (regla SAST personalizada `resdigital-sql-concatenation` en `.semgrep/resdigital-rules.yaml`).
- **Nivel de Severidad:** `ERROR` (Bloqueo obligatorio según `docs/ssdlc/politica-de-bloqueo.md`).

---

## 2. Inyección del Defecto Controlado

En el commit `092d567`, se introdujo en `backend/src/animales/animales.service.ts` el método `demoInyeccionSqlConcatenada` con una vulnerabilidad de concatenación directa de parámetros en una sentencia SQL:

```typescript
// backend/src/animales/animales.service.ts (Commit 092d567)
async demoInyeccionSqlConcatenada(
  manager: EntityManager,
  idFinca: string,
): Promise<Animal[]> {
  // VULNERABLE: Concatenación directa de cadenas en SQL
  return manager.query(
    "SELECT * FROM animal WHERE \"tenantId\" = '" + idFinca + "'",
  );
}
```

---

## 3. Evidencia de Bloqueo en CI (Ejecución Fallida)

Al abrir el [PR #32](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32), GitHub Actions disparó el workflow `Monorepo CI` asociado al commit `092d567`:

- **ID de Ejecución Remota:** `43148785557`
- **URL de Ejecución:** [https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43148785557](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43148785557)
- **Resultado del Job `Security gates (SAST, SCA, Secrets)`:** `FAILURE` (código de salida `1`).
- **Resultado del Job `Monorepo required`:** `FAILURE` (código de salida `1` al no cumplirse la totalidad de los checks obligatorios).
- **Estado del Pull Request:** **BLOQUEADO**. El botón de merge queda deshabilitado por fallo en los checks requeridos según la política de branch protection configurada en `scripts/setup/branch-protection.sh`.

---

## 4. Remediación del Defecto

En el commit `60142d2`, se implementó la corrección técnica recomendada en el SSDLC: parametrización de consultas mediante parámetros vinculados (`$1`), eliminando cualquier concatenación de variables en la instrucción SQL:

```typescript
// backend/src/animales/animales.service.ts (Commit 60142d2)
async demoInyeccionSqlConcatenada(
  manager: EntityManager,
  idFinca: string,
): Promise<Animal[]> {
  // SEGURO: Parámetros vinculados ($1)
  return manager.query(
    'SELECT * FROM animal WHERE "tenantId" = $1',
    [idFinca],
  );
}
```

Adicionalmente, se actualizaron las excepciones base en `osv-scanner.toml` conforme a la política de bloqueo documentada en `docs/ssdlc/politica-de-bloqueo.md` (Ítem 3.2), asegurando que todas las herramientas del gate de seguridad ejecuten en orden y validen tanto SAST como SCA.

---

## 5. Evidencia de Desbloqueo y Paso a Verde

Tras subir el parche correctivo a `origin demo/cris-d2`, GitHub Actions reevaluó automáticamente el Pull Request:

- **ID de Ejecución Remota:** `43150246422`
- **URL de Ejecución:** [https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43150246422](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43150246422)
- **Resultado del Job `Security gates`:** `SUCCESS` (código `0`).
  - Gitleaks: 0 secretos.
  - Actionlint: 0 errores de workflows.
  - Release-gate tests: 16/16 pruebas aprobadas.
  - Semgrep CE: 0 hallazgos de severidad ERROR. Regla `resdigital-sql-concatenation` satisfecha.
  - OSV-Scanner: 0 dependencias no autorizadas.
- **Resultado del Job `Monorepo required`:** `SUCCESS` (`APROBADO`).
- **Artefactos Preservados:** `security-reports-${{ github.sha }}` conteniendo `semgrep.sarif` y `osv-report.sarif` con retención de 30 días para fines de auditoría.

---

## 6. Comprobación de Protección de Ramas (Ítem 3.5)

Para asegurar que ningún usuario pueda eludir este bloqueo en producción:
1. Se implementó el script `scripts/setup/branch-protection.sh` que invoca la GitHub API (`PUT /repos/{owner}/{repo}/branches/{branch}/protection`).
2. Se exige como checks obligatorios:
   - `Monorepo required`
   - `Security gates (SAST, SCA, Secrets)`
   - `Quality (backend)` y `Quality (frontend)`
   - `Dependency review`
3. Se requiere al menos 1 aprobación humana independiente antes de la fusión.
4. Las instrucciones para su activación por el administrador del repositorio (`@AriH004`) quedaron formalizadas en `docs/ssdlc/PASOS_MANUALES.md`.
