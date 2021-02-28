
module.exports = async function(req){
    let code = 200
    let content = "OK"
    const body = req.body
    const miss = utility.getMissingFields(body, ["path"])

    if (miss.length > 0){
        code = 400
        content = "The following fields are missing from the POST body: "+miss.join(", ");
    }

    else{
        const pathWithoutContent = body.path.substring(WIKI_CONTENTS_DIRECTORY_NAME.length+1, body.path.length)
        const endPath = require("path").join(EXECUTION_ROOT, WIKI_PATH, WIKI_CONTENTS_DIRECTORY_NAME, pathWithoutContent)
        utility.rimraf(endPath)

        const url = pathWithoutContent.substring(0, pathWithoutContent.lastIndexOf('/'))
        content = wikiContents.getEntries(url)

    }

    return {
        code:code,
        content:content
    }
}