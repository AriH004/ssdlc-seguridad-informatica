# Prompt maestro para Claude Code: SSDLC con IA y DevSecOps (Proyecto 30%)

> **Para los humanos del equipo (leer primero)**
>
> 1. Copien este archivo y `lineamientos_proyecto.md` a `docs/ssdlc/` en la raíz del repositorio.
> 2. Completen la sección 1 (nombres, usuarios de GitHub, Docker Hub).
> 3. Cada persona trabaja en **su propia rama y su propia sesión** de Claude Code, porque la defensa es individual y los aportes deben ser verificables en commits y PR propios.
> 4. Abran Claude Code en la raíz del repo, entren en **modo plan** (Shift+Tab) y escriban:
>    `Lee docs/ssdlc/PROMPT_CLAUDE_CODE.md y docs/ssdlc/lineamientos_proyecto.md. Soy la Persona X. Ejecuta la Fase 0 y presenta el plan de mis fases antes de editar nada.`
> 5. Después de cada fase, la persona revisa el diff, **entiende lo que se generó** (lo defiende ella, no la IA) y hace el `git push` y el PR. Otro integrante revisa.
> 6. Entrega: viernes 13/nov/2026 23:59 (hora de Costa Rica). Apunten a terminar el jueves 12.
> 7. Confirmen con el docente el mínimo de ítems para un equipo de 3 (los lineamientos hablan de 4 a 5). Este plan apunta a **12 ítems (4 por persona)**: un núcleo de 9 más 3 extras que solo se cierran si el núcleo ya está perfecto (sección 3).

---

## 1. Datos del equipo (completar)

| Campo | Valor |
|---|---|
| Repositorio (público) | `https://github.com/<org>/<repo>` |
| Persona A = **Ariana** (requisitos, amenazas, pruebas) | @usuario |
| Persona B = **Cristhian** (desarrollo, harness del agente, CI) | @usuario |
| Persona C = **Danny** (versión, despliegue, registro) | @usuario |
| Responsable de requisitos | Ariana (A) |
| Responsable de integración | Cristhian (B) |
| Responsable de operación | Danny (C) |
| Cuenta de Docker Hub | usuario |
| Rama de integración / rama principal | `development` / `main` |
| Gestor de paquetes y stack | NestJS + React (TypeScript); confirmar en Fase 0 |

Revisión cruzada: Ariana (A) revisa los PR de Cristhian (B), Cristhian (B) revisa los de Danny (C), Danny (C) revisa los de Ariana (A). El reparto, las normas y el cronograma completos están en la bóveda de Obsidian (`SSDLC/`); si algo difiere, manda la bóveda.

---

## 2. Contexto (resumen de los lineamientos)

El objetivo es demostrar un ciclo de vida de desarrollo seguro (SSDLC) con IA, programación agéntica y DevSecOps sobre el proyecto del equipo. La aplicación es el caso de uso. Se usan herramientas open source; GitHub, GitHub Actions y Docker Hub son servicios de apoyo.

Reglas de evaluación que condicionan todo lo demás:

- Se evalúan **solo los ítems elegidos** más los requisitos previos necesarios para demostrarlos.
- Cada ítem tiene un responsable principal y un revisor distinto.
- **Una ejecución ausente o incompleta no cuenta como aprobada.** Un análisis que no pudo ejecutarse es "incompleto", nunca "aprobado".
- Calificación: repositorio y entrega 5%, documentación 5%, cumplimiento técnico 10% (calidad 5% + seguridad 5%), defensa individual 10%.
- Entregable en Profelink: documento con enlace al repo público, alcance de cada miembro, responsabilidades, reparto del trabajo y evidencias.

---

## 3. Alcance elegido (12 ítems: 9 de núcleo + 3 extra, 4 por persona)

El equipo es de 3 personas. Apuntamos a **12 ítems** (el mínimo de un equipo de 4) para no quedar por debajo de lo que pueda exigir el docente. El **núcleo de 9** debe quedar perfecto antes de empezar los extras; un extra nunca se entrega a medias.

