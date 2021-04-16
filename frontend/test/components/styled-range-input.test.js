import { elementUpdated, expect, fixture, oneEvent } from '@open-wc/testing';

import '../../src/components/styled-range-input.js';

describe('styled-range-input', async () => {
  const template = `<styled-range-input
    min="20"
    max="60"
    step="2"
    value="30"
  ></styled-range-input>`;

  it('binds to the min attribute', async () => {
    const el = await fixture(template);
    expect(el.min).to.equal(20);
  });

  it('binds to the max attribute', async () => {
    const el = await fixture(template);
    expect(el.max).to.equal(60);
  });

  it('binds to the step attribute', async () => {
    const el = await fixture(template);
    expect(el.step).to.equal(2);
  });

  it('binds to the value attribute', async () => {
    const el = await fixture(template);
    expect(el.value).to.equal(30);
  });

  it('clamps value within min and max', async () => {
    const el = await fixture(template);

    el.value = el.min - 5;
    expect(el.value).to.equal(el.min);

    el.value = el.max + 5;
    expect(el.value).to.equal(el.max);
  });

  it('sets the attributes of the inner input', async () => {
    const el = await fixture(template);
    const innerInput = el.shadowRoot.querySelector('input');

    expect(innerInput).to.have.attribute('min', '20');
    expect(innerInput).to.have.attribute('max', '60');
    expect(innerInput).to.have.attribute('step', '2');
    expect(innerInput.value).to.equal('30');
  });

  it('sets inner input tabindex to -1 if disabled', async () => {
    const el = await fixture(template);

    el.disabled = true;
    await elementUpdated(el);

    const innerInput = el.shadowRoot.querySelector('input');
    expect(innerInput).to.have.attribute('tabindex', '-1');
  });

  describe('the value property is changed', () => {
    it('updates the value attribute', async () => {
      const el = await fixture(template);

      el.value = 46;
      await elementUpdated(el);

      expect(el).to.have.attribute('value', '46');
    });

    it('updates the inner input', async () => {
      const el = await fixture(template);

      el.value = 46;
      await elementUpdated(el);

      const innerInput = el.shadowRoot.querySelector('input');
      expect(innerInput).to.have.property('value', '46');
    });
  });

  describe('the inner input is changed', () => {
    it('fires events', async () => {
      const el = await fixture(template);

      const innerInput = el.shadowRoot.querySelector('input');
      innerInput.value = 36;

      const inputEvent = new InputEvent('input');
      const changeEvent = new Event('change');
      setTimeout(() => {
        innerInput.dispatchEvent(inputEvent);
        innerInput.dispatchEvent(changeEvent);
      });

      await Promise.all([oneEvent(el, 'input'), oneEvent(el, 'change')]);
    });

    it('updates the value property', async () => {
      const el = await fixture(template);

      const innerInput = el.shadowRoot.querySelector('input');
      innerInput.value = 36;

      const changeEvent = new Event('change');
      innerInput.dispatchEvent(changeEvent);

      await elementUpdated(el);
      expect(el.value).to.equal(36);
    });
  });
});
