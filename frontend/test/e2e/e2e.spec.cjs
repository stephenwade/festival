const { expect } = require('chai');
const { test } = require('./config.cjs');

test('e2e', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(500);

  await page.click('a:has-text("Listen Live")');
  await page.waitForTimeout(500);

  expect(await page.innerText('#next-up')).to.equal('NEXT UP');
  // Timers are weird in CI
  expect(await page.innerText('#current-time')).to.satisfy(
    (time) => time === '0:03' || time === '0:02'
  );

  await page.waitForTimeout(8.5 * 1000);

  expect(await page.innerText('#artist')).to.equal('ARTIST 1');
  // Timers are weird in CI
  expect(await page.innerText('#current-time')).to.satisfy(
    (time) => time === '0:05' || time === '0:06' || time === '0:07'
  );
});
