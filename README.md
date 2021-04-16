# Festival

Festival is a website to host online music festivals. It plays the same audio
file for all users at the same time based on their system clock, allowing for
the social aspect of a live broadcast (everyone can react to the same music
at the same time) without requiring live streaming infrastructure.

## Local Development

- Run `cd frontend` to change to the frontend directory.
- Run `npm ci` to install the required npm packages.
- Add media files to the `media/` folder and add the information to
  `media/sets.json`. Use `media/sets-sample.json` as a guide to format
  your `sets.json` file.
- If you add images, run `npm run imagemin` to convert them to WEBP.
- Run `npm start` to serve the application locally.

## Sample Media

- The `frontend/media/sets-sample.json` file has references to several sample
  media files available under
  [CC0](https://creativecommons.org/share-your-work/public-domain/cc0/).
  To get the sample media files, download
  [this ZIP file](https://stephenwade.me/sh/f/sample.zip)
  and expand it into the `media/` folder.

## Building

- `npm run build` will bundle the application in the `dist/` folder.
- `npm run start:build` will serve the bundled application.

## Deploying

The site is deployed to a web server via rsync over SSH. The media is deployed
to Azure blob storage.

1. Make sure that your Azure storage account is set to allow
   [CORS requests](https://stackoverflow.com/a/41351674).
   This is required for the visualizer to work.
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
