'use strict';

// Parsing app arguments
require("yargonaut")
  .helpStyle('green')

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
  .option('path', {
      description: 'Path for the application - should stay default at all times',
      type: 'string',
  })
  .option('name', {
      description: 'Name for the wiki',
      type: 'string',
  })
  .option('wikipath', {
      description: 'Path for the wiki',
      type: 'string',
  })
  .usage("\n==========================\nWelcome to Parchment!\n==========================\n\nUsage: $0 <command> [options]")
  .example("node app run")
  .help()
  .alias('help', 'h')
  .wrap(yargs.terminalWidth())
  .demandCommand()
  .epilogue("louve.systems@2020")
  .argv;
  
/////////////////////////////////
//  
// Setting up ENV variables and main components
//
global.APPLICATION_ROOT = argv.path || process.cwd();

process.env = require("./app/env.js")(argv);
global.WIKI_PATH = process.env.WIKI_PATH
global.WIKI_NAME = argv.name || process.env.GIT_REPO_URL.split("/").pop().replace(".git", "").toUpperCase()

global.logger = require("./app/log/logger.js");
global.git = require("./app/git.js");
global.markdown = require("./app/markdown.js")
global.wikiMap = require("./app/map.js");
global.wikiPage = require("./app/page.js");

logger.debug("Using root path: "+APPLICATION_ROOT+" and wiki path: "+WIKI_PATH)
logger.debug("Parchment currently running as user: "+require('os').userInfo().username)

//
////////////////////////////////////

if (argv._.includes('run')){

  // Setup git
  git()
  .then(()=>{
    // Scan wiki
    return wikiMap.updateTree()
  })
  .then(()=>{
    // Starts the web app
    const app = require('./app/express.js');
    return app(process.env.PORT);
  })
  .then(()=>{
    logger.info("Parchment ready!")
    try{console.log(require("fs").readFileSync("./res/ready.txt").toString())}catch(e){}
  });  
}

else {
  logger.error("Nothing to do.");
}