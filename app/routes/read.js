module.exports = function (req, response){
    
    const pagePath = req.path.replace("/read", "")
    const page = wikiMap.getPage(pagePath)
    const diskPath = page.filePath;
    
    const rawMD = diskPath ? wikiPage.getFormattedContents(diskPath) : 404
    const parsed = markdown.parseContent(rawMD)

    response.data = parsed

    return response;
}
  