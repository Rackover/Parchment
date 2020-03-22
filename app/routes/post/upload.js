module.exports = async function(req){
    let code = 200
    let content = "OK"
    const body = req.body
    
    const miss = utility.getMissingFields(body, ["path"])

    if (miss.length > 0){
        code = 400
        content = "The following fields are missing from the POST body: "+miss.join(", ");
    }


    else if (!req.files.file){
        code = 400
        content = "No files supplied!"
    }

    else{
        const pathWithoutContent = body.path.substring(WIKI_CONTENTS_DIRECTORY_NAME.length+1, body.path.length)
        let files = []
        if (Array.isArray(req.files.file)){
            for(k in req.files.file){
                files.push(req.files.file[k])
            }
        }
        else{
            files.push(req.files.file)
        }

        for(k in files){
            const file = files[k]
            const endPath = require("path").join(WIKI_PATH, WIKI_CONTENTS_DIRECTORY_NAME, pathWithoutContent, file.name)

            file.mv(endPath)
        }
        content = wikiContents.getEntries(pathWithoutContent)
    }

    return {
        code:code,
        content:content
    }
}