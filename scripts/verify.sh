#!/usr/bin/env bash
# Verificación local completa (ítem 2.2). Misma lógica que usa el CI:
# lint, typecheck, pruebas, build y Gitleaks sobre todo el árbol.
# Regla: si una herramienta no existe o no puede ejecutarse, el resultado es
# "INCOMPLETO", nunca verde.
set -u
cd "$(dirname "$0")/.."

# Se usa el pnpm fijado por Corepack (pnpm 10.32.1) para no depender del global.
if ! command -v corepack >/dev/null 2>&1; then
  echo "INCOMPLETO: corepack (instale Node 24 con Corepack)" >&2
  exit 2
fi
if ! command -v node >/dev/null 2>&1; then
  echo "INCOMPLETO: node" >&2
  exit 2
fi

# Los scripts de package.json llaman a `pnpm` a secas: se pone delante en el PATH
# un pnpm de Corepack (versión fijada) para que no gane un pnpm global distinto.
shim="$(mktemp -d)"
trap 'rm -rf "$shim"' EXIT
corepack enable --install-directory "$shim" >/dev/null 2>&1 || {
  echo "INCOMPLETO: no se pudo activar pnpm vía corepack" >&2
  exit 2
}
export PATH="$shim:$PATH"

resultados=()
fallo=0

# paso <nombre> <herramienta requerida> <comando...>
paso() {
  local nombre="$1" herramienta="$2"
  shift 2
  echo "==> $nombre"
  if ! command -v "$herramienta" >/dev/null 2>&1; then
    echo "INCOMPLETO: $herramienta" >&2
    resultados+=("INCOMPLETO  $nombre ($herramienta no instalado)")
    fallo=1
    return
  fi
  set +e
  "$@"
  local codigo=$?
  set -e
  if [ "$codigo" -eq 0 ]; then
    resultados+=("OK          $nombre")
  elif [ "$codigo" -eq 2 ]; then
    resultados+=("INCOMPLETO  $nombre")
    fallo=1
  else
    resultados+=("FALLÓ       $nombre")
    fallo=1
  fi
}

# Las dependencias deben estar instaladas (corepack pnpm install:apps).
for app in backend frontend; do
  if [ ! -d "$app/node_modules" ]; then
    echo "INCOMPLETO: dependencias de $app (ejecute: corepack pnpm install:apps)" >&2
    exit 2
  fi
done

paso "lint"      corepack pnpm lint
paso "typecheck" corepack pnpm typecheck
paso "pruebas"   corepack pnpm test
paso "build"     corepack pnpm build
# Gitleaks lo descarga y verifica por checksum tooling/security-tools.mjs.
paso "gitleaks"    node node tooling/security-tools.mjs gitleaks-tree
# OSV-Scanner analiza vulnerabilidades en lockfiles (ítem 3.2).
paso "osv-scanner" node node tooling/security-tools.mjs osv-scanner
# Semgrep CE evalúa reglas estáticas SAST locales y packs de seguridad (ítem 3.2).
paso "semgrep"     node node tooling/security-tools.mjs semgrep

echo
echo "===== Resumen ====="
printf '%s\n' "${resultados[@]}"
if [ "$fallo" -ne 0 ]; then
  echo "RESULTADO: NO APROBADO (hay pasos fallidos o incompletos)" >&2
  exit 1
fi
echo "RESULTADO: APROBADO"
