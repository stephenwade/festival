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
