Entrega: viernes 13 de noviembre de 2026 a las 23:59:59, hora de Costa
Rica.\
Equipos de 4 a 5 integrantes · Valor total 30%

Apliquen este checklist al proyecto OSINT del equipo o a un proyecto
personal de su elección. El objetivo es construir y demostrar un ciclo
de vida de desarrollo seguro de software (SSDLC) con prácticas de IA,
programación agéntica y DevSecOps. La aplicación sirve como caso de uso
para comprobar el proceso. Cada integrante debe contribuir de forma
verificable y defender su aporte.

La organización toma como referencia las etapas del modelo NIST NCCoE
\[1\]. Los checks son una adaptación docente. Utilicen herramientas open
source para las comprobaciones; GitHub, GitHub Actions y Docker Hub se
utilizan como servicios de colaboración, automatización y publicación.
Pueden utilizar servicios de alojamiento y proveedores de IA compatibles
con el proyecto, documentando las licencias y condiciones de uso
pertinentes.

El equipo asume responsabilidades de desarrollo, seguridad y operación
para proteger la disponibilidad, integridad y confidencialidad de la
aplicación. Los roles pueden rotar; cada actividad tiene un responsable
y las revisiones se realizan por otro integrante.

Las etapas se retroalimentan durante el proyecto. Se reutilizan scripts,
pruebas, configuraciones y evidencias cuando correspondan; cada etapa
demuestra su propósito sin exigir implementaciones duplicadas.

El equipo designa responsables de requisitos, integración y operación.
El responsable del requisito confirma el comportamiento y los permisos;
consulta al docente si la duda afecta el alcance académico. Otro
integrante revisa los PR y valida los resultados que requieren juicio
humano. El responsable de operación atiende las alertas y ejecuta la
recuperación cuando corresponda.

Las excepciones requieren aprobación del responsable designado y de otro
integrante revisor. Si cambian una exigencia académica obligatoria,
deben ser aprobadas por el docente. El equipo mantiene un único registro
de hallazgos y excepciones, referenciado desde las etapas
correspondientes.

# 1 Planificación

**Objetivo:** El equipo construye una base de conocimiento breve y
versionada con el comportamiento esperado, los permisos y los
principales riesgos del proyecto. Esta información orientará al equipo y
al agente de IA durante el desarrollo y la revisión de cambios.

**☐ 1.1 Se seleccionan tres flujos críticos del proyecto, existentes o
previstos para la siguiente entrega, justificando su importancia por los
datos que manejan o el impacto de un fallo.** Para cada flujo se indica
actor, objetivo y resultado esperado, con criterios de aceptación
Dado/Cuando/Entonces que incluyan éxito, errores y uso indebido. Esto
establece qué debe funcionar y qué debe impedirse.

**☐ 1.2 Se documenta un mapa mínimo de arquitectura y acceso para los
flujos seleccionados.** Incluye componentes, servicios externos, datos
protegidos y flujos que cruzan límites de confianza. Se identifica qué
datos son sensibles y qué consecuencias tendría su exposición,
modificación o pérdida. Se acompaña con una tabla de actor o rol →
recurso → acción → condición de acceso, considerando propiedad del
recurso y acceso sin sesión cuando corresponda. Esto permite entender
qué se protege y dónde deben comprobarse los permisos.

**☐ 1.3 Se identifican y priorizan las amenazas relevantes utilizando
STRIDE como guía.** Se utiliza OWASP Threat Dragon, reutilizando su
diagrama como mapa de arquitectura para evitar duplicaciones. Cada
amenaza señala el recurso o flujo afectado, el posible impacto y una
prioridad justificada. Se documentan al menos tres amenazas como mínimo
académico; se agregan las necesarias para cubrir los riesgos importantes
de los flujos seleccionados.

**☐ 1.4 Para cada amenaza priorizada, se registra la medida propuesta,
el componente afectado, la comprobación prevista y un responsable.**
Esta información se mantiene directamente en el modelo de amenazas o en
las tareas del proyecto, sin exigir un catálogo separado. Se distingue
entre una medida propuesta, implementada y verificada; durante la
planificación basta con definirla y explicar cómo se comprobará. Si se
decide posponer su tratamiento, se registra la justificación, quién
acepta el riesgo y cuándo se revisará.

