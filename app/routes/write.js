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
    
    const data = diskPath ? await wikiPage.getContents(diskPath) : 404

    response.data = data
    response.hierarchy = wikiMap.getHierarchyInfo(pagePath)
    response.page = page
    response.browserEntries = wikiContents.getEntries()
    response.contentPath = WIKI_CONTENTS_DIRECTORY_NAME
    return response;
}
  