| Persona | Núcleo | Extra | Etapas | Requisitos previos que también hay que dejar funcionando |
|---|---|---|---|---|
| **A: Ariana** | **1.3** Modelo de amenazas STRIDE, **1.4** medidas y comprobaciones, **4.5** pruebas de autorización | **4.9** defecto funcional y de seguridad detectados y corregidos | Planificación, Pruebas | 1.1 (3 flujos críticos), 1.2 (mapa de arquitectura y matriz de acceso), 1.5, 1.6, 1.7, 2.2 y 4.2 (pruebas unitarias de una regla de negocio), 4.1 (ambiente aislado de pruebas) |
| **B: Cristhian** | **2.4** hook que conecta al agente con las comprobaciones, **3.2** Semgrep, Gitleaks y OSV-Scanner en CI, **3.6** demostración de bloqueo de integración | **7.8** aprendizaje al siguiente ciclo | Desarrollo, Construcción e integración, Operación | 1.8 (AGENTS.md), 2.1, 2.3 (Semgrep y Gitleaks locales), 2.5 (límites del agente), 3.1 (workflow de CI), 3.5 (protección de ramas) |
| **C: Danny** | **5.1** registro de versión candidata, **6.2** ambiente de despliegue documentado, **7.5** registro único de hallazgos | **5.5** publicación en Docker Hub de la imagen aprobada | Versión, Despliegue, Operación | Dockerfiles, 3.3 (Trivy e imagen con SBOM CycloneDX y digest), 5.2 (condiciones de aprobación), 5.6 (excepciones en el registro) |

Cobertura: las 7 etapas con al menos un ítem cada una. Calidad: 2.2, 4.5, 4.9. Seguridad: 1.3, 3.2, 4.5. IA: 2.4 y 1.6. CI: 3.2, 3.6, 5.1, 5.5.

**Extras opcionales después de cerrar los 12:** 2.6 revisión de código asistida por IA, 7.6 Renovate.

**Fuera de alcance (no instalar ni configurar):** ZAP, Nuclei, Toxiproxy, Artillery, Grafana, Prometheus, Loki, Tempo, DefectDojo, Conftest.

---

## 4. Reglas innegociables para el agente

1. **No inventar evidencia.** Nunca marcar algo como hecho, aprobado o verificado sin haber ejecutado el comando en esta sesión. Guardar la salida resumida en `docs/ssdlc/evidencia/<item>/`. Si algo no se pudo ejecutar, escribir `INCOMPLETO` y el motivo.
2. **No asumir comportamiento ni permisos.** Si el código no deja claro quién puede hacer qué, anotarlo en `docs/kb/dudas.md` con un responsable y preguntar a la persona. Distinguir tres estados: `aprobado` (confirmado por el responsable de requisitos), `observado` (visto en el código) y `sugerido` (propuesta de la IA pendiente de validar).
3. **Sin secretos.** Nunca leer, imprimir ni escribir valores reales. Usar `.env.example`. El único "secreto" permitido es el ficticio de la demo (sección 7), y solo en una rama de demo.
4. **No debilitar controles.** No desactivar reglas, bajar umbrales, borrar o relajar pruebas, ni editar una expectativa para que coincida con el código. No aprobar el propio trabajo.
5. **No hacer `git push`, `gh pr merge` ni `gh pr review`.** Commits locales sí, en pasos pequeños con mensajes claros. El push y el PR los hace la persona.
6. **Versiones y SHA.** Resolver en el momento (con `gh api`, `npm view`, `pip index`) la última versión estable de cada herramienta y de cada GitHub Action, y fijar las acciones de terceros por **SHA completo** con el tag en un comentario. Si no hay red, dejar `TODO-SHA` y listarlo en `PASOS_MANUALES.md`.
7. **Permisos mínimos.** Cada workflow declara `permissions: contents: read` por defecto y amplía solo por job donde haga falta.
8. **Reutilizar, no duplicar.** Un solo archivo de configuración por herramienta, usado en local y en CI. Los scripts de CI llaman a los mismos scripts que el desarrollador.
9. **Español claro y comentarios breves** en scripts y workflows, porque cada integrante debe poder explicarlos en la defensa.
10. **Alcance.** No agregar herramientas ni carpetas fuera de la sección 3. Si algo parece necesario, proponerlo y esperar la confirmación.
11. Al terminar cada fase, escribir en `docs/ssdlc/defensa/<persona>.md` una explicación de qué se hizo, por qué, cómo se demuestra y qué limitaciones tiene.

---

## 5. Fases y dependencias

