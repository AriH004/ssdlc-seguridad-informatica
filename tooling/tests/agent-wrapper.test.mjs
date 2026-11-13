import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runAgentVerification } from '../agent-wrapper.mjs';

function createMockStream() {
  let content = '';
  return {
    write(chunk) {
      content += chunk;
      return true;
    },
    get content() {
      return content;
    },
  };
}

test('verificación exitosa inicial devuelve exitCode 0 y reinicia contador', async () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'agent-wrapper-test-'));
  const retryFilePath = join(tmpDir, '.verify-retries');
  const logFilePath = join(tmpDir, 'bloqueos.log');
  const stdout = createMockStream();
  const stderr = createMockStream();

  try {
    const outcome = await runAgentVerification({
      projectRoot: tmpDir,
      retryFilePath,
      logFilePath,
      executeFn: () => ({ status: 0, stdout: 'OK lint\nOK pruebas\nRESULTADO: APROBADO', stderr: '' }),
      streams: { stdout, stderr },
    });

    assert.equal(outcome.exitCode, 0);
    assert.equal(outcome.retries, 0);
    assert.match(stdout.content, /RESULTADO: APROBADO/);
    assert.equal(stderr.content, '');
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('primer fallo incrementa contador a 1, devuelve exitCode 2 y emite alerta por stderr', async () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'agent-wrapper-test-'));
  const retryFilePath = join(tmpDir, '.verify-retries');
  const logFilePath = join(tmpDir, 'bloqueos.log');
  const stdout = createMockStream();
  const stderr = createMockStream();

  try {
    const outcome = await runAgentVerification({
      projectRoot: tmpDir,
      retryFilePath,
      logFilePath,
      executeFn: () => ({ status: 1, stdout: 'FALLÓ pruebas', stderr: 'AssertionError: expected true to be false' }),
      streams: { stdout, stderr },
    });

    assert.equal(outcome.exitCode, 2);
    assert.equal(outcome.retries, 1);
    assert.equal(readFileSync(retryFilePath, 'utf8').trim(), '1');
    assert.match(stderr.content, /\[AGENTE RECHAZADO - REINTENTO 1\/3\]/);
    assert.match(stderr.content, /AssertionError/);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('segundo fallo consecutivo incrementa contador a 2 y devuelve exitCode 2', async () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'agent-wrapper-test-'));
  const retryFilePath = join(tmpDir, '.verify-retries');
  const logFilePath = join(tmpDir, 'bloqueos.log');
  const stdout = createMockStream();
  const stderr = createMockStream();

  try {
    writeFileSync(retryFilePath, '1\n', 'utf8');

    const outcome = await runAgentVerification({
      projectRoot: tmpDir,
      retryFilePath,
      logFilePath,
      executeFn: () => ({ status: 1, stdout: 'FALLÓ typecheck', stderr: 'Type error: cannot find name foo' }),
      streams: { stdout, stderr },
    });

    assert.equal(outcome.exitCode, 2);
    assert.equal(outcome.retries, 2);
    assert.equal(readFileSync(retryFilePath, 'utf8').trim(), '2');
    assert.match(stderr.content, /\[AGENTE RECHAZADO - REINTENTO 2\/3\]/);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('tercer fallo consecutivo alcanza el límite de 3 reintentos: declara BLOQUEADO, audita en log y sale con 0', async () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'agent-wrapper-test-'));
  const retryFilePath = join(tmpDir, '.verify-retries');
  const logFilePath = join(tmpDir, 'bloqueos.log');
  const stdout = createMockStream();
  const stderr = createMockStream();

  try {
    writeFileSync(retryFilePath, '2\n', 'utf8');

    const outcome = await runAgentVerification({
      projectRoot: tmpDir,
      retryFilePath,
      logFilePath,
      executeFn: () => ({ status: 1, stdout: 'FALLÓ build', stderr: 'Module not found: react' }),
      streams: { stdout, stderr },
    });

    assert.equal(outcome.exitCode, 0);
    assert.equal(outcome.retries, 3);
    assert.equal(readFileSync(retryFilePath, 'utf8').trim(), '3');
    assert.match(stderr.content, /BLOQUEADO: requiere intervención humana/);
    assert.match(stderr.content, /límite de 3 reintentos superado/);

    const logContent = readFileSync(logFilePath, 'utf8');
    assert.match(logContent, /REINTENTOS: 3\/3/);
    assert.match(logContent, /ESTADO: BLOQUEADO/);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('corrección exitosa tras reintentos previos reinicia contador a 0 y sale con 0', async () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'agent-wrapper-test-'));
  const retryFilePath = join(tmpDir, '.verify-retries');
  const logFilePath = join(tmpDir, 'bloqueos.log');
  const stdout = createMockStream();
  const stderr = createMockStream();

  try {
    writeFileSync(retryFilePath, '2\n', 'utf8');

    const outcome = await runAgentVerification({
      projectRoot: tmpDir,
      retryFilePath,
      logFilePath,
      executeFn: () => ({ status: 0, stdout: 'RESULTADO: APROBADO', stderr: '' }),
      streams: { stdout, stderr },
    });

    assert.equal(outcome.exitCode, 0);
    assert.equal(outcome.retries, 0);
    assert.equal(readFileSync(retryFilePath, 'utf8').trim(), '0');
    assert.match(stdout.content, /RESULTADO: APROBADO/);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});
