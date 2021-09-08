# Festival

Festival is a website to host online music festivals. It plays the same audio
file for all users at the same time based on their system clock, allowing for
the social aspect of a live broadcast (everyone can react to the same music
at the same time) without requiring live streaming infrastructure.

## Local Development

- Run `cd frontend` to change to the frontend directory.
- Run `yarn` to install the required packages.
- Add media files to the `media/` folder and add the information to
  `media/sets.json`. Use `media/sets-sample.json` as a guide to format
  your `sets.json` file.
- If you add images, run `yarn imagemin` to convert them to WEBP.
- Run `yarn start` to serve the application locally.

## Sample Media

- The `frontend/media/sets-sample.json` file has references to several sample
  media files available under
  [CC0](https://creativecommons.org/share-your-work/public-domain/cc0/).
  To get the sample media files, download
  [this ZIP file](https://stephenwade.me/sh/f/sample.zip)
  and expand it into the `media/` folder.

## Building

- `yarn build` will bundle the application in the `dist/` folder.
- `yarn start:build` will serve the bundled application.

## Testing

- Run `cd frontend` to change to the frontend directory.
- Run `npx playwright install` to install the required dependencies for
  Playwright, the end-to-end test runner.
- Run `yarn test:js` to run the component and store tests with
  [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/).
- Run `yarn test:e2e` to run the end-to-end tests with
  [Playwright](https://playwright.dev/).
- You can also run `yarn test` to run all tests at once.

## Deploying

The site is deployed to a web server via rsync over SSH. The media is deployed
to Azure blob storage.

1. Make sure that your Azure storage account is set to allow
   [CORS requests](https://stackoverflow.com/a/41351674).
   This is required for the visualizer to work.
1. Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).
1. Add the following environment variables to your `.env` file:
   - `FESTIVAL_SITE_DEPLOY_LOCATION`: The rsync destination for the site.
   - `FESTIVAL_AZURE_STORAGE_ACCOUNT`: The name of the Azure storage account
     for the media.
   - `FESTIVAL_AZURE_STORAGE_KEY`: The access key for the Azure storage account.
1. Run `yarn build` to build the site for production.
1. Run `yarn deploy` to deploy both the site and the media.
   You can also run `yarn deploy:site` to deploy only the site,
   or `yarn deploy:media` to deploy only the media.