| Fase | Contenido | Responsable | Depende de |
|---|---|---|---|
| 0 | Reconocimiento del repo (solo lectura) | Todas | Nada |
| 1 | Base: AGENTS.md, CLAUDE.md, permisos del agente, scripts de verificación, hook | B | Fase 0 |
| 2 | Base de conocimiento, modelo de amenazas, matriz de acceso | A | Fase 0 |
| 3 | CI: lint, build, tests, Semgrep, Gitleaks, OSV-Scanner, protección de ramas | B | Fase 1 |
| 4 | Pruebas de autorización en CI | A | Fases 2 y 3 |
| 5 | Dockerfiles, imagen, SBOM, digest, registro de versión candidata | C | Fase 3 |
| 6 | Ambiente de despliegue documentado | C | Fase 5 |
| 7 | Registro único de hallazgos y excepciones | C | Fase 0 |
| 8 | Demostraciones controladas | A, B, C | Fases 1 a 5 |
| 9 | Documento de entrega y guion de defensa | C compila, todas aportan | Todas |

Orden sugerido por día. **Martes:** B hace la Fase 1 y la integra temprano; A hace la Fase 2; C hace la Fase 7. **Miércoles:** B hace la Fase 3; A empieza la Fase 4; C empieza la Fase 5. **Jueves:** cierre de las Fases 4 a 6, las demos de la Fase 8 y el borrador de la Fase 9. **Viernes:** solo pulir y entregar.

---

## 6. Especificación por fase

### Fase 0: Reconocimiento (todas, solo lectura)

Inspeccionar y escribir `docs/ssdlc/REPORTE_INICIAL.md` (lo hace una sola persona; las otras lo leen):

- Estructura (monorepo o carpetas separadas), gestor de paquetes, lockfiles, scripts de `package.json`.
- Framework de pruebas actual, ORM y base de datos, mecanismo de autenticación y autorización (guards, roles, JWT), módulos de NestJS y rutas de React.
- Dockerfiles, `docker-compose`, CI existente, ramas y remoto.
- Qué existe, qué falta, comandos reales de lint, build y test, y preguntas abiertas.
- No ejecutar nada destructivo; no leer `.env`.

### Fase 1: Base del agente (Persona B)

Crear:

- `AGENTS.md` (ítem 1.8 y 2.1). Debe indicar: dónde están los requisitos, permisos, amenazas y medidas (`docs/kb/`); la obligación de **leer los flujos, permisos y amenazas afectados antes de tocar un flujo crítico**; los comandos de verificación; las convenciones; el uso de IDs (`F-xx`, `T-xx`, `M-xx`, `H-xx`, `E-xx`); y que las dudas de permisos se registran en `dudas.md` en vez de asumirse. Aclarar que los cambios de comportamiento, datos, arquitectura o permisos actualizan `docs/kb/` en el mismo PR.
- `CLAUDE.md` con una sola línea que importa `@AGENTS.md`.
- `.claude/settings.json` (ítem 2.5) con:
  - `permissions.deny` para: leer `.env*` y secretos; editar `.github/workflows/**`, `.claude/**`, `scripts/verify.sh`, `scripts/ci/**`, `.semgrep/**`, `.gitleaks.toml`, `osv-scanner.toml` y los archivos de pruebas sin revisión (documentarlo); ejecutar `git push`, `gh pr merge`, `gh pr review`, `gh pr approve`, `rm -rf`, `curl | sh`.
  - Un hook `Stop` que llama a `.claude/hooks/stop-verify.sh`.
- `scripts/verify.sh` (ítems 2.2 y 2.3), con modo rápido y modo completo. Ejecuta lint, build, tests unitarios, Semgrep y Gitleaks. **Si una herramienta no está instalada o falla al ejecutarse, sale con error y el mensaje `INCOMPLETO: <herramienta>`**; no sale en verde.
- `.claude/hooks/stop-verify.sh` (ítem 2.4):
  - Lee el JSON de stdin y respeta `stop_hook_active` para no entrar en bucles.
  - Ejecuta `scripts/verify.sh`. Si falla, imprime los hallazgos por stderr y sale con código 2 para devolver el control al agente.
  - Lleva un contador de reintentos en `.claude/.verify-retries` (ignorado por git). Máximo 3. Al llegar al límite imprime `BLOQUEADO: requiere intervención humana`, deja el rastro en `docs/ssdlc/evidencia/2.4/bloqueos.log` y sale con 0.
  - Reinicia el contador cuando todo pasa.
- Configuración de herramientas: `.semgrep/` (reglas de registro para TypeScript, Node, React y OWASP Top Ten, más un archivo de reglas propias mínimo), `.gitleaks.toml` (`useDefault = true`; cualquier allowlist con ruta, justificación y fecha), y la sección "Cómo ejecutar las comprobaciones" en el README.
- Dentro de la carpeta de pruebas, al menos una prueba unitaria de una regla de negocio relevante con errores y valores límite (ítem 2.2), si no existe.

