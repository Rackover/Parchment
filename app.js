'use strict';

// Parsing app arguments
require("yargonaut")
  .helpStyle('green')

global.VERSION = `LouveSystems' Parchment v1.1`;

const { existsSync, writeFileSync } = require("fs");
const path = require('path');
const yargs = require('yargs');

const argv = yargs
  .command('adduser <login> <clear_password>', 'Adds an user to the wiki',{
  })
  .command('deluser <login>', 'Removes an user from the wiki',{
  })
  .command('run', 'Runs the wiki',{
  })
  .command('version', 'Prints the Parchment version number',{
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
  .option('usersfile', {
      description: 'Path to the users database TXT',
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
  .option('color', {
      description: 'Color for the wiki (#AABBCC format)',
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
  .usage(`\n==========================\nWelcome to ${global.VERSION}!\n==========================\n\nUsage: $0 <command> [options]`)
  .example("node app run")
  .help()
  .alias('help', 'h')
  .wrap(yargs.terminalWidth())
  .demandCommand()
  .epilogue("louve.systems@2022")
  .argv;
  
/////////////////////////////////
//  
// Setting up ENV variables and main components
//
global.EXECUTION_ROOT = argv.path || process.cwd();
global.APPLICATION_ROOT = path.resolve(__dirname);

process.env = require("./app/env.js")(argv);
global.WIKI_PATH = process.env.WIKI_PATH
global.logger = require("./app/logger.js")

const meta = loadMetafile();

global.WIKI_COLOR = argv.color || meta.color;
global.WIKI_NAME = argv.name || meta.name || process.env.GIT_REPO_URL.split("/").pop().replace(".git", "").toUpperCase()
global.WIKI_CONTENTS_DIRECTORY_NAME = "_contents";

const gitStarter = require("./app/git.js"); // Will become global.git
global.markdown = require("./app/markdown.js")
global.permissions = require("./app/permissions.js")
global.wikiMap = require("./app/map.js")
global.wikiPage = require("./app/page.js")
global.wikiContents = require('./app/content.js')
global.utility = require("./app/utility.js")
global.searchEngine = require("./app/search.js");

logger.debug(`Running in directory ${EXECUTION_ROOT} with application root ${APPLICATION_ROOT} and wiki path: ${WIKI_PATH}`)
logger.debug("Parchment currently running as OS user: "+require('os').userInfo().username)

//
////////////////////////////////////

if (argv._.includes('run')){

  // Setup git
  gitStarter().then((git)=>{
    global.git = git

    // Scan wiki
    return wikiMap.updateTree()
  })
  .then(()=>{
    // Starts the web app
    const app = require('./app/express.js');
    return app(process.env.PORT);
  })
  .then(()=>{
    try{console.log(require("fs").readFileSync(path.join(APPLICATION_ROOT, "res/ready.txt")).toString())}catch(e){
      logger.warning(`There seem to be a problem with the APPLICATION_ROOT (${APPLICATION_ROOT})`);      
    }
    
    logger.info("Parchment ready!")
  });  
}
else if (argv._.includes('adduser')){
    permissions.addUser(argv.login, argv.clear_password)
    permissions.writePermissions()
    logger.info("User "+argv.login+" was succesfully added. Shutting down.")
    process.exit(0)
}
else if (argv._.includes('deluser')){
    permissions.destroyUser(argv.login)
    permissions.writePermissions()
    logger.info("User "+argv.login+" was successfully removed from the user list. Shutting down.")
    process.exit(0)
}
else if (argv._.includes('version')){
    logger.info(`${VERSION}`);
    process.exit(0)
}
else {
  logger.error("Nothing to do.")
  process.exit(0)
}

function loadMetafile()
{
  const defaultMeta = {
    name: null,
    color: "#AAAACC"
  };

  if (existsSync(WIKI_PATH))
  {
    const metaPath = path.join(WIKI_PATH, "meta.json");

    if (existsSync(metaPath))
    {
      // good !
      return require(metaPath);
    }
    else
    {
      // Sample meta.json file
      writeFileSync(metaPath, JSON.stringify(defaultMeta));

      logger.info(`Created new meta file at ${metaPath}`);
    }
  }

  return defaultMeta;
}