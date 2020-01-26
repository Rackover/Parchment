const fs = require("fs")

module.exports = {
    getFormattedContents: getFormattedContents
}

function getFormattedContents(diskPath){
    return fs.readFileSync(diskPath).toString()
}
