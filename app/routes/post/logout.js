module.exports = async function(req){
    let code = 200
    let content = "OK"
    const body = req.body
    
    req.session.destroy();

    return {
        code:code,
        content:content
    }
}