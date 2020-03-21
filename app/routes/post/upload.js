module.exports = async function(req){
    let code = 200
    let content = "OK"
    const body = req.body
    
    const miss = utility.getMissingFields(body, ["file", "path", "redirect"])

    if (miss.length > 0){
        code = 400
        content = "The following fields are missing from the POST body: "+miss.join(", ");
    }


    else if (!req.files.file){
        code = 400
        content = "No files supplied!"
    }

    else{
        content = "Successfully received "+req.files+" files";
    }

    return {
        code:code,
        content:content
    }
}