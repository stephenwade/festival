const { expect } = require('chai');
const { test } = require('./config.cjs');

test('e2e', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await page.click('text=Listen Live');
  expect(await page.innerText('#next-up')).to.equal('NEXT UP');
  expect(await page.innerText('#current-time')).to.equal('0:03');

  await page.waitForTimeout(9.5 * 1000);

  // Timers are weird in CI
  expect(await page.innerText('#current-time')).to.satisfy(
    (time) => time === '0:05' || time === '0:06' || time === '0:07'
  );
});
