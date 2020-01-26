module.exports = function (req, response){
    
    const pagePath = req.path.replace("/read", "")
    const page = wikiMap.getPage(pagePath)
    const diskPath = page.filePath;
    
    response.data = diskPath ? wikiPage.getFormattedContents(diskPath) : 404

    return response;
}
  