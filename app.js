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
  .option('pemfile', {
      description: 'Path to the permission file for git',
      type: 'string',
  })
  .option('repo', {
      description: 'URL for the work repository',
      type: 'string',
  })
  .option('branch', {
      description: 'Branch for the work repository - default is auto',
      type: 'string',
  })
  .help()
  .alias('help', 'h')
  .argv;

/////////////////////////////////
//  
// Setting up ENV variables and main components
//
global.WIKI_PATH = require("path").join(process.cwd(), "wiki");

process.env = require("./app/env.js")(argv);
global.logger = require("./app/log/logger.js");
global.git = require("./app/git.js");
//
////////////////////////////////////

if (argv._.includes('run')){

  global.git().then(()=>{
    // Starts the web app
    const app = require('./app/index.js');
    app(process.env.PORT);

    setTimeout(function(){
      logger.info("Parchment ready!")
      try{console.log(require("fs").readFileSync("./res/ready.txt").toString())}catch(e){}
    }, 1000);
  });
  
}

else {
  logger.error("Nothing to do.");
}