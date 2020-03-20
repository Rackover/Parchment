$( document ).ready(init)

let display;
let currentPathDisplay;
let baseEntries = []
let selectedDiv = null;

function init(){
    display = $("#folderView");
    currentPathDisplay = $("#currentPath")
    display.click(function(e){
        e.stopPropagation()
        select()
    })
}

function loadEntries(path, entries, areBaseEntries = false){
    currentPathDisplay.text("/"+path)
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
            }
            else{
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
                select(entryDiv)
            }
        })
    }
    else if (entry.type == "file"){
        entryDiv.addEventListener("click", function(e){
            e.stopPropagation()
            select(entryDiv)
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
    if (selectedDiv != null){
        selectedDiv.className = selectedDiv.className.replace(" selected", "");
    }
    if (div == null){
        $("#destroy").addClass("disabled");
        return;
    } 

    $("#destroy").removeClass("disabled");
    div.className += " selected";
    selectedDiv = div;

}