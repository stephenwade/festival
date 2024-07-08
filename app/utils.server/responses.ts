export function badRequest() {
  return new Response('Bad Request', { status: 400 });
}

export function forbidden() {
  return new Response('Forbidden', { status: 403 });
}

export function notFound() {
  return new Response('Not Found', { status: 404 });
}

export function serverError() {
  return new Response('Internal Server Error', { status: 500 });
}
