const maxSummaryLength = 40;
const backwardLength = 8;

module.exports = async function (req, response){
    
    const body = req.query;
    const miss = utility.getMissingFields(body, ["term"])

    if (miss.length > 0 || body.term.length <= 0){
        response.error = { 
            data: 'No search term was given'
        };
        
        return response;
    }

    const results = await searchEngine.search(body.term);

    for (i in results){
        let wholePage = results[i].content;
        let summary = wholePage
            .slice(Math.max(0, results[i].position-backwardLength));

        const originalLength = summary.length;

        summary = summary
            .slice(0, Math.min(maxSummaryLength, summary.length))
            .join(" ");

        if (summary.length < originalLength){
            summary += "...";
        }

        results[i].summary = summary;
    }

    response.searchTerm = body.term;
    response.results = results;

    return response;
}
  