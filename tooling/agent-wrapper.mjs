import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Lee la carga JSON de stdin de forma no bloqueante con timeout seguro.
 * Si Claude Code cierra stdin al enviar el payload, se resuelve de inmediato.
 * Si stdin es un pipe abierto sin datos o una terminal, resuelve {} tras timeout.
 */
export async function readStdinPayload(timeoutMs = 150) {
  if (process.stdin.isTTY) {
    return {};
  }

  return new Promise((resolvePromise) => {
    let data = '';
    const timer = setTimeout(() => {
      try {
        process.stdin.pause();
      } catch {}
      resolvePromise({});
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      try {
        resolvePromise(data.trim() ? JSON.parse(data.trim()) : {});
      } catch {
        resolvePromise({});
      }
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      resolvePromise({});
    });
    process.stdin.resume();
  });
}

/**
 * Obtiene el hash del commit actual de Git para trazabilidad.
 */
function getGitCommit(cwd) {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'sin-commit';
  }
}

/**
 * Ejecutor por defecto del comando de verificación (scripts/verify.sh).
 */
function defaultExecutor(command, { cwd }) {
  const result = spawnSync('bash', ['scripts/verify.sh'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

/**
 * Motor central de verificación agéntica con control de reintentos (Ítem 2.4).
 *
 * @param {object} options
 * @param {string} [options.projectRoot] - Ruta raíz del proyecto.
 * @param {number} [options.maxRetries=3] - Límite máximo de reintentos antes de bloquear.
 * @param {string} [options.retryFilePath] - Archivo de persistencia de contador.
 * @param {string} [options.logFilePath] - Archivo de auditoría de bloqueos.
 * @param {object} [options.stdinPayload={}] - Carga JSON del hook (e.g. stop_hook_active).
 * @param {Function} [options.executeFn] - Función de ejecución del comando de verificación.
 * @param {object} [options.streams] - Streams para salida estándar y de error.
 * @returns {Promise<{ exitCode: number, message: string, retries: number }>}
 */
export async function runAgentVerification(options = {}) {
  const root = options.projectRoot || defaultRoot;
  const maxRetries = options.maxRetries ?? 3;
  const retryFilePath = options.retryFilePath || resolve(root, '.claude', '.verify-retries');
  const logFilePath = options.logFilePath || resolve(root, 'docs', 'ssdlc', 'evidencia', '2.4', 'bloqueos.log');
  const stdinPayload = options.stdinPayload ?? {};
  const executor = options.executeFn || defaultExecutor;
  const stdout = options.streams?.stdout || process.stdout;
  const stderr = options.streams?.stderr || process.stderr;

  // Leer contador actual de reintentos
  let currentRetries = 0;
  if (existsSync(retryFilePath)) {
    try {
      const raw = readFileSync(retryFilePath, 'utf8').trim();
      currentRetries = parseInt(raw, 10) || 0;
    } catch {
      currentRetries = 0;
    }
  }

  // Ejecutar verificación
  const result = executor('scripts/verify.sh', { cwd: root });

  if (result.status === 0) {
    // Éxito: resetear contador a 0 y permitir finalización (exit 0)
    if (existsSync(retryFilePath)) {
      mkdirSync(dirname(retryFilePath), { recursive: true });
      writeFileSync(retryFilePath, '0\n', 'utf8');
    }
    const successMsg = 'RESULTADO: APROBADO (todas las verificaciones del agente pasaron exitosamente)\n';
    stdout.write(result.stdout || '');
    stdout.write(successMsg);
    return { exitCode: 0, message: successMsg, retries: 0 };
  }

  // Hubo fallo en la verificación
  const nextRetries = currentRetries + 1;
  mkdirSync(dirname(retryFilePath), { recursive: true });
  writeFileSync(retryFilePath, `${nextRetries}\n`, 'utf8');

  if (nextRetries >= maxRetries) {
    // Límite de reintentos alcanzado: registrar bloqueo y terminar (exit 0 para no loopear)
    const timestamp = new Date().toISOString();
    const commit = getGitCommit(root);
    const failureSummary = (result.stderr || result.stdout || 'Verificación fallida sin salida detallada')
      .split('\n')
      .filter((line) => line.includes('FALLÓ') || line.includes('INCOMPLETO') || line.includes('NO APROBADO') || line.includes('error'))
      .slice(0, 5)
      .join(' | ') || 'Comprobaciones no superadas';

    const logEntry = `[${timestamp}] COMMIT: ${commit} | REINTENTOS: ${nextRetries}/${maxRetries} | ESTADO: BLOQUEADO | MOTIVO: ${failureSummary}\n`;
    mkdirSync(dirname(logFilePath), { recursive: true });
    appendFileSync(logFilePath, logEntry, 'utf8');

    const blockMsg = `\nBLOQUEADO: requiere intervención humana (límite de ${maxRetries} reintentos superado).\n` +
      `Se ha registrado el incidente en: docs/ssdlc/evidencia/2.4/bloqueos.log\n` +
      `Detalle del fallo final:\n${result.stderr || result.stdout}\n`;

    stderr.write(blockMsg);
    return { exitCode: 0, message: blockMsg, retries: nextRetries };
  }

  // Aún quedan reintentos disponibles: devolver código 2 para retroalimentar al agente
  const retryMsg = `\n[AGENTE RECHAZADO - REINTENTO ${nextRetries}/${maxRetries}]\n` +
    `Las comprobaciones locales de calidad/seguridad (verify.sh) no pasaron.\n` +
    `Revisa y corrige los siguientes fallos antes de concluir la tarea:\n\n` +
    `${result.stdout}\n${result.stderr}\n`;

  stderr.write(retryMsg);
  return { exitCode: 2, message: retryMsg, retries: nextRetries };
}

// Ejecución directa por CLI o por hook
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  readStdinPayload()
    .then((stdinPayload) => runAgentVerification({ stdinPayload }))
    .then(({ exitCode }) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      process.stderr.write(`Error crítico en agent-wrapper: ${error.message}\n`);
      process.exitCode = 1;
    });
}