Por ejemplo, en Profelink, si permite modificar calificaciones:

  --------------------------------------------------------------------------------
  **Amenaza**     **Medida           **Componente**   **Comprobación prevista**
                  propuesta**                         
  --------------- ------------------ ---------------- ----------------------------
  Un usuario      Verificar en el    Operación de     Permitir al docente
  modifica una    backend que        actualización de autorizado. Rechazar a
  calificación    únicamente el      notas.           estudiantes, docentes de
  sin             docente autorizado                  otros cursos y usuarios sin
  autorización.   del curso pueda                     sesión, comprobando que la
                  modificarla.                        nota permanezca igual.

  --------------------------------------------------------------------------------

**☐ 1.5 Se identifican los terceros y secretos relevantes para los
flujos seleccionados.** Para servicios externos y dependencias críticas
se indica su función, los datos o permisos que reciben y el tratamiento
previsto de sus principales riesgos. Los paquetes se referencian
mediante los manifiestos y lockfiles existentes, sin copiar manualmente
el inventario completo. Para los secretos se registra propósito,
consumidores, permisos, responsable y ubicación prevista de
almacenamiento, sin incluir sus valores.

**☐ 1.6 Se utiliza IA para proponer casos límite, escenarios de abuso y
posibles omisiones.** El equipo valida las propuestas antes de
incorporarlas como requisitos, amenazas o comprobaciones. Se distingue
entre reglas aprobadas, comportamiento observado en el código y
sugerencias pendientes de validación. Las dudas que afecten permisos o
comportamiento esperado se registran con un responsable de resolverlas;
el agente no debe asumir la respuesta.

**☐ 1.7 Se versiona la base de conocimiento junto al proyecto,
utilizando Markdown y referencias al modelo de amenazas y las tareas
existentes.** Se emplean identificadores simples para relacionar flujos,
amenazas y medidas sin repetir información. Los cambios de
comportamiento, datos, arquitectura o permisos deben actualizar el
contenido afectado dentro del mismo PR. YAML, JSON y un grafo de
contexto son opcionales cuando faciliten una consulta o automatización
concreta.

**☐ 1.8 Se define en AGENTS.md cómo consultar y mantener esta
información.** Antes de modificar un flujo crítico, el agente debe
revisar sus requisitos, permisos, amenazas y medidas previstas. La
revisión del PR debe comprobar si el cambio respeta esas reglas o
requiere actualizarlas. Durante planificación se describe este uso; los
hooks, scripts y checks de CI se implementan en las etapas posteriores.

La planificación se considera completa cuando los flujos seleccionados
tienen comportamiento y permisos definidos, sus principales riesgos
cuentan con una decisión de tratamiento y las medidas propuestas tienen
una comprobación prevista y un responsable. Las dudas que impidan
determinar el comportamiento correcto deben resolverse antes de
implementar la parte afectada. Durante desarrollo y pruebas se agregan
las referencias al código y la evidencia de las comprobaciones.

# 2 Desarrollo

**Objetivo:** El equipo prepara un entorno de programación agéntica que
utilice la base de conocimiento del proyecto, ejecute comprobaciones de
calidad y seguridad y permita revisar sus resultados antes de integrar
el código. Se demuestra su funcionamiento mediante un cambio acotado en
la aplicación.

**☐ 2.1 Se configura el contexto que utilizará el agente durante el
desarrollo.** AGENTS.md indica dónde consultar los requisitos, permisos,
amenazas y medidas definidos en planificación, junto con las
convenciones del proyecto y los comandos de comprobación. Se demuestra
que el agente consulta la información pertinente al cambio y señala las
dudas que requieren una decisión humana.

**☐ 2.2 Se preparan comandos reproducibles de calidad y pruebas.** El
proyecto cuenta con comandos para compilación, linting y pruebas
unitarias, utilizando herramientas compatibles con su tecnología. Las
pruebas cubren una regla de negocio relevante, sus errores y valores
límite. El README explica cómo ejecutarlos y AGENTS.md los referencia,
evitando duplicar instrucciones.

**☐ 2.3 Se incorporan análisis de seguridad al entorno de desarrollo.**
Se configura Semgrep CE o equivalente para analizar el código y Gitleaks
para detectar secretos. Se documenta el alcance de cada análisis y qué
resultados requieren corrección. La demostración utiliza un defecto
controlado y un secreto ficticio para comprobar que las herramientas los
detectan.

**☐ 2.4 Se conecta el agente con las comprobaciones mediante un hook o
wrapper.** Al finalizar una tarea, este mecanismo ejecuta las
verificaciones definidas y devuelve los resultados al agente para que
pueda corregir los fallos. Los reintentos tienen un límite; si el
problema continúa, el flujo se detiene y reporta el bloqueo. Esto
permite demostrar un ciclo de generación, verificación y corrección.

