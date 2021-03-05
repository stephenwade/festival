import { expect, fixture } from '@open-wc/testing';

import '../../src/components/festival-ui-ended.js';

describe('festival-ui-ended', async () => {
  const template = '<festival-ui-ended></festival-ui-ended>';

  it('contains the logo', async () => {
    const el = await fixture(template);
    const logo = el.shadowRoot.querySelector('#logo');

    expect(el.shadowRoot).to.contain(logo);
    expect(logo).to.have.attribute('alt');
  });

  it('contains the heart', async () => {
    const el = await fixture(template);
    const heart = el.shadowRoot.querySelector('#heart');

    expect(el.shadowRoot).to.contain(heart);
    expect(heart).to.have.attribute('alt', 'heart');
  });

  it('contains a link to @URLFESTIVAL on Twitter', async () => {
    const el = await fixture(template);
    const links = el.shadowRoot.querySelectorAll(
      'a[href="https://twitter.com/URLFESTIVAL"]'
    );

    links.forEach((link) => {
      expect(el.shadowRoot).to.contain(link);
      expect(link).to.have.attribute('rel', 'noopener');
    });
  });
});
