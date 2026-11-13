import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertReleaseAllowed } from '../release-gate.mjs';

const push = () => Object.fromEntries(['quality', 'security', 'migration-replay', 'authz-tests', 'images', 'dependencies'].map(name => [name, { result: name === 'dependencies' ? 'skipped' : 'success' }]));
test('merged commit with complete successful evidence can proceed', () => {
  assert.doesNotThrow(() => assertReleaseAllowed(push(), 'push'));
});
test('every required check blocks publication when failed, skipped, cancelled, incomplete or missing', () => {
  for (const name of ['quality', 'security', 'migration-replay', 'authz-tests', 'images']) {
    for (const result of ['failure', 'skipped', 'cancelled', 'in_progress', undefined]) {
      const jobs = push(); jobs[name] = { result };
      assert.throws(() => assertReleaseAllowed(jobs, 'push'), new RegExp(name));
    }
    const missing = push(); delete missing[name];
    assert.throws(() => assertReleaseAllowed(missing, 'push'), new RegExp(name));
  }
});
test('PR dependency review cannot be skipped or absent', () => {
  const jobs = push();
  assert.throws(() => assertReleaseAllowed(jobs, 'pull_request'));
  jobs.dependencies.result = 'success';
  assert.doesNotThrow(() => assertReleaseAllowed(jobs, 'pull_request'));
  delete jobs.dependencies;
  assert.throws(() => assertReleaseAllowed(jobs, 'pull_request'));
});
test('unknown events and empty results fail closed', () => {
  assert.throws(() => assertReleaseAllowed(push(), 'unknown'));
  assert.throws(() => assertReleaseAllowed({}, 'push'));
});