**☐ 2.5 Se establecen límites para la actuación del agente.** Se define
qué archivos y herramientas puede utilizar, qué acciones requieren
intervención humana y cómo se evita exponer secretos. Estos límites se
respaldan con permisos y mecanismos de ejecución; no basta con
escribirlos en AGENTS.md. El agente no puede aprobar su propio trabajo
ni desactivar controles para conseguir una ejecución exitosa. Los
cambios en pruebas, reglas y scripts de verificación requieren revisión
de otro integrante.

**☐ 2.6 Se incorpora una revisión de código asistida por IA.** El
revisor analiza el cambio utilizando los requisitos y riesgos
pertinentes, y señala posibles defectos, problemas de seguridad o
pruebas faltantes. Sus observaciones deben indicar ubicación,
justificación y una comprobación sugerida. Otro integrante valida los
hallazgos y decide su tratamiento; una respuesta favorable de la IA no
sustituye las verificaciones ni la revisión humana.

**☐ 2.7 Se demuestra el flujo completo con un cambio acotado.** El
agente consulta el contexto, propone o implementa el cambio, recibe los
resultados de las herramientas y corrige un fallo detectado. Se
conservan el diff, los comandos ejecutados, sus resultados y la revisión
humana. El equipo explica qué comprobó cada mecanismo y qué aspectos
quedaron fuera de su alcance.

La etapa se considera completa cuando el equipo puede reproducir el
ciclo de desarrollo asistido por agentes y demostrar que un fallo se
detecta, vuelve al agente para su corrección y requiere intervención
humana cuando no puede resolverse dentro de los límites definidos. En la
siguiente etapa, las comprobaciones se trasladan a CI para hacerlas
obligatorias antes de integrar el código.

# 3 Construcción e integración

**Objetivo:** El equipo implementa un pipeline de integración continua
que ejecuta las comprobaciones de calidad y seguridad, construye los
artefactos candidatos y bloquea la integración cuando no se cumplen las
condiciones definidas. Los resultados quedan asociados al código
evaluado y disponibles para revisión.

**☐ 3.1 Se configura GitHub Actions para comprobar cada PR hacia
development o main.** El workflow instala las dependencias usando los
lockfiles y ejecuta linting, compilación y las suites obligatorias
definidas en Pruebas y en las condiciones de aprobación. Cuando una
comprobación requiere servicios o una aplicación en ejecución, se
prepara un ambiente aislado con datos ficticios y se limpia al
finalizar.

**☐ 3.2 Se ejecutan los análisis de código, secretos y dependencias
dentro de CI.** Se reutiliza la configuración de Semgrep CE o del
equivalente seleccionado en Desarrollo, junto con Gitleaks, y se
incorpora análisis de composición de software (SCA) con OSV-Scanner. Se
documentan los hallazgos que bloquean la integración y se configuran los
códigos de salida correspondientes. Un análisis que no pudo ejecutarse
se considera incompleto, no aprobado.

**☐ 3.3 Se construye y analiza la imagen candidata.** Se utiliza Trivy
para revisar vulnerabilidades de la imagen y configuraciones compatibles
de Dockerfile e infraestructura como código. Se genera un SBOM en
formato CycloneDX o SPDX. Los reportes identifican el commit y la imagen
analizados para permitir su uso posterior en la preparación de la
versión.

**☐ 3.4 Se automatizan dos políticas de configuración con Conftest y
OPA/Rego.** Se impide ejecutar contenedores en modo privilegiado y se
exige un usuario no root explícito. El equipo identifica los archivos de
construcción o despliegue donde corresponde comprobar cada condición y
demuestra un caso permitido y uno rechazado por política.

**☐ 3.5 Se protegen las ramas y los permisos del pipeline.** development
y main requieren PR, aprobación de otro integrante y checks obligatorios
antes de fusionar. Se revisan los cambios en workflows, reglas y
pruebas; se limitan los permisos de los tokens y se fijan las acciones
de terceros mediante SHA. El agente de desarrollo no dispone de permisos
para omitir estas protecciones.

**☐ 3.6 Se demuestra que los controles bloquean la integración.** Un
check obligatorio fallido, omitido o incompleto impide fusionar el PR.
Se conservan los reportes como artefactos de GitHub Actions asociados al
commit y se comprueba que CI detecte un fallo aunque las verificaciones
locales se hayan omitido. Puede reutilizarse un defecto controlado de
las etapas anteriores.

