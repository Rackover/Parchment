const fs = require("fs")
const path = require("path")

module.exports = async function(req){
    let code = 200
    let content = "OK"
    const body = req.body
    
    const miss = utility.getMissingFields(body, ["path", "name"])

    if (miss.length > 0){
        code = 400
        content = "The following fields are missing from the POST body: "+miss.join(", ");
    }

    else{
        const pathWithoutContent = body.path.substring(WIKI_CONTENTS_DIRECTORY_NAME.length+1, body.path.length)
        const endPath = require("path").join(WIKI_PATH, WIKI_CONTENTS_DIRECTORY_NAME, pathWithoutContent, body.name)

        if (fs.existsSync(endPath)){
            code = 400;
            content = "Directory already exists"
        }
        else{
            fs.mkdirSync(endPath)
            content = wikiContents.getEntries(pathWithoutContent)
        }
    }

    return {
        code:code,
        content:content
    }
}