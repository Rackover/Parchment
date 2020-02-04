const fs = require('fs')
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const path = require("path")

let tree = {}
let pages = {}

module.exports = {
    updateTree: updateTree,
    getTree: function(){return tree},
    getPage : function(path){return pages[path]},
    getHierarchyInfo: getHierarchyInfo
}

async function updateTree(){
    tree = await scanDirectory(WIKI_PATH)
}

async function scanDirectory(dirPath){
    const dirFiles = await readdir(dirPath)
    let entries = {}
    
    for (k in dirFiles){
        const name = dirFiles[k]
        if (name[0] === "_" || name[0] === "." || !name.endsWith(".md")) continue;
        const cleanName = name.substring(0, name.length-3);
        const fullPathNoExt = path.join(dirPath, cleanName);
        const fullPath = fullPathNoExt+".md";
        const contents = await readFile(fullPath)
        const virtualPath = fullPath.replace(WIKI_PATH, "");

        entries[virtualPath] = {
            url: virtualPath,
            filePath: fullPath,
            cleanName: cleanName,
            repoPath: path.join(
                process.env.GIT_REPO_URL
                    .replace(":", "/")
                    .replace("git@", "https://")
                    .replace(".git", "/blob/"+process.env.GIT_REPO_BRANCH), 
                cleanName+".md"),
            name: markdown.parseMeta(contents.toString()).title,
            children: fs.existsSync(fullPathNoExt) ? await scanDirectory(fullPathNoExt) : false
        }

        pages[virtualPath] = entries[virtualPath]
        logger.debug("Added "+cleanName+" to "+virtualPath)
    }
    return entries
}

function getHierarchyInfo(virtualPath){
    const elements = virtualPath.split("/");
    let hierarchy = []
    let builtUpPath = ""

    for(k in elements){
        if (k <= 0) continue;
        builtUpPath += "/"+elements[k]
        hierarchy.push(pages[builtUpPath.endsWith(".md") ? builtUpPath : builtUpPath+".md"])
    }
    
    return hierarchy
}