**☐ 3.7 Se automatiza la revisión asistida por IA sobre el PR y sus
resultados.** Se reutilizan las instrucciones de revisión definidas en
Desarrollo para analizar el diff, el contexto pertinente y los reportes.
Otro integrante valida las observaciones; las correcciones vuelven a
pasar las comprobaciones. Sus recomendaciones son informativas y no
constituyen una aprobación automática. Se demuestra su ejecución, pero
no se exige encontrar un hallazgo en cada PR.

**☐ 3.8 Se verifica el resultado de la fusión antes de preparar la
versión.** El pipeline evalúa el commit resultante y construye y
comprueba sus artefactos candidatos. La preparación de la versión
utiliza esos resultados y conserva la identidad de las imágenes
aprobadas para publicarlas y desplegarlas sin reconstruirlas.

La etapa se considera completa cuando el equipo demuestra un PR
bloqueado por un fallo, su corrección y posterior integración, y puede
identificar los resultados y artefactos correspondientes al commit
fusionado.

# 4 Pruebas

**Objetivo:** El equipo construye una suite reproducible de pruebas de
calidad y seguridad, apoyándose en IA para identificar escenarios y
generar pruebas. Se demuestra que la suite detecta fallos relevantes y
permite comprobar su corrección, utilizando los requisitos y riesgos
definidos en planificación.

**☐ 4.1 Se preparan el ambiente aislado de pruebas y los datos
controlados que utilizará CI.** Se documentan los comandos para iniciar
el ambiente, crear cuentas con diferentes permisos, cargar datos
ficticios y limpiar los resultados. Las pruebas deben poder repetirse
sin depender de datos de producción ni de ejecuciones anteriores. Se
reutilizan estos scripts desde el pipeline.

**☐ 4.2 Se consolidan las pruebas unitarias de las reglas de negocio.**
Se reutilizan las creadas durante Desarrollo y se incorporan escenarios
de error y valores límite que hagan falta. Las aserciones comprueban
resultados esperados; la cobertura se utiliza para identificar áreas sin
explorar y no como prueba suficiente de calidad.

**☐ 4.3 Se implementan pruebas de integración entre la API y una base de
datos de pruebas.** Se utiliza Supertest, Playwright API tests o un
equivalente compatible con el proyecto. Se comprueban persistencia,
manejo de errores y limpieza de datos, verificando que los componentes
colaboren correctamente.

**☐ 4.4 Se implementan pruebas E2E con Playwright para los tres flujos
críticos seleccionados.** Se comprueba el recorrido desde la interfaz
hasta el backend, incluyendo resultados exitosos y al menos un rechazo
funcional esperado. Los escenarios se relacionan con los criterios de
aceptación definidos en planificación.

**☐ 4.5 Se implementan pruebas de autorización según las reglas de
acceso del proyecto.** Se comprueban accesos permitidos y denegados por
rol, propiedad del recurso y ausencia de sesión, cuando corresponda. Las
solicitudes se realizan también directamente a la API para verificar que
la protección no dependa de la interfaz. Se confirma que los rechazos no
expongan ni modifiquen datos protegidos.

**☐ 4.6 Se comprueban las rutas alternativas que acceden a los mismos
datos protegidos.** Cuando existan búsquedas, exportaciones, descargas u
operaciones masivas, se verifica que respeten las mismas condiciones de
acceso. Esto permite detectar protecciones aplicadas al flujo principal
que puedan omitirse en otras operaciones.

**☐ 4.7 Se configura un análisis dinámico de seguridad (DAST)
reproducible con ZAP Automation Framework.** Incluye rutas públicas y
autenticadas, rastreo, análisis pasivo y análisis activo acotado. Se
verifica que la sesión autenticada funcione y se registran las rutas
analizadas, los hallazgos y las condiciones de fallo. Construcción e
integración ejecuta este plan desde GitHub Actions contra el candidato
en el ambiente aislado. Nuclei puede utilizarse como complemento
opcional con plantillas seleccionadas; DAST no sustituye las pruebas
específicas de autorización.

**☐ 4.8 Se utiliza IA para contrastar los requisitos y riesgos con las
pruebas existentes.** El agente propone escenarios faltantes y ayuda a
implementar las pruebas pertinentes. Otro integrante revisa que los
resultados esperados provengan de las reglas aprobadas y que las
aserciones puedan detectar un incumplimiento. No se acepta modificar la
expectativa de una prueba únicamente para hacerla coincidir con el
código.

