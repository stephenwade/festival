import 'react-toastify/dist/ReactToastify.min.css';
import './toast.css';

import type { CloseButtonProps } from 'node_modules/react-toastify/dist/components';
import type { FC } from 'react';
import { cssTransition, ToastContainer as Container } from 'react-toastify';

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
