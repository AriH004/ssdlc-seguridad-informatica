# Evidencia: Protección de Ramas y Permisos de Pipeline (Ítem 3.5)

**Responsable:** Cristhian (`crissXcoder`)  
**Fecha:** 2026-11-12  
**Script automatizado:** [`scripts/setup/branch-protection.sh`](../../../scripts/setup/branch-protection.sh)  
**Documentación operativa:** [`docs/ssdlc/PASOS_MANUALES.md`](../PASOS_MANUALES.md)

---

## 1. Alcance de la Protección

El ítem 3.5 asegura que ninguna modificación ingrese a las ramas protegidas (`development` y `main`) de forma directa, sin revisión o con checks de integración fallidos:

1. **Ramas Protegidas:**
   - `development`: Rama base de integración y pruebas continuas.
   - `main`: Rama de producción y versiones aprobadas.

2. **Checks Obligatorios Requeridos (Status Checks):**
   - `Monorepo required`: Job agregador que valida que todos los pasos críticos del monorepositorio concluyeron en verde.
   - `Security gates (SAST, SCA, Secrets)`: Validación de Gitleaks, Actionlint, pruebas de release-gate, Semgrep CE y OSV-Scanner.
   - `Quality (backend)`: Linteo, tipado y pruebas unitarias de NestJS.
   - `Quality (frontend)`: Linteo, tipado y pruebas unitarias de Next.js.
   - `Dependency review`: Análisis de licencias y vulnerabilidades en dependencias nuevas del PR.

3. **Revisión Humana Cruzada:**
   - Exigencia de `required_approving_review_count: 1`.
   - Matriz de revisión cruzada obligatoria:
     - Ariana (A) revisa PRs de Cristhian (B).
     - Cristhian (B) revisa PRs de Danny (C).
     - Danny (C) revisa PRs de Ariana (A).

4. **Políticas de Integridad de Git:**
   - Prohibición estricta de `force push` (`allow_force_pushes: false`).
   - Prohibición de borrado de ramas (`allow_deletions: false`).
   - Exigencia de ramas actualizadas antes de fusionar (`strict: true`).

---

## 2. Implementación Automatizada (`scripts/setup/branch-protection.sh`)

El script invoca la API REST de GitHub (`PUT /repos/{owner}/{repo}/branches/{branch}/protection`) con la siguiente estructura de configuración:

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/branches/$BRANCH/protection" \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Monorepo required",
      "Security gates (SAST, SCA, Secrets)",
      "Quality (backend)",
      "Quality (frontend)",
      "Dependency review"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

Las instrucciones para que la administradora del repositorio (`@AriH004`) aplique el script quedaron registradas en `docs/ssdlc/PASOS_MANUALES.md`.