**☐ 4.9 Se demuestra que las pruebas detectan fallos y comprueban su
corrección.** Se introduce de forma controlada un defecto funcional y
uno de seguridad, utilizando cuentas y datos ficticios. Se conserva
evidencia de la ejecución fallida, la corrección y la ejecución
aprobada. Si participa un agente en la corrección, los cambios a las
pruebas deben revisarse para confirmar que no debiliten la comprobación.

☐ **4.10** **Se implementa un experimento de resiliencia con Toxiproxy
mediante latencia o interrupción controlada de una conexión.** Se
selecciona una dependencia crítica y se definen el comportamiento
esperado, la duración y el procedimiento de recuperación. Se comprueban
los timeouts, el manejo del fallo, la consistencia de los datos y la
recuperación al restablecer la conexión. Puede utilizarse Artillery para
generar solicitudes y medir la respuesta durante el experimento. Se
conservan resultados y telemetría; la ejecución se limita al ambiente de
pruebas.

La etapa se considera completa cuando otro integrante puede reproducir
las pruebas, identificar qué requisitos y riesgos cubren y observar la
detección y corrección de los fallos demostrados. Una prueba omitida,
una sesión inválida o un análisis que no logró ejecutarse se reportan
como comprobaciones incompletas, no como resultados aprobados.

# 5 Preparación de la versión

**Objetivo:** El equipo establece un proceso reproducible para preparar
y aprobar una versión, relacionando el artefacto que se entregará con
sus cambios, comprobaciones y limitaciones. La aprobación depende de las
condiciones definidas y de la evidencia disponible.

**☐ 5.1 Se genera un registro de la versión candidata.** Incluye el SHA
del commit, el digest de la imagen, los requisitos o cambios incluidos y
los enlaces a los reportes de pruebas, análisis de seguridad y SBOM.
Esto permite identificar exactamente qué se evaluó y qué se entregará,
sin copiar los reportes en otro documento.

**☐ 5.2 Se comprueba que la versión candidata cumpla las condiciones de
aprobación.** El workflow comprueba los resultados de linting,
compilación, pruebas y controles de seguridad del commit fusionado. Un
check obligatorio fallido, omitido o sin resultados impide aprobar la
versión. Solo pueden aceptarse temporalmente hallazgos concretos
mediante una excepción vigente y revisada; una comprobación que no se
ejecutó o no produjo resultados continúa incompleta. La persona
responsable valida las excepciones y la documentación que requieren
juicio humano.

**☐ 5.3 Se presenta un resumen de los cambios y las limitaciones
conocidas.** El resumen se basa en los PR incluidos y los resultados de
las comprobaciones. Otro integrante verifica que las afirmaciones estén
respaldadas y que no se presenten como resueltos problemas pendientes ni
como ejecutadas pruebas ausentes.

**☐ 5.4 Se identifica la versión de recuperación y se documenta cómo
volver a ella.** Se registra la imagen anterior por digest, los pasos de
reversión y las comprobaciones posteriores. Si existen cambios de base
de datos o configuración que impidan volver únicamente a la imagen
anterior, se explica cómo se tratarán. Para una primera entrega, se
documenta cómo retirar el despliegue y recuperar el estado inicial.

**☐ 5.5 Se publica en Docker Hub la misma imagen que aprobó las
comprobaciones.** La publicación se automatiza y se condiciona a los
resultados requeridos. Se utiliza una etiqueta basada en el SHA;
development puede agregarse como referencia al último candidato
aprobado. El despliegue utiliza el digest registrado. Si se reconstruye
o modifica la imagen, debe evaluarse nuevamente antes de aprobarla.

**☐ 5.6 Se referencian las excepciones de seguridad que permanezcan
abiertas en el registro único del proyecto.** Cada excepción incluye el
hallazgo, la versión o alcance afectado, evidencia, justificación,
responsable, aprobación humana y fecha de vencimiento o revisión. Una
credencial real expuesta debe revocarse o rotarse; no basta con
eliminarla del código o registrar una excepción.

La etapa se considera completa cuando el equipo puede identificar la
versión aprobada, consultar la evidencia que respalda su aprobación y
explicar sus limitaciones y procedimiento de recuperación. Se demuestra
que una comprobación obligatoria fallida impide publicar la versión como
aprobada.

# 6 Despliegue

