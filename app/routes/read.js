module.exports = async function (req, response){
    
    const pagePath = response.navigation.current
    const page = wikiMap.getPage(pagePath)

    if (!page){
        response.error = { 
            data: "404"
        };
        return response;
    }

    const diskPath = page.filePath;
    
    const md = diskPath ? await wikiPage.getFormattedContents(diskPath) : 404

    response.meta = md.meta
    response.data = md.html
    response.hierarchy = wikiMap.getHierarchyInfo(pagePath)
    response.page = page
    
    return response;
}
  