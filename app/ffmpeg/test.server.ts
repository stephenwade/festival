import { spawn } from 'node:child_process';

import { getAdminEmitter } from '~/sse/admin-emitter.server';

const emitter = getAdminEmitter();

export function runPing() {
  const ping = spawn('ping', ['stephenwade.me', '-c', '5']);

  ping.stdout.on('data', (data: Buffer) => {
    emitter.emit('stdout', data.toString());
  });

  ping.stderr.on('data', (data: Buffer) => {
    emitter.emit('stderr', data.toString());
  });

  ping.on('close', (code) => {
    emitter.emit('exit code', code);
  });
}
