# MICAVIBE

This repository contains the source code for the MICAVIBE project's public website.

### Development

So you'd like to build a webapp! The following instructions are for Mac or Linux users.

If you'd like to download MICAVIBE and run it yourself, can use git to get this project:

    $ git clone https://github.com/micais2019/MICAVIBE.git

Then you'll need to [install node.js](https://nodejs.org/en/download/).

After you have node.js and npm (which comes with node.js) installed, you can install project support packages:

    $ cd MICAVIBE
    $ npm install

And the pm2 process manager tool:

    $ npm install -g pm2

And copy the sample configuration file, `.nconf.json.sample` to it's proper location.

    $ cp .nconf.json.sample .nconf.json

You'll need to add [Adafruit IO](https://io.adafruit.com) credentials for a user to `.nconf.json` in
order to use MQTT and the `/weather` API.

For now, server.js is hard coded to the `mica_ia` [Adafruit IO account](https://io.adafruit.com/mica_ia/public).

Now that that setup is finished, you can start pm2 to run the server locally
and run `npm run watch` to build client-side assets locally.

    $ pm2 start ecosystem.config.js
    $ npm run watch

And you _should_ be up and running!

If you'd like to contribute your changes back to the project in this repository, contact abachman@mica.edu to get added as a contributor.
