export function assertReleaseAllowed(jobs, event) {
  if (!['pull_request', 'push', 'workflow_dispatch'].includes(event)) throw Error('Unknown release event');
  for (const name of ['quality', 'security', 'migration-replay', 'authz-tests', 'images']) {
    if (jobs[name]?.result !== 'success') throw Error(`Required job ${name} did not succeed`);
  }
  const expected = event === 'pull_request' ? 'success' : 'skipped';
  if (jobs.dependencies?.result !== expected) throw Error('Dependency review is missing, incomplete or unexpectedly skipped');
}
if (process.env.RELEASE_GATE_CLI === 'true') {
  try { assertReleaseAllowed(JSON.parse(process.env.RESULTS ?? '{}'), process.env.EVENT_NAME); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
