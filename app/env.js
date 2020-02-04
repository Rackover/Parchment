module.exports = function(env){
  cEnv = {};
  defaultEnv = require("./defaultenv.js");
  cEnv.DEBUG_LEVEL = env.debuglvl || process.env.DEBUG_LEVEL || defaultEnv.DEBUG_LEVEL
  cEnv.PORT = parseInt(env.port || process.env.PORT || defaultEnv.PORT)
  cEnv.LOG_PORT = parseInt(env.logport || process.env.LOG_PORT || defaultEnv.LOG_PORT)
  cEnv.GIT_PEM_FILE = env.pemfile || process.env.GIT_PEM_FILE || defaultEnv.GIT_PEM_FILE
  cEnv.GIT_REPO_URL = env.repo || process.env.GIT_REPO_URL || defaultEnv.GIT_REPO_URL
  cEnv.GIT_REPO_BRANCH = env.branch || process.env.GIT_REPO_BRANCH || defaultEnv.GIT_REPO_BRANCH
  cEnv.GIT_PULL_INTERVAL = parseInt(process.env.GIT_PULL_INTERVAL || defaultEnv.GIT_PULL_INTERVAL)
  cEnv.GIT_PUSH_INTERVAL = parseInt(process.env.GIT_PUSH_INTERVAL || defaultEnv.GIT_PUSH_INTERVAL)
  cEnv.WIKI_PATH = env.wikipath || process.env.WIKI_PATH || defaultEnv.WIKI_PATH
  cEnv.GIT_PUSH_INTERVAL = process.env.GIT_PUSH_INTERVAL || defaultEnv.GIT_PUSH_INTERVAL
  cEnv.WIKI_CONTENT_UPDATE_INTERVAL = parseInt(process.env.WIKI_CONTENT_UPDATE_INTERVAL || defaultEnv.WIKI_CONTENT_UPDATE_INTERVAL)
  return cEnv;
}
