const fs = require('fs')
const path = require('path')

module.exports = {
    getMissingFields: getMissingFields,
    rimraf: rimraf
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

// Works for files AND folders
function rimraf(dir_path) {
    if (fs.existsSync(dir_path)) {
        if (fs.lstatSync(dir_path).isDirectory()){
            fs.readdirSync(dir_path).forEach(function(entry) {
                const entry_path = path.join(dir_path, entry);
                if (fs.lstatSync(entry_path).isDirectory()) {
                    rimraf(entry_path);
                } else {
                    fs.unlinkSync(entry_path);
                }
            });
            fs.rmdirSync(dir_path);
        }
        else{
            fs.unlinkSync(dir_path)
        }
    }
}
