// Import styles, initialize component theme here.
// import '../src/common.css';
import { beforeMount } from '@playwright/experimental-ct-react/hooks';
import { HelmetProvider } from 'react-helmet-async';

beforeMount(({ App }) => {
  return Promise.resolve(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
});
