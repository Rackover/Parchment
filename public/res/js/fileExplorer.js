$( document ).ready(init)

let display;
let currentPathDisplay;
let baseEntries = []

function init(){
    display = $("#folderView");
    currentPathDisplay = $("#currentPath")
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
        entryDiv.addEventListener("click", function(){explorePath(entry)})
    }
    else if (entry.type == "previous"){
        entryDiv.addEventListener("click", function(){
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
