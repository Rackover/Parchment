module.exports = {
    getMissingFields: getMissingFields
}

function getMissingFields(obj, fields){
    let missing = []
    for (k in fields){
        const field = fields[k]
        if (undefined === (obj[field])){
            missing.push(field)
        }
    }
    return missing
}
