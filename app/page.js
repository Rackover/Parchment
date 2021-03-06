const fs = require("fs");
const path = require("path");
const util = require('util');
const mkdirp = require("mkdirp");
const writeFile = util.promisify(fs.writeFile);

module.exports = {
    getFormattedContents: getFormattedContents,
    getContents: getContents,
    add: addPage,
    create: addNewPage,
    destroy: destroyPage
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
    mkdirp.sync(diskPath.substring(0, diskPath.lastIndexOf('/')))
    
    await writeFile(diskPath, contents);
    searchEngine.updateIndexForPage(virtualPath, markdown.parseMeta(contents).title, contents);

    // This will update tree
    await git.checkAndUploadModifications("Updated "+fileName)
    
    logger.info("Done adding page "+fileName+"!")
}

async function addNewPage(parentDirectory, pageName){
    const fileName = require("sanitize-filename")(pageName).replace(/ /g, "-").toLowerCase()+".md";
    const virtualPath = path.join(parentDirectory, fileName);

    logger.info(`Creating new page ${fileName} from page name ${pageName} at path ${virtualPath}`);

    const pageContents = `<!-- TITLE:${pageName} -->\n\nWelcome to my new page!`;

    await addPage(virtualPath, pageContents);

    return virtualPath;
}

async function destroyPage(virtualPath){
    const diskPath = path.join(WIKI_PATH, virtualPath)
    const elems = virtualPath.split("/")
    const fileName = elems[elems.length-1]
    logger.info("Destroying page "+fileName+"...")

    searchEngine.removePageFromIndex(virtualPath);

    const mdPath =  diskPath;
    const dirPath = mdPath.substring(0, mdPath.length-3);

    if (fs.existsSync(dirPath)){
        logger.debug("Rimrafing "+dirPath);
        utility.rimraf(dirPath)
    }

    logger.debug("Unlinking "+mdPath);
    fs.unlinkSync(mdPath);

    // This will update the tree aswell
    await git.checkAndUploadModifications("Destroyed "+fileName)

    logger.info("Done destroying page "+fileName+"!")
}