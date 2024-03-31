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

## Azure Setup

Make sure that your Azure storage account is set to allow
[CORS requests](https://stackoverflow.com/a/41351674).
This is required for the visualizer to work.

## Testing

- `npm run test` will run the end-to-end tests.
- `npm run test-ct` will run the component tests.

## Building

- `npm run build` will bundle the application for production.
- `npm start` will serve the bundled application.

## Deploying

Pushing to main triggers a deploy on Railway.

## External Dependencies

- [Azure](https://azure.microsoft.com/en-us/) for file storage
  <!-- - [BrowserStack](https://www.browserstack.com/) for testing -->
  <!-- - [BetterStack](https://betterstack.com/) for monitoring -->
- [Clerk](https://clerk.com/) for authentication
- [DigitalOcean](https://www.digitalocean.com/) for database hosting, DNS, and proxying to Railway
- [Railway](https://railway.app/) for hosting
- [Sentry](https://sentry.io/) for error reporting
