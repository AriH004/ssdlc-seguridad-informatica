# Evidencia: Análisis de Seguridad en Entorno Local (Ítem 2.3)

**Responsable:** Cristhian (`crissXcoder`)  
**Fecha:** 2026-11-12  
**Herramientas locales:** Gitleaks, Semgrep CE y OSV-Scanner  
**Comandos:** `pnpm check:gitleaks`, `pnpm check:semgrep`, `pnpm check:security`

---

## 1. Alcance y Configuración Local

El ítem 2.3 exige incorporar análisis de seguridad estático y escaneo de secretos en el entorno de desarrollo local antes de que el código sea publicado o enviado al repositorio remoto:

1. **Gitleaks (Escaneo de Secretos):**
   - Configuración: `.gitleaks.toml` con reglas personalizadas y exclusiones de fingerprints históricos en `.gitleaksignore`.
   - Modos de ejecución:
     - `node tooling/security-tools.mjs gitleaks-tree`: Analiza el árbol de trabajo y staging.
     - `node tooling/security-tools.mjs gitleaks-ci`: Analiza el rango de commits del PR.
   - Resultado actual: `no leaks found` (0 secretos en staging y árbol).

2. **Semgrep CE (Análisis Estático SAST):**
   - Configuración: `.semgrep/resdigital-rules.yaml` con reglas propias para inyección SQL (`resdigital-sql-concatenation`), XSS (`resdigital-unsafe-innerhtml`) y secretos embebidos (`resdigital-hardcoded-jwt-secret`).
   - Modos de ejecución:
     - `node tooling/security-tools.mjs semgrep`: Ejecuta CLI local de Semgrep o contenedor Docker `semgrep/semgrep:1.185.0`.
   - Principio de falla cerrado: Si no se encuentra Semgrep ni Docker en el host local, emite `INCOMPLETO: semgrep` (código de salida `2`), impidiendo que el desarrollador asuma falsamente una aprobación.

3. **OSV-Scanner (Composición de Software SCA):**
   - Configuración: `osv-scanner.toml` analizando `backend/pnpm-lock.yaml` y `frontend/pnpm-lock.yaml`.
   - Ejecución: `node tooling/security-tools.mjs osv-scanner`.

---

## 2. Salida de Comprobación Local

```text
> node tooling/security-tools.mjs gitleaks-tree
38 commits scanned.
scanned ~6.79 MB in 707ms
no leaks found

> node tooling/security-tools.mjs osv-scanner
Scanned backend/pnpm-lock.yaml (475 packages)
Scanned frontend/pnpm-lock.yaml (739 packages)
Filtered 71 vulnerabilities from output (excepciones documentadas E-01 a E-57)
No issues found
```

Ambas herramientas se integran formalmente en el ciclo de parada del agente a través de `tooling/agent-wrapper.mjs` y `scripts/verify.sh`.
