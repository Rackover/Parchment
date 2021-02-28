module.exports = async function(req){
    let code = 200
    let content = "OK"
    let newPath = undefined;

    const body = req.body
    
    let miss = utility.getMissingFields(body, ["data", "virtualPath"])

    if (miss.length > 0){
        miss = utility.getMissingFields(body, ["pageName", "virtualParentPath"])

        if (miss.length > 0){
            code = 400
            content = "The following fields are missing from the POST body: "+miss.join(", ");
        }
        else{
            newPath = await wikiPage.create(body.virtualParentPath, body.pageName);
        }
    }
    else{
        await wikiPage.add(body.virtualPath, body.data)
    }

    return {
        code: code,
        content: content,
        newPath: newPath
    }
}