**Objetivo:** El equipo implementa un despliegue automático y
reproducible hacia un ambiente de pruebas, utilizando la versión
aprobada y una configuración segura. Se comprueba el funcionamiento de
la aplicación desplegada y se demuestra cómo recuperar una versión
anterior.

**☐ 6.1 Se automatiza el despliegue de frontend y backend mediante
GitHub Actions.** La fusión en development inicia el proceso, pero solo
se despliega cuando el commit resultante y sus artefactos cumplen las
condiciones de aprobación. Se reutilizan los artefactos aprobados sin
reconstruirlos durante el despliegue.

**☐ 6.2 Se documenta el ambiente elegido y su configuración mínima.** Se
indica la plataforma utilizada ---VPS, Azure, AWS u otra compatible---,
los componentes desplegados, los servicios necesarios y las
instrucciones para reproducir el despliegue. La configuración se
mantiene versionada sin incluir secretos.

**☐ 6.3 Se verifica la identidad y configuración del despliegue.** Las
imágenes utilizadas corresponden a los digests aprobados. La aplicación
dispone de HTTPS, utiliza permisos mínimos y expone únicamente los
servicios necesarios. La base de datos y los servicios internos no
quedan accesibles públicamente salvo una necesidad justificada y
protegida.

**☐ 6.4 Se configura el suministro seguro de credenciales al pipeline y
a la aplicación.** Se utiliza un mecanismo apropiado para cada
consumidor, como secretos protegidos del pipeline y un gestor de
secretos para la aplicación. Se documenta quién puede acceder a ellos y
cómo se reemplazan. No se incluyen valores secretos en Git, imágenes,
artefactos, logs, prompts ni código entregado al navegador.

**☐ 6.5 Se automatizan las comprobaciones posteriores al despliegue.**
Se ejecutan health checks, smoke tests y los E2E de los flujos críticos.
En el ambiente de destino se reutilizan el plan DAST acotado y las
pruebas de autorización para verificar la versión instalada y su
configuración. Las pruebas que modifican o limpian datos utilizan
cuentas y datos exclusivos de prueba. Los resultados quedan asociados a
la versión desplegada; una comprobación obligatoria fallida o incompleta
impide marcar el despliegue como satisfactorio.

**☐ 6.6 Se implementa y demuestra el procedimiento de recuperación.**
Ante un fallo posterior al despliegue, el workflow reporta el problema y
permite ejecutar una reversión automática o una acción manual
documentada. Se demuestra el regreso a una versión anterior identificada
y se repiten las comprobaciones básicas. Si existen cambios de datos o
configuración, se aplica el tratamiento previsto en la preparación de la
versión.

La etapa se considera completa cuando el equipo puede desplegar la
versión aprobada, verificar su identidad y funcionamiento, detectar un
fallo y demostrar la recuperación. Se conserva evidencia del workflow,
las comprobaciones y la reversión.

# 7 Operación y mejora continua

**Objetivo:** El equipo implementa mecanismos para observar la
aplicación desplegada, detectar problemas de calidad y señales de
seguridad, investigar con apoyo de IA y dar seguimiento a las
correcciones. Se demuestra cómo un hallazgo se convierte en una mejora
verificable del proyecto.

**☐ 7.1 Se configura la observabilidad de un flujo crítico de la
aplicación.** Se integran Grafana OSS, Prometheus para métricas, Loki
para logs y OpenTelemetry con Tempo para trazas. Se prepara un dashboard
con tráfico, errores y latencia, y se demuestra cómo relacionar los logs
y las trazas de una misma solicitud mediante identificadores de
correlación.

**☐ 7.2 Se registran eventos relevantes de seguridad sin exponer
información sensible.** Se incluyen intentos fallidos de autenticación,
accesos denegados y cambios de privilegios cuando existan. Los registros
permiten identificar la operación, su resultado y el actor mediante un
identificador apropiado, evitando credenciales, tokens y contenido
sensible. Se define quién puede consultarlos y cuánto tiempo se
conservarán.

**☐ 7.3 Se configura y demuestra una alerta de calidad y una de
seguridad.** Por ejemplo, un aumento de errores de la API e intentos
repetidos de acceso denegado. Cada alerta define umbral, ventana de
tiempo, destinatario y respuesta esperada. Con tráfico controlado se
demuestra su activación, notificación y retorno al estado normal. Una
alerta señala una situación que debe investigarse; no confirma por sí
sola un ataque.

