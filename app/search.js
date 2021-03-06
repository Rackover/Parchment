
const minWordLength = 4;
let index = {};

module.exports = {
    updateIndexForPage: updateIndexForPage,
    updateIndexForPageIfNecessary: updateIndexForPageIfNecessary,
    removePageFromIndex: removePageFromIndex,
    search: search
}

async function updateIndexForPageIfNecessary(virtualPath, title, content){
    if (index[virtualPath] == undefined || index[virtualPath].length != content.length){
        logger.debug(`Updating search index for virtual path ${virtualPath}`);
        await updateIndexForPage(virtualPath, title, content);
    }
}

async function updateIndexForPage(virtualPath, title, content){
    if (index[virtualPath] != undefined){
        removePageFromIndex(virtualPath);
    }

    let entry = {
        length: content.length,
        title: title,
        words: []
    };

    let pageWords = content
        .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]/gi, '')
        .split(" ")
        .filter((o) => o.length >= minWordLength)
        .map((o) => o.toLowerCase());

    entry.words = pageWords;

    index[virtualPath] = entry;
}

function removePageFromIndex(virtualPath){
    logger.debug(`Removing search index for virtual path ${virtualPath}`);
    delete index[virtualPath];
}

function search(term){
    const microtime = (Date.now() % 1000) / 1000;
    logger.info(`Searching for term [${term}] in the index...`);

    return new Promise((resolve, reject) => {
        term = term.toLowerCase();
        let results = [];
        for (path in index){
            if (index[path].title.includes(term)){

                results.push({
                    virtualPath: path,
                    title: index[path].title,
                    content: index[path].words,
                    position: 0
                });

                continue;
            }
    
            for(i in index[path].words){
                const word = index[path].words[i];
                
                if (word.length < term.length){
                    continue;
                }
    
                if (word.includes(term)){
                    results.push({
                        virtualPath: path,
                        title: index[path].title,
                        content: index[path].words
                            .map((o)=>{ return o == word ? `<b>${word}</b>` : o; }),
                        position: i
                    });

                    break;
                }
            }        
        }
        
        logger.info(`Found ${results.length} for search [${term}] after ${((Date.now() % 1000) / 1000) - microtime}ms`);
        resolve(results);
    });
}
