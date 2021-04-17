const { test } = require('@playwright/test');
const { expect } = require('chai');

test('e2e', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await page.click('text=Listen Live');
  expect(await page.innerText('#next-up')).to.equal('NEXT UP');
  expect(await page.innerText('#current-time')).to.equal('0:03');

  await page.waitForTimeout(9.5 * 1000);
  expect(await page.innerText('#current-time')).to.equal('0:06');
});
