import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';
import checkWebP from 'supports-webp';

hydrateRoot(document, <RemixBrowser />);

function webPSupported() {
  document.documentElement.classList.add('webp');
}

function webPUnsupported() {
  document.documentElement.classList.add('no-webp');
}

checkWebP
  .then((supported) => {
    if (supported) {
      webPSupported();
    } else {
      webPUnsupported();
    }
  })
  .catch(() => {
    webPUnsupported();
  });