Criterio de terminado: `scripts/verify.sh` pasa en limpio, falla con el defecto de la demo D1 y D2, y el hook devuelve el fallo al agente y se detiene al llegar al límite.

### Fase 2: Base de conocimiento y amenazas (Persona A)

Crear en `docs/kb/` (Markdown, con IDs simples y sin repetir información):

- `README.md`: índice y convención de IDs.
- `flujos.md` (1.1): **tres flujos críticos** `F-01..F-03`, elegidos desde el código y justificados por los datos que manejan o el impacto de un fallo. Para cada uno: actor, objetivo, resultado esperado y criterios Dado/Cuando/Entonces con **éxito, error y uso indebido**. Marcar cada regla como `aprobado`, `observado` o `sugerido`.
- `arquitectura-y-acceso.md` (1.2): diagrama Mermaid de componentes, servicios externos, datos protegidos y límites de confianza; datos sensibles con consecuencia de exposición, modificación o pérdida; y la **tabla actor/rol → recurso → acción → condición de acceso**, incluida la propiedad del recurso y el acceso sin sesión.
- `amenazas.md` (1.3 y 1.4): al menos 6 amenazas STRIDE (el mínimo académico es 3). Columnas: ID `T-xx`, categoría STRIDE, flujo o recurso, impacto, prioridad con justificación, medida `M-xx`, componente, comprobación prevista, responsable, estado (`propuesta`, `implementada`, `verificada`) y decisión (mitigar, o posponer con quién acepta el riesgo y cuándo se revisa). Seguir el formato del ejemplo de Profelink de los lineamientos.
- `terceros-y-secretos.md` (1.5): servicios externos y dependencias críticas con función, datos que reciben y tratamiento de riesgos; referencia a `package.json` y lockfiles sin copiar el inventario. Para secretos: propósito, consumidores, permisos, responsable y ubicación prevista, **sin valores**.
- `dudas.md` (1.6): preguntas abiertas con responsable de resolverlas. Incluir las ideas de casos límite y abuso propuestas por la IA, marcadas `sugerido` hasta que el equipo las valide.
- `docs/threat-model/README.md`: pasos para dibujar el diagrama en **OWASP Threat Dragon** (uso del DFD de `arquitectura-y-acceso.md` como base) y guardar el JSON en `docs/threat-model/threat-model.json`. El dibujo en Threat Dragon lo hace la persona; el agente deja el borrador en Mermaid y la tabla de amenazas.

Criterio de terminado: cada flujo tiene comportamiento y permisos definidos, cada amenaza prioritaria tiene decisión, medida, comprobación prevista y responsable, y las dudas bloqueantes están resueltas o asignadas.

### Fase 3: CI (Persona B)

Crear:

- `.github/workflows/ci.yml` (3.1): disparado por `pull_request` hacia `development` y `main`. Instala con los lockfiles (`npm ci`), ejecuta lint, build y pruebas unitarias del backend y del frontend. Si hacen falta servicios (base de datos), usa un contenedor de servicio con datos ficticios.
- `.github/workflows/security.yml` o jobs equivalentes (3.2): Semgrep CE con la **misma configuración** de `.semgrep/`, Gitleaks con `.gitleaks.toml` (historial completo con `fetch-depth: 0`), y OSV-Scanner sobre los lockfiles. Documentar en `docs/ssdlc/politica-de-bloqueo.md` qué hallazgos bloquean y el código de salida. Un análisis que no se pudo ejecutar **falla el job** (incompleto, no aprobado). Las excepciones de OSV van en `osv-scanner.toml` con fecha de vencimiento y referencia al `E-xx` del registro.
- Subida de los reportes (SARIF o JSON) como artefactos de Actions asociados al commit.
- `.github/CODEOWNERS` con la revisión cruzada de la sección 1.
- `scripts/setup/branch-protection.sh` (3.5): usa `gh api` para exigir en `development` y `main`: PR obligatorio, 1 aprobación de otra persona, checks obligatorios con nombre exacto, revisión de cambios en `.github/**`, y sin push directo. **Lo ejecuta una persona con permisos de administrador; el agente no lo ejecuta.** Incluir en el workflow la recomendación de que las acciones de terceros estén fijadas por SHA.
- `.github/pull_request_template.md`: casilla de IDs afectados (F, T, M), actualización de `docs/kb/`, evidencia de comprobaciones y revisor.

Criterio de terminado (3.6): un PR con defecto controlado queda **bloqueado** (botón de fusión deshabilitado) por un check obligatorio fallido, se corrige y se fusiona, y los reportes quedan como artefactos del commit.

