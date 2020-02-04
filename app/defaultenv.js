module.exports = {
  
  DEBUG_LEVEL: "silly",
  PORT: 4030,
  LOG_PORT: 4031,
  GIT_PEM_FILE: "git.pem",
  GIT_REPO_URL: "git@github.com:louvekingdoms/Wiki.git",
  GIT_REPO_BRANCH: "auto",
  WIKI_PATH: require("path").join(APPLICATION_ROOT, "wiki")
}
