import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import type { CloseButtonProps } from 'react-toastify';
import { cssTransition, ToastContainer as Container } from 'react-toastify';
import reactToastifyCssHref from 'react-toastify/dist/ReactToastify.css?url';

import toastCssHref from './toast.css?url';

const ToastClose: FC<CloseButtonProps> = ({ type, closeToast }) => {
  return (
    <>
      <button
        onClick={() => {
          globalThis.location.reload();
        }}
      >
        RELOAD
      </button>
      {type === 'error' ? null : <button onClick={closeToast}>CLOSE</button>}
    </>
  );
};

export const ToastContainer: FC = () => (
  <>
    <Helmet>
      <link rel="stylesheet" href={reactToastifyCssHref} />
      <link rel="stylesheet" href={toastCssHref} />
    </Helmet>
    <Container
      autoClose={false}
      closeButton={ToastClose}
      closeOnClick={false}
      draggable={false}
      hideProgressBar
      icon={false}
      limit={1}
      newestOnTop
      position="bottom-left"
      theme="dark"
      transition={cssTransition({
        enter: 'toast-enter',
        exit: 'toast-exit',
      })}
    />
  </>
);
