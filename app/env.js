module.exports = function(env){
  cEnv = process.env;
  defaultEnv = require("./defaultenv.js");
  cEnv.DEBUG_LEVEL = env.debuglvl || process.env.DEBUG_LEVEL || defaultEnv.DEBUG_LEVEL
  cEnv.PORT = env.port || process.env.PORT || defaultEnv.PORT
  cEnv.LOG_PORT = env.logport || process.env.LOG_PORT || defaultEnv.LOG_PORT
  cEnv.GIT_PEM_FILE = env.pemfile || process.env.GIT_PEM_FILE || defaultEnv.GIT_PEM_FILE
  cEnv.GIT_REPO_URL = env.repo || process.env.GIT_REPO_URL || defaultEnv.GIT_REPO_URL
  cEnv.GIT_REPO_BRANCH = env.branch || process.env.GIT_REPO_BRANCH || defaultEnv.GIT_REPO_BRANCH
  cEnv.WIKI_PATH = env.wikipath || process.env.WIKI_PATH || defaultEnv.WIKI_PATH
  return cEnv;
}