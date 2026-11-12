# Política de Bloqueo de Integración y Calidad (Ítem 3.2)

Esta política define las condiciones automáticas bajo las cuales un Pull Request o commit queda **bloqueado** en el pipeline de Integración Continua (CI) de ResDigital SSDLC, garantizando que ningún código con defectos de seguridad o vulnerabilidades conocidas sea integrado en `development` o `main`.

---

## 1. Alcance y Herramientas Evaluadas

La puerta de seguridad de CI y desarrollo local ejecuta de forma automatizada las siguientes capas de control:

| Herramienta | Tipo de Análisis | Objetivo y Alcance | Configuración |
|---|---|---|---|
| **Gitleaks** | Secret Scanning | Detección de credenciales, tokens, JWTs y contraseñas en código, staging e historial completo Git. | `.gitleaks.toml` (`useDefault = true`) |
| **Semgrep CE** | SAST (Estático) | Detección de inyecciones (SQL, XSS), bypass de autenticación, fallos en React/TypeScript y reglas propias de ResDigital. | `.semgrep/resdigital-rules.yaml` + packs `p/owasp-top-ten`, `p/react`, `p/typescript` |
| **OSV-Scanner** | SCA (Dependencias) | Escaneo de vulnerabilidades conocidas en la base de datos abierta OSV.dev sobre los manifiestos de dependencias. | `osv-scanner.toml` sobre `backend/pnpm-lock.yaml` y `frontend/pnpm-lock.yaml` |
| **Actionlint** | Linter de CI/CD | Verificación estricta de sintaxis, tipos y buenas prácticas en workflows de GitHub Actions. | `.github/workflows/*.yml` |
| **Dependency-Review** | SCA en PRs | Revisión diferencial de paquetes agregados o actualizados en PRs con bloqueo en severidad alta/crítica. | `actions/dependency-review-action` (`fail-on-severity: high`) |
| **Pruebas de Autorización** | DAST / API Tests | 182 pruebas directas contra la API verificando matriz de roles, fincas y denegación por defecto. | `backend/test/authz/` |

---

## 2. Códigos de Salida y Criterios de Bloqueo

En concordancia con los lineamientos del proyecto: **"Un análisis que no pudo ejecutarse se considera incompleto, no aprobado"**.

| Código de Salida | Estado CI | Significado | Acción del Pipeline |
|---|---|---|---|
| **`0`** | `APROBADO` | La herramienta se ejecutó completamente y no encontró hallazgos que violen las políticas. | Permite continuar al siguiente step/job. |
| **`1` o `>0`** | `BLOQUEADO` | Se detectaron secretos versionados, vulnerabilidades en dependencias sin excepción o violaciones de reglas SAST. | El job falla inmediatamente; el PR queda bloqueado contra fusión. |
| **`2` o Error de Entorno** | `INCOMPLETO` | Herramienta no instalada, dependencia ausente, fallo de red o tiempo de espera agotado. | El job falla inmediatamente (`fail closed`). No se asume aprobado bajo ninguna circunstancia. |

---

## 3. Umbrales de Severidad y Tratamiento

1. **Secretos (Gitleaks):** Tolerancia CERO. Todo secreto detectado bloquea el flujo inmediatamente. No se admiten excepciones temporales para credenciales reales expuestas: deben ser revocadas y rotadas en el proveedor.
2. **Código Inseguro (Semgrep CE):**
   - Reglas con severidad `ERROR` (como `resdigital-sql-concatenation` o bypass de auth): Bloqueo obligatorio de integración.
   - Reglas con severidad `WARNING`: Reportadas en el artefacto SARIF; exigen revisión en el Pull Request.
3. **Composición de Software (OSV-Scanner):**
   - Cualquier vulnerabilidad reportada en `backend/pnpm-lock.yaml` o `frontend/pnpm-lock.yaml` produce código de salida `1` y bloquea la integración, salvo que se encuentre formalmente exceptuada en `osv-scanner.toml`.

---

## 4. Política de Excepciones Formales (`osv-scanner.toml`)

Si una vulnerabilidad en una dependencia de terceros no cuenta con parche upstream disponible y el equipo determina que no existe vector de explotación en el contexto de ResDigital:

1. Se registra un Issue en GitHub con la etiqueta `excepcion` y el identificador formal `E-xx` (conforme al ítem 7.5).
2. Dos integrantes humanos del equipo deben aprobar explícitamente la excepción técnica.
3. Se agrega la excepción en `osv-scanner.toml` bajo `[[IgnoredVulns]]` con tres campos obligatorios:
   ```toml
   [[IgnoredVulns]]
   id = "GHSA-xxxx-xxxx-xxxx"
   ignoreUntil = 2026-12-31  # Fecha de caducidad obligatoria (YYYY-MM-DD)
   reason = "E-01: Explicación técnica de no explotabilidad y mitigaciones activas."
   ```
4. Vencida la fecha `ignoreUntil`, OSV-Scanner vuelve a considerar la vulnerabilidad como activa y bloqueará el pipeline si no se ha actualizado la dependencia.

---

## 5. Artefactos de Evidencia en CI

Para cada ejecución en `pull_request` y `push`, el pipeline emite y preserva los reportes en formato estándar SARIF/JSON:
- `semgrep.sarif`: Hallazgos del análisis estático de Semgrep CE.
- `osv-report.sarif`: Hallazgos y estado de dependencias de OSV-Scanner.

Estos archivos se empaquetan en el artefacto `security-reports-${{ github.sha }}` con un periodo de retención de 30 días para auditoría y trazabilidad del SSDLC.
