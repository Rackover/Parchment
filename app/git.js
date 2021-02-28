const fs = require('fs')
const util = require('util');
const mkdir = util.promisify(fs.mkdir);

let gitClient;
let isOperating = false;

module.exports = async function(){
  
  const git = require('git-wrapper2-promise')
  
  const privateKeyPath = require("path").join(APPLICATION_ROOT, process.env.GIT_PEM_FILE);

  if (!fs.existsSync(privateKeyPath)){
    logger.error("Could NOT read the private key file "+privateKeyPath);
    process.exit(1)
  }

  await mkdir(WIKI_PATH).catch((e) => {
    if (e.code !== 'EEXIST') {
      logger.error("Could NOT create the directory "+WIKI_PATH+". Please check the permissions.\n"+JSON.stringify(e, null, 4))
      process.exit(1)
    }
  })

  gitClient = new git({ 'git-dir': WIKI_PATH });
  const isRepo = await gitClient.isRepo().catch(e => {
    logger.error("Could NOT identify "+WIKI_PATH+" as a repository\n"+JSON.stringify(e, null, 4))
    process.exit(1)
  })

  if (!isRepo){
    await gitClient.exec("init").catch(e => {
      logger.error("Could NOT init "+WIKI_PATH+"\n"+JSON.stringify(e, null, 4))
      process.exit(1)
    });
  }

  await gitClient.exec('config', ['--local', 'user.name', 'Parchment'])
  .catch(e=>{
    logger.error("Error during the initial configuration of the git directory\n"+JSON.stringify(e, null, 4))
    process.exit(1)
  });
  await gitClient.exec('config', ['--local', 'user.email', 'parchment@louve.systems']);
  await gitClient.exec('config', ['--local', '--bool', 'http.sslVerify', true]);
  await gitClient.exec('config', ['--local', 'core.sshCommand', 'ssh -i "' + privateKeyPath + '" -o StrictHostKeyChecking=no'])
  
  await gitClient.exec('remote', 'show').then((cProc) => {
    let out = cProc.stdout.toString()
    if (!out.includes('origin')) {
      return gitClient.exec('remote', ['add', 'origin', process.env.GIT_REPO_URL])
    } else {
      return gitClient.exec('remote', ['set-url', 'origin', process.env.GIT_REPO_URL])
    }
  })
  .catch((e) =>{
    logger.error("Could NOT add remote "+process.env.GIT_REPO_URL+" to the git repository.\n"+JSON.stringify(e, null, 4))
    process.exit(1)
  });

  logger.info("Git client OK! I will pull every "+
    process.env.GIT_PULL_INTERVAL+" minute"
    +(process.env.GIT_PUSH_INTERVAL >0? " and push every "+process.env.GIT_PUSH_INTERVAL+" minute": "") 
    + "!")

  await pull();

  if (process.env.GIT_PULL_INTERVAL > 0) setInterval(async function(){ await pull() }, process.env.GIT_PULL_INTERVAL * 1000 * 60)
  else{
    logger.error("Impossible pull interval ("+process.env.GIT_PULL_INTERVAL+"), aborting to avoid damage.");
    process.exit(1);
  }
  if (process.env.GIT_PUSH_INTERVAL > 0) setInterval(async function(){ await checkAndUploadModifications() }, process.env.GIT_PUSH_INTERVAL * 1000 * 60)
  
  return {
    checkAndUploadModifications: checkAndUploadModifications
  }
  
}

async function pull(){
  if (isOperating) return;
  logger.info("Pulling from repository...")
  isOperating = true;

  let error = false;
  await gitClient.pull("origin", process.env.GIT_REPO_BRANCH)
  .catch((e) =>{
    logger.warn("Could NOT pull from the git repository as branch "+process.env.GIT_REPO_BRANCH+".\n"+e.stderr)
    error = true;
  });
  isOperating = false;
  if (!error) logger.info("Done!")
}

async function checkAndUploadModifications(changesName=null){
  if(isOperating){
    const wait = 2;
    logger.debug("Could not check and upload modifications because of another operation, waiting for "+wait+" seconds");
    setTimeout(async function(){await checkAndUploadModifications(changesName)}, wait * 1000);
    return;
  }
  isOperating = true;

  // 1. git add -A
  // 2. git commit
  // 3. git pull
  // 4. commit the merge
  // 5. git push origin branch

  logger.info("Checking for modifications...")
  await gitClient.add("-A")
  .then(()=>{
    logger.debug("Committing...")
    return gitClient.commit(changesName || ("Update at "+new Date().toString()))
  })
  .then(() => {
    logger.debug("Pulling...")
    return gitClient.pull("origin", process.env.GIT_REPO_BRANCH);
  })
  .then(() =>{
    logger.debug("Merging...")
    return gitClient.commit("Merge")
  })
    .catch((e) =>{
      logger.debug("There was an error during the merge, but this is probably because there is nothing to merge.")
    })
  .then(() => {
    logger.debug("Pushing...")
    return gitClient.push("origin", process.env.GIT_REPO_BRANCH)
  });
  logger.info("Done!")

  isOperating = false;
}