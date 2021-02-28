const path = require("path");

module.exports = {
  DEBUG_LEVEL: "info",
  PORT: 4030,
  LOG_PORT: 4031,
  GIT_PEM_FILE: path.join(EXECUTION_ROOT, "private/git.pem"),
  GIT_REPO_URL: "git@github.com:louvekingdoms/Wiki.git",
  GIT_REPO_BRANCH: "auto",
  GIT_PULL_INTERVAL: 1, // minutes
  GIT_PUSH_INTERVAL: 0, // minutes
  PERMISSION_FILE: path.join(EXECUTION_ROOT,"private/users.txt"),
  WIKI_PATH: "wiki",
  WIKI_CONTENT_UPDATE_INTERVAL: 1 //minutes
  
}
