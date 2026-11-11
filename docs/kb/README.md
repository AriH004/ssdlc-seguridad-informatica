# Base de conocimiento (KB) de ResDigital

Responsable: Ariana (requisitos). Esta carpeta es la fuente de verdad de requisitos, permisos, amenazas y medidas. Todo cambio de comportamiento, datos, arquitectura o permisos actualiza la KB **en el mismo PR**.

## Índice

| Archivo | Contenido | Ítem |
|---|---|---|
| [flujos.md](flujos.md) | Tres flujos críticos con criterios Dado/Cuando/Entonces | 1.1 |
| [arquitectura-y-acceso.md](arquitectura-y-acceso.md) | Componentes, límites de confianza, datos protegidos y tabla de acceso | 1.2 |
| [amenazas.md](amenazas.md) | Modelo de amenazas STRIDE, medidas y comprobaciones | 1.3, 1.4 |
| [terceros-y-secretos.md](terceros-y-secretos.md) | Servicios externos y secretos (sin valores) | 1.5 |
| [dudas.md](dudas.md) | Preguntas abiertas y casos límite sugeridos por la IA | 1.6 |
| [../threat-model/README.md](../threat-model/README.md) | Cómo dibujar el modelo en Threat Dragon | 1.3 |

## Convención de IDs (1.7)

| Prefijo | Significa | Ejemplo |
|---|---|---|
| `F-xx` | Flujo crítico | `F-02` |
| `R-xx` | Regla de un flujo (dentro de un `F-xx`) | `F-02/R-03` |
| `T-xx` | Amenaza | `T-04` |
| `M-xx` | Medida de mitigación | `M-04` |
| `D-xx` | Duda abierta | `D-01` |
| `H-xx`, `E-xx` | Hallazgo y excepción del registro único (ver `docs/ssdlc/REGISTRO-HALLAZGOS.md`) | `H-03` |

Cada prueba de autorización lleva en el nombre los IDs que cubre, por ejemplo `[F-02][T-03] el peón no puede anular un tratamiento`.

## Estados de una regla o afirmación

| Estado | Significa |
|---|---|
| `aprobado` | Confirmado por la responsable de requisitos (Ariana) |
| `observado` | Visto en el código; falta que Ariana lo apruebe |
| `sugerido` | Propuesta de la IA pendiente de validar |

**Estado actual de este borrador:** todo está en `observado` o `sugerido`. Nada está `aprobado` hasta que Ariana lo revise contra el código y lo marque.

## Estados de una medida

`propuesta` → `implementada` (existe en el código) → `verificada` (hay una prueba o ejecución con evidencia en `docs/ssdlc/evidencia/`). Una medida pasa a `verificada` solo con evidencia de ejecución.
