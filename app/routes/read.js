module.exports = async function (req, response){
    
    const pagePath = response.navigation.current
    const page = wikiMap.getPage(pagePath)

    if (!page){
        response.error = { 
            data: `Could not find page ${pagePath}`
        };
        return response;
    }

    const diskPath = page.filePath;
    
    const md = diskPath ? await wikiPage.getFormattedContents(diskPath) : 404

    response.meta = md.meta
    response.data = md.html
    response.tree = md.tree
    response.hierarchy = wikiMap.getHierarchyInfo(pagePath)
    response.page = page
    response.prefix = "/read"; // used by the path display on the page
    
    if (response.meta.title == undefined){
        response.meta.title = "(No title)";
    }

    return response;
}
  