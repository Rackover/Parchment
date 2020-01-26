const fs = require('fs')
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const path = require("path")

let tree = {}

module.exports = {
    updateTree: updateTree,
    getPageSubTitle: getPageSubTitle,
    getPageTitle: getPageTitle,
    getTree: function(){return tree}
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
        
        entries[cleanName] = {
            url: fullPath,
            name: getPageTitle(contents.toString()),
            children: fs.existsSync(fullPathNoExt) ? await scanDirectory(fullPathNoExt) : false
        }
    }
    return entries
}

function getPageTitle(contents){
    const firstLine = contents.split("\n")[0];
    const title = firstLine.replace("<!-- TITLE:", "").replace("-->", "");
    return title;
}

function getPageSubTitle(contents){
    const firstLine = contents.split("\n")[1];
    const title = firstLine
    .replace("<!-- SUBTITLE:", "")
    .replace("-->", "")
    .trim();
    return title;
}

