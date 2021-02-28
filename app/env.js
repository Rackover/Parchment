const envfile = require('envfile')
const fs = require('fs');

module.exports = function(argv){
  let cEnv = fs.existsSync('.env') ? envfile.parse('.env') : {};
  const defaultEnv = require("./defaultenv.js");

  // Load environment variables in that order:
  // 1) process.env
  // 2) envFile
  // 3) default
  for (k in defaultEnv){
    cEnv[k] = isNaN(defaultEnv[k]) ? (process.env[k] || cEnv[k] || defaultEnv[k]) : parseInt(process.env[k] || cEnv[k] || defaultEnv[k]);
    // // console.log(k+" => "+cEnv[k]);
  }

  // Additional overrides via ARGV
  cEnv.DEBUG_LEVEL = argv.debuglvl || cEnv.DEBUG_LEVEL;
  cEnv.PORT = parseInt(argv.port || cEnv.PORT);
  cEnv.LOG_PORT = parseInt(argv.logport || cEnv.LOG_PORT)
  cEnv.GIT_PEM_FILE = argv.pemfile  || cEnv.GIT_PEM_FILE;
  cEnv.GIT_REPO_URL = argv.repo || cEnv.GIT_REPO_URL;
  cEnv.GIT_REPO_BRANCH = argv.branch || cEnv.GIT_REPO_BRANCH;
  cEnv.WIKI_PATH = argv.wikipath || cEnv.WIKI_PATH;
  cEnv.PERMISSION_FILE = argv.usersfile || cEnv.PERMISSION_FILE;

  return cEnv;
}
