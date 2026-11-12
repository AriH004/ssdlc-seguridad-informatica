import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveScanRange } from '../security-tools.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('resolveScanRange calcula rango correcto en pull_request', () => {
  const baseSha = 'a'.repeat(40);
  const headSha = 'b'.repeat(40);
  const event = { pull_request: { base: { sha: baseSha }, head: { sha: headSha } } };
  const range = resolveScanRange(event, 'pull_request');
  assert.equal(range, `${baseSha}..${headSha}`);
});

test('resolveScanRange calcula rango en push válido', () => {
  const beforeSha = '1'.repeat(40);
  const afterSha = '2'.repeat(40);
  const event = { before: beforeSha, after: afterSha };
  const range = resolveScanRange(event, 'push');
  assert.equal(range, `${beforeSha}..${afterSha}`);
});

test('resolveScanRange rechaza rangos maliciosos o mal formateados', () => {
  assert.throws(() => resolveScanRange({ pull_request: { base: { sha: 'invalido' } } }, 'pull_request'));
  assert.throws(() => resolveScanRange({}, 'unknown'));
});

test('osv-scanner.toml existe y contiene estructura de excepciones [[IgnoredVulns]]', () => {
  const tomlPath = resolve(root, 'osv-scanner.toml');
  assert.ok(existsSync(tomlPath), 'osv-scanner.toml debe existir en la raíz');
  const content = readFileSync(tomlPath, 'utf8');
  assert.match(content, /\[\[IgnoredVulns\]\]/);
  assert.match(content, /ignoreUntil/);
  assert.match(content, /E-xx/);
});

test('.semgrep/resdigital-rules.yaml existe y define reglas para demo D2 y seguridad', () => {
  const semgrepPath = resolve(root, '.semgrep', 'resdigital-rules.yaml');
  assert.ok(existsSync(semgrepPath), 'resdigital-rules.yaml debe existir en .semgrep/');
  const content = readFileSync(semgrepPath, 'utf8');
  assert.match(content, /resdigital-sql-concatenation/);
  assert.match(content, /D2 - Defecto de código controlado/);
  assert.match(content, /resdigital-unsafe-innerhtml/);
  assert.match(content, /resdigital-hardcoded-jwt-secret/);
});

test('.semgrepignore excluye carpetas de compilación y librerías externas', () => {
  const ignorePath = resolve(root, '.semgrepignore');
  assert.ok(existsSync(ignorePath), '.semgrepignore debe existir en la raíz');
  const content = readFileSync(ignorePath, 'utf8');
  assert.match(content, /node_modules\//);
  assert.match(content, /\.next\//);
  assert.match(content, /dist\//);
});

test('docs/ssdlc/politica-de-bloqueo.md define criterios de severidad y códigos de salida', () => {
  const docPath = resolve(root, 'docs', 'ssdlc', 'politica-de-bloqueo.md');
  assert.ok(existsSync(docPath), 'politica-de-bloqueo.md debe existir en docs/ssdlc/');
  const content = readFileSync(docPath, 'utf8');
  assert.match(content, /Semgrep CE/);
  assert.match(content, /OSV-Scanner/);
  assert.match(content, /Gitleaks/);
  assert.match(content, /INCOMPLETO/);
});