**☐ 7.4 Se utiliza IA para apoyar la investigación de una alerta.** A
partir de logs sanitizados y del contexto pertinente del proyecto, la IA
prepara un resumen, propone hipótesis e indica qué comprobar a
continuación. Una persona contrasta el análisis con la evidencia y
registra la decisión. La IA no cambia permisos, bloquea usuarios ni
modifica el ambiente automáticamente.

**☐ 7.5 Se utiliza el registro único del proyecto para dar seguimiento a
los hallazgos de todas las etapas.** Puede utilizarse GitHub Issues o
DefectDojo Open Source. Cada hallazgo incluye origen, versión afectada,
evidencia, severidad justificada, responsable, estado y tratamiento. Las
amenazas y las excepciones relacionadas se enlazan mediante
identificadores, evitando copiar la misma información. Se distinguen
problemas confirmados, falsos positivos y casos pendientes de
investigación.

**☐ 7.6 Se automatizan las actualizaciones y las revisiones periódicas
de seguridad.** Se configura Renovate y se demuestra un PR real de
actualización sujeto a los mismos controles del proyecto. Se programan
reescaneos de dependencias y de la imagen desplegada, identificada por
digest, y se define cómo sus resultados generan o actualizan hallazgos.

**☐ 7.7 Se demuestra el tratamiento y cierre de un hallazgo.** El
registro enlaza el PR correctivo y una nueva comprobación que confirme
la corrección en la versión correspondiente. Si el riesgo se acepta
temporalmente, se documentan justificación, responsable y fecha de
revisión; no se presenta como corregido.

**☐ 7.8 Se incorpora un aprendizaje al siguiente ciclo de desarrollo.**
A partir de una prueba, alerta o hallazgo, se actualiza un requisito,
una medida de seguridad, una instrucción del agente o una prueba de
regresión. Se explica qué se aprendió y cómo la mejora ayudará a
prevenir o detectar nuevamente el problema.

La etapa se considera completa cuando el equipo puede investigar una
solicitud mediante su telemetría, demostrar las dos alertas, validar un
análisis asistido por IA y seguir un hallazgo hasta su corrección
comprobada. La mejora resultante queda incorporada a la base de
conocimiento o a las verificaciones del proyecto.

## Herramientas, Donde y Cuando Usarlas:

**En la computadora del estudiante (1 Planificación, 2 Desarrollo y 4
Pruebas)**

-   **Threat Dragon: mapa de arquitectura y modelo de amenazas.**

-   **Agente de programación con hook o wrapper, skill, comandos i.e.
    harness de desarrollo: implementación, comprobaciones y
    corrección.**

-   **Linter y compilador: revisión y construcción local.**

-   **Framework de pruebas unitarias: ejecución de pruebas.**

-   **Semgrep CE y Gitleaks: análisis de código y detección de
    secretos.**

-   **Docker: aplicación, dependencias locales, pruebas locales.**

-   **Artillery: preparar y ejecutar el escenario de carga.**

-   **Toxiproxy: introducir latencia o interrumpir conexiones entre
    servicios del ambiente local.**

-   **Supertest o Playwright API tests: pruebas de integración y
    autorización.**

-   **Playwright: creación y depuración de pruebas E2E.**

**En el runner de GitHub Actions (3 Construcción e integración, 4
Pruebas, 5 Preparación de la versión, 6 Despliegue y 7 Operación y
mejora continua)**

-   **Linter, compilador y pruebas unitarias: verificaciones
    obligatorias.**

-   **Semgrep CE, Gitleaks y OSV-Scanner: análisis de código, secretos y
    dependencias.**

-   **Docker: construcción de imágenes y ambientes temporales de
    pruebas.**

-   **Trivy: análisis de imágenes y configuraciones, generación del SBOM
    y reescaneos.**

-   **Conftest + OPA/Rego: comprobación de políticas de configuración.**

-   **Supertest o Playwright API tests: integración y autorización.**

-   **Playwright: E2E contra el ambiente temporal y la aplicación
    desplegada.**

-   **ZAP Automation Framework: DAST contra el ambiente temporal y la
    aplicación desplegada.**

-   **Nuclei ---opcional---: análisis complementario.**

-   **Revisor de IA: revisión del PR y los reportes.**

-   **Scripts de despliegue y reversión: actualización y recuperación
    del ambiente.**

-   **Health checks y smoke tests: comprobaciones posteriores al
    despliegue.**

-   **Renovate: ejecución programada para generar PR de actualización,
    si se elige alojarlo en Actions.**

