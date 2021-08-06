import concurrently from 'concurrently';
import { constants, promises as fs } from 'fs';

const SETS_PATH = `media/sets.json`;
const TEST_SETS_PATH = `test/e2e/sets.json`;
const TEST_MEDIA_PATH_FROM = `test/e2e/10-sec-silence.mp3`;
const TEST_MEDIA_PATH_TO = `dist/media/10-sec-silence.mp3`;

(async () => {
  let setsExist;
  try {
    // eslint-disable-next-line no-bitwise
    await fs.access(SETS_PATH, constants.W_OK | constants.R_OK);
    setsExist = true;
  } catch {
    setsExist = false;
  }

  if (setsExist) {
    console.log(`${SETS_PATH} exists. Backing up...`);
    await fs.rename(SETS_PATH, `${SETS_PATH}.temp`);
  }

  console.log('Copying test sets...');
  await fs.copyFile(TEST_SETS_PATH, SETS_PATH);

  console.log('Building...');
  await concurrently(['E2E=yes npm run build']);

  console.log('Copying test media file...');
  await fs.copyFile(TEST_MEDIA_PATH_FROM, TEST_MEDIA_PATH_TO);

  console.log('Testing...');
  let failed = false;
  try {
    await concurrently(
      [
        'npx playwright install && npx playwright test test/e2e/e2e.spec.ts',
        'npm run start:build',
      ],
      { killOthers: ['failure', 'success'] }
    );
  } catch (e) {
    if (
      e.some(
        ({ command, exitCode }) =>
          command.command.includes('playwright') && exitCode !== 0
      )
    ) {
      failed = true;
    }
  }

  console.log('Cleaning up...');
  await fs.unlink(SETS_PATH);
  await concurrently(['rm -r dist']);

  if (setsExist) {
    console.log(`Restoring original ${SETS_PATH}...`);
    await fs.rename(`${SETS_PATH}.temp`, SETS_PATH);
  }

  if (failed) {
    process.exit(1);
  }
})();
