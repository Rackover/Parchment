module.exports = async function(body){
    let code = 200
    let content = "OK"
    
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