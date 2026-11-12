# Defensa: Cristhian

> Borrador de la IA; reescribir con tus palabras antes de la defensa individual.

## Ítem 2.4: Hook / Wrapper que conecta al agente y limita reintentos

**Qué se hizo**
- Se implementó la arquitectura de conexión agéntica mediante:
  1. `.claude/hooks/stop-verify.sh`: Hook de parada registrado para Claude Code.
  2. `tooling/agent-wrapper.mjs`: Motor en Node.js ES Modules independiente del sistema operativo que ejecuta `scripts/verify.sh`, controla los intentos de corrección y gestiona los códigos de salida.
  3. `package.json`: Comando `"agent:verify": "node tooling/agent-wrapper.mjs"` para ejecución y pruebas directas.
  4. `.claude/.verify-retries`: Archivo de estado volátil (ignorado por Git) que mantiene el contador de reintentos consecutivos.
  5. `docs/ssdlc/evidencia/2.4/bloqueos.log`: Registro de auditoría persistente cuando se supera el límite de reintentos.
  6. `tooling/tests/agent-wrapper.test.mjs`: Suite de 5 pruebas unitarias con `node:test` cubriendo todos los flujos del ciclo de vida.

**Por qué así**
- **Prevención de bucles infinitos:** Si un agente comete un error, el hook intercepta la salida de parada (`Stop`), incrementa el contador y sale con código `2`. Claude Code toma el texto emitido por `stderr` y reabre el turno para que el agente intente autocorregirse.
- **Corte de circuito (Circuit Breaker) en 3 intentos:** Si tras 3 intentos el agente no logra resolver el fallo, el hook detiene el bucle forzado emitiendo `BLOQUEADO: requiere intervención humana`, registra el evento en `bloqueos.log` y sale con código `0` para que el modelo informe al humano y termine sin loopear indefinidamente.
- **Multiplataforma:** Al basar el motor en Node.js, funciona de forma idéntica en Windows (PowerShell/CMD) y en Linux/macOS, sin problemas de compatibilidad con shells nativas.
- **Falla cerrado:** Si una verificación no se puede ejecutar o falla cualquier herramienta, el script jamás aprueba.

**Cómo se demuestra**
1. **Ejecución normal en limpio:** Ejecutar `pnpm run agent:verify` o `node tooling/agent-wrapper.mjs` y mostrar la salida `RESULTADO: APROBADO` con código de salida `0` y contador reseteado.
2. **Pruebas unitarias automatizadas:** Ejecutar `node --test tooling/tests/agent-wrapper.test.mjs` mostrando que los 5 escenarios (éxito inicial, fallo intento 1 con exit 2, fallo intento 2 con exit 2, bloqueo en intento 3 con exit 0 y registro en log, y reseteo tras corrección) pasan en menos de 200 ms.
3. **Demostración D3:** Provocar un fallo intencional (un error sintáctico o prueba rota); observar cómo el hook devuelve el control al agente con código 2; tras 3 intentos, mostrar el bloqueo y la entrada agregada a `bloqueos.log`.

**Qué comprueba**
- Que ningún cambio propuesto por el agente sea aceptado si rompe linting, typechecking, pruebas unitarias (836 tests), compilación o introduce secretos versionados.
- Que el agente reciba retroalimentación contextual inmediata para autocorregirse autónomamente.
- Que el flujo de desarrollo agéntico cuente con un límite estricto de reintentos para no degradar el entorno ni consumir tokens en ciclos estériles.

**Qué NO comprueba / Limitaciones**
- Pruebas de integración contra base de datos real (RLS) y e2e (requieren contenedores de base de datos encendidos).
- No reemplaza la revisión humana de código ni aprueba automáticamente PRs (el agente tiene prohibido hacer `git push` o aprobar su propio trabajo según el ítem 2.5).

---

## Ítem 2.5: Límites del agente y contención de riesgos

**Qué se hizo**
- Se configuró `.claude/settings.json` con directivas estrictas en `permissions.deny`:
  - Lectura bloqueada: `.env*` y cualquier archivo de secretos.
  - Edición bloqueada sin revisión humana: `.github/workflows/**`, `.claude/**`, `scripts/verify.sh`, `scripts/ci/**`, `.semgrep/**`, `.gitleaks.toml`, `osv-scanner.toml` y carpetas de pruebas unitarias/autorización (`backend/test/**`, `frontend/tests/**`).
  - Comandos de shell bloqueados: `git push`, `gh pr merge`, `gh pr review`, `gh pr approve`, `rm -rf`, `curl | sh`.
