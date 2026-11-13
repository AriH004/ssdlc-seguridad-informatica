# Pasos Manuales del Equipo (Gobernanza y Operación)

Los siguientes pasos requieren intervención o permisos administrativos humanos y no pueden ser completados autónomamente por agentes de desarrollo:

## 1. Protección de Ramas (Ítem 3.5)
- **Responsable:** Administradora del repositorio (`@AriH004`).
- **Instrucción:** Ejecutar el script automatizado desde una terminal autenticada en GitHub CLI:
  ```bash
  bash scripts/setup/branch-protection.sh
  ```
- **Configuración aplicada:**
  - Ramas protegidas: `development` y `main`.
  - Checks obligatorios para fusión: `Monorepo required`, `Security gates (SAST, SCA, Secrets)`, `Quality (backend)`, `Quality (frontend)` y `Dependency review`.
  - Exigir al menos 1 aprobación humana de otro integrante para mergear.
  - Prohibición de force push y eliminación de ramas.

## 2. Etiquetas de GitHub Issues (Ítem 7.5)
- **Responsable:** Danny / Equipo.
- **Instrucción:** Ejecutar `scripts/setup/labels.sh` para crear las etiquetas estandarizadas de hallazgos y excepciones (`tipo:*`, `severidad:*`, `estado:*`).

## 3. Secretos de CI/CD para Docker Hub (Ítem 5.5)
- **Responsable:** Danny / Administradora.
- **Instrucción:** Configurar en **Settings > Secrets and variables > Actions**:
  - `DOCKERHUB_USERNAME`: nombre de usuario en Docker Hub.
  - `DOCKERHUB_TOKEN`: token de acceso personal con permisos de lectura/escritura de imágenes.

## 4. Modelo de Amenazas en Threat Dragon (Ítem 1.3)
- **Responsable:** Ariana.
- **Instrucción:** Abrir OWASP Threat Dragon, importar los diagramas DFD de `docs/kb/arquitectura-y-acceso.md` y guardar el modelo en `docs/threat-model/threat-model.json`.

## 5. Revisiones Cruzadas de PRs
- **Responsable:** Todos los integrantes según la matriz de revisión cruzada:
  - Ariana (A) revisa PRs de Cristhian (B).
  - Cristhian (B) revisa PRs de Danny (C).
  - Danny (C) revisa PRs de Ariana (A).
