module.exports = async function(req){
    let code = 200
    let content = "OK"
    const body = req.body
    
    const miss = utility.getMissingFields(body, ["data", "virtualPath"])

    if (miss.length > 0){
        code = 400
        content = "The following fields are missing from the POST body: "+miss.join(", ");
    }
    else{
        await wikiPage.add(body.virtualPath, body.data)
    }

    return {
        code:code,
        content:content
    }
}