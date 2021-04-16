import { elementUpdated, expect, fixture, oneEvent } from '@open-wc/testing';

import '../../src/components/fab-volume-button.js';

describe('fab-volume-button', async () => {
  const template = '<fab-volume-button volume="20" opened></fab-volume-button>';

  it('binds to the volume attribute', async () => {
    const el = await fixture(template);
    expect(el.volume).to.equal(20);
  });

  it('binds to the opened attribute', async () => {
    const el = await fixture(template);
    expect(el.opened).to.be.true;
  });

  it('opens and closes when open() and close() are called', async () => {
    const el = await fixture(template);

    el.close();
    await elementUpdated(el);
    expect(el).to.not.have.attribute('opened');

    el.open();
    await elementUpdated(el);
    expect(el).to.have.attribute('opened');
  });

  it('opens and closes on click', async () => {
    const el = await fixture(template);

    const clickEvent = new MouseEvent('click');
    const innerButton = el.shadowRoot.querySelector('button');

    innerButton.dispatchEvent(clickEvent);
    await elementUpdated(el);
    expect(el).to.not.have.attribute('opened');

    innerButton.dispatchEvent(clickEvent);
    await elementUpdated(el);
    expect(el).to.have.attribute('opened');
  });

  describe('the volume property is changed', () => {
    it('updates the volume attribute', async () => {
      const el = await fixture(template);

      el.volume = 80;
      await elementUpdated(el);

      expect(el).to.have.attribute('volume', '80');
    });

    it('updates the inner input', async () => {
      const el = await fixture(template);

      el.volume = 80;
      await elementUpdated(el);

      expect(
        el.shadowRoot.querySelector('styled-range-input')
      ).to.have.property('value', 80);
    });
  });

  describe('the inner input is changed', () => {
    it('fires events', async () => {
      const el = await fixture(template);

      const innerInput = el.shadowRoot.querySelector('styled-range-input');
      innerInput.value = 75;

      const inputEvent = new CustomEvent('input', {
        bubbles: true,
        composed: true,
      });
      const changeEvent = new CustomEvent('change', {
        bubbles: true,
        composed: true,
      });
      setTimeout(() => {
        innerInput.dispatchEvent(inputEvent);
        innerInput.dispatchEvent(changeEvent);
      });

      const [inputEventCaught, changeEventCaught] = await Promise.all([
        oneEvent(el, 'volumeinput'),
        oneEvent(el, 'volumechange'),
      ]);

      expect(inputEventCaught.detail.volume).to.equal(75);
      expect(changeEventCaught.detail.volume).to.equal(75);
    });

    it('updates the volume property', async () => {
      const el = await fixture(template);

      const innerInput = el.shadowRoot.querySelector('styled-range-input');
      innerInput.value = 75;

      const changeEvent = new CustomEvent('change', {
        bubbles: true,
        composed: true,
      });
      innerInput.dispatchEvent(changeEvent);

      await elementUpdated(el);
      expect(el.volume).to.equal(75);
    });
  });
});
