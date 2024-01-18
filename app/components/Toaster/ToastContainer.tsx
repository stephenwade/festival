import type { LinksFunction } from '@remix-run/node';
import type { CloseButtonProps } from 'node_modules/react-toastify/dist/components';
import type { FC } from 'react';
import { cssTransition, ToastContainer as Container } from 'react-toastify';
import toastStylesUrl from 'react-toastify/dist/ReactToastify.min.css';

import stylesUrl from './toast.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: toastStylesUrl },
  { rel: 'stylesheet', href: stylesUrl },
];

const ToastClose: FC<CloseButtonProps> = ({ type, closeToast }) => {
  return (
    <>
      <button
        onClick={() => {
          window.location.reload();
        }}
      >
        RELOAD
      </button>
      {type === 'error' ? null : <button onClick={closeToast}>CLOSE</button>}
    </>
  );
};

export const ToastContainer: FC = () => (
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
);
