# Festival

Festival is a website to host online music festivals. It plays the same audio
file for all users at the same time based on their system clock, allowing for
the social aspect of a live broadcast (everyone can react to the same music
at the same time) without requiring live streaming infrastructure.

## Local Development

1. Install the [Polymer CLI](https://www.npmjs.com/package/polymer-cli).
1. Run `npm install` to install the required npm packages.
1. Run `npm start` to serve the application locally with [Browsersync](https://www.browsersync.io/).
   You can also run `npm run serve` to serve the application locally without Browsersync.

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed.
Then, run `npm install` to install the required npm packages
and `npm run serve` to serve the application locally.

## Building

There are 3 scripts useful for builds.

- `npm run build` will make a standard production-ready build.
- `npm run build-test` will make the standard build, then copy the contents
  of your repo's `public/` folder into the build's `public/` folder. This is
  useful if you want to test the production build with the same audio files
  you've been using to test locally.
- `npm run serve-build` will serve the standard build instead of serving the
  source.

## Deploying

The site is deployed to a web server via rsync over SSH. The media is deployed
to Azure blob storage.

1. Make sure that your Azure storage account is set to allow
   [CORS requests](https://stackoverflow.com/a/41351674)
   from your site's domain. This is required for the visualizer to work.
1. Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).
1. Add the following environment variables to your profile:
   - `FESTIVAL_SITE_DEPLOY_LOCATION`: The rsync destination for the site.
   - `FESTIVAL_AZURE_STORAGE_ACCOUNT`: The name of the Azure storage account
     for the media.
   - `FESTIVAL_AZURE_STORAGE_KEY`: The access key for the Azure storage account.
1. Run `npm run build` to build the site for production.
1. Run `npm run deploy` to deploy both the site and the media.
   You can also run `npm run deploy:site` to deploy only the site,
   or `npm run deploy:media` to deploy only the media.