### Fase 4: Pruebas de autorización (Persona A)

Implementar con Jest + Supertest sobre una base de datos de pruebas (contenedor de servicio en CI; local con Docker Compose o la opción que detecte la Fase 0):

- `test/authz/` con casos derivados **directamente** de la tabla de acceso de `arquitectura-y-acceso.md`: permitido y denegado por rol, por propiedad del recurso y sin sesión.
- Las solicitudes van **directo a la API**, no a través de la interfaz.
- Cada rechazo comprueba que no se expuso ni modificó ningún dato (releer el recurso y comparar).
- Cada prueba lleva en el nombre los IDs que cubre, por ejemplo `[F-02][T-03] estudiante no puede modificar la nota`.
- Rutas alternativas que lleguen a los mismos datos (búsquedas, exportaciones, descargas), si existen.
- Scripts de ambiente reproducible: crear cuentas con distintos permisos, cargar datos ficticios y limpiar, sin depender de producción ni de ejecuciones anteriores.
- Job `authz-tests` en `ci.yml` (PR revisado por B) y actualización de las columnas de estado en `amenazas.md` (`implementada` → `verificada` solo con evidencia de ejecución).

Regla: si una prueba falla porque el código no respeta la regla aprobada, **se corrige el código, no la prueba**. Si la regla es dudosa, va a `dudas.md`.

**Ítem 4.9 (extra de Ariana):** en ramas `demo/*`, introducir de forma controlada **un defecto funcional** (una regla de negocio que deje de cumplirse) y **uno de seguridad** (un permiso que deje de comprobarse), usando solo cuentas y datos ficticios. Conservar tres evidencias por defecto: ejecución fallida, corrección y ejecución aprobada. Si el agente participa en la corrección, la persona revisa el diff de las pruebas para confirmar que no se debilitó ninguna aserción.

### Fase 5: Imagen y versión candidata (Persona C)

Crear:

- `Dockerfile` para backend y para frontend (multi-stage, usuario **no root** explícito, sin secretos, `.dockerignore`), y `docker-compose.yml` para ambiente local de pruebas.
- `.github/workflows/release.yml`: en `push` a `development` y `main`, después de que pasen los checks requeridos, construye la imagen, la analiza con **Trivy** (vulnerabilidades y configuración del Dockerfile), genera el **SBOM CycloneDX**, y publica en **Docker Hub** la misma imagen que se analizó (sin reconstruirla), con etiqueta basada en el SHA. Si faltan los secretos `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`, el job termina en `INCOMPLETO`, no en verde.
- `scripts/release/make-release-record.sh` (5.1): genera el registro de la versión candidata (`release-record.md` y `.json`) con **SHA del commit, digest de la imagen, requisitos o cambios incluidos (PR fusionados), y enlaces a los reportes de pruebas, de seguridad y al SBOM**, sin copiar los reportes. Se sube como artefacto y marca la versión como `NO APROBADA` si algún check obligatorio falló, se omitió o no produjo resultados.
- `docs/ssdlc/version-de-recuperacion.md`: imagen anterior por digest y pasos de reversión.

### Fase 6: Ambiente de despliegue documentado (Persona C, ítem 6.2)

Crear `docs/ssdlc/despliegue.md` y `deploy/` (sin secretos):

- Plataforma elegida: **la más barata o gratuita con el correo institucional**. El equipo debe verificar qué beneficios educativos tiene activos (por ejemplo GitHub Student Developer Pack o Azure for Students) y registrar la decisión. Alternativa mínima: `docker compose` en un ambiente temporal del runner.
- Componentes desplegados, servicios necesarios, puertos expuestos (la base de datos **no** pública), HTTPS, y pasos para reproducir el despliegue usando los digests de la versión aprobada.
- `deploy/docker-compose.yml` que toma las imágenes por digest desde variables, y `deploy/.env.example` con nombres sin valores.

### Fase 7: Registro único de hallazgos (Persona C, ítem 7.5)

Con GitHub Issues:

