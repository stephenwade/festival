import { expect, fixture } from '@open-wc/testing';

import '../../src/components/festival-ui-ended.js';

describe('festival-ui-ended', () => {
  const template = '<festival-ui-ended></festival-ui-ended>';

  it('contains the logo', async () => {
    const el = await fixture(template);
    const logo = el.shadowRoot.querySelector('#logo');

    expect(logo).to.be.an.instanceof(HTMLElement);
    expect(logo).to.have.attribute('alt');
  });

  it('contains the heart', async () => {
    const el = await fixture(template);
    const heart = el.shadowRoot.querySelector('#heart');

    expect(heart).to.be.an.instanceof(HTMLElement);
    expect(heart).to.have.attribute('alt', 'heart');
  });

  it('contains a link to @URLFESTIVAL on Twitter', async () => {
    const el = await fixture(template);
    const links = el.shadowRoot.querySelectorAll(
      'a[href="https://twitter.com/URLFESTIVAL"]'
    );

    expect(links).to.not.be.empty;
    links.forEach((link) => {
      expect(link).to.have.attribute('rel', 'noopener');
    });
  });

  it('is accessible', async () => {
    const el = await fixture(template);
    await expect(el).to.be.accessible();
  });
});
