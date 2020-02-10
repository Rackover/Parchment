const path = require("path");
const fs = require("fs")

let themeLinks = {};
const contentsDirName = WIKI_CONTENTS_DIRECTORY_NAME;
const units = ["css", "favicon", "header", "background"];
const imageTypes = ["jpeg", "jpg", "png", "bmp", "gif", "jfif"]
const imageRegx = new RegExp(".("+imageTypes.join("|")+")$", "i")

module.exports = function(){
    updateThemeLinks();

    setInterval(updateThemeLinks, process.env.WIKI_CONTENT_UPDATE_INTERVAL * 60 * 1000);

    return {
        get themeLinks(){
            return themeLinks
        },
        getEntries: function(){return getEntries()}
    }
}()

function updateThemeLinks(){
    logger.debug("Updating theme from contents...")
    themeLinks = {
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
                themeLinks[v] = path.join(dirPath, files[0]).replace(WIKI_PATH, "")
                logger.debug("Found custom content for "+v+"! ("+files[0]+")")
                continue
            }
        }
    }

    logger.debug("Done!")
}

function getEntries(directory=""){
    const basePath = path.join(WIKI_PATH, WIKI_CONTENTS_DIRECTORY_NAME, directory);
    if (!fs.existsSync(basePath)) return []
    const dirEnts = fs.readdirSync(basePath, {withFileTypes :true});
    let entries = []
    for (i in dirEnts){
        const ent = dirEnts[i]
        let file = {
            type: ent.isDirectory() ? "dir" : "file",
            name: ent.name,
            isImage: ent.name.match(imageRegx),
            path: path.join(WIKI_CONTENTS_DIRECTORY_NAME, directory, ent.name)
        }
        if (file.type === "dir"){
            file.children = getEntries(path.join(directory, ent.name))
        }
        entries.push(file)
    }

    return entries
}
