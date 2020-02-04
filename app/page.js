const fs = require("fs")

module.exports = {
    getFormattedContents: getFormattedContents
}

function getFormattedContents(diskPath){
    return markdown.parse(fs.readFileSync(diskPath).toString())
}
