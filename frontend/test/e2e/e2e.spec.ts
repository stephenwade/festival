const { expect } = require('chai');
const { test } = require('@playwright/test');

test('e2e', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(500);

  await page.click('a:has-text("Listen Live")');

  await page.waitForSelector('#current-time >> text="0:01"')
  expect((await page.innerText('#next-up')).toUpperCase()).to.equal('NEXT UP');

  await page.waitForSelector('#current-time >> text="0:05"')
  expect((await page.innerText('#artist')).toUpperCase()).to.equal('ARTIST 1');
});
