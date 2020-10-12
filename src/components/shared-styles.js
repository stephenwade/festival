import { css } from 'lit-element';

// https://www.paulirish.com/2012/box-sizing-border-box-ftw/
export const boxSizingBorderBox = css`
  :host {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }
`;

export const buttonReset = css`
  button {
    border: none;
    background-color: inherit;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;
    text-transform: uppercase;
    cursor: pointer;
  }
  button::-moz-focus-inner {
    padding: 0;
    border-style: none;
  }
  button:-moz-focusring {
    outline: 1px dotted ButtonText;
  }
`;

export const flexColumnCenter = css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

export const fullPageClass = css`
  .full-page {
    position: absolute;

    width: 100%;
    height: 100%;
  }
`;
