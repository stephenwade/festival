const { expect } = require('chai');
const { test } = require('@playwright/test');

test('e2e', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(500);

  await page.click('a:has-text("Listen Live")');
  await page.waitForTimeout(500);

  expect(await page.innerText('#next-up')).to.equal('Next up');
  // Timers are weird in CI
  expect(await page.innerText('#current-time')).to.satisfy(
    (time) => time === '0:03' || time === '0:02' || time === '0:01'
  );

  await page.waitForTimeout(8.5 * 1000);

  expect(await page.innerText('#artist')).to.equal('Artist 1');
  // Timers are weird in CI
  expect(await page.innerText('#current-time')).to.satisfy(
    (time) =>
      time === '0:05' || time === '0:06' || time === '0:07' || time === '0:08'
  );
});
