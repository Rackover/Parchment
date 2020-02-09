const fs = require("fs")

module.exports = {
    getFormattedContents: getFormattedContents,
    getContents: getContents
}

function getFormattedContents(diskPath){
    return markdown.parse(fs.readFileSync(diskPath).toString())
}

function getContents(diskPath){
    return fs.readFileSync(diskPath).toString()
}
