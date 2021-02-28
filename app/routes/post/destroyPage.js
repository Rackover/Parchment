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
        wikiPage.destroy(body.path);
    }

    return {
        code:code,
        content:content
    }
}