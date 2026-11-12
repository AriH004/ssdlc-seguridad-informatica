# Evidencia ítem 3.2 (Cristhian)

Ejecución de análisis de código (Semgrep CE), secretos (Gitleaks) y dependencias (OSV-Scanner) dentro de CI y desarrollo local.

---

## 1. Herramientas Integradas y Versiones

| Herramienta | Versión | Tipo | Manifiesto / Configuración | Comprobación en Local | Comprobación en CI |
|---|---|---|---|---|---|
| **Gitleaks** | 8.27.2 | Secret Scanning | `.gitleaks.toml` (`useDefault = true`) | `node tooling/security-tools.mjs gitleaks-tree` | `node tooling/security-tools.mjs gitleaks-ci` |
| **Semgrep CE** | 1.185.0 | SAST | `.semgrep/resdigital-rules.yaml` + packs OWASP Top 10, TypeScript y React | `node tooling/security-tools.mjs semgrep` | Contenedor oficial `semgrep/semgrep` en step de CI |
| **OSV-Scanner** | 1.9.2 | SCA | `osv-scanner.toml` sobre `backend/pnpm-lock.yaml` y `frontend/pnpm-lock.yaml` | `node tooling/security-tools.mjs osv-scanner` | Step `OSV-Scanner` en CI generando SARIF |
| **Actionlint** | 1.7.12 | CI Linting | `.github/workflows/*.yml` | `pnpm check:workflows` | Step `actionlint` en job `security` |

---

## 2. Configuración y Reglas Implementadas

1. **Semgrep CE (`.semgrep/resdigital-rules.yaml`):**
   - `resdigital-sql-concatenation`: Detecta inyección SQL por concatenación de cadenas en TypeORM / EntityManager (regla base para la demo controlada D2).
   - `resdigital-unsafe-innerhtml`: Detecta uso no sanitizado de `dangerouslySetInnerHTML`.
   - `resdigital-hardcoded-jwt-secret`: Detecta secretos JWT o credenciales embebidas directamente en el código.
   - Exclusiones configuradas en `.semgrepignore` para aislar `node_modules/`, `dist/`, `.next/`, `coverage/` y fixtures de testing.

2. **OSV-Scanner (`osv-scanner.toml`):**
   - Configuración centralizada de excepciones para vulnerabilidades de dependencias.
   - Regla de excepción formal: exige `id`, `ignoreUntil` (fecha límite de expiración) y `reason` referenciando el hallazgo `E-xx` registrado en `docs/ssdlc/REGISTRO-HALLAZGOS.md`.

3. **Política de Bloqueo (`docs/ssdlc/politica-de-bloqueo.md`):**
   - Documento normativo que formaliza:
     - Salida `0`: Aprobado.
     - Salida `1` o `>0`: Bloqueado (se detiene el job y el PR queda bloqueado contra fusión).
     - Herramienta ausente o fallo de ejecución: Resultado `INCOMPLETO`, falla el job por defecto (`fail closed`).

---

## 3. Evidencias de Ejecución

### A. Escaneo de Dependencias con OSV-Scanner
- Comando ejecutado: `node tooling/security-tools.mjs osv-scanner`
- Binario verificado por hash SHA-256 (`c041e84d...` en Windows / `d6af4b67...` en Linux).
- Paquetes analizados: 475 en `backend/pnpm-lock.yaml`, 739 en `frontend/pnpm-lock.yaml`.
- Comportamiento ante vulnerabilidades encontradas: emite la tabla detallada de hallazgos (OSV URL, CVSS, ecosistema, paquete y versión) y termina con código de salida `1`, bloqueando la operación conforme a la política.

### B. Validación de Workflows con Actionlint
- Comando ejecutado: `pnpm check:workflows`
- Resultado: 0 errores de sintaxis o permisos en `.github/workflows/ci.yml`.

### C. Pruebas Unitarias de Tooling de Seguridad
- Comando ejecutado: `node --test tooling/tests/security-tools.test.mjs`
- Resultado: 7/7 pruebas aprobadas (cálculo de rangos Git, estructura de TOML, reglas YAML de Semgrep, reglas de ignore y política de bloqueo).

---

## 4. Pipeline de CI (`.github/workflows/ci.yml`)

El job `security` en CI fue actualizado para ejecutar de forma secuencial y obligatoria:
1. `Gitleaks secret scan`
2. `Workflows validation (actionlint)`
3. `Tooling release-gate tests`
4. `Semgrep CE (SAST code analysis)` vía Docker con generación de `reports/semgrep.sarif`
5. `OSV-Scanner (SCA dependencies)` con generación de `osv-report.sarif`
6. `Upload security reports` para preservar los reportes SARIF durante 30 días asociados al commit (`security-reports-${{ github.sha }}`)

---

## 5. Qué comprueba y qué NO comprueba

- **Qué comprueba:**
  - Que el código fuente no contenga secretos en el historial ni en staging (Gitleaks).
  - Que no existan patrones de código inseguro (SQL concatenado, XSS, bypass de auth) evaluados por Semgrep CE.
  - Que las dependencias registradas en los lockfiles sean contrastadas contra la base abierta de vulnerabilidades OSV.dev.
  - Que los workflows de Actions cumplan con la sintaxis y fijación de SHAs (Actionlint).
  - Que un fallo en cualquiera de estas herramientas bloquee el check obligatorio de CI (`Monorepo required`).
- **Qué NO comprueba:**
  - No realiza pruebas dinámicas DAST en runtime de red ni fuzzing de endpoints (eso corresponde a pruebas de autorización 4.5 e integración).
  - En local, Semgrep requiere tener la CLI instalada o Docker Desktop activo; si ambos están ausentes en la máquina del desarrollador, `verify.sh` reporta `INCOMPLETO: semgrep` (nunca verde falso).
