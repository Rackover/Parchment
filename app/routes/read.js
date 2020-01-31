module.exports = async function (req, response){
    
    response.prefix = "/read";
    const pagePath = req.path.replace(response.prefix, "")
    const page = wikiMap.getPage(pagePath)

    if (!page){
        response.error = { 
            data: "404"
        };
        return response;
    }

    const diskPath = page.filePath;
    
    const md = diskPath ? await wikiPage.getFormattedContents(diskPath, req.get('host')) : 404

    response.meta = md.meta
    response.data = md.html
    response.hierarchy = wikiMap.getHierarchyInfo(pagePath)
    response.page = page
    
    return response;
}
  