- `.github/ISSUE_TEMPLATE/hallazgo.yml` (origen, versión afectada, evidencia, severidad con justificación, responsable, estado, tratamiento, IDs enlazados `T-xx`, `M-xx`, `E-xx`) y `excepcion.yml` (hallazgo, alcance o versión, evidencia, justificación, responsable, aprobación humana, fecha de vencimiento o revisión).
- `scripts/setup/labels.sh` (lo ejecuta una persona) con las etiquetas: `hallazgo`, `excepcion`, `confirmado`, `falso-positivo`, `pendiente`, y severidades.
- `docs/ssdlc/registro.md`: cómo se usa, cómo se distinguen confirmados, falsos positivos y pendientes, y cómo se enlazan amenazas y excepciones sin copiar información. Una credencial real expuesta se **rota o revoca**; no basta eliminarla ni registrar una excepción.

---

## 7. Defectos controlados y demostraciones

Todas en ramas `demo/*`, con PR propio. Los PR defectuosos **no se fusionan** hasta corregirlos (o se cierran dejando evidencia).

| Demo | Quién | Qué | Evidencia |
|---|---|---|---|
| D1 Secreto ficticio | B | Agregar un token **claramente falso** que coincida con una regla por defecto de Gitleaks (el agente debe verificar localmente que se detecta; algunas claves de ejemplo conocidas están en la lista de exclusión de Gitleaks y no sirven) | Falla local, falla en CI, fusión bloqueada, corrección, verde |
| D2 Defecto de código | B | Código inseguro que detecte una regla de Semgrep configurada (por ejemplo una consulta construida por concatenación) | Igual que D1 |
| D3 Ciclo del agente | B | Pedir un cambio acotado que provoque un fallo; el hook lo devuelve al agente; el agente corrige. Luego un caso que no pueda resolverse y llegue al límite de 3 reintentos y se detenga | Diff, comandos, salida del hook, revisión humana, `bloqueos.log` |
| D4 Regresión de autorización | A | Quitar la comprobación de propiedad en un endpoint; la prueba de `4.5` debe fallar; restaurar y ver verde | Ejecución fallida, corrección, ejecución aprobada |
| D5 Versión no aprobada | C | Con un check obligatorio fallido, el registro de versión sale `NO APROBADA` y no se publica como aprobada | Registro, ejecución del workflow |
| D6 Mejora continua (ítems 7.5 y 7.8) | C y B | Tomar un hallazgo real de D1 a D5, registrarlo como Issue, cerrarlo con un PR y una nueva comprobación, y actualizar una instrucción de `AGENTS.md`, una medida o una prueba de regresión explicando qué se aprendió | Issue enlazado al PR, diff de la mejora, texto del aprendizaje |

Nada de esto usa cuentas, datos ni secretos reales.

---

## 8. Documentos de entrega

- `docs/ssdlc/ENTREGA.md` (para Profelink): enlace al repo público; tabla de ítems por persona con responsable y revisor; cómo se repartió el trabajo; y, **por cada ítem**, enlaces al código o configuración, al PR, al commit, a la ejecución de Actions, al artefacto y al digest cuando corresponda; limitaciones conocidas; excepciones abiertas.
- `docs/ssdlc/defensa/persona-A.md`, `persona-B.md`, `persona-C.md`: por cada ítem propio, qué hace, por qué se hizo así, cómo se demuestra en vivo, qué comprueba y qué **no** comprueba. La persona los reescribe con sus palabras.
- `docs/ssdlc/evidencia/<item>/`: salidas resumidas de comandos y capturas.

---

## 9. Pasos manuales (el agente los deja listados en `docs/ssdlc/PASOS_MANUALES.md`)

- Hacer público el repo y crear las ramas `development` y `main`.
- Ejecutar `scripts/setup/branch-protection.sh` y `scripts/setup/labels.sh` con una cuenta de administrador.
- Crear en GitHub los secretos `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` (token con permisos mínimos).
- Dibujar el modelo en Threat Dragon y guardar el JSON.
- Resolver los `TODO-SHA` de las acciones si no hubo red.
- Verificar el beneficio educativo para el despliegue y registrar la decisión.
- Hacer los `git push` y los PR, y las revisiones cruzadas.

---

## 10. Checklist final antes de entregar

- [ ] Cada persona tiene 3 ítems demostrables y un revisor distinto asignado.
- [ ] Hay al menos un ítem por cada una de las 7 etapas.
- [ ] `scripts/verify.sh` y los workflows pasan en limpio sobre el último commit de `development`.
- [ ] Cada afirmación de `ENTREGA.md` tiene un enlace verificable (PR, run, artefacto, digest).
- [ ] No hay secretos reales en el repo ni en el historial; el secreto ficticio solo está en la rama de demo.
- [ ] Las limitaciones y excepciones están escritas, no escondidas.
- [ ] Cada integrante puede explicar y demostrar sus 3 ítems sin ayuda de la IA.
