
module.exports = async function(req){
    let code = 200
    let content = "OK"
    const body = req.body
    const miss = utility.getMissingFields(body, ["login", "pass"])

    if (miss.length > 0){
        code = 400
        content = "The following fields are missing from the POST body: "+miss.join(", ");
    }

    else{
        if (permissions.isPasswordCorrect(body.login, body.pass)){
            req.session.user = body.login
        }
        else{
            code = 403
            content = "Wrong login or password"
        }
    }

    return {
        code:code,
        content:content
    }
}