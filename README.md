# Festival

Festival is a website to host online music festivals. It plays the same audio
file for all users at the same time based on their system clock, allowing for
the social aspect of a live broadcast (everyone can react to the same music
at the same time) without requiring live streaming infrastructure.

## Local Development

- Run `pnpm install` to install the required packages.
- Run `pnpm dev` to serve the application locally.

## MySQL Setup

Run the following commands to create a MySQL user for Festival. Prisma Migrate
requires the user account to have
[permission to create databases](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#shadow-database-user-permissions).

```
CREATE USER festival@localhost IDENTIFIED BY 'your-password-here';
GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO festival@localhost;
```

## Building

- `pnpm build` will bundle the application for production.
- `pnpm start` will serve the bundled application.

## Testing

TODO

## Deploying

TODO

1. Make sure that your Azure storage account is set to allow
   [CORS requests](https://stackoverflow.com/a/41351674).
   This is required for the visualizer to work.
1. Install the
   [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).
1. Add the following environment variables to your `.env` file:
   - `FESTIVAL_SITE_DEPLOY_LOCATION`: The rsync destination for the site.
   - `AZURE_STORAGE_ACCOUNT`: The name of the Azure storage account for the
     media.
   - `AZURE_STORAGE_KEY`: The access key for the Azure storage account.
1. Run `pnpm build` to build the site for production.
1. Run `pnpm deploy` to deploy both the site and the media.
