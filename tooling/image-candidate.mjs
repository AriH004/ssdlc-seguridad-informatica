import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function docker(args, capture = true) {
  return execFileSync('docker', args, { encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' })?.trim();
}
async function checksum(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
function identity(image, app, commit) {
  const info = JSON.parse(docker(['image', 'inspect', image]))[0];
  if (!['node', '1000', '1000:1000'].includes(info.Config.User)) throw Error('The image must explicitly run as non-root');
  if (info.Config.Labels?.['org.opencontainers.image.revision'] !== commit) throw Error('Image revision mismatch');
  if (app === 'backend' && JSON.stringify(info.Config.Cmd) !== JSON.stringify(['node', 'dist/main.js'])) throw Error('Unexpected backend entrypoint');
  return info;
}
async function verify(app, image) {
  if (app === 'backend') {
    docker(['run', '--rm', '--network', 'none', '--entrypoint', 'node', image, '--input-type=module', '-e',
      "import fs from 'node:fs'; import assert from 'node:assert/strict'; await import('@nestjs/core'); await import('typeorm'); assert(fs.existsSync('dist/main.js')); assert(!fs.existsSync('.env')); assert(!fs.existsSync('src')); console.log('Backend artifact and production dependency smoke passed; database and HTTP flow are outside this smoke.');"], false);
  } else {
    const name = `resdigital-image-smoke-${randomUUID()}`;
    docker(['run', '-d', '--rm', '--network', 'none', '--name', name, image]);
    try {
      let ok = false;
      for (let i = 0; i < 30; i++) {
        try {
          docker(['exec', name, 'node', '-e', "fetch('http://127.0.0.1:3000/privacidad').then(async r=>{if(r.status!==200||!(await r.text()).includes('<html'))process.exit(1)}).catch(()=>process.exit(1))"]);
          ok = true; break;
        } catch { await new Promise(done => setTimeout(done, 500)); }
      }
      if (!ok) throw Error('Frontend HTTP smoke did not return HTML with status 200');
      console.log('Frontend public-page HTTP smoke passed; authenticated flows are outside this smoke.');
    } finally { docker(['stop', name]); }
  }
}
async function main() {
  const [mode, app, commit, directory = 'image-artifacts'] = process.argv.slice(2);
  if (!['backend', 'frontend'].includes(app) || !/^(?:[a-f0-9]{40}|local-demo)$/.test(commit ?? '')) throw Error('Invalid app or commit');
  const image = `resdigital-${app}:${commit}`;
  const dir = resolve(directory); const archive = resolve(dir, `${app}.tar`); const recordPath = resolve(dir, `${app}.json`);
  if (mode === 'verify') {
    const info = identity(image, app, commit);
    await verify(app, image);
    mkdirSync(dir, { recursive: true });
    docker(['image', 'save', '--output', archive, image], false);
    const record = { app, commit, image, imageId: info.Id, user: info.Config.User, archiveSha256: await checksum(archive), smoke: 'passed', scope: app === 'backend' ? 'Production dependencies and artifact presence; no database or HTTP integration' : 'Public page HTTP 200; no authenticated end-to-end flow', localDemo: commit === 'local-demo' };
    writeFileSync(recordPath, JSON.stringify(record, null, 2) + '\n');
    console.log(JSON.stringify(record));
  } else if (mode === 'publish') {
    const record = JSON.parse(readFileSync(recordPath, 'utf8'));
    const username = process.env.DOCKERHUB_USERNAME?.toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(username ?? '')) throw Error('Missing or invalid Docker Hub username');
    if (commit === 'local-demo' || record.localDemo || record.app !== app || record.commit !== commit || record.smoke !== 'passed') throw Error('Candidate record is not publishable');
    if (record.archiveSha256 !== await checksum(archive)) throw Error('Candidate archive checksum mismatch');
    docker(['image', 'load', '--input', archive], false);
    if (identity(image, app, commit).Id !== record.imageId) throw Error('Loaded image differs from tested candidate');
    const target = `${username}/resdigital-${app}:${commit}`;
    docker(['image', 'tag', image, target]);
    docker(['image', 'push', target], false);
    const info = JSON.parse(docker(['image', 'inspect', target]))[0];
    const digest = info.RepoDigests?.find(value => value.startsWith(`${username}/resdigital-${app}@sha256:`));
    if (!digest || info.Id !== record.imageId) throw Error('Published digest or identity could not be verified');
    writeFileSync(resolve(dir, `${app}-published.json`), JSON.stringify({ ...record, tag: target, digest }, null, 2) + '\n');
    console.log(`Published tested image: ${digest}`);
  } else throw Error('Expected verify or publish');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
