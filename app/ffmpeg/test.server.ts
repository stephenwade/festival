import { spawn } from 'node:child_process';

export function runPing() {
  const ping = spawn('ping', ['stephenwade.me', '-c', '5']);

  ping.stdout.on('data', (data: Buffer) => {
    console.log(`stdout: ${data.toString()}`);
  });

  ping.stderr.on('data', (data: Buffer) => {
    console.error(`stderr: ${data.toString()}`);
  });

  ping.on('close', (code: number) => {
    console.log(`child process exited with code ${code}`);
  });
}
