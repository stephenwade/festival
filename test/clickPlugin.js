export const clickPlugin = () => ({
  name: 'click-plugin',

  async executeCommand({ command, payload, session }) {
    if (command === 'click') {
      const selector = payload;

      if (session.browser.type === 'puppeteer') {
        const page = session.browser.getPage(session.id);
        await page.click(selector);
        return true;
      }

      if (session.browser.type === 'playwright') {
        const page = session.browser.getPage(session.id);
        await page.click(selector);
        return true;
      }

      // you might not be able to support all browser launchers
      throw new Error(
        `Taking screenshots is not supported for browser type ${session.browser.type}.`
      );
    }

    return false;
  },
});
