'use strict';

// Parsing app arguments
const yargs = require('yargs');
const argv = yargs
  .command('is_configured', 'Checks if the app has been configured correctly', {
  })
  .command('configure', 'Configures the app for first use',{
  })
  .command('run', 'Runs the wiki',{
  })
  .option('debuglvl', {
      alias: 'd',
      description: 'Sets the debug level for this instance',
      type: 'string',
  })
  .option('port', {
      alias: 'p',
      description: 'Sets the HTTP port at which the wiki will be displayed',
      type: 'number',
  })
  .option('logport', {
      alias: 'l',
      description: 'Sets the HTTP port at which the console will be displayed',
      type: 'number',
  })
  .help()
  .alias('help', 'h')
  .argv;
  
// Setting up ENV variables and main components
process.env = require("./app/env.js")(argv);
global.logger = require("./app/log/logger.js");

if (argv._.includes('configure')) {
  // Todo
  logger.error("This command is not available yet.");
  return;
}

else if (argv._.includes('run')){
  const app = require('./app/index.js');
  
  // Starts the web app
  app(process.env.PORT);
  
}

else {
  logger.error("Nothing to do.");
}