- Se vinculó `CLAUDE.md` con `@AGENTS.md` para garantizar que el modelo consulte los límites de gobernanza del repositorio.

**Por qué así**
- Los lineamientos exigen que los límites del agente se respalden mediante configuraciones técnicas ejecutables en el harness y no únicamente mediante texto consultivo en `AGENTS.md`. El agente no puede modificar sus propios controles ni publicar cambios sin revisión cruzada.


---

## Ítem 3.2: Semgrep CE, Gitleaks y OSV-Scanner en CI

**Qué se hizo**
- **Semgrep CE:** Configuración en `.semgrep/resdigital-rules.yaml` con reglas personalizadas para inyección SQL (concatenación de queries para la demo D2), bypass de autenticación y XSS en React (`dangerouslySetInnerHTML`). Exclusiones configuradas en `.semgrepignore`. Integración en `.github/workflows/ci.yml` ejecutado en contenedor Docker `semgrep/semgrep:1.185.0` con packs `p/owasp-top-ten`, `p/react` y `p/typescript`, exportando reporte SARIF.
- **OSV-Scanner:** Integrado en `tooling/security-tools.mjs` mediante descarga del binario oficial v1.9.2 fijado por SHA-256 para Linux y Windows. Escanea ambos manifiestos (`backend/pnpm-lock.yaml` y `frontend/pnpm-lock.yaml`) contrastándolos con la base de datos abierta OSV.dev. Configuración de excepciones documentadas en `osv-scanner.toml`.
- **Gitleaks y Actionlint:** Escaneo de secretos en todo el historial y staging (`gitleaks-ci` y `gitleaks-tree`) con `.gitleaks.toml` y linting de workflows de Actions (`actionlint`).
- **Política de bloqueo:** Documentada formalmente en `docs/ssdlc/politica-de-bloqueo.md` definiendo que cualquier vulnerabilidad crítica o alta, secreto o herramienta fallida/incompleta produce un código de salida distinto de cero y bloquea la integración.
- **Artefactos en CI:** Subida de los reportes `osv-report.sarif` y `semgrep.sarif` en el job `security` de `ci.yml` con 30 días de retención.

**Por qué así**
- **Reutilización local y remota:** El desarrollador y el pipeline de CI invocan exactamente las mismas herramientas y configuraciones a través de `tooling/security-tools.mjs` y `scripts/verify.sh`.
- **Falla cerrado:** Un análisis que no pueda ejecutarse (por ejemplo, falta de red o binario) sale con código de error (`INCOMPLETO`), nunca se asume aprobado en verde.
- **Excepciones trazables:** No se permiten exclusiones informales; toda vulnerabilidad conocida en dependencias que no pueda corregirse inmediatamente exige un ID de excepción `E-xx` registrado en el sistema de hallazgos, justificación técnica y fecha de expiración (`ignoreUntil`) en `osv-scanner.toml`.

**Cómo se demuestra**
1. **OSV-Scanner en acción:** Ejecutar `node tooling/security-tools.mjs osv-scanner` y observar el escaneo de los 475 paquetes del backend y 739 del frontend, identificando la matriz de hallazgos y retornando código 1 de bloqueo.
2. **Validación de CI:** Ejecutar `pnpm check:workflows` demostrando que `.github/workflows/ci.yml` pasa la validación estricta de Actionlint.
3. **Pruebas de Tooling:** Ejecutar `node --test tooling/tests/security-tools.test.mjs` demostrando que las reglas de Semgrep, el archivo de excepciones TOML y la política de bloqueo son verificados automáticamente.
4. **Demostración D2:** Introducir una consulta SQL construida por concatenación de cadenas en `backend/src/`; Semgrep la detecta localmente y en CI con la regla `resdigital-sql-concatenation`, bloqueando el PR hasta su corrección con parámetros vinculados.

**Qué comprueba**
- Que ningún commit con secretos en el historial ingrese a ramas protegidas.
- Que no se introduzcan patrones inseguros de código (inyecciones SQL, XSS o elusiones de guardias de autorización).
- Que todas las dependencias transitivas y directas se auditen contra CVEs y GHSAs en OSV.dev.
- Que los reportes queden asociados al commit evaluado en formato estándar SARIF.

**Qué NO comprueba / Limitaciones**
- No detecta vulnerabilidades zero-day no divulgadas en bases de datos públicas de CVE/OSV.
- No realiza análisis dinámico DAST sobre servidores en vivo; se enfoca en la fase de construcción e integración (SAST + SCA + Secrets).
