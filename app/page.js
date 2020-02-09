const fs = require("fs")
const path = require("path")
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

module.exports = {
    getFormattedContents: getFormattedContents,
    getContents: getContents,
    add: addPage
}

function getFormattedContents(diskPath){
    return markdown.parse(fs.readFileSync(diskPath).toString())
}

function getContents(diskPath){
    return fs.readFileSync(diskPath).toString()
}

async function addPage(virtualPath, contents){
    const diskPath = path.join(WIKI_PATH, virtualPath)
    const elems = virtualPath.split("/")
    const fileName = elems[elems.length-1]
    logger.info("Adding page "+fileName+"...")
    await writeFile(diskPath, contents)
    await wikiMap.updateTree()
    await git.checkAndUploadModifications("Updated "+fileName)
    logger.info("Done adding page "+fileName+"!")
}
