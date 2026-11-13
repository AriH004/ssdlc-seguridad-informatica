# Defensa: Cristhian

> Borrador de la IA; reescribir con tus palabras antes de la defensa individual.

## Ítems 1.8 y 2.1: Contexto de gobernanza y directrices en AGENTS.md

**Qué se hizo**
- Se configuró [`AGENTS.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/AGENTS.md) como la fuente canónica de instrucciones para el agente y desarrolladores:
  - Definición explícita de arquitectura monorepositorio sin workspace y comandos de compilación/prueba independientes.
  - Sección de consulta obligatoria (`docs/kb/flujos.md`, `docs/kb/arquitectura-y-acceso.md`, `docs/kb/amenazas.md`, `docs/kb/dudas.md` y `docs/kb/terceros-y-secretos.md`) antes de alterar cualquier flujo crítico.
  - Reglas de codificación segura para acceso a datos (Ítem 7.8) prohibiendo queries SQL raw concatenadas.
  - Instrucciones para ejecutar las comprobaciones locales obligatorias (`scripts/verify.sh` y `tooling/agent-wrapper.mjs`).

**Por qué así**
- El estándar SSDLC exige que los agentes de IA no operen en el vacío; deben contar con un contexto claro de los límites arquitectónicos, las políticas de seguridad y las fuentes de requisitos de negocio para prevenir desviaciones y alucinaciones.

**Cómo se demuestra**
- Abrir [`AGENTS.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/AGENTS.md) y verificar las secciones operativas, de consulta de base de conocimiento y de codificación segura.

---

## Ítem 2.3: Herramientas locales de seguridad (Semgrep y Gitleaks)

**Qué se hizo**
- Se integraron herramientas de análisis de seguridad ejecutables en la máquina del desarrollador a través de `tooling/security-tools.mjs`:
  - **Gitleaks:** Escaneo de secretos en todo el árbol de trabajo y staging (`gitleaks-tree`), con reglas personalizadas en `.gitleaks.toml` y excepciones en `.gitleaksignore`.
  - **Semgrep CE:** Escaneo de código estático SAST local mediante CLI o contenedor Docker con reglas propias (`resdigital-sql-concatenation`, `resdigital-unsafe-innerhtml`, `resdigital-hardcoded-jwt-secret`).
  - **OSV-Scanner:** Escaneo de vulnerabilidades conocidas en dependencias sobre `backend/pnpm-lock.yaml` y `frontend/pnpm-lock.yaml`.
- Ambas herramientas se incluyeron dentro del script unificado `scripts/verify.sh` y en los comandos de `package.json` (`check:gitleaks`, `check:semgrep`, `check:security`).

**Por qué así**
- **Enfoque Shift-Left:** Detectar vulnerabilidades y secretos en la estación de trabajo evita que lleguen a GitHub.
- **Falla cerrado:** Si una herramienta no está instalada o no puede ejecutarse localmente, emite `INCOMPLETO` con código 2, impidiendo que el desarrollador asuma una falsa aprobación.

**Cómo se demuestra**
- Ejecutar `pnpm check:gitleaks` y `node tooling/security-tools.mjs osv-scanner` mostrando el escaneo y el reporte en limpio.

---

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
2. **Pruebas unitarias automatizadas:** Ejecutar `node --test tooling/tests/agent-wrapper.test.mjs` mostrando que los 5 escenarios (éxito inicial, fallo intento 1 con exit 2, fallo intento 2 con exit 2, bloqueo en intento 3 con exit 0 y registro en log, y reseteo tras corrección) pasan en menos de 200 ms (ver captura [`01-agent-wrapper-unit-tests.png`](../evidencia/2.4/capturas/01-agent-wrapper-unit-tests.png) y volcado [`agent-wrapper-tests-salida.txt`](../evidencia/2.4/agent-wrapper-tests-salida.txt)).
3. **Demostración D3:** Provocar un fallo intencional (un error sintáctico o prueba rota); observar cómo el hook devuelve el control al agente con código 2; tras 3 intentos, mostrar el bloqueo y la entrada agregada a `bloqueos.log` (ver captura [`02-circuit-breaker-bloqueo.png`](../evidencia/2.4/capturas/02-circuit-breaker-bloqueo.png) y simulación [`circuit-breaker-simulacion.txt`](../evidencia/2.4/circuit-breaker-simulacion.txt)).

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

## Ítem 3.1: Pipeline de Integración Continua (CI) en GitHub Actions

**Qué se hizo**
- Se diseñó y puso en producción el workflow principal `.github/workflows/ci.yml` en la raíz del monorepositorio:
  - Disparadores en cada Pull Request y push hacia `development` y `main`.
  - Matriz de calidad (`quality`) ejecutando linting, typechecking y 836 pruebas unitarias independientes para `backend` y `frontend` con `pnpm` y versiones fijadas.
  - Job agregador obligatorio `monorepo-required` que comprueba que todos los jobs requeridos (`Quality`, `Security gates`, `Authz tests`, `Dependency review`, `Candidate image`) hayan finalizado en éxito (`needs: [...]`).
  - Validación sintáctica y de gobernanza con Actionlint (`check:workflows`).

**Por qué así**
- **Agregación estricta:** Un PR solo puede integrarse si el check `Monorepo required` pasa; si un solo job falla, se cancela o queda incompleto, la integración se bloquea automáticamente.

**Cómo se demuestra**
- Mostrar las ejecuciones exitosas en GitHub Actions (por ejemplo [Run 43154081375](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43154081375)) en el [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31), con evidencia en capturas [`01-pr-31-checks-completos.png`](../evidencia/3.2/capturas/01-pr-31-checks-completos.png) y [`02-ci-run-43154081375-monorepo-ci-verde.png`](../evidencia/3.2/capturas/02-ci-run-43154081375-monorepo-ci-verde.png), y volcado [`ci-run-43154081375-view.txt`](../evidencia/3.2/ci-run-43154081375-view.txt).

---

## Ítem 3.5: Protección de ramas y permisos de pipeline

**Qué se hizo**
- Se implementó el script de protección de ramas [`scripts/setup/branch-protection.sh`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/scripts/setup/branch-protection.sh):
  - Protege `development` y `main` exigiendo PR, checks de CI requeridos (`Monorepo required`, `Security gates`, `Quality`, `Dependency review`) y al menos 1 aprobación humana de otro integrante del equipo.
  - Bloquea push directo, borrado de ramas y force pushes.
  - Establece permisos mínimos de ejecución en `ci.yml` (`permissions: contents: read`).
  - Documentación de activación manual para la administradora en [`docs/ssdlc/PASOS_MANUALES.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/docs/ssdlc/PASOS_MANUALES.md) y evidencia en [`docs/ssdlc/evidencia/3.5/README.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/docs/ssdlc/evidencia/3.5/README.md).

**Por qué así**
- Las reglas de CI/CD carecen de fuerza vinculante si cualquier desarrollador o agente puede hacer push directo a `development`. La protección de ramas garantiza que el pipeline sea la única vía de entrada al código integrado.

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

---

## Ítem 3.6: Demostración de bloqueo de integración (Demo D2)

