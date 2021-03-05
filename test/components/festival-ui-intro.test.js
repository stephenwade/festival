import { expect, fixture, oneEvent } from '@open-wc/testing';

import '../../src/components/festival-ui-intro.js';

describe('festival-ui-intro', async () => {
  const template = '<festival-ui-intro></festival-ui-intro>';

  it('contains the logo', async () => {
    const el = await fixture(template);
    const logo = el.shadowRoot.querySelector('#logo');

    expect(el.shadowRoot).to.contain(logo);
    expect(logo).to.have.attribute('alt');
  });

  it('contains a "Listen Live" button', async () => {
    const el = await fixture(template);
    const live = Array.from(el.shadowRoot.querySelectorAll('a')).find(
      (a) => a.innerText === 'Listen Live'
    );

    expect(el.shadowRoot).to.contain(live);

    setTimeout(() => live.click());
    await oneEvent(el, 'listen');
  });

  it('contains a link to @URLFESTIVAL on Twitter', async () => {
    const el = await fixture(template);
    const link = el.shadowRoot.querySelector(
      'a[href="https://twitter.com/URLFESTIVAL"]'
    );

    expect(el.shadowRoot).to.contain(link);
    expect(link).to.have.attribute('rel', 'noopener');
  });

  it('contains a link to the Festival Discord', async () => {
    const el = await fixture(template);
    const link = el.shadowRoot.querySelector(
      'a[href="https://discord.io/festival"]'
    );

    expect(el.shadowRoot).to.contain(link);
    expect(link).to.have.attribute('rel', 'noopener');
  });
});