**En el VPS o ambiente de nube (6 Despliegue y 7 Operación y mejora
continua; recibe las comprobaciones de 4 Pruebas)**

-   **Docker o servicio administrado de contenedores: ejecución del
    frontend y backend.**

-   **Base de datos: almacenamiento de la aplicación.**

-   **Grafana OSS: dashboards y alertas.**

-   **Prometheus: recopilación y almacenamiento de métricas.**

-   **Loki: almacenamiento y consulta de logs.**

-   **Tempo: almacenamiento y consulta de trazas.**

-   **OpenTelemetry: instrumentación dentro de la aplicación; un
    Collector, si se utiliza, corre como servicio.**

-   **DefectDojo ---si se elige---: seguimiento de hallazgos.**

-   **Gestor de secretos: servicio propio o administrado, según la
    solución elegida.**

**Como servicios externos (apoyo transversal a las etapas 1 a 7, según
el servicio)**

-   **GitHub: repositorio, PR, pipeline, protecciones de ramas y
    seguimiento con Issues.**

-   **Docker Hub: almacenamiento y distribución de imágenes.**

-   **Proveedor de IA: ejecución del modelo, si se utiliza uno remoto.**

# Entrega y evaluación por alcance seleccionado

**Selección y reparto.** Cada integrante asume al menos tres ítems
numerados distintos de las etapas 1 a 7: un equipo de cuatro entrega al
menos 12 y uno de cinco, al menos 15. Cada ítem tiene un responsable
principal y un revisor; pueden colaborar, pero el mismo ítem cuenta una
sola vez para el mínimo del equipo.

Distribuyan la selección entre las siete etapas, con al menos un ítem
por etapa. Incluyan calidad, seguridad, uso de IA y automatización en CI
dentro de los ítems elegidos, conectados en un mismo proyecto.
Equilibren el esfuerzo considerando la dificultad y las dependencias, no
solo la cantidad.

**Alcance de la evaluación.** Para esta entrega, las siete etapas y la
lista de herramientas funcionan como catálogo de referencia. Se evalúan
los ítems seleccionados y los requisitos previos necesarios para
demostrarlos. Los cierres de etapa y las condiciones generales de
aprobación se aplican únicamente al alcance elegido; no se exige
completar todos los controles ni instalar todas las herramientas.

**Evidencia y demostración.** Usen el mismo registro para enlazar
configuración o código, PR y evidencia verificable, con commit y digest
cuando corresponda. Conserven los resultados hasta terminar la
evaluación. Una ejecución ausente o incompleta no cuenta como aprobada;
pueden reutilizar evidencia si demuestra cada criterio.

Presenten una demostración integrada del alcance elegido. Cada
integrante explica y demuestra sus tres ítems, las decisiones tomadas,
los resultados y sus limitaciones. La revisión de un compañero
complementa el aporte propio; no sustituye la implementación asignada.

**Entrega del equipo.** Entreguen en Profelink un documento con enlaces
al repositorio público de GitHub y los alcances de cada miembro,
responsabilidades, como se distribuyo el trabajo, y evidencias de la
implementación y artefactos terminados como parte de ese trabajo.

# Criterios de calificación

  -------------------------------------------------------------------------------
  **Criterio**      **Valor**   **Qué se evalúa**
  ----------------- ----------- -------------------------------------------------
  Repositorio y     5%          Organización y reproducción del alcance elegido.
  entrega                       

  Documentación     5%          Selección, responsables, evidencia y limitaciones
                                claras.

  Cumplimiento      10%         Calidad 5% y seguridad 5%: funcionamiento e
  técnico                       integración de los ítems elegidos.

  Defensa           10%         Aporte verificable, demostración y comprensión de
  individual                    los tres ítems propios.
  -------------------------------------------------------------------------------

Total: 30%. Los primeros 20% son grupales y la defensa se califica por
persona. Se puede obtener la nota máxima con el mínimo solicitado: se
valora el cumplimiento demostrado, no la cantidad de herramientas. Lo
parcial recibe crédito según los criterios evidenciados; lo no
demostrado no recibe crédito.

# Referencias principales

\[1\] NIST NCCoE --- Modelo de referencia por etapas.\
https://pages.nist.gov/nccoe-devsecops/notational-reference-model.html

\[2\] Semgrep --- MCP y hooks en agentes de desarrollo.\
https://semgrep.dev/blog/2026/mcp-vs-hooks-ai-agent-security/
