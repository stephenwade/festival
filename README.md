# Festival

Festival is a web app to host online music festivals. It plays the same audio
file for all users at the same time based on their system clock, allowing for
the social aspect of a live broadcast (everyone can react to the same music
at the same time) without requiring live streaming infrastructure.

## Local Development

- Copy `.env.sample` to `.env` and fill out the required values.
- Run `docker compose up -d` to start a MySQL database.
- Run `npm install` to install the required packages.
- Run `npm run dev` to serve the application locally.

## Tigris Setup

- Create a new public bucket in Tigris.
- In the bucket settings, disable directory listing.
- In the bucket settings, add a CORS rule:
  - Origins: `*` for development or the URL origin of the deployed app
  - Allowed Methods: HEAD, GET, PUT, OPTIONS
    - HEAD, GET, and OPTIONS are required for the visualizer
    - PUT and OPTIONS are required for file uploads
  - Allowed Headers: `content-type`

## Testing

- `npm run test` will run the end-to-end tests.
- `npm run test-ct` will run the component tests.

## Building

- `npm run build` will bundle the application for production.
- `npm start` will serve the bundled application.

## Deploying

Pushing to main triggers a deploy on Railway.

## External Dependencies

- [Clerk](https://clerk.com/) for authentication
- [DigitalOcean](https://www.digitalocean.com/) for database hosting, DNS, and proxying to Railway
- [Railway](https://railway.app/) for hosting
- [Sentry](https://sentry.io/) for error reporting
- [Tigris](https://www.tigrisdata.com/) for file storage
