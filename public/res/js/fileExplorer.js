$( document ).ready(init)

let display
let currentPathDisplay
let currentPath = ""
let baseEntries = []
let selectedDiv = null
let selectedEntry = null
let insertFunction;

function init(){
    display = $("#folderView");
    currentPathDisplay = $("#currentPath")
    display.click(function(e){
        e.stopPropagation()
        select()
    })
    $('#uploadFile').click(function(){
        $("#fileUploadPath").val(currentPath)
        $('#fileUploadInput').click()
    });

    $('#fileUploadInput').change(function(){
        const xhr = new XMLHttpRequest();
        const form = document.getElementById('fileUploadForm');
        const formData = new FormData(form);

        xhr.addEventListener("load", function(){
            if (xhr.response.code == 200){
                loadEntries(currentPath, xhr.response.content, true)
            }
        })

        xhr.open('POST', form.action, true);
        xhr.responseType = "json"
        xhr.send(formData);
    })

    $('#destroy').click(function(){
        if (!selectedEntry) return
        if (confirm("You are about to destroy "+selectedEntry.path)){
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("load", function(){
                if (xhr.response.code == 200){
                    loadEntries(currentPath, xhr.response.content, true)
                }
            })
            xhr.open('POST', "/destroyFile", true);
            xhr.responseType = "json"
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
            xhr.send("path="+selectedEntry.path);
        }
    })

    $('#createFolder').click(function(){
        const dirName = prompt("Please enter a name for the new directory in "+currentPath)
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function(){
            if (xhr.response.code == 200){
                loadEntries(currentPath, xhr.response.content, true)
            }
        })
        xhr.open('POST', "/makedirectory", true);
        xhr.responseType = "json"
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.send("path="+currentPath+"&"+ "name="+dirName)
    
    })
}

function show(insertF){
    insertFunction = insertF
    $("#fileBrowserEnsemble").removeClass("disabled")
}

function hide(){
    $("#fileBrowserEnsemble").addClass("disabled")
}

function loadEntries(path, entries, areBaseEntries = false){
    currentPath = path
    currentPathDisplay.text(currentPath)
    selectedEntry = null
    select()
    display.empty()
    for (k in entries){
        const entry = entries[k]
        appendEntryDiv(entry);
    }
    if (areBaseEntries) baseEntries = entries
}

function appendEntryDiv(entry){
    const entryDiv = document.createElement("div")
    entryDiv.className = "entry"
    if (entry.type == "dir"){
        entryDiv.addEventListener("click", function(e){
            e.stopPropagation()
            if (selectedDiv == entryDiv){
                explorePath(entry)
                selectedEntry = null
                select()
            }
            else{
                selectedEntry = entry
                select(entryDiv)
            }
        })
    }
    else if (entry.type == "previous"){
        entryDiv.addEventListener("click", function(e){
            e.stopPropagation()
            if (selectedDiv == entryDiv){
                let parts = entry.path.split("/")
                let entries = baseEntries
                for(let i = 0; i < parts.length-1; i++){
                    for(j in entries){
                        if (entries[j].name == parts[i]){
                            const ntr = entries[j]
                            entries = ntr.children
                            break
                        }
                    }
                }
                parts.pop()
                loadEntries(parts.join("/"), entries)
            }
            else{
                selectedEntry = entry
                select(entryDiv)
            }
        })
    }
    else if (entry.type == "file"){
        entryDiv.addEventListener("click", function(e){
            e.stopPropagation()
            if (selectedDiv == entryDiv){
                insertFunction(entry.isImage ? 
                    "!["+entry.name+"](/"+entry.path+")" :
                    "["+entry.name+"](/"+entry.path+")"
                )
                hide()
            }
            else{
                selectedEntry = entry
                select(entryDiv)
            }
        })
    }
    const preview = document.createElement("div")
    preview.className = "preview "
    preview.className +=  
        entry.type === "file" ? (
                entry.isImage ? 
                "" :
                "fa fa-file"
            ) :
            ( 
                entry.type == "previous" ?
                "fas fa-arrow-up" :
                "fa fa-folder"
            )
    if (entry.isImage){
        const img = document.createElement("img")
        img.src = "/"+entry.path
        preview.append(img)
    }
    const name = document.createElement("div")
    entryDiv.append(preview)
    entryDiv.append(name)
    
    name.className = "name"
    name.textContent = entry.name;

    display.append(entryDiv);
}

function explorePath(entry){
    loadEntries(entry.path, entry.children)
}

function select(div=null){
    $("#closeButton").text("Close")
    $("#closeButton").unbind("click")
    $("#closeButton").removeClass("insertMode")
    $("#closeButton").addClass("closeMode")
    $("#closeButton").click(function(){
        hide()
    })

    if (selectedDiv != null){
        selectedDiv.className = selectedDiv.className.replace(" selected", "");
    }
    if (div == null || selectedEntry.type == "previous"){
        $("#destroy").addClass("disabled");
        if (div == null){
            selectedEntry = null
            return;
        }
    } 

    if (selectedEntry.type != "previous"){
        $("#destroy").removeClass("disabled");

        $("#closeButton").text("Insert")
        $("#closeButton").unbind("click")
        $("#closeButton").removeClass("closeMode")
        $("#closeButton").addClass("insertMode")
        $("#closeButton").click(function(){
            insertFunction(selectedEntry.isImage ? 
                "!["+selectedEntry.name+"](/"+selectedEntry.path+")" :
                "["+selectedEntry.name+"](/"+selectedEntry.path+")"
            )
            hide()
        })
    }
    div.className += " selected";
    selectedDiv = div;

}