**Qué se hizo**
- Se diseñó y ejecutó de forma controlada la **Demostración D2** de bloqueo del pipeline de CI:
  1. Se creó la rama `demo/cris-d2` y se abrió el [Pull Request #32](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32) hacia `development`.
  2. En el commit `092d567`, se inyectó una vulnerabilidad intencional de inyección SQL mediante concatenación directa de cadenas en `backend/src/animales/animales.service.ts` (`demoInyeccionSqlConcatenada`).
  3. Se verificó que el pipeline remoto de GitHub Actions (Run `43148785557`) falló en los gates de seguridad (`Security gates`), bloqueando el job `Monorepo required` y deshabilitando la fusión en el Pull Request.
  4. En el commit `60142d2`, se implementó la remediación utilizando consultas parametrizadas con parámetros vinculados (`$1`), eliminando la concatenación insegura.
  5. Se reevaluó el PR en CI (Run `43149844208`), verificando que Semgrep CE y todos los gates pasaron a verde (`APROBADO`).
  6. Toda la evidencia, enlaces a runs remotos, diffs y artefactos SARIF quedaron documentados en `docs/ssdlc/evidencia/3.6/README.md`.

**Por qué así**
- **Verificación empírica del SSDLC:** No basta con declarar reglas y herramientas; es un requisito fundamental de seguridad demostrar que un defecto real es detectado y bloqueado efectivamente antes de tocar código de producción.
- **Trazabilidad completa:** La demostración vive en un Pull Request independiente (#32) con historial inmutable en GitHub Actions, vinculando el commit con defecto, el commit de corrección y los artefactos SARIF generados.
- **Integración con reglas de protección:** La demostración se apoya en el script de branch protection (`scripts/setup/branch-protection.sh`, Ítem 3.5), garantizando que las ramas `development` y `main` rechacen fusiones directas o PRs con checks no aprobados.

**Cómo se demuestra**
1. **Pull Request en GitHub:** Mostrar el [PR #32](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32) en GitHub (ver captura [`01-pr-32-bloqueo-sqli.png`](../evidencia/3.6/capturas/01-pr-32-bloqueo-sqli.png)).
2. **Historial de ejecuciones:** Mostrar la ejecución inicial fallida `43148785557` (cruz roja en `Security gates` y `Monorepo required`, ver captura [`02-run-43148785557-bloqueo-ci-falla.png`](../evidencia/3.6/capturas/02-run-43148785557-bloqueo-ci-falla.png) y volcado [`run-43148785557-falla.txt`](../evidencia/3.6/run-43148785557-falla.txt)) y la ejecución posterior exitosa tras la remediación `43150246422` (ver captura [`03-run-43150246422-remediacion-ci-verde.png`](../evidencia/3.6/capturas/03-run-43150246422-remediacion-ci-verde.png) y volcado [`run-43150246422-verde.txt`](../evidencia/3.6/run-43150246422-verde.txt)).
3. **Inspección de código:** Mostrar el diff en `backend/src/animales/animales.service.ts` donde la concatenación `"SELECT ... '" + idFinca + "'"` es sustituida por parámetros `$1` con `[idFinca]` (ver [`pr-32-diff.txt`](../evidencia/3.6/pr-32-diff.txt)).
4. **Reporte SARIF:** Descargar el artefacto `security-reports-${{ github.sha }}` generado por el pipeline y revisar los resultados de Semgrep CE.

**Qué comprueba**
- Que las reglas SAST personalizadas de Semgrep CE (`resdigital-sql-concatenation`) detectan patrones de concatenación insegura en queries SQL.
- Que un fallo en cualquier herramienta de seguridad detiene la cadena de integración continua (`fail closed`).
- Que los checks requeridos de GitHub Actions impiden la fusión a `development` cuando el estado no es exitoso.
- Que la remediación con prácticas de codificación segura restaura el estado verde sin degradar los controles.

**Qué NO comprueba / Limitaciones**
- No simula un ataque activo de explotación en tiempo de ejecución (payload malicioso contra base de datos activa); se comprueba a nivel de análisis estático en la compuerta de integración (SAST shift-left).
- La exigencia obligatoria de aprobación de branch protection en GitHub depende de la ejecución del script por el dueño del repositorio (`@AriH004`) debido a permisos administrativos del token.

---

## Ítem 7.8: Aprendizaje al siguiente ciclo de desarrollo (Demo D6)

**Qué se hizo**
- Se cerró el ciclo de mejora continua (Demostración D6) a partir del hallazgo real de inyección SQL (Demo D2):
  1. Se registró formalmente el hallazgo en GitHub como [Issue #33](https://github.com/AriH004/ssdlc-seguridad-informatica/issues/33) (`[HALLAZGO] Inyección SQL por concatenación en consultas directas a base de datos (Demo D2 / D6)`), categorizado como `tipo:confirmado`, `severidad:alta` y `estado:verificado`.
  2. Se redactó el documento formal de aprendizaje en [`docs/ssdlc/aprendizaje-siguiente-ciclo.md`](../aprendizaje-siguiente-ciclo.md), desarrollando un análisis de causa raíz con el método de los Cinco Porqués (5 Whys) y su impacto en la arquitectura multitenant.
  3. Se alimentó la gobernanza del repositorio actualizando [`AGENTS.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/AGENTS.md) con una directriz obligatoria de codificación segura para el agente y desarrolladores (prohibición de consultas SQL raw concatenadas y exigencia de parámetros vinculados `$1`).
  4. Se fortaleció la medida **M-01** en el modelo de amenazas ([`docs/kb/amenazas.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/docs/kb/amenazas.md)), asociando la regla de análisis estático `resdigital-sql-concatenation` como salvaguarda preventiva contra la evasión de aislamiento de datos (Amenaza **T-01**).
  5. Se documentó la evidencia completa en [`docs/ssdlc/evidencia/7.8/README.md`](../evidencia/7.8/README.md).

**Por qué así**
- **Cumplimiento de estándares internacionales:** Alineado con OWASP SAMM v2 (*Defect Management - Stream B*) y NIST SSDF v1.1 (*RV.3.2*), un defecto no debe resolverse únicamente con un parche reactivo en código; debe transferir conocimiento al sistema para evitar que el mismo error se repita en futuros desarrollos.
- **Enfoque Shift-Left:** Al colocar la restricción en `AGENTS.md`, el agente de programación y el equipo reciben la instrucción antes de escribir código nuevo, previniendo la introducción de vulnerabilidades en etapas iniciales.
- **Trazabilidad cerrada:** El Issue #33 conecta el defecto (D2), el commit vulnerable (`092d567`), el PR correctivo ([#32](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32)), el commit de remediación (`60142d2`), las ejecuciones de CI y las mejoras permanentes del repositorio.

**Cómo se demuestra**
1. **Issue en GitHub:** Mostrar el [Issue #33](https://github.com/AriH004/ssdlc-seguridad-informatica/issues/33) con sus etiquetas, trazabilidad y estado verificado (ver captura [`01-issue-33-hallazgo-sqli-d6.png`](../evidencia/7.8/capturas/01-issue-33-hallazgo-sqli-d6.png)).
2. **Documento de Causa Raíz:** Abrir [`docs/ssdlc/aprendizaje-siguiente-ciclo.md`](../aprendizaje-siguiente-ciclo.md) y exponer el análisis de los 5 Porqués y la correlación con la amenaza multitenant T-01.
3. **Instrucción en AGENTS.md:** Mostrar la sección agregada en [`AGENTS.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/AGENTS.md) que norma la codificación segura de consultas SQL.
4. **Modelo de amenazas:** Mostrar la actualización de la medida M-01 en [`docs/kb/amenazas.md`](file:///c:/Users/crisa/Cursos/Cursos/IV%20Año/II%20Ciclo/Seguridad%20Informática/Proyecto%20final/docs/kb/amenazas.md).

**Qué comprueba**
- Que el equipo cuenta con un proceso formal para analizar causas raíz de vulnerabilidades detectadas.
- Que las lecciones aprendidas se traducen en directivas técnicas ejecutables y comprobaciones automatizadas en CI.
- Que el ciclo de vida SSDLC es iterativo y se mejora continuamente con cada iteración de desarrollo.

**Qué NO comprueba / Limitaciones**
- No garantiza por sí solo que un desarrollador humano no intente eludir las instrucciones si no ejecuta los linters locales antes de hacer commit (por ello la compuerta de CI es obligatoria e infranqueable).
