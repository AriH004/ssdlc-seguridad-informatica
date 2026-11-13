#!/usr/bin/env bash
# Hook de parada para Claude Code (Ítem 2.4).
# Intercepta el comando Stop del agente, ejecuta verify.sh con control de reintentos
# y retroalimenta al agente si hay fallas (exit 2) o bloquea si supera 3 reintentos (exit 0).

set -u
cd "$(dirname "$0")/../.."

# Invoca el motor de verificación en Node.js pasando stdin directamente
node tooling/agent-wrapper.mjs
exit $?
