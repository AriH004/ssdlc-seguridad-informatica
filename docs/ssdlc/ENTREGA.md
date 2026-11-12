# Documento de Entrega SSDLC — ResDigital

**Proyecto:** Ciclo de Vida de Desarrollo Seguro (SSDLC) con IA, Programación Agéntica y DevSecOps  
**Repositorio Público:** [https://github.com/AriH004/ssdlc-seguridad-informatica](https://github.com/AriH004/ssdlc-seguridad-informatica)  
**Institución:** Universidad Nacional de Costa Rica (UNA)  
**Curso:** Seguridad Informática  
**Fecha:** 2026-11-12  

---

## 1. Integrantes, Roles y Matriz de Revisión Cruzada

| Persona | Miembro | Usuario GitHub | Etapas Asignadas | Revisor Asignado |
|---|---|---|---|---|
| **A** | Ariana | `@AriH004` | Planificación, Pruebas | Danny (`@DannyOr94`) |
| **B** | Cristhian | `@crissXcoder` | Desarrollo, Construcción e integración, Operación | Ariana (`@AriH004`) |
| **C** | Danny | `@DannyOr94` | Versión, Despliegue, Operación | Cristhian (`@crissXcoder`) |

---

## 2. Alcance del Proyecto y Reparto de Responsabilidades

El equipo seleccionó un total de 12 ítems (9 de núcleo + 3 extras, 4 ítems evaluables por persona) cubriendo las 7 etapas del ciclo de vida de desarrollo de software seguro:

### Persona A: Ariana
- **Núcleo:**
  - **1.3:** Modelo de amenazas STRIDE (`docs/kb/amenazas.md`).
  - **1.4:** Medidas de seguridad y comprobaciones verificadas.
  - **4.5:** Pruebas de autorización directo a la API (`backend/test/authz/`).
- **Extra:**
  - **4.9:** Defecto funcional y de seguridad detectados y corregidos (Demo D4 en `docs/ssdlc/evidencia/4.9/`).

### Persona B: Cristhian
- **Núcleo:**
  - **2.4:** Hook / Wrapper que conecta al agente con comprobaciones locales y limita reintentos (`.claude/hooks/stop-verify.sh`, `tooling/agent-wrapper.mjs`).
  - **3.2:** Semgrep CE, Gitleaks y OSV-Scanner en CI con política de bloqueo y exportación SARIF (`.semgrep/`, `.gitleaks.toml`, `osv-scanner.toml`, `docs/ssdlc/politica-de-bloqueo.md`).
  - **3.6:** Demostración de bloqueo de integración ante defectos de seguridad (Demo D2 en [PR #32](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32)).
- **Extra:**
  - **7.8:** Aprendizaje al siguiente ciclo de desarrollo con análisis de causa raíz y retroalimentación a la gobernanza (Demo D6 en [Issue #33](https://github.com/AriH004/ssdlc-seguridad-informatica/issues/33) y `AGENTS.md`).
- **Requisitos previos implementados:**
  - **1.8 & 2.1:** Directrices de gobernanza y consulta obligatoria en `AGENTS.md`.
  - **2.3:** Comprobaciones locales unificadas de seguridad (`tooling/security-tools.mjs`, `pnpm check:gitleaks`, `pnpm check:security`).
  - **2.5:** Límites restrictivos del harness del agente en `.claude/settings.json` y `CLAUDE.md`.
  - **3.1:** Pipeline de CI en `.github/workflows/ci.yml` con job agregador `monorepo-required`.
  - **3.5:** Protección de ramas y mínimos privilegios (`scripts/setup/branch-protection.sh`, `docs/ssdlc/PASOS_MANUALES.md`).

### Persona C: Danny
- **Núcleo:**
  - **5.1:** Registro de versión candidata (`release-record.md` / `.json`).
  - **6.2:** Ambiente de despliegue documentado (`docs/ssdlc/despliegue.md`, `deploy/`).
  - **7.5:** Registro único de hallazgos mediante GitHub Issues y templates estandarizados (`.github/ISSUE_TEMPLATE/`, `docs/ssdlc/REGISTRO-HALLAZGOS.md`).
- **Extra:**
  - **5.5:** Publicación en Docker Hub de imágenes aprobadas con SBOM CycloneDX y análisis Trivy (`.github/workflows/release.yml`).

---

## 3. Matriz de Evidencia de Cristhian (Persona B)

| Ítem | Descripción | Artefactos / Código Fuente | PR / Issue | Commits | Ejecución de CI | Estado |
|---|---|---|---|---|---|---|
| **1.8 & 2.1** | Contexto y gobernanza del agente | [`AGENTS.md`](../../AGENTS.md) | [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31) | `c335620` | [Run 43152744516](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43152744516) | **Cumple** |
| **2.3** | Herramientas locales SAST / Secrets / SCA | [`tooling/security-tools.mjs`](../../tooling/security-tools.mjs), [Evidencia 2.3](./evidencia/2.3/README.md) | [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31) | `c335620` | Local: `pnpm check:gitleaks`, `pnpm check:security` | **Cumple** |
| **2.4** | Hook y Wrapper del agente (Circuit Breaker) | [`.claude/hooks/stop-verify.sh`](../../.claude/hooks/stop-verify.sh), [`tooling/agent-wrapper.mjs`](../../tooling/agent-wrapper.mjs), [Evidencia 2.4](./evidencia/2.4/README.md) | [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31) | `c335620` | Unit tests: 5/5 pass | **Cumple** |
| **2.5** | Límites y contención del agente | [`.claude/settings.json`](../../.claude/settings.json), [`CLAUDE.md`](../../CLAUDE.md) | [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31) | `c335620` | Configuración técnica activa | **Cumple** |
| **3.1** | Monorepo CI Pipeline | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`tooling/migration-replay.mjs`](../../tooling/migration-replay.mjs) | [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31) | `c335620` | [Run 43152744516](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43152744516) (Verde) | **Cumple** |
| **3.2** | Semgrep CE, Gitleaks y OSV-Scanner en CI | [`.semgrep/resdigital-rules.yaml`](../../.semgrep/resdigital-rules.yaml), [`osv-scanner.toml`](../../osv-scanner.toml), [`politica-de-bloqueo.md`](./politica-de-bloqueo.md) | [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31) | `c335620` | [Run 43152744516](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43152744516) (SARIF preservado) | **Cumple** |
| **3.5** | Protección de Ramas | [`scripts/setup/branch-protection.sh`](../../scripts/setup/branch-protection.sh), [`PASOS_MANUALES.md`](./PASOS_MANUALES.md) | [PR #31](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/31) | `c335620` | Configuración vía GitHub API REST | **Cumple** |
| **3.6** | Demostración de Bloqueo en CI (Demo D2) | [`backend/src/animales/animales.service.ts`](../../backend/src/animales/animales.service.ts), [Evidencia 3.6](./evidencia/3.6/README.md) | [PR #32](https://github.com/AriH004/ssdlc-seguridad-informatica/pull/32) | Falla: `092d567`<br>Verde: `60142d2` | Falla: [Run 43148785557](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43148785557)<br>Verde: [Run 43150246422](https://github.com/AriH004/ssdlc-seguridad-informatica/actions/runs/43150246422) | **Cumple** |
| **7.8** | Aprendizaje al siguiente ciclo (Demo D6) | [`aprendizaje-siguiente-ciclo.md`](./aprendizaje-siguiente-ciclo.md), [`AGENTS.md`](../../AGENTS.md), [Evidencia 7.8](./evidencia/7.8/README.md) | [Issue #33](https://github.com/AriH004/ssdlc-seguridad-informatica/issues/33) | `c335620` | Trazabilidad completa D2 -> Issue #33 -> AGENTS.md | **Cumple** |

---

## 4. Limitaciones Conocidas y Excepciones Abiertas

1. **Excepciones en Dependencias Heredadas (`osv-scanner.toml`):**
   - El lockfile heredado del repositorio base (`pnpm-lock.yaml`) contiene 57 vulnerabilidades conocidas en paquetes transitivos antiguos.
   - Conforme a la política de bloqueo documentada en `docs/ssdlc/politica-de-bloqueo.md`, cada vulnerabilidad fue formalmente registrada como una excepción temporal identificada con el prefijo `E-01` a `E-57` y una fecha límite de revisión (`ignoreUntil = 2026-12-31`). Cualquier paquete nuevo o actualización que introduzca una vulnerabilidad no exceptuada causará un fallo inmediato en el gate de CI (`exit 1`).

2. **Permisos de Branch Protection en GitHub:**
   - La API de protección de ramas (`branch-protection.sh`) exige privilegios de administrador sobre el repositorio remoto (`@AriH004`). Los pasos operativos están completamente documentados en `docs/ssdlc/PASOS_MANUALES.md`.

---

## 5. Documentos de Defensa Individual

- **Persona A (Ariana):** [`docs/ssdlc/defensa/ariana.md`](./defensa/ariana.md)
- **Persona B (Cristhian):** [`docs/ssdlc/defensa/cristhian.md`](./defensa/cristhian.md) (y alias [`persona-B.md`](./defensa/persona-B.md))
- **Persona C (Danny):** [`docs/ssdlc/defensa/danny.md`](./defensa/danny.md)
