# Festival

Festival is a web app to host online music festivals. It plays the same audio
file for all users at the same time based on their system clock, allowing for
the social aspect of a live broadcast (everyone can react to the same music
at the same time) without requiring live streaming infrastructure.

## Local Development

- Run `doppler setup` to set up your [Doppler](https://www.doppler.com/) config.
- Run `npm install` to install the required packages.
- Run `doppler run -- npm run dev` to serve the application locally.

## MySQL Setup

Run the following commands to create a MySQL user for Festival. Prisma Migrate
requires the user account to have
[permission to create databases](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#shadow-database-user-permissions).

```
CREATE USER festival@localhost IDENTIFIED BY 'your-password-here';
GRANT ALL ON festival.* TO festival@localhost;
GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO festival@localhost;
```

## Building

- `npm run build` will bundle the application for production.
- `doppler run -- npm start` will serve the bundled application.

## Testing

TODO

## Deploying

TODO

1. Make sure that your Azure storage account is set to allow
   [CORS requests](https://stackoverflow.com/a/41351674).
   This is required for the visualizer to work.
1. Install the
   [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).
1. Run `railway up` to build and deploy the app on Railway.
