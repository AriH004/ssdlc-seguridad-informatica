#!/usr/bin/env bash
# scripts/setup/branch-protection.sh (Ítems 3.5 y 3.6)
#
# Configura la protección de ramas en GitHub para 'development' y 'main'
# mediante la API de GitHub (gh api).
#
# IMPORTANTE: Este script debe ser ejecutado por una persona con permisos de
# administrador en el repositorio (por ejemplo @AriH004).
# El agente de desarrollo no dispone de permisos de administrador.

set -euo pipefail

REPO="${1:-AriH004/ssdlc-seguridad-informatica}"

echo "==> Configurando protección de ramas para: $REPO"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI no está instalada o no está en el PATH." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: Debe iniciar sesión en GitHub CLI (gh auth login)." >&2
  exit 1
fi

for BRANCH in development main; do
  echo "==> Protegiendo rama: $BRANCH"

  gh api -X PUT "repos/$REPO/branches/$BRANCH/protection" \
    --input - <<'JSON'
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
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
JSON

  echo "Rama $BRANCH protegida exitosamente."
done

echo "==> Configuración de protección de ramas completada."
