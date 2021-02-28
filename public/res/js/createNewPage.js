$( document ).ready(init)

function init(){
    $('#createNewRootPage').click(function (e) {
        const result = window.prompt("Please enter the name of the new page you want to add:", "New page");

        if (result == null || result.length == 0){
            return false;
        }

        createNewPage(result, true);

        return false;
    });

    $('#createNewChildPage').click(function (e) {
        const result = window.prompt("Please enter the name of the new page you want to add:", "New page");

        if (result == null || result.length == 0){
            return false;
        }

        createNewPage(result, false);

        return false;
    });
}

function createNewPage(pageName, isChildPage){
    $('#loadingContainer').show();
    const virtualPath = isChildPage ? window.location.pathname.replace('/read/', '').slice(0, -3)+"/" : '';
    
    $.post("/submit", {
        virtualParentPath: virtualPath,
        pageName: pageName
    }, function(data){
        if (data.code === 200){
            $('#loadingContainer').hide();
            window.location = `/write/${data.newPath}`; 
        }
        else{
            $('#loadingContainer').hide();
            alert("There was an error saving the content. Code "+data.code+"\n"+data.content)
        }
    })
}
