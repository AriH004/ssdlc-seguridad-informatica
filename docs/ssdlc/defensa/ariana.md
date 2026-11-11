# Defensa: Ariana

> Borrador de la IA; reescribir con tus palabras antes de la defensa.

## Ítem 2.2: Calidad y pruebas locales

**Qué se hizo**
- `scripts/verify.sh`: un solo comando que corre lint, typecheck, pruebas, build y Gitleaks. Reutiliza los scripts de `package.json` y `tooling/security-tools.mjs`, los mismos que usa el CI.
- Nuevo comando `gitleaks-tree` en `tooling/security-tools.mjs`, que escanea historial y staging.
- 6 pruebas de valor límite en `lactancia-calc.spec.ts`.
- Sección "Cómo ejecutar las comprobaciones" en el README.

**Por qué así**
- Una herramienta ausente da `INCOMPLETO` y salida distinta de cero: un análisis que no corrió no es aprobado.
- Se fuerza el pnpm 10.32.1 de Corepack porque el pnpm global (v12) rompía los scripts internos con `ERR_PNPM_BAD_PM_VERSION`.
- Gitleaks no usa `dir`, porque ese modo ignora `.gitignore` y marcaba `.next/` (salida de build).

**Cómo se demuestra**: correr `bash scripts/verify.sh` y mostrar el resumen; quitar Gitleaks/dependencias y mostrar `INCOMPLETO`; romper una expectativa y ver `FALLÓ`.

**Qué comprueba**: que el código local pasa calidad estática, pruebas unitarias, compila y no tiene secretos versionados.
**Qué NO comprueba**: integración con BD/RLS, e2e, replay de migraciones, ni nada remoto. Hoy el resultado es NO APROBADO por 2 hallazgos históricos de Gitleaks (ver `evidencia/2.2/README.md`).
