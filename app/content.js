const path = require("path");
const fs = require("fs")

let contents = {};
const contentsDirName = WIKI_CONTENTS_DIRECTORY_NAME;
const units = ["css", "favicon", "header", "background"];

module.exports = function(){
    updateContents();

    setInterval(updateContents, process.env.WIKI_CONTENT_UPDATE_INTERVAL * 60 * 1000);

    return function(){return contents;}()
}()

function updateContents(){
    logger.debug("Updating contents...")
    contents = {
        "css": "/res/css/style.css",
        "favicon": "/res/img/favicon.png",
        "header": false,
        "background": false
    }

    for (k in units){
        const v = units[k]
        const dirPath = path.join(WIKI_PATH, contentsDirName, v);
        if (fs.existsSync(dirPath)){
            const files = fs.readdirSync(dirPath)
            if (files.length > 0){
                contents[v] = path.join(dirPath, files[0]).replace(WIKI_PATH, "")
                logger.debug("Found custom content for "+v+"! ("+files[0]+")")
                continue
            }
        }
    }

    logger.debug("Done!")
}