interface XHRPromiseOptions {
  url: string;
  onProgress?: (/** A number between 0 and 1 */ progress: number) => void;
  signal?: AbortSignal;
  errorOnBadStatus?: boolean;
}

export function xhrPromise(
  body: XMLHttpRequestBodyInit,
  options: XHRPromiseOptions,
) {
  const { url, onProgress, signal, errorOnBadStatus } = options;

  // Can't use fetch because it doesn't support tracking upload progress
  const request = new Promise<{ status: number; responseText: string }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);

      const abort = () => {
        xhr.abort();
      };
      signal?.addEventListener('abort', abort);

      xhr.addEventListener('load', () => {
        signal?.removeEventListener('abort', abort);
        if (errorOnBadStatus && xhr.status >= 400) {
          reject({ reason: 'Bad status code', status: xhr.status });
        } else {
          resolve({ status: xhr.status, responseText: xhr.responseText });
        }
      });

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          onProgress(event.loaded / event.total);
        });
      }

      xhr.addEventListener('error', () => {
        reject({ reason: 'Error' });
      });

      xhr.addEventListener('timeout', () => {
        reject({ reason: 'Timeout' });
      });

      xhr.addEventListener('abort', () => {
        reject({ reason: 'Aborted' });
      });

      xhr.send(body);
    },
  );

  return request;
}
