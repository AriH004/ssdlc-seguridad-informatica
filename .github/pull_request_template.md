## Resumen del Cambio

<!-- Explica brevemente qué problema resuelve este Pull Request, el motivo del cambio y el alcance de los archivos modificados. -->

## Responsabilidad y Revisión Cruzada (Gobernanza SSDLC)

- **Autor / Responsable:** <!-- @AriH004 (Ariana) | @crissXcoder (Cristhian) | @DannyOr94 (Danny) -->
- **Revisor Asignado:** <!-- Según matriz: A revisa B, B revisa C, C revisa A -->
- **Ítem(s) SSDLC Cubierto(s):** <!-- e.g., 2.4, 3.2, 3.5, 3.6, 7.8, etc. -->

---

## Trazabilidad de Requisitos y Amenazas

Indica con `[x]` y lista los identificadores correspondientes si el cambio afecta o mitiga alguno de los siguientes elementos:

- [ ] **Flujos Críticos Afectados (`F-xx`):** <!-- e.g., F-01, F-02, F-03 o N/A -->
- [ ] **Amenazas Mitigadas / Evaluadas (`T-xx`):** <!-- e.g., T-01 (Inyección SQL / Fuga multitenant), T-05 (Secretos) o N/A -->
- [ ] **Medidas de Seguridad Relacionadas (`M-xx`):** <!-- e.g., M-01 (Parametrización), M-05 (Gitleaks) o N/A -->
- [ ] **Hallazgos / Excepciones (`H-xx` / `E-xx`):** <!-- e.g., H-33, E-01..E-57 o N/A -->

---

## Actualización de Base de Conocimiento (`docs/kb/`)

- [ ] Se revisaron y actualizaron los documentos pertinentes en `docs/kb/` (`flujos.md`, `arquitectura-y-acceso.md`, `amenazas.md`, `dudas.md`, `terceros-y-secretos.md`).
- [ ] Se actualizó la columna de estado de las medidas (`propuesta` -> `implementada` -> `verificada` únicamente con evidencia verificable).
- [ ] Si surgieron dudas de negocio o seguridad no resueltas en el código, se documentaron en `docs/kb/dudas.md`.

---

## Evidencia de Comprobaciones Locales

Indica el resultado de las verificaciones ejecutadas antes de abrir el PR:

- [ ] **Verificación Unificada (`scripts/verify.sh` / `agent:verify`):** `APROBADO`
- [ ] **Lint & Typecheck:** `pnpm lint` y `pnpm typecheck` en verde.
- [ ] **Pruebas Unitarias / Autorización:** 836 unitarias + tests de authz aprobados.
- [ ] **Secretos (Gitleaks):** `pnpm check:gitleaks` sin hallazgos (`no leaks found`).
- [ ] **SAST (Semgrep CE):** `pnpm check:semgrep` evaluado sin infracciones de severidad `ERROR`.
- [ ] **SCA (OSV-Scanner):** `pnpm check:security` evaluado; vulnerabilidades documentadas bajo excepciones en `osv-scanner.toml`.
- [ ] **Actionlint:** `pnpm check:workflows` sin advertencias ni errores sintácticos.

---

## Lista de Control de Seguridad

- [ ] **Sin Secretos:** No se incluyen credenciales, tokens, certificados ni valores reales de `.env`.
- [ ] **Sin debilitamiento de controles:** No se redujeron umbrales, no se comentaron pruebas ni se suprimieron reglas de linter/SAST.
- [ ] **Falla cerrado:** Las comprobaciones fallan de forma determinista ante cualquier anomalía (`exit != 0`).
- [ ] **Commits y ramas:** La rama origen sigue la convención (`feature/*`, `demo/*`, `fix/*`) y apunta hacia